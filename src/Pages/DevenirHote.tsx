import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../lib/supabase';
import { ArrowLeft, Loader2, Eye, EyeOff, User, Mail, Phone, Lock, LogIn } from 'lucide-react';
import { validateEmail, validatePhoneMaroc as validatePhone } from '../utils/validation';


interface FormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
  [key: string]: string | boolean; // Index signature pour permettre l'accès par chaîne
}

const DevenirHote: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user } = useAuth();
  
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});


  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le numéro de téléphone est requis';
    } else if (!validatePhone(formData.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (formData.terms !== true) {
      newErrors.terms = 'Vous devez accepter les conditions d\'utilisation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion du changement de champ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, type } = target;
    
    // Gérer le cas des cases à cocher différemment
    if (type === 'checkbox' && name in formData) {
      const checked = target.checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      const value = target.value;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Gestion de la connexion avec Google
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      // L'authentification Google ne nécessite pas de paramètre de rôle
      const { role } = await signInWithGoogle();
      console.log('Connexion Google réussie avec le rôle:', role);
      
      // La redirection sera gérée par le composant AuthCallback
    } catch (error: any) {
      console.error('Erreur lors de la connexion avec Google:', error);
      toast.error('Erreur', error?.message || 'Erreur lors de la connexion avec Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données utilisateur avec le rôle 'host'
      const userData = {
        first_name: formData.prenom.trim(),
        last_name: formData.nom.trim(),
        phone: formData.telephone.trim(),
        role: 'host' as UserRole,
        is_verified: false,
        is_active: true
      };

      console.log('Tentative d\'inscription avec les données:', {
        email: formData.email.trim(),
        hasPassword: !!formData.password,
        userData
      });

      const { role } = await signUp(
        formData.email.trim(), 
        formData.password,
        userData
      );
      
      console.log('Inscription réussie avec le rôle:', role);
      
      toast.success('Inscription réussie', 'Vous pouvez maintenant vous connecter.', 5000);
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.message?.includes('email') 
        ? 'Cette adresse email est déjà utilisée'
        : 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
      toast.error('Erreur', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styles réutilisables
  const inputClass = (field: keyof FormData) => 
    `block w-full px-4 py-2 rounded-lg border ${
      errors[field] 
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
    } shadow-sm sm:text-sm`;


  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <Link 
          to="/"
          className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors mb-6 group"
          aria-label="Retour à l'accueil"
        >
          <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-0.5" />
          Retour à l'accueil
        </Link>

<div className="mt-8 bg-white py-8 px-6 shadow-lg sm:rounded-xl">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={`pl-10 ${inputClass('prenom')}`}
                    placeholder="Votre prénom"
                  />
                </div>
                {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>}
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`pl-10 block w-full rounded-lg border ${
                      errors.nom ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                    } shadow-sm sm:text-sm`}
                    placeholder="Votre nom"
                  />
                </div>
                {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-lg border ${
                    errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                  } shadow-sm sm:text-sm`}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-lg border ${
                    errors.telephone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                  } shadow-sm sm:text-sm`}
                  placeholder="+212 6 12 34 56 78"
                />
              </div>
              {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 block w-full rounded-lg border ${
                    errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                  } shadow-sm sm:text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 pr-10 block w-full rounded-lg border ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                  } shadow-sm sm:text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  J'accepte les <a href="/conditions-generales" className="text-emerald-600 hover:text-emerald-500">conditions d'utilisation</a> et la <a href="/politique-de-confidentialite" className="text-emerald-600 hover:text-emerald-500">politique de confidentialité</a>.
                </label>
                {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Inscription en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </button>
            </div>

            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continuez avec</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGoogleLoading ? (
                  <Loader2 className="animate-spin h-5 w-5 text-gray-600 mr-2" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.28426 53.749 C -8.52426 55.229 -9.21677 56.479 -10.0802 57.329 L -10.0922 57.429 L -4.09769 62.109 L -3.999 62.109 C -1.199 59.349 0.001 55.599 0.001 51.509 C 0.001 50.869 -0.033 50.229 -0.097 49.589 L -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.999 C -9.44398 63.999 -4.84298 62.059 -1.62299 58.689 L -6.85201 54.199 C -8.47201 55.719 -10.603 56.669 -14.754 56.669 C -17.864 56.669 -20.614 55.469 -22.604 53.529 L -22.604 53.529 L -26.826 57.549 C -24.016 61.199 -19.704 63.999 -14.754 63.999 Z"/>
                      <path fill="#FBBC05" d="M -25.284 46.239 C -24.184 45.539 -22.864 45.039 -21.434 44.739 L -21.434 44.739 L -21.434 39.999 L -26.824 40.009 C -28.964 44.269 -28.964 49.729 -26.824 53.989 L -22.604 53.989 C -23.744 51.529 -23.744 48.699 -25.284 46.239 Z"/>
                      <path fill="#EA4335" d="M -14.754 38.339 C -12.094 38.339 -9.704 39.229 -7.824 40.969 L -7.824 40.969 L -3.524 36.669 C -7.304 33.139 -12.334 30.999 -14.754 30.999 C -19.704 30.999 -24.014 33.809 -26.824 37.459 L -21.434 44.739 C -19.524 40.429 -15.184 38.339 -14.754 38.339 Z"/>
                    </g>
                  </svg>
                )}
                S'inscrire avec Google
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevenirHote;
