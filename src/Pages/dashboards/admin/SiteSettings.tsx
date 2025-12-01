import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Save, Palette, Mail, Phone, MapPin, Globe, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../../components/ui/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { ColorPicker } from '../../../components/ui/color-picker';

interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  contact_email: string;
  contact_phone: string;
  contact_address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  social_links: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  seo_metadata: {
    title: string;
    description: string;
    keywords: string;
  };
}

export const SiteSettings: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<SiteSettings>();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;
      
      // Set default values if not exists
      const defaultSettings: Partial<SiteSettings> = {
        site_name: 'Maroc 2030',
        primary_color: '#10B981',
        secondary_color: '#3B82F6',
        accent_color: '#8B5CF6',
        font_family: 'Inter, sans-serif',
        contact_address: { street: '', city: '', postal_code: '', country: '' },
        social_links: {},
        seo_metadata: { title: '', description: '', keywords: '' }
      };

      reset({ ...defaultSettings, ...data });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Erreur', 'Une erreur est survenue lors du chargement des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase
      .storage
      .from('site-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: SiteSettings) => {
    try {
      setIsSaving(true);
      
      let logoUrl = data.logo_url;
      let faviconUrl = data.favicon_url;

      // Upload new logo if selected
      if (logoFile) {
        logoUrl = await uploadFile(logoFile, 'logos');
      }

      // Upload new favicon if selected
      if (faviconFile) {
        faviconUrl = await uploadFile(faviconFile, 'favicons');
      }

      // Update settings in database
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          ...data,
          id: data.id || '00000000-0000-0000-0000-000000000000',
          logo_url: logoUrl,
          favicon_url: faviconUrl,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update CSS variables for theme
      document.documentElement.style.setProperty('--primary', data.primary_color);
      document.documentElement.style.setProperty('--secondary', data.secondary_color);
      document.documentElement.style.setProperty('--accent', data.accent_color);

      toast.success('Succès', 'Les paramètres ont été enregistrés avec succès');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erreur', 'Une erreur est survenue lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informations générales */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="h-6 w-6 text-emerald-600" />
            <h3 className="text-lg font-medium">Informations générales</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du site
              </label>
              <Controller
                name="site_name"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    {...field}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description du site
              </label>
              <Controller
                name="site_description"
                control={control}
                render={({ field }) => (
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    {...field}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Apparence */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="h-6 w-6 text-emerald-600" />
            <h3 className="text-lg font-medium">Apparence</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur principale
              </label>
              <Controller
                name="primary_color"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ColorPicker value={value || '#3b82f6'} onChange={onChange} />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur secondaire
              </label>
              <Controller
                name="secondary_color"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ColorPicker value={value || '#3b82f6'} onChange={onChange} />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur d'accent
              </label>
              <Controller
                name="accent_color"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ColorPicker value={value || '#3b82f6'} onChange={onChange} />
                )}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <Controller
              name="logo_url"
              control={control}
              render={({ field: { value } }) => (
                <div className="flex items-center space-x-4">
                  {value ? (
                    <img src={value} alt="Logo" className="h-16 w-auto" />
                  ) : (
                    <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="logo-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLogoFile(file);
                          // Show preview
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            // Update the form value
                            // This is a simplified version, you might want to handle this differently
                            const target = e.target as HTMLInputElement;
                            if (target) target.value = '';
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      Changer
                    </label>
                  </div>
                </div>
              )}
            />
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon
            </label>
            <Controller
              name="favicon_url"
              control={control}
              render={({ field: { value } }) => (
                <div className="flex items-center space-x-4">
                  {value ? (
                    <img src={value} alt="Favicon" className="h-8 w-8" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/x-icon,image/png"
                      className="hidden"
                      id="favicon-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFaviconFile(file);
                          // Show preview
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            // Update the form value
                            // This is a simplified version, you might want to handle this differently
                            const target = e.target as HTMLInputElement;
                            if (target) target.value = '';
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="favicon-upload"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      Changer
                    </label>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Mail className="h-6 w-6 text-emerald-600" />
            <h3 className="text-lg font-medium">Coordonnées</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de contact
              </label>
              <Controller
                name="contact_email"
                control={control}
                render={({ field }) => (
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      {...field}
                    />
                  </div>
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone de contact
              </label>
              <Controller
                name="contact_phone"
                control={control}
                render={({ field }) => (
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      {...field}
                    />
                  </div>
                )}
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <Controller
                name="contact_address.street"
                control={control}
                render={({ field }) => (
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Adresse complète"
                      {...field}
                    />
                  </div>
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <Controller
                name="contact_address.city"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    {...field}
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code postal
              </label>
              <Controller
                name="contact_address.postal_code"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    {...field}
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays
              </label>
              <Controller
                name="contact_address.country"
                control={control}
                render={({ field }) => (
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                    {...field}
                  >
                    <option value="">Sélectionner un pays</option>
                    <option value="Maroc">Maroc</option>
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Canada">Canada</option>
                    <option value="Autre">Autre</option>
                  </select>
                )}
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <h3 className="text-lg font-medium">Référencement (SEO)</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Méta-titre
              </label>
              <Controller
                name="seo_metadata.title"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="Titre pour les moteurs de recherche"
                    {...field}
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Méta-description
              </label>
              <Controller
                name="seo_metadata.description"
                control={control}
                render={({ field }) => (
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="Description pour les moteurs de recherche"
                    {...field}
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mots-clés (séparés par des virgules)
              </label>
              <Controller
                name="seo_metadata.keywords"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="mot-clé1, mot-clé2, mot-clé3"
                    {...field}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isDirty && !isSaving ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="-ml-1 mr-2 h-4 w-4" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
