import { useState } from 'react';
import { StripePaymentForm } from '../components/payment/StripePaymentForm';
import { toast } from 'sonner';

const TestPayment = () => {
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('Paiement réussi:', paymentIntent);
    setPaymentCompleted(true);
    toast.success('Paiement effectué avec succès!');
  };

  const handlePaymentError = (error: any) => {
    console.error('Erreur de paiement:', error);
    toast.error(`Erreur de paiement: ${error.message}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Test de Paiement</h1>
        
        {!paymentCompleted ? (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-blue-800">Détails de la commande</h2>
              <p className="mt-2 text-blue-700">Montant: <span className="font-bold">100 MAD</span></p>
              <p className="text-blue-700">Description: Paiement de test</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Informations de paiement</h2>
              <StripePaymentForm
                amount={10000} // 100 MAD en centimes
                currency="MAD"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                description="Paiement de test"
                metadata={{
                  customerEmail: "test@example.com",
                  customerName: "Client Test",
                  test: true
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-3 text-lg font-medium text-gray-900">Paiement réussi !</h2>
            <p className="mt-2 text-sm text-gray-500">Merci pour votre commande.</p>
            <button
              onClick={() => setPaymentCompleted(false)}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Effectuer un autre paiement
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPayment;
