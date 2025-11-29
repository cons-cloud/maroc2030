import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Plus, Edit, Trash2, Eye, Search, Filter, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useRealtimeSubscription from '../../../hooks/useRealtimeSubscription';

interface Service {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  price: number;
  price_per: string;
  city?: string;
  available: boolean;
  featured: boolean;
  images?: string[];
  created_at: string;
  category?: {
    name: string;
    type: string;
  };
}

const ServicesManagement: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);

  // Chargement initial des données
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadServices(), loadCategories()]);
    };
    initializeData();
  }, []);

  // Abonnement aux mises à jour en temps réel des services
  useRealtimeSubscription({
    table: 'services',
    event: '*',
    callback: async (payload) => {
      console.log('Mise à jour du service détectée:', payload);
      try {
        await loadServices();
        toast.success('Succès', 'Les services ont été mis à jour avec succès');
      } catch (error) {
        toast.error('Erreur', 'Une erreur est survenue lors de la mise à jour des services');
      }
    },
  });

  // Abonnement aux mises à jour des catégories
  useRealtimeSubscription({
    table: 'service_categories',
    event: '*',
    callback: () => {
      console.log('Mise à jour des catégories détectée');
      loadCategories();
    },
  });

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:category_id (name, type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Erreur', 'Une erreur est survenue lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erreur', 'Une erreur est survenue lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Succès', 'Le service a été supprimé avec succès');
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Erreur', 'Une erreur est survenue lors de la suppression du service');
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ available: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success('Succès', `Le service a été ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
      loadServices();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success('Succès', `Le service a été ${!currentStatus ? 'mis en avant' : 'retiré de la mise en avant'}`);
      loadServices();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category?.type === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Services</h1>
            <p className="text-gray-600 mt-1">{filteredServices.length} service(s) au total</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/admin/services/new')}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau Service
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.type}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Package className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service trouvé</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Commencez par ajouter votre premier service'}
            </p>
            {!searchTerm && filterCategory === 'all' && (
              <button
                onClick={() => navigate('/dashboard/admin/services/new')}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter un service
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {service.images?.length ? (
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://placehold.co/400x300?text=Image+non+disponible';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <Package className="h-12 w-12" />
                      <span className="sr-only">Aucune image disponible</span>
                    </div>
                  )}
                  {service.featured && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
                      ⭐ En avant
                    </span>
                  )}
                  <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${
                    service.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {service.available ? '✓ Disponible' : '✗ Indisponible'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{service.title}</h3>
                      <p className="text-sm text-gray-500">{service.category?.name}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {service.description || 'Pas de description'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-lg font-bold text-emerald-600">{service.price} MAD</span>
                      <span className="text-sm text-gray-500">/{service.price_per}</span>
                    </div>
                    {service.city && (
                      <span className="text-sm text-gray-500">📍 {service.city}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/dashboard/admin/services/edit/${service.id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </button>
                    <button
                      onClick={() => toggleAvailability(service.id, service.available)}
                      className={`px-3 py-2 rounded transition-colors ${
                        service.available
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                      title={service.available ? 'Désactiver' : 'Activer'}
                    >
                      {service.available ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button
                      onClick={() => toggleFeatured(service.id, service.featured)}
                      className={`px-3 py-2 rounded transition-colors ${
                        service.featured
                          ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={service.featured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
                    >
                      ⭐
                    </button>
                    <button
                      onClick={() => deleteService(service.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
};

export default ServicesManagement;
