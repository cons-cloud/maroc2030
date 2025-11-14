import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FC } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Plus, Edit, Trash2, Search, ArrowLeft } from 'lucide-react';
import ImageWithFallback from '../../../components/common/ImageWithFallback';
import toast from 'react-hot-toast';
import VoitureForm from '../../../components/forms/VoitureForm';

interface Voiture {
  id: string;
  partner_id?: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  available: boolean;
  description?: string;
  category?: string;
  fuel_type?: string;
  transmission?: string;
  seats?: number;
  doors?: number;
  has_ac?: boolean;
  has_gps?: boolean;
  has_bluetooth?: boolean;
  city?: string;
  contact_phone?: string;
  featured?: boolean;
  images?: string[];
  created_at: string;
  updated_at?: string;
}

const LocationsVoituresManagement: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isNew = pathname.endsWith('/new');
  const isEdit = pathname.includes('/edit');
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedVoiture, setSelectedVoiture] = useState<Voiture | null>(null);
  const [voitureToDelete, setVoitureToDelete] = useState<Voiture | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // Charger les voitures
  const loadVoitures = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations_voitures')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setVoitures(data);
      }
    } catch (error) {
      console.error('Error loading voitures:', error);
      toast.error('Erreur lors du chargement des voitures');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effet pour charger les données
  useEffect(() => {
    if (isEdit && id) {
      const loadVoiture = async () => {
        try {
          const { data, error } = await supabase
            .from('locations_voitures')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          
          setSelectedVoiture(data);
          setShowForm(true);
        } catch (error) {
          console.error('Error loading voiture:', error);
          toast.error('Erreur lors du chargement de la voiture');
        }
      };
      
      loadVoiture();
    } else if (isNew) {
      setSelectedVoiture(null);
      setShowForm(true);
    } else {
      loadVoitures();
    }
  }, [isEdit, isNew, id, loadVoitures]);

  // Gérer la suppression d'une voiture
  const handleDelete = useCallback(async (id: string): Promise<void> => {
    if (!id) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('locations_voitures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('La voiture a été supprimée avec succès');
      loadVoitures();
    } catch (error) {
      console.error('Error deleting voiture:', error);
      toast.error('Une erreur est survenue lors de la suppression de la voiture');
    } finally {
      setLoading(false);
      setVoitureToDelete(null);
      setShowConfirm(false);
    }
  }, [loadVoitures]);

  // Gérer le clic sur le bouton de suppression
  const handleDeleteClick = useCallback((voiture: Voiture) => {
    setVoitureToDelete(voiture);
    setShowConfirm(true);
  }, []);

  // Confirmer la suppression
  const handleConfirmDelete = useCallback(() => {
    if (voitureToDelete) {
      handleDelete(voitureToDelete.id);
    }
  }, [voitureToDelete, handleDelete]);

  // Gérer la soumission du formulaire
  const handleSubmitForm = useCallback(async (formData: any) => {
    try {
      setLoading(true);
      
      if (selectedVoiture) {
        // Mise à jour d'une voiture existante
        const { error } = await supabase
          .from('locations_voitures')
          .update({
            brand: formData.brand,
            model: formData.model,
            year: formData.year,
            price_per_day: formData.price_per_day,
            available: formData.available,
            images: formData.images,
            description: formData.description,
            category: formData.category,
            fuel_type: formData.fuel_type,
            transmission: formData.transmission,
            seats: formData.seats,
            doors: formData.doors,
            has_ac: formData.has_ac,
            has_gps: formData.has_gps,
            has_bluetooth: formData.has_bluetooth,
            city: formData.city,
            contact_phone: formData.contact_phone,
            featured: formData.featured,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedVoiture.id);

        if (error) throw error;
        
        toast.success('Voiture mise à jour avec succès');
      } else {
        // Création d'une nouvelle voiture
        const { error } = await supabase
          .from('locations_voitures')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
        
        toast.success('Voiture ajoutée avec succès');
      }
      
      loadVoitures();
      setShowForm(false);
      setSelectedVoiture(null);
    } catch (error) {
      console.error('Error saving voiture:', error);
      toast.error('Une erreur est survenue lors de la sauvegarde de la voiture');
    } finally {
      setLoading(false);
    }
  }, [selectedVoiture, loadVoitures]);

  // Filtrer les voitures
  const filteredVoitures = useMemo(() => {
    if (!searchTerm.trim()) return voitures;
    
    const search = searchTerm.toLowerCase();
    return voitures.filter(voiture => 
      voiture.brand?.toLowerCase().includes(search) || 
      voiture.model?.toLowerCase().includes(search) ||
      voiture.year?.toString().includes(search)
    );
  }, [voitures, searchTerm]);

  // Rendu du composant
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des voitures de location</h1>
        <button
          onClick={() => {
            setSelectedVoiture(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une voiture
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une voiture..."
            className="pl-10 pr-4 py-2 border rounded-md w-full max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des voitures */}
      {loading ? (
        <div>Chargement...</div>
      ) : filteredVoitures.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucune voiture trouvée
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVoitures.map((voiture) => (
            <div key={voiture.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-100 relative">
                <ImageWithFallback
                  src={voiture.images?.[0]}
                  alt={`${voiture.brand} ${voiture.model}`}
                  fallbackSrc="/placeholder-car.jpg"
                  className="w-full h-full"
                  showCount={voiture.images?.length}
                />
                {!voiture.available && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Non disponible
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {voiture.brand} {voiture.model}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Année: {voiture.year}
                    </p>
                    {voiture.city && (
                      <p className="text-gray-600 text-sm">
                        Ville: {voiture.city}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {voiture.price_per_day} MAD/jour
                    </p>
                    <span
                      className={`text-xs ${
                        voiture.available ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {voiture.available ? 'Disponible' : 'Non disponible'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setSelectedVoiture(voiture);
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600"
                    aria-label="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(voiture)}
                    className="p-2 text-gray-600 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire modal */}
      {showForm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/80 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedVoiture ? 'Modifier la voiture' : 'Ajouter une voiture'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedVoiture(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <VoitureForm
              voiture={selectedVoiture}
              onSubmit={handleSubmitForm}
              onClose={() => {
                setShowForm(false);
                setSelectedVoiture(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      {showConfirm && voitureToDelete && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/80 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200/50">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer la voiture {voitureToDelete.brand} {voitureToDelete.model} ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsVoituresManagement;