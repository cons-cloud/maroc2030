export const MESSAGES = {
  // Messages génériques
  ERROR: {
    DEFAULT: 'Une erreur inattendue est survenue. Notre équipe a été notifiée.',
    NETWORK: 'Erreur de connexion. Veuillez vérifier votre accès internet et réessayer.',
    REQUIRED_FIELDS: 'Veuillez compléter tous les champs obligatoires marqués d\'un astérisque (*).',
    INVALID_EMAIL: 'L\'adresse email saisie n\'est pas valide. Format attendu : exemple@domaine.com',
    PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas. Veuillez les vérifier.',
    UNAUTHORIZED: 'Accès refusé. Veuillez vous connecter pour continuer.',
    NOT_FOUND: 'La ressource demandée est introuvable ou a été supprimée.',
    SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter pour continuer.',
    FORM_VALIDATION: 'Veuillez vérifier les informations saisies et corriger les erreurs.',
  },
  
  // Authentification
  AUTH: {
    LOGIN_SUCCESS: 'Connexion réussie ! Redirection en cours...',
    LOGIN_ERROR: 'Identifiants incorrects. Vérifiez votre email et mot de passe.',
    LOGOUT_SUCCESS: 'Vous avez été déconnecté avec succès. À bientôt !',
    REGISTER_SUCCESS: 'Inscription réussie ! Vérifiez votre boîte mail pour activer votre compte.',
    REGISTER_ERROR: 'Impossible de créer votre compte. Veuillez réessayer ultérieurement.',
    EMAIL_EXISTS: 'Cette adresse email est déjà associée à un compte existant.',
    WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 8 caractères, dont des majuscules, des chiffres et des caractères spéciaux.',
    INVALID_CREDENTIALS: 'Identifiants invalides. Si vous avez oublié votre mot de passe, utilisez la fonction "Mot de passe oublié".',
    GOOGLE_LOGIN_ERROR: 'Échec de la connexion avec Google. Veuillez réessayer ou utiliser une autre méthode.',
  },
  
  // Réservations
  BOOKING: {
    SUCCESS: 'Votre réservation a été enregistrée avec succès ! Un email de confirmation vous a été envoyé.',
    ERROR: 'Impossible de finaliser votre réservation. Veuillez réessayer ou nous contacter.',
    INVALID_DATES: 'Veuillez sélectionner des dates de séjour valides.',
    END_DATE_AFTER_START: 'La date de fin doit être postérieure d\'au moins une nuit à la date d\'arrivée.',
    SESSION_EXPIRED: 'Votre session de réservation a expiré en raison d\'une inactivité prolongée. Veuillez recommencer.',
    RESUME_BOOKING: 'Reprise de votre réservation en cours...',
    UNAVAILABLE: 'Cette prestation n\'est plus disponible aux dates sélectionnées. Veuillez choisir d\'autres dates.',
    RESTORED: 'Votre réservation en attente a été restaurée',
    SAVED_TEMPORARILY: 'Vos informations ont été enregistrées. Vous avez 30 minutes pour finaliser votre réservation.',
  },
  
  // Profil
  PROFILE: {
    UPDATE_SUCCESS: 'Vos informations ont été mises à jour avec succès.',
    UPDATE_ERROR: 'Impossible de mettre à jour votre profil. Veuillez vérifier les informations saisies.',
    PASSWORD_UPDATE_SUCCESS: 'Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.',
    PASSWORD_UPDATE_ERROR: 'Le mot de passe actuel est incorrect ou la confirmation ne correspond pas.',
  },
  
  // Administration
  ADMIN: {
    DELETE_SUCCESS: 'La suppression a été effectuée avec succès.',
    DELETE_ERROR: 'Impossible de supprimer cet élément. Il est peut-être lié à d\'autres données.',
    SAVE_SUCCESS: 'Les modifications ont été enregistrées avec succès.',
    SAVE_ERROR: 'Erreur lors de l\'enregistrement. Veuillez vérifier les données saisies.',
  },
  
  // Formulaire de contact
  CONTACT: {
    SUCCESS: 'Merci pour votre message ! Nous vous répondrons dans les 24-48 heures.',
    ERROR: 'Impossible d\'envoyer votre message. Veuillez réessayer ou nous contacter par téléphone.',
    VALIDATION: 'Veuillez remplir correctement tous les champs du formulaire.',
  },
  
  // Téléchargements
  DOWNLOAD: {
    SUCCESS: 'Le téléchargement a démarré. Si rien ne se passe, vérifiez vos téléchargements.',
    ERROR: 'Impossible de télécharger le fichier. Le lien est peut-être expiré ou corrompu.',
  },
  
  // Paiement
  PAYMENT: {
    SUCCESS: 'Paiement accepté ! Votre réservation est confirmée. Vous recevrez un email de confirmation sous peu.',
    ERROR: 'Le paiement n\'a pas pu aboutir. Votre carte a peut-être été refusée ou une erreur est survenue.',
    CANCELLED: 'Paiement annulé. Aucun prélèvement n\'a été effectué.',
    PROCESSING: 'Traitement de votre paiement en cours...',
    MISSING_INFO: 'Informations de réservation incomplètes. Veuillez réessayer.',
    EXPIRED_SESSION: 'Votre session de paiement a expiré. Veuillez recommencer votre réservation.',
  },

  // Validation
  VALIDATION: {
    REQUIRED: 'Ce champ est obligatoire',
    EMAIL: 'Veuillez entrer une adresse email valide',
    PHONE: 'Numéro de téléphone invalide',
    MIN_LENGTH: 'Doit contenir au moins {min} caractères',
    MAX_LENGTH: 'Ne doit pas dépasser {max} caractères',
    PASSWORD_MATCH: 'Les mots de passe doivent correspondre',
    DATE_RANGE: 'La date de fin doit être postérieure à la date de début',
  },

  // Notifications
  NOTIFICATION: {
    SUCCESS: 'Opération réussie',
    WARNING: 'Attention',
    ERROR: 'Erreur',
    INFO: 'Information',
  },
};
