import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Car,
  Building,
  Calendar,
  MessageSquare,
  Settings,
  Menu,
  UserCheck,
  Hotel,
  Home,
  Map,
  Activity,
  Search,
  Bell,
  X,
  LogOut
} from 'lucide-react';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  role: 'admin' | 'partner' | 'client';
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const searchCache = useRef<Record<string, any[]>>({});

  // Menu items par rôle
  const getMenuItems = useCallback((): MenuItem[] => {
    const commonItems = [
      { name: 'Tableau de bord', path: `/dashboard/${role}`, icon: LayoutDashboard },
    ];

    const roleSpecificItems = {
      admin: [
        { name: 'Utilisateurs', path: '/dashboard/admin/users', icon: Users },
        { name: 'Partenaires', path: '/dashboard/admin/partners', icon: UserCheck },
        { name: 'Hôtels', path: '/dashboard/admin/hotels', icon: Hotel },
        { name: 'Appartements', path: '/dashboard/admin/appartements', icon: Building },
        { name: 'Villas', path: '/dashboard/admin/villas', icon: Home },
        { name: 'Voitures', path: '/dashboard/admin/voitures', icon: Car },
        { name: 'Circuits', path: '/dashboard/admin/circuits', icon: Map },
        { name: 'Activités', path: '/dashboard/admin/activites', icon: Activity },
        { name: 'Réservations', path: '/dashboard/admin/bookings', icon: Calendar },
        { name: 'Messages', path: '/dashboard/admin/messages', icon: MessageSquare },
        { name: 'Paramètres', path: '/dashboard/admin/parametres', icon: Settings },
      ],
      partner: [
        { name: 'Événements', path: '/dashboard/partner/evenements', icon: Activity },
        { name: 'Annonces', path: '/dashboard/partner/annonces', icon: Bell },
        { name: 'Profil', path: '/dashboard/partner/profil', icon: UserCheck },
        { name: 'Paramètres', path: '/dashboard/partner/parametres', icon: Settings },
      ],
      client: [
        { name: 'Mes Réservations', path: '/dashboard/client/reservations', icon: Calendar },
        { name: 'Profil', path: '/dashboard/client/profil', icon: UserCheck },
        { name: 'Paramètres', path: '/dashboard/client/parametres', icon: Settings }
      ]
    };

    return [...commonItems, ...(roleSpecificItems[role] || [])];
  }, [role]);

  const menuItems = getMenuItems();

  const handleSignOut = useCallback(async () => {
    try {
      // Appeler la fonction de déconnexion
      await signOut();
      
      // Rediriger vers la page d'accueil après la déconnexion
      // avec remplacement de l'historique pour éviter de revenir à la page précédente
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, rediriger quand même vers la page d'accueil
      window.location.href = '/';
    }
  }, [signOut]);

  // Fonction de recherche
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Vérifier le cache d'abord
    if (searchCache.current[query]) {
      setSearchResults(searchCache.current[query]);
      setShowSearchResults(true);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const results: any[] = [];
      const searchTerm = query.toLowerCase();

      if (role === 'admin') {
        // Recherche des utilisateurs
        const { data: users, error } = await supabase
          .from('profiles')
          .select('id, email, company_name, role')
          .or(`email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`)
          .limit(5);

        if (!error && users) {
          users.forEach(user => {
            results.push({
              id: user.id,
              type: 'user',
              title: user.company_name || user.email,
              subtitle: user.role,
              link: '/dashboard/admin/users'
            });
          });
          // Mettre en cache les résultats
          searchCache.current[query] = results;
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [role]);

  // Recherche en temps réel avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  return (
<div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-40">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="shrink-0 flex items-center px-4">
                <span className="text-xl font-bold text-emerald-600">Maroc 2030</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Icon className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={handleSignOut}
                className="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <LogOut className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-row">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="shrink-0 flex items-center px-4">
                <span className="text-xl font-bold text-emerald-600">Maroc 2030</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Icon className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={handleSignOut}
                className="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <LogOut className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center">
                <button
                  type="button"
                  className="lg:hidden text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Ouvrir le menu</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="flex items-center space-x-4">
              {/* Search bar */}
              <div className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Rechercher"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </button>
                  )}
                </div>
                {showSearchResults && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {isSearching ? (
                      <div className="px-4 py-2 text-gray-500">Recherche en cours...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <Link
                          key={`${result.type}-${result.id}`}
                          to={result.link}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                        >
                          <div className="font-medium">{result.title}</div>
                          {result.subtitle && (
                            <div className="text-xs text-gray-500">{result.subtitle}</div>
                          )}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">Aucun résultat trouvé</div>
                    )}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <span className="sr-only">Voir les notifications</span>
                  <Bell className="h-6 w-6" aria-hidden="true" />
                </button>
                {showNotifications && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Aucune nouvelle notification
                      </p>
                    </div>
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500">Aucune nouvelle notification</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <div>
                  <button
                    type="button"
                    className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  >
                    <span className="sr-only">Ouvrir le menu utilisateur</span>
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-600 font-medium">
                        {profile?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                </div>

                {profileMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <button
                      onClick={() => {
                        handleSignOut();
                        setProfileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto focus:outline-none">
            <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              {children || (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Bienvenue sur votre tableau de bord {role}</h2>
                  <p className="text-gray-600">Sélectionnez une section dans le menu de gauche pour commencer.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;