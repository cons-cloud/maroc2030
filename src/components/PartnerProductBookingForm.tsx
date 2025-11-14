import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { X, Calendar, Users, MapPin, CreditCard, User, Mail, Phone, Loader } from 'lucide-react';

interface PartnerProduct {
  id: string;
  partner_id: string;
  product_type: string;
  title: string;
  price: number;
  city: string;
  partner?: {
    company_name: string;
  };
}

interface PartnerProductBookingFormProps {
  product: PartnerProduct;
  onClose: () => void;
  onSuccess?: () => void;
}

const PartnerProductBookingForm: React.FC<PartnerProductBookingFormProps> = ({ 
  product, 
  onClose,
  onSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
    // Pour hébergements
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    // Pour voitures
    pickupDate: '',
    returnDate: '',
    pickupLocation: product.city,
    dropoffLocation: product.city,
    // Pour circuits
    numberOfPeople: 1,
    startDate: ''
  });

  const isAccommodation = ['appartement', 'villa', 'hotel', 'riad'].includes(product.product_type);
  const isCar = product.product_type === 'voiture';
  const isCircuit = product.product_type === 'circuit';

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
    if (isAccommodation) {
      const nights = calculateNights();
      return product.price * nights;
    } else if (isCar) {
      const days = calculateDays();
      return product.price * days;
    } else if (isCircuit) {
      return product.price * formData.numberOfPeople;
    }
    return product.price;
  };

  const totalPrice = calculateTotalPrice();

  // Validation
  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return false;
    }

    if (isAccommodation) {
      if (!formData.checkInDate || !formData.checkOutDate) {
        toast.error('Veuillez sélectionner les dates d\'arrivée et de départ');
        return false;
      }
      if (calculateNights() < 1) {
        toast.error('La durée du séjour doit être au moins 1 nuit');
        return false;
      }
    } else if (isCar) {
      if (!formData.pickupDate || !formData.returnDate) {
        toast.error('Veuillez sélectionner les dates de location');
        return false;
      }
      if (calculateDays() < 1) {
        toast.error('La durée de location doit être au moins 1 jour');
        return false;
      }
    } else if (isCircuit) {
      if (!formData.startDate) {
        toast.error('Veuillez sélectionner la date de départ');
        return false;
      }
    }

    return true;
  };

  // Paiement et création de réservation
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!stripe || !elements) {
      toast.error('Stripe n\'est pas chargé');
      return;
    }

    setLoading(true);

    try {
      // 1. Créer la réservation dans Supabase
      const bookingData: any = {
        product_id: product.id,
        partner_id: product.partner_id,
        service_title: product.title,
        client_name: formData.fullName,
        client_email: formData.email,
        client_phone: formData.phone,
        amount: totalPrice,
        payment_status: 'pending',
        booking_status: 'pending',
        special_requests: formData.specialRequests
      };

      // Ajouter les dates selon le type
      if (isAccommodation) {
        bookingData.start_date = formData.checkInDate;
        bookingData.end_date = formData.checkOutDate;
        bookingData.number_of_guests = formData.numberOfGuests;
      } else if (isCar) {
        bookingData.start_date = formData.pickupDate;
        bookingData.end_date = formData.returnDate;
        bookingData.pickup_location = formData.pickupLocation;
        bookingData.dropoff_location = formData.dropoffLocation;
      } else if (isCircuit) {
        bookingData.start_date = formData.startDate;
        bookingData.number_of_guests = formData.numberOfPeople;
      }

      // 2. Traiter le paiement avec Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error('Élément de carte non trouvé');
        setLoading(false);
        return;
      }

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone
        }
      });

      if (stripeError) {
        toast.error(stripeError.message || 'Erreur de paiement');
        setLoading(false);
        return;
      }

      // 3. Insérer la réservation (le trigger créera automatiquement partner_earnings)
      bookingData.payment_status = 'paid';
      bookingData.booking_status = 'confirmed';
      bookingData.payment_method_id = paymentMethod?.id;

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (bookingError) throw bookingError;

      toast.success('Réservation confirmée ! Un email de confirmation vous a été envoyé.');
      
      if (onSuccess) onSuccess();
      onClose();

    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Réserver</h2>
            <p className="text-gray-600 mt-1">{product.title}</p>
            {product.partner && (
              <p className="text-sm text-gray-500 mt-1">Par {product.partner.company_name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handlePayment} className="p-6 space-y-6">
          {/* Étape 1 : Informations personnelles */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Vos informations</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Champs spécifiques selon le type */}
              {isAccommodation && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date d'arrivée *
                      </label>
                      <input
                        type="date"
                        name="checkInDate"
                        value={formData.checkInDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date de départ *
                      </label>
                      <input
                        type="date"
                        name="checkOutDate"
                        value={formData.checkOutDate}
                        onChange={handleInputChange}
                        min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Nombre de personnes
                    </label>
                    <input
                      type="number"
                      name="numberOfGuests"
                      value={formData.numberOfGuests}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {isCar && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date de prise en charge *
                      </label>
                      <input
                        type="date"
                        name="pickupDate"
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date de retour *
                      </label>
                      <input
                        type="date"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleInputChange}
                        min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Lieu de prise en charge
                      </label>
                      <input
                        type="text"
                        name="pickupLocation"
                        value={formData.pickupLocation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Lieu de retour
                      </label>
                      <input
                        type="text"
                        name="dropoffLocation"
                        value={formData.dropoffLocation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </>
              )}

              {isCircuit && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date de départ *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Nombre de personnes
                    </label>
                    <input
                      type="number"
                      name="numberOfPeople"
                      value={formData.numberOfPeople}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demandes spéciales (optionnel)
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Allergies, préférences, etc."
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Continuer vers le paiement
              </button>
            </div>
          )}

          {/* Étape 2 : Paiement */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Paiement</h3>

              {/* Résumé */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix unitaire:</span>
                  <span className="font-medium">{product.price} MAD</span>
                </div>
                {isAccommodation && calculateNights() > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre de nuits:</span>
                    <span className="font-medium">{calculateNights()}</span>
                  </div>
                )}
                {isCar && calculateDays() > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre de jours:</span>
                    <span className="font-medium">{calculateDays()}</span>
                  </div>
                )}
                {isCircuit && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre de personnes:</span>
                    <span className="font-medium">{formData.numberOfPeople}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-emerald-600">{totalPrice} MAD</span>
                </div>
              </div>

              {/* Carte de crédit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Informations de paiement
                </label>
                <div className="border border-gray-300 rounded-lg p-4">
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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                  disabled={loading}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading || !stripe}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Payer {totalPrice} MAD
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PartnerProductBookingForm;
