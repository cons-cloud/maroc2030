import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadMultipleImages, deleteImage } from '../../lib/storage';
import { X, Upload, Trash2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface AnnonceFormProps {
  annonce?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const AnnonceForm: React.FC<AnnonceFormProps> = ({ annonce, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: annonce?.title || '',
    description: annonce?.description || '',
    category: annonce?.category || 'Service',
    price: annonce?.price || '',
    city: annonce?.city || '',
    contact_name: annonce?.contact_name || '',
    contact_phone: annonce?.contact_phone || '',
    contact_email: annonce?.contact_email || '',
    available: annonce?.available ?? true,
    featured: annonce?.featured ?? false,
  });
  const [images, setImages] = useState<string[]>(annonce?.images || []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls = await uploadMultipleImages(Array.from(files), 'annonces');
      setImages([...images, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} photo(s) ajoutée(s)`);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
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
        price: formData.price ? parseFloat(formData.price as any) : null,
      };

      if (annonce?.id) {
        const { error } = await supabase.from('annonces').update(dataToSave).eq('id', annonce.id);
        if (error) throw error;
        toast.success('Annonce modifiée');
      } else {
        const { error } = await supabase.from('annonces').insert([dataToSave]);
        if (error) throw error;
        toast.success('Annonce créée');
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
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">{annonce ? 'Modifier l\'annonce' : 'Nouvelle annonce'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Photos *</label>
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
            <label className="flex items-center justify-center px-4 py-3 bg-cyan-50 text-cyan-600 rounded-lg cursor-pointer hover:bg-cyan-100 transition border-2 border-dashed border-cyan-300">
              <Upload className="h-5 w-5 mr-2" />
              {uploadingImages ? 'Téléchargement...' : 'Ajouter des photos'}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImages} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                <option>Service</option>
                <option>Emploi</option>
                <option>Immobilier</option>
                <option>Véhicule</option>
                <option>Électronique</option>
                <option>Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix (MAD)</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" placeholder="Optionnel" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
              <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du contact *</label>
              <input type="text" required value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
              <input type="tel" required value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea required rows={5} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.available} onChange={(e) => setFormData({ ...formData, available: e.target.checked })} className="w-5 h-5 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500" />
              <span className="text-sm font-medium text-gray-700">Disponible</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-5 h-5 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500" />
              <span className="text-sm font-medium text-gray-700">À la une</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">Annuler</button>
            <button type="submit" disabled={loading || images.length === 0} className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading && <Loader className="h-5 w-5 animate-spin" />}
              {annonce ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnonceForm;
