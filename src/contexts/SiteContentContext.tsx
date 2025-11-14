import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode, useMemo } from 'react';
import { supabase } from '../lib/supabase';

// ================================================
// TYPES
// ================================================
interface ContentItem {
  id: string;
  section: string;
  key: string;
  value: string;
  value_ar?: string;
  type: string;
}

interface SiteContentContextType {
  content: Record<string, string>;
  loading: boolean;
  error: string | null;
  getContent: (key: string, defaultValue?: string) => string;
  refreshContent: () => Promise<void>;
}

// ================================================
// CONTEXT
// ================================================
const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

// ================================================
// PROVIDER
// ================================================
export const SiteContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<Record<string, string>>(getDefaultContent());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('site_content')
        .select('*');

      if (fetchError) {
        // Si la table n'existe pas, utiliser les valeurs par défaut
        if (fetchError.code === 'PGRST116' || fetchError.code === '42P01') {
          console.warn('Table site_content not found, using defaults');
          setContent(getDefaultContent());
          return;
        }
        throw fetchError;
      }

      // Convertir le tableau en objet clé-valeur
      const contentMap: Record<string, string> = {};
      data?.forEach((item: ContentItem) => {
        const fullKey = `${item.section}.${item.key}`;
        contentMap[fullKey] = item.value;
      });
      
      setContent(prev => ({
        ...getDefaultContent(),
        ...contentMap
      }));
    } catch (err) {
      console.error('Error loading site content:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du contenu';
      setError(errorMessage);
      // Utiliser les valeurs par défaut en cas d'erreur
      setContent(getDefaultContent());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();

    // Rafraîchir toutes les 10 minutes
    const interval = setInterval(fetchContent, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchContent]);

  const getContent = useCallback((key: string, defaultValue: string = ''): string => {
    return content[key] ?? defaultValue;
  }, [content]);

  const refreshContent = useCallback(async (): Promise<void> => {
    await fetchContent();
  }, [fetchContent]);

  const contextValue = useMemo(() => ({
    content,
    loading,
    error,
    getContent,
    refreshContent
  }), [content, loading, error, getContent, refreshContent]);

  return (
    <SiteContentContext.Provider value={contextValue}>
      {children}
    </SiteContentContext.Provider>
  );
};

// ================================================
// HOOK
// ================================================
export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (context === undefined) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
};

// ================================================
// VALEURS PAR DÉFAUT
// ================================================
const getDefaultContent = (): Record<string, string> => ({
  // Hero Section
  'home.hero.title': 'Découvrez le Maroc',
  'home.hero.subtitle': 'Votre voyage commence ici',
  'home.hero.description': 'Explorez les merveilles du Maroc avec nos services de qualité',
  
  // About Section
  'home.about.title': 'À propos de nous',
  'home.about.description': 'Nous sommes une équipe passionnée dédiée à vous faire découvrir les merveilles du Maroc.',
  
  // Why Choose Us
  'home.why.title': 'Pourquoi nous choisir ?',
  'home.why.subtitle': 'Votre partenaire de confiance',
  'home.why.reason1': 'Service de qualité',
  'home.why.reason2': 'Prix compétitifs',
  'home.why.reason3': 'Expérience locale',
  'home.why.reason4': 'Support 24/7',
  
  // Services Section
  'home.services.title': 'Nos Services',
  'home.services.subtitle': 'Découvrez notre gamme complète de services',
  
  // Contact
  'contact.title': 'Contactez-nous',
  'contact.subtitle': 'Nous sommes là pour répondre à toutes vos questions',
  'contact.form.title': 'Envoyez-nous un message',
  'contact.form.success': 'Message envoyé avec succès !',
  
  // Footer
  'footer.text': '© 2024 Maroc 2030. Tous droits réservés.',
  'footer.description': 'Votre partenaire de confiance pour découvrir le Maroc',
  
  // Common
  'common.loading': 'Chargement...',
  'common.error': 'Une erreur est survenue',
  'common.success': 'Opération réussie',
  'common.book_now': 'Réserver maintenant',
  'common.learn_more': 'En savoir plus',
  'common.contact_us': 'Nous contacter',
});
