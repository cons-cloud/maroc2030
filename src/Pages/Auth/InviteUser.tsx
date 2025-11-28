import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { ROUTES } from '../../config/routes';

type Role = 'client' | 'partner' | 'admin';

const roleOptions = [
  { value: 'client', label: 'Client' },
  { value: 'partner', label: 'Partenaire' },
  { value: 'admin', label: 'Administrateur' },
];

export default function InviteUser() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('client');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Veuillez entrer une adresse email');
      return;
    }

    try {
      setLoading(true);
      
      // Envoyer l'invitation par email
      const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${window.location.origin}${ROUTES.SIGNUP}`,
        data: { role },
      });

      if (error) throw error;
      
      toast.success(`Invitation envoyée à ${email}`);
      setEmail('');
      
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
      toast.error(error.message || 'Une erreur est survenue lors de l\'envoi de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Inviter un utilisateur</h1>
          <p className="mt-2 text-sm text-gray-600">
            Envoyez une invitation à un nouvel utilisateur pour qu'il puisse rejoindre la plateforme.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adresse email de l'invité
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rôle
            </label>
            <select
              id="role"
              name="role"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h.01a1 1 0 100-2H11v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  L'utilisateur recevra un email avec un lien pour finaliser son inscription et définir son mot de passe.
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
              Retour
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
