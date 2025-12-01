import {  useState, useEffect  } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { PaymentButton } from './PaymentButton';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import PaymentIcons from './PaymentIcons';
import { stripeService } from '../../services/stripeService';

interface PaymentMetadata {
  customerEmail?: string | null;
  [key: string]: any;
}

interface StripePaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntent: any) => void;
  onError?: (error: any) => void;
  showSaveCardOption?: boolean;
  customerId?: string;
  description?: string;
  metadata?: PaymentMetadata;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  currency = 'MAD',
  onSuccess,
  onError,
  showSaveCardOption = true,
  customerId,
  description = 'Paiement de réservation',
  metadata = {},
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  // Options de style pour l'élément de carte
  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js n'est pas encore chargé
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Créer une intention de paiement
      const { clientSecret } = await stripeService.createPaymentIntent({
        amount: amount,
        currency,
        customerId,
        description,
        metadata: {
          ...metadata,
          save_payment_method: saveCard.toString(),
        },
      });

      // 2. Récupérer l'élément de carte
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Impossible de récupérer les détails de la carte.');
      }

      // 3. Créer une méthode de paiement
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: metadata.customerName || 'Client',
          email: metadata.customerEmail,
          phone: metadata.customerPhone,
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message || 'Erreur lors de la création de la méthode de paiement');
      }

      if (!paymentMethod) {
        throw new Error('Impossible de créer la méthode de paiement');
      }

      // 4. Confirmer le paiement
      const paymentOptions: any = {
        payment_method: paymentMethod.id,
        setup_future_usage: saveCard ? 'off_session' : undefined,
      };
      
      // Ne pas inclure receipt_email s'il est null ou undefined
      if (metadata.customerEmail) {
        paymentOptions.receipt_email = metadata.customerEmail;
      }
      
      const result = await stripe.confirmCardPayment(clientSecret, paymentOptions);

      if (result.error) {
        // Afficher l'erreur à l'utilisateur
        if (result.error.code === 'card_declined') {
          throw new Error('Votre carte a été refusée. Veuillez essayer une autre carte.');
        } else if (result.error.code === 'expired_card') {
          throw new Error('Votre carte a expiré. Veuillez utiliser une autre carte.');
        } else if (result.error.code === 'insufficient_funds') {
          throw new Error('Fonds insuffisants sur la carte.');
        } else {
          throw new Error(result.error.message || 'Une erreur est survenue lors du paiement.');
        }
      }

      // 5. Paiement réussi
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Mettre à jour le statut du paiement dans la base de données
        await stripeService.updatePaymentStatus(
          result.paymentIntent.id,
          'succeeded',
          {
            payment_method_id: paymentMethod.id,
            receipt_url: (result.paymentIntent as any).receipt_url,
          }
        );
        
        setSucceeded(true);
        onSuccess(result.paymentIntent);
      }
    } catch (err: any) {
      console.error('Erreur de paiement:', err);
      const errorMessage = err.message || 'Une erreur est survenue lors du traitement de votre paiement.';
      setError(errorMessage);
      toast.error(errorMessage);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Paiement réussi !</h3>
        <p className="text-gray-600">Votre paiement a été traité avec succès.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-gray-50">
          <CardElement options={cardElementOptions} />
        </div>
        
        {showSaveCardOption && (
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
              Enregistrer cette carte pour des paiements futurs
            </label>
          </div>
        )}
        
        {error && (
          <div className="text-red-600 text-sm mt-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}
      </div>
      
      <PaymentButton
        type="submit"
        disabled={!stripe || isLoading}
        isLoading={isLoading}
        icon={<CreditCard className="h-4 w-4" />}
      >
        Payer {amount.toFixed(2)} {currency}
      </PaymentButton>
      
      <div className="text-xs text-gray-500 text-center">
        <p>Vos informations de paiement sont sécurisées et cryptées.</p>
        <PaymentIcons />
      </div>
    </form>
  );
};

export default StripePaymentForm;
