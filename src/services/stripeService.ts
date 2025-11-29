import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { loadStripe, type Stripe as StripeJs } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Initialisation de Stripe avec la clé publique côté client
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// Types pour les paiements
export type PaymentStatus = 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded' | 'refunded';

export interface PaymentRecord {
  id?: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_intent_id: string;
  payment_method_id?: string;
  customer_id?: string;
  receipt_url?: string;
  admin_commission?: number;
  partner_amount?: number;
  is_commission_paid?: boolean;
  partner_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, any>;
  bookingId?: string;
  partnerId?: string;
  payment_method_types?: string[];
  setup_future_usage?: 'on_session' | 'off_session';
  confirm?: boolean;
  receipt_email?: string;
}

interface ConfirmPaymentParams {
  paymentIntentId: string;
  paymentMethod: any;
  savePaymentMethod?: boolean;
  customerEmail?: string;
  return_url?: string;
}

interface RefundPaymentParams {
  paymentIntentId: string;
  amount?: number;
  reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent';
  metadata?: Record<string, string>;
}

/**
 * Service pour gérer les interactions avec l'API Stripe
 */
class StripeService {
  private static instance: StripeService;
  private stripePromise: Promise<StripeJs | null>;

  private constructor() {
    this.stripePromise = stripePromise;
  }

  // Méthode pour accéder à l'instance Stripe côté client
  private async getStripeClient(): Promise<StripeJs> {
    const stripe = await this.stripePromise;
    if (!stripe) {
      throw new Error('Stripe n\'a pas pu être initialisé');
    }
    return stripe;
  }

  // Méthode pour accéder à l'API Stripe côté serveur
  private getStripeServer(): Stripe {
    if (!import.meta.env.VITE_STRIPE_SECRET_KEY) {
      throw new Error('Clé secrète Stripe non configurée');
    }
    return new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });
  }

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Crée une intention de paiement
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<{ clientSecret: string | null; paymentIntent: Stripe.Response<Stripe.PaymentIntent> }> {
    try {
      const { 
        amount, 
        currency = 'MAD', 
        customerId, 
        description, 
        metadata = {},
        bookingId, 
        partnerId, 
        payment_method_types = ['card'],
        setup_future_usage,
        receipt_email
      } = params;
      
      const stripe = await this.getStripeClient();
      
      // Calculer la commission (10% du montant total)
      const commissionRate = 0.10; // 10%
      const adminCommission = amount * commissionRate;
      const partnerAmount = amount - adminCommission;
      
      // 1. Créer l'intention de paiement via l'API Stripe côté serveur
      const stripeServer = this.getStripeServer();
      const paymentIntent = await stripeServer.paymentIntents.create({
        amount: Math.round(amount * 100), // Convertir en centimes
        currency,
        customer: customerId,
        description,
        payment_method_types,
        setup_future_usage,
        receipt_email,
        metadata: {
          ...metadata,
          bookingId: bookingId || '',
          partnerId: partnerId || '',
          adminCommission: adminCommission.toString(),
          partnerAmount: partnerAmount.toString(),
          commissionRate: commissionRate.toString()
        },
      });

      // 2. Enregistrer le paiement en base de données avec la commission
      if (bookingId && paymentIntent.id) {
        await this.recordPayment({
          booking_id: bookingId,
          amount,
          currency,
          status: paymentIntent.status as PaymentStatus,
          payment_intent_id: paymentIntent.id,
          customer_id: customerId,
          partner_id: partnerId,
          admin_commission: adminCommission,
          partner_amount: partnerAmount,
          is_commission_paid: false,
          metadata: {
            ...metadata,
            bookingId,
            partnerId,
            commissionRate,
            adminCommission,
            partnerAmount
          },
        });
      }

      return { 
        clientSecret: paymentIntent.client_secret, 
        paymentIntent 
      };
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'intention de paiement:', error);
      toast.error('Erreur lors de la préparation du paiement');
      throw error;
    }
  }

  /**
   * Confirme un paiement
   */
  async confirmPayment(params: ConfirmPaymentParams): Promise<Stripe.PaymentIntent | Stripe.SetupIntent> {
    try {
      const { 
        paymentIntentId, 
        paymentMethod, 
        savePaymentMethod = false, 
        customerEmail,
        return_url
      } = params;
      
      const stripe = await this.getStripeClient();
      
      // 1. Confirmer le paiement côté client
      const result = await stripe.confirmCardPayment(paymentIntentId, {
        payment_method: paymentMethod.id,
        setup_future_usage: savePaymentMethod ? 'off_session' : undefined,
        receipt_email: customerEmail,
        return_url
      }) as { paymentIntent?: Stripe.PaymentIntent; error?: any; };

      if (result.error) {
        throw result.error;
      }

      if (!result.paymentIntent) {
        throw new Error('Aucune intention de paiement retournée');
      }

      // 2. Mettre à jour le statut du paiement en base de données
      const paymentIntent = result.paymentIntent;
      const status = paymentIntent.status as PaymentStatus;
      const receiptUrl = (paymentIntent as any).charges?.data[0]?.receipt_url;
      
      await this.updatePaymentStatus(paymentIntent.id, status, {
        payment_method_id: paymentMethod.id,
        receipt_url: receiptUrl
      });

      return paymentIntent;
    } catch (error: any) {
      console.error('Erreur lors de la confirmation du paiement:', error);
      
      // Gestion des erreurs spécifiques
      if (error.code === 'card_declined') {
        throw new Error('Votre carte a été refusée. Veuillez essayer une autre méthode de paiement.');
      } else if (error.code === 'expired_card') {
        throw new Error('Votre carte a expiré. Veuillez utiliser une autre carte.');
      } else if (error.code === 'insufficient_funds') {
        throw new Error('Fonds insuffisants sur la carte.');
      } else {
        throw new Error(error.message || 'Une erreur est survenue lors du traitement de votre paiement.');
      }
    }
  }
  
  /**
   * Rembourse un paiement
   */
  async refundPayment(params: RefundPaymentParams): Promise<Stripe.Refund> {
    try {
      const { 
        paymentIntentId, 
        amount, 
        reason = 'requested_by_customer',
        metadata = {}
      } = params;
      
      // 1. Effectuer le remboursement via l'API Stripe côté serveur
      const stripeServer = this.getStripeServer();
      const refund = await stripeServer.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Convertir en centimes si amount est fourni
        reason: reason as any, // Type assertion car le type Reason est plus restrictif
        metadata
      });
      
      if (refund.status === 'succeeded') {
        // 2. Mettre à jour le statut du paiement en base de données
        await this.updatePaymentStatus(paymentIntentId, 'refunded', {
          metadata: {
            ...metadata,
            refund_id: refund.id,
            refund_amount: amount?.toString(),
            refund_reason: reason
          }
        } as any);
      }
      
      return refund;
    } catch (error: any) {
      console.error('Erreur lors du remboursement du paiement:', error);
      toast.error('Erreur lors du remboursement du paiement');
      throw error;
    }
  }

  /**
   * Enregistre un paiement dans la base de données
   */
  async recordPayment(paymentData: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentRecord> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          metadata: paymentData.metadata || {},
        }])
        .select('*')
        .single();

      if (error) throw error;
      return data as PaymentRecord;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      throw error;
    }
  }

  /**
   * Met à jour le statut d'un paiement
   */
  async updatePaymentStatus(
    paymentIntentId: string, 
    status: PaymentStatus, 
    updates: Partial<Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>> = {}
  ): Promise<PaymentRecord> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...updates,
        })
        .eq('payment_intent_id', paymentIntentId)
        .select('*')
        .single();

      if (error) throw error;
      return data as PaymentRecord;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du paiement:', error);
      throw error;
    }
  }

  /**
   * Récupère un paiement par son ID d'intention
   */
  async getPaymentByIntentId(paymentIntentId: string): Promise<PaymentRecord | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = aucun résultat
        throw error;
      }

      return data as PaymentRecord | null;
    } catch (error) {
      console.error('Erreur lors de la récupération du paiement:', error);
      throw error;
    }
  }

  /**
   * Récupère les paiements d'un utilisateur
   */
  async getUserPayments(userId: string): Promise<PaymentRecord[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings!inner(
            user_id
          )
        `)
        .eq('bookings.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as PaymentRecord[];
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
      throw error;
    }
  }

  /**
   * Récupère les informations d'un paiement
   */
  async getPayment(paymentIntentId: string): Promise<PaymentRecord> {
    try {
      const payment = await this.getPaymentByIntentId(paymentIntentId);
      if (!payment) {
        throw new Error('Paiement non trouvé');
      }
      return payment;
    } catch (error) {
      console.error('Erreur lors de la récupération du paiement:', error);
      throw error;
    }
  }
}

// Création et exportation d'une instance unique du service Stripe
export const stripeService = StripeService.getInstance();
