import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Plus, Edit, Trash2, Eye, Search, Filter, 
  Check, X, ArrowUpDown, ChevronDown, MoreHorizontal 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: 'per_night' | 'per_day' | 'per_person';
  city: string;
  available: boolean;
  main_image: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
}

const PartnerProducts: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Charger les produits du partenaire
  useEffect(() => {
    const loadProducts = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        let query = supabase
          .from('partner_products')
          .select('*')
          .eq('partner_id', user.id);
          
        const { data, error } = await query;
        
        if (error) throw error;
        
        setProducts(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        toast.error('Erreur lors du chargement des produits');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [user?.id]);

  // Supprimer un produit
  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      setDeletingId(id);
      
      // Supprimer les images du stockage
      const { data: productData } = await supabase
        .from('partner_products')
        .select('images')
        .eq('id', id)
        .single();
        
      if (productData?.images?.length) {
        const filesToDelete = productData.images.map((url) => {
          const path = url.split('/').pop();
          return `products/${id}/${path}`;
        });
        
        const { error: deleteError } = await supabase.storage
          .from('maroc2030')
          .remove(filesToDelete);
          
        if (deleteError) throw deleteError;
      }
      
      // Supprimer le produit de la base de données
      const { error } = await supabase
        .from('partner_products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Mettre à jour l'état local
      setProducts(products.filter(product => product.id !== id));
      toast.success('Produit supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Erreur lors de la suppression du produit');
    } finally {
      setDeletingId(null);
    }
  };

  // Gérer le tri des colonnes
  const requestSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Appliquer les filtres et le tri
  const filteredAndSortedProducts = React.useMemo(() => {
    let result = [...products];
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        product =>
          product.title.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.city.toLowerCase().includes(term)
      );
    }
    
    // Filtrer par statut
    if (statusFilter !== 'all') {
      result = result.filter(product => 
        statusFilter === 'available' ? product.available : !product.available
      );
    }
    
    // Trier
    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Gérer les valeurs nulles
        if (aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
        
        // Trier par date
        if (sortConfig.key === 'created_at' || sortConfig.key === 'updated_at') {
          aValue = aValue ? new Date(aValue as string).getTime() : 0;
          bValue = bValue ? new Date(bValue as string).getTime() : 0;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [products, searchTerm, statusFilter, sortConfig]);

  // Formater le prix
  const formatPrice = (price: number, priceType: string) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(price) + ` / ${priceType === 'per_night' ? 'nuit' : priceType === 'per_day' ? 'jour' : 'personne'}`;
  };

  // Obtenir la classe de tri pour une colonne
  const getSortClass = (key: string) => {
    if (!sortConfig) return '';
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? 'rotate-180' : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Mes produits</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez vos produits et services proposés sur la plateforme
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/dashboard/partner/products/new"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="w-5 h-5 mr-2 -ml-1" />
            Ajouter un produit
          </Link>
        </div>
      </div>
      
      {/* Filtres et recherche */}
      <div className="flex flex-col mt-8 space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex-1 max-w-lg">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label htmlFor="status-filter" className="mr-2 text-sm font-medium text-gray-700">
              Statut :
            </label>
            <select
              id="status-filter"
              className="block w-full py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Tous</option>
              <option value="available">Disponible</option>
              <option value="unavailable">Indisponible</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Tableau des produits */}
      <div className="mt-8 overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('title')}
                >
                  <div className="flex items-center">
                    Produit
                    <ArrowUpDown className={`w-4 h-4 ml-2 ${getSortClass('title')}`} />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('price')}
                >
                  <div className="flex items-center">
                    Prix
                    <ArrowUpDown className={`w-4 h-4 ml-2 ${getSortClass('price')}`} />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('city')}
                >
                  <div className="flex items-center">
                    Ville
                    <ArrowUpDown className={`w-4 h-4 ml-2 ${getSortClass('city')}`} />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('available')}
                >
                  <div className="flex items-center">
                    Statut
                    <ArrowUpDown className={`w-4 h-4 ml-2 ${getSortClass('available')}`} />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('created_at')}
                >
                  <div className="flex items-center">
                    Date d'ajout
                    <ArrowUpDown className={`w-4 h-4 ml-2 ${getSortClass('created_at')}`} />
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-sm text-center text-gray-500">
                    Aucun produit trouvé. Commencez par ajouter votre premier produit.
                  </td>
                </tr>
              ) : (
                filteredAndSortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 w-10 h-10">
                          {product.main_image || (product.images && product.images[0]) ? (
                            <img
                              className="w-10 h-10 rounded-md"
                              src={product.main_image || product.images[0]}
                              alt={product.title}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-md">
                              <span className="text-gray-500">
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatPrice(product.price, product.price_type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {product.available ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Disponible
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Indisponible
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {format(new Date(product.created_at), 'd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/dashboard/partner/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/dashboard/partner/products/${product.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Supprimer"
                        >
                          {deletingId === product.id ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {filteredAndSortedProducts.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex justify-between flex-1 sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Précédent
            </button>
            <button className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">1</span> à{' '}
                <span className="font-medium">{Math.min(filteredAndSortedProducts.length, 10)}</span> sur{' '}
                <span className="font-medium">{filteredAndSortedProducts.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50">
                  <span className="sr-only">Précédent</span>
                  <ChevronDown className="w-5 h-5 transform rotate-90" />
                </button>
                <button
                  aria-current="page"
                  className="relative z-10 inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 border border-primary-500 bg-primary-50"
                >
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 border border-gray-300 bg-white hover:bg-gray-50">
                  2
                </button>
                <button className="relative items-center hidden px-4 py-2 text-sm font-medium text-gray-500 border border-gray-300 bg-white hover:bg-gray-50 md:inline-flex">
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50">
                  <span className="sr-only">Suivant</span>
                  <ChevronDown className="w-5 h-5 transform -rotate-90" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerProducts;
