import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../config/routes';
import { useToast } from '@/components/ui/use-toast';

export default function ConfirmEmail() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token_hash') || searchParams.get('token');
      const type = searchParams.get('type');
      
      if (token && type === 'signup') {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup',
            email: searchParams.get('email') || undefined
          });
          
          if (error) throw error;
          
          toast.success('Succès', 'Votre email a été confirmé avec succès !');
          
          // Rediriger vers la page de connexion après un court délai
          setTimeout(() => {
            navigate(ROUTES.LOGIN, { 
              state: { 
                message: 'Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.'
              } 
            });
          }, 2000);
          
        } catch (error: any) {
          console.error('Erreur lors de la confirmation:', error);
          toast.error('Erreur', error.message || 'Une erreur est survenue lors de la confirmation');
          
          setTimeout(() => {
            navigate(ROUTES.LOGIN, { 
              state: { 
                error: 'Le lien de confirmation est invalide ou a expiré.' 
              } 
            });
          }, 2000);
        }
      } else {
        navigate(ROUTES.HOME);
      }
    };

    confirmEmail();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 to-green-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500 border-t-emerald-500 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-emerald-700 mb-2">Traitement en cours</h2>
        <p className="text-gray-600 mb-6">Veuillez patienter pendant que nous confirmons votre adresse email...</p>
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
