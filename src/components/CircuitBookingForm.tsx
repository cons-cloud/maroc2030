import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';
import { cmiPayment } from '../services/cmiPayment';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X, Users, Calendar, CreditCard, User, Mail, Phone } from 'lucide-react';

interface Circuit {
  id: string;
  title: string;
  price_per_person: number;
  duration_days: number;
  max_participants: number;
}

interface CircuitBookingFormProps {
  circuit: Circuit;
  onClose: () => void;
}

const CircuitBookingForm: React.FC<CircuitBookingFormProps> = ({ circuit, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: Choix paiement, 3: Paiement, 4: Confirmation
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cmi'>('stripe');
  
  // Informations de réservation
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    numberOfPeople: 1,
    customDuration: circuit.duration_days,
    startDate: '',
    specialRequests: ''
  });

  // Vérifier l'authentification et pré-remplir les données
  useEffect(() => {
    if (!user) {
      // Utilisateur non connecté, fermer le formulaire et rediriger
      onClose();
      toast.error('Vous devez être connecté pour réserver');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Pré-remplir les données depuis le profil
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || '',
        email: profile.email || user.email || '',
        phone: profile.phone || ''
      }));
    } else if (user.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [user, profile, navigate, onClose]);

  const totalPrice = circuit.price_per_person * formData.numberOfPeople;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'numberOfPeople' || name === 'customDuration') ? parseInt(value) || 1 : value
    }));
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.startDate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (formData.numberOfPeople < 1) {
      toast.error('Le nombre de personnes doit être au moins 1');
      return false;
    }
    if (formData.numberOfPeople > circuit.max_participants) {
      toast.error(`Le nombre maximum de participants est ${circuit.max_participants}`);
      return false;
    }
    if (formData.customDuration < 1) {
      toast.error('La durée doit être au moins 1 jour');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Stripe n\'est pas chargé');
      return;
    }

    setLoading(true);

    try {
      // Vérification de sécurité
      if (!user?.id) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }

      // 1. Créer la réservation dans Supabase
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id, // 🔑 IMPORTANT : Lier la réservation à l'utilisateur
          circuit_id: circuit.id,
          circuit_title: circuit.title,
          client_name: formData.fullName,
          client_email: formData.email,
          client_phone: formData.phone,
          number_of_people: formData.numberOfPeople,
          custom_duration: formData.customDuration,
          start_date: formData.startDate,
          total_price: totalPrice,
          payment_status: 'pending',
          payment_method: 'stripe',
          special_requests: formData.specialRequests
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 2. Créer l'intention de paiement
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice * 100, // Convertir en centimes
          bookingId: booking.id,
          currency: 'mad'
        })
      });

      const { clientSecret } = await response.json();

      // 3. Confirmer le paiement avec Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone
          }
        }
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // 4. Mettre à jour le statut de la réservation
      if (paymentIntent.status === 'succeeded') {
        await supabase
          .from('bookings')
          .update({ payment_status: 'confirmed' })
          .eq('id', booking.id);

        // 5. Créer l'enregistrement de paiement
        await supabase
          .from('payments')
          .insert({
            booking_id: booking.id,
            amount: totalPrice,
            currency: 'MAD',
            payment_method: 'stripe',
            stripe_payment_intent_id: paymentIntent.id,
            status: 'succeeded',
            paid_at: new Date().toISOString(),
            client_name: formData.fullName,
            client_email: formData.email,
            service_type: 'circuit',
            service_title: circuit.title
          });

        setStep(3);
        toast.success('Réservation confirmée !');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur n'est pas connecté, ne rien afficher (la redirection se fait dans useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-3 py-2 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 3 ? 'Confirmation' : 'Réservation'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress bar */}
        {step < 3 && (
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${step >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                1. Informations
              </span>
              <span className={`text-sm font-medium ${step >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
                2. Paiement
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Étape 1 : Informations */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{circuit.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>{circuit.duration_days} jours</span>
                  <span className="font-bold text-emerald-600">
                    {circuit.price_per_person.toLocaleString()} MAD/personne
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Nombre de personnes *
                  </label>
                  <input
                    type="number"
                    name="numberOfPeople"
                    value={formData.numberOfPeople}
                    onChange={handleInputChange}
                    min="1"
                    max={circuit.max_participants}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum : {circuit.max_participants} personnes
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Durée du séjour (jours) *
                  </label>
                  <input
                    type="number"
                    name="customDuration"
                    value={formData.customDuration}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Durée standard : {circuit.duration_days} jours (modifiable)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date de départ *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Demandes spéciales (optionnel)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Régime alimentaire, accessibilité, etc."
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-emerald-600">{totalPrice.toLocaleString()} MAD</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.numberOfPeople} personne(s) × {circuit.price_per_person.toLocaleString()} MAD
                </p>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Continuer vers le paiement
              </button>
            </div>
          )}

          {/* Étape 2 : Paiement */}
          {step === 2 && (
            <form onSubmit={handlePayment} className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2">Récapitulatif</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Circuit:</span>
                    <span className="font-medium">{circuit.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Participants:</span>
                    <span className="font-medium">{formData.numberOfPeople} personne(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date de départ:</span>
                    <span className="font-medium">{new Date(formData.startDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-emerald-600">{totalPrice.toLocaleString()} MAD</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Informations de paiement
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading || !stripe}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Traitement...' : `Payer ${totalPrice.toLocaleString()} MAD`}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                🔒 Paiement sécurisé par Stripe • Vos données sont protégées
              </p>
            </form>
          )}

          {/* Étape 3 : Confirmation */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Réservation confirmée !
                </h3>
                <p className="text-gray-600">
                  Votre paiement a été effectué avec succès.
                </p>
              </div>

              <div className="bg-emerald-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-bold mb-2">Détails de votre réservation</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Circuit:</strong> {circuit.title}</p>
                  <p><strong>Date:</strong> {new Date(formData.startDate).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Participants:</strong> {formData.numberOfPeople} personne(s)</p>
                  <p><strong>Total payé:</strong> {totalPrice.toLocaleString()} MAD</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Un email de confirmation a été envoyé à <strong>{formData.email}</strong>
              </p>

              <button
                onClick={onClose}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircuitBookingForm;
