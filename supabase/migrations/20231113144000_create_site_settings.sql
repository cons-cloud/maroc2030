-- Création de la table des paramètres du site
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'Maroc 2030',
  site_description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#10B981',
  secondary_color TEXT DEFAULT '#3B82F6',
  accent_color TEXT DEFAULT '#8B5CF6',
  font_family TEXT DEFAULT 'Inter, sans-serif',
  contact_email TEXT,
  contact_phone TEXT,
  contact_address JSONB,
  social_links JSONB,
  seo_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour permettre la lecture à tous mais la modification uniquement aux admins
CREATE POLICY "Enable read access for all users"
  ON public.site_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Enable update for admin users"
  ON public.site_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour la mise à jour automatique
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
  -- Vérifier et ajouter les colonnes si nécessaire
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'site_settings' 
                 AND column_name = 'contact_email') THEN
    ALTER TABLE public.site_settings ADD COLUMN contact_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'site_settings' 
                 AND column_name = 'contact_phone') THEN
    ALTER TABLE public.site_settings ADD COLUMN contact_phone TEXT;
  END IF;
END $$;

-- Insérer les valeurs par défaut si la table est vide
INSERT INTO public.site_settings (
  id, 
  site_name, 
  site_description,
  contact_email, 
  contact_phone,
  contact_address,
  social_links,
  seo_metadata
)
SELECT 
  '00000000-0000-0000-0000-000000000000', 
  'Maroc 2030',
  'Plateforme de découverte et de réservation de services au Maroc',
  'contact@maroc2030.ma', 
  '+212 6 12 34 56 78',
  '{"address": "123 Avenue Mohammed V", "city": "Casablanca", "postal_code": "20000", "country": "Maroc"}',
  '{"facebook": "https://facebook.com/maroc2030", "twitter": "https://twitter.com/maroc2030", "instagram": "https://instagram.com/maroc2030"}',
  '{"title": "Maroc 2030 - Découvrez le Maroc", "description": "Plateforme de découverte et de réservation de services au Maroc", "keywords": "maroc, voyage, tourisme, hébergement, location de voiture"}'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);
