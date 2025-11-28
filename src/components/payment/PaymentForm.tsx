import {  useState, useEffect  } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { StripeCardElement } from '@stripe/stripe-js';
import { paymentConfig } from '../../config/payment.config';
import { toast } from 'sonner';

// Types
type PaymentFormProps = {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: Error) => void;
  clientSecret?: string;
  options?: {
    saveCard?: boolean;
    showPaymentMethods?: boolean;
  };
};

// Composant de formulaire de paiement
const StripePaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = paymentConfig.currency,
  onSuccess,
  onError,
  clientSecret,
  options = { saveCard: true, showPaymentMethods: true }
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [saveCard, setSaveCard] = useState(options.saveCard || false);
  const [selectedMethod, setSelectedMethod] = useState('card');
  
  // Vérifier si Stripe est chargé
  useEffect(() => {
    if (!stripe) {
      console.error('Stripe n\'a pas été correctement initialisé');
    }
  }, [stripe]);

  // Gérer la soumission du formulaire
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe n'est pas encore chargé
      onError(new Error('Le système de paiement n\'est pas encore prêt'));
      return;
    }

    setLoading(true);

    try {
      // Créer une méthode de paiement
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
        billing_details: {
          // Ajouter les détails de facturation si nécessaire
        },
      });

      if (paymentMethodError) {
        throw paymentMethodError;
      }

      if (!clientSecret) {
        throw new Error('Impossible de procéder au paiement. Veuillez réessayer.');
      }

      // Confirmer le paiement avec l'intention côté serveur
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod?.id,
          save_payment_method: saveCard,
        }
      );

      if (confirmError) {
        throw confirmError;
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else {
        throw new Error('Le paiement n\'a pas abouti');
      }
    } catch (err) {
      console.error('Erreur lors du paiement:', err);
      onError(err instanceof Error ? err : new Error('Une erreur inattendue est survenue'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {options.showPaymentMethods && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Méthode de paiement</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {paymentConfig.paymentMethods
              .filter(method => method.available)
              .map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <i className={`fas fa-${method.icon}`} />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{method.name}</h4>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {selectedMethod === 'card' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Détails de la carte
            </label>
            <div className="p-4 border border-gray-300 rounded-lg">
              <CardElement
                options={{
                  style: paymentConfig.cardOptions.style,
                  hidePostalCode: paymentConfig.cardOptions.hidePostalCode,
                  hideIcon: paymentConfig.cardOptions.hideIcon,
                }}
                onChange={(event) => {
                  // Gérer les changements dans les champs de la carte
                  if (event.error) {
                    // Afficher l'erreur à l'utilisateur
                    console.error(event.error.message);
                  }
                }}
              />
            </div>
          </div>

          {paymentConfig.saveCard.enabled && (
            <div className="flex items-center">
              <input
                id="save-card"
                name="save-card"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
              />
              <label htmlFor="save-card" className="ml-2 block text-sm text-gray-700">
                Enregistrer cette carte pour de futurs paiements
              </label>
            </div>
          )}
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <span className="text-base font-medium text-gray-900">Total à payer</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {amount.toFixed(2)} {currency}
            </div>
            {paymentConfig.fees.serviceFee > 0 && (
              <div className="text-sm text-gray-500">
                Dont {paymentConfig.fees.serviceFee}% de frais de service
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !stripe || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Traitement en cours...
            </>
          ) : (
            `Payer ${amount.toFixed(2)} ${currency}`
          )}
        </button>

        <p className="mt-3 text-xs text-center text-gray-500">
          En cliquant sur "Payer", vous acceptez nos{' '}
          <a href="/conditions-generales" className="text-blue-600 hover:text-blue-500">
            conditions générales
          </a>{' '}
          et notre{' '}
          <a href="/confidentialite" className="text-blue-600 hover:text-blue-500">
            politique de confidentialité
          </a>
          .
        </p>
      </div>
    </form>
  );
};

// Wrapper pour le composant de paiement avec initialisation de Stripe
const PaymentForm: React.FC<PaymentFormProps & { stripeKey: string }> = ({
  stripeKey,
  ...props
}) => {
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    // Charger Stripe.js de manière asynchrone
    const initializeStripe = async () => {
      const stripe = await loadStripe(stripeKey, {
        // Options de configuration Stripe supplémentaires
        stripeAccount: process.env.REACT_APP_STRIPE_ACCOUNT_ID,
        apiVersion: '2022-11-15', // Utiliser la dernière version de l'API
      });
      setStripePromise(stripe);
    };

    initializeStripe();
  }, [stripeKey]);

  if (!stripePromise) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...props} />
    </Elements>
  );
};

export default PaymentForm;
