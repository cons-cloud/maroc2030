import {  useEffect, useState  } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StripePaymentForm from '../components/payment/StripePaymentForm';
import { stripeService } from '../services/stripeService';

// Configuration Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const StripeCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extraire les données de la réservation
  const bookingData = location.state?.bookingData;
  const amount = bookingData?.totalPrice || 0;

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!bookingData) {
        setError('Aucune donnée de réservation trouvée');
        setLoading(false);
        return;
      }

      try {
        const { clientSecret, paymentIntent } = await stripeService.createPaymentIntent({
          amount: amount,
          currency: 'MAD',
          customerId: bookingData.customerId,
          description: `Réservation pour ${bookingData.serviceTitle || 'service'}`,
          metadata: {
            bookingId: bookingData.id,
            serviceType: bookingData.serviceType,
            customerName: bookingData.customerInfo?.fullName,
            customerEmail: bookingData.customerInfo?.email,
          },
          bookingId: bookingData.id,
        });

        setClientSecret(clientSecret);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors de la création de l\'intention de paiement:', err);
        setError(err.message || 'Impossible de préparer le paiement. Veuillez réessayer.');
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [bookingData, amount]);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      // Mettre à jour le statut de la réservation dans la base de données
      // Cette partie dépend de votre logique métier
      // Par exemple :
      // await updateBookingStatus(bookingData.id, 'confirmed');
      
      toast.success('Paiement effectué avec succès !');
      
      // Rediriger vers la page de confirmation
      navigate('/payment/success', {
        state: {
          paymentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          bookingId: bookingData?.id,
          receiptUrl: paymentIntent.receipt_url,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error);
      toast.error('Le paiement a réussi mais une erreur est survenue lors de la mise à jour de votre réservation.');
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Erreur de paiement:', error);
    toast.error(error.message || 'Une erreur est survenue lors du paiement');
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="grow container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retour
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-700">Préparation du paiement...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Paiement sécurisé</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Récapitulatif de la commande</h2>
            <div className="border-t border-b border-gray-200 py-4">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Service</span>
                <span className="font-medium">{bookingData?.serviceTitle || 'Service'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Prix</span>
                <span className="font-medium">{amount.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{amount.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations de paiement</h2>
            
            {clientSecret ? (
              <Elements 
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#2563eb',
                      colorBackground: '#ffffff',
                      colorText: '#1f2937',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    },
                  },
                }}
              >
                <StripePaymentForm
                  amount={amount}
                  currency="MAD"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  showSaveCardOption={true}
                  customerId={bookingData?.customerId}
                  description={`Paiement pour ${bookingData?.serviceTitle || 'service'}`}
                  metadata={{
                    bookingId: bookingData?.id,
                    serviceType: bookingData?.serviceType,
                    customerName: bookingData?.customerInfo?.fullName,
                    customerEmail: bookingData?.customerInfo?.email,
                    customerPhone: bookingData?.customerInfo?.phone,
                  }}
                />
              </Elements>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-600">Impossible de charger le formulaire de paiement</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StripeCheckout;
