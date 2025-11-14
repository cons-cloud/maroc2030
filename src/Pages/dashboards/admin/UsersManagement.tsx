import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search, Filter, Trash2, UserCheck, UserX, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import usePagination from '../../../hooks/usePagination';

// Composant pour les icônes de pagination
const ChevronLeftIcon = () => (
  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

interface User {
  id: string;
  role: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
  description?: string;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [error, setError] = useState<string | null>(null);
  
  // Configuration de la pagination
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    nextPage,
    prevPage,
    goToPage,
    setItemsPerPage,
    updateTotalItems,
  } = usePagination({
    initialPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  });

  useEffect(() => {
    loadUsers();
    
    // Recharger les données quand la page devient visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUsers();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Charger les utilisateurs avec les filtres actuels
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Compter le nombre total d'utilisateurs qui correspondent aux filtres
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .ilike('email', `%${searchTerm}%`)
        .or(`company_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .neq('role', 'system');
      
      if (countError) throw countError;
      
      updateTotalItems(count || 0);
      
      // Récupérer les utilisateurs avec pagination
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', `%${searchTerm}%`)
        .or(`company_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .neq('role', 'system')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (profilesError) throw profilesError;
      
      if (!profiles) {
        setUsers([]);
        return;
      }

      // Utiliser la vue auth.users qui est accessible via la fonction RPC
      const { data: userData, error: userError } = await supabase.rpc('get_user_emails');
      
      if (userError) {
        console.warn('Could not fetch user emails:', userError);
        // Si on ne peut pas récupérer les emails, on utilise les profils sans les emails
        setUsers(profiles.map(profile => ({
          ...profile,
          email: 'Email non disponible'
        })));
      } else {
        // Fusionner les données des profils avec les emails
        const usersWithEmails = profiles.map(profile => ({
          ...profile,
          email: userData?.find((u: any) => u.id === profile.id)?.email || 'Email non disponible'
        }));
        setUsers(usersWithEmails);
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      setError(error.message || 'Erreur lors du chargement des utilisateurs');
      toast.error(error.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, itemsPerPage, updateTotalItems]);

  // Fonction pour mettre à jour le rôle d'un utilisateur
  const updateUserRole = useCallback(async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Rôle mis à jour');
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  }, [loadUsers]);

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`Utilisateur ${!currentStatus ? 'vérifié' : 'non vérifié'}`);
      loadUsers();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteUser = useCallback(async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      toast.success('Utilisateur supprimé');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression');
    }
  }, [loadUsers]);

  // Filtrer les utilisateurs par rôle côté client
  const filteredUsers = users.filter(user => {
    return filterRole === 'all' || user.role === filterRole;
  });
  
  // Gérer la recherche et le filtrage avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterRole, currentPage, itemsPerPage]);

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Admin' },
      partner_tourism: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Partenaire Tourisme' },
      partner_car: { bg: 'bg-green-100', text: 'text-green-800', label: 'Partenaire Voiture' },
      partner_realestate: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Partenaire Immobilier' },
      client: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Client' },
    };
    const badge = badges[role] || { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Client' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Afficher le chargement uniquement lors du premier chargement
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Rendu du composant
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            {totalItems} utilisateur(s) au total • 
            Page {currentPage} sur {Math.max(1, totalPages)}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600">Afficher :</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
              aria-label="Nombre d'éléments par page"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par email, nom ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Admin</option>
                <option value="partner_tourism">Partenaire Tourisme</option>
                <option value="partner_car">Partenaire Voiture</option>
                <option value="partner_realestate">Partenaire Immobilier</option>
                <option value="client">Client</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : user.company_name || user.email || 'Sans nom'
                          }
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone || '-'}</div>
                      <div className="text-sm text-gray-500">
                        {user.city && user.country 
                          ? `${user.city}, ${user.country}`
                          : user.city || user.country || '-'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_verified ? (
                        <span className="flex items-center text-green-600">
                          <UserCheck className="h-4 w-4 mr-1" />
                          Vérifié
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-400">
                          <UserX className="h-4 w-4 mr-1" />
                          Non vérifié
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleVerification(user.id, user.is_verified)}
                          className="text-emerald-600 hover:text-emerald-900"
                          title={user.is_verified ? 'Retirer la vérification' : 'Vérifier'}
                        >
                          <Shield className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-b-lg border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Précédent
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>{' '}
                    sur <span className="font-medium">{totalItems}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Précédent</span>
                      <ChevronLeftIcon />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Suivant</span>
                      <ChevronRightIcon />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default UsersManagement;
