-- ============================================
-- NETTOYAGE COMPLET AVANT CRÉATION
-- ============================================

-- Supprimer les tables dans l'ordre (CASCADE supprime automatiquement les politiques)
DROP TABLE IF EXISTS annonces CASCADE;
DROP TABLE IF EXISTS evenements CASCADE;
DROP TABLE IF EXISTS activites_touristiques CASCADE;
DROP TABLE IF EXISTS guides_touristiques CASCADE;
DROP TABLE IF EXISTS circuits_touristiques CASCADE;
DROP TABLE IF EXISTS immobilier CASCADE;
DROP TABLE IF EXISTS locations_voitures CASCADE;
DROP TABLE IF EXISTS villas CASCADE;
DROP TABLE IF EXISTS appartements CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;

-- ============================================
-- CRÉATION DES TABLES
-- ============================================

-- 1. HOTELS
CREATE TABLE hotels (
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
  amenities JSONB DEFAULT '[]'::jsonb,
  rooms_count INTEGER,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. APPARTEMENTS
CREATE TABLE appartements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  type VARCHAR(50),
  price_per_night DECIMAL(10,2),
  price_sale DECIMAL(12,2),
  for_rent BOOLEAN DEFAULT true,
  for_sale BOOLEAN DEFAULT false,
  bedrooms INTEGER,
  bathrooms INTEGER,
  surface_area DECIMAL(10,2),
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

-- 3. VILLAS
CREATE TABLE villas (
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
  land_area DECIMAL(10,2),
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

-- 4. LOCATIONS VOITURES
CREATE TABLE locations_voitures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  model_ar VARCHAR(100),
  year INTEGER,
  description TEXT,
  description_ar TEXT,
  category VARCHAR(50),
  price_per_day DECIMAL(10,2) NOT NULL,
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
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

-- 5. IMMOBILIER
CREATE TABLE immobilier (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  property_type VARCHAR(50),
  price DECIMAL(12,2) NOT NULL,
  transaction_type VARCHAR(50),
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

-- 6. CIRCUITS TOURISTIQUES (PAS DE CITY)
CREATE TABLE circuits_touristiques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  duration_days INTEGER NOT NULL,
  price_per_person DECIMAL(10,2) NOT NULL,
  destinations TEXT[],
  includes JSONB DEFAULT '[]'::jsonb,
  excludes JSONB DEFAULT '[]'::jsonb,
  itinerary JSONB DEFAULT '[]'::jsonb,
  images TEXT[],
  max_participants INTEGER,
  difficulty_level VARCHAR(50),
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. GUIDES TOURISTIQUES (PAS DE CITY)
CREATE TABLE guides_touristiques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  full_name_ar VARCHAR(255),
  bio TEXT,
  bio_ar TEXT,
  languages TEXT[],
  specialties TEXT[],
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

-- 8. ACTIVITÉS TOURISTIQUES
CREATE TABLE activites_touristiques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  activity_type VARCHAR(50),
  duration_hours DECIMAL(4,2),
  price_per_person DECIMAL(10,2) NOT NULL,
  city VARCHAR(100),
  region VARCHAR(100),
  location TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  images TEXT[],
  includes JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  max_participants INTEGER,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ÉVÉNEMENTS
CREATE TABLE evenements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  event_type VARCHAR(50),
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
  status VARCHAR(50) DEFAULT 'upcoming',
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ANNONCES
CREATE TABLE annonces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  category VARCHAR(50),
  subcategory VARCHAR(50),
  price DECIMAL(10,2),
  is_negotiable BOOLEAN DEFAULT true,
  city VARCHAR(100),
  region VARCHAR(100),
  images TEXT[],
  status VARCHAR(50) DEFAULT 'active',
  views_count INTEGER DEFAULT 0,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEX
-- ============================================

CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_featured ON hotels(featured);
CREATE INDEX idx_appartements_city ON appartements(city);
CREATE INDEX idx_villas_city ON villas(city);
CREATE INDEX idx_locations_city ON locations_voitures(city);
CREATE INDEX idx_immobilier_city ON immobilier(city);
CREATE INDEX idx_circuits_featured ON circuits_touristiques(featured);
CREATE INDEX idx_guides_available ON guides_touristiques(available);
CREATE INDEX idx_activites_city ON activites_touristiques(city);
CREATE INDEX idx_evenements_date ON evenements(start_date);
CREATE INDEX idx_evenements_city ON evenements(city);
CREATE INDEX idx_annonces_status ON annonces(status);
CREATE INDEX idx_annonces_city ON annonces(city);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Hotels
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hotels publics" ON hotels FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leurs hotels" ON hotels FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent tous hotels" ON hotels FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Appartements
ALTER TABLE appartements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Appartements publics" ON appartements FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leurs appartements" ON appartements FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent tous appartements" ON appartements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Villas
ALTER TABLE villas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Villas publiques" ON villas FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leurs villas" ON villas FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent toutes villas" ON villas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Locations voitures
ALTER TABLE locations_voitures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voitures publiques" ON locations_voitures FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leurs voitures" ON locations_voitures FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent toutes voitures" ON locations_voitures FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Immobilier
ALTER TABLE immobilier ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Immobilier public" ON immobilier FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leur immobilier" ON immobilier FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent tout immobilier" ON immobilier FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Circuits touristiques
ALTER TABLE circuits_touristiques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circuits publics" ON circuits_touristiques FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leurs circuits" ON circuits_touristiques FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent tous circuits" ON circuits_touristiques FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Guides touristiques
ALTER TABLE guides_touristiques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guides publics" ON guides_touristiques FOR SELECT USING (available = true);
CREATE POLICY "Guides gèrent leur profil" ON guides_touristiques FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent tous guides" ON guides_touristiques FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Activités touristiques
ALTER TABLE activites_touristiques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activités publiques" ON activites_touristiques FOR SELECT USING (available = true);
CREATE POLICY "Partenaires gèrent leurs activités" ON activites_touristiques FOR ALL USING (auth.uid() = partner_id);
CREATE POLICY "Admins gèrent toutes activités" ON activites_touristiques FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Événements
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Événements publics" ON evenements FOR SELECT USING (status != 'cancelled');
CREATE POLICY "Organisateurs gèrent leurs événements" ON evenements FOR ALL USING (auth.uid() = organizer_id);
CREATE POLICY "Admins gèrent tous événements" ON evenements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Annonces
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Annonces actives publiques" ON annonces FOR SELECT USING (status = 'active');
CREATE POLICY "Utilisateurs gèrent leurs annonces" ON annonces FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins gèrent toutes annonces" ON annonces FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

SELECT '✅ TOUTES LES TABLES CRÉÉES AVEC SUCCÈS !' as message;
