import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader, Plus, UserPlus, Users, Bell, Search, Megaphone, Calendar } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

// Déclaration du type pour la fonction toast
declare const toast: {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
};

// Alias pour l'icône d'événement
const EventIcon = Calendar;

// Définition du type pour une réservation
interface BookingItem {
  id: string;
  user_id: string;
  service_id: string;
  start_date: string;
  status: string;
  total_price: number;
  user?: { email: string; first_name: string; last_name: string };
  service?: { title: string };
}

// Composant pour les onglets de navigation
const Tab = ({ to, icon: Icon, label, active }: { to: string; icon: React.ElementType; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon className="h-5 w-5 mr-3" />
    {label}
  </Link>
);

// Composant principal AdminDashboard
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
  // État pour les statistiques
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeServices: 0,
    pendingBookings: 0,
    totalEvents: 0,
    totalAnnouncements: 0,
  });

  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);

  // Fonction pour charger les statistiques
  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer le nombre d'utilisateurs
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Récupérer les statistiques des réservations
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      
      // Récupérer le chiffre d'affaires total
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid');
      
      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      
      // Mettre à jour l'état avec les données récupérées
      setStats({
        totalUsers: usersCount || 0,
        totalBookings: bookingsCount || 0,
        totalRevenue,
        activeServices: 0, // À implémenter
        pendingBookings: 0, // À implémenter
        totalEvents: 0, // À implémenter
        totalAnnouncements: 0, // À implémenter
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };
  

  // Fonction pour vérifier si un onglet est actif
  const isActive = (path: string) => {
    return location.pathname === `/dashboard/admin${path}` || 
           (path !== '/admin' && location.pathname.startsWith(`/dashboard/admin${path}`));
  };

  // Fonction pour charger les réservations récentes
  const fetchRecentBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:profiles(*),
          service:services(*)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setRecentBookings(data || []);
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      toast.error('Erreur lors du chargement des réservations récentes');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadStats(), fetchRecentBookings()]);
    };
    
    loadData();
  }, []);

  // Fonction pour formater un nombre avec des espaces comme séparateurs de milliers
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Titre du tableau de bord */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord d'administration</h1>
        </div>
        {/* Contenu principal */}
        {isActive('/admin') && (
          <div className="space-y-6">
            {/* Cartes de statistiques */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Vue d'ensemble</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Statistiques et aperçu des activités récentes
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Carte Utilisateurs */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="shrink-0 bg-blue-500 rounded-md p-3">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Utilisateurs</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</div>
                              <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                <span className="sr-only">Augmentation de</span>
                                +12%
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="/dashboard/admin/utilisateurs" className="font-medium text-blue-600 hover:text-blue-500">
                          Voir tous les utilisateurs<span className="sr-only"> statistiques</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Carte Réservations */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="shrink-0 bg-green-500 rounded-md p-3">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Réservations</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</div>
                              <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                <span className="sr-only">Augmentation de</span>
                                +8%
                              </div>
                            </dd>
                            <dt className="text-xs font-medium text-gray-500">En attente: {stats.pendingBookings}</dt>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="/dashboard/admin/reservations" className="font-medium text-blue-600 hover:text-blue-500">
                          Voir toutes les réservations<span className="sr-only"> statistiques</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Carte Événements */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="shrink-0 bg-purple-500 rounded-md p-3">
                          <EventIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Événements</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</div>
                              <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                <span className="sr-only">Augmentation de</span>
                                +5%
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="/dashboard/admin/evenements" className="font-medium text-blue-600 hover:text-blue-500">
                          Gérer les événements<span className="sr-only"> statistiques</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Carte Annonces */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="shrink-0 bg-yellow-500 rounded-md p-3">
                          <Megaphone className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Annonces</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">{stats.totalAnnouncements}</div>
                              <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                <span className="sr-only">Augmentation de</span>
                                +3%
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="/dashboard/admin/annonces" className="font-medium text-blue-600 hover:text-blue-500">
                          Gérer les annonces<span className="sr-only"> statistiques</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dernières réservations */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Dernières réservations</h3>
              </div>
              <div className="bg-white overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <li key={booking.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {booking.service?.title || 'Service inconnu'}
                            </p>
                            <div className="ml-2 shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {booking.status}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {booking.user?.first_name} {booking.user?.last_name}
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                {new Date(booking.start_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              {booking.total_price.toFixed(2)} €
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 text-center text-gray-500">
                      Aucune réservation récente
                    </li>
                  )}
                </ul>
              </div>
              <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <a href="/dashboard/admin/reservations" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Voir toutes les réservations<span className="sr-only">, tableau de bord</span>
                </a>
              </div>
            </div>
          </div>
        )}
        
        {(isActive('evenements') || location.pathname.includes('evenements')) && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Gestion des événements</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Créez et gérez les événements du site
                  </p>
                </div>
                <Link
                  to="/dashboard/admin/evenements/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Nouvel événement
                </Link>
              </div>
            </div>
            <div className="bg-white px-4 py-5 sm:p-6">
              <EvenementsList />
            </div>
          </div>
        )}
        
        {(isActive('annonces') || location.pathname.includes('annonces')) && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Gestion des annonces</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Créez et gérez les annonces du site
                  </p>
                </div>
                <Link
                  to="/dashboard/admin/annonces/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Nouvelle annonce
                </Link>
              </div>
            </div>
            <div className="bg-white px-4 py-5 sm:p-6">
              <AnnoncesList />
            </div>
          </div>
        )}
        
        {isActive('parametres') && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Paramètres du site</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Gérez les paramètres généraux du site
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <SiteSettingsForm />
            </div>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button 
            className="relative bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center text-center hover:border-blue-500 hover:ring-2 hover:ring-blue-200"
            onClick={() => navigate('/dashboard/admin/users')}
          >
            <div className="rounded-full bg-blue-100 p-3">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900">Ajouter un utilisateur</h3>
            <p className="mt-1 text-sm text-gray-500">Créer un nouveau compte utilisateur</p>
          </button>

          <button 
            className="relative bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center text-center hover:border-green-500 hover:ring-2 hover:ring-green-200"
            onClick={() => navigate('/dashboard/admin/partners')}
          >
            <div className="rounded-full bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900">Ajouter un partenaire</h3>
            <p className="mt-1 text-sm text-gray-500">Enregistrer un nouveau partenaire</p>
          </button>

          <div className="relative group">
            <button 
              className="relative w-full bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center text-center hover:border-purple-500 hover:ring-2 hover:ring-purple-200"
            >
              <div className="rounded-full bg-purple-100 p-3">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">Ajouter un service</h3>
              <p className="mt-1 text-sm text-gray-500">Sélectionnez un type de service</p>
            </button>
            
            {/* Menu déroulant */}
            <div className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
              <div className="py-1">
                <button
                  onClick={() => navigate('/dashboard/admin/voitures/new')}
                  className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Location de voiture
                </button>
                <button
                  onClick={() => navigate('/dashboard/admin/villas/new')}
                  className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Location de villa
                </button>
                <button
                  onClick={() => navigate('/dashboard/admin/appartements/new')}
                  className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Location d'appartement
                </button>
                <button
                  onClick={() => navigate('/dashboard/admin/hotels/new')}
                  className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Hôtel
                </button>
                <button
                  onClick={() => navigate('/dashboard/admin/circuits/new')}
                  className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Circuit touristique
                </button>
                <button
                  onClick={() => navigate('/dashboard/admin/evenements/new')}
                  className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Événement
                </button>
              </div>
            </div>
          </div>

          <button 
            className="relative bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center text-center hover:border-yellow-500 hover:ring-2 hover:ring-yellow-200"
            onClick={() => navigate('/dashboard/admin/messages')}
          >
            <div className="rounded-full bg-yellow-100 p-3">
              <Bell className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900">Voir les alertes</h3>
            <p className="mt-1 text-sm text-gray-500">Consulter les notifications</p>
            {stats.pendingBookings > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {stats.pendingBookings}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant pour la liste des événements
const EvenementsList: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('evenements')
          .select('*')
          .order('start_date', { ascending: false });
          
        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        toast.error('Erreur lors du chargement des événements');
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, []);
  
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.city.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        const { error } = await supabase
          .from('evenements')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setEvents(events.filter(event => event.id !== id));
        toast.success('Événement supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de l\'événement');
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lieu
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun événement trouvé
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10">
                        {event.images?.[0] ? (
                          <img className="h-10 w-10 rounded-full" src={event.images[0]} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <EventIcon className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(event.start_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.city}</div>
                    <div className="text-sm text-gray-500">{event.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      event.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {event.available ? 'Disponible' : 'Terminé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/admin/evenements/${event.id}/modifier`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composant pour la liste des annonces
const AnnoncesList: React.FC = () => {
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadAnnonces = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('annonces')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setAnnonces(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
        toast.error('Erreur lors du chargement des annonces');
      } finally {
        setLoading(false);
      }
    };
    
    loadAnnonces();
  }, []);
  
  const filteredAnnonces = annonces.filter(annonce => 
    annonce.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    annonce.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    annonce.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    annonce.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    annonce.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        const { error } = await supabase
          .from('annonces')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setAnnonces(annonces.filter(annonce => annonce.id !== id));
        toast.success('Annonce supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de l\'annonce');
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
            placeholder="Rechercher une annonce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localisation
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAnnonces.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucune annonce trouvée
                </td>
              </tr>
            ) : (
              filteredAnnonces.map((annonce) => (
                <tr key={annonce.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10">
                        {annonce.images?.[0] ? (
                          <img className="h-10 w-10 rounded" src={annonce.images[0]} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                            <Megaphone className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{annonce.title}</div>
                        <div className="text-sm text-gray-500">{formatDate(annonce.created_at)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {annonce.category || 'Non spécifié'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{annonce.city || 'Non spécifié'}</div>
                    {annonce.location && (
                      <div className="text-sm text-gray-500">{annonce.location}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {annonce.price ? (
                      <span className="font-medium">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(annonce.price)}
                      </span>
                    ) : (
                      <span className="text-gray-500">Non spécifié</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      annonce.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {annonce.available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/admin/annonces/${annonce.id}/modifier`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(annonce.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composant pour le formulaire des paramètres du site
const SiteSettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    site_name: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    social_facebook: '',
    social_twitter: '',
    social_instagram: '',
    social_linkedin: '',
    social_youtube: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();
          
        if (error) throw error;
        
        if (data) {
          setSettings({
            site_name: data.site_name || '',
            site_description: data.site_description || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            social_facebook: data.social_facebook || '',
            social_twitter: data.social_twitter || '',
            social_instagram: data.social_instagram || '',
            social_linkedin: data.social_linkedin || '',
            social_youtube: data.social_youtube || ''
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        toast.error('Erreur lors du chargement des paramètres');
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 1, // ID fixe car on n'a qu'une seule ligne de paramètres
          ...settings,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast.success('Paramètres enregistrés avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des paramètres:', error);
      toast.error('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setSaving(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Informations générales</h3>
            <p className="mt-1 text-sm text-gray-500">
              Informations de base sur votre site web
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="site_name" className="block text-sm font-medium text-gray-700">
                  Nom du site
                </label>
                <input
                  type="text"
                  name="site_name"
                  id="site_name"
                  value={settings.site_name}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="col-span-6">
                <label htmlFor="site_description" className="block text-sm font-medium text-gray-700">
                  Description du site
                </label>
                <div className="mt-1">
                  <textarea
                    id="site_description"
                    name="site_description"
                    rows={3}
                    value={settings.site_description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Une brève description de votre site web"
                  />
                </div>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                  Email de contact
                </label>
                <input
                  type="email"
                  name="contact_email"
                  id="contact_email"
                  value={settings.contact_email}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                  Téléphone de contact
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  id="contact_phone"
                  value={settings.contact_phone}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Réseaux sociaux</h3>
            <p className="mt-1 text-sm text-gray-500">
              Liens vers vos profils de réseaux sociaux
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="social_facebook" className="block text-sm font-medium text-gray-700">
                  Facebook
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    https://facebook.com/
                  </span>
                  <input
                    type="text"
                    name="social_facebook"
                    id="social_facebook"
                    value={settings.social_facebook}
                    onChange={handleChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                    placeholder="votrepage"
                  />
                </div>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="social_twitter" className="block text-sm font-medium text-gray-700">
                  Twitter
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    https://twitter.com/
                  </span>
                  <input
                    type="text"
                    name="social_twitter"
                    id="social_twitter"
                    value={settings.social_twitter}
                    onChange={handleChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                    placeholder="votrecompte"
                  />
                </div>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="social_instagram" className="block text-sm font-medium text-gray-700">
                  Instagram
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    https://instagram.com/
                  </span>
                  <input
                    type="text"
                    name="social_instagram"
                    id="social_instagram"
                    value={settings.social_instagram}
                    onChange={handleChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                    placeholder="votrecompte"
                  />
                </div>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="social_linkedin" className="block text-sm font-medium text-gray-700">
                  LinkedIn
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    https://linkedin.com/company/
                  </span>
                  <input
                    type="text"
                    name="social_linkedin"
                    id="social_linkedin"
                    value={settings.social_linkedin}
                    onChange={handleChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                    placeholder="votresociete"
                  />
                </div>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="social_youtube" className="block text-sm font-medium text-gray-700">
                  YouTube
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    https://youtube.com/c/
                  </span>
                  <input
                    type="text"
                    name="social_youtube"
                    id="social_youtube"
                    value={settings.social_youtube}
                    onChange={handleChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                    placeholder="votrechaine"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
};

export default AdminDashboard;
