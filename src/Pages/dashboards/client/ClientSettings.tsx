import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Navbar from '../../../components/Navbar';
import { Lock, Bell, Shield, Trash2, Save, Loader, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ClientSettings = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    bookingUpdates: true,
    promotions: false,
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

  const handleNotificationChange = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications],
    });
    toast.success('Préférences mises à jour');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ ATTENTION : Cette action est irréversible !\n\nÊtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données seront définitivement supprimées.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'Dernière confirmation : Voulez-vous vraiment supprimer votre compte ?'
    );

    if (!doubleConfirm) return;

    setLoading(true);

    try {
      // Supprimer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile?.id);

      if (profileError) throw profileError;

      toast.success('Compte supprimé avec succès');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Erreur lors de la suppression du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-green-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-gray-600 mt-2">Gérez vos préférences et la sécurité de votre compte</p>
            </div>

            {/* Sécurité - Changer le mot de passe */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center mb-6">
                <Lock className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Sécurité</h2>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Minimum 6 caractères"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Modification...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Modifier le mot de passe
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Notifications */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center mb-6">
                <Bell className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Notifications par email</h3>
                    <p className="text-sm text-gray-500">Recevoir des emails de notification</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('emailNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.emailNotifications ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white/80 backdrop-blur-sm transition-transform ${
                        notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Mises à jour de réservation</h3>
                    <p className="text-sm text-gray-500">Être notifié des changements de réservation</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('bookingUpdates')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.bookingUpdates ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white/80 backdrop-blur-sm transition-transform ${
                        notifications.bookingUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Promotions et offres</h3>
                    <p className="text-sm text-gray-500">Recevoir des offres spéciales</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('promotions')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.promotions ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white/80 backdrop-blur-sm transition-transform ${
                        notifications.promotions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Zone de danger */}
            <div className="bg-red-50/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-red-100">
              <div className="flex items-center mb-6">
                <Shield className="w-6 h-6 text-red-600 mr-3" />
                <h2 className="text-xl font-semibold text-red-900">Zone de danger</h2>
              </div>

              <p className="text-red-700 mb-4">
                La suppression de votre compte est définitive et irréversible. Toutes vos données seront perdues.
              </p>

              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientSettings;
