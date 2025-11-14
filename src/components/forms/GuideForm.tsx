import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadMultipleImages, deleteImage } from '../../lib/storage';
import { X, Upload, Trash2, Loader, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface GuideFormProps {
  guide?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const GuideForm: React.FC<GuideFormProps> = ({ guide, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    name: guide?.name || '',
    description: guide?.description || '',
    specialties: guide?.specialties || [],
    languages: guide?.languages || [],
    experience_years: guide?.experience_years || '',
    price_per_day: guide?.price_per_day || '',
    city: guide?.city || '',
    contact_phone: guide?.contact_phone || '',
    contact_email: guide?.contact_email || '',
    available: guide?.available ?? true,
    featured: guide?.featured ?? false,
  });
  const [images, setImages] = useState<string[]>(guide?.images || []);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls = await uploadMultipleImages(Array.from(files), 'guides');
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

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData({ ...formData, specialties: [...formData.specialties, newSpecialty.trim()] });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setFormData({ ...formData, specialties: formData.specialties.filter((_: any, i: number) => i !== index) });
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setFormData({ ...formData, languages: [...formData.languages, newLanguage.trim()] });
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    setFormData({ ...formData, languages: formData.languages.filter((_: any, i: number) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        images,
        price_per_day: parseFloat(formData.price_per_day as any),
        experience_years: parseInt(formData.experience_years as any),
      };

      if (guide?.id) {
        const { error } = await supabase.from('guides_touristiques').update(dataToSave).eq('id', guide.id);
        if (error) throw error;
        toast.success('Guide modifié');
      } else {
        const { error } = await supabase.from('guides_touristiques').insert([dataToSave]);
        if (error) throw error;
        toast.success('Guide créé');
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
        <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">{guide ? 'Modifier le guide' : 'Nouveau guide touristique'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Photos du guide *</label>
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
            <label className="flex items-center justify-center px-4 py-3 bg-amber-50 text-amber-600 rounded-lg cursor-pointer hover:bg-amber-100 transition border-2 border-dashed border-amber-300">
              <Upload className="h-5 w-5 mr-2" />
              {uploadingImages ? 'Téléchargement...' : 'Ajouter des photos'}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImages} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Années d'expérience *</label>
              <input type="number" required min="0" value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix par jour (MAD) *</label>
              <input type="number" required value={formData.price_per_day} onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
              <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
              <input type="tel" required value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Spécialités</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())} placeholder="Ex: Circuits désert, Histoire..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              <button type="button" onClick={addSpecialty} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
                <Plus className="h-5 w-5" /> Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((spec: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm flex items-center gap-2">
                  {spec}
                  <button type="button" onClick={() => removeSpecialty(index)} className="hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Langues parlées</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())} placeholder="Ex: Français, Anglais..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              <button type="button" onClick={addLanguage} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
                <Plus className="h-5 w-5" /> Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.languages.map((lang: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm flex items-center gap-2">
                  {lang}
                  <button type="button" onClick={() => removeLanguage(index)} className="hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.available} onChange={(e) => setFormData({ ...formData, available: e.target.checked })} className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500" />
              <span className="text-sm font-medium text-gray-700">Disponible</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500" />
              <span className="text-sm font-medium text-gray-700">À la une</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">Annuler</button>
            <button type="submit" disabled={loading || images.length === 0} className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading && <Loader className="h-5 w-5 animate-spin" />}
              {guide ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuideForm;
