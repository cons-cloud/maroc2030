import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, CreditCard, MapPin, Loader } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    type: 'car' | 'tourism' | 'property';
    title: string;
    price: number;
    partnerId?: string;
    image?: string;
  };
}

const BookingModalComponent: React.FC<BookingModalProps> = ({ isOpen, onClose, service }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
    pickupLocation: '',
    returnLocation: '',
    specialRequests: '',
    fullName: user?.user_metadata?.['full_name'] || '',
    email: user?.email || '',
    phone: user?.user_metadata?.['phone'] || ''
  });

  // Mettre à jour le formulaire lorsque l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.user_metadata?.['full_name'] || '',
        phone: user.user_metadata?.['phone'] || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const calculateTotalPrice = () => {
    const days = calculateDays();
    return service.price * days * formData.guests;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Erreur', 'Veuillez sélectionner les dates de début et de fin');
      return;
    }

    // Vérifier si la date de fin est après la date de début
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      toast.error('Erreur', 'La date de fin doit être postérieure à la date de début');
      return;
    }

    setLoading(true);

    try {
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = service.price * days * formData.guests;
      
      const bookingData: any = {
        user_id: user?.id,
        status: 'pending',
        total_price: totalPrice,
        payment_status: 'pending',
        start_date: formData.startDate,
        end_date: formData.endDate,
        guests: formData.guests,
        special_requests: formData.specialRequests,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        created_at: new Date().toISOString(),
      };

      let tableName = '';
      
      // Déterminer la table selon le type de service
      if (service.type === 'car') {
        tableName = 'car_bookings';
        bookingData.car_id = service.id;
        bookingData.pickup_location = formData.pickupLocation;
        bookingData.return_location = formData.returnLocation;
      } else if (service.type === 'tourism') {
        tableName = 'tourism_bookings';
        bookingData.package_id = service.id;
      } else if (service.type === 'property') {
        tableName = 'property_bookings';
        bookingData.property_id = service.id;
      }

      // Créer la réservation
      const { data: booking, error: bookingError } = await supabase
        .from(tableName)
        .insert([bookingData])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Rediriger vers la page de paiement
      navigate(ROUTES.PAYMENT, {
        state: {
          bookingId: booking.id,
          serviceId: service.id,
          serviceType: service.type,
          serviceTitle: service.title,
          totalPrice: totalPrice,
          formData: formData
        }
      });

      toast.success('Succès', 'Votre réservation a été créée avec succès !');
      onClose();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error('Erreur', error.message || 'Une erreur est survenue lors de la création de votre réservation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Réserver</h2>
            <p className="text-sm text-gray-600">{service.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Image du service */}
        {service.image && (
          <div className="px-6 pt-4">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Informations personnelles */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Lieu de prise en charge
                  </label>
                  <input
                    type="text"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    placeholder="Ex: Aéroport Casablanca"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Lieu de retour
                  </label>
                  <input
                    type="text"
                    value={formData.returnLocation}
                    onChange={(e) => setFormData({ ...formData, returnLocation: e.target.value })}
                    placeholder="Ex: Aéroport Marrakech"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Champs d'informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de personnes
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Dates de réservation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'arrivée
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de départ
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Demandes spéciales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demandes spéciales (optionnel)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                rows={3}
                placeholder="Ajoutez vos demandes spéciales ici..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Résumé du prix */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Prix par jour</span>
                <span className="font-medium">{service.price} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nombre de jours</span>
                <span className="font-medium">{calculateDays()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nombre de personnes</span>
                <span className="font-medium">{formData.guests}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-primary text-xl">
                    {calculateTotalPrice().toLocaleString()} MAD
                  </span>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payer maintenant
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const BookingModal = BookingModalComponent;
