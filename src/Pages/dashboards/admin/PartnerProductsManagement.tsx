import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import {
  Package,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  MapPin,
  Calendar,
  User,
  Search,
  Filter
} from 'lucide-react';

interface PartnerProduct {
  id: string;
  partner_id: string;
  product_type: string;
  title: string;
  description: string;
  price: number;
  city: string;
  available: boolean;
  main_image: string;
  created_at: string;
  partner: {
    company_name: string;
    email: string;
    phone: string;
  };
}

const PartnerProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<PartnerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_products')
        .select(`
          *,
          partner:profiles!partner_id(company_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('partner_products')
        .update({ available: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast.success(`Produit ${!currentStatus ? 'activé' : 'désactivé'}`);
      loadProducts();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const { error } = await supabase
        .from('partner_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Produit supprimé');
      loadProducts();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.partner.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || product.product_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'available' && product.available) ||
                         (filterStatus === 'unavailable' && !product.available);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const productTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'hotel', label: 'Hôtels' },
    { value: 'appartement', label: 'Appartements' },
    { value: 'villa', label: 'Villas' },
    { value: 'voiture', label: 'Voitures' },
    { value: 'circuit', label: 'Circuits' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits des Partenaires</h1>
          <p className="text-gray-600 mt-1">Gérez tous les produits ajoutés par les partenaires</p>
        </div>
        <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-medium">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un produit ou partenaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {productTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Filtre par statut */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">Non disponibles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                {/* Image */}
                <div className="md:w-64 h-48 md:h-auto">
                  <img
                    src={product.main_image || '/assets/hero/hero1.jpg'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Contenu */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{product.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.available ? 'Disponible' : 'Non disponible'}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">{product.price} MAD</p>
                      <p className="text-sm text-gray-500">par nuit</p>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span className="capitalize">{product.product_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{product.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{product.partner.company_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(product.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(product.main_image, '_blank')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </button>
                    <button
                      onClick={() => toggleAvailability(product.id, product.available)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        product.available
                          ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                          : 'bg-green-100 hover:bg-green-200 text-green-700'
                      }`}
                    >
                      {product.available ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Activer
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnerProductsManagement;
