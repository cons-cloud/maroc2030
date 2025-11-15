import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Navbar from '../../../components/Navbar';
import { User, Mail, Phone, MapPin, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

// Interface pour typer les données du profil
interface UserProfile {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  [key: string]: any; // Pour les propriétés supplémentaires
}

const ClientProfileComponent = () => {
  console.log('[ClientProfile] Rendu du composant');
  
  // État pour gérer le chargement et les erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer les données d'authentification
  let profile: UserProfile | null = null;
  let authLoading: boolean = false;
  let user: any = null;
  try {
    console.log('[ClientProfile] Appel de useAuth()');
    const authData = useAuth();
    profile = authData.profile;
    authLoading = authData.loading;
    user = authData.user;
    
    console.log('[ClientProfile] Données d\'authentification:', { 
      profile: profile ? 'Défini' : 'Non défini',
      authLoading,
      user: user ? 'Connecté' : 'Non connecté'
    });
  } catch (err) {
    console.error('[ClientProfile] Erreur lors de la récupération des données d\'authentification:', err);
    setError('Impossible de charger les données d\'authentification');
  }
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  // Mettre à jour le formulaire lorsque le profil est chargé
  useEffect(() => {
    if (profile) {
      console.log('[ClientProfile] Mise à jour du formulaire avec les données du profil');
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile['id']);
        
      if (error) throw error;
      
      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Afficher un écran de chargement pendant le chargement des données d'authentification
  if (authLoading) {
    console.log('[ClientProfile] Affichage du chargeur de chargement');
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }
  
  // Afficher un message d'erreur s'il y en a un
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Vérifier que le profil est chargé
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Profil non trouvé</h2>
          <p className="text-gray-700 mb-4">Impossible de charger les informations du profil.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-green-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-linear-to-r from-primary to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                  {formData.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {formData.first_name} {formData.last_name}
                  </h1>
                  <p className="text-gray-600">{formData.email}</p>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <div className="text-sm text-gray-500">
                      Membre depuis {profile && profile['created_at'] 
                        ? new Date(profile['created_at']).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                          })
                        : 'Date inconnue'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informations personnelles
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Prénom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nom
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Email (non modifiable) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+212 6 12 34 56 78"
                  />
                </div>

                {/* Adresse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Adresse
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Votre adresse"
                  />
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Votre ville"
                  />
                </div>

                {/* Bouton de soumission */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Exportation directe du composant
export default ClientProfileComponent;
