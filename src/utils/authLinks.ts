import { ROUTES } from '../config/routes';

type AuthLinkType = 'signup' | 'signin' | 'magiclink' | 'reset' | 'update' | 'invite';

/**
 * Génère une URL de redirection après authentification
 * @param type Type de lien d'authentification
 * @param email Email de l'utilisateur (optionnel)
 * @returns URL complète de redirection
 */
export const getAuthRedirectUrl = (type: AuthLinkType, email?: string): string => {
  const baseUrl = window.location.origin;
  
  switch (type) {
    case 'signup':
      return `${baseUrl}${ROUTES.EMAIL_CONFIRM}`;
    case 'signin':
      return `${baseUrl}${ROUTES.HOME}`;
    case 'magiclink':
      return `${baseUrl}${ROUTES.EMAIL_CONFIRM}`;
    case 'reset':
      return `${baseUrl}${ROUTES.RESET_PASSWORD}`;
    case 'update':
      return `${baseUrl}${ROUTES.EMAIL_CONFIRM}`;
    case 'invite':
      return `${baseUrl}${ROUTES.SIGNUP}`;
    default:
      return baseUrl;
  }
};

/**
 * Vérifie si l'utilisateur est réauthentifié récemment
 * @returns boolean
 */
export const isRecentlyAuthenticated = (): boolean => {
  const reauthenticatedAt = localStorage.getItem('reauthenticatedAt');
  if (!reauthenticatedAt) return false;
  
  // Vérifier si la réauthentification a eu lieu il y a moins de 5 minutes
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  
  return new Date(reauthenticatedAt) > fiveMinutesAgo;
};

/**
 * Marque l'utilisateur comme réauthentifié
 */
export const markAsReauthenticated = (): void => {
  localStorage.setItem('reauthenticatedAt', new Date().toISOString());
};

/**
 * Nettoie l'état de réauthentification
 */
export const clearReauthentication = (): void => {
  localStorage.removeItem('reauthenticatedAt');
};
