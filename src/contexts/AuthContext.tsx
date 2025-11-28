import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { validatePassword } from '../utils/validation';
import { isAdminEmail } from '../config/admins';
import { ROUTES } from '../config/routes';
import { getAuthRedirectUrl } from '../utils/authLinks';
import { 
  setAuthCookie, 
  getAuthCookie, 
  removeAuthCookie, 
  setUserData, 
  getUserData,
  clearAllAuthCookies,
  hasConsent,
  initializeServices,
  areCookiesEnabled
} from '../utils/cookieManager';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<{ role: 'client' }>;
  signIn: (email: string, password: string) => Promise<{ role: 'admin' | 'partner' | 'client' }>;
  signInWithGoogle: () => Promise<{ role: 'admin' | 'partner' | 'client' }>;
  signInWithMagicLink: (email: string) => Promise<{ success: boolean }>;
  resetPassword: (email: string) => Promise<{ success: boolean }>;
  updateEmail: (newEmail: string, password: string) => Promise<{ success: boolean }>;
  inviteUser: (email: string, role: string) => Promise<{ success: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  isAdmin: boolean;
  requireReauthentication: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      setUserData(data);
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      throw error;
    }
  }, []);

  // Gestion des changements d'état d'authentification
  useEffect(() => {
    // Vérifier si les cookies sont activés
    if (!areCookiesEnabled()) {
      console.warn('Les cookies sont désactivés. Certaines fonctionnalités pourraient ne pas fonctionner correctement.');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            // Mettre à jour les cookies d'authentification uniquement si l'utilisateur a donné son consentement
            if (hasConsent('necessary')) {
              setAuthCookie(session.access_token, session.expires_in);
              setUserData(session.user);
            }
            
            // Charger le profil utilisateur
            await loadProfile(session.user.id);
            
            // Initialiser les services tiers en fonction des préférences
            initializeServices();
          } catch (error) {
            console.error('Erreur lors de la mise à jour de la session:', error);
          }
        } else {
          // Nettoyer les cookies en cas de déconnexion
          clearAllAuthCookies();
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // Vérifier si une session est déjà active au chargement
    const checkSession = async () => {
      try {
        // Vérifier d'abord si on a un token dans les cookies
        const authToken = getAuthCookie();
        
        if (authToken) {
          // Si on a un token, on récupère la session
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Erreur lors de la récupération de la session:', error);
            clearAllAuthCookies();
            return;
          }
          
          if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            
            // Mettre à jour les cookies uniquement si nécessaire
            if (hasConsent('necessary')) {
              setAuthCookie(currentSession.access_token, currentSession.expires_in);
              setUserData(currentSession.user);
            }
            
            await loadProfile(currentSession.user.id);
            
            // Initialiser les services tiers
            initializeServices();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
        clearAllAuthCookies();
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Nettoyer l'abonnement lors du démontage
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [loadProfile]);

  // La fonction signIn est maintenant définie plus bas dans le fichier
  // Détermine le rôle de l'utilisateur en fonction de son email et de son profil
  const determineUserRole = async (user: User): Promise<'admin' | 'partner' | 'client'> => {
    try {
      console.log('Détermination du rôle pour l\'utilisateur:', user.email);
      
      // Vérifier d'abord si c'est un admin
      if (isAdminEmail(user.email || '')) {
        console.log('Utilisateur identifié comme admin');
        return 'admin';
      }

      // Charger le profil utilisateur directement depuis la base de données
      console.log('Chargement du profil pour l\'utilisateur ID:', user.id);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (!profileData) {
        console.log('Aucun profil trouvé, utilisation du rôle par défaut (client)');
        return 'client';
      }

      console.log('Profil chargé:', profileData);
      
      // Mettre à jour l'état du profil
      setProfile(profileData);

      // Vérifier le rôle dans le profil
      if (profileData.role && (profileData.role === 'partner' || profileData.role.startsWith('partner_'))) {
        console.log('Utilisateur identifié comme partenaire avec le rôle:', profileData.role);
        return 'partner';
      }

      console.log('Utilisateur identifié comme client avec le rôle:', profileData.role);
      return 'client';
    } catch (error) {
      console.error('Erreur lors de la détermination du rôle:', error);
      return 'client';
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Désactiver les services tiers avant la déconnexion
      if (hasConsent('analytics') || hasConsent('marketing')) {
        // Ici, vous pouvez ajouter du code pour désactiver les services tiers
        // Par exemple, désactiver le suivi Google Analytics
        console.log('Désactivation des services tiers...');
      }
      
      // Déconnecter de Supabase
      await supabase.auth.signOut();
      
      // Mettre à jour l'état local
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Nettoyer tous les cookies d'authentification
      clearAllAuthCookies();
      
      // Supprimer également les données de session du stockage local
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
      }
      
      console.log('Déconnexion réussie et données nettoyées');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, forcer le nettoyage des cookies
      clearAllAuthCookies();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      // Mettre à jour le profil local
      setProfile(prev => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    setLoading(true);
    try {
      console.log('Début de l\'inscription pour:', email);
      
      // Créer le compte utilisateur
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        console.error('Erreur lors de la création du compte:', error);
        throw error;
      }

      console.log('Compte créé avec succès, données:', data);

      // Vérifier si l'email nécessite une confirmation
      const requiresEmailConfirmation = data.user?.identities?.[0]?.identity_data?.email_verify === 'pending';
      
      // Si l'email nécessite une confirmation
      if (requiresEmailConfirmation) {
        console.log('Confirmation par email requise');
        return { role: 'client' as const }; // Retourner un rôle par défaut
      }
      
      // Si pas besoin de confirmation, connecter directement l'utilisateur
      console.log('Connexion automatique après inscription...');
      
      // Attendre un court instant pour s'assurer que l'utilisateur est créé
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Connecter l'utilisateur
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Erreur lors de la connexion après inscription:', signInError);
        throw signInError;
      }
      
      if (!signInData.session) {
        throw new Error('Aucune session retournée après connexion');
      }

      console.log('Utilisateur connecté avec succès après inscription');
      
      // Créer ou mettre à jour le profil avec tous les champs requis
      const profileData: Profile = {
        id: signInData.session.user.id,
        email: email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || undefined,
        role: 'client', // Rôle par défaut pour les inscriptions standards
        country: 'Maroc', // Valeur par défaut
        is_verified: false, // Par défaut non vérifié
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Champs optionnels
        company_name: userData.company_name,
        address: userData.address,
        city: userData.city,
        avatar_url: userData.avatar_url,
        description: userData.description,
        // Champs partenaires (peuvent être vides pour un client standard)
        partner_type: userData.partner_type,
        commission_rate: userData.commission_rate,
        bank_account: userData.bank_account,
        iban: userData.iban,
        total_earnings: 0,
        pending_earnings: 0,
        paid_earnings: 0
      };
      
      console.log('Création/Mise à jour du profil:', profileData);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (profileError) {
        console.error('Erreur lors de la création du profil:', profileError);
        throw profileError;
      }
      
      console.log('Profil créé/mis à jour avec succès');
      
      // Mettre à jour l'état local
      setSession(signInData.session);
      setUser(signInData.session.user);
      setProfile(profileData);
      
      // Initialiser les services tiers si nécessaire
      if (hasConsent('analytics') || hasConsent('marketing')) {
        console.log('Initialisation des services tiers...');
        initializeServices();
      }
      
      // Retourner le rôle de l'utilisateur
      return { role: 'client' as const };
      
    } catch (error) {
      console.error('Erreur complète lors de l\'inscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec email/mot de passe
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erreur lors de la connexion:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('Aucun utilisateur trouvé après connexion');
      }

      // Vérifier le consentement avant de définir les cookies
      if (hasConsent('necessary')) {
        setAuthCookie(data.session?.access_token || '', data.session?.expires_in || 3600);
        setUserData(data.user);
      }

      // Déterminer le rôle de l'utilisateur
      console.log('Détermination du rôle...');
      const role = await determineUserRole(data.user);
      console.log('Rôle déterminé:', role);

      // Charger le profil utilisateur
      await loadProfile(data.user.id);
      
      // Initialiser les services tiers si nécessaire
      if (hasConsent('analytics') || hasConsent('marketing')) {
        console.log('Initialisation des services tiers...');
        initializeServices();
      }
      
      return { role };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      // En cas d'erreur, nettoyer les cookies potentiellement partiels
      if (error instanceof Error && error.message.includes('Invalid login credentials')) {
        clearAllAuthCookies();
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec Google
  const signInWithGoogle = async (roleRequested: 'client' | 'partner' = 'client') => {
    try {
      setLoading(true);
      console.log(`Début de la connexion avec Google pour le rôle: ${roleRequested}`);
      
      // Stocker le rôle demandé dans le stockage de session
      sessionStorage.setItem('signup_role', roleRequested);
      
      // Lancer le flux de connexion Google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Erreur lors de la connexion avec Google:', error);
        throw error;
      }

      console.log('Redirection vers Google pour authentification');
      // La redirection vers Google se fera automatiquement
      return { role: roleRequested as 'client' | 'partner' };
    } catch (error) {
      console.error('Erreur lors de la connexion avec Google:', error);
      // Nettoyer le stockage de session en cas d'erreur
      sessionStorage.removeItem('signup_role');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithMagicLink: async (email: string) => {
      // Implémentation du lien magique
      return { success: true };
    },
    resetPassword: async (email: string) => {
      // Implémentation de la réinitialisation du mot de passe
      return { success: true };
    },
    updateEmail: async (newEmail: string, password: string) => {
      // Implémentation de la mise à jour de l'email
      return { success: true };
    },
    inviteUser: async (email: string, role: string) => {
      // Implémentation de l'invitation d'utilisateur
      return { success: true };
    },
    signOut,
    updateProfile,
    isAdmin: isAdminEmail(user?.email || ''),
    requireReauthentication: async () => {
      // Implémentation de la revérification d'authentification
      return true;
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
