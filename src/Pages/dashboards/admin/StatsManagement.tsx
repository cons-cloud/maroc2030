import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  Users, Home, Calendar, DollarSign, RefreshCw, Filter, XCircle
} from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Types
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  color: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => (
  <div className="bg-white rounded-lg shadow p-6 flex flex-col">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        {icon}
      </div>
    </div>
    <div className={`mt-4 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
      {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs mois dernier
    </div>
  </div>
);

const StatsManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalProperties: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    bookingGrowth: 0,
    propertyGrowth: 0,
  });

  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: number;
      fill: boolean;
      yAxisID?: string;
    }>;
  }>({
    labels: [],
    datasets: []
  });

  const [categoryData, setCategoryData] = useState<{
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
      borderWidth: number;
    }>;
  }>({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques globales
      const [
        { count: userCount },
        { count: bookingCount },
        { data: revenue },
        { count: propertyCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('bookings').select('*', { count: 'exact' }),
        supabase.from('payments').select('amount')
          .then(({ data, error }) => {
            if (error) throw error;
            const total = data.reduce((sum, { amount }) => sum + (amount || 0), 0);
            return { data: total };
          }),
        supabase.from('properties').select('*', { count: 'exact' })
      ]);

      // Calculer les tendances (simulées pour l'exemple)
      const userGrowth = Math.floor(Math.random() * 20) - 5;
      const revenueGrowth = Math.floor(Math.random() * 25) - 5;
      const bookingGrowth = Math.floor(Math.random() * 15) - 5;
      const propertyGrowth = Math.floor(Math.random() * 10);

      setStats({
        totalUsers: userCount || 0,
        totalBookings: bookingCount || 0,
        totalRevenue: revenue || 0,
        totalProperties: propertyCount || 0,
        userGrowth,
        revenueGrowth,
        bookingGrowth,
        propertyGrowth,
      });

      // Générer des données de graphique simulées
      generateChartData();
      generateCategoryData();
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    const labels = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
    
    const generateRandomData = (min: number, max: number) => 
      labels.map(() => Math.floor(Math.random() * (max - min + 1)) + min);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Utilisateurs',
          data: generateRandomData(5, 50),
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Réservations',
          data: generateRandomData(10, 80),
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Revenus (k€)',
          data: generateRandomData(1, 30).map(x => x * 0.1),
          borderColor: 'rgba(245, 158, 11, 1)',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    });
  };

  const generateCategoryData = () => {
    setCategoryData({
      labels: ['Appartements', 'Villas', 'Événements', 'Annonces'],
      datasets: [
        {
          data: [12, 19, 8, 15],
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderWidth: 1
        }
      ]
    });
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-1">Aperçu des performances et statistiques</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois-ci</option>
              <option value="year">Cette année</option>
            </select>
            <button
              onClick={loadStats}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Utilisateurs"
                value={stats.totalUsers.toLocaleString()}
                icon={<Users className="h-6 w-6 text-indigo-600" />}
                trend={stats.userGrowth}
                color="bg-indigo-100 text-indigo-600"
              />
              <StatCard
                title="Réservations"
                value={stats.totalBookings.toLocaleString()}
                icon={<Calendar className="h-6 w-6 text-emerald-600" />}
                trend={stats.bookingGrowth}
                color="bg-emerald-100 text-emerald-600"
              />
              <StatCard
                title="Revenus"
                value={`${stats.totalRevenue.toLocaleString()} €`}
                icon={<DollarSign className="h-6 w-6 text-amber-600" />}
                trend={stats.revenueGrowth}
                color="bg-amber-100 text-amber-600"
              />
              <StatCard
                title="Biens immobiliers"
                value={stats.totalProperties.toLocaleString()}
                icon={<Home className="h-6 w-6 text-red-600" />}
                trend={stats.propertyGrowth}
                color="bg-red-100 text-red-600"
              />
            </div>

            {/* Graphique principal */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Activité récente</h2>
                <div className="flex items-center space-x-2 text-sm">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span>Filtrer par :</span>
                  <select className="bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-indigo-500 rounded">
                    <option>Tous les types</option>
                    <option>Utilisateurs</option>
                    <option>Réservations</option>
                    <option>Revenus</option>
                  </select>
                </div>
              </div>
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Répartition par catégorie */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Répartition par catégorie</h2>
                <div className="h-64">
                  <Pie data={categoryData} options={pieOptions} />
                </div>
              </div>

              {/* Dernières activités */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Dernières activités</h2>
                <div className="space-y-4">
                  {[
                    { id: 1, user: 'Jean Dupont', action: 'a réservé un appartement', time: 'Il y a 5 min', type: 'booking' },
                    { id: 2, user: 'Marie Martin', action: 'a créé un compte', time: 'Il y a 1 heure', type: 'user' },
                    { id: 3, user: 'Pierre Durand', action: 'a effectué un paiement', amount: '450 €', time: 'Il y a 3 heures', type: 'payment' },
                    { id: 4, user: 'Sophie Petit', action: 'a annulé une réservation', time: 'Il y a 1 jour', type: 'cancellation' },
                    { id: 5, user: 'Admin', action: 'a ajouté une nouvelle villa', time: 'Il y a 2 jours', type: 'property' },
                  ].map((activity) => (
                    <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        {activity.type === 'booking' && <Calendar className="h-5 w-5 text-indigo-600" />}
                        {activity.type === 'user' && <Users className="h-5 w-5 text-emerald-600" />}
                        {activity.type === 'payment' && <DollarSign className="h-5 w-5 text-amber-600" />}
                        {activity.type === 'cancellation' && <XCircle className="h-5 w-5 text-red-600" />}
                        {activity.type === 'property' && <Home className="h-5 w-5 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user} <span className="font-normal text-gray-500">{activity.action}</span>
                          {activity.amount && <span className="font-semibold text-amber-600"> {activity.amount}</span>}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StatsManagement;
