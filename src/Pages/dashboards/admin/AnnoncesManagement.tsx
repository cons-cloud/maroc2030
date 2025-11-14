import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Megaphone, Plus, Edit, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import AnnonceForm from '../../../components/forms/AnnonceForm';
import ConfirmDialog from '../../../components/modals/ConfirmDialog';

const AnnoncesManagement: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [annonceToDelete, setAnnonceToDelete] = useState<any>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('annonces')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedAnnonce(null);
    setShowForm(true);
  };

  const handleEdit = (annonce: any) => {
    setSelectedAnnonce(annonce);
    setShowForm(true);
  };

  const handleDeleteClick = (annonce: any) => {
    setAnnonceToDelete(annonce);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!annonceToDelete) return;
    try {
      const { error } = await supabase.from('annonces').delete().eq('id', annonceToDelete.id);
      if (error) throw error;
      toast.success('Annonce supprimée');
      setShowConfirm(false);
      setAnnonceToDelete(null);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Annonces</h1>
          <p className="text-gray-600 mt-1">{filteredItems.length} annonce(s)</p>
        </div>
        <button 
          onClick={handleNew} 
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle Annonce
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
            <div className="relative h-48 bg-gray-200">
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Megaphone className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded ${
                item.status === 'active' ? 'bg-green-500 text-white' : 
                item.status === 'sold' ? 'bg-red-500 text-white' : 
                'bg-gray-500 text-white'
              }`}>
                {item.status}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{item.category}</p>
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                {item.city}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>
              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  {item.price ? (
                    <>
                      <span className="text-lg font-bold text-emerald-600">{item.price} MAD</span>
                      {item.is_negotiable && <span className="text-xs text-gray-500 ml-1">Négociable</span>}
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Prix non spécifié</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(item)} 
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition" 
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(item)} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition" 
                    title="Supprimer"
                  >
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
          <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune annonce trouvée</h3>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <AnnonceForm
          annonce={selectedAnnonce}
          onClose={() => {
            setShowForm(false);
            setSelectedAnnonce(null);
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
            setAnnonceToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Supprimer l'annonce"
          message={`Êtes-vous sûr de vouloir supprimer "${annonceToDelete?.title}" ?`}
          type="danger"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}
    </div>
  );
};

export default AnnoncesManagement;
