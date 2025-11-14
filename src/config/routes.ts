// Configuration des routes de l'application
export const ROUTES = {
  // Routes publiques
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/inscription',
  BECOME_HOST: '/devenir-hote',
  SERVICES: '/services',
  TOURISM: '/services/tourisme',
  CARS: '/services/voitures',
  APARTMENTS: '/services/appartements',
  VILLAS: '/services/villas',
  HOTELS: '/services/hotels',
  GUIDES: '/services/guides',
  ACTIVITIES: '/services/activites',
  EVENTS: '/evenements',
  REAL_ESTATE: '/immobilier',
  ANNOUNCEMENTS: '/annonces',
  ABOUT: '/apropos',
  CONTACT: '/contact',
  SEARCH: '/recherche',
  PAYMENT: '/paiement',
  PAYMENT_SUCCESS: '/paiement/success',
  
  // Tableau de bord administrateur
  ADMIN: {
    DASHBOARD: '/dashboard/admin',
    USERS: '/dashboard/admin/users',
    PARTNERS: '/dashboard/admin/partners',
    BOOKINGS: '/dashboard/admin/bookings',
    PAYMENTS: '/dashboard/admin/payments',
    SERVICES: '/dashboard/admin/services',
    HOTELS: '/dashboard/admin/hotels',
    APARTMENTS: '/dashboard/admin/appartements',
    VILLAS: '/dashboard/admin/villas',
    CARS: '/dashboard/admin/voitures',
    REAL_ESTATE: '/dashboard/admin/immobilier',
    TOURS: '/dashboard/admin/circuits',
    TOUR_BOOKINGS: (tourId: string) => `/dashboard/admin/circuits/${tourId}/reservations`,
    GUIDES: '/dashboard/admin/guides',
    ACTIVITIES: '/dashboard/admin/activites',
    EVENTS: '/dashboard/admin/evenements',
    ANNOUNCEMENTS: '/dashboard/admin/annonces',
    COMMISSIONS: '/dashboard/admin/commissions',
    SETTINGS: '/dashboard/admin/parametres',
  },
  
  // Tableau de bord partenaire
  PARTNER: {
    DASHBOARD: '/dashboard/partner',
    EVENTS: '/dashboard/partner/evenements',
    ANNOUNCEMENTS: '/dashboard/partner/annonces',
    PROFILE: '/dashboard/partner/profil',
    SETTINGS: '/dashboard/partner/parametres',  
  },
  
  // Tableau de bord client
  CLIENT: {
    DASHBOARD: '/dashboard/client',
    BOOKINGS: '/dashboard/client/reservations',
    PROFILE: '/dashboard/client/profil',
    SETTINGS: '/dashboard/client/parametres',
  },
} as const;

// Redirections après connexion en fonction du rôle
export const REDIRECT_AFTER_LOGIN = {
  admin: ROUTES.ADMIN.DASHBOARD,
  partner: ROUTES.PARTNER.DASHBOARD,
  client: ROUTES.CLIENT.DASHBOARD,
  default: ROUTES.HOME,
} as const;

// Chemins protégés nécessitant une authentification
export const PROTECTED_PATHS = [
  ROUTES.ADMIN.DASHBOARD,
  ROUTES.PARTNER.DASHBOARD,
  ROUTES.CLIENT.DASHBOARD,
];

// Vérifie si un chemin nécessite une authentification
export const isProtectedPath = (pathname: string): boolean => {
  return PROTECTED_PATHS.some(path => pathname.startsWith(path));
};

// Récupère la redirection appropriée en fonction du rôle de l'utilisateur
export const getRedirectPath = (userRole?: string): string => {
  if (!userRole) return ROUTES.LOGIN;
  return REDIRECT_AFTER_LOGIN[userRole as keyof typeof REDIRECT_AFTER_LOGIN] || ROUTES.HOME;
};
