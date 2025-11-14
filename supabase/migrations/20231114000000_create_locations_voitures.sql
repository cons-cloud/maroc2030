-- Création de la table locations_voitures
CREATE TABLE IF NOT EXISTS public.locations_voitures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  description TEXT,
  
  -- Détails techniques
  category TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 5,
  doors INTEGER NOT NULL DEFAULT 4,
  
  -- Équipements
  has_ac BOOLEAN DEFAULT true,
  has_gps BOOLEAN DEFAULT false,
  has_bluetooth BOOLEAN DEFAULT false,
  
  -- Localisation
  city TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  
  -- Tarification et disponibilité
  price_per_day DECIMAL(10, 2) NOT NULL,
  weekly_discount INTEGER DEFAULT 0,
  monthly_discount INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  
  -- Images
  images TEXT[] DEFAULT '{}',
  
  -- Contact
  contact_phone TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_year CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  CONSTRAINT valid_price CHECK (price_per_day > 0),
  CONSTRAINT valid_discounts CHECK (weekly_discount >= 0 AND weekly_discount <= 50 AND monthly_discount >= 0 AND monthly_discount <= 50)
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_locations_voitures_city ON public.locations_voitures(city);
CREATE INDEX idx_locations_voitures_brand_model ON public.locations_voitures(brand, model);
CREATE INDEX idx_locations_voitures_price ON public.locations_voitures(price_per_day);
CREATE INDEX idx_locations_voitures_available ON public.locations_voitures(available) WHERE available = true;

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour la mise à jour automatique
CREATE TRIGGER update_locations_voitures_updated_at
BEFORE UPDATE ON public.locations_voitures
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Politiques RLS (Row Level Security)
ALTER TABLE public.locations_voitures ENABLE ROW LEVEL SECURITY;

-- Les administrateurs peuvent tout faire
CREATE POLICY "Enable all access for admins"
  ON public.locations_voitures
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Les partenaires peuvent gérer leurs propres voitures
CREATE POLICY "Enable read access for all users"
  ON public.locations_voitures
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.locations_voitures
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for owners"
  ON public.locations_voitures
  FOR UPDATE
  USING (
    auth.uid() = partner_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Enable delete for owners and admins"
  ON public.locations_voitures
  FOR DELETE
  USING (
    auth.uid() = partner_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Création d'une vue pour les recherches
CREATE OR REPLACE VIEW public.voitures_avec_notes AS
SELECT 
  lv.*,
  COALESCE(
    (SELECT AVG(rating) FROM reviews 
     WHERE entity_type = 'voiture' AND entity_id = lv.id),
    0
  ) as average_rating,
  COALESCE(
    (SELECT COUNT(*) FROM reviews 
     WHERE entity_type = 'voiture' AND entity_id = lv.id),
    0
  ) as review_count
FROM 
  public.locations_voitures lv
WHERE 
  lv.available = true;

-- Commentaire sur la table et les colonnes
COMMENT ON TABLE public.locations_voitures IS 'Table des voitures disponibles à la location';
COMMENT ON COLUMN public.locations_voitures.partner_id IS 'Référence vers le partenaire propriétaire de la voiture';
COMMENT ON COLUMN public.locations_voitures.weekly_discount IS 'Remise en pourcentage pour les locations d\'une semaine ou plus';
COMMENT ON COLUMN public.locations_voitures.monthly_discount IS 'Remise en pourcentage pour les locations d\'un mois ou plus';

-- Ajout des types ENUM si nécessaire
DO $$
BEGIN
  -- Vérifier si le type existe déjà
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fuel_type_enum') THEN
    CREATE TYPE fuel_type_enum AS ENUM ('essence', 'diesel', 'hybride', 'electrique', 'gpl');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transmission_enum') THEN
    CREATE TYPE transmission_enum AS ENUM ('manuelle', 'automatique', 'semi-automatique');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'car_category_enum') THEN
    CREATE TYPE car_category_enum AS ENUM (
      'citadine', 'berline', 'break', 'monospace', 'suv', 'cabriolet', 
      'coupe', 'utilitaire', 'luxe', 'sportive', '4x4', 'utilitaire_léger'
    );
  END IF;
  
  -- Mettre à jour les colonnes pour utiliser les types ENUM
  ALTER TABLE public.locations_voitures 
    ALTER COLUMN fuel_type TYPE fuel_type_enum USING fuel_type::fuel_type_enum,
    ALTER COLUMN transmission TYPE transmission_enum USING transmission::transmission_enum,
    ALTER COLUMN category TYPE car_category_enum USING category::car_category_enum;
    
EXCEPTION WHEN others THEN
  -- Gérer les erreurs (par exemple, si les types existent déjà avec des valeurs différentes)
  RAISE NOTICE 'Erreur lors de la création des types ENUM: %', SQLERRM;
END $$;
