import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/use-toast';
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader,
  MapPin,
  DollarSign,
  Package,
  FileText,
  Save,
  Trash2
} from 'lucide-react';

interface ProductFormProps {
  product?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Formulaire
  const [formData, setFormData] = useState({
    title: product?.title || '',
    product_type: product?.product_type || 'appartement',
    description: product?.description || '',
    price: product?.price || '',
    city: product?.city || '',
    address: product?.address || '',
    capacity: product?.capacity || '',
    bedrooms: product?.bedrooms || '',
    bathrooms: product?.bathrooms || '',
    amenities: product?.amenities || [],
    main_image: product?.main_image || '',
    images: product?.images || [],
    available: product?.available ?? true,
  });

  const productTypes = [
    { value: 'appartement', label: '🏢 Appartement', category: 'immobilier' },
    { value: 'villa', label: '🏡 Villa', category: 'immobilier' },
    { value: 'hotel', label: '🏨 Hôtel', category: 'immobilier' },
    { value: 'riad', label: '🕌 Riad', category: 'immobilier' },
    { value: 'voiture', label: '🚗 Voiture', category: 'transport' },
    { value: 'circuit', label: '🗺️ Circuit Touristique', category: 'tourisme' },
  ];

  const cities = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 
    'Agadir', 'Meknès', 'Oujda', 'Essaouira', 'Chefchaouen'
  ];

  const amenitiesList = [
    'WiFi', 'Climatisation', 'Parking', 'Piscine', 'Cuisine équipée',
    'TV', 'Lave-linge', 'Balcon', 'Jardin', 'Vue sur mer',
    'Salle de sport', 'Ascenseur', 'Sécurité 24/7', 'Animaux acceptés'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a: string) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Erreur', 'Veuillez sélectionner une image valide (format JPG, PNG ou WebP)');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Erreur', 'La taille de l\'image ne doit pas dépasser 5 Mo');
      return;
    }

    try {
      setUploadingImage(true);

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) throw error;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      if (isMain) {
        setFormData(prev => ({ ...prev, main_image: publicUrl }));
        toast.success('Succès', 'L\'image principale a été ajoutée avec succès');
      } else {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, publicUrl]
        }));
        toast.success('Succès', 'L\'image a été ajoutée à la galerie avec succès');
      }
    } catch (error: any) {
      console.error('Erreur upload:', error);
      toast.error('Erreur', 'Une erreur est survenue lors du téléchargement de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.price || !formData.city) {
      toast.error('Champs manquants', 'Veuillez remplir tous les champs obligatoires marqués d\'un astérisque (*)');
      return;
    }

    if (!formData.main_image) {
      toast.error('Image manquante', 'Veuillez ajouter au moins une image principale pour ce produit');
      return;
    }

    try {
      setLoading(true);

      const productData = {
        partner_id: user?.id,
        title: formData.title,
        product_type: formData.product_type,
        description: formData.description,
        price: parseFloat(formData.price),
        city: formData.city,
        address: formData.address,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        amenities: formData.amenities,
        main_image: formData.main_image,
        images: formData.images,
        available: formData.available,
      };

      if (product?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('partner_products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Succès', 'Les modifications ont été enregistrées avec succès');
      } else {
        // Création
        const { error } = await supabase
          .from('partner_products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Succès', 'Le produit a été créé avec succès');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur', error.message || 'Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const isImmobilier = ['appartement', 'villa', 'hotel', 'riad'].includes(formData.product_type);

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[70vh] overflow-y-auto my-8">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Modifier le produit' : 'Ajouter un produit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type de produit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de produit *
            </label>
            <select
              name="product_type"
              value={formData.product_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {productTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Appartement moderne avec vue sur mer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Décrivez votre produit en détail..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Prix et Ville */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (MAD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="1000"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une ville</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Ex: 123 Avenue Mohammed V"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Champs spécifiques à l'immobilier */}
          {isImmobilier && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacité (personnes)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chambres
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  placeholder="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salles de bain
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  placeholder="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Équipements */}
          {isImmobilier && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Équipements et services
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {amenitiesList.map(amenity => (
                  <label
                    key={amenity}
                    className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded text-emerald-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Image principale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image principale *
            </label>
            {formData.main_image ? (
              <div className="relative">
                <img
                  src={formData.main_image}
                  alt="Image principale"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, main_image: '' }))}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploadingImage ? (
                    <Loader className="w-12 h-12 text-emerald-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600">Cliquez pour uploader</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG jusqu'à 5MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>

          {/* Galerie d'images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Galerie d'images (optionnel)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image: string, index: number) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {formData.images.length < 8 && (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  {uploadingImage ? (
                    <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Ajouter</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Disponibilité */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
              className="rounded text-emerald-600 focus:ring-blue-500 w-5 h-5"
            />
            <label htmlFor="available" className="text-sm font-medium text-gray-700">
              Produit disponible à la réservation
            </label>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {product ? 'Mettre à jour' : 'Créer le produit'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
