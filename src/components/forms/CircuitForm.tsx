import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadMultipleImages, deleteImage } from '../../lib/storage';
import { X, Upload, Trash2, Loader, Plus } from 'lucide-react';
import { useToast } from '../ui/use-toast';

interface CircuitFormProps {
  circuit?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const CircuitForm: React.FC<CircuitFormProps> = ({ circuit, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: circuit?.title || '',
    description: circuit?.description || '',
    duration_days: circuit?.duration_days || 1,
    price_per_person: circuit?.price_per_person || '',
    destinations: circuit?.destinations || [],
    included_services: circuit?.included_services || [],
    max_participants: circuit?.max_participants || '',
    difficulty_level: circuit?.difficulty_level || 'Facile',
    available: circuit?.available ?? true,
    featured: circuit?.featured ?? false,
  });
  const [images, setImages] = useState<string[]>(circuit?.images || []);
  const [newDestination, setNewDestination] = useState('');
  const [newService, setNewService] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls = await uploadMultipleImages(Array.from(files), 'circuits');
      setImages([...images, ...uploadedUrls]);
      toast.success('Succès', `${uploadedUrls.length} photo(s) ajoutée(s) avec succès`);
    } catch (error) {
      toast.error('Erreur', 'Une erreur est survenue lors du téléchargement des images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string, index: number) => {
    try {
      await deleteImage(imageUrl);
      setImages(images.filter((_, i) => i !== index));
      toast.success('Succès', 'La photo a été supprimée avec succès');
    } catch (error) {
      toast.error('Erreur', 'Une erreur est survenue lors de la suppression de la photo');
    }
  };

  const addDestination = () => {
    if (newDestination.trim()) {
      setFormData({ ...formData, destinations: [...formData.destinations, newDestination.trim()] });
      setNewDestination('');
    }
  };

  const removeDestination = (index: number) => {
    setFormData({ ...formData, destinations: formData.destinations.filter((_: any, i: number) => i !== index) });
  };

  const addService = () => {
    if (newService.trim()) {
      setFormData({ ...formData, included_services: [...formData.included_services, newService.trim()] });
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setFormData({ ...formData, included_services: formData.included_services.filter((_: any, i: number) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        images,
        price_per_person: parseFloat(formData.price_per_person as any),
        duration_days: parseInt(formData.duration_days as any),
        max_participants: formData.max_participants ? parseInt(formData.max_participants as any) : null,
      };

      if (circuit?.id) {
        const { error } = await supabase.from('circuits_touristiques').update(dataToSave).eq('id', circuit.id);
        if (error) throw error;
        toast.success('Succès', 'Les modifications ont été enregistrées avec succès');
      } else {
        const { error } = await supabase.from('circuits_touristiques').insert([dataToSave]);
        if (error) throw error;
        toast.success('Succès', 'Le circuit a été créé avec succès');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Erreur', error.message || 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[70vh] overflow-y-auto shadow-2xl my-8">
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">{circuit ? 'Modifier le circuit' : 'Nouveau circuit'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Photos du circuit *</label>
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
            <label className="flex items-center justify-center px-4 py-3 bg-teal-50 text-teal-600 rounded-lg cursor-pointer hover:bg-teal-100 transition border-2 border-dashed border-teal-300">
              <Upload className="h-5 w-5 mr-2" />
              {uploadingImages ? 'Téléchargement...' : 'Ajouter des photos'}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImages} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée (jours) *</label>
              <input type="number" required min="1" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix par personne (MAD) *</label>
              <input type="number" required value={formData.price_per_person} onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Participants max</label>
              <input type="number" min="1" value={formData.max_participants} onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulté *</label>
              <select value={formData.difficulty_level} onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option>Facile</option>
                <option>Modéré</option>
                <option>Difficile</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destinations</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={newDestination} onChange={(e) => setNewDestination(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDestination())} placeholder="Ex: Marrakech, Fès..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              <button type="button" onClick={addDestination} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
                <Plus className="h-5 w-5" /> Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.destinations.map((dest: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm flex items-center gap-2">
                  {dest}
                  <button type="button" onClick={() => removeDestination(index)} className="hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Services inclus</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={newService} onChange={(e) => setNewService(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())} placeholder="Ex: Hébergement, Transport..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              <button type="button" onClick={addService} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
                <Plus className="h-5 w-5" /> Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.included_services.map((service: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm flex items-center gap-2">
                  {service}
                  <button type="button" onClick={() => removeService(index)} className="hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.available} onChange={(e) => setFormData({ ...formData, available: e.target.checked })} className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500" />
              <span className="text-sm font-medium text-gray-700">Disponible</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500" />
              <span className="text-sm font-medium text-gray-700">À la une</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">Annuler</button>
            <button type="submit" disabled={loading || images.length === 0} className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading && <Loader className="h-5 w-5 animate-spin" />}
              {circuit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CircuitForm;
