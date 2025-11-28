import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';

// Initialisation de Stripe avec la clé publique
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// Types pour les paiements
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';

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
}

interface ConfirmPaymentParams {
  paymentIntentId: string;
  paymentMethod: any;
  savePaymentMethod?: boolean;
  customerEmail?: string;
}

/**
 * Service pour gérer les interactions avec l'API Stripe
 */
class StripeService {
  private static instance: StripeService;
  private stripe: Promise<Stripe | null>;

  private constructor() {
    this.stripe = stripePromise;
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
  async createPaymentIntent(params: CreatePaymentIntentParams) {
    try {
      const { amount, currency = 'MAD', customerId, description, metadata, bookingId, partnerId } = params;
      
      // Calculer la commission (10% du montant total)
      const commissionRate = 0.10; // 10%
      const adminCommission = amount * commissionRate;
      const partnerAmount = amount - adminCommission;
      
      // 1. Créer l'intention de paiement via l'API Stripe
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convertir en centimes
          currency,
          customer: customerId,
          description,
          metadata: {
            ...metadata,
            bookingId,
            partnerId,
            adminCommission,
            partnerAmount
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du paiement');
      }

      const { clientSecret, paymentIntent } = await response.json();

      // 2. Enregistrer le paiement en base de données avec la commission
      if (bookingId) {
        await this.recordPayment({
          booking_id: bookingId,
          amount,
          currency,
          status: 'pending',
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

      return { clientSecret, paymentIntent };
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'intention de paiement:', error);
      toast.error('Erreur lors de la préparation du paiement');
      throw error;
    }
  }

  /**
   * Confirme un paiement
   */
  async confirmPayment(params: ConfirmPaymentParams) {
    try {
      const { paymentIntentId, paymentMethod, savePaymentMethod = false, customerEmail } = params;
      const stripe = await this.stripe;
      
      if (!stripe) {
        throw new Error('Stripe n\'est pas initialisé');
      }

      // 1. Confirmer le paiement côté client
      const result = await stripe.confirmCardPayment(paymentIntentId, {
        payment_method: paymentMethod.id,
        setup_future_usage: savePaymentMethod ? 'off_session' : undefined,
        receipt_email: customerEmail,
      });

      if (result.error) {
        throw result.error;
      }

      if (!result.paymentIntent) {
        throw new Error('Aucune intention de paiement retournée');
      }

      // 2. Mettre à jour le statut du paiement en base de données
      const status = result.paymentIntent.status as PaymentStatus;
      await this.updatePaymentStatus(result.paymentIntent.id, status, {
        payment_method_id: paymentMethod.id,
        receipt_url: (result.paymentIntent as any).receipt_url,
      });

      return result.paymentIntent;
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
        throw new Error('Une erreur est survenue lors du traitement de votre paiement.');
      }
    }
  }

  /**
   * Enregistre un paiement dans la base de données
   */
  async recordPayment(paymentData: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>) {
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
  ) {
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
        receipt_url: (result.paymentIntent as any).receipt_url,
      });

      return result.paymentIntent;
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
        throw new Error('Une erreur est survenue lors du traitement de votre paiement.');
      }
    }
  }

  /**
   * Récupère les informations d'un paiement
   */
  async getPayment(paymentIntentId: string) {
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

  /**
   * Rembourse un paiement
   */
  async refundPayment(paymentIntentId: string, amount?: number) {
    try {
      const response = await fetch('/api/refund-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          amount: amount ? Math.round(amount * 100) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du remboursement');
      }

      const refund = await response.json();
      
      // Mettre à jour le statut du paiement en base de données
      if (refund.status === 'succeeded') {
        await this.updatePaymentStatus(paymentIntentId, 'refunded');
      }

      return refund;
    } catch (error) {
      console.error('Erreur lors du remboursement:', error);
      throw error;
    }
  }
}

export const stripeService = StripeService.getInstance();
