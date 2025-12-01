import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Pencil, 
  Trash2, 
  X, 
  Banknote, 
  Building2, 
  Car as CarIcon, 
  Filter as FilterIcon, 
  Hotel, 
  Loader2, 
  Plus, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Clock 
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DataTable, type Column } from "@/components/ui";

// Import des composants UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";

// Composant Switch local avec typage fort
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  className = "",
  disabled = false,
}) => (
  <button
    type="button"
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
      checked ? 'bg-emerald-600' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    role="switch"
    aria-checked={checked}
  >
    <span
      className={`${
        checked ? 'translate-x-6' : 'translate-x-1'
      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
    />
  </button>
);
// Suppression de l'import de Tabs car non utilisé dans ce composant

// Import des composants personnalisés
// Suppression des imports de composants qui seront définis localement

// Import des utilitaires et hooks
import useDebounce from "@/hooks/useDebounce";
import { validateBankAccount, validateIBAN } from "@/utils/validation";
import useErrorHandler from "@/hooks/useErrorHandler";

// Interface pour les props du composant StatCard
interface StatCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  className?: string;
  valueClassName?: string;
  loading?: boolean;
}

// Interface pour les données d'un partenaire
interface Partner {
  id: string;
  company_name: string;
  role: string;
  is_verified: boolean;
  phone?: string;
  city?: string;
  created_at: string;
  bank_account?: string;
  iban?: string;
  email?: string;
  address?: string;
  postal_code?: string;
  country?: string;
  siret?: string;
  vat_number?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  status?: 'active' | 'inactive' | 'pending';
  subscription_plan?: string;
  subscription_status?: string;
  subscription_end_date?: string;
  last_login_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  // Propriétés pour les statistiques
  total?: number;
  verified?: number;
  pending?: number;
  active?: number;
  hotels?: number;
  cars?: number;
  tours?: number;
}

// Composant de carte de statistique
const StatCard: React.FC<StatCardProps> = ({ 
  value, 
  label, 
  icon,
  className = 'bg-white',
  valueClassName = 'text-gray-900',
  loading = false
}) => {
  return (
    <div className={`p-4 rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className={`text-2xl font-bold mt-1 ${valueClassName}`}>
              {value}
            </p>
          )}
        </div>
        <div className="p-2 rounded-full bg-opacity-20 bg-gray-200">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Interface pour les props du composant PartnerForm
interface PartnerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: Partner;
  onSuccess: () => void;
  onClose?: () => void; 
}

// Composant PartnerForm local
const PartnerForm: React.FC<PartnerFormProps> = ({ 
  open, 
  onOpenChange, 
  partner, 
  onSuccess,
  onClose = () => onOpenChange(false) 
}) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        {partner ? 'Modifier le partenaire' : 'Ajouter un partenaire'}
      </h3>
      <div className="space-y-4">
        {/* Champs du formulaire */}
        <div>
          <Label htmlFor="company_name">Nom de l'entreprise</Label>
          <input
            id="company_name"
            type="text"
            className="w-full p-2 border rounded"
            defaultValue={partner?.company_name || ''}
          />
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
          >
            Annuler
          </Button>
          <Button type="submit">
            {partner ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Types de filtres
type FilterStatus = 'all' | 'active' | 'inactive' | 'pending';
type FilterRole = 'all' | 'partner_hotel' | 'partner_car' | 'partner_tour';

// Interface pour les filtres
interface Filters {
  status: FilterStatus;
  role: FilterRole;
  search: string;
}

const ITEMS_PER_PAGE = 10;

const PartnersManagement = () => {
  const { toast } = useToast();
  // États principaux
  const [partners, setPartners] = useState<Partner[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    active: 0,
    hotels: 0,
    cars: 0,
    tours: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [editingPartner, setEditingPartner] = useState<Partner | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filtres
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    role: 'all',
    search: ''
  });
  
  // États pour la gestion des détails bancaires
  const [showBankDetails, setShowBankDetails] = useState<Record<string, boolean>>({});
  const [isEditingBankDetails, setIsEditingBankDetails] = useState<Record<string, boolean>>({});
  const [currentBankDetails, setCurrentBankDetails] = useState<{
    bank_account: string;
    iban: string;
  } | null>(null);
  
  // Détails bancaires en cours d'édition
  const [editingBankDetails, setEditingBankDetails] = useState<{
    bank_account: string;
    iban: string;
  }>({
    bank_account: '',
    iban: ''
  });

  // Suivi des actions en cours
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { error, handleError, resetError } = useErrorHandler();

  // Fonction pour charger les partenaires
  const loadPartners = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      resetError?.();

      // Calculer l'offset pour la pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Construction de la requête de base
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .range(from, to)
        .like('role', 'partner%')
        .order('created_at', { ascending: false });

      // Application des filtres
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }

      // Recherche par terme de recherche
      if (searchTerm) {
        query = query.or(`company_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }

      // Exécution de la requête
      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      const partnersData = data || [];
      setPartners(partnersData);
      setCurrentPage(page);

      // Mettre à jour les statistiques
      setStats({
        total: partnersData.length,
        verified: partnersData.filter(p => p.is_verified).length,
        pending: partnersData.filter(p => p.status === 'pending').length,
        active: partnersData.filter(p => p.status === 'active').length,
        hotels: partnersData.filter(p => p.role === 'partner_hotel').length,
        cars: partnersData.filter(p => p.role === 'partner_car').length,
        tours: partnersData.filter(p => p.role === 'partner_tour').length
      });

      // Mettre à jour le nombre total de pages
      if (count !== null) {
        const calculatedTotalPages = Math.ceil(count / ITEMS_PER_PAGE);
        setTotalPages(calculatedTotalPages);
      }
    } catch (err) {
      handleError(err, 'Erreur lors du chargement des partenaires');
    } finally {
      setLoading(false);
    }
  }, [handleError, resetError]);

  // Chargement initial des partenaires
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
  }, [loadPartners]);

  // Gestion des filtres
  const handleStatusFilterChange = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as 'all' | 'active' | 'inactive' | 'pending' }));
    setCurrentPage(1);
    loadPartners(1);
  };
  
  const handleRoleFilterChange = (role: FilterRole) => {
    setFilters(prev => ({
      ...prev,
      role: role as FilterRole
    }));
    setCurrentPage(1);
    loadPartners(1);
  };

  // Fonction pour gérer la suppression d'un partenaire
  const handleDelete = async (id: string): Promise<void> => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      
      // Suppression du partenaire dans la base de données
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Mise à jour de la liste des partenaires
      await loadPartners(currentPage);
      
      // Fermeture de la boîte de dialogue
      setDeletingPartner(null);
      toast.success('Succès', 'Le partenaire a été supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du partenaire:', error);
      toast.error('Erreur', 'Une erreur est survenue lors de la suppression du partenaire');
    } finally {
      setIsDeleting(false);
    }
  };

  // Basculer la vérification d'un partenaire
  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      setLoadingActions(prev => ({ ...prev, [`verify-${id}`]: true }));
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      setPartners(prev => 
        prev.map(partner => 
          partner.id === id 
            ? { ...partner, is_verified: !currentStatus } 
            : partner
        )
      );
      
      toast.success('Succès', `Le partenaire a été ${!currentStatus ? 'vérifié' : 'désactivé'} avec succès`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de vérification:', error);
      toast.error('Erreur', 'Une erreur est survenue lors de la mise à jour du statut de vérification');
    } finally {
      setLoadingActions(prev => ({ ...prev, [`verify-${id}`]: false }));
    }
  };

  // Gestion des détails bancaires
  const handleBankDetailsChange = (id: string, field: 'bank_account' | 'iban', value: string) => {
    setCurrentBankDetails(prev => ({
      bank_account: prev?.bank_account || '',
      iban: prev?.iban || '',
      [field]: value
    }));
    
    // Mettre à jour l'état d'édition
    setEditingBankDetails(prev => ({
      ...prev,
      [id]: true
    }));
  };

  const handleBankDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner || !currentBankDetails) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bank_account: currentBankDetails.bank_account,
          iban: currentBankDetails.iban
        })
        .eq('id', editingPartner.id);

      if (error) throw error;

      // Mise à jour de l'état local
      setPartners(prev => 
        prev.map(partner => 
          partner.id === editingPartner.id 
            ? { ...partner, ...currentBankDetails }
            : partner
        )
      );
      
      toast.success('Succès', 'Les détails bancaires ont été mis à jour avec succès');
      setEditingBankDetails(prev => ({ 
        ...prev, 
        [editingPartner.id]: false 
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des détails bancaires:', error);
      toast.error('Erreur', 'Une erreur est survenue lors de la mise à jour des détails bancaires');
    }
  };

  // Définition des colonnes du tableau
  const columns: Column<Partner>[] = useMemo(() => [
    {
      key: 'company_name',
      header: "Nom de l'entreprise",
    render: (partner) => (
      <div className="flex items-center space-x-3">
        <div className="shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
          {partner.logo_url ? (
            <img className="h-10 w-10 rounded-full" src={partner.logo_url} alt={partner.company_name} />
          ) : (
            <Building2 className="h-5 w-5 text-gray-500" />
          )}
        </div>
        <span className="font-medium">{partner.company_name}</span>
      </div>
    )
  },
  {
    key: 'email',
    header: 'Email',
    render: (partner) => partner.email || 'Non fourni'
  },
  {
    key: 'status',
    header: 'Statut',
    render: (partner) => (
      <Badge 
        variant={
          partner.status === 'active' 
            ? 'default' 
            : partner.status === 'pending' 
              ? 'secondary' 
              : 'destructive'
        }
      >
        {partner.status === 'active' ? 'Actif' : partner.status === 'pending' ? 'En attente' : 'Inactif'}
      </Badge>
    )
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (partner) => (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setEditingPartner(partner);
            setIsFormOpen(true);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setDeletingPartner(partner);
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    )
  }
  ], []);

  // Fonction pour fermer le formulaire et recharger les données
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingPartner(null);
    loadPartners(currentPage);
  }, [currentPage, loadPartners]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des partenaires</h1>
        <Button 
          onClick={() => {
            setEditingPartner(null);
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un partenaire
          </Button>
        </div>
        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            value={stats.total}
            label="Total Partenaires"
            icon={<Users className="h-5 w-5 text-blue-600" />}
            className="bg-blue-50"
            valueClassName="text-blue-600"
          />
          <StatCard
            value={stats.verified}
            label="Vérifiés"
            icon={<ShieldCheck className="h-5 w-5 text-green-600" />}
            className="bg-green-50"
            valueClassName="text-green-600"
          />
          <StatCard
            value={stats.pending}
            label="En attente"
            icon={<Clock className="h-5 w-5 text-yellow-600" />}
            className="bg-yellow-50"
            valueClassName="text-yellow-600"
          />
          <StatCard
            value={stats.active}
            label="Actifs"
            icon={<Check className="h-5 w-5 text-emerald-600" />}
            className="bg-emerald-50"
            valueClassName="text-emerald-600"
          />
          <StatCard
            value={stats.hotels}
            label="Hôtels"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-indigo-600"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
            className="bg-indigo-50" 
            valueClassName="text-indigo-600"
          />
          <StatCard
            value={stats.cars}
            label="Voitures"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-orange-600"
              >
                <path d="M21 3c-3.95 0-7.85 1.35-10.45 3.5c-3.5 2.55-5.5 6.15-5.5 10.5v.5h15v-.5c0-4.35-1.95-8-5.5-10.5c-2.6-2.15-6.5-3.5-10.45-3.5z" />
              </svg>
            }
            className="bg-orange-50" 
            valueClassName="text-orange-600"
          />
          <StatCard
            value={stats.tours}
            label="Circuits touristiques"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-purple-600"
              >
                <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" />
              </svg>
            }
            className="bg-purple-50" 
            valueClassName="text-purple-600"
          />
        </div>

        {/* Filtres */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un partenaire..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value as FilterStatus})}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="pending">En attente</option>
              </select>
              
              <select
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value as FilterRole})}
              >
                <option value="all">Tous les rôles</option>
                <option value="hotel">Hôtel</option>
                <option value="car">Voiture</option>
                <option value="tourism">Tourisme</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des partenaires */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable
            columns={columns}
            data={partners}
            loading={loading}
            onRowClick={(partner) => {
              setEditingPartner(partner);
              setIsFormOpen(true);
            }}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: loadPartners
            }}
          />
        </div>

        {/* Formulaire d'édition/ajout */}
        <PartnerForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          partner={editingPartner}
          onSuccess={handleFormClose}
        />

        {/* Confirmation de suppression */}
        {deletingPartner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                Supprimer le partenaire
              </h3>
              <p className="mb-6">
                Êtes-vous sûr de vouloir supprimer {deletingPartner?.company_name || 'ce partenaire'} ?
                <br />
                <span className="text-red-600 font-medium">Cette action est irréversible.</span>
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingPartner(null)}
                >
                  Annuler
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                  onClick={() => handleDelete(deletingPartner.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default PartnersManagement;
