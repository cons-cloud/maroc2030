-- Création de la table des événements
CREATE TABLE IF NOT EXISTS public.evenements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  max_attendees INTEGER,
  category TEXT,
  images TEXT[] DEFAULT '{}',
  contact_phone TEXT,
  contact_email TEXT,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Création de la table des annonces
CREATE TABLE IF NOT EXISTS public.annonces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10, 2),
  location TEXT,
  city TEXT,
  images TEXT[] DEFAULT '{}',
  contact_phone TEXT,
  contact_email TEXT,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index pour les recherches
CREATE INDEX idx_evenements_city ON public.evenements(city);
CREATE INDEX idx_evenements_date ON public.evenements(start_date);
CREATE INDEX idx_annonces_city ON public.annonces(city);
CREATE INDEX idx_annonces_category ON public.annonces(category);

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheurs pour la mise à jour automatique
CREATE TRIGGER update_evenements_updated_at
BEFORE UPDATE ON public.evenements
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_annonces_updated_at
BEFORE UPDATE ON public.annonces
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Politiques RLS pour les événements
ALTER TABLE public.evenements ENABLE ROW LEVEL SECURITY;

-- Les administrateurs peuvent tout faire
CREATE POLICY "Enable all access for admins on evenements"
  ON public.evenements
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Les utilisateurs authentifiés peuvent voir les événements disponibles
CREATE POLICY "Enable read access for all users on evenements"
  ON public.evenements
  FOR SELECT
  USING (true);

-- Politiques RLS pour les annonces
ALTER TABLE public.annonces ENABLE ROW LEVEL SECURITY;

-- Les administrateurs peuvent tout faire
CREATE POLICY "Enable all access for admins on annonces"
  ON public.annonces
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Les utilisateurs authentifiés peuvent voir les annonces disponibles
CREATE POLICY "Enable read access for all users on annonces"
  ON public.annonces
  FOR SELECT
  USING (true);

-- Vues pour faciliter les requêtes
CREATE OR REPLACE VIEW public.v_events_with_ratings AS
SELECT 
  e.*,
  COALESCE(
    (SELECT AVG(r.rating) FROM reviews r 
     WHERE r.entity_type = 'evenement' AND r.entity_id = e.id),
    0
  ) as average_rating,
  COALESCE(
    (SELECT COUNT(*) FROM reviews r 
     WHERE r.entity_type = 'evenement' AND r.entity_id = e.id),
    0
  ) as review_count
FROM 
  public.evenements e;

-- Commentaires
COMMENT ON TABLE public.evenements IS 'Table des événements du site';
COMMENT ON TABLE public.annonces IS 'Table des annonces du site';

-- Ajout des colonnes pour les réseaux sociaux dans la table site_settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS social_facebook TEXT,
ADD COLUMN IF NOT EXISTS social_twitter TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
ADD COLUMN IF NOT EXISTS social_youtube TEXT;
