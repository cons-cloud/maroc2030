// ============================================
// UTILITAIRES DE VALIDATION ET SÉCURITÉ
// ============================================

/**
 * Valide la force d'un mot de passe
 */
export const validatePassword = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide un email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone marocain
 */
export const validatePhoneMaroc = (phone: string): boolean => {
  // Format: +212XXXXXXXXX ou 0XXXXXXXXX
  const phoneRegex = /^(\+212|0)[5-7]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Nettoie une chaîne pour éviter les injections XSS
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Valide un montant (doit être positif et raisonnable)
 */
export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount < 1000000 && !isNaN(amount);
};

/**
 * Valide une date (doit être dans le futur)
 */
export const validateFutureDate = (date: string | Date): boolean => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate >= today;
};

/**
 * Limite la longueur d'une chaîne
 */
export const limitString = (str: string, maxLength: number): string => {
  return str.length > maxLength ? str.substring(0, maxLength) : str;
};

/**
 * Valide un objet de réservation
 */
export interface BookingFormData {
  startDate: string;
  endDate: string;
  guests: number;
  fullName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateBookingForm = (data: BookingFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Validation de la date de début
  if (!data['startDate']) {
    errors['startDate'] = "La date de début est requise";
  } else if (new Date(data['startDate']) < today) {
    errors['startDate'] = "La date de début ne peut pas être dans le passé";
  }

  // Validation de la date de fin
  if (!data['endDate']) {
    errors['endDate'] = "La date de fin est requise";
  } else if (data['startDate'] && new Date(data['endDate']) <= new Date(data['startDate'])) {
    errors['endDate'] = "La date de fin doit être postérieure à la date de début";
  }

  // Validation du nombre de personnes
  if (data['guests'] < 1) {
    errors['guests'] = "Le nombre de personnes doit être d'au moins 1";
  } else if (data['guests'] > 20) {
    errors['guests'] = "Le nombre maximum de personnes est de 20";
  }

  // Validation du nom complet
  if (!data['fullName']?.trim()) {
    errors['fullName'] = "Le nom complet est requis";
  } else if (data['fullName']?.trim().length < 2) {
    errors['fullName'] = "Le nom complet doit contenir au moins 2 caractères";
  }

  // Validation de l'email
  if (!data['email']) {
    errors['email'] = "L'email est requis";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data['email'])) {
    errors['email'] = "Veuillez entrer un email valide";
  }

  // Validation du téléphone
  if (!data['phone']) {
    errors['phone'] = "Le numéro de téléphone est requis";
  } else if (!/^(\+212|0)[5-7]\d{8}$/.test(data['phone'].replace(/\s/g, ''))) {
    errors['phone'] = "Veuillez entrer un numéro de téléphone marocain valide";
  }

  // Validation des demandes spéciales (si fournies)
  if (data['specialRequests'] && data['specialRequests'].length > 500) {
    errors['specialRequests'] = "Les demandes spéciales ne doivent pas dépasser 500 caractères";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateBooking = (booking: any): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (!booking.service_id) {
    errors.push('ID du service manquant');
  }
  
  if (!booking.user_id) {
    errors.push('ID utilisateur manquant');
  }
  
  if (!booking.start_date || !validateFutureDate(booking.start_date)) {
    errors.push('Date de début invalide ou passée');
  }
  
  if (!booking.total_price || !validateAmount(booking.total_price)) {
    errors.push('Montant invalide');
  }
  
  if (booking.guests && (booking.guests < 1 || booking.guests > 50)) {
    errors.push('Nombre de personnes invalide (1-50)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Détecte les tentatives d'injection SQL basiques
 */
export const detectSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\*|;|'|"|\||&)/,
    /(\bOR\b|\bAND\b).*=/i,
    /UNION.*SELECT/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Rate limiting simple (côté client)
 * Retourne true si l'action est autorisée
 */
const rateLimitStore: { [key: string]: number[] } = {};

export const checkRateLimit = (
  key: string, 
  maxAttempts: number = 5, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = [];
  }
  
  // Nettoyer les anciennes tentatives
  rateLimitStore[key] = rateLimitStore[key].filter(
    timestamp => now - timestamp < windowMs
  );
  
  // Vérifier si la limite est atteinte
  if (rateLimitStore[key].length >= maxAttempts) {
    return false;
  }
  
  // Ajouter la nouvelle tentative
  rateLimitStore[key].push(now);
  return true;
};

/**
 * Génère un token CSRF simple
 */
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Valide les données d'un formulaire de contact
 */
export const validateContactForm = (data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.name || data.name.length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }
  
  if (!validateEmail(data.email)) {
    errors.push('Email invalide');
  }
  
  if (data.phone && !validatePhoneMaroc(data.phone)) {
    errors.push('Numéro de téléphone invalide');
  }
  
  if (!data.message || data.message.length < 10) {
    errors.push('Le message doit contenir au moins 10 caractères');
  }
  
  if (data.message && data.message.length > 1000) {
    errors.push('Le message ne peut pas dépasser 1000 caractères');
  }
  
  // Vérifier les injections
  if (detectSQLInjection(data.message)) {
    errors.push('Contenu suspect détecté');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Masque les données sensibles pour les logs
 */
export const maskSensitiveData = (data: any): any => {
  const masked = { ...data };
  
  const sensitiveKeys = [
    'password', 
    'token', 
    'secret', 
    'api_key', 
    'credit_card',
    'cvv',
    'ssn'
  ];
  
  Object.keys(masked).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      masked[key] = '***MASKED***';
    }
  });
  
  return masked;
};

/**
 * Vérifie si une URL est sûre (pas de javascript:, data:, etc.)
 */
export const isSafeURL = (url: string): boolean => {
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerURL = url.toLowerCase().trim();
  
  return !dangerousProtocols.some(protocol => lowerURL.startsWith(protocol));
};

/**
 * Encode les paramètres d'URL de manière sécurisée
 */
export const encodeURLParams = (params: Record<string, any>): string => {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

/**
 * Valide un fichier uploadé
 */
export const validateFile = (
  file: File,
  maxSizeMB: number = 5,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): { isValid: boolean; error?: string } => {
  // Vérifier la taille
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Le fichier ne doit pas dépasser ${maxSizeMB}MB`
    };
  }
  
  // Vérifier le type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`
    };
  }
  
  return { isValid: true };
};

/**
 * Debounce pour limiter les appels API
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitMs);
  };
};
