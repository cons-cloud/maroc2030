import { CMI_CONFIG } from '../config/stripe';
import CryptoJS from 'crypto-js';

interface CMIPaymentParams {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerName: string;
  description: string;
}

interface CMIPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

/**
 * Service de paiement CMI (Centre Monétique Interbancaire - Maroc)
 * Permet d'accepter les cartes bancaires marocaines
 */
export class CMIPaymentService {
  private static instance: CMIPaymentService;
  private merchantId: string;
  private apiUrl: string;
  private storeKey: string; // Clé secrète fournie par CMI

  private constructor() {
    this.merchantId = CMI_CONFIG.merchantId;
    this.apiUrl = CMI_CONFIG.apiUrl;
    this.storeKey = ''; // À configurer avec votre clé CMI
  }

  public static getInstance(): CMIPaymentService {
    if (!CMIPaymentService.instance) {
      CMIPaymentService.instance = new CMIPaymentService();
    }
    return CMIPaymentService.instance;
  }

  /**
   * Génère le hash de sécurité pour CMI
   */
  private generateHash(data: string): string {
    return CryptoJS.HmacSHA256(data, this.storeKey).toString(CryptoJS.enc.Base64);
  }

  /**
   * Crée une demande de paiement CMI
   */
  public async createPayment(params: CMIPaymentParams): Promise<CMIPaymentResponse> {
    try {
      // Préparer les données de paiement
      const paymentData = {
        clientid: this.merchantId,
        amount: (params.amount * 100).toString(), // Convertir en centimes
        currency: CMI_CONFIG.currency,
        oid: params.orderId,
        okUrl: CMI_CONFIG.returnUrl,
        failUrl: CMI_CONFIG.cancelUrl,
        callbackUrl: `${window.location.origin}/api/cmi/callback`,
        trantype: 'PreAuth', // ou 'Auth' pour capture immédiate
        BillToName: params.customerName,
        email: params.customerEmail,
        shopurl: window.location.origin,
        lang: CMI_CONFIG.language,
        rnd: Date.now().toString(),
        encoding: 'UTF-8',
        storetype: '3d_pay_hosting', // Paiement 3D Secure
        description: params.description
      };

      // Générer le hash de sécurité
      const hashData = Object.values(paymentData).join('|');
      const hash = this.generateHash(hashData);

      // Créer le formulaire de paiement
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = this.apiUrl;

      // Ajouter tous les champs
      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      // Ajouter le hash
      const hashInput = document.createElement('input');
      hashInput.type = 'hidden';
      hashInput.name = 'HASH';
      hashInput.value = hash;
      form.appendChild(hashInput);

      // Soumettre le formulaire
      document.body.appendChild(form);
      form.submit();

      return {
        success: true,
        paymentUrl: this.apiUrl
      };
    } catch (error: any) {
      console.error('Erreur CMI:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du paiement CMI'
      };
    }
  }

  /**
   * Vérifie le statut d'un paiement CMI
   */
  public async verifyPayment(response: any): Promise<boolean> {
    try {
      // Vérifier le hash de la réponse
      const receivedHash = response.HASH;
      const dataToHash = Object.entries(response)
        .filter(([key]) => key !== 'HASH')
        .map(([, value]) => value)
        .join('|');
      
      const calculatedHash = this.generateHash(dataToHash);

      if (receivedHash !== calculatedHash) {
        console.error('Hash invalide - possible tentative de fraude');
        return false;
      }

      // Vérifier le statut du paiement
      return response.ProcReturnCode === '00'; // 00 = succès
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return false;
    }
  }

  /**
   * Capture un paiement pré-autorisé
   */
  public async capturePayment(orderId: string, amount: number): Promise<boolean> {
    try {
      const captureData = {
        clientid: this.merchantId,
        oid: orderId,
        amount: (amount * 100).toString(),
        currency: CMI_CONFIG.currency,
        trantype: 'PostAuth'
      };

      const response = await fetch(`${this.apiUrl}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(captureData)
      });

      const result = await response.json();
      return result.ProcReturnCode === '00';
    } catch (error) {
      console.error('Erreur lors de la capture:', error);
      return false;
    }
  }

  /**
   * Annule un paiement
   */
  public async refundPayment(orderId: string, amount: number): Promise<boolean> {
    try {
      const refundData = {
        clientid: this.merchantId,
        oid: orderId,
        amount: (amount * 100).toString(),
        currency: CMI_CONFIG.currency,
        trantype: 'Void'
      };

      const response = await fetch(`${this.apiUrl}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(refundData)
      });

      const result = await response.json();
      return result.ProcReturnCode === '00';
    } catch (error) {
      console.error('Erreur lors du remboursement:', error);
      return false;
    }
  }
}

// Export de l'instance singleton
export const cmiPayment = CMIPaymentService.getInstance();
