import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { ROUTES } from '../../config/routes';

export default function Reauthenticate() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast.error('Veuillez entrer votre mot de passe');
      return;
    }

    try {
      setLoading(true);
      
      // Vérifier le mot de passe actuel
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password,
      });

      if (error) throw error;
      
      if (user) {
        // Si la réauthentification réussit, on peut effectuer l'action sensible
        // Ici, vous pouvez ajouter la logique pour l'action qui nécessite une réauthentification
        // Par exemple, la suppression du compte, le changement d'email, etc.
        
        // Stocker un indicateur de réauthentification réussie dans le localStorage
        localStorage.setItem('reauthenticated', 'true');
        
        // Rediriger vers la page précédente ou la page d'accueil
        navigate(-1 as any); // Retour à la page précédente
        
        toast.success('Réauthentification réussie');
      }
    } catch (error: any) {
      console.error('Erreur lors de la réauthentification:', error);
      toast.error('Mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Vérification de sécurité
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Pour des raisons de sécurité, veuillez confirmer votre identité
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">Mot de passe actuel</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe actuel"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {loading ? 'Vérification en cours...' : 'Confirmer'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
