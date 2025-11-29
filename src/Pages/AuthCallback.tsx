import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ROUTES } from '../config/routes';
import { useToast } from '@/components/ui/use-toast';

export const AuthCallback = () => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Traitement du callback d\'authentification...');
        
        // Récupérer la session après la redirection
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erreur lors de la récupération de la session:', sessionError);
          throw sessionError;
        }

        if (!session?.user) {
          throw new Error('Aucun utilisateur trouvé après l\'authentification');
        }

        console.log('Utilisateur connecté avec succès:', session.user.email);
        
        // Récupérer le rôle demandé depuis le stockage de session
        const roleRequested = sessionStorage.getItem('signup_role') as 'client' | 'partner' | null;
        
        // Vérifier si l'utilisateur existe déjà
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        let role: 'admin' | 'partner' | 'client' = 'client';
        
        // Si l'utilisateur n'existe pas encore, créer son profil
        if (!existingProfile || profileError?.code === 'PGRST116') {
          console.log('Création d\'un nouveau profil utilisateur...');
          
          // Déterminer le rôle (utiliser le rôle demandé ou 'client' par défaut)
          role = roleRequested === 'partner' ? 'partner' : 'client';
          
          // Créer le profil utilisateur
          const profileData = {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || '',
            avatar_url: session.user.user_metadata?.avatar_url || '',
            role: role === 'partner' ? 'partner_new' : 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([profileData]);
            
          if (insertError) {
            console.error('Erreur lors de la création du profil:', insertError);
            throw insertError;
          }
          
          console.log('Profil utilisateur créé avec succès avec le rôle:', role);
          
          // Si c'est un partenaire, envoyer une notification à l'admin
          if (role === 'partner') {
            await handleNewPartnerNotification(session.user);
          }
          
          toast.success('Inscription réussie', `Bienvenue en tant que ${role === 'partner' ? 'partenaire' : 'client'} !`);
        } else {
          // L'utilisateur existe déjà, utiliser son rôle existant
          role = existingProfile.role?.startsWith('partner') ? 'partner' : 'client';
          console.log('Utilisateur existant avec le rôle:', role);
        }
        
        // Nettoyer le stockage de session
        sessionStorage.removeItem('signup_role');
        
        // Rediriger en fonction du rôle
        const redirectPath = getRedirectPath(role);
        console.log('Redirection vers:', redirectPath);
        navigate(redirectPath, { replace: true });
        
      } catch (error) {
        console.error('Erreur lors du traitement de la connexion:', error);
        setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
        // Rediriger vers la page de connexion en cas d'erreur
        setTimeout(() => {
          navigate(ROUTES.LOGIN, { state: { error: 'Échec de la connexion avec Google' } });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // Fonction utilitaire pour déterminer le chemin de redirection
  const getRedirectPath = (role: string): string => {
    switch (role) {
      case 'admin':
        return ROUTES.ADMIN.DASHBOARD;
      case 'partner':
        return ROUTES.PARTNER.DASHBOARD;
      case 'client':
      default:
        return ROUTES.HOME;
    }
  };

  // Fonction utilitaire pour vérifier si l'email est un admin
  const isAdminEmail = (email: string | undefined): boolean => {
    if (!email) return false;
    // Implémentez votre logique de vérification d'email admin ici
    // Par exemple, vérifiez contre une liste d'emails admin
    const adminEmails = ['admin@example.com'];
    return adminEmails.includes(email);
  };
  
  // Fonction pour envoyer une notification à l'admin pour un nouveau partenaire
  const handleNewPartnerNotification = async (user: any) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          type: 'new_partner',
          user_id: user.id,
          message: `Nouveau partenaire en attente: ${user.email}`,
          metadata: {
            email: user.email,
            name: user.user_metadata?.full_name || 'Nouveau partenaire',
            created_at: new Date().toISOString()
          },
          status: 'unread'
        }]);
        
      if (error) {
        console.error('Erreur lors de la création de la notification:', error);
      } else {
        console.log('Notification de nouveau partenaire créée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur de connexion</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-gray-500">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-emerald-600 mb-4">Connexion en cours</h2>
        <p className="text-gray-700">Veuillez patienter pendant que nous vous connectons...</p>
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
