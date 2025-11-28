// Configuration pour les options de paiement
export const paymentConfig = {
  // Options de devise
  currency: 'MAD',
  currencySymbol: 'MAD',
  
  // Options de paiement disponibles
  paymentMethods: [
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: 'credit-card',
      description: 'Paiement sécurisé par carte bancaire',
      available: true
    },
    {
      id: 'cash',
      name: 'Espèces',
      icon: 'money-bill-wave',
      description: 'Paiement en espèces à la livraison',
      available: true
    },
    {
      id: 'bank_transfer',
      name: 'Virement bancaire',
      icon: 'university',
      description: 'Virement bancaire',
      available: true
    }
  ],
  
  // Options de carte bancaire
  cardOptions: {
    // Style des champs de carte Stripe
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        },
        ':-webkit-autofill': {
          color: '#32325d'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    },
    // Options des champs de carte
    hidePostalCode: true,
    hideIcon: false
  },
  
  // Options de frais
  fees: {
    // Pourcentage de frais de service
    serviceFee: 0, // 0% par défaut
    // Frais fixes
    fixedFee: 0
  },
  
  // Options de remboursement
  refundPolicy: {
    // Délai de remboursement en jours
    refundPeriod: 14,
    // Pourcentage de frais de remboursement
    refundFee: 0
  },
  
  // Options de facturation
  billingDetails: {
    required: true,
    fields: {
      name: 'auto',
      email: 'auto',
      phone: 'auto',
      address: {
        line1: 'auto',
        line2: 'auto',
        city: 'auto',
        state: 'auto',
        postal_code: 'auto',
        country: 'auto'
      }
    }
  },
  
  // Options de sauvegarde de carte
  saveCard: {
    enabled: true,
    requireReauth: true
  },
  
  // Options de test
  testMode: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
  
  // Options de débogage
  debug: process.env.NODE_ENV === 'development'
};

// Types pour les options de paiement
export type PaymentMethodType = {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
};

export type CardOptionsType = {
  style: {
    base: Record<string, any>;
    invalid: Record<string, any>;
  };
  hidePostalCode: boolean;
  hideIcon: boolean;
};

export type BillingDetailsType = {
  required: boolean;
  fields: {
    name: string | boolean;
    email: string | boolean;
    phone: string | boolean;
    address: {
      line1: string | boolean;
      line2: string | boolean;
      city: string | boolean;
      state: string | boolean;
      postal_code: string | boolean;
      country: string | boolean;
    };
  };
};

export type SaveCardType = {
  enabled: boolean;
  requireReauth: boolean;
};

export type PaymentConfigType = {
  currency: string;
  currencySymbol: string;
  paymentMethods: PaymentMethodType[];
  cardOptions: CardOptionsType;
  fees: {
    serviceFee: number;
    fixedFee: number;
  };
  refundPolicy: {
    refundPeriod: number;
    refundFee: number;
  };
  billingDetails: BillingDetailsType;
  saveCard: SaveCardType;
  testMode: boolean;
  debug: boolean;
};
