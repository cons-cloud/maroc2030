-- ================================================
-- TABLE : PARAMÈTRES DU SITE (site_settings)
-- ================================================
-- Cette table stocke tous les paramètres modifiables du site
-- depuis le dashboard admin (contact, réseaux sociaux, horaires, etc.)

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- ==========================================
  -- INFORMATIONS DE CONTACT
  -- ==========================================
  email TEXT DEFAULT 'contact@maroc2030.com',
  phone_primary TEXT DEFAULT '+212 6 12 34 56 78',
  phone_secondary TEXT,
  address TEXT DEFAULT '123 Avenue Mohammed V',
  city TEXT DEFAULT 'Marrakech',
  postal_code TEXT DEFAULT '40000',
  country TEXT DEFAULT 'Maroc',
  
  -- ==========================================
  -- RÉSEAUX SOCIAUX
  -- ==========================================
  facebook_url TEXT DEFAULT 'https://facebook.com',
  instagram_url TEXT DEFAULT 'https://instagram.com',
  twitter_url TEXT DEFAULT 'https://twitter.com',
  youtube_url TEXT DEFAULT 'https://youtube.com',
  linkedin_url TEXT,
  tiktok_url TEXT,
  
  -- ==========================================
  -- HORAIRES D'OUVERTURE (JSON)
  -- ==========================================
  opening_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "09:00", "close": "13:00", "closed": false},
    "sunday": {"open": "", "close": "", "closed": true}
  }'::jsonb,
  
  -- ==========================================
  -- INFORMATIONS GÉNÉRALES DU SITE
  -- ==========================================
  site_name TEXT DEFAULT 'Maroc 2030',
  site_slogan TEXT DEFAULT 'Votre destination de rêve au Maroc',
  site_description_short TEXT DEFAULT 'Découvrez le Maroc avec Maroc 2030',
  site_description_long TEXT DEFAULT 'Maroc 2030 est votre partenaire de confiance pour découvrir les merveilles du Maroc. Nous proposons des services de qualité pour rendre votre séjour inoubliable.',
  site_keywords TEXT DEFAULT 'maroc, tourisme, voyage, hôtel, location, circuits',
  logo_url TEXT,
  favicon_url TEXT,
  
  -- ==========================================
  -- TEXTES DES PAGES
  -- ==========================================
  home_hero_title TEXT DEFAULT 'Découvrez le Maroc',
  home_hero_subtitle TEXT DEFAULT 'Votre voyage commence ici',
  about_title TEXT DEFAULT 'À propos de nous',
  about_text TEXT DEFAULT 'Nous sommes une équipe passionnée dédiée à vous faire découvrir les merveilles du Maroc.',
  why_choose_us_title TEXT DEFAULT 'Pourquoi nous choisir ?',
  why_choose_us_text TEXT DEFAULT 'Service de qualité, prix compétitifs, expérience locale.',
  footer_text TEXT DEFAULT '© 2024 Maroc 2030. Tous droits réservés.',
  legal_mentions TEXT,
  privacy_policy TEXT,
  terms_conditions TEXT,
  
  -- ==========================================
  -- PARAMÈTRES TECHNIQUES
  -- ==========================================
  google_analytics_id TEXT,
  facebook_pixel_id TEXT,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT DEFAULT 'Site en maintenance. Nous revenons bientôt !',
  default_language TEXT DEFAULT 'fr',
  default_currency TEXT DEFAULT 'MAD',
  
  -- ==========================================
  -- PARAMÈTRES EMAIL
  -- ==========================================
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_user TEXT,
  smtp_password TEXT,
  email_from TEXT,
  email_from_name TEXT DEFAULT 'Maroc 2030',
  
  -- ==========================================
  -- MÉTADONNÉES
  -- ==========================================
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- ================================================
-- INSÉRER LES PARAMÈTRES PAR DÉFAUT
-- ================================================
INSERT INTO site_settings (
  email,
  phone_primary,
  address,
  city,
  postal_code,
  country,
  site_name,
  site_slogan,
  facebook_url,
  instagram_url,
  twitter_url,
  youtube_url
) VALUES (
  'contact@maroc2030.com',
  '+212 6 12 34 56 78',
  '123 Avenue Mohammed V',
  'Marrakech',
  '40000',
  'Maroc',
  'Maroc 2030',
  'Votre destination de rêve au Maroc',
  'https://facebook.com',
  'https://instagram.com',
  'https://twitter.com',
  'https://youtube.com'
)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- FONCTION POUR METTRE À JOUR updated_at
-- ================================================
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGER POUR updated_at
-- ================================================
DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- ================================================
-- PERMISSIONS (RLS)
-- ================================================
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes si elles existent
DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Only admins can update site settings" ON site_settings;

-- Tout le monde peut lire les paramètres
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Seuls les admins peuvent modifier
CREATE POLICY "Only admins can update site settings"
  ON site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ================================================
-- INDEX POUR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_at ON site_settings(updated_at);

-- ================================================
-- COMMENTAIRES
-- ================================================
COMMENT ON TABLE site_settings IS 'Paramètres généraux du site modifiables depuis le dashboard admin';
COMMENT ON COLUMN site_settings.email IS 'Email principal de contact';
COMMENT ON COLUMN site_settings.opening_hours IS 'Horaires d''ouverture au format JSON';
COMMENT ON COLUMN site_settings.maintenance_mode IS 'Active/désactive le mode maintenance';
