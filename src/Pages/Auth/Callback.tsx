import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../config/routes';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Vérifier si nous avons un code d'autorisation dans l'URL
        const code = searchParams.get('code');
        
        if (code) {
          // Échanger le code d'autorisation contre une session
          const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (authError) {
            throw authError;
          }
          
          // Récupérer le rôle de l'utilisateur
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session?.user.id)
            .single();
            
          // Rediriger en fonction du rôle
          if (profile) {
            switch (profile.role) {
              case 'admin':
                navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
                break;
              case 'partner':
                navigate(ROUTES.PARTNER.DASHBOARD, { replace: true });
                break;
              case 'client':
              default:
                navigate(ROUTES.CLIENT.DASHBOARD, { replace: true });
            }
          } else {
            // Si aucun profil n'existe, rediriger vers la page d'accueil
            navigate(ROUTES.HOME, { replace: true });
          }
        } else {
          // Si aucun code n'est présent, rediriger vers la page de connexion
          navigate(ROUTES.LOGIN, { replace: true });
        }
      } catch (err) {
        console.error('Erreur lors de la gestion de la redirection après connexion Google:', err);
        setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
        // Rediriger vers la page de connexion en cas d'erreur
        setTimeout(() => {
          navigate(ROUTES.LOGIN, { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur de connexion</h2>
          <p className="mb-4">{error}</p>
          <p>Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-emerald-600 mb-4">Connexion en cours...</h2>
        <p>Veuillez patienter pendant que nous vous connectons à votre compte.</p>
      </div>
    </div>
  );
}
