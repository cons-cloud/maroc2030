import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { validatePassword } from '../utils/validation';
import { isAdminEmail } from '../config/admins';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ role: 'admin' | 'partner' | 'client' }>;
  signInWithGoogle: () => Promise<{ role: 'client' }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  isAdmin: boolean;
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

  useEffect(() => {
    console.log('AuthProvider: Initialisation du contexte d\'authentification');
    
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthProvider: Session récupérée', { session, error });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('AuthProvider: Utilisateur connecté, chargement du profil...');
        loadProfile(session.user.id);
      } else {
        console.log('AuthProvider: Aucun utilisateur connecté');
        setLoading(false);
      }
    });

    // Écouter les changements d'authentification
    const handleAuthStateChange = async (event: string, session: Session | null) => {
      console.log('AuthProvider: Événement d\'authentification', { event, session });
      
      if (session?.user) {
        console.log('AuthProvider: Connexion détectée pour l\'utilisateur:', session.user.email);
        setUser(session.user);
        setSession(session);
        
        // Vérifier si c'est un admin
        const isAdmin = isAdminEmail(session.user.email);
        console.log('AuthProvider: Est admin?', isAdmin);
        
        if (!isAdmin) {
          // Pour les non-admins, charger le profil
          await loadProfile(session.user.id);
        } else {
          // Pour les admins, ne pas attendre de profil
          console.log('AuthProvider: Utilisateur admin détecté, pas besoin de profil');
          setLoading(false);
        }
      } else {
        console.log('AuthProvider: Déconnexion détectée');
        setUser(null);
        setProfile(null);
        setSession(null);
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      // Valider le mot de passe
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Créer l'utilisateur dans Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Créer le profil
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email: email,
            role: 'client',
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            is_verified: true,
          },
        ]);

        if (profileError) throw profileError;
      }
    } catch (error: unknown) {
      console.error('Error signing up:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      throw new Error(errorMessage);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Aucun utilisateur trouvé');
      }

      // Vérifier si c'est un admin
      const isAdminUser = isAdminEmail(data.user.email);
      
      if (isAdminUser) {
        // Créer un profil admin de base
        const adminProfile = {
          id: data.user.id,
          email: data.user.email || '',
          role: 'admin' as const,
          first_name: 'Admin',
          last_name: 'User',
          country: 'Maroc', // Champ requis
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Champs optionnels
          phone: '',
          address: '',
          city: '',
          avatar_url: '',
          description: '',
          company_name: '',
          partner_type: '',
          commission_rate: 0,
          bank_account: '',
          iban: '',
          total_earnings: 0,
          pending_earnings: 0,
          paid_earnings: 0
        };
        
        // Mettre à jour l'état
        setUser(data.user);
        setSession(data.session);
        setProfile(adminProfile);
        
        // Vérifier si le profil admin existe dans la base de données, sinon le créer
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(adminProfile, { onConflict: 'id' });
          
        if (profileError) {
          console.error('Erreur lors de la création du profil admin:', profileError);
        }
        
        return { role: 'admin' as const };
      } else {
        // Pour les non-admins, charger le profil pour déterminer le rôle
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError || !profile) {
          throw new Error(profileError?.message || 'Profil utilisateur non trouvé');
        }
        
        // S'assurer que le pays est défini (champ requis)
        if (!profile.country) {
          profile.country = 'Maroc';
          // Mettre à jour le profil dans la base de données
          await supabase
            .from('profiles')
            .update({ country: 'Maroc', updated_at: new Date().toISOString() })
            .eq('id', profile.id);
        }
        
        // Déterminer si c'est un partenaire (vérifier les variantes comme 'partner_tourism')
        const isPartnerUser = profile.role?.startsWith('partner') || profile.role === 'partner';
        
        // Mettre à jour l'état avec les données du profil
        setUser(data.user);
        setSession(data.session);
        setProfile(profile);
        
        // Retourner le rôle approprié
        if (isPartnerUser) {
          return { role: 'partner' as const };
        }
        
        return { role: 'client' as const };
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Réinitialiser tous les états
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Supprimer les données de session du stockage local
      localStorage.removeItem('supabase.auth.token');
      
      console.log('Déconnexion réussie');
      
      // Retourner une promesse résolue après la déconnexion
      return Promise.resolve();
    } catch (error: unknown) {
      console.error('Error signing out:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la déconnexion';
      return Promise.reject(new Error(errorMessage));
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Recharger le profil
      await loadProfile(user.id);
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil';
      throw new Error(errorMessage);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Vérifier si l'utilisateur a un compte client
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Vérifier si l'utilisateur a un profil client
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (profile && profile.role !== 'client') {
          // Déconnecter l'utilisateur s'il n'est pas un client
          await supabase.auth.signOut();
          throw new Error('La connexion avec Google est réservée aux comptes clients');
        }
        
        // Si c'est un client, retourner le rôle
        return { role: 'client' as const };
      }
      
      // Si pas de session, procéder à l'authentification OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard/client`,
        },
      });

      if (error) throw error;
      
      // Pour les nouveaux utilisateurs, nous supposerons qu'ils sont des clients
      return { role: 'client' as const };
      
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw new Error('Erreur lors de la connexion avec Google');
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    isAdmin: user ? isAdminEmail(user.email) : false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
