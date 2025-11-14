import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Lock, Bell, Globe, Trash2, Save, Loader, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PartnerSettings = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // État pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // État pour les notifications
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailPayments: true,
    emailMessages: true,
    pushNotifications: false,
  });

  // État pour les préférences
  const [preferences, setPreferences] = useState({
    language: 'fr',
    currency: 'MAD',
    timezone: 'Africa/Casablanca',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success('Mot de passe modifié avec succès !');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Erreur lors de la modification du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
    toast.success('Préférences de notification mises à jour');
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: string) => {
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'ATTENTION : Toutes vos données seront définitivement supprimées. Confirmez-vous la suppression ?'
    );

    if (!doubleConfirm) return;

    setLoading(true);

    try {
      // Supprimer le profil (cascade supprimera les données liées)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile?.id);

      if (error) throw error;

      // Déconnexion
      await supabase.auth.signOut();
      toast.success('Compte supprimé avec succès');
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error('Erreur lors de la suppression du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-1">Gérez vos préférences et la sécurité de votre compte</p>
        </div>

        {/* Sécurité - Changement de mot de passe */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
              <p className="text-sm text-gray-600">Modifiez votre mot de passe</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Modifier le mot de passe
                </>
              )}
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Bell className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">Gérez vos préférences de notification</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notifications de réservation</p>
                <p className="text-sm text-gray-600">Recevoir un email pour chaque nouvelle réservation</p>
              </div>
              <button
                onClick={() => handleNotificationChange('emailBookings')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.emailBookings ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white/80 backdrop-blur-sm transition-transform ${
                    notifications.emailBookings ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notifications de paiement</p>
                <p className="text-sm text-gray-600">Recevoir un email pour chaque paiement reçu</p>
              </div>
              <button
                onClick={() => handleNotificationChange('emailPayments')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.emailPayments ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white/80 backdrop-blur-sm transition-transform ${
                    notifications.emailPayments ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Messages</p>
                <p className="text-sm text-gray-600">Recevoir un email pour les nouveaux messages</p>
              </div>
              <button
                onClick={() => handleNotificationChange('emailMessages')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.emailMessages ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white/80 backdrop-blur-sm transition-transform ${
                    notifications.emailMessages ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notifications push</p>
                <p className="text-sm text-gray-600">Recevoir des notifications sur votre appareil</p>
              </div>
              <button
                onClick={() => handleNotificationChange('pushNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.pushNotifications ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white/80 backdrop-blur-sm transition-transform ${
                    notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Préférences */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Préférences</h2>
              <p className="text-sm text-gray-600">Personnalisez votre expérience</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devise
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="MAD">Dirham marocain (MAD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dollar américain (USD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuseau horaire
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Africa/Casablanca">Casablanca (GMT+1)</option>
                <option value="Europe/Paris">Paris (GMT+1)</option>
                <option value="Europe/London">Londres (GMT)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Zone de danger */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-red-900">Zone de danger</h2>
              <p className="text-sm text-red-700">Actions irréversibles</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-red-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Supprimer mon compte</h3>
                <p className="text-sm text-gray-600">
                  Une fois votre compte supprimé, toutes vos données seront définitivement effacées. 
                  Cette action est irréversible.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                Supprimer le compte
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PartnerSettings;
