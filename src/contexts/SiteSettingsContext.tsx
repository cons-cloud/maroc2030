import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// ================================================
// TYPES
// ================================================
export interface SiteSettings {
  id?: string;
  
  // Contact
  email: string;
  phone_primary: string;
  phone_secondary?: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  
  // Réseaux sociaux
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
  linkedin_url?: string;
  tiktok_url?: string;
  
  // Horaires
  opening_hours: any;
  
  // Général
  site_name: string;
  site_slogan: string;
  site_description_short: string;
  site_description_long: string;
  site_keywords?: string;
  logo_url?: string;
  favicon_url?: string;
  
  // Textes
  home_hero_title: string;
  home_hero_subtitle: string;
  about_title?: string;
  about_text?: string;
  why_choose_us_title?: string;
  why_choose_us_text?: string;
  footer_text: string;
  legal_mentions?: string;
  privacy_policy?: string;
  terms_conditions?: string;
  
  // Technique
  google_analytics_id?: string;
  facebook_pixel_id?: string;
  maintenance_mode: boolean;
  maintenance_message?: string;
  default_language: string;
  default_currency: string;
  
  // Métadonnées
  updated_at?: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

// ================================================
// CONTEXT
// ================================================
const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

// ================================================
// PROVIDER
// ================================================
export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (fetchError) {
        // Si la table n'existe pas encore ou est vide, utiliser les valeurs par défaut
        if (fetchError.code === 'PGRST116') {
          setSettings(getDefaultSettings());
        } else {
          throw fetchError;
        }
      } else {
        setSettings(data);
      }
    } catch (err: any) {
      console.error('Error loading site settings:', err);
      setError(err.message || 'Erreur lors du chargement des paramètres');
      // Utiliser les valeurs par défaut en cas d'erreur
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();

    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(loadSettings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

// ================================================
// HOOK
// ================================================
export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

// ================================================
// VALEURS PAR DÉFAUT
// ================================================
const getDefaultSettings = (): SiteSettings => ({
  // Contact
  email: 'Imam@orange.fr',
  phone_primary: '+212 669-742780',
  phone_secondary: '',
  address: '123 Avenue Mohammed V',
  city: 'Marrakech',
  postal_code: '40000',
  country: 'Maroc',
  
  // Réseaux sociaux
  facebook_url: 'https://facebook.com',
  instagram_url: 'https://instagram.com',
  twitter_url: 'https://twitter.com',
  youtube_url: 'https://youtube.com',
  linkedin_url: '',
  tiktok_url: '',
  
  // Horaires
  opening_hours: {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '13:00', closed: false },
    sunday: { open: '', close: '', closed: true }
  },
  
  // Général
  site_name: 'Maroc 2030',
  site_slogan: 'Votre destination de rêve au Maroc',
  site_description_short: 'Découvrez le Maroc avec Maroc 2030',
  site_description_long: 'Maroc 2030 est votre partenaire de confiance pour découvrir les merveilles du Maroc. Nous proposons des services de qualité pour rendre votre séjour inoubliable.',
  site_keywords: 'maroc, tourisme, voyage, hôtel, location, circuits',
  logo_url: '',
  favicon_url: '',
  
  // Textes
  home_hero_title: 'Découvrez le Maroc',
  home_hero_subtitle: 'Votre voyage commence ici',
  about_title: 'À propos de nous',
  about_text: 'Nous sommes une équipe passionnée dédiée à vous faire découvrir les merveilles du Maroc.',
  why_choose_us_title: 'Pourquoi nous choisir ?',
  why_choose_us_text: 'Service de qualité, prix compétitifs, expérience locale.',
  footer_text: '© 2024 Maroc 2030. Tous droits réservés.',
  legal_mentions: '',
  privacy_policy: '',
  terms_conditions: '',
  
  // Technique
  google_analytics_id: '',
  facebook_pixel_id: '',
  maintenance_mode: false,
  maintenance_message: 'Site en maintenance. Nous revenons bientôt !',
  default_language: 'fr',
  default_currency: 'MAD'
});
