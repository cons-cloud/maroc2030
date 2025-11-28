import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { ROUTES } from '../../config/routes';

export default function UpdateEmail() {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [currentEmail, setCurrentEmail] = useState('');

  useEffect(() => {
    // Récupérer l'email actuel de l'utilisateur
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCurrentEmail(user.email);
      } else {
        // Rediriger vers la connexion si l'utilisateur n'est pas connecté
        navigate(ROUTES.LOGIN);
      }
    };
    
    getUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (newEmail === currentEmail) {
      toast.error('Veuvez entrer une nouvelle adresse email différente de l\'actuelle');
      return;
    }

    try {
      setLoading(true);
      
      // D'abord, vérifier le mot de passe actuel
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password,
      });

      if (signInError) throw signInError;
      
      // Ensuite, mettre à jour l'email
      const { error: updateError } = await supabase.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: `${window.location.origin}${ROUTES.EMAIL_CONFIRM}`,
        }
      );

      if (updateError) throw updateError;
      
      // Déconnecter l'utilisateur après le changement d'email
      await supabase.auth.signOut();
      
      toast.success(
        'Un email de confirmation a été envoyé à votre nouvelle adresse. ' +
        'Veuvez confirmer votre nouvelle adresse email avant de vous reconnecter.'
      );
      
      navigate(ROUTES.LOGIN);
    } catch (error: any) {
      console.error('Erreur lors du changement d\'email:', error);
      toast.error(error.message || 'Une erreur est survenue lors du changement d\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Changer d'adresse email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Votre adresse email actuelle est : {currentEmail}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="new-email" className="block text-sm font-medium text-gray-700 mb-1">
                Nouvelle adresse email
              </label>
              <input
                id="new-email"
                name="new-email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Nouvelle adresse email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Votre mot de passe actuel"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Vous serez déconnecté après le changement d'email. Un email de confirmation sera envoyé à votre nouvelle adresse.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1 as any)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Mettre à jour l\'email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
