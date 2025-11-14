import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../../components/DashboardLayout';
import { uploadImage } from '../../../lib/storage';

interface SiteContent {
  id: string;
  section: string;
  key: string;
  value: string;
  value_ar: string;
  type: string;
}

const SiteContentManagement: React.FC = () => {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('section', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Erreur lors du chargement du contenu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, field: 'value' | 'value_ar', newValue: string) => {
    setEditedContent(prev => ({
      ...prev,
      [`${id}_${field}`]: newValue
    }));
  };

  const handleImageUpload = async (id: string, field: 'value' | 'value_ar', file: File) => {
    setUploadingImage(id);
    try {
      const imageUrl = await uploadImage(file, 'hero', 'site-content');
      handleChange(id, field, imageUrl);
      toast.success('Image uploadée avec succès');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(null);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(editedContent).map(([key, value]) => {
        const parts = key.split('_');
        const field = parts.pop() as string;
        const id = parts.join('_');
        return { id, field, value };
      });

      for (const update of updates) {
        const updateData: Record<string, string> = {};
        updateData[update.field] = update.value;
        
        const { error } = await supabase
          .from('site_content')
          .update(updateData)
          .eq('id', update.id);

        if (error) throw error;
      }

      toast.success('Contenu mis à jour avec succès');
      setEditedContent({});
      loadContent();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getContentValue = (item: SiteContent, field: 'value' | 'value_ar') => {
    const editKey = `${item.id}_${field}`;
    return editedContent[editKey] !== undefined ? editedContent[editKey] : item[field];
  };

  const groupedContent = content.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, SiteContent[]>);

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
            <h1 className="text-2xl font-bold text-gray-900">Gestion du Contenu du Site</h1>
            <p className="text-gray-600 mt-1">Modifiez le texte, les images et le contenu du site</p>
          </div>
          <button
            onClick={saveContent}
            disabled={saving || Object.keys(editedContent).length === 0}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>

        {Object.keys(editedContent).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              ⚠️ Vous avez {Object.keys(editedContent).length} modification(s) non sauvegardée(s)
            </p>
          </div>
        )}

        {Object.entries(groupedContent).map(([section, items]) => (
          <div key={section} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
              Section : {section}
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {item.key.replace(/_/g, ' ')}
                  </label>
                  
                  {item.type === 'image' ? (
                    <div className="space-y-2">
                      {/* Français */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Image (FR)</p>
                        <div className="flex items-center gap-2">
                          {getContentValue(item, 'value') && (
                            <img
                              src={getContentValue(item, 'value')}
                              alt={item.key}
                              className="h-20 w-32 object-cover rounded"
                            />
                          )}
                          <label className="cursor-pointer flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage === item.id ? 'Upload...' : 'Changer'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(item.id, 'value', file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      {/* Arabe */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Image (AR)</p>
                        <div className="flex items-center gap-2">
                          {getContentValue(item, 'value_ar') && (
                            <img
                              src={getContentValue(item, 'value_ar')}
                              alt={item.key}
                              className="h-20 w-32 object-cover rounded"
                            />
                          )}
                          <label className="cursor-pointer flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage === `${item.id}_ar` ? 'Upload...' : 'Changer'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(item.id, 'value_ar', file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Français */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Français</p>
                        <textarea
                          value={getContentValue(item, 'value')}
                          onChange={(e) => handleChange(item.id, 'value', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      {/* Arabe */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">العربية</p>
                        <textarea
                          value={getContentValue(item, 'value_ar')}
                          onChange={(e) => handleChange(item.id, 'value_ar', e.target.value)}
                          rows={3}
                          dir="rtl"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default SiteContentManagement;
