import React, { useState } from 'react';
import { Building, Phone, MapPin, CheckCircle, XCircle, Trash2, Loader2, Banknote, CreditCard, Edit, Save, X } from 'lucide-react';
import { validateBankAccount, validateIBAN } from '../../utils/validation';
import { toast } from 'react-hot-toast';

interface PartnerCardProps {
  partner: any;
  onVerify: (partner: any) => Promise<void>;
  onDelete: (partner: any) => void;
  loadingActions: Record<string, boolean>;
  onBankDetailsChange: (partnerId: string, field: string, value: string) => void;
  onSaveBankDetails: (partnerId: string) => Promise<void>;
  onToggleBankDetails: (partnerId: string) => void;
  showBankDetails: Record<string, boolean>;
  editingBankDetails: Record<string, boolean>;
  bankDetails: Record<string, { bank_account?: string; iban?: string }>;
  setEditingBankDetails: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const PartnerCard: React.FC<PartnerCardProps> = ({
  partner,
  onVerify,
  onDelete,
  loadingActions,
  onBankDetailsChange,
  onSaveBankDetails,
  onToggleBankDetails,
  showBankDetails,
  editingBankDetails,
  bankDetails,
  setEditingBankDetails
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [bankErrors, setBankErrors] = useState<{ bank_account?: string; iban?: string }>({});

  const handleSaveBankDetails = async (partnerId: string) => {
    // Validation
    const bankAccountValidation = validateBankAccount(bankDetails[partnerId]?.bank_account || '');
    const ibanValidation = validateIBAN(bankDetails[partnerId]?.iban || '');
    
    if (!bankAccountValidation.isValid || !ibanValidation.isValid) {
      setBankErrors({
        bank_account: bankAccountValidation.error,
        iban: ibanValidation.error
      });
      return;
    }
    
    setBankErrors({});
    setIsSaving(true);
    try {
      await onSaveBankDetails(partnerId);
      setEditingBankDetails(prev => ({ ...prev, [partnerId]: false }));
      toast.success('Informations bancaires mises à jour avec succès');
    } catch (error) {
      console.error('Error saving bank details:', error);
      toast.error('Erreur lors de la mise à jour des informations bancaires');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'partner_hotel': 'Hôtelier',
      'partner_car': 'Location de voitures',
      'partner_tour': 'Circuits touristiques',
      'partner': 'Partenaire général'
    };
    return labels[role] || role;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition">
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
          onClick={() => onToggleBankDetails(partner.id)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          aria-expanded={showBankDetails[partner.id]}
          aria-controls={`bank-details-${partner.id}`}
        >
          <span className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            Informations bancaires
          </span>
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
          <div id={`bank-details-${partner.id}`} className="mt-3 space-y-3">
            {editingBankDetails[partner.id] ? (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Numéro de compte</label>
                  <input
                    type="text"
                    value={bankDetails[partner.id]?.bank_account || ''}
                    onChange={(e) => onBankDetailsChange(partner.id, 'bank_account', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      bankErrors.bank_account ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Numéro de compte"
                  />
                  {bankErrors.bank_account && (
                    <p className="mt-1 text-xs text-red-500">{bankErrors.bank_account}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">IBAN</label>
                  <input
                    type="text"
                    value={bankDetails[partner.id]?.iban || ''}
                    onChange={(e) => onBankDetailsChange(partner.id, 'iban', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      bankErrors.iban ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="IBAN"
                  />
                  {bankErrors.iban && (
                    <p className="mt-1 text-xs text-red-500">{bankErrors.iban}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => {
                      setEditingBankDetails(prev => ({ ...prev, [partner.id]: false }));
                      setBankErrors({});
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" /> Annuler
                  </button>
                  <button
                    onClick={() => handleSaveBankDetails(partner.id)}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 flex items-center gap-1"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Enregistrer
                      </>
                    )}
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
                    onClick={() => {
                      setEditingBankDetails(prev => ({
                        ...prev,
                        [partner.id]: true
                      }));
                      onBankDetailsChange(partner.id, 'bank_account', partner.bank_account || '');
                      onBankDetailsChange(partner.id, 'iban', partner.iban || '');
                    }}
                    className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" /> Modifier
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 flex items-center justify-between rounded-b-lg">
        <div className="space-x-2">
          <button
            onClick={() => onVerify(partner)}
            disabled={loadingActions[`verify_${partner.id}`]}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ${
              partner.is_verified
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            aria-label={partner.is_verified ? 'Retirer la vérification' : 'Vérifier le partenaire'}
            aria-busy={loadingActions[`verify_${partner.id}`]}
          >
            {loadingActions[`verify_${partner.id}`] ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : partner.is_verified ? (
              <><XCircle className="h-4 w-4" /> Retirer</>
            ) : (
              <><CheckCircle className="h-4 w-4" /> Vérifier</>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(partner)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Supprimer"
            aria-label="Supprimer le partenaire"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PartnerCard);
