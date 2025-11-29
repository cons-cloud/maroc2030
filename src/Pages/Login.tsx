import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { MESSAGES } from '../constants/messages';
import { ROUTES } from '../config/routes';

export default function Login() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<ReactNode>('');
  const [loading, setLoading] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { signIn, signInWithGoogle, signInWithMagicLink, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { role } = await signInWithGoogle();
      handleSuccessfulLogin(role);
    } catch (error) {
      console.error('Google sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : MESSAGES.AUTH.GOOGLE_LOGIN_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicLinkEmail) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }

    try {
      setLoading(true);
      await signInWithMagicLink(magicLinkEmail);
      setMagicLinkSent(true);
      toast.success('Un lien de connexion a été envoyé à votre adresse email');
    } catch (error) {
      console.error('Magic link sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'envoi du lien de connexion';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Veuillez entrer votre adresse email pour réinitialiser votre mot de passe');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      toast.success('Un lien de réinitialisation a été envoyé à votre adresse email');
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la réinitialisation du mot de passe';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour obtenir le chemin de redirection en fonction du rôle
  const getRedirectPath = (role: string): string => {
    console.log('getRedirectPath appelé avec le rôle:', role);
    
    switch (role) {
      case 'admin':
        console.log('Redirection vers le tableau de bord admin');
        return ROUTES.ADMIN.DASHBOARD;
      case 'partner':
        console.log('Redirection vers le tableau de bord partenaire');
        return ROUTES.PARTNER.DASHBOARD;
      case 'client':
      default:
        console.log('Redirection vers la page d\'accueil (rôle client ou inconnu)');
        return ROUTES.HOME;
    }
  };

  // Fonction pour gérer la redirection après connexion réussie
  const handleSuccessfulLogin = (role: string, reservationData?: any) => {
    console.log('handleSuccessfulLogin appelé avec le rôle:', role);
    
    // Si on a des données de réservation
    if (reservationData) {
      console.log('Redirection vers la page de paiement avec des données de réservation');
      navigate(ROUTES.PAYMENT, {
        state: {
          ...reservationData,
          fromLogin: true
        }
      });
      return;
    }

    // Vérifier s'il y a une réservation en attente dans le sessionStorage
    const pendingReservation = sessionStorage.getItem('pendingReservation');
    
    if (pendingReservation) {
      try {
        console.log('Réservation en attente trouvée');
        const reservation = JSON.parse(pendingReservation);
        // Vérifier si la réservation a moins de 30 minutes
        const reservationTime = new Date(reservation.timestamp).getTime();
        const now = new Date().getTime();
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutes en millisecondes

        if (now - reservationTime < thirtyMinutes) {
          console.log('Redirection vers la page de paiement avec réservation en attente');
          // Rediriger vers la page de paiement avec les données de réservation
          navigate(ROUTES.PAYMENT, {
            state: {
              ...reservation,
              fromLogin: true
            }
          });
          return;
        } else {
          console.log('Réservation expirée');
          // Supprimer la réservation expirée
          sessionStorage.removeItem('pendingReservation');
          toast.success('Information', 'Votre session de réservation a expiré. Veuillez recommencer.');
        }
      } catch (error) {
        console.error('Erreur lors du traitement de la réservation:', error);
      }
    }

    // Redirection normale en fonction du rôle
    const redirectPath = getRedirectPath(role);
    console.log('Redirection vers:', redirectPath, 'pour le rôle:', role);
    navigate(redirectPath, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { role } = await signIn(email, password);
      
      // Récupérer les données de réservation de l'état de navigation
      const locationState = location.state as { 
        from?: string;
        fromReservation?: boolean;
        reservationData?: any;
      };

      // Si l'utilisateur venait d'une réservation
      if (locationState?.fromReservation && locationState.reservationData) {
        handleSuccessfulLogin(role, locationState.reservationData);
        return;
      }
      
      // Gestion standard de la connexion
      handleSuccessfulLogin(role);
      
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage: string | ReactNode = MESSAGES.AUTH.LOGIN_ERROR;
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = (
          <span>
            Votre compte n'a pas encore été confirmé. 
            <button 
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email,
                  });
                  if (error) throw error;
                  toast.success('Succès', 'Un nouveau lien de confirmation a été envoyé à votre adresse email');
                } catch (err) {
                  console.error('Erreur lors de l\'envoi du lien de confirmation:', err);
                  toast.error('Erreur', 'Erreur lors de l\'envoi du lien de confirmation');
                }
              }}
              className="ml-1 text-emerald-600 hover:underline"
            >
              Renvoyer le lien de confirmation
            </button>
          </span>
        );
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md relative">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {showMagicLink ? 'Connexion sans mot de passe' : 'Connexion à votre compte'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {showMagicLink ? (
              'Entrez votre email pour recevoir un lien de connexion sécurisé'
            ) : (
              <>
                Ou{' '}
                <Link
                  to={ROUTES.SIGNUP}
                  className="font-medium text-emerald-600 hover:text-emerald-500"
                >
                  créez un compte
                </Link>
              </>
            )}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {showMagicLink ? (
          <form className="mt-8 space-y-6" onSubmit={handleMagicLinkSignIn}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="magic-email" className="sr-only">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="magic-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-10 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                    placeholder="Adresse email"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    disabled={loading || magicLinkSent}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || magicLinkSent}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi en cours...' : magicLinkSent ? 'Lien envoyé !' : 'Envoyer le lien magique'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowMagicLink(false)}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
              >
                Retour à la connexion
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-10 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                    placeholder="Adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-10 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                    placeholder="Mot de passe"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="font-medium text-emerald-600 hover:text-emerald-500"
                    disabled={loading}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
          </form>
        )}

        {!showMagicLink && (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Se connecter avec Google</span>
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                <span className="ml-2">Continuer avec Google</span>
              </button>
              
              <button
                type="button"
                onClick={() => setShowMagicLink(true)}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Se connecter avec un lien magique</span>
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">Lien magique (sans mot de passe)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
