import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Users, Calendar, Bell, Megaphone } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

// Types
interface BookingItem {
  id: string;
  user_id: string;
  service_id: string;
  start_date: string;
  status: string;
  total_price: number;
  user?: { email: string; first_name: string; last_name: string };
  service?: { title: string };
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeServices: number;
  pendingBookings: number;
  totalEvents: number;
  totalAnnouncements: number;
}

// Composant pour les cartes de statistiques
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  link 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ElementType; 
  color: string; 
  link: string 
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="px-4 py-5 sm:p-6">
      <div className="flex items-center">
        <div className={`shrink-0 rounded-md p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <div className="bg-gray-50 px-4 py-4 sm:px-6">
      <div className="text-sm">
        <Link to={link} className="font-medium text-blue-600 hover:text-blue-500">
          Voir tous<span className="sr-only"> {title.toLowerCase()}</span>
        </Link>
      </div>
    </div>
  </div>
);

// Composant principal AdminDashboard
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeServices: 0,
    pendingBookings: 0,
    totalEvents: 0,
    totalAnnouncements: 0,
  });

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
      
      // Récupérer le nombre de réservations en attente
      const { count: pendingBookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      // Récupérer le chiffre d'affaires total
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid');
      
      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      
      // Récupérer le nombre d'événements
      const { count: eventsCount } = await supabase
        .from('evenements')
        .select('*', { count: 'exact', head: true });
      
      // Récupérer le nombre d'annonces
      const { count: announcementsCount } = await supabase
        .from('annonces')
        .select('*', { count: 'exact', head: true });
      
      // Récupérer le nombre de services actifs
      const { count: activeServicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      // Mettre à jour l'état avec les données récupérées
      setStats({
        totalUsers: usersCount || 0,
        totalBookings: bookingsCount || 0,
        totalRevenue,
        activeServices: activeServicesCount || 0,
        pendingBookings: pendingBookingsCount || 0,
        totalEvents: eventsCount || 0,
        totalAnnouncements: announcementsCount || 0,
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
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
      console.error('Erreur lors du chargement des réservations récentes:', error);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadStats(), fetchRecentBookings()]);
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Loader className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tableau de bord administrateur</h1>
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Utilisateurs" 
            value={stats.totalUsers} 
            icon={Users} 
            color="bg-blue-500" 
            link="/dashboard/admin/users" 
          />
          <StatCard 
            title="Réservations" 
            value={`${stats.totalBookings} (${stats.pendingBookings} en attente)`} 
            icon={Calendar} 
            color="bg-green-500" 
            link="/dashboard/admin/bookings" 
          />
          <StatCard 
            title="Chiffre d'affaires" 
            value={`${stats.totalRevenue.toFixed(2)} €`} 
            icon={Bell} 
            color="bg-yellow-500" 
            link="/dashboard/admin/payments" 
          />
          <StatCard 
            title="Événements" 
            value={stats.totalEvents} 
            icon={Calendar} 
            color="bg-purple-500" 
            link="/dashboard/admin/evenements" 
          />
          <StatCard 
            title="Annonces" 
            value={stats.totalAnnouncements} 
            icon={Megaphone} 
            color="bg-indigo-500" 
            link="/dashboard/admin/annonces" 
          />
          <StatCard 
            title="Services actifs" 
            value={stats.activeServices} 
            icon={Bell} 
            color="bg-pink-500" 
            link="/dashboard/admin/services" 
          />
        </div>

        {/* Dernières réservations */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Dernières réservations</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.service?.title || 'Service inconnu'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.user?.email || 'Utilisateur inconnu'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.start_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Confirmée' : booking.status === 'pending' ? 'En attente' : 'Annulée'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.total_price.toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Aucune réservation récente</p>
            )}
            <div className="mt-4 text-right">
              <Link 
                to="/dashboard/admin/bookings" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Voir toutes les réservations →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
