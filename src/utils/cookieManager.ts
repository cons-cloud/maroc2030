import Cookies from 'js-cookie';

type CookieOptions = {
  path?: string;
  expires?: number | Date;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
};

const DEFAULT_OPTIONS: CookieOptions = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  expires: 30 // jours
};

// Types pour les données utilisateur
interface UserData {
  id: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

/**
 * Définit un cookie avec les options par défaut
 * @param name Nom du cookie
 * @param value Valeur du cookie
 * @param options Options supplémentaires pour le cookie
 */
export const setCookie = (
  name: string, 
  value: string, 
  options: Omit<CookieOptions, 'httpOnly'> = {}
): void => {
  const cookieOptions: CookieOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };

  // Convertir expires en nombre de jours si c'est un nombre
  if (typeof cookieOptions.expires === 'number') {
    const date = new Date();
    date.setTime(date.getTime() + (cookieOptions.expires * 24 * 60 * 60 * 1000));
    cookieOptions.expires = date;
  }

  Cookies.set(name, value, cookieOptions);
};

/**
 * Récupère un cookie
 */
const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

/**
 * Supprime un cookie
 */
const removeCookie = (name: string, options: CookieOptions = {}): void => {
  Cookies.remove(name, { 
    ...DEFAULT_OPTIONS, 
    ...options,
    expires: new Date(0) // Date dans le passé pour supprimer le cookie
  });
};

/**
 * Définit le cookie d'authentification
 */
export const setAuthCookie = (token: string, expiresIn: number): void => {
  setCookie('auth_token', token, {
    expires: expiresIn / (24 * 60 * 60) // Convertir les secondes en jours
    // Note: httpOnly ne peut pas être défini côté client avec js-cookie
    // Il doit être défini côté serveur avec l'en-tête Set-Cookie HTTP
  });
};

/**
 * Récupère le token d'authentification
 */
export const getAuthCookie = (): string | undefined => {
  return getCookie('auth_token');
};

/**
 * Supprime le cookie d'authentification
 */
export const removeAuthCookie = (): void => {
  removeCookie('auth_token');
};

/**
 * Définit les données utilisateur dans un cookie
 */
export const setUserData = (user: UserData | null): void => {
  if (!user) {
    removeCookie('user_data');
    return;
  }
  
  // Ne stocker que les données essentielles
  const userData: Partial<UserData> = {
    id: user.id,
    email: user.email,
    role: user.role
    // Ajouter d'autres champs si nécessaire
  };
  
  setCookie('user_data', JSON.stringify(userData), {
    expires: 30 // 30 jours
  });
};

/**
 * Récupère les données utilisateur depuis le cookie
 */
export const getUserData = (): UserData | null => {
  try {
    const data = getCookie('user_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erreur lors de la lecture des données utilisateur:', error);
    return null;
  }
};

/**
 * Vérifie si l'utilisateur a accepté les cookies
 */
export const hasConsent = (type: 'necessary' | 'preferences' | 'analytics' | 'marketing' = 'necessary'): boolean => {
  try {
    const consent = getCookie('cookie-consent');
    const prefs = getCookie('cookie-preferences');
    
    // Si l'utilisateur a tout accepté
    if (consent === 'all') return true;
    
    // Si l'utilisateur a des préférences personnalisées
    if (consent === 'custom' && prefs) {
      const preferences = JSON.parse(prefs);
      return preferences[type] === true;
    }
    
    // Par défaut, seul le nécessaire est accepté
    return type === 'necessary';
  } catch (error) {
    console.error('Erreur lors de la vérification du consentement:', error);
    return type === 'necessary'; // Toujours autoriser les cookies nécessaires
  }
};

/**
 * Supprime tous les cookies d'authentification
 */
export const clearAllAuthCookies = (): void => {
  // Supprimer les cookies d'authentification
  removeAuthCookie();
  removeCookie('user_data');
  removeCookie('sb-auth-token');
  removeCookie('sb-refresh-token');
  
  // Supprimer d'autres cookies liés à l'authentification si nécessaire
  ['session', 'session_id', 'remember_me'].forEach(cookie => {
    removeCookie(cookie);
  });
};

/**
 * Initialise les services tiers en fonction des préférences de cookies
 */
export const initializeServices = (): void => {
  // Initialiser les services tiers en fonction des préférences
  if (typeof window !== 'undefined') {
    // Exemple d'initialisation conditionnelle
    if (hasConsent('analytics')) {
      // Initialiser Google Analytics ou autre service d'analyse
      console.log('Initialisation des services d\'analyse');
    }
    
    if (hasConsent('marketing')) {
      // Initialiser les services marketing
      console.log('Initialisation des services marketing');
    }
  }
};

/**
 * Vérifie si les cookies sont activés dans le navigateur
 */
export const areCookiesEnabled = (): boolean => {
  try {
    // Tester l'écriture d'un cookie de test
    const testKey = 'cookies_enabled_test';
    Cookies.set(testKey, 'test');
    
    if (Cookies.get(testKey) === 'test') {
      // Supprimer le cookie de test
      Cookies.remove(testKey);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};
