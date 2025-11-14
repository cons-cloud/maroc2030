import { lazy } from 'react';

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

export const publicRoutes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/services', element: <Services /> },
      { path: '/services/tourisme', element: <Tourisme /> },
      { path: '/services/voitures', element: <Voitures /> },
      { path: '/services/appartements', element: <Appartements /> },
      { path: '/services/villas', element: <Villas /> },
      { path: '/services/hotels', element: <Hotels /> },
      { path: '/services/guides', element: <Guides /> },
      { path: '/services/activites', element: <Activites /> },
      { path: '/services/evenements', element: <Evenements /> },
      { path: '/immobilier', element: <Immobilier /> },
      { path: '/evenements', element: <Evenements /> },
      { path: '/annonces', element: <Annonces /> },
      { path: '/apropos', element: <Apropos /> },
      { path: '/contact', element: <Contact /> },
      { path: '/recherche', element: <Recherche /> },
      { path: '/login', element: <Login /> },
      { path: '/inscription', element: <Inscription /> },
      { path: '*', element: <PageNotFound /> },
    ],
  },
];

export const adminRoutes = [
  {
    path: '/dashboard/admin',
    element: <DashboardLayout role="admin" />,
    children: [
      { path: '', element: <AdminDashboard /> },
      { path: 'users', element: <UsersManagement /> },
      { path: 'partners', element: <PartnersManagement /> },
      { path: 'bookings', element: <BookingsManagement /> },
      { path: 'messages', element: <MessagesManagement /> },
      { path: 'payments', element: <PaymentsManagement /> },
      { path: 'services', element: <ServicesManagement /> },
      { path: '*', element: <div>Page d'administration non trouvée</div> },
    ],
  },
];

export const partnerRoutes = [
  {
    path: '/dashboard/partner',
    element: <DashboardLayout role="partner" />,
    children: [
      { path: '', element: <PartnerDashboard /> },
      { path: 'evenements', element: <PartnerEvents /> },
      { path: 'annonces', element: <PartnerAnnonces /> },
      { path: 'profil', element: <PartnerProfile /> },
      { path: 'parametres', element: <PartnerSettings /> },
      { path: '*', element: <div>Page partenaire non trouvée</div> },
    ],
  },
];

export const clientRoutes = [
  {
    path: '/dashboard/client',
    element: <DashboardLayout role="client" />,
    children: [
      { path: '', element: <ClientDashboard /> },
      { path: 'reservations', element: <ClientBookings /> },
      { path: 'profil', element: <ClientProfile /> },
      { path: 'parametres', element: <ClientSettings /> },
      { path: '*', element: <div>Page client non trouvée</div> },
    ],
  },
];

// Redirections après connexion
// Les clés doivent correspondre aux rôles renvoyés par votre système d'authentification
export const redirectAfterLogin = {
  admin: '/dashboard/admin',
  partner: '/dashboard/partner',
  client: '/dashboard/client',
  default: '/',
} as const;

// Chemins protégés nécessitant une authentification
export const protectedPaths = [
  '/dashboard',
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

export default {
  publicRoutes,
  adminRoutes,
  partnerRoutes,
  clientRoutes,
  redirectAfterLogin,
  protectedPaths,
  isProtectedPath,
  getRedirectPath,
};
