import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

type CookiePreferences = {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    preferences: true,
    analytics: false,
    marketing: false
  });

  // Vérifier le consentement au chargement
  useEffect(() => {
    const consent = Cookies.get('cookie-consent');
    const savedPrefs = Cookies.get('cookie-preferences');
    
    // Afficher la bannière si pas de consentement enregistré
    if (consent !== 'all' && consent !== 'custom') {
      setShowBanner(true);
    }
    
    // Charger les préférences enregistrées
    if (savedPrefs) {
      try {
        const parsedPrefs = JSON.parse(savedPrefs);
        setPreferences(prev => ({
          ...prev,
          ...parsedPrefs,
          necessary: true // Toujours forcer les cookies nécessaires
        }));
      } catch (e) {
        console.error('Erreur lors de la lecture des préférences de cookies', e);
      }
    }
  }, []);

  // Sauvegarder les préférences
  const savePreferences = (customPrefs?: CookiePreferences) => {
    const prefsToSave = customPrefs || preferences;
    const allAccepted = Object.values(prefsToSave).every(Boolean);
    
    // Sauvegarder les préférences dans un cookie
    Cookies.set('cookie-preferences', JSON.stringify(prefsToSave), {
      path: '/',
      expires: 365,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    // Mettre à jour le consentement global
    Cookies.set('cookie-consent', allAccepted ? 'all' : 'custom', {
      path: '/',
      expires: 365,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    setShowBanner(false);
  };

  // Gestionnaire pour accepter tous les cookies
  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  // Gestionnaire pour refuser tous les cookies non essentiels
  const handleRejectAll = () => {
    const rejected = {
      necessary: true, // Les cookies nécessaires restent toujours actifs
      preferences: false,
      analytics: false,
      marketing: false
    };
    setPreferences(rejected);
    savePreferences(rejected);
  };

  // Ne rien afficher si la bannière n'est pas censée être visible
  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-3 z-50">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-gray-600 flex-1 min-w-[200px]">
            Nous utilisons des cookies pour améliorer votre expérience. 
            <button 
              onClick={() => setShowBanner(false)}
              className="text-blue-600 hover:underline ml-1"
            >
              En savoir plus
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRejectAll}
              className="text-xs px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Refuser
            </button>
            <button
              onClick={handleAcceptAll}
              className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
