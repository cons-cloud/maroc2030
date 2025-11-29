import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ProductForm from '../../components/forms/ProductForm';
import { useToast } from '@/components/ui/use-toast';
import { Package, Home, Building2, Car, Palmtree, Plus } from 'lucide-react';
import type { Service, ServiceType } from '../../types/supabase';

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

type Product = Omit<Service, 'type'> & {
  product_type: ServiceType;
  main_image: string;
  bookings_count: number;
  available: boolean;
  views: number;
  rating: number;
};

// Type de réservation (commenté car non utilisé pour le moment)
// type Booking = BookingType & {
//   service_title: string;
//   client_name: string;
//   client_email: string;
//   client_phone: string;
//   amount: number;
//   payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
//   booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
//   partner_paid: boolean;
//   partner_paid_at: string | null;
//   earning_status: 'pending' | 'available' | 'paid';
// };

const PartnerDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  // État pour les réservations (commenté car non utilisé pour le moment)
  // const [bookings, setBookings] = useState<Booking[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // Gestion des onglets et filtres
  const [_, setActiveTab] = useState<'overview' | 'products' | 'bookings' | 'earnings' | 'profile'>('overview');
  const [productFilter, setProductFilter] = useState<string>('all');

  // Fonction utilitaire pour obtenir l'onglet actif depuis l'URL
  const getActiveTabFromPath = (): 'overview' | 'products' | 'bookings' | 'earnings' | 'profile' => {
    const path = location.pathname;
    if (path.includes('/services') || path.includes('/cars') || path.includes('/properties') || path.includes('/tours')) return 'products';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/stats')) return 'earnings';
    if (path.includes('/profile') || path.includes('/announcements')) return 'profile';
    return 'overview';
  };

  // Charger les données au montage du composant
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
    loadDashboardData();
  }, [location.pathname]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Charger les statistiques
      const { data: statsData } = await supabase
        .rpc('get_partner_stats', { partner_id: user.id });
      
      // Charger les produits
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false });
      
      // Charger les réservations (commenté car non utilisé pour le moment)
      // const { data: bookingsData } = await supabase
      //   .from('bookings')
      //   .select('*')
      //   .eq('partner_id', user.id)
      //   .order('created_at', { ascending: false });
      
      setStats(statsData as PartnerStats);
      setProducts(productsData || []);
      // setBookings(bookingsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur', 'Une erreur est survenue lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getProductTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
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
    const badges: Record<string, { color: string; label: string }> = {
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
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      toast.success('Succès', 'Le produit a été supprimé avec succès');
      loadDashboardData();
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Erreur', 'Une erreur est survenue lors de la suppression du produit');
    }
  };

  const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available: !currentStatus })
        .eq('id', productId);
      
      if (error) throw error;
      
      toast.success('Succès', `Le produit a été ${!currentStatus ? 'activé' : 'désactivé'}`);
      loadDashboardData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      toast.error('Erreur', 'Une erreur est survenue lors de la mise à jour du produit');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
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

      {/* Contenu principal */}
      <div className="space-y-6">
        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cartes de statistiques ici */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Produits</p>
                  <p className="text-2xl font-bold">{stats.total_products}</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </div>
            {/* Ajoutez d'autres cartes de statistiques ici */}
          </div>
        )}

        {/* Liste des produits */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Mes Produits</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setProductFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  productFilter === 'all' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setProductFilter('voiture')}
                className={`px-4 py-2 rounded-lg ${
                  productFilter === 'voiture' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'
                }`}
              >
                Voitures
              </button>
              {/* Ajoutez d'autres filtres si nécessaire */}
            </div>
          </div>

          <div className="space-y-4">
            {products
              .filter(product => 
                productFilter === 'all' || 
                (productFilter === 'voiture' && product.product_type === 'voiture')
                // Ajoutez d'autres conditions de filtrage ici
              )
              .map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getProductTypeIcon(product.product_type)}
                    <div>
                      <h3 className="font-medium">{product.title}</h3>
                      <p className="text-sm text-gray-500">{product.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{product.price} DH</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductForm(true);
                        }}
                        className="p-2 text-gray-500 hover:text-emerald-600"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-500 hover:text-red-600"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Formulaire de produit (Modal) */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setShowProductForm(false);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default PartnerDashboard;