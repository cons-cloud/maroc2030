import React from 'react';
import { Link, useLocation } from 'react-router-dom';

type SidebarProps = {
  role?: 'admin' | 'partner' | 'client';
};

const Sidebar: React.FC<SidebarProps> = ({ role = 'client' }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-50 text-blue-600' : 'text-gray-700';
  };

  const adminLinks = [
    { to: '/dashboard/admin', label: 'Tableau de bord', icon: 'dashboard' },
    { to: '/dashboard/admin/users', label: 'Utilisateurs', icon: 'people' },
    { to: '/dashboard/admin/services', label: 'Services', icon: 'business' },
  ];

  const partnerLinks = [
    { to: '/dashboard/partner', label: 'Tableau de bord', icon: 'dashboard' },
    { to: '/dashboard/partner/services', label: 'Mes services', icon: 'business' },
    { to: '/dashboard/partner/bookings', label: 'Réservations', icon: 'event' },
    { to: '/dashboard/partner/profile', label: 'Profil', icon: 'person' },
  ];

  const clientLinks = [
    { to: '/dashboard/client', label: 'Tableau de bord', icon: 'dashboard' },
    { to: '/dashboard/client/bookings', label: 'Mes réservations', icon: 'event' },
    { to: '/dashboard/client/favorites', label: 'Favoris', icon: 'favorite' },
    { to: '/dashboard/client/profile', label: 'Profil', icon: 'person' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'partner' ? partnerLinks : clientLinks;

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          {role === 'admin' ? 'Administration' : role === 'partner' ? 'Espace Pro' : 'Mon Espace'}
        </h2>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(link.to)} hover:bg-gray-100`}
              >
                <span className="material-icons-outlined mr-3">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
