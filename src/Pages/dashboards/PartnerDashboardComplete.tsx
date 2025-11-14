import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import toast from 'react-hot-toast';
import {
  Package,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  Star,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  Bell,
  X,
  Save,
  Upload,
  MapPin,
  Home,
  Car,
  Building2,
  Palmtree
} from 'lucide-react';

interface PartnerStats {
  total_products: number;
  active_products: number;
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  this_month_earnings: number;
  average_rating: number;
}

interface Product {
  id: string;
  title: string;
  product_type: string;
  price: number;
  city: string;
  available: boolean;
  views: number;
  bookings_count: number;
  rating: number;
  main_image: string;
  created_at: string;
}

interface Booking {
  id: string;
  service_title: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  start_date: string;
  end_date: string;
  amount: number;
  payment_status: string;
  booking_status: string;
  partner_paid: boolean;
  partner_paid_at: string;
  created_at: string;
  earning_status: string;
}

const PartnerDashboardComplete: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'bookings' | 'earnings' | 'profile'>('overview');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Charger les statistiques
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_partner_dashboard_stats', { p_partner_id: user?.id });

      if (statsError) {
        console.error('Erreur stats:', statsError);
      } else if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Charger les produits
      const { data: productsData, error: productsError } = await supabase
        .from('partner_products')
        .select('*')
        .eq('partner_id', user?.id)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Erreur produits:', productsError);
      } else {
        setProducts(productsData || []);
      }

      // Charger les réservations
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('partner_bookings_view')
        .select('*')
        .eq('partner_id', user?.id)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Erreur réservations:', bookingsError);
      } else {
        setBookings(bookingsData || []);
      }

    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getProductTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'appartement': 'Appartement',
      'villa': 'Villa',
      'hotel': 'Hôtel',
      'voiture': 'Voiture',
      'circuit': 'Circuit'
    };
    return labels[type] || type;
  };

  const getProductTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'appartement': Home,
      'villa': Building2,
      'hotel': Building2,
      'voiture': Car,
      'circuit': Palmtree
    };
    const Icon = icons[type] || Package;
    return <Icon className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { color: string; label: string } } = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      'confirmed': { color: 'bg-green-100 text-green-800', label: 'Confirmé' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Annulé' },
      'completed': { color: 'bg-emerald-100 text-emerald-800', label: 'Terminé' },
      'paid': { color: 'bg-green-100 text-green-800', label: 'Payé' }
    };
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const { error } = await supabase
        .from('partner_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Produit supprimé avec succès');
      loadDashboardData();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('partner_products')
        .update({ available: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast.success(`Produit ${!currentStatus ? 'activé' : 'désactivé'}`);
      loadDashboardData();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="partner">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="partner">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bienvenue, {profile?.company_name || 'Partenaire'}
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez vos produits et suivez vos revenus
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowProductForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter un produit
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Produits */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Produits</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.total_products || 0}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {stats?.active_products || 0} actifs
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Package className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Réservations */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Réservations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.total_bookings || 0}
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  {stats?.pending_bookings || 0} en attente
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Gains en attente */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {stats?.pending_earnings?.toFixed(2) || '0.00'} MAD
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  À recevoir de Maroc2030
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Gains reçus */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gains reçus</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats?.paid_earnings?.toFixed(2) || '0.00'} MAD
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Ce mois: {stats?.this_month_earnings?.toFixed(2) || '0.00'} MAD
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Note importante sur la commission */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-emerald-900">Information importante</h3>
              <p className="text-sm text-emerald-800 mt-1">
                Les montants affichés sont après déduction de la commission de 10% de Maroc2030.
                Vous recevez 90% du montant total payé par les clients.
              </p>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'products'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mes Produits ({stats?.total_products || 0})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'bookings'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Réservations ({stats?.total_bookings || 0})
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'earnings'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mes Gains
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Profil
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Réservations récentes
                  </h3>
                  {bookings.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune réservation pour le moment</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Les réservations apparaîtront ici dès que des clients réserveront vos produits
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Votre gain</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-gray-200">
                          {bookings.slice(0, 5).map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{booking.service_title}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{booking.client_name}</div>
                                <div className="text-sm text-gray-500">{booking.client_email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(booking.start_date).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-green-600">
                                  {booking.amount?.toFixed(2)} MAD
                                </div>
                                <div className="text-xs text-gray-500">(90% du total)</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(booking.booking_status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {booking.partner_paid ? (
                                  <span className="flex items-center gap-1 text-green-600 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    Reçu
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-yellow-600 text-sm">
                                    <Clock className="w-4 h-4" />
                                    En attente
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Produits - Suite dans le prochain message car limite de tokens */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDashboardComplete;
