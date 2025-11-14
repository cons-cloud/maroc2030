import React, { useState } from 'react';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { X, Loader, UserCog, Mail, Phone, MapPin, Building } from 'lucide-react';
import toast from 'react-hot-toast';

interface PartnerFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company_name: '',
    full_name: '',
    phone: '',
    city: '',
    service_type: 'tourism',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('=== CRÉATION PARTENAIRE ===');
      console.log('Email:', formData.email);
      console.log('Type:', formData.service_type);

      // Utiliser l'API admin pour créer l'utilisateur sans restrictions
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true, // Confirmer l'email automatiquement
        user_metadata: {
          full_name: formData.full_name,
          company_name: formData.company_name,
          phone: formData.phone,
          city: formData.city,
          role: `partner_${formData.service_type}`,
          service_type: formData.service_type,
        },
      });

      if (authError) {
        console.error('❌ Erreur création auth:', authError);
        throw authError;
      }

      console.log('✅ Utilisateur créé:', authData.user?.id);
      console.log('✅ Email confirmé:', authData.user?.email_confirmed_at);

      // Créer le profil dans la table profiles
      if (authData.user) {
        console.log('Création du profil...');
        
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert([{
            id: authData.user.id,
            role: `partner_${formData.service_type}`,
            company_name: formData.company_name,
            phone: formData.phone,
            city: formData.city,
            partner_type: formData.service_type,
            is_verified: true,
          }]);

        if (insertError) {
          console.error('❌ Erreur création profil:', insertError);
          // Si le profil existe déjà, essayer de le mettre à jour
          if (insertError.code === '23505') {
            console.log('Profil existe, mise à jour...');
            const { error: updateError } = await supabaseAdmin
              .from('profiles')
              .update({
                role: `partner_${formData.service_type}`,
                company_name: formData.company_name,
                phone: formData.phone,
                city: formData.city,
                partner_type: formData.service_type,
              })
              .eq('id', authData.user.id);

            if (updateError) {
              console.error('❌ Erreur mise à jour profil:', updateError);
              throw updateError;
            }
            console.log('✅ Profil mis à jour');
          } else {
            throw insertError;
          }
        } else {
          console.log('✅ Profil créé');
        }
      }

      console.log('=== SUCCÈS ===');
      toast.success(`Partenaire créé avec succès !\nEmail: ${formData.email}\nMot de passe: ${formData.password}\n\nLe partenaire peut maintenant se connecter.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ ERREUR GLOBALE:', error);
      toast.error(error.message || 'Erreur lors de la création du partenaire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[70vh] overflow-y-auto shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center">
            <UserCog className="h-6 w-6 mr-3" />
            <h2 className="text-2xl font-bold">Nouveau partenaire</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom de l'entreprise */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom de l'entreprise *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Hôtel Royal"
              />
            </div>
          </div>

          {/* Nom du responsable */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du responsable *
            </label>
            <div className="relative">
              <UserCog className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ahmed Benali"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="contact@hotelroyal.ma"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Téléphone *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+212 5 22 12 34 56"
              />
            </div>
          </div>

          {/* Ville */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ville *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Marrakech"
              />
            </div>
          </div>

          {/* Type de service */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type de service *
            </label>
            <select
              required
              value={formData.service_type}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="tourism">Tourisme (Hôtels, Circuits, Guides)</option>
              <option value="car">Location de voiture</option>
              <option value="realestate">Immobilier (Appartements, Villas)</option>
            </select>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Création...
                </>
              ) : (
                'Créer le partenaire'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartnerForm;
