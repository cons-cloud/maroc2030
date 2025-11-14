import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Mail, Phone, MapPin, Building, FileText, Save, Loader, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const PartnerProfile = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    description: '',
    bank_account: '',
    iban: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        description: profile.description || '',
        bank_account: profile.bank_account || '',
        iban: profile.iban || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: formData.company_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          description: formData.description,
          bank_account: formData.bank_account,
          iban: formData.iban,
        })
        .eq('id', profile?.id);

      if (error) throw error;

      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getPartnerTypeLabel = (type?: string) => {
    const types: Record<string, string> = {
      partner_tourism: 'Tourisme',
      partner_car: 'Location de voitures',
      partner_realestate: 'Immobilier',
    };
    return types[type || ''] || type || 'Partenaire';
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-green-600 flex items-center justify-center text-white text-3xl font-bold">
                  {formData.company_name.charAt(0) || 'P'}
                </div>
                <button className="absolute bottom-0 right-0 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {formData.company_name || 'Nom de l\'entreprise'}
                </h1>
                <p className="text-gray-600">{formData.email}</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2">
                  {getPartnerTypeLabel(profile?.role)}
                </span>
              </div>
            </div>
            {profile?.is_verified && (
              <div className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Compte vérifié
              </div>
            )}
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Informations de l'entreprise
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom de l'entreprise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+212 6 12 34 56 78"
                  required
                />
              </div>

              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Ville *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Meknès"
                  required
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Adresse complète *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Avenue Mohammed VI"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Description de l'entreprise
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Décrivez votre entreprise et vos services..."
              />
            </div>

            {/* Informations bancaires */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Informations bancaires
                </h3>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  Obligatoire pour les paiements
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Compte bancaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de compte bancaire *
                  </label>
                  <input
                    type="text"
                    name="bank_account"
                    value={formData.bank_account}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="123456789"
                    required
                  />
                  {!formData.bank_account && (
                    <p className="mt-1 text-xs text-red-600">Ce champ est obligatoire</p>
                  )}
                </div>

                {/* IBAN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN *
                  </label>
                  <input
                    type="text"
                    name="iban"
                    value={formData.iban}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="MA00 0000 0000 0000 0000 0000"
                    required
                  />
                  {!formData.iban && (
                    <p className="mt-1 text-xs text-red-600">Ce champ est obligatoire</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Important :</span> Vos informations bancaires sont nécessaires pour que nous puissions vous verser vos revenus. 
                  Ces informations sont sécurisées et ne seront utilisées qu'à cette fin.
                </p>
              </div>
            </div>

            {/* Bouton de soumission */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm py-4 border-t border-gray-200 -mx-6 px-6">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white font-medium rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Enregistrement en cours...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Enregistrer toutes les modifications
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Toutes les modifications seront enregistrées, y compris les informations bancaires
              </p>
            </div>
          </form>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gains totaux</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {profile?.total_earnings?.toLocaleString() || 0} MAD
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {profile?.pending_earnings?.toLocaleString() || 0} MAD
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payés</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {profile?.paid_earnings?.toLocaleString() || 0} MAD
                </p>
              </div>
              <div className="bg-emerald-100 rounded-full p-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PartnerProfile;
