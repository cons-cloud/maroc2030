import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Users, Search, Filter, Plus, Trash2, CheckCircle, XCircle, Phone, MapPin, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import PartnerForm from '../../../components/forms/PartnerForm';
import ConfirmDialog from '../../../components/modals/ConfirmDialog';

const PartnersManagement: React.FC = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'partner_hotel' | 'partner_car' | 'partner_tour'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingPartner, setDeletingPartner] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState<{[key: string]: boolean}>({});
  const [editingBankDetails, setEditingBankDetails] = useState<{[key: string]: boolean}>({});
  const [bankDetails, setBankDetails] = useState<{
    [key: string]: {
      bank_account?: string;
      iban?: string;
    }
  }>({});

  useEffect(() => {
    loadPartners();
    
    // Recharger les données quand la page devient visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadPartners();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .like('role', 'partner%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error loading partners:', error);
      toast.error('Erreur lors du chargement des partenaires');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPartner) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deletingPartner.id);

      if (error) throw error;

      // Recharger la liste des partenaires
      await loadPartners();
      toast.success('Partenaire supprimé avec succès');
      setDeletingPartner(null);
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Erreur lors de la suppression du partenaire');
    } finally {
      setIsDeleting(false);
    }
  };

  // Afficher/masquer les détails bancaires
  const toggleBankDetails = (partnerId: string) => {
    setShowBankDetails(prev => ({
      ...prev,
      [partnerId]: !prev[partnerId]
    }));
  };

  // Activer/désactiver l'édition des détails bancaires
  const toggleEditBankDetails = (partnerId: string, partner: any) => {
    setEditingBankDetails(prev => ({
      ...prev,
      [partnerId]: !prev[partnerId]
    }));

    // Initialiser les champs d'édition
    if (!editingBankDetails[partnerId]) {
      setBankDetails(prev => ({
        ...prev,
        [partnerId]: {
          bank_account: partner.bank_account || '',
          iban: partner.iban || ''
        }
      }));
    }
  };

  // Gérer le changement des champs de détails bancaires
  const handleBankDetailsChange = (partnerId: string, field: string, value: string) => {
    setBankDetails(prev => ({
      ...prev,
      [partnerId]: {
        ...prev[partnerId],
        [field]: value
      }
    }));
  };

  // Sauvegarder les modifications des détails bancaires
  const saveBankDetails = async (partnerId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bank_account: bankDetails[partnerId]?.bank_account || null,
          iban: bankDetails[partnerId]?.iban || null
        })
        .eq('id', partnerId);

      if (error) throw error;

      // Mettre à jour l'affichage
      await loadPartners();
      setEditingBankDetails(prev => ({
        ...prev,
        [partnerId]: false
      }));
      toast.success('Informations bancaires mises à jour avec succès');
    } catch (error) {
      console.error('Error updating bank details:', error);
      toast.error('Erreur lors de la mise à jour des informations bancaires');
    }
  };

  const handleToggleVerification = async (partner: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !partner.is_verified })
        .eq('id', partner.id);

      if (error) throw error;

      toast.success(partner.is_verified ? 'Partenaire non vérifié' : 'Partenaire vérifié');
      loadPartners();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    loadPartners();
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = 
      partner.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.phone?.includes(searchTerm) ||
      partner.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'verified' && partner.is_verified) ||
      (filterStatus === 'pending' && !partner.is_verified);
    
    const matchesRole = 
      filterRole === 'all' ||
      partner.role === filterRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'partner_hotel': 'Hôtelier',
      'partner_car': 'Location de voitures',
      'partner_tour': 'Circuits touristiques',
      'partner': 'Partenaire général'
    };
    return labels[role] || role;
  };

  const stats = {
    total: partners.length,
    verified: partners.filter(p => p.is_verified).length,
    pending: partners.filter(p => !p.is_verified).length,
    hotels: partners.filter(p => p.role === 'partner_hotel').length,
    cars: partners.filter(p => p.role === 'partner_car').length,
    tours: partners.filter(p => p.role === 'partner_tour').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Partenaires</h1>
          <p className="text-gray-600 mt-1">{filteredPartners.length} partenaire(s) sur {partners.length}</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="h-5 w-5" />
          Nouveau Partenaire
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          <div className="text-sm text-gray-600">Vérifiés</div>
        </div>
        <div className="bg-orange-50 rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">En attente</div>
        </div>
        <div className="bg-emerald-50 rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-emerald-600">{stats.hotels}</div>
          <div className="text-sm text-gray-600">Hôteliers</div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.cars}</div>
          <div className="text-sm text-gray-600">Locations</div>
        </div>
        <div className="bg-indigo-50 rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-indigo-600">{stats.tours}</div>
          <div className="text-sm text-gray-600">Circuits</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filtre statut */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="verified">Vérifiés</option>
              <option value="pending">En attente</option>
            </select>
          </div>

          {/* Filtre rôle */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="all">Tous les types</option>
              <option value="partner_hotel">Hôteliers</option>
              <option value="partner_car">Locations de voitures</option>
              <option value="partner_tour">Circuits touristiques</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des partenaires */}
      {filteredPartners.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun partenaire trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <div key={partner.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition">
              {/* En-tête de la carte */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Building className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{partner.company_name || 'Partenaire'}</h3>
                      <span className="text-xs text-gray-500">{getRoleLabel(partner.role)}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    partner.is_verified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {partner.is_verified ? '✓ Vérifié' : 'En attente'}
                  </div>
                </div>

                {/* Informations */}
                <div className="space-y-2 text-sm text-gray-600">
                  {partner.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {partner.phone}
                    </div>
                  )}
                  {partner.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {partner.city}
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    Inscrit le {new Date(partner.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              {/* Informations bancaires */}
              <div className="border-t border-gray-100 p-4">
                <button
                  onClick={() => toggleBankDetails(partner.id)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  <span>Informations bancaires</span>
                  <svg
                    className={`h-4 w-4 transform transition-transform ${
                      showBankDetails[partner.id] ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showBankDetails[partner.id] && (
                  <div className="mt-3 space-y-3">
                    {editingBankDetails[partner.id] ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Numéro de compte</label>
                          <input
                            type="text"
                            value={bankDetails[partner.id]?.bank_account || ''}
                            onChange={(e) => handleBankDetailsChange(partner.id, 'bank_account', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Numéro de compte"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">IBAN</label>
                          <input
                            type="text"
                            value={bankDetails[partner.id]?.iban || ''}
                            onChange={(e) => handleBankDetailsChange(partner.id, 'iban', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="IBAN"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <button
                            onClick={() => toggleEditBankDetails(partner.id, partner)}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => saveBankDetails(partner.id)}
                            className="px-3 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-primary/90"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Compte bancaire</p>
                          <p className="text-sm font-medium">
                            {partner.bank_account || 'Non renseigné'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">IBAN</p>
                          <p className="text-sm font-mono">
                            {partner.iban || 'Non renseigné'}
                          </p>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => toggleEditBankDetails(partner.id, partner)}
                            className="text-xs text-primary hover:underline"
                          >
                            Modifier
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <div className="space-x-2">
                  <button
                    onClick={() => handleToggleVerification(partner)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ${
                      partner.is_verified
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {partner.is_verified ? (
                      <><XCircle className="h-4 w-4" /> Retirer</>
                    ) : (
                      <><CheckCircle className="h-4 w-4" /> Vérifier</>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeletingPartner(partner)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout/modification */}
      {isFormOpen && (
        <PartnerForm
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      {/* Confirmation de suppression */}
      {deletingPartner && (
        <ConfirmDialog
          isOpen={true}
          title="Supprimer le partenaire"
          message={`Êtes-vous sûr de vouloir supprimer ${deletingPartner.company_name || 'ce partenaire'} ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          onConfirm={handleDelete}
          onClose={() => setDeletingPartner(null)}
          type="danger"
          loading={isDeleting}
        />
      )}
    </div>
  );
};

// Exportation nommée pour la compatibilité avec React.lazy
export { PartnersManagement as default };
