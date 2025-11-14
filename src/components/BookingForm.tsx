import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Service {
  id: string;
  title: string;
  price: number;
  type?: string;
  images?: string[];
  description?: string;
  duration?: string;
  maxGuests?: number;
}

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  serviceType?: string;
}

const BookingForm = ({ isOpen, onClose, service, serviceType }: BookingFormProps) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  // Suppression de isSubmitting car non utilisé
  const [formData, setFormData] = useState(() => {
    // Utilisation d'une fonction d'initialisation pour le state
    const userMeta = user?.user_metadata as Record<string, unknown> | undefined;
    const fullName = (userMeta && 
      (typeof userMeta['full_name'] === 'string' ? userMeta['full_name'] : 
       (typeof userMeta['first_name'] === 'string' && typeof userMeta['last_name'] === 'string' 
        ? `${userMeta['first_name']} ${userMeta['last_name']}` 
        : ''))) || '';
    
    const phone = (userMeta && typeof userMeta['phone'] === 'string') ? userMeta['phone'] : '';
    
    return {
      checkIn: '',
      checkOut: '',
      guests: 1,
      fullName: fullName,
      email: user?.email || '',
      phone: phone,
      message: ''
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value, 10) : value
    }));
  };

  // Fonction pour calculer le prix total en fonction des dates
  const calculateTotalPrice = (price: number, startDate: string, endDate: string, guests: number = 1): number => {
    if (!startDate || !endDate) return price;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return price * (nights > 0 ? nights : 1) * guests;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service) {
      toast.error('Service non disponible pour le moment');
      return;
    }
    
    if (!formData.checkIn || !formData.checkOut) {
      toast.error('Veuillez sélectionner les dates de séjour');
      return;
    }
    
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion avec les données du formulaire
      navigate('/login', {
        state: {
          from: window.location.pathname,
          reservationData: {
            serviceId: service.id,
            serviceTitle: service.title,
            servicePrice: service.price,
            serviceType: serviceType || 'service',
            ...formData
          },
          redirectTo: '/payment',
          message: 'Veuillez vous connecter pour finaliser votre réservation.'
        }
      });
      return;
    }
    
    try {
      // Préparer les données de réservation
      const reservationData = {
        serviceId: service.id,
        serviceTitle: service.title,
        servicePrice: service.price,
        serviceType: serviceType || 'service',
        ...formData,
        totalPrice: calculateTotalPrice(service.price, formData.checkIn, formData.checkOut, formData.guests)
      };
      
      // Rediriger vers la page de paiement avec les données de réservation
      navigate('/payment', {
        state: reservationData
      });
      
      // Fermer le formulaire
      onClose();
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      toast.error('Une erreur est survenue lors de la réservation');
    }
  };

  // Vérifier que le service existe
  if (!service) {
    onClose();
    return null;
  }
  
  // Calculer le prix total pour l'affichage
  const totalPrice = calculateTotalPrice(
    service.price, 
    formData.checkIn, 
    formData.checkOut, 
    formData.guests
  );
  
  // Formater le prix pour l'affichage
  const formattedPrice = new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(service.price);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
              onClick={onClose}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold text-gray-900">Réserver {service.title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Fermer"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="bg-emerald-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-600">
                    Prix: <span className="font-semibold">{formattedPrice}</span>
                    {serviceType === 'hotels' ? ' par nuit' : ''}
                  </p>
                  {formData.checkIn && formData.checkOut && (
                    <p className="mt-2 text-gray-600">
                      Total pour {Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nuit(s): 
                      <span className="font-semibold">
                        {new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(totalPrice)}
                      </span>
                    </p>
                  )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'arrivée *
                      </label>
                      <input
                        type="date"
                        id="checkIn"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
                        Date de départ *
                      </label>
                      <input
                        type="date"
                        id="checkOut"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de voyageurs *
                    </label>
                    <select
                      id="guests"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'personne' : 'personnes'}
                        </option>
                      ))}
                      <option value="7">7+ personnes</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message (optionnel)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Avez-vous des demandes particulières ?"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      Confirmer la réservation
                    </button>

                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingForm;
