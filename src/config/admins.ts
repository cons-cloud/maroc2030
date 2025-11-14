// Liste des emails admin autorisés
// Ces utilisateurs auront accès au dashboard admin sans avoir de profil

export const ADMIN_EMAILS = [
  'maroc2031@gmail.com',
  'maroc2032@gmail.com',
];

// Fonction pour vérifier si un email est admin
export const isAdminEmail = (email: string | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
