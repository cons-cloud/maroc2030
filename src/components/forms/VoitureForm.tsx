import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadMultipleImages, deleteImage } from '../../lib/storage';
import { X, Upload, Trash2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoitureFormProps {
  voiture?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const VoitureForm: React.FC<VoitureFormProps> = ({ voiture, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    brand: voiture?.brand || '',
    model: voiture?.model || '',
    year: voiture?.year || new Date().getFullYear(),
    description: voiture?.description || '',
    price_per_day: voiture?.price_per_day || '',
    category: voiture?.category || 'Économique',
    fuel_type: voiture?.fuel_type || 'Essence',
    transmission: voiture?.transmission || 'Manuelle',
    seats: voiture?.seats || 5,
    doors: voiture?.doors || 4,
    has_ac: voiture?.has_ac ?? true,
    has_gps: voiture?.has_gps ?? false,
    has_bluetooth: voiture?.has_bluetooth ?? false,
    city: voiture?.city || '',
    contact_phone: voiture?.contact_phone || '',
    available: voiture?.available ?? true,
    featured: voiture?.featured ?? false,
  });
  const [images, setImages] = useState<string[]>(voiture?.images || []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls = await uploadMultipleImages(Array.from(files), 'voitures');
      setImages([...images, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} photo(s) ajoutée(s)`);
    } catch (error) {
      toast.error('Erreur lors du téléchargement des images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string, index: number) => {
    try {
      await deleteImage(imageUrl);
      setImages(images.filter((_, i) => i !== index));
      toast.success('Photo supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        images,
        price_per_day: parseFloat(formData.price_per_day as any),
        year: parseInt(formData.year as any),
        seats: parseInt(formData.seats as any),
        doors: parseInt(formData.doors as any),
      };

      if (voiture?.id) {
        const { error } = await supabase
          .from('locations_voitures')
          .update(dataToSave)
          .eq('id', voiture.id);
        if (error) throw error;
        toast.success('Voiture modifiée avec succès');
      } else {
        const { error } = await supabase
          .from('locations_voitures')
          .insert([dataToSave]);
        if (error) throw error;
        toast.success('Voiture créée avec succès');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[70vh] overflow-y-auto shadow-2xl my-8">
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">
            {voiture ? 'Modifier la voiture' : 'Nouvelle voiture'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Photos de la voiture *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img src={img} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  <button type="button" onClick={() => handleDeleteImage(img, index)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center px-4 py-3 bg-orange-50 text-orange-600 rounded-lg cursor-pointer hover:bg-orange-100 transition border-2 border-dashed border-orange-300">
              <Upload className="h-5 w-5 mr-2" />
              {uploadingImages ? 'Téléchargement...' : 'Ajouter des photos'}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImages} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marque *</label>
              <input type="text" required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modèle *</label>
              <input type="text" required value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Année *</label>
              <input type="number" required min="2000" max={new Date().getFullYear() + 1} value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix par jour (MAD) *</label>
              <input type="number" required value={formData.price_per_day} onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>Économique</option>
                <option>Compacte</option>
                <option>Berline</option>
                <option>SUV</option>
                <option>4x4</option>
                <option>Luxe</option>
                <option>Utilitaire</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carburant *</label>
              <select value={formData.fuel_type} onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>Essence</option>
                <option>Diesel</option>
                <option>Hybride</option>
                <option>Électrique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transmission *</label>
              <select value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>Manuelle</option>
                <option>Automatique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Places *</label>
              <input type="number" required min="2" max="9" value={formData.seats} onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portes *</label>
              <input type="number" required min="2" max="5" value={formData.doors} onChange={(e) => setFormData({ ...formData, doors: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
              <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.has_ac} onChange={(e) => setFormData({ ...formData, has_ac: e.target.checked })} className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500" />
              <span className="text-sm font-medium text-gray-700">Climatisation</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.has_gps} onChange={(e) => setFormData({ ...formData, has_gps: e.target.checked })} className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500" />
              <span className="text-sm font-medium text-gray-700">GPS</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.has_bluetooth} onChange={(e) => setFormData({ ...formData, has_bluetooth: e.target.checked })} className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500" />
              <span className="text-sm font-medium text-gray-700">Bluetooth</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.available} onChange={(e) => setFormData({ ...formData, available: e.target.checked })} className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500" />
              <span className="text-sm font-medium text-gray-700">Disponible</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500" />
              <span className="text-sm font-medium text-gray-700">À la une</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">Annuler</button>
            <button type="submit" disabled={loading || images.length === 0} className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading && <Loader className="h-5 w-5 animate-spin" />}
              {voiture ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoitureForm;
