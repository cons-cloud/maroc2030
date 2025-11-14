import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Calendar, Plus, Edit, Trash2, MapPin } from 'lucide-react';
import ImageWithFallback from '../../../components/common/ImageWithFallback';
import toast from 'react-hot-toast';
import EvenementForm from '../../../components/forms/EvenementForm';
import ConfirmDialog from '../../../components/modals/ConfirmDialog';

const EvenementsManagement: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedEvenement, setSelectedEvenement] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [evenementToDelete, setEvenementToDelete] = useState<any>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      console.log('Chargement des événements...');
      const { data, error, status, statusText } = await supabase
        .from('evenements')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('Réponse de la requête:', { status, statusText, data, error });
      
      if (error) {
        console.error('Erreur détaillée:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      setItems(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      toast.error('Erreur lors du chargement des événements. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedEvenement(null);
    setShowForm(true);
  };

  const handleEdit = (evenement: any) => {
    setSelectedEvenement(evenement);
    setShowForm(true);
  };

  const handleDeleteClick = (evenement: any) => {
    setEvenementToDelete(evenement);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!evenementToDelete) return;
    try {
      const { error } = await supabase.from('evenements').delete().eq('id', evenementToDelete.id);
      if (error) throw error;
      toast.success('Événement supprimé');
      setShowConfirm(false);
      setEvenementToDelete(null);
      loadItems();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Événements</h1>
            <p className="text-gray-600 mt-1">{filteredItems.length} événement(s)</p>
          </div>
          <button onClick={handleNew} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            <Plus className="h-5 w-5 mr-2" />
            Nouvel Événement
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gray-100 group">
                <ImageWithFallback
                  src={item.images?.[0]}
                  alt={item.title}
                  fallbackSrc="/placeholder-event.jpg"
                  className="w-full h-full"
                  showCount={item.images?.length}
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white bg-black/50 px-2 py-1 rounded text-xs">
                    {item.images?.length || 0} image(s)
                  </span>
                </div>
                {item.featured && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">⭐</span>
                )}
                <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${
                  item.status === 'upcoming' ? 'bg-green-500 text-white' : 
                  item.status === 'ongoing' ? 'bg-emerald-500 text-white' : 
                  'bg-gray-500 text-white'
                }`}>
                  {item.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.event_type}</p>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {item.city} - {item.venue}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <span>📅 {new Date(item.start_date).toLocaleDateString('fr-FR')}</span>
                  {item.is_free && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Gratuit</span>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    {item.is_free ? (
                      <span className="text-lg font-bold text-green-600">Gratuit</span>
                    ) : (
                      <>
                        <span className="text-lg font-bold text-emerald-600">{item.price} MAD</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition" title="Modifier">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteClick(item)} className="p-2 text-red-600 hover:bg-red-50 rounded transition" title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <EvenementForm
          evenement={selectedEvenement}
          onClose={() => {
            setShowForm(false);
            setSelectedEvenement(null);
          }}
          onSuccess={() => {
            loadItems();
          }}
        />
      )}

      {showConfirm && (
        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => {
            setShowConfirm(false);
            setEvenementToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Supprimer l'événement"
          message={`Êtes-vous sûr de vouloir supprimer "${evenementToDelete?.title}" ?`}
          type="danger"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}
    </>
  );
};

export default EvenementsManagement;
