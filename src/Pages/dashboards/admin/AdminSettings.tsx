import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminSettings() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres Administrateur</h1>
          <p className="text-gray-600 mt-1">
            Gérer les paramètres de l'administration
          </p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Paramètres généraux
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Configuration des paramètres généraux de l'administration
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Nom d'utilisateur
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
{profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.company_name || 'Non défini'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Adresse email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile?.email || 'Non défini'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Rôle
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {profile?.role || 'Non défini'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Paramètres avancés
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Configuration avancée du système
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500">
            Les paramètres avancés seront disponibles dans une prochaine mise à jour.
          </p>
        </div>
      </div>
    </div>
  );
}
