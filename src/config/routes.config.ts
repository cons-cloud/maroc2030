import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import type { ReactNode } from 'react';
import React from 'react';

// Types
type RouteConfig = Omit<RouteObject, 'children' | 'element'> & {
  children?: RouteConfig[];
  role?: 'admin' | 'partner' | 'client';
  element?: ReactNode;
};

// Layouts
const PublicLayout = lazy(() => import('../components/layouts/PublicLayout'));
const DashboardLayout = lazy(() => import('../components/layouts/DashboardLayout'));

// Pages de base
const Home = lazy(() => import('../Pages/Home'));
const Login = lazy(() => import('../Pages/Login'));
const Inscription = lazy(() => import('../Pages/Inscription'));
const Services = lazy(() => import('../Pages/Services'));
const PageNotFound = lazy(() => import('../components/common/PageNotFound'));

// Tableaux de bord
const Dashboard = () => React.createElement('div', null, 'Tableau de bord');

// Fonction utilitaire pour créer des routes avec typage fort
const createRoute = (config: RouteConfig): RouteConfig => ({
  ...config,
  children: config.children?.map(child => ({
    ...child,
    role: undefined, // S'assurer que les enfants n'ont pas de rôle défini
  })),
});

// Routes publiques
export const publicRoutes: RouteConfig[] = [
  {
    path: '/',
    element: React.createElement(PublicLayout),
    children: [
      { index: true, element: React.createElement(Home) },
      { path: 'services', element: React.createElement(Services) },
      { path: 'login', element: React.createElement(Login) },
      { path: 'inscription', element: React.createElement(Inscription) },
      { path: '*', element: React.createElement(PageNotFound) },
    ],
  },
];

// Routes protégées
export const protectedRoutes: RouteConfig[] = [
  // Admin
  {
    path: '/dashboard/admin',
    element: React.createElement(DashboardLayout, { role: 'admin' }),
    children: [
      { index: true, element: React.createElement(Dashboard) },
    ],
  },
  // Partenaire
  {
    path: '/dashboard/partner',
    element: React.createElement(DashboardLayout, { role: 'partner' }),
    children: [
      { index: true, element: React.createElement(Dashboard) },
      { path: 'evenements', element: React.createElement(Dashboard) },
      { path: 'profil', element: React.createElement(Dashboard) },
    ],
  },
  // Client
  {
    path: '/dashboard/client',
    element: React.createElement(DashboardLayout, { role: 'client' }),
    children: [
      { index: true, element: React.createElement(Dashboard) },
      { path: 'reservations', element: React.createElement(Dashboard) },
      { path: 'profil', element: React.createElement(Dashboard) },
    ],
  },
];

// Redirections après connexion
export const redirectAfterLogin = {
  admin: '/dashboard/admin',
  partner: '/dashboard/partner',
  client: '/dashboard/client',
  default: '/',
};

// Chemins protégés nécessitant une authentification
export const protectedPaths = [
  '/dashboard/admin',
  '/dashboard/partner',
  '/dashboard/client',
];

// Vérifie si un chemin nécessite une authentification
export const isProtectedPath = (pathname: string): boolean => {
  return protectedPaths.some(path => pathname.startsWith(path));
};

// Récupère la redirection appropriée en fonction du rôle de l'utilisateur
export const getRedirectPath = (userRole?: string): string => {
  if (!userRole) return '/login';
  return redirectAfterLogin[userRole as keyof typeof redirectAfterLogin] || redirectAfterLogin.default;
};

// Toutes les routes
export const allRoutes: RouteConfig[] = [
  ...publicRoutes,
  ...protectedRoutes,
];

export default {
  publicRoutes,
  protectedRoutes,
  allRoutes,
  redirectAfterLogin,
  protectedPaths,
  isProtectedPath,
  getRedirectPath,
};
