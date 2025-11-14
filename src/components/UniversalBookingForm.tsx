import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X, Calendar, Users, MapPin, Clock, CreditCard, User, Mail, Phone } from 'lucide-react';

type ServiceType = 'appartement' | 'hotel' | 'villa' | 'voiture' | 'circuit';

interface Service {
  id: string;
  title: string;
  price?: number;
  price_per_night?: number;
  price_per_day?: number;
  price_per_person?: number;
  max_guests?: number;
  max_participants?: number;
  duration_days?: number;
}

interface UniversalBookingFormProps {
  serviceType: ServiceType;
  service: Service;
  onClose: () => void;
}

const UniversalBookingForm: React.FC<UniversalBookingFormProps> = ({ serviceType, service, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Données communes
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
    // Pour hébergements (appartement, hotel, villa)
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    roomType: '',
    // Pour voitures
    pickupDate: '',
    returnDate: '',
    pickupLocation: '',
    dropoffLocation: '',
    // Pour circuits
    numberOfPeople: 1,
    customDuration: service.duration_days || 1,
    startDate: ''
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

  // Calcul du nombre de nuits/jours
  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateDays = () => {
    if (!formData.pickupDate || !formData.returnDate) return 0;
    const pickup = new Date(formData.pickupDate);
    const returnD = new Date(formData.returnDate);
    const diffTime = Math.abs(returnD.getTime() - pickup.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calcul du prix total
  const calculateTotalPrice = () => {
    switch (serviceType) {
      case 'appartement':
      case 'hotel':
      case 'villa':
        const nights = calculateNights();
        const pricePerNight = service.price_per_night || service.price || 0;
        return pricePerNight * nights;
      case 'voiture':
        const days = calculateDays();
        const pricePerDay = service.price_per_day || service.price_per_night || service.price || 0;
        return pricePerDay * days;
      case 'circuit':
        const pricePerPerson = service.price_per_person || service.price || 0;
        return pricePerPerson * formData.numberOfPeople;
      default:
        return 0;
    }
  };

  const totalPrice = calculateTotalPrice();

  // Validation
  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return false;
    }

    switch (serviceType) {
      case 'appartement':
      case 'hotel':
      case 'villa':
        if (!formData.checkInDate || !formData.checkOutDate) {
          toast.error('Veuillez sélectionner les dates d\'arrivée et de départ');
          return false;
        }
        if (calculateNights() < 1) {
          toast.error('La durée du séjour doit être au moins 1 nuit');
          return false;
        }
        if (formData.numberOfGuests < 1) {
          toast.error('Le nombre d\'invités doit être au moins 1');
          return false;
        }
        if (service.max_guests && formData.numberOfGuests > service.max_guests) {
          toast.error(`Le nombre maximum d'invités est ${service.max_guests}`);
          return false;
        }
        break;

      case 'voiture':
        if (!formData.pickupDate || !formData.returnDate) {
          toast.error('Veuillez sélectionner les dates de prise en charge et de retour');
          return false;
        }
        if (!formData.pickupLocation || !formData.dropoffLocation) {
          toast.error('Veuillez indiquer les lieux de prise en charge et de retour');
          return false;
        }
        if (calculateDays() < 1) {
          toast.error('La durée de location doit être au moins 1 jour');
          return false;
        }
        break;

      case 'circuit':
        if (!formData.startDate) {
          toast.error('Veuillez sélectionner la date de départ');
          return false;
        }
        if (formData.numberOfPeople < 1) {
          toast.error('Le nombre de personnes doit être au moins 1');
          return false;
        }
        if (service.max_participants && formData.numberOfPeople > service.max_participants) {
          toast.error(`Le nombre maximum de participants est ${service.max_participants}`);
          return false;
        }
        break;
    }

    return true;
  };

  // Paiement
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
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
      const bookingData: any = {
        user_id: user.id, // 🔑 IMPORTANT : Lier la réservation à l'utilisateur
        service_type: serviceType,
        service_id: service.id,
        service_title: service.title,
        client_name: formData.fullName,
        client_email: formData.email,
        client_phone: formData.phone,
        total_price: totalPrice,
        payment_status: 'pending',
        payment_method: 'stripe',
        special_requests: formData.specialRequests
      };

      // Ajouter les champs spécifiques selon le type
      switch (serviceType) {
        case 'appartement':
        case 'hotel':
        case 'villa':
          bookingData.check_in_date = formData.checkInDate;
          bookingData.check_out_date = formData.checkOutDate;
          bookingData.number_of_guests = formData.numberOfGuests;
          bookingData.number_of_nights = calculateNights();
          if (formData.roomType) bookingData.room_type = formData.roomType;
          break;

        case 'voiture':
          bookingData.check_in_date = formData.pickupDate;
          bookingData.check_out_date = formData.returnDate;
          bookingData.number_of_days = calculateDays();
          bookingData.pickup_location = formData.pickupLocation;
          bookingData.dropoff_location = formData.dropoffLocation;
          break;

        case 'circuit':
          bookingData.start_date = formData.startDate;
          bookingData.number_of_people = formData.numberOfPeople;
          bookingData.custom_duration = formData.customDuration;
          bookingData.circuit_id = service.id;
          bookingData.circuit_title = service.title;
          break;
      }

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 2. Créer l'intention de paiement
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice * 100,
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

      // 4. Mettre à jour le statut
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
            service_type: serviceType,
            service_title: service.title
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

  // Rendu des champs spécifiques
  const renderServiceFields = () => {
    switch (serviceType) {
      case 'appartement':
      case 'hotel':
      case 'villa':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date d'arrivée *
                </label>
                <input
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date de départ *
                </label>
                <input
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                  min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Nombre d'invités *
                {service.max_guests && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Maximum : {service.max_guests})
                  </span>
                )}
              </label>
              <input
                type="number"
                value={formData.numberOfGuests}
                onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
                min="1"
                max={service.max_guests}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {serviceType === 'hotel' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Type de chambre
                </label>
                <select
                  value={formData.roomType}
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="simple">Chambre Simple</option>
                  <option value="double">Chambre Double</option>
                  <option value="suite">Suite</option>
                  <option value="familiale">Chambre Familiale</option>
                </select>
              </div>
            )}

            {calculateNights() > 0 && (
              <div className="bg-emerald-50 p-2 rounded-lg">
                <p className="text-xs text-emerald-800">
                  <strong>{calculateNights()} nuit{calculateNights() > 1 ? 's' : ''}</strong> × {service.price_per_night} MAD
                </p>
              </div>
            )}
          </>
        );

      case 'voiture':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Date de prise en charge *
                </label>
                <input
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Date de retour *
                </label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Lieu de prise en charge *
              </label>
              <input
                type="text"
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                placeholder="Ex: Aéroport Mohammed V, Casablanca"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Lieu de retour *
              </label>
              <input
                type="text"
                value={formData.dropoffLocation}
                onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                placeholder="Ex: Aéroport Mohammed V, Casablanca"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {calculateDays() > 0 && (
              <div className="bg-emerald-50 p-2 rounded-lg">
                <p className="text-xs text-emerald-800">
                  <strong>{calculateDays()} jour{calculateDays() > 1 ? 's' : ''}</strong> × {service.price_per_day} MAD
                </p>
              </div>
            )}
          </>
        );

      case 'circuit':
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Nombre de personnes *
                {service.max_participants && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Maximum : {service.max_participants})
                  </span>
                )}
              </label>
              <input
                type="number"
                value={formData.numberOfPeople}
                onChange={(e) => setFormData({ ...formData, numberOfPeople: parseInt(e.target.value) })}
                min="1"
                max={service.max_participants}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Durée du séjour (jours)
                <span className="text-xs text-gray-500 ml-2">
                  (Durée standard : {service.duration_days} jours)
                </span>
              </label>
              <input
                type="number"
                value={formData.customDuration}
                onChange={(e) => setFormData({ ...formData, customDuration: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date de départ *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Si l'utilisateur n'est pas connecté, ne rien afficher (la redirection se fait dans useEffect)
  if (!user) {
    return null;
  }

  if (step === 3) {
    return (
      <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-2 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Réservation confirmée !</h2>
          <p className="text-gray-600 mb-4">
            Vous recevrez un email de confirmation à {formData.email}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-2">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b">
          <div>
            <h2 className="text-base font-bold text-gray-900">Réserver</h2>
            <p className="text-xs text-gray-600">{service.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handlePayment} className="p-2 space-y-2">
          {/* Informations client */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-900">Vos informations</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Nom complet *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+212 6XX XX XX XX"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Champs spécifiques au service */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900">Détails de la réservation</h3>
            {renderServiceFields()}
          </div>

          {/* Demandes spéciales */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Demandes spéciales
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              rows={2}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Régime alimentaire, accessibilité, etc."
            />
          </div>

          {/* Paiement */}
          {step === 2 && (
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Paiement
              </h3>
              <div className="p-2 border border-gray-300 rounded-lg">
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
          )}

          {/* Prix total */}
          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center justify-between text-base font-bold">
              <span>Prix total</span>
              <span className="text-emerald-600">{totalPrice.toLocaleString()} MAD</span>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-2">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateForm()) setStep(2);
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  Continuer
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={loading}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading || !stripe}
                  className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Traitement...' : `Payer ${totalPrice.toLocaleString()} MAD`}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UniversalBookingForm;
