import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import React from 'react';

// Types
type RouteConfig = Omit<RouteObject, 'children'> & {
  children?: RouteConfig[];
  role?: string;
};

// Layouts
const PublicLayout = lazy(() => import('../layouts/PublicLayout'));
const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'));

// Pages publiques
const Home = lazy(() => import('../Pages/Home'));
const Login = lazy(() => import('../Pages/Login'));
const Inscription = lazy(() => import('../Pages/Inscription'));
const Services = lazy(() => import('../Pages/Services'));
const Tourisme = lazy(() => import('../Pages/Tourisme'));
const Voitures = lazy(() => import('../Pages/Voitures'));
const Appartements = lazy(() => import('../Pages/Appartements'));
const Villas = lazy(() => import('../Pages/Villas'));
const Hotels = lazy(() => import('../Pages/Hotels'));
const Guides = lazy(() => import('../Pages/Guides'));
const Activites = lazy(() => import('../Pages/Activites'));
const Evenements = lazy(() => import('../Pages/Evenements'));
const Immobilier = lazy(() => import('../Pages/Immobilier'));
const Annonces = lazy(() => import('../Pages/Annonces'));
const Apropos = lazy(() => import('../Pages/Apropos'));
const Contact = lazy(() => import('../Pages/Contact'));
const Recherche = lazy(() => import('../Pages/Recherche'));
const PageNotFound = lazy(() => import('../components/PageNotFound'));

// Tableaux de bord
// Admin
const AdminDashboard = lazy(() => import('../Pages/dashboards/admin/AdminDashboard'));
const UsersManagement = lazy(() => import('../Pages/dashboards/admin/UsersManagement'));
const PartnersManagement = lazy(() => import('../Pages/dashboards/admin/PartnersManagement'));
const BookingsManagement = lazy(() => import('../Pages/dashboards/admin/BookingsManagement'));
const PaymentsManagement = lazy(() => import('../Pages/dashboards/admin/PaymentsManagement'));
const ServicesManagement = lazy(() => import('../Pages/dashboards/admin/ServicesManagement'));
const MessagesManagement = lazy(() => import('../Pages/dashboards/admin/MessagesManagement'));

// Partenaire
const PartnerDashboard = lazy(() => import('../Pages/dashboards/partner/PartnerDashboard'));
const PartnerEvents = lazy(() => import('../Pages/dashboards/partner/PartnerEvents'));
const PartnerAnnonces = lazy(() => import('../Pages/dashboards/partner/PartnerAnnonces'));
const PartnerProfile = lazy(() => import('../Pages/dashboards/partner/PartnerProfile'));
const PartnerSettings = lazy(() => import('../Pages/dashboards/partner/PartnerSettings'));

// Client
const ClientDashboard = lazy(() => import('../Pages/dashboards/client/ClientDashboard'));
const ClientBookings = lazy(() => import('../Pages/dashboards/client/ClientBookings'));
const ClientProfile = lazy(() => import('../Pages/dashboards/client/ClientProfile'));
const ClientSettings = lazy(() => import('../Pages/dashboards/client/ClientSettings'));

// Fonction utilitaire pour créer des routes avec typage fort
const createRoute = (config: RouteConfig): RouteConfig => config;

// Routes publiques
export const publicRoutes: RouteConfig[] = [
  createRoute({
    path: '/',
    element: React.createElement(PublicLayout),
    children: [
      createRoute({ path: '/', element: React.createElement(Home) }),
      createRoute({ path: '/services', element: React.createElement(Services) }),
      createRoute({ path: '/services/tourisme', element: React.createElement(Tourisme) }),
      createRoute({ path: '/services/voitures', element: React.createElement(Voitures) }),
      createRoute({ path: '/services/appartements', element: React.createElement(Appartements) }),
      createRoute({ path: '/services/villas', element: React.createElement(Villas) }),
      createRoute({ path: '/services/hotels', element: React.createElement(Hotels) }),
      createRoute({ path: '/services/guides', element: React.createElement(Guides) }),
      createRoute({ path: '/services/activites', element: React.createElement(Activites) }),
      createRoute({ path: '/services/evenements', element: React.createElement(Evenements) }),
      createRoute({ path: '/immobilier', element: React.createElement(Immobilier) }),
      createRoute({ path: '/evenements', element: React.createElement(Evenements) }),
      createRoute({ path: '/annonces', element: React.createElement(Annonces) }),
      createRoute({ path: '/apropos', element: React.createElement(Apropos) }),
      createRoute({ path: '/contact', element: React.createElement(Contact) }),
      createRoute({ path: '/recherche', element: React.createElement(Recherche) }),
      createRoute({ path: '/login', element: React.createElement(Login) }),
      createRoute({ path: '/inscription', element: React.createElement(Inscription) }),
      createRoute({ path: '*', element: React.createElement(PageNotFound) }),
    ],
  }),
];

// Routes administrateur
export const adminRoutes: RouteConfig[] = [
  createRoute({
    path: '/dashboard/admin',
    element: React.createElement(DashboardLayout, { role: 'admin' }),
    role: 'admin',
    children: [
      createRoute({ path: '', element: React.createElement(AdminDashboard) }),
      createRoute({ path: 'users', element: React.createElement(UsersManagement) }),
      createRoute({ path: 'partners', element: React.createElement(PartnersManagement) }),
      createRoute({ path: 'bookings', element: React.createElement(BookingsManagement) }),
      createRoute({ path: 'messages', element: React.createElement(MessagesManagement) }),
      createRoute({ path: 'payments', element: React.createElement(PaymentsManagement) }),
      createRoute({ path: 'services', element: React.createElement(ServicesManagement) }),
      createRoute({ 
        path: '*',
        element: React.createElement('div', { className: 'p-4 text-center' },
          React.createElement('h2', { className: 'text-xl font-bold' }, "Page d'administration non trouvée")
        )
      }),
    ],
  }),
];

// Routes partenaire
export const partnerRoutes: RouteConfig[] = [
  createRoute({
    path: '/dashboard/partner',
    element: React.createElement(DashboardLayout, { role: 'partner' }),
    role: 'partner',
    children: [
      createRoute({ path: '', element: React.createElement(PartnerDashboard) }),
      createRoute({ path: 'evenements', element: React.createElement(PartnerEvents) }),
      createRoute({ path: 'annonces', element: React.createElement(PartnerAnnonces) }),
      createRoute({ path: 'profil', element: React.createElement(PartnerProfile) }),
      createRoute({ path: 'parametres', element: React.createElement(PartnerSettings) }),
      createRoute({
        path: '*',
        element: React.createElement('div', { className: 'p-4 text-center' },
          React.createElement('h2', { className: 'text-xl font-bold' }, 'Page partenaire non trouvée')
        )
      }),
    ],
  }),
];

// Routes client
export const clientRoutes: RouteConfig[] = [
  createRoute({
    path: '/dashboard/client',
    element: React.createElement(DashboardLayout, { role: 'client' }),
    role: 'client',
    children: [
      createRoute({ path: '', element: React.createElement(ClientDashboard) }),
      createRoute({ path: 'reservations', element: React.createElement(ClientBookings) }),
      createRoute({ path: 'profil', element: React.createElement(ClientProfile) }),
      createRoute({ path: 'parametres', element: React.createElement(ClientSettings) }),
      createRoute({
        path: '*',
        element: React.createElement('div', { className: 'p-4 text-center' },
          React.createElement('h2', { className: 'text-xl font-bold' }, 'Page client non trouvée')
        )
      }),
    ],
  }),
];

// Redirections après connexion
export const redirectAfterLogin: Record<string, string> = {
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
  return redirectAfterLogin[userRole] || redirectAfterLogin.default;
};

// Exporte toutes les routes combinées
export const allRoutes: RouteConfig[] = [
  ...publicRoutes,
  ...adminRoutes,
  ...partnerRoutes,
  ...clientRoutes,
];

export default {
  publicRoutes,
  adminRoutes,
  partnerRoutes,
  clientRoutes,
  allRoutes,
  redirectAfterLogin,
  protectedPaths,
  isProtectedPath,
  getRedirectPath,
};
