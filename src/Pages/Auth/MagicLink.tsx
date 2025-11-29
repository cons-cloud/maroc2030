import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { ROUTES } from '../../config/routes';

export default function MagicLink() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${ROUTES.EMAIL_CONFIRM}`,
        },
      });

      if (error) throw error;
      
      setEmailSent(true);
      toast.success('Succès', 'Lien de connexion envoyé avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du lien magique:', error);
      toast.error('Erreur', error.message || 'Une erreur est survenue lors de l\'envoi du lien');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion par lien magique
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {emailSent 
              ? 'Vérifiez votre boîte mail pour vous connecter'
              : 'Entrez votre adresse email pour recevoir un lien de connexion sécurisé'}
          </p>
        </div>
        
        {!emailSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Adresse email</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien magique'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="text-green-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Nous avons envoyé un lien de connexion sécurisé à <span className="font-medium">{email}</span>.
              Vérifiez votre boîte de réception et cliquez sur le lien pour vous connecter.
            </p>
            <button
              onClick={() => {
                setEmail('');
                setEmailSent(false);
              }}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
            >
              Utiliser une autre adresse email
            </button>
          </div>
        )}
        
        <div className="text-center mt-4">
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
