import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../config/routes';
import { toast } from 'react-hot-toast';
import { Calendar, Mail, Phone, ArrowLeft, CheckCircle, User } from 'lucide-react';

interface UserMetadata {
  full_name?: string;
  phone?: string;
  [key: string]: any;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: UserMetadata;
  [key: string]: any;
}

interface ServiceData {
  id: string;
  title: string;
  description: string;
  price: number;
  images?: string[];
  type: string;
  [key: string]: any;
}

interface FormData {
  startDate: string;
  endDate: string;
  guests: number;
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

const ServiceReservation: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth() as { user: User | null };

  const [service, setService] = useState<ServiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    startDate: '',
    endDate: '',
    guests: 1,
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const fetchService = useCallback(async (): Promise<void> => {
    if (!id || !type) {
      toast.error('Service non trouvé');
      navigate(ROUTES.HOME);
      return;
    }

    try {
      setIsLoading(true);

      // Vérifier si des données de formulaire sont passées depuis la page de connexion
      const state = location.state as any;
      if (state?.formData) {
        setFormData(prev => ({
          ...prev,
          ...state.formData
        }));
      }

      // Déterminer la table en fonction du type de service
      const tableName = type === 'hebergements' ? 'hebergements' :
        type === 'voitures' ? 'voitures' :
          type === 'circuits' ? 'circuits' : 'services';

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) {
        throw new Error('Service non trouvé');
      }

      // Mapper les données du service
      setService({
        id: data.id,
        title: data.nom || data.titre || data.name || 'Sans titre',
        description: data.description || data.details || '',
        price: data.prix || data.prix_nuit || data.prix_jour || 0,
        images: data.images || [data.image_url].filter(Boolean) as string[],
        type: type
      });

      // Pré-remplir les champs si l'utilisateur est connecté
      if (user) {
        setFormData(prev => ({
          ...prev,
          fullName: user.user_metadata?.['full_name'] || '',
          email: user.email || '',
          phone: user.user_metadata?.['phone'] || ''
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du service:', error);
      toast.error('Erreur lors du chargement du service');
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  }, [id, type, user, navigate, location.state]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier les champs obligatoires
    if (!formData.startDate || !formData.endDate) {
      toast.error('Veuillez sélectionner des dates valides');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier si la date de fin est après la date de début
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      toast.error('La date de fin doit être postérieure à la date de début');
      return;
    }

    // Calculer le nombre de nuits
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = service ? service.price * nights : 0;

    // Préparer les données de réservation
    const reservationData = {
      serviceType: type,
      serviceId: id,
      serviceTitle: service?.title,
      servicePrice: service?.price,
      startDate: formData.startDate,
      endDate: formData.endDate,
      guests: formData.guests,
      totalPrice,
      customerInfo: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        specialRequests: formData.specialRequests
      }
    };

    // Si l'utilisateur n'est pas connecté, le rediriger vers la page de connexion
    if (!user) {
      navigate(ROUTES.LOGIN, {
        state: {
          from: ROUTES.PAYMENT,
          reservationData,
          message: 'Veuillez vous connecter ou créer un compte pour finaliser votre réservation.'
        }
      });
      return;
    }

    // Si l'utilisateur est connecté, procéder à la réservation
    try {
      setIsLoading(true);
      
      // Vérifier si les dates sont valides
      if (!formData.startDate || !formData.endDate) {
        toast.error('Veuillez sélectionner des dates de séjour valides');
        return;
      }
      
      // Vérifier si la date de fin est après la date de début
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        toast.error('La date de fin doit être postérieure à la date de début');
        return;
      }
      
      // Calculer le nombre de nuits
      const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Créer la réservation dans la base de données
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert([
          {
            user_id: user.id,
            service_id: id,
            service_type: type,
            start_date: formData.startDate,
            end_date: formData.endDate,
            guests: formData.guests,
            total_price: service ? service.price * nights : 0,
            status: 'en_attente',
            special_requests: formData.specialRequests,
            customer_name: formData.fullName,
            customer_email: formData.email,
            customer_phone: formData.phone
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // Rediriger vers la page de paiement après la réservation réussie
      navigate(ROUTES.PAYMENT, {
        state: {
          reservationId: reservation.id,
          serviceId: id,
          serviceType: type,
          serviceTitle: service?.title,
          servicePrice: service?.price,
          totalPrice: service ? service.price * nights : 0,
          formData: formData
        }
      });
      
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      toast.error('Une erreur est survenue lors de la réservation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value, 10) : value
    }));
  };

  const calculateNights = (start: string, end: string) => {
    if (!start || !end) return 0;
    return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <span className="sr-only">Chargement en cours...</span>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 w-full max-w-2xl">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Service introuvable. Veuillez réessayer ou contacter le support.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-red-50 text-sm font-medium text-red-700 hover:text-red-600"
                >
                  <span aria-hidden="true">&larr;</span> Retour
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center text-emerald-600 hover:text-emerald-700"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Réservation de {service?.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Remplissez les détails de votre réservation</p>
          </div>

          <div className="px-4 py-5 sm:p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Détails de la réservation</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Date d'arrivée <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            name="startDate"
                            id="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Date de départ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            name="endDate"
                            id="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                            className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 disabled:bg-gray-50"
                            required
                            disabled={!formData.startDate}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre de voyageurs <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            name="guests"
                            id="guests"
                            min="1"
                            value={formData.guests}
                            onChange={handleInputChange}
                            className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Informations personnelles</h3>
                      <p className="text-sm text-gray-500 mb-4">Ces informations seront utilisées pour vous contacter concernant votre réservation.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom complet <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="fullName"
                            id="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5"
                            placeholder="+212 6 12 34 56 78"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                          Demandes spéciales (facultatif)
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <textarea
                            id="specialRequests"
                            name="specialRequests"
                            rows={3}
                            value={formData.specialRequests}
                            onChange={handleInputChange}
                            className="focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2.5"
                            placeholder="Avez-vous des demandes particulières ?"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? 'Traitement...' : 'Confirmer la réservation'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              
              {/* Panneau latéral */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Récapitulatif</h3>
                  
                  {service && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        {service.images && service.images.length > 0 && (
                          <img
                            src={service.images[0]}
                            alt={service.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900">{service.title}</h4>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{service.description}</p>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Prix par nuit</span>
                              <span className="font-medium text-gray-900">{service.price} MAD</span>
                            </div>
                            
                            {formData.startDate && formData.endDate && (
                              <div className="mt-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Durée du séjour</span>
                                  <span className="font-medium text-gray-900">
                                    {calculateNights(formData.startDate, formData.endDate)} nuits
                                  </span>
                                </div>
                                
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <span>Total</span>
                                    <span>
                                      {calculateNights(formData.startDate, formData.endDate) * service.price} MAD
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-emerald-800">Annulation gratuite</h4>
                            <p className="mt-1 text-sm text-emerald-700">Annulez sans frais jusqu'à 24h avant votre arrivée.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-2">
                        <p>En cliquant sur « Confirmer la réservation », vous acceptez les conditions générales de vente et la politique de confidentialité de Maroc 2030.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceReservation;
