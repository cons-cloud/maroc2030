import { Suspense, lazy, useState } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ConfirmEmail from "./Pages/Auth/ConfirmEmail";
import { AuthCallback } from "./Pages/AuthCallback";
import ResetPassword from "./Pages/Auth/ResetPassword";
import MagicLink from "./Pages/Auth/MagicLink";
import Reauthenticate from "./Pages/Auth/Reauthenticate";
import UpdateEmail from "./Pages/Auth/UpdateEmail";
import InviteUser from "./Pages/Auth/InviteUser";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./contexts/AuthContext";
import Callback from './Pages/Auth/Callback';
import { SiteSettingsProvider } from "./contexts/SiteSettingsContext";
import { SiteContentProvider } from "./contexts/SiteContentContext";
import RoleGuard from "./components/RoleGuard";
import ErrorBoundary from "./components/ErrorBoundary";
import { ROUTES } from "./config/routes";
import { SEO } from "./components/SEO";
import CookieConsent from "./components/CookieConsent";

// Composants de pages
const DevenirHote = lazy(() => import("./Pages/DevenirHote"));

// Composants de mise en page
import DashboardLayout from './components/DashboardLayout';
import ClientPageLayout from './components/ClientPageLayout';
const Navbar = lazy(() => import("./components/Navbar"));
const Footer = lazy(() => import("./components/Footer"));
const LoadingSpinner = lazy(() => import("./components/LoadingSpinner"));
const BookingForm = lazy(() => import("./components/BookingForm"));

// Pages publiques
const Home = lazy(() => import("./Pages/Home"));
const Services = lazy(() => import("./Pages/Services"));
const Evenements = lazy(() => import("./Pages/Evenements"));
const Annonces = lazy(() => import("./Pages/Annonces"));
const Apropos = lazy(() => import("./Pages/Apropos"));
const Contact = lazy(() => import("./Pages/Contact"));
const Login = lazy(() => import("./Pages/Login"));
const Inscription = lazy(() => import("./Pages/Inscription"));
const Payment = lazy(() => import("./Pages/Payment"));
const PaymentSuccess = lazy(() => import("./Pages/PaymentSuccess"));
const Recherche = lazy(() => import("./Pages/Recherche"));
const PageNotFound = lazy(() => import("./Pages/PageNotFound"));

// Sous-pages services
const Tourisme = lazy(() => import("./Pages/services/Tourisme"));
const Voitures = lazy(() => import("./Pages/services/Voitures"));
const Appartements = lazy(() => import("./Pages/services/Appartements"));
const Villas = lazy(() => import("./Pages/services/Villas"));
const Hotels = lazy(() => import("./Pages/services/Hotels"));
const Guides = lazy(() => import("./Pages/services/Guides"));
const Activites = lazy(() => import("./Pages/services/Activites"));
const ServiceReservation = lazy(() => import("./Pages/services/ServiceReservation"));
const Immobilier = lazy(() => import("./Pages/Immobilier"));

// Tableaux de bord
const AdminDashboard = lazy(() => import("./Pages/dashboards/AdminDashboardNew"));
const PartnerDashboard = lazy(() => import("./Pages/dashboards/PartnerDashboard"));
const ClientDashboard = lazy(() => import("./Pages/dashboards/ClientDashboard"));
const ServiceForm = lazy(() => import("./Pages/dashboards/admin/ServiceForm"));
const SiteSettingsPage = lazy(() => import("./Pages/dashboards/admin/SiteSettingsPage"));
const CommissionsPage = lazy(() => import("./Pages/dashboards/admin/CommissionsPage"));

// Pages partenaire
const PartnerEvents = lazy(() => import("./Pages/dashboards/partner/PartnerEvents"));
const PartnerAnnonces = lazy(() => import("./Pages/dashboards/partner/PartnerAnnonces"));
const PartnerProfile = lazy(() => import("./Pages/dashboards/partner/PartnerProfile"));
const PartnerSettings = lazy(() => import("./Pages/dashboards/partner/PartnerSettings"));

// Client Pages
const ClientProfile = lazy(() => import("./Pages/dashboards/client/ClientProfile").then(module => ({ default: module.default })));
const ClientSettings = lazy(() => import("./Pages/dashboards/client/ClientSettings").then(module => ({ default: module.default })));
const ClientBookings = lazy(() => import("./Pages/dashboards/client/ClientBookings").then(module => ({ default: module.default })));

// Admin Pages
const UsersManagement = lazy(() => import("./Pages/dashboards/admin/UsersManagement"));
const PartnersManagement = lazy(() => import("./Pages/dashboards/admin/PartnersManagement"));
const BookingsManagement = lazy(() => import("./Pages/dashboards/admin/BookingsManagement"));
const PaymentsManagement = lazy(() => import("./Pages/dashboards/admin/PaymentsManagement"));
const ServicesManagement = lazy(() => import("./Pages/dashboards/admin/ServicesManagement"));
const MessagesManagement = lazy(() => import("./Pages/dashboards/admin/MessagesManagement"));
const AdminSettings = lazy(() => import("./Pages/dashboards/admin/AdminSettings"));
const HotelsManagement = lazy(() => import("./Pages/dashboards/admin/HotelsManagement"));
const AppartementsManagement = lazy(() => import("./Pages/dashboards/admin/AppartementsManagement"));
const VillasManagement = lazy(() => import("./Pages/dashboards/admin/VillasManagement"));
const LocationsVoituresManagement = lazy(() => import("./Pages/dashboards/admin/LocationsVoituresManagement"));
const ImmobilierManagement = lazy(() => import("./Pages/dashboards/admin/ImmobilierManagement"));
const CircuitsTouristiquesManagement = lazy(() => import("./Pages/dashboards/admin/CircuitsTouristiquesManagement"));
const CircuitBookingsManagement = lazy(() => import("./Pages/dashboards/admin/CircuitBookingsManagement"));
const ActivitesManagement = lazy(() => import("./Pages/dashboards/admin/ActivitesTouristiquesManagement"));
const EvenementsManagement = lazy(() => import("./Pages/dashboards/admin/EvenementsManagement"));
const AnnoncesManagement = lazy(() => import("./Pages/dashboards/admin/AnnoncesManagement"));
const GuidesManagement = lazy(() => import("./Pages/dashboards/admin/GuidesTouristiquesManagement"));

// Composant de chargement pour le Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

// Composant de mise en page publique
const PublicLayout = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<any>(null);

  const handleBooking = (apartment: any) => {
    setSelectedApartment(apartment);
    setIsBookingOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">
        <Outlet context={{ handleBooking }} />
      </main>
      <Footer />
      <CookieConsent />
      {isBookingOpen && selectedApartment && (
        <BookingForm 
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          service={{
            id: selectedApartment.id,
            title: selectedApartment.title,
            price: selectedApartment.price,
            images: selectedApartment.images || [],
            description: selectedApartment.description || ''
          }}
          serviceType="appartement"
        />
      )}
    </div>
  );
};

// Composant de mise en page pour l'authentification (sans navbar ni footer)
const AuthLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children || <Outlet />}
      </div>
    </div>
  );
};

// Composant de page 404 personnalisée pour les tableaux de bord
const Dashboard404 = ({ role = 'admin' }: { role?: 'admin' | 'partner' | 'client' }) => {
  const basePath = `/dashboard/${role}`;
  
  return (
    <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
      <h2 className="text-2xl font-bold text-gray-900">404 - Page non trouvée</h2>
      <p className="mt-2 text-gray-600">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <button 
        onClick={() => window.location.href = basePath}
        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
      >
        Retour au tableau de bord
      </button>
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <SEO />
      <AuthProvider>
        <SiteSettingsProvider>
          <SiteContentProvider>
            <div className="min-h-screen flex flex-col">
              <Suspense fallback={<LoadingFallback />}>
                <Toaster position="top-center" />
              
              <Routes>
                {/* Routes d'authentification - Utilisation d'un layout sans navbar ni footer */}
                <Route element={<AuthLayout />}>
                  <Route path={ROUTES.LOGIN} element={<Login />} />
                  <Route path={ROUTES.SIGNUP} element={<Inscription />} />
                  <Route path={ROUTES.BECOME_HOST} element={<DevenirHote />} />
                  <Route path={ROUTES.EMAIL_CONFIRM} element={<ConfirmEmail />} />
                  <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
                  <Route path={ROUTES.MAGIC_LINK} element={<MagicLink />} />
                  <Route path={ROUTES.REAUTHENTICATE} element={<Reauthenticate />} />
                  <Route path={ROUTES.UPDATE_EMAIL} element={<UpdateEmail />} />
                  <Route path={ROUTES.INVITE_USER} element={<InviteUser />} />
                </Route>

                {/* Routes publiques avec navbar et footer */}
                <Route element={<PublicLayout />}>
                  <Route path={ROUTES.HOME} element={
                    <Home onOpenBooking={() => {}} />
                  } />
                  
                  {/* Routes des services */}
                  <Route path={ROUTES.SERVICES} element={<Services />} />
                  <Route path={ROUTES.TOURISM} element={<Tourisme />} />
                  <Route path={ROUTES.CARS} element={<Voitures />} />
                  <Route path={ROUTES.APARTMENTS} element={<Appartements />} />
                  <Route path={ROUTES.VILLAS} element={<Villas />} />
                  <Route path={ROUTES.HOTELS} element={<Hotels />} />
                  <Route path={ROUTES.GUIDES} element={<Guides />} />
                  <Route path={ROUTES.ACTIVITIES} element={<Activites />} />
                  <Route path={ROUTES.EVENTS} element={<Evenements />} />
                  <Route path={ROUTES.EVENTS} element={<Evenements />} />
                  
                  {/* Autres pages publiques */}
                  <Route path={ROUTES.REAL_ESTATE} element={<Immobilier />} />
                  <Route path={ROUTES.ANNOUNCEMENTS} element={<Annonces />} />
                  <Route path={ROUTES.ABOUT} element={<Apropos />} />
                  <Route path={ROUTES.CONTACT} element={<Contact />} />
                  <Route path={ROUTES.SEARCH} element={<Recherche />} />
                  
                  {/* Routes de paiement */}
                  <Route path=":type/:id/reserver" element={<ServiceReservation />} />
                  <Route path={ROUTES.PAYMENT} element={<Payment />} />
                  <Route path={ROUTES.PAYMENT_SUCCESS} element={<PaymentSuccess />} />
                  
                  {/* Route de rappel pour l'authentification OAuth (Google, etc.) */}
                  <Route path="/auth/callback" element={<AuthCallback />} />
                </Route>

                {/* Tableau de bord administrateur */}
                <Route path={ROUTES.ADMIN.DASHBOARD} element={
                  <ErrorBoundary fallback={<div className="p-4 text-red-600">Erreur lors du chargement du tableau de bord administrateur</div>}>
                    <RoleGuard allowedRoles={['admin']}>
                      <DashboardLayout role="admin">
                        <Outlet />
                      </DashboardLayout>
                    </RoleGuard>
                  </ErrorBoundary>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<UsersManagement />} />
                  <Route path="partners" element={<PartnersManagement />} />
                  <Route path="bookings" element={<BookingsManagement />} />
                  <Route path="payments" element={<PaymentsManagement />} />
                  <Route path="services">
                    <Route index element={<ServicesManagement />} />
                    <Route path="new" element={<ServiceForm />} />
                    <Route path=":id/edit" element={<ServiceForm />} />
                  </Route>
                  
                  {/* Routes pour la création de services spécifiques */}
                  {/* Gestion des services */}
                  <Route path="parametres" element={
                    <ErrorBoundary fallback={<div className="p-4 text-red-600">Erreur lors du chargement des paramètres du site</div>}>
                      <SiteSettingsPage />
                    </ErrorBoundary>
                  } />
                  <Route path="voitures">
                    <Route index element={<LocationsVoituresManagement />} />
                    <Route path="new" element={<LocationsVoituresManagement />} />
                    <Route path=":id/edit" element={<LocationsVoituresManagement />} />
                  </Route>
                  <Route path="villas">
                    <Route index element={<VillasManagement />} />
                    <Route path="new" element={<VillasManagement />} />
                    <Route path=":id/edit" element={<VillasManagement />} />
                  </Route>
                  <Route path="appartements">
                    <Route index element={<AppartementsManagement />} />
                    <Route path="new" element={<AppartementsManagement />} />
                    <Route path=":id/edit" element={<AppartementsManagement />} />
                  </Route>
                  <Route path="hotels">
                    <Route index element={<HotelsManagement />} />
                    <Route path="new" element={<HotelsManagement />} />
                    <Route path=":id/edit" element={<HotelsManagement />} />
                  </Route>
                  <Route path="circuits">
                    <Route index element={<CircuitsTouristiquesManagement />} />
                    <Route path="new" element={<CircuitsTouristiquesManagement />} />
                    <Route path=":id/edit" element={<CircuitsTouristiquesManagement />} />
                    <Route path=":id/reservations" element={<CircuitBookingsManagement />} />
                  </Route>
                  <Route path="evenements">
                    <Route index element={<EvenementsManagement />} />
                    <Route path="new" element={<EvenementsManagement />} />
                    <Route path=":id/edit" element={<EvenementsManagement />} />
                  </Route>
                  <Route path="annonces">
                    <Route index element={<AnnoncesManagement />} />
                    <Route path="new" element={<AnnoncesManagement />} />
                    <Route path=":id/edit" element={<AnnoncesManagement />} />
                  </Route>
                  <Route path="immobilier" element={<ImmobilierManagement />} />
                  <Route path="commissions" element={
                    <ErrorBoundary fallback={<div className="p-4 text-red-600">Erreur lors du chargement des commissions</div>}>
                      <CommissionsPage />
                    </ErrorBoundary>
                  } />
                  <Route path="guides" element={<GuidesManagement />} />
                  <Route path="activites" element={<ActivitesManagement />} />
                  <Route path="messages" element={<MessagesManagement />} />
                  <Route path="parametres" element={<AdminSettings />} />
                  
                  {/* Page 404 pour l'admin */}
                  <Route path="*" element={<Dashboard404 role="admin" />} />
                </Route>

                {/* Tableau de bord partenaire */}
                <Route path={ROUTES.PARTNER.DASHBOARD} element={
                  <RoleGuard allowedRoles={['partner', 'admin']}>
                    <DashboardLayout role="partner">
                      <Outlet />
                    </DashboardLayout>
                  </RoleGuard>
                }>
                  <Route index element={<PartnerDashboard />} />
                  <Route path="evenements" element={<PartnerEvents />} />
                  <Route path="annonces" element={<PartnerAnnonces />} />
                  <Route path="profil" element={<PartnerProfile />} />
                  <Route path="parametres" element={<PartnerSettings />} />
                  
                  {/* Page 404 pour le partenaire */}
                  <Route path="*" element={<Dashboard404 role="partner" />} />
                </Route>
                
                {/* Tableau de bord client */}
                <Route path="dashboard/client" element={
                  <RoleGuard allowedRoles={['client', 'partner', 'admin']}>
                    <ErrorBoundary fallback={
                      <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center p-6 bg-white rounded-lg shadow-md">
                          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h2>
                          <p className="mb-4">Une erreur est survenue lors du chargement du tableau de bord client.</p>
                          <button 
                            onClick={() => window.location.reload()} 
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Réessayer
                          </button>
                        </div>
                      </div>
                    }>
                      <ClientPageLayout>
                        <Outlet />
                      </ClientPageLayout>
                    </ErrorBoundary>
                  </RoleGuard>
                }>
                  <Route index element={<ClientDashboard />} />
                  <Route path="profil" element={<ClientProfile />} />
                  <Route path="parametres" element={<ClientSettings />} />
                  <Route path="reservations" element={<ClientBookings />} />
                  <Route path="*" element={<Dashboard404 role="client" />} />
                </Route>

                {/* Route de callback pour l'authentification OAuth */}
                <Route path="/auth/callback" element={<Callback />} />
                
                {/* Redirection des anciennes URLs */}
                <Route path="/dashboard" element={<Navigate to={ROUTES.HOME} replace />} />
                <Route path="/admin" element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
                <Route path="/partner" element={<Navigate to={ROUTES.PARTNER.DASHBOARD} replace />} />
                <Route path="/client" element={<Navigate to={ROUTES.CLIENT.DASHBOARD} replace />} />

                {/* Page 404 globale */}
                <Route path="*" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <PageNotFound />
                    <Footer />
                  </div>
                } />
              </Routes>
            </Suspense>
          </div>
        </SiteContentProvider>
      </SiteSettingsProvider>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
