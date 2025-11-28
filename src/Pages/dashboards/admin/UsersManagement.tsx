import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search, Trash2, UserCheck, UserX, Loader2, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import usePagination from '../../../hooks/usePagination';
import debounce from 'lodash/debounce';

// Types
type UserRole = 'admin' | 'partner' | 'client' | 'moderator';

interface User {
  id: string;
  role: UserRole;
  email: string;
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
  last_sign_in_at?: string;
}

// Fonction pour obtenir le badge de rôle
const getRoleBadge = (role: string) => {
  const roles: Record<string, { label: string; color: string }> = {
    admin: { label: 'Admin', color: 'bg-red-100 text-red-800' },
    moderator: { label: 'Modérateur', color: 'bg-blue-100 text-blue-800' },
    partner: { label: 'Partenaire', color: 'bg-green-100 text-green-800' },
    client: { label: 'Client', color: 'bg-gray-100 text-gray-800' },
  };

  const roleInfo = roles[role] || { label: role, color: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleInfo.color}`}>
      {roleInfo.label}
    </span>
  );
};

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

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

  // Fonction pour gérer les erreurs de manière cohérente
  const handleError = (error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const errorMessage = error?.message || defaultMessage;
    setError(errorMessage);
    toast.error(errorMessage);
  };

  // Charger les utilisateurs avec les filtres actuels (avec debounce)
  const loadUsers = useCallback(
    debounce(async () => {
      try {
        setLoading(true);
        setError(null);

        // Construction de la requête de base
        let query = supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .ilike('email', `%${searchTerm}%`)
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
          .neq('role', 'system');

        // Appliquer le filtre de rôle si nécessaire
        if (filterRole !== 'all') {
          query = query.eq('role', filterRole);
        }

        // Récupérer les données avec pagination
        const { data: profiles, count, error: queryError } = await query
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (queryError) throw queryError;

        // Mettre à jour les utilisateurs et le nombre total d'éléments
        updateTotalItems(count || 0);
        setUsers(profiles || []);

      } catch (error: any) {
        handleError(error, 'Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    }, 300),
    [searchTerm, filterRole, currentPage, itemsPerPage, updateTotalItems]
  );

  // Mettre à jour le rôle d'un utilisateur
  const updateUserRole = useCallback(
    async (userId: string, newRole: UserRole) => {
      try {
        setIsProcessing((prev) => ({ ...prev, [userId]: true }));

        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) throw error;

        toast.success('Rôle mis à jour avec succès');
        loadUsers();

      } catch (error: any) {
        handleError(error, 'Erreur lors de la mise à jour du rôle');
      } finally {
        setIsProcessing((prev) => ({ ...prev, [userId]: false }));
      }
    },
    [loadUsers]
  );

  // Bascule l'état de vérification d'un utilisateur
  const toggleVerification = useCallback(
    async (userId: string, currentStatus: boolean) => {
      try {
        setIsProcessing((prev) => ({ ...prev, [`verify_${userId}`]: true }));

        const { error } = await supabase
          .from('profiles')
          .update({ is_verified: !currentStatus, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) throw error;

        toast.success(`Utilisateur marqué comme ${!currentStatus ? 'vérifié' : 'non vérifié'}`);
        loadUsers();

      } catch (error: any) {
        handleError(error, 'Erreur lors de la mise à jour du statut de vérification');
      } finally {
        setIsProcessing((prev) => ({ ...prev, [`verify_${userId}`]: false }));
      }
    },
    [loadUsers]
  );

  // Supprimer un utilisateur
  const deleteUser = useCallback(
    async (userId: string, userEmail: string) => {
      if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ? Cette action est irréversible.`)) {
        return;
      }

      try {
        setIsProcessing((prev) => ({ ...prev, [`delete_${userId}`]: true }));

        // 1. Supprimer d'abord le profil
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (profileError) throw profileError;

        // 2. Supprimer l'utilisateur de l'authentification
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);

        if (authError) {
          console.warn('Impossible de supprimer l\'utilisateur de l\'authentification:', authError);
        }

        toast.success('Utilisateur supprimé avec succès');
        loadUsers();

      } catch (error: any) {
        handleError(error, 'Erreur lors de la suppression de l\'utilisateur');
      } finally {
        setIsProcessing((prev) => ({ ...prev, [`delete_${userId}`]: false }));
      }
    },
    [loadUsers]
  );

  // Options de filtre de rôle
  const roleOptions: { value: UserRole | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous les rôles' },
    { value: 'admin', label: 'Administrateur' },
    { value: 'moderator', label: 'Modérateur' },
    { value: 'partner', label: 'Partenaire' },
    { value: 'client', label: 'Client' },
  ];

  // Gérer la recherche et le filtrage avec debounce
  useEffect(() => {
    loadUsers();

    return () => {
      if (loadUsers.cancel) {
        loadUsers.cancel();
      }
    };
  }, [loadUsers]);

  // Fonction pour formater les dates
  const formatDateString = (dateString: string | null | undefined, includeTime = true): string => {
    if (!dateString) return 'N/A';
    
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      
      return date.toLocaleDateString('fr-FR', options);
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Erreur';
    }
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* En-tête */}
        <div className="px-6 py-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">Gestion des utilisateurs</h2>
            <p className="mt-1 text-sm text-gray-500">
              Gérez les comptes utilisateurs, les rôles et les autorisations
            </p>
          </div>
        </div>
        {/* Barre de recherche et filtres */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Rechercher</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Rechercher par nom, email, entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-56">
              <label htmlFor="role-filter" className="sr-only">Filtrer par rôle</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <select
                  id="role-filter"
                  name="role-filter"
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.avatar_url ? (
                              <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                            ) : (
                              <span className="text-gray-600">
                                {(user.first_name?.[0] || user.last_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}`
                                : user.company_name || user.email || 'Utilisateur sans nom'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                            isProcessing[user.id] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                          disabled={isProcessing[user.id]}
                        >
                          <option value="admin">Administrateur</option>
                          <option value="moderator">Modérateur</option>
                          <option value="partner">Partenaire</option>
                          <option value="client">Client</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phone || '-'}</div>
                        <div className="text-sm text-gray-500">
                          {user.company_name || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_verified ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Vérifié
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_sign_in_at ? formatDateString(user.last_sign_in_at) : 'Jamais'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => toggleVerification(user.id, user.is_verified)}
                            disabled={isProcessing[`verify_${user.id}`]}
                            className={`p-1.5 rounded-md ${
                              user.is_verified 
                                ? 'text-yellow-600 hover:bg-yellow-100' 
                                : 'text-green-600 hover:bg-green-100'
                            } ${isProcessing[`verify_${user.id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={user.is_verified ? 'Marquer comme non vérifié' : 'Marquer comme vérifié'}
                          >
                            {isProcessing[`verify_${user.id}`] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.is_verified ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => user.email && deleteUser(user.id, user.email)}
                            disabled={isProcessing[`delete_${user.id}`]}
                            className={`p-1.5 text-red-600 rounded-md hover:bg-red-100 ${
                              isProcessing[`delete_${user.id}`] ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Supprimer l'utilisateur"
                          >
                            {isProcessing[`delete_${user.id}`] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
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
                    <ChevronLeft className="h-5 w-5" />
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
                    <ChevronRight className="h-5 w-5" />
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
