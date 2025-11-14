// Configuration Stripe
// La clé publique est chargée depuis les variables d'environnement (.env)
export const STRIPE_PUBLIC_KEY = import.meta.env['VITE_STRIPE_PUBLIC_KEY'] || '';

// Configuration CMI (Centre Monétique Interbancaire - Maroc)
export const CMI_CONFIG = {
  merchantId: '', // À configurer avec votre ID marchand CMI
  apiUrl: 'https://payment.cmi.co.ma/fim/api', // URL de production CMI
  returnUrl: window.location.origin + '/payment/success',
  cancelUrl: window.location.origin + '/payment/cancel',
  currency: 'MAD',
  language: 'fr'
};
