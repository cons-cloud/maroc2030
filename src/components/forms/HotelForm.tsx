import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadMultipleImages, deleteImage } from '../../lib/storage';
import { X, Upload, Trash2, Loader } from 'lucide-react';
import { useToast } from '../ui/use-toast';

interface HotelFormProps {
  hotel?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const HotelForm: React.FC<HotelFormProps> = ({ hotel, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    name: hotel?.name || '',
    description: hotel?.description || '',
    price_per_night: hotel?.price_per_night || '',
    city: hotel?.city || '',
    region: hotel?.region || '',
    address: hotel?.address || '',
    stars: hotel?.stars || 3,
    amenities: hotel?.amenities || [],
    contact_phone: hotel?.contact_phone || '',
    contact_email: hotel?.contact_email || '',
    available: hotel?.available ?? true,
    featured: hotel?.featured ?? false,
  });
  const [images, setImages] = useState<string[]>(hotel?.images || []);
  const [newAmenity, setNewAmenity] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls = await uploadMultipleImages(Array.from(files), 'hotels');
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

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_: any, i: number) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        images,
        price_per_night: parseFloat(formData.price_per_night as any),
        stars: parseInt(formData.stars as any),
      };

      if (hotel?.id) {
        const { error } = await supabase
          .from('hotels')
          .update(dataToSave)
          .eq('id', hotel.id);
        if (error) throw error;
        toast.success('Succès', 'Les modifications ont été enregistrées avec succès');
      } else {
        const { error } = await supabase
          .from('hotels')
          .insert([dataToSave]);
        if (error) throw error;
        toast.success('Succès', 'L\'hôtel a été créé avec succès');
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
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[70vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {hotel ? 'Modifier l\'hôtel' : 'Nouvel hôtel'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Photos de l'hôtel
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img, index)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center px-4 py-3 bg-emerald-50 text-emerald-600 rounded-lg cursor-pointer hover:bg-emerald-100 transition border-2 border-dashed border-blue-300">
              <Upload className="h-5 w-5 mr-2" />
              {uploadingImages ? 'Téléchargement...' : 'Ajouter des photos'}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImages}
              />
            </label>
          </div>

          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'hôtel *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix par nuit (MAD) *
              </label>
              <input
                type="number"
                required
                value={formData.price_per_night}
                onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Région
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Étoiles *
              </label>
              <select
                value={formData.stars}
                onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} étoile{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Équipements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Équipements
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                placeholder="Ex: Piscine, Spa..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity: string, index: number) => (
                <span key={index} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                  {amenity}
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(index)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Disponible</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">À la une</span>
            </label>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader className="h-5 w-5 animate-spin" />}
              {hotel ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelForm;
