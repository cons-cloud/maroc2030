import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../config/routes';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { profile, signOut } = useAuth();

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      // Forcer un rechargement complet pour s'assurer que tous les états sont réinitialisés
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, rediriger quand même vers la page d'accueil
      window.location.href = '/';
    }
  };

  if (!profile) return null;

  // Obtenir la première lettre de l'email
  const getInitials = () => {
    const email = profile.email || '';
    return email.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton du menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-full border border-emerald-300 hover:shadow-md transition-all bg-linear-to-r from-emerald-50 to-green-50"
      >
        <div className="w-8 h-8 rounded-full bg-linear-to-r from-primary to-green-600 flex items-center justify-center text-white font-semibold text-sm">
          {getInitials()}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 py-2 z-50">
          {/* Info utilisateur */}
          <div className="px-4 py-3 border-b border-emerald-200 bg-white/50 backdrop-blur-sm">
            <p className="text-sm font-semibold text-gray-900">
              {profile.first_name} {profile.last_name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-emerald-600 font-bold" strokeWidth={2.5} />
              <p className="text-xs text-gray-700 font-medium truncate">{profile.email}</p>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              to={ROUTES.CLIENT.PROFILE}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 mr-3 text-gray-400" />
              Mon Profil
            </Link>

            <Link
              to={ROUTES.CLIENT.SETTINGS}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4 mr-3 text-gray-400" />
              Paramètres
            </Link>

            <Link
              to={ROUTES.CLIENT.BOOKINGS}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Calendar className="w-4 h-4 mr-3 text-gray-400" />
              Mes Réservations
            </Link>
          </div>

          {/* Déconnexion */}
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
