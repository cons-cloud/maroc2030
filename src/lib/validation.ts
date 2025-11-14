export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password) {
    return { valid: false, message: 'Le mot de passe est requis' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial' };
  }
  return { valid: true };
};

export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email) {
    return { valid: false, message: 'L\'email est requis' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Veuillez entrer un email valide' };
  }
  return { valid: true };
};
