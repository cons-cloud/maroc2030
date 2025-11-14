import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { uploadMultipleImages, deleteImage } from '../../../lib/storage';
import { ArrowLeft, Upload, X, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../../components/DashboardLayout';

interface ServiceFormData {
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  price: number;
  price_per: string;
  category_id: string;
  location: string;
  city: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  available: boolean;
  featured: boolean;
  images: string[];
  contact_phone: string;
  contact_email: string;
  features: any;
}

const ServiceForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    price: 0,
    price_per: 'jour',
    category_id: '',
    location: '',
    city: '',
    region: '',
    latitude: null,
    longitude: null,
    available: true,
    featured: false,
    images: [],
    contact_phone: '',
    contact_email: '',
    features: {},
  });

  useEffect(() => {
    loadCategories();
    if (isEditMode) {
      loadService();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadService = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          ...data,
          images: data.images || [],
        });
      }
    } catch (error) {
      console.error('Error loading service:', error);
      toast.error('Erreur lors du chargement du service');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const filesArray = Array.from(files);
      const urls = await uploadMultipleImages(filesArray, 'services');
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));

      toast.success(`${urls.length} image(s) ajoutée(s)`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Erreur lors de l\'upload des images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (url: string) => {
    try {
      await deleteImage(url, 'services');
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== url),
      }));
      toast.success('Image supprimée');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category_id || !formData.price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const serviceData = {
        ...formData,
        partner_id: user.id,
        price: Number(formData.price),
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Service modifié avec succès');
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;
        toast.success('Service créé avec succès');
      }

      navigate('/dashboard/admin/services');
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/admin/services')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à la liste
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Modifier le service' : 'Nouveau service'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-emerald-500 transition-colors bg-white/80 backdrop-blur-sm">
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-40 object-cover bg-gray-100"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1 text-xs"
                    title="Supprimer cette image"
                  >
                    <X className="h-3 w-3" />
                    Supprimer
                  </button>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-600 text-white text-xs font-semibold rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center bg-emerald-50 hover:bg-emerald-100 transition-colors">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="images"
                className="cursor-pointer flex flex-col items-center"
              >
                {uploading ? (
                  <>
                    <Loader className="h-16 w-16 text-emerald-600 animate-spin mb-3" />
                    <span className="text-base font-medium text-emerald-700">Upload en cours...</span>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-emerald-600 rounded-full mb-3">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-base font-medium text-gray-700 mb-1">
                      Cliquez pour ajouter des images
                    </span>
                    <span className="text-sm text-gray-500">
                      ou glissez-déposez vos fichiers ici
                    </span>
                    <span className="text-xs text-gray-400 mt-2">
                      JPG, PNG, WEBP • Max 5MB par image • Upload multiple supporté
                    </span>
                  </>
                )}
              </label>
            </div>
            
            {formData.images.length > 0 && (
              <p className="text-sm text-gray-600 mt-3">
                📸 {formData.images.length} image(s) ajoutée(s)
              </p>
            )}
          </div>

          {/* Informations de base */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de base</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre (Arabe)
                </label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  dir="rtl"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Arabe)
                </label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix * (MAD)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix par
                </label>
                <select
                  value={formData.price_per}
                  onChange={(e) => setFormData({ ...formData, price_per: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="jour">Jour</option>
                  <option value="nuit">Nuit</option>
                  <option value="personne">Personne</option>
                  <option value="heure">Heure</option>
                  <option value="semaine">Semaine</option>
                  <option value="mois">Mois</option>
                </select>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Région
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
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
                  Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Options</h2>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Service disponible</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Mettre en avant (featured)</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/admin/services')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  {isEditMode ? 'Mettre à jour' : 'Créer le service'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ServiceForm;
