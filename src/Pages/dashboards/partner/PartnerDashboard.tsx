import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import useRealtimeSubscription from '../../../hooks/useRealtimeSubscription';
import { DollarSign, TrendingUp, Clock, CreditCard, CheckCircle, XCircle, AlertCircle, Plus, Package, ArrowRight } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Enregistrer les composants de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Types
type DashboardStats = {
  total_products: number;
  active_products: number;
  total_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  total_commission: number;
  total_earnings: number;
  total_paid: number;
  pending_payment: number;
};

type RecentBooking = {
  id: string;
  booking_number: string;
  client_name: string;
  product_title: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  commission_amount: number;
  partner_amount: number;
  status: string;
  created_at: string;
};

const PartnerDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  // Données pour les graphiques
  const revenueData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Revenu total',
        data: [12000, 19000, 3000, 5000, 2000, 3000],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Gains (après commission)',
        data: [10800, 17100, 2700, 4500, 1800, 2700],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const bookingStatusData = {
    labels: ['Confirmées', 'En attente', 'Annulées'],
    datasets: [
      {
        data: [70, 20, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  const [recentBookings, setRecentBookings] = useState<Array<RecentBooking & { product_title: string }>>([]);

  // Fonction pour charger les données du tableau de bord
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Charger les statistiques
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_partner_dashboard_stats', { partner_id: user.id });
        
      if (statsError) throw statsError;
      
      // Charger les réservations récentes
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_number,
          client_name,
          product:service_id (title),
          check_in_date,
          check_out_date,
          total_amount,
          commission_amount,
          partner_amount,
          status,
          created_at
        `)
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (bookingsError) throw bookingsError;
      
      // Mettre à jour l'état avec les données formatées
      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }
      
      if (bookingsData) {
        setRecentBookings(bookingsData.map(booking => ({
          ...booking,
          product_title: (booking as any).product?.title || 'Produit inconnu'
        })));
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Chargement initial des données
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Abonnement aux mises à jour des réservations
  useRealtimeSubscription({
    table: 'bookings',
    event: '*',
    filter: `partner_id=eq.${user?.id}`,
    callback: (payload) => {
      console.log('Mise à jour de réservation détectée:', payload);
      loadDashboardData();
    },
    enabled: !!user?.id
  });

  // Abonnement aux mises à jour des paiements
  useRealtimeSubscription({
    table: 'payments',
    event: '*',
    filter: `partner_id=eq.${user?.id}`,
    callback: (payload) => {
      console.log('Mise à jour de paiement détectée:', payload);
      loadDashboardData();
    },
    enabled: !!user?.id
  });

  // Options pour les graphiques
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
        text: 'Revenus mensuels',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (tickValue: string | number) => {
            const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
            return new Intl.NumberFormat('fr-MA', {
              style: 'currency',
              currency: 'MAD',
              minimumFractionDigits: 2,
            }).format(value);
          },
        },
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Statut des réservations',
      },
    },
  };

  // Fonction pour formater les montants
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 mr-1" />;
      case 'pending':
        return <Clock className="w-4 h-4 mr-1" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-1 text-gray-600">
            Bon retour, {profile?.first_name || 'Partenaire'} ! Voici un aperçu de votre activité.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate('/dashboard/partner/products/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenu total */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0 p-3 rounded-md bg-blue-50">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Revenu total</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats?.total_revenue || 0)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Gains (après commission) */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0 p-3 rounded-md bg-green-50">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Gains (après commission)
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats?.total_earnings || 0)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Maroc 2030 */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0 p-3 rounded-md bg-purple-50">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Commission Maroc 2030 (10%)
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats?.total_commission || 0)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Paiement en attente */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0 p-3 rounded-md bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Paiement en attente</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats?.pending_payment || 0)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
        {/* Graphique des revenus */}
        <div className="p-6 bg-white rounded-lg shadow">
          <Line data={revenueData} options={lineChartOptions} />
        </div>

        {/* Graphique des réservations */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="h-full">
            <Doughnut data={bookingStatusData} options={doughnutChartOptions} />
          </div>
        </div>
      </div>

      {/* Dernières réservations */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Dernières réservations</h2>
          <button
            onClick={() => navigate('/dashboard/partner/bookings')}
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            Voir tout <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <li key={booking.id}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="font-medium text-primary truncate">
                            {booking.booking_number}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status === 'confirmed' ? 'Confirmée' : 
                             booking.status === 'completed' ? 'Terminée' : 
                             booking.status === 'cancelled' ? 'Annulée' : 'En attente'}
                          </span>
                        </div>
                        <div className="shrink-0 ml-2">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(booking.partner_amount)}
                            <span className="text-xs text-gray-500 ml-1">(net)</span>
                          </p>
                          <p className="text-xs text-gray-500 line-through">
                            {formatCurrency(booking.total_amount)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {booking.product_title}
                          </p>
                          <p className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
                          <p>
                            Par {booking.client_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-gray-500">
                Aucune réservation récente
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Produits populaires */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Vos produits</h2>
          <button
            onClick={() => navigate('/dashboard/partner/products')}
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            Gérer les produits <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="overflow-hidden bg-white rounded-lg shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0 p-3 rounded-md bg-gray-50">
                    <Package className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Produit {item}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-semibold text-gray-900">
                          {item * 5} réservations
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          <ArrowRight className="self-center shrink-0 h-4 w-4 text-green-500" />
                          <span className="sr-only">Augmenté de</span>
                          {item * 2}%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50">
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary hover:text-primary-dark"
                  >
                    Voir les détails
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
