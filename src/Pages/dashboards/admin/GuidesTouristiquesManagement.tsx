import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { UserCheck, Plus, Edit, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../../components/DashboardLayout';
import GuideForm from '../../../components/forms/GuideForm';
import ConfirmDialog from '../../../components/modals/ConfirmDialog';

const GuidesTouristiquesManagement: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [guideToDelete, setGuideToDelete] = useState<any>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('guides_touristiques')
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
    setSelectedGuide(null);
    setShowForm(true);
  };

  const handleEdit = (guide: any) => {
    setSelectedGuide(guide);
    setShowForm(true);
  };

  const handleDeleteClick = (guide: any) => {
    setGuideToDelete(guide);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!guideToDelete) return;
    try {
      const { error } = await supabase.from('guides_touristiques').delete().eq('id', guideToDelete.id);
      if (error) throw error;
      toast.success('Guide supprimé');
      setShowConfirm(false);
      setGuideToDelete(null);
      loadItems();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredItems = items.filter(item =>
    item.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Guides Touristiques</h1>
            <p className="text-gray-600 mt-1">{filteredItems.length} guide(s)</p>
          </div>
          <button onClick={handleNew} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            <Plus className="h-5 w-5 mr-2" />
            Nouveau Guide
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
                {item.photo_url ? (
                  <img src={item.photo_url} alt={item.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserCheck className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {item.featured && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">⭐</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{item.full_name}</h3>
                <div className="flex items-center text-yellow-500 my-2">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">{item.rating || 0} ({item.reviews_count || 0} avis)</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.bio}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  {item.languages?.slice(0, 3).map((lang: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">{lang}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <span className="text-lg font-bold text-emerald-600">{item.price_per_day} MAD</span>
                    <span className="text-sm text-gray-500">/jour</span>
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
            <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun guide trouvé</h3>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <GuideForm
          guide={selectedGuide}
          onClose={() => {
            setShowForm(false);
            setSelectedGuide(null);
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
            setGuideToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Supprimer le guide"
          message={`Êtes-vous sûr de vouloir supprimer "${guideToDelete?.full_name}" ?`}
          type="danger"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}
    </DashboardLayout>
  );
};

export default GuidesTouristiquesManagement;
