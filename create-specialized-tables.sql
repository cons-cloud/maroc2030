-- ============================================
-- STRUCTURE COMPLÈTE : TABLES SPÉCIALISÉES
-- ============================================

-- 1. TABLE HOTELS
CREATE TABLE IF NOT EXISTS hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  stars INTEGER CHECK (stars >= 1 AND stars <= 5),
  price_per_night DECIMAL(10,2) NOT NULL,
  city VARCHAR(100),
  region VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  images TEXT[],
  amenities JSONB DEFAULT '[]'::jsonb, -- piscine, spa, wifi, etc.
  rooms_count INTEGER,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE APPARTEMENTS
CREATE TABLE IF NOT EXISTS appartements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  type VARCHAR(50), -- studio, F2, F3, F4, duplex
  price_per_night DECIMAL(10,2),
  price_sale DECIMAL(12,2), -- si à vendre
  for_rent BOOLEAN DEFAULT true,
  for_sale BOOLEAN DEFAULT false,
  bedrooms INTEGER,
  bathrooms INTEGER,
  surface_area DECIMAL(10,2), -- m²
  floor INTEGER,
  city VARCHAR(100),
  region VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  images TEXT[],
  amenities JSONB DEFAULT '[]'::jsonb,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE VILLAS
CREATE TABLE IF NOT EXISTS villas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  price_per_night DECIMAL(10,2),
  price_sale DECIMAL(12,2),
  for_rent BOOLEAN DEFAULT true,
  for_sale BOOLEAN DEFAULT false,
  bedrooms INTEGER,
  bathrooms INTEGER,
  surface_area DECIMAL(10,2),
  land_area DECIMAL(10,2), -- terrain en m²
  has_pool BOOLEAN DEFAULT false,
  has_garden BOOLEAN DEFAULT false,
  city VARCHAR(100),
  region VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  images TEXT[],
  amenities JSONB DEFAULT '[]'::jsonb,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE LOCATIONS DE VOITURES
CREATE TABLE IF NOT EXISTS locations_voitures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  brand VARCHAR(100) NOT NULL, -- Renault, Dacia, Mercedes
  model VARCHAR(100) NOT NULL,
  model_ar VARCHAR(100),
  year INTEGER,
  description TEXT,
  description_ar TEXT,
  category VARCHAR(50), -- economique, compact, suv, luxe
  price_per_day DECIMAL(10,2) NOT NULL,
  fuel_type VARCHAR(50), -- essence, diesel, electrique
  transmission VARCHAR(50), -- manuelle, automatique
  seats INTEGER,
  has_ac BOOLEAN DEFAULT true,
  has_gps BOOLEAN DEFAULT false,
  city VARCHAR(100),
  images TEXT[],
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLE IMMOBILIER (Général)
CREATE TABLE IF NOT EXISTS immobilier (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  property_type VARCHAR(50), -- riad, maison, terrain, local commercial
  price DECIMAL(12,2) NOT NULL,
  transaction_type VARCHAR(50), -- vente, location
  surface_area DECIMAL(10,2),
  city VARCHAR(100),
  region VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  images TEXT[],
  features JSONB DEFAULT '{}'::jsonb,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLE CIRCUITS TOURISTIQUES
CREATE TABLE IF NOT EXISTS circuits_touristiques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  duration_days INTEGER NOT NULL,
  price_per_person DECIMAL(10,2) NOT NULL,
  destinations TEXT[], -- ["Marrakech", "Fès", "Chefchaouen"]
  includes JSONB DEFAULT '[]'::jsonb, -- hébergement, transport, repas, guide
  excludes JSONB DEFAULT '[]'::jsonb,
  itinerary JSONB DEFAULT '[]'::jsonb, -- programme jour par jour
  images TEXT[],
  max_participants INTEGER,
  difficulty_level VARCHAR(50), -- facile, modéré, difficile
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLE GUIDES TOURISTIQUES
CREATE TABLE IF NOT EXISTS guides_touristiques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  full_name_ar VARCHAR(255),
  bio TEXT,
  bio_ar TEXT,
  languages TEXT[], -- ["Français", "Anglais", "Arabe", "Espagnol"]
  specialties TEXT[], -- ["Histoire", "Nature", "Gastronomie"]
  experience_years INTEGER,
  price_per_day DECIMAL(10,2) NOT NULL,
  cities_covered TEXT[],
  photo_url TEXT,
  certifications TEXT[],
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABLE ACTIVITÉS TOURISTIQUES
CREATE TABLE IF NOT EXISTS activites_touristiques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  activity_type VARCHAR(50), -- excursion, sport, culture, aventure
  duration_hours DECIMAL(4,2),
  price_per_person DECIMAL(10,2) NOT NULL,
  city VARCHAR(100),
  region VARCHAR(100),
  location TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  images TEXT[],
  includes JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb, -- âge minimum, condition physique
  max_participants INTEGER,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABLE ÉVÉNEMENTS
CREATE TABLE IF NOT EXISTS evenements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  event_type VARCHAR(50), -- festival, concert, conférence, exposition
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  price DECIMAL(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  city VARCHAR(100),
  venue VARCHAR(255),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  images TEXT[],
  capacity INTEGER,
  tickets_available INTEGER,
  category VARCHAR(50),
  featured BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, ongoing, completed, cancelled
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABLE ANNONCES (Petites annonces)
CREATE TABLE IF NOT EXISTS annonces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  category VARCHAR(50), -- emploi, services, objets, autres
  subcategory VARCHAR(50),
  price DECIMAL(10,2),
  is_negotiable BOOLEAN DEFAULT true,
  city VARCHAR(100),
  region VARCHAR(100),
  images TEXT[],
  status VARCHAR(50) DEFAULT 'active', -- active, sold, expired
  views_count INTEGER DEFAULT 0,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEX POUR PERFORMANCE
-- ============================================

-- Index pour tables avec colonne city
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_hotels_featured ON hotels(featured);
CREATE INDEX IF NOT EXISTS idx_appartements_city ON appartements(city);
CREATE INDEX IF NOT EXISTS idx_villas_city ON villas(city);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations_voitures(city);
CREATE INDEX IF NOT EXISTS idx_immobilier_city ON immobilier(city);
CREATE INDEX IF NOT EXISTS idx_activites_city ON activites_touristiques(city);
CREATE INDEX IF NOT EXISTS idx_annonces_city ON annonces(city);

-- Index pour circuits (pas de city, utilise featured)
CREATE INDEX IF NOT EXISTS idx_circuits_featured ON circuits_touristiques(featured);
CREATE INDEX IF NOT EXISTS idx_circuits_available ON circuits_touristiques(available);

-- Index pour guides (pas de city, utilise available et rating)
CREATE INDEX IF NOT EXISTS idx_guides_available ON guides_touristiques(available);
CREATE INDEX IF NOT EXISTS idx_guides_rating ON guides_touristiques(rating);

-- Index pour événements
CREATE INDEX IF NOT EXISTS idx_evenements_date ON evenements(start_date);
CREATE INDEX IF NOT EXISTS idx_evenements_city ON evenements(city);

-- Index pour annonces
CREATE INDEX IF NOT EXISTS idx_annonces_status ON annonces(status);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Hotels
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Hotels publics" ON hotels;
DROP POLICY IF EXISTS "Partenaires gèrent leurs hotels" ON hotels;
DROP POLICY IF EXISTS "Admins gèrent tous hotels" ON hotels;
CREATE POLICY "Hotels publics" ON hotels FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leurs hotels" ON hotels FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent tous hotels" ON hotels FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Appartements
ALTER TABLE appartements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Appartements publics" ON appartements;
DROP POLICY IF EXISTS "Partenaires gèrent leurs appartements" ON appartements;
DROP POLICY IF EXISTS "Admins gèrent tous appartements" ON appartements;
CREATE POLICY "Appartements publics" ON appartements FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leurs appartements" ON appartements FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent tous appartements" ON appartements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Villas
ALTER TABLE villas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Villas publiques" ON villas;
DROP POLICY IF EXISTS "Partenaires gèrent leurs villas" ON villas;
DROP POLICY IF EXISTS "Admins gèrent toutes villas" ON villas;
CREATE POLICY "Villas publiques" ON villas FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leurs villas" ON villas FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent toutes villas" ON villas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Locations voitures
ALTER TABLE locations_voitures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Voitures publiques" ON locations_voitures;
DROP POLICY IF EXISTS "Partenaires gèrent leurs voitures" ON locations_voitures;
DROP POLICY IF EXISTS "Admins gèrent toutes voitures" ON locations_voitures;
CREATE POLICY "Voitures publiques" ON locations_voitures FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leurs voitures" ON locations_voitures FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent toutes voitures" ON locations_voitures FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Immobilier
ALTER TABLE immobilier ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Immobilier public" ON immobilier;
DROP POLICY IF EXISTS "Partenaires gèrent leur immobilier" ON immobilier;
DROP POLICY IF EXISTS "Admins gèrent tout immobilier" ON immobilier;
CREATE POLICY "Immobilier public" ON immobilier FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leur immobilier" ON immobilier FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent tout immobilier" ON immobilier FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Circuits touristiques
ALTER TABLE circuits_touristiques ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Circuits publics" ON circuits_touristiques;
DROP POLICY IF EXISTS "Partenaires gèrent leurs circuits" ON circuits_touristiques;
DROP POLICY IF EXISTS "Admins gèrent tous circuits" ON circuits_touristiques;
CREATE POLICY "Circuits publics" ON circuits_touristiques FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leurs circuits" ON circuits_touristiques FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent tous circuits" ON circuits_touristiques FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Guides touristiques
ALTER TABLE guides_touristiques ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Guides publics" ON guides_touristiques;
DROP POLICY IF EXISTS "Guides gèrent leur profil" ON guides_touristiques;
DROP POLICY IF EXISTS "Admins gèrent tous guides" ON guides_touristiques;
CREATE POLICY "Guides publics" ON guides_touristiques FOR SELECT USING (available = true);
CREATE POLICY "Guides gèrent leur profil" ON guides_touristiques FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent tous guides" ON guides_touristiques FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Activités touristiques
ALTER TABLE activites_touristiques ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Activités publiques" ON activites_touristiques;
DROP POLICY IF EXISTS "Partenaires gèrent leurs activités" ON activites_touristiques;
DROP POLICY IF EXISTS "Admins gèrent toutes activités" ON activites_touristiques;
CREATE POLICY "Activités publiques" ON activites_touristiques FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leurs activités" ON activites_touristiques FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent toutes activités" ON activites_touristiques FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Événements
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Événements publics" ON evenements;
DROP POLICY IF EXISTS "Organisateurs gèrent leurs événements" ON evenements;
DROP POLICY IF EXISTS "Admins gèrent tous événements" ON evenements;
CREATE POLICY "Événements publics" ON evenements FOR SELECT USING (status != 'cancelled');
CREATE POLICY "Organisateurs gèrent leurs événements" ON evenements FOR ALL USING (auth.uid() = organizer_id);
CREATE POLICY "Admins gèrent tous événements" ON evenements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Annonces
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Annonces actives publiques" ON annonces;
DROP POLICY IF EXISTS "Utilisateurs gèrent leurs annonces" ON annonces;
DROP POLICY IF EXISTS "Admins gèrent toutes annonces" ON annonces;
CREATE POLICY "Annonces actives publiques" ON annonces FOR SELECT USING (status = 'active');
CREATE POLICY "Utilisateurs gèrent leurs annonces" ON annonces FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins gèrent toutes annonces" ON annonces FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

SELECT 'TOUTES LES TABLES SPÉCIALISÉES CRÉÉES !' as message;
