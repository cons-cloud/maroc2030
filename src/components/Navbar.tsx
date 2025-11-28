import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { Menu, X, ChevronDown, Compass, Car, Building2, Home, Hotel, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';

interface NavLink {
  name: string;
  path?: string;
  submenu?: Array<{ name: string; path: string }>;
}

interface NavbarProps {
  // Propriétés du composant
}

const Navbar: React.FC<NavbarProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [servicesOpen, setServicesOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = (): void => setIsOpen(!isOpen);
  
  // Handle navigation for programmatic navigation if needed
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setServicesOpen(false);
  };
  
  const toggleServices = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setServicesOpen(!servicesOpen);
  };

  // Fermer le menu déroulant quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node) && 
          servicesButtonRef.current && !servicesButtonRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsOpen(false);
    setServicesOpen(false);
  }, [location]);

  const serviceIcons: { [key: string]: any } = {
    'Tourisme': Compass,
    'Location de voitures': Car,
    'Appartements': Building2,
    'Villas': Home,
    'Hôtels': Hotel,
  };

  const serviceColors: { [key: string]: string } = {
    'Tourisme': 'from-emerald-500 to-cyan-500',
    'Location de voitures': 'from-purple-500 to-pink-500',
    'Appartements': 'from-orange-500 to-red-500',
    'Villas': 'from-green-500 to-emerald-500',
    'Hôtels': 'from-indigo-500 to-green-500',
  };

  const navLinks: NavLink[] = [
    { name: 'Accueil', path: '/' },
    {
      name: 'Services',
      submenu: [
        { name: 'Tourisme', path: '/services/tourisme' },
        { name: 'Location de voitures', path: '/services/voitures' },
        { name: 'Appartements', path: '/services/appartements' },
        { name: 'Villas', path: '/services/villas' },
        { name: 'Hôtels', path: '/services/hotels' },
      ],
    },
    { name: 'Événements', path: '/evenements' },
    { name: 'Annonces', path: '/annonces' },
    { name: 'À propos', path: '/apropos' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-green-500 shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo à gauche */}
          <div className="flex items-center">
            <Link to="/" className="shrink-0 flex items-center p-0">
              <h1 className="text-primary m-0 text-xl font-bold" style={{ fontSize: '1.6rem' }}>
                <i className="fa fa-map-marker-alt mr-2"></i>2030Maroc
              </h1>
            </Link>
          </div>
          
          {/* Conteneur pour la navigation et le sélecteur de langue */}
          <div className="flex items-center">
            {/* Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((item) => (
              <div key={item.name} className="relative">
                {item.submenu ? (
                  <div className="relative" ref={servicesRef}>
                    <button
                      ref={item.name === 'Services' ? servicesButtonRef : null}
                      onClick={toggleServices}
                      className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    >
                      {item.name}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${servicesOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    {servicesOpen && (
                      <div className="absolute left-0 mt-2 w-72 rounded-xl shadow-2xl bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 ring-1 ring-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-lg">
                        <div className="p-2">
                          {item.submenu.map((subItem) => {
                            const Icon = serviceIcons[subItem.name];
                            const gradientColor = serviceColors[subItem.name];
                            return (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                className="group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
                              >
                                <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br ${gradientColor} shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-transform duration-200`}>
                                  {Icon && <Icon className="w-5 h-5 text-white" />}
                                </div>
                                <span className="group-hover:text-white transition-all duration-200">
                                  {subItem.name}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                        <div className="bg-linear-to-r from-green-500/20 to-green-500/20 px-4 py-3 border-t border-gray-700/50 backdrop-blur-sm">
                          <p className="text-xs text-gray-300 text-center font-medium">
                            Découvrez tous nos services exceptionnels
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path || '#'}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.path
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            {profile && profile.role === 'client' ? (
              <div className="ml-4">
                <UserMenu />
              </div>
            ) : (
              <Link
                to={ROUTES.BECOME_HOST}
                className="ml-4 bg-linear-to-r from-emerald-600 to-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Devenir hôte</span>
              </Link>
            )}
            </div>
            
            {/* Espace pour d'éventuels éléments supplémentaires */}
          </div>

          {/* Bouton menu mobile */}
          <div className="flex items-center md:hidden">
            {profile && profile.role === 'client' ? (
              <div className="mr-2">
                <UserMenu />
              </div>
            ) : (
              <Link
                to={ROUTES.BECOME_HOST}
                className="mr-4 bg-linear-to-r from-emerald-600 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Devenir hôte</span>
              </Link>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          {/* Affichage de l'avatar utilisateur si connecté */}
          {profile && (
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {profile.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.first_name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[180px]">
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((item) => (
              <div key={item.name} className="px-2">
                {item.submenu ? (
                  <div>
                    <button
                      onClick={toggleServices}
                      className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                    >
                      {item.name}
                      <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    {servicesOpen && (
                      <div className="pl-2 py-2 space-y-2">
                        {item.submenu.map((subItem) => {
                          const Icon = serviceIcons[subItem.name];
                          const gradientColor = serviceColors[subItem.name];
                          return (
                            <button
                              key={subItem.path}
                              onClick={() => handleNavigation(subItem.path)}
                              className="group flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-linear-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200"
                            >
                              <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br ${gradientColor} shadow-sm`}>
                                {Icon && <Icon className="w-4 h-4 text-white" />}
                              </div>
                              <span className="group-hover:text-gray-900">
                                {subItem.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => item.path && handleNavigation(item.path)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === item.path
                        ? 'text-primary bg-gray-50'
                        : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
