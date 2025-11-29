import Cookies, { CookieAttributes } from 'js-cookie';

type CookieAttributesType = {
  path?: string;
  expires?: number | Date;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
};

// Configuration des cookies
export const COOKIE_CONFIG: CookieAttributesType = {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  expires: 30, // 30 jours
};

// Clés des cookies
export const COOKIE_KEYS = {
  AUTH_TOKEN: 'sb-auth-token',
  REFRESH_TOKEN: 'sb-refresh-token',
  USER_DATA: 'sb-user-data',
  COOKIE_CONSENT: 'cookie-consent',
};

// Gestion du consentement des cookies
export const getCookieConsent = (): boolean => {
  return Cookies.get(COOKIE_KEYS.COOKIE_CONSENT) === 'true';
};

export const setCookieConsent = (consent: boolean): void => {
  Cookies.set(COOKIE_KEYS.COOKIE_CONSENT, String(consent), COOKIE_CONFIG);
};

// Gestion des tokens d'authentification
export const setAuthCookies = (session: any): void => {
  if (!getCookieConsent()) return;
  
  if (session?.access_token) {
    Cookies.set(COOKIE_KEYS.AUTH_TOKEN, session.access_token, {
      ...COOKIE_CONFIG,
      expires: new Date(session.expires_at * 1000),
    });
  }
  
  if (session?.refresh_token) {
    Cookies.set(COOKIE_KEYS.REFRESH_TOKEN, session.refresh_token, COOKIE_CONFIG);
  }
};

export const clearAuthCookies = (): void => {
  Object.values(COOKIE_KEYS).forEach(key => {
    Cookies.remove(key, { path: COOKIE_CONFIG.path });
  });
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get(COOKIE_KEYS.AUTH_TOKEN);
};

// Gestion des données utilisateur
export const setUserData = (user: any): void => {
  if (!getCookieConsent()) return;
  Cookies.set(COOKIE_KEYS.USER_DATA, JSON.stringify(user), COOKIE_CONFIG);
};

export const getUserData = (): any => {
  const userData = Cookies.get(COOKIE_KEYS.USER_DATA);
  return userData ? JSON.parse(userData) : null;
};
