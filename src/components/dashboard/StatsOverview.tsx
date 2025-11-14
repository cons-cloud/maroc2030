import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, DollarSign, Briefcase, Bell } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

// Types pour les données de paiement
interface Payment {
  amount: number;
  created_at: string;
  payment_status: string;
}

// Types pour les statistiques
interface StatsData {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeServices: number;
  pendingBookings: number;
  totalEvents: number;
  totalAnnouncements: number;
  monthlyRevenue: number;
  bookingConversion: number;
}

interface StatsData {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeServices: number;
  pendingBookings: number;
  totalEvents: number;
  totalAnnouncements: number;
  monthlyRevenue: number;
  bookingConversion: number;
}

const StatsOverview: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeServices: 0,
    pendingBookings: 0,
    totalEvents: 0,
    totalAnnouncements: 0,
    monthlyRevenue: 0,
    bookingConversion: 0
  });
  const [loading, setLoading] = useState(true);

  // Fonction pour charger les statistiques
  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques de manière optimisée
      const [
        { count: userCount },
        { count: bookingCount },
        { data: payments },
        { count: activeServicesCount },
        { count: pendingBookingsCount },
        { count: totalEvents },
        { count: totalAnnouncements },
        { data: monthlyPayments }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount, payment_status').eq('payment_status', 'paid'),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('evenements').select('*', { count: 'exact', head: true }),
        supabase.from('annonces').select('*', { count: 'exact', head: true }),
        // Revenu mensuel
        supabase
          .from('payments')
          .select('amount')
          .eq('payment_status', 'paid')
          .gte('created_at', new Date(new Date().setDate(1)).toISOString())
      ]);

      // Estimation des visiteurs mensuels (à remplacer par votre système d'analytique)
      const monthlyVisitors = 1000;
      
      // Calculer les totaux avec vérification de type
      const totalRevenue = (payments as Payment[] || []).reduce(
        (sum: number, p: Payment) => sum + (p.amount || 0), 
        0
      );
      
      const monthlyRevenue = (monthlyPayments as Payment[] || []).reduce(
        (sum: number, p: Payment) => sum + (p.amount || 0), 
        0
      );
      
      const bookingConversion = monthlyVisitors 
        ? Math.round(((bookingCount || 0) / monthlyVisitors) * 100) 
        : 0;

      setStats({
        totalUsers: userCount || 0,
        totalBookings: bookingCount || 0,
        totalRevenue,
        activeServices: activeServicesCount || 0,
        pendingBookings: pendingBookingsCount || 0,
        totalEvents: totalEvents || 0,
        totalAnnouncements: totalAnnouncements || 0,
        monthlyRevenue,
        bookingConversion
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadStats();

    // Configuration de l'abonnement aux changements en temps réel
    const subscription = supabase
      .channel('dashboard-stats')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        loadStats();
      })
      .subscribe();

    // Nettoyage de l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Formatage des nombres
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  // Formatage de la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'MAD' 
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
      {/* Utilisateurs */}
      <StatCard 
        title="Utilisateurs"
        value={formatNumber(stats.totalUsers)}
        icon={<Users className="h-6 w-6 text-white" />}
        color="bg-blue-500"
        link="/dashboard/admin/users"
        linkText="Voir tous"
      />

      {/* Réservations */}
      <StatCard 
        title="Réservations"
        value={formatNumber(stats.totalBookings)}
        icon={<Calendar className="h-6 w-6 text-white" />}
        color="bg-green-500"
        link="/dashboard/admin/bookings"
        linkText="Voir toutes"
        badge={stats.pendingBookings > 0 ? `${stats.pendingBookings} en attente` : ''}
        badgeColor="bg-yellow-100 text-yellow-800"
      />

      {/* Chiffre d'affaires */}
      <StatCard 
        title="CA Total"
        value={formatCurrency(stats.totalRevenue)}
        icon={<DollarSign className="h-6 w-6 text-white" />}
        color="bg-yellow-500"
        link="/dashboard/admin/payments"
        linkText="Voir les paiements"
        subValue={`${formatCurrency(stats.monthlyRevenue)} ce mois`}
      />

      {/* Services actifs */}
      <StatCard 
        title="Services actifs"
        value={formatNumber(stats.activeServices)}
        icon={<Briefcase className="h-6 w-6 text-white" />}
        color="bg-purple-500"
        link="/dashboard/admin/services"
        linkText="Voir les services"
        subValue={`${stats.bookingConversion}% de conversion`}
      />

      {/* Événements */}
      <StatCard 
        title="Événements"
        value={formatNumber(stats.totalEvents)}
        icon={<Calendar className="h-6 w-6 text-white" />}
        color="bg-indigo-500"
        link="/dashboard/admin/evenements"
        linkText="Gérer les événements"
      />

      {/* Annonces */}
      <StatCard 
        title="Annonces"
        value={formatNumber(stats.totalAnnouncements)}
        icon={<Bell className="h-6 w-6 text-white" />}
        color="bg-pink-500"
        link="/dashboard/admin/annonces"
        linkText="Gérer les annonces"
      />
    </div>
  );
};

// Composant de carte de statistique réutilisable
const StatCard = ({
  title,
  value,
  icon,
  color,
  link,
  linkText,
  badge,
  badgeColor = 'bg-gray-100 text-gray-800',
  subValue
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  link: string;
  linkText: string;
  badge?: string;
  badgeColor?: string;
  subValue?: string;
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`shrink-0 p-3 rounded-lg text-white ${color}`}>
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {badge && (
                <span className={`ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                  {badge}
                </span>
              )}
            </dd>
            {subValue && (
              <dd className="mt-1 text-sm text-gray-500">
                {subValue}
              </dd>
            )}
          </dl>
        </div>
      </div>
    </div>
    <div className="bg-gray-50 px-5 py-3">
      <div className="text-sm">
        <Link to={link} className="font-medium text-blue-600 hover:text-blue-500">
          {linkText}
        </Link>
      </div>
    </div>
  </div>
);

export default StatsOverview;
