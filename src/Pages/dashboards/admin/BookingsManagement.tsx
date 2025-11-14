import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useRealtimeSubscription from '../../../hooks/useRealtimeSubscription';
import { supabase } from '../../../lib/supabase';
import { 
  Calendar, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  DollarSign,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/modals/ConfirmDialog';

// Types
type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

interface Client {
  id: string;
  company_name?: string;
  phone?: string;
  email?: string;
}

interface Service {
  id: string;
  title: string;
  price: number;
  type?: string;
}

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: BookingStatus;
  created_at: string;
  client_id: string;
  service_id: string;
  client: Client;
  service: Service;
  notes?: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  totalRevenue: number;
  monthRevenue: number;
  [key: string]: number;
}

const ITEMS_PER_PAGE = 10;

const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'completed', label: 'Terminé' }
];

const BookingsManagement: React.FC = () => {
  // Initialisation des états
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction utilitaire pour formater la date
  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  }, []);

  // Fonction utilitaire pour formater la monnaie
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  }, []);

  // Fonction utilitaire pour calculer le nombre de jours entre deux dates
  const calculateDays = useCallback((startDate: string, endDate: string): number => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn('Date invalide détectée');
        return 0;
      }
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } catch (error) {
      console.error('Erreur lors du calcul des jours:', error);
      return 0;
    }
  }, []);

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = useCallback((status: BookingStatus) => {
    const statusMap = {
      pending: { text: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: 'Confirmé', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Annulé', color: 'bg-red-100 text-red-800' },
      completed: { text: 'Terminé', color: 'bg-blue-100 text-blue-800' },
    };
    
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  }, []);

  // Chargement des réservations
  const loadBookings = useCallback(async (): Promise<void> => {
    console.log('[BookingsManagement] Début du chargement des réservations...');
    try {
      setLoading(true);
      setError(null);
      
      console.log('[BookingsManagement] Exécution de la requête Supabase...');
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:client_id (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[BookingsManagement] Erreur Supabase:', error);
        throw error;
      }
      
      console.log(`[BookingsManagement] ${data?.length || 0} réservations chargées`);
      setBookings(data || []);
      
      return Promise.resolve();
    } catch (error) {
      console.error('[BookingsManagement] Erreur lors du chargement des réservations:', error);
      setError('Impossible de charger les réservations. Veuillez réessayer.');
      toast.error('Erreur lors du chargement des réservations');
      return Promise.reject(error);
    } finally {
      // Ne pas désactiver le chargement ici, c'est fait dans le useEffect parent
      console.log('[BookingsManagement] Fin du chargement des réservations');
    }
  }, []);

  // Gestion de l'abonnement en temps réel
  useEffect(() => {
    if (loading) return; // Ne pas s'abonner pendant le chargement initial
    
    console.log('[BookingsManagement] Initialisation de l\'abonnement en temps réel');
    
    const channel = supabase
      .channel('db_changes_bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('[BookingsManagement] Événement en temps réel reçu:', payload.eventType);
          try {
            if (payload.eventType === 'INSERT') {
              console.log('[BookingsManagement] Nouvelle réservation insérée:', payload.new);
              setBookings(prev => [payload.new as Booking, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              console.log('[BookingsManagement] Réservation mise à jour:', payload.new);
              setBookings(prev => 
                prev.map(booking => 
                  booking.id === (payload.new as Booking).id 
                    ? { ...booking, ...(payload.new as Booking) } 
                    : booking
                )
              );
            } else if (payload.eventType === 'DELETE') {
              console.log('[BookingsManagement] Réservation supprimée:', payload.old);
              setBookings(prev => 
                prev.filter(booking => booking.id !== (payload.old as { id: string }).id)
              );
            }
          } catch (error) {
            console.error('[BookingsManagement] Erreur lors de la mise à jour en temps réel:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('[BookingsManagement] Statut de l\'abonnement:', status);
      });

    // Nettoyage de l'abonnement lors du démontage du composant
    return () => {
      console.log('[BookingsManagement] Nettoyage de l\'abonnement en temps réel');
      channel.unsubscribe();
    };
  }, [loading, setBookings]); // Réexécuter uniquement si l'état de chargement change

  // Gestion de la suppression d'une réservation
  const handleDelete = useCallback(async () => {
    if (!deletingBooking) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', deletingBooking.id);

      if (error) throw error;
      
      setBookings(prev => prev.filter(b => b.id !== deletingBooking.id));
      setDeletingBooking(null);
      toast.success('Réservation supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la réservation:', error);
      toast.error('Erreur lors de la suppression de la réservation');
    } finally {
      setIsDeleting(false);
    }
  }, [deletingBooking]);

  // Mise à jour du statut d'une réservation
  const updateStatus = useCallback(async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      
      // Mise à jour locale
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus as BookingStatus } 
            : booking
        )
      );
      
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  }, []);

  // Gestion du changement de page
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Filtrage des réservations
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = 
        !searchTerm ||
        booking.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        filterStatus === 'all' || 
        booking.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, filterStatus]);

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  
  // Pagination des réservations
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  // Calcul des statistiques
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      totalRevenue: bookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0),
      monthRevenue: bookings
        .filter(booking => {
          const bookingDate = new Date(booking.created_at);
          const now = new Date();
          return bookingDate.getMonth() === now.getMonth() && 
                 bookingDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
    };
  }, [bookings]);

  // Chargement initial des données
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      console.log('[BookingsManagement] Début du chargement initial des réservations...');
      try {
        await loadBookings();
        console.log('[BookingsManagement] Chargement initial terminé avec succès');
      } catch (error) {
        console.error('[BookingsManagement] Erreur lors du chargement initial:', error);
        if (isMounted) {
          setError('Impossible de charger les réservations. Veuillez réessayer plus tard.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      console.log('[BookingsManagement] Nettoyage du chargement initial');
    };
  }, []); // Suppression de la dépendance à loadBookings pour éviter les boucles infinies

  // Réinitialisation de la page lors du filtrage
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={loadBookings}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
            >
              Réessayer <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* ... reste du contenu ... */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des réservations</h1>
          <p className="mt-2 text-sm text-gray-700">
            Consultez et gérez toutes les réservations de votre plateforme.
          </p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative rounded-md shadow-sm w-full sm:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
            placeholder="Rechercher par client ou service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-1/4">
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total des réservations</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Clock className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">En attente</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{stats.pending}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Confirmées</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{stats.confirmed}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <DollarSign className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Revenu mensuel</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(stats.monthRevenue)}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des réservations */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Client
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Service
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Dates
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Durée
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Montant
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Statut
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-gray-200">
                  {paginatedBookings.length > 0 ? (
                    paginatedBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.client?.company_name || 'Client'}
                          </div>
                          <div className="text-sm text-gray-500">{booking.client?.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{booking.service?.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(booking.start_date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            au {formatDate(booking.end_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {calculateDays(booking.start_date, booking.end_date)} jour(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(booking.total_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={booking.status}
                              onChange={(e) => updateStatus(booking.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmer</option>
                              <option value="cancelled">Annuler</option>
                              <option value="completed">Terminer</option>
                            </select>
                            <button
                              onClick={() => setDeletingBooking(booking)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Search className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun résultat</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Aucune réservation ne correspond à votre recherche.
                        </p>
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTerm('');
                              setFilterStatus('all');
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            Réinitialiser les filtres
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Précédent
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">
                      {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredBookings.length)}
                    </span> à <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)}
                    </span> sur <span className="font-medium">{filteredBookings.length}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Précédent</span>
                      <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Afficher les numéros de page */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Calculer le numéro de page à afficher
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Suivant</span>
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {deletingBooking && (
        <ConfirmDialog
          isOpen={true}
          title="Supprimer la réservation"
          message={`Êtes-vous sûr de vouloir supprimer la réservation de ${deletingBooking.client?.company_name || 'ce client'} pour ${deletingBooking.service?.title || 'ce service'} ?\n\nCette action est irréversible et supprimera définitivement la réservation du système.`}
          onConfirm={handleDelete}
          onClose={() => setDeletingBooking(null)}
          type="danger"
          confirmText={isDeleting ? 'Suppression en cours...' : 'Supprimer définitivement'}
          loading={isDeleting}
          cancelText="Annuler"
        />
      )}
    </div>
  );
};

export default BookingsManagement;
