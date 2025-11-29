import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  MapPin,
  Eye,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react';

interface Annonce {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  city: string;
  contact_phone: string;
  contact_email: string;
  images: string[];
  available: boolean;
  expiry_date: string;
  created_at: string;
}

const PartnerAnnonces = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState<Annonce | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'services',
    price: 0,
    city: '',
    contact_phone: '',
    contact_email: '',
    expiry_date: '',
    available: true
  });

  const categories = [
    { value: 'immobilier', label: 'Immobilier' },
    { value: 'vehicules', label: 'Véhicules' },
    { value: 'emploi', label: 'Emploi' },
    { value: 'services', label: 'Services' },
    { value: 'loisirs', label: 'Loisirs' },
    { value: 'autres', label: 'Autres' }
  ];

  useEffect(() => {
    if (user) {
      loadAnnonces();
    }
  }, [user]);

  const loadAnnonces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('annonces')
        .select('*')
        .eq('partner_id', user?.id)
        .eq('is_partner_annonce', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnonces(data || []);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur', 'Une erreur est survenue lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const annonceData = {
        ...formData,
        partner_id: user?.id,
        is_partner_annonce: true,
        images: []
      };

      if (selectedAnnonce) {
        const { error } = await supabase
          .from('annonces')
          .update(annonceData)
          .eq('id', selectedAnnonce.id);

        if (error) throw error;
        toast.success('Succès', 'L\'annonce a été modifiée avec succès');
      } else {
        const { error } = await supabase
          .from('annonces')
          .insert([annonceData]);

        if (error) throw error;
        toast.success('Succès', 'L\'annonce a été créée avec succès');
      }

      setShowForm(false);
      setSelectedAnnonce(null);
      resetForm();
      loadAnnonces();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur', 'Une erreur est survenue lors de la sauvegarde de l\'annonce');
    }
  };

  const handleEdit = (annonce: Annonce) => {
    setSelectedAnnonce(annonce);
    setFormData({
      title: annonce.title,
      description: annonce.description,
      category: annonce.category,
      price: annonce.price,
      city: annonce.city,
      contact_phone: annonce.contact_phone,
      contact_email: annonce.contact_email,
      expiry_date: annonce.expiry_date,
      available: annonce.available
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;

    try {
      const { error } = await supabase
        .from('annonces')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Succès', 'L\'annonce a été supprimée avec succès');
      loadAnnonces();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur', 'Une erreur est survenue lors de la suppression de l\'annonce');
    }
  };

  const toggleAvailability = async (annonce: Annonce) => {
    try {
      const { error } = await supabase
        .from('annonces')
        .update({ available: !annonce.available })
        .eq('id', annonce.id);

      if (error) throw error;
      toast.success('Succès', annonce.available ? 'L\'annonce a été désactivée' : 'L\'annonce a été activée');
      loadAnnonces();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur', 'Une erreur est survenue lors de la modification de l\'annonce');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'services',
      price: 0,
      city: '',
      contact_phone: '',
      contact_email: '',
      expiry_date: '',
      available: true
    });
  };

  const stats = {
    total: annonces.length,
    active: annonces.filter(a => a.available).length,
    expired: annonces.filter(a => a.expiry_date && new Date(a.expiry_date) < new Date()).length,
    byCategory: categories.map(cat => ({
      ...cat,
      count: annonces.filter(a => a.category === cat.value).length
    }))
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Annonces</h1>
          <p className="text-gray-600 mt-1">Gérez vos annonces</p>
        </div>
        <button
          onClick={() => {
            setSelectedAnnonce(null);
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Créer une annonce
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Megaphone className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actives</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expirées</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <Eye className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {selectedAnnonce ? 'Modifier l\'annonce' : 'Créer une annonce'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (MAD)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone de contact
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'expiration
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Disponible</span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedAnnonce(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors"
              >
                {selectedAnnonce ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des annonces */}
      {annonces.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-12 text-center">
          <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune annonce pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {annonces.map((annonce) => {
            const isExpired = annonce.expiry_date && new Date(annonce.expiry_date) < new Date();
            
            return (
              <div key={annonce.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        annonce.available && !isExpired ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {annonce.available && !isExpired ? 'Active' : isExpired ? 'Expirée' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                        {categories.find(c => c.value === annonce.category)?.label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(annonce)}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleAvailability(annonce)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(annonce.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{annonce.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{annonce.description}</p>

                  <div className="space-y-2">
                    {annonce.price > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-bold text-emerald-600">{annonce.price} MAD</span>
                      </div>
                    )}
                    {annonce.city && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{annonce.city}</span>
                      </div>
                    )}
                    {annonce.contact_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{annonce.contact_phone}</span>
                      </div>
                    )}
                    {annonce.contact_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{annonce.contact_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
  );
};

export default PartnerAnnonces;
