import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

// Interface pour les réservations
interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  start_date: string;
  end_date?: string;
  guests?: number;
  total_price?: number;
  reference?: string;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  service_title?: string;
  service_image?: string | null;
  service_type?: string;
  created_at: string;
  updated_at: string;
}

const ClientBookings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  // Fonction pour charger les réservations
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        console.log('Aucun utilisateur connecté');
        return;
      }

      console.log('Récupération des réservations pour l\'utilisateur:', user.id);
      
      // 1. Récupérer d'abord les réservations
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_id', user.id)  // Correction: utilisation de client_id au lieu de user_id
        .order('created_at', { ascending: false });

      console.log('Résultats de la requête bookings:', { bookingsData, bookingsError });

      if (bookingsError) {
        console.error('Erreur lors de la récupération des réservations:', bookingsError);
        throw new Error(`Erreur lors du chargement des réservations: ${bookingsError.message}`);
      }

      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        return;
      }

      if (!bookingsData || bookingsData.length === 0) {
        console.log('Aucune réservation trouvée pour cet utilisateur');
        setBookings([]);
        return;
      }

      // 2. Récupérer les IDs des services uniques
      const serviceIds = bookingsData
        .map(b => b.service_id)
        .filter((id): id is string => !!id);
      
      console.log('ID utilisateur:', user.id);
      console.log('Réservations trouvées:', bookingsData);
      console.log('IDs de services:', serviceIds);
      
      console.log('IDs des services à récupérer:', serviceIds);

      let servicesData = [];
      if (serviceIds.length > 0) {
        // 3. Récupérer les détails des services
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .in('id', serviceIds);

        console.log('Résultats de la requête services:', { services, servicesError });

        if (servicesError) {
          console.error('Erreur lors de la récupération des services:', servicesError);
          // On continue même en cas d'erreur, on affichera juste moins d'informations
        } else if (services) {
          servicesData = services;
        }
      }

      // Créer une map pour un accès rapide aux services par ID
      const servicesMap = new Map(servicesData.map(service => [service.id, service]));

      console.log('Services chargés:', servicesMap.size);

      // 4. Combiner les données
      const formattedBookings = bookingsData.map(booking => {
        const service = booking.service_id ? servicesMap.get(booking.service_id) : null;
        return {
          ...booking,
          service_title: service?.title || 'Service inconnu',
          service_image: service?.image_url || null,
          service_type: service?.type || 'service',
          // Assurez-vous que ces champs existent dans votre objet booking
          start_date: booking.start_date || booking.created_at,
          end_date: booking.end_date || null,
          total_price: booking.total_price || 0,
          status: booking.status || 'pending'
        };
      });

      console.log('Réservations formatées:', formattedBookings);

      // 5. Appliquer le filtre si nécessaire
      const filteredBookings = filter === 'all' 
        ? formattedBookings 
        : formattedBookings.filter(booking => booking.status === filter);

      setBookings(filteredBookings);
      
    } catch (err) {
      console.error('Erreur lors du chargement des réservations:', err);
      setError('Impossible de charger les réservations. Veuillez réessayer.');
      toast.error('Erreur', 'Une erreur est survenue lors du chargement de vos réservations');
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter]);

  // Configurer l'abonnement en temps réel
  useEffect(() => {
    if (!user?.id) return;

    // S'abonner aux mises à jour en temps réel
    const channel = supabase
      .channel('bookings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadBookings(); // Recharger les réservations à chaque mise à jour
      })
      .subscribe();

    // Nettoyer l'abonnement lors du démontage du composant
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id, loadBookings]);

  // Charger les réservations au montage et quand le filtre change
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Fonction pour annuler une réservation
  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;
      
      // Mettre à jour l'état local
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { 
          ...booking, 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        } : booking
      ));
      
      toast.success('Réservation annulée', 'Votre réservation a été annulée avec succès');
    } catch (err) {
      console.error('Erreur lors de l\'annulation de la réservation:', err);
      toast.error('Erreur', 'Une erreur est survenue lors de l\'annulation de la réservation');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur est connecté
  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-green-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8">
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h2>
                <p className="text-gray-600 mb-6">Veuillez vous connecter pour accéder à vos réservations.</p>
                <Link 
                  to="/connexion" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher le chargement
  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-green-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8">
              <div className="text-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800">Chargement de vos réservations...</h2>
                <p className="text-gray-500 mt-2">Veuillez patienter un instant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher les erreurs
  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-green-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8">
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-red-800">Erreur de chargement</h3>
                <p className="mt-2 text-red-600">{error}</p>
                <button
                  onClick={loadBookings}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher le message quand il n'y a pas de réservations
  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-green-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8">
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation trouvée</h3>
                <p className="text-gray-500 mb-6">
                  Vous n'avez pas encore effectué de réservation. Parcourez nos services pour commencer.
                </p>
                <Link 
                  to="/services" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Découvrir nos services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher la liste des réservations
  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-green-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Mes réservations</h1>
              <p className="mt-1 text-sm text-gray-500">
                Consultez l'état de vos réservations et gérez vos prochains voyages
              </p>
            </div>

            {/* Filtres */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${
                  filter === 'all' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${
                  filter === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                En attente
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${
                  filter === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Confirmées
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${
                  filter === 'cancelled' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Annulées
              </button>
            </div>

            {/* Liste des réservations */}
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      {booking.service_image && (
                        <div className="w-full md:w-40 h-32 bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={booking.service_image} 
                            alt={booking.service_title || 'Image du service'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.service_title || 'Service inconnu'}
                        </h3>
                        <div className="mt-1 text-sm text-gray-500">
                          {new Date(booking.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {booking.reference && (
                          <div className="mt-1 text-sm text-gray-500">
                            Référence: {booking.reference}
                          </div>
                        )}
                        <div className="mt-2">
                          <span 
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : booking.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : booking.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {booking.status === 'confirmed' 
                              ? 'Confirmé' 
                              : booking.status === 'cancelled'
                              ? 'Annulé'
                              : booking.status === 'completed'
                              ? 'Terminé'
                              : 'En attente'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-emerald-600">
                          {booking.total_price?.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }) || 'Prix non disponible'}
                        </p>
                        
                        <div className="mt-3 space-y-2">
                          <Link
                            to={`/mes-reservations/${booking.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          >
                            Voir les détails
                          </Link>
                          
                          {!['cancelled', 'completed'].includes(booking.status) && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 ml-2"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientBookings;
