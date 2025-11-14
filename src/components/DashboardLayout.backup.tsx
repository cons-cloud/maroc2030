import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Car,
  Building,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Home,
  FileText,
  Image,
  CreditCard,
  BarChart3,
  UserCog,
  Hotel,
  Building2,
  Map,
  UserCheck,
  Activity,
  Megaphone,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'partner' | 'client';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Charger les notifications
  useEffect(() => {
    loadNotifications();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [role, profile]);

  const loadNotifications = async () => {
    try {
      let notificationsList: any[] = [];
      
      if (role === 'admin') {
        // Messages non lus pour admin
        const { data: messages, error: msgError } = await supabase
          .from('contact_messages')
          .select('*')
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!msgError && messages) {
          notificationsList = messages.map(msg => ({
            id: msg.id,
            type: 'message',
            title: 'Nouveau message de contact',
            description: `De: ${msg.name}`,
            time: msg.created_at,
            link: '/dashboard/admin/messages'
          }));
        }
      } else if (role === 'partner') {
        // Réservations en attente pour partenaire
        const { data: bookings, error: bookError } = await supabase
          .from('bookings')
          .select('*')
          .eq('partner_id', profile?.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!bookError && bookings) {
          notificationsList = bookings.map(booking => ({
            id: booking.id,
            type: 'booking',
            title: 'Nouvelle réservation',
            description: `Réservation #${booking.id.slice(0, 8)}`,
            time: booking.created_at,
            link: '/dashboard/partner/bookings'
          }));
        }
      }
      
      setNotifications(notificationsList);
      setUnreadMessagesCount(notificationsList.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Fonction de recherche
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const results: any[] = [];
      const searchTerm = query.toLowerCase();

      if (role === 'admin') {
        // Rechercher dans les utilisateurs
        const { data: users } = await supabase
          .from('profiles')
          .select('id, email, company_name, role')
          .or(`email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`)
          .limit(5);

        if (users) {
          users.forEach(user => {
            results.push({
              id: user.id,
              type: 'user',
              title: user.company_name || user.email,
              subtitle: user.role,
              link: '/dashboard/admin/users'
            });
          });
        }

        // Rechercher dans les messages
        const { data: messages } = await supabase
          .from('contact_messages')
          .select('id, name, email, subject')
          .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`)
          .limit(5);

        if (messages) {
          messages.forEach(msg => {
            results.push({
              id: msg.id,
              type: 'message',
              title: msg.subject || 'Message sans sujet',
              subtitle: `De: ${msg.name}`,
              link: '/dashboard/admin/messages'
            });
          });
        }
      } else if (role === 'partner') {
        // Rechercher dans les réservations du partenaire
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id, service_name, client_name, status')
          .eq('partner_id', profile?.id)
          .or(`service_name.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%`)
          .limit(5);

        if (bookings) {
          bookings.forEach(booking => {
            results.push({
              id: booking.id,
              type: 'booking',
              title: booking.service_name || 'Service',
              subtitle: `Client: ${booking.client_name || 'N/A'} - ${booking.status}`,
              link: '/dashboard/partner/bookings'
            });
          });
        }

        // Rechercher dans les événements du partenaire
        const { data: events } = await supabase
          .from('events')
          .select('id, title, location')
          .eq('partner_id', profile?.id)
          .ilike('title', `%${searchTerm}%`)
          .limit(5);

        if (events) {
          events.forEach(event => {
            results.push({
              id: event.id,
              type: 'event',
              title: event.title,
              subtitle: event.location,
              link: '/dashboard/partner/events'
            });
          });
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

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
  }, [searchQuery, role, profile]);

  // Menu items selon le rôle
  const getMenuItems = () => {
    if (role === 'admin') {
      return [
        { name: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard/admin' },
        { name: 'Utilisateurs', icon: Users, path: '/dashboard/admin/users' },
        { name: 'Partenaires', icon: UserCog, path: '/dashboard/admin/partners' },
        
        // HÉBERGEMENT
        { name: 'Hôtels', icon: Hotel, path: '/dashboard/admin/hotels' },
        { name: 'Appartements', icon: Building, path: '/dashboard/admin/appartements' },
        { name: 'Villas', icon: Home, path: '/dashboard/admin/villas' },
        
        // TRANSPORT & IMMOBILIER
        { name: 'Voitures', icon: Car, path: '/dashboard/admin/voitures' },
        { name: 'Immobilier', icon: Building2, path: '/dashboard/admin/immobilier' },
        
        // TOURISME
        { name: 'Circuits', icon: Map, path: '/dashboard/admin/circuits' },
        { name: 'Guides', icon: UserCheck, path: '/dashboard/admin/guides' },
        { name: 'Activités', icon: Activity, path: '/dashboard/admin/activites' },
        
        // ÉVÉNEMENTS & ANNONCES
        { name: 'Événements', icon: Calendar, path: '/dashboard/admin/evenements' },
        { name: 'Annonces', icon: Megaphone, path: '/dashboard/admin/annonces' },
        
        // GESTION
        { name: 'Réservations', icon: Calendar, path: '/dashboard/admin/bookings' },
        { name: 'Paiements', icon: CreditCard, path: '/dashboard/admin/payments' },
        { name: 'Messages', icon: MessageSquare, path: '/dashboard/admin/messages' },
        { name: 'Contenu du Site', icon: Image, path: '/dashboard/admin/site-content' },
        { name: 'Paramètres', icon: Settings, path: '/dashboard/admin/settings' },
      ];
    } else if (role === 'partner') {
      return [
        { name: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard/partner' },
        { name: 'Mes Services', icon: Package, path: '/dashboard/partner/services' },
        { name: 'Voitures', icon: Car, path: '/dashboard/partner/cars' },
        { name: 'Propriétés', icon: Building, path: '/dashboard/partner/properties' },
        { name: 'Circuits', icon: Calendar, path: '/dashboard/partner/tours' },
        { name: 'Événements', icon: Calendar, path: '/dashboard/partner/events' },
        { name: 'Annonces', icon: Megaphone, path: '/dashboard/partner/annonces' },
        { name: 'Réservations', icon: Calendar, path: '/dashboard/partner/bookings' },
        { name: 'Statistiques', icon: BarChart3, path: '/dashboard/partner/stats' },
        { name: 'Profil', icon: Settings, path: '/dashboard/partner/profile' },
      ];
    } else {
      return [
        { name: 'Accueil', icon: Home, path: '/' },
        { name: 'Mes Réservations', icon: Calendar, path: '/dashboard/client/bookings' },
        { name: 'Mes Paiements', icon: CreditCard, path: '/dashboard/client/payments' },
        { name: 'Favoris', icon: Package, path: '/dashboard/client/favorites' },
        { name: 'Mon Profil', icon: Settings, path: '/dashboard/client/profile' },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      {/* Sidebar pour mobile */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div
          className="fixed inset-0 bg-emerald-800 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-gradient-to-b from-emerald-50 to-green-50">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <span className="text-xl font-bold text-emerald-600">Maroc 2030</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700 font-semibold'
                      : 'text-emerald-800 hover:bg-emerald-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar pour desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-gradient-to-b from-emerald-50 to-green-50 border-r">
          <div className="flex items-center h-16 px-4 border-b">
            <span className="text-xl font-bold text-emerald-600">Maroc 2030</span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700 font-semibold'
                      : 'text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-emerald-200">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64 flex flex-col flex-1 bg-gradient-to-br from-emerald-50 to-green-50">
        {/* Header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-gradient-to-r from-emerald-100 to-green-100 shadow">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-emerald-600 hover:text-emerald-800"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 flex items-center justify-center lg:justify-start">
              <div className="w-full max-w-lg lg:max-w-xs">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-emerald-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                    className="block w-full pl-10 pr-3 py-2 border border-emerald-300 rounded-lg leading-5 bg-white/50 backdrop-blur-sm placeholder-emerald-400 focus:outline-none focus:placeholder-emerald-300 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Rechercher..."
                  />
                  
                  {/* Dropdown des résultats de recherche */}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-emerald-50/90 backdrop-blur-sm rounded-lg shadow-xl border border-emerald-200 z-50 max-h-96 overflow-y-auto">
                      {isSearching ? (
                        <div className="px-4 py-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                          <p className="text-sm text-emerald-600 mt-2">Recherche en cours...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="py-2">
                          <div className="px-4 py-2 border-b border-emerald-100">
                            <p className="text-xs font-semibold text-emerald-600 uppercase">
                              {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                            </p>
                          </div>
                          {searchResults.map((result) => (
                            <Link
                              key={`${result.type}-${result.id}`}
                              to={result.link}
                              onClick={() => {
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                              className="block px-4 py-3 hover:bg-emerald-50 transition border-b border-emerald-100 last:border-0"
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  {result.type === 'user' && <Users className="h-5 w-5 text-emerald-500" />}
                                  {result.type === 'message' && <MessageSquare className="h-5 w-5 text-green-500" />}
                                  {result.type === 'booking' && <Calendar className="h-5 w-5 text-purple-500" />}
                                  {result.type === 'event' && <Calendar className="h-5 w-5 text-orange-500" />}
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                  <p className="text-sm font-medium text-emerald-900 truncate">
                                    {result.title}
                                  </p>
                                  <p className="text-xs text-emerald-600 truncate">
                                    {result.subtitle}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : searchQuery ? (
                        <div className="px-4 py-8 text-center">
                          <Search className="h-12 w-12 text-emerald-200 mx-auto mb-2" />
                          <p className="text-sm text-emerald-600">Aucun résultat pour "{searchQuery}"</p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-gray-500 transition"
                >
                  <Bell className="h-6 w-6" />
                  {unreadMessagesCount > 0 && (
                    <>
                      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </span>
                    </>
                  )}
                </button>

                {/* Dropdown des notifications */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      {unreadMessagesCount > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {unreadMessagesCount} nouveau{unreadMessagesCount > 1 ? 'x' : ''} message{unreadMessagesCount > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            to={notif.link}
                            onClick={() => setShowNotifications(false)}
                            className="block px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                {notif.type === 'message' ? (
                                  <MessageSquare className="h-6 w-6 text-emerald-500" />
                                ) : (
                                  <Calendar className="h-6 w-6 text-green-500" />
                                )}
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notif.description}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notif.time).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Aucune notification</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-2">
                        <Link
                          to={role === 'admin' ? '/dashboard/admin/messages' : '/dashboard/partner/bookings'}
                          onClick={() => setShowNotifications(false)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Voir tout →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center text-white font-medium">
                    {profile?.company_name?.[0] || profile?.role?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {profile?.company_name || profile?.role || 'Utilisateur'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    {/* Profil uniquement pour client et partenaire */}
                    {role !== 'admin' && (
                      <Link
                        to={`/dashboard/${role}/profile`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Mon Profil
                      </Link>
                    )}
                    <Link
                      to={`/dashboard/${role}/settings`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Paramètres
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <main className="py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
