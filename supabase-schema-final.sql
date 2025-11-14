-- ============================================
-- SCHÉMA COMPLET MAROC 2030
-- Base de données avec RLS et identifiants admin
-- ============================================

-- ============================================
-- 1. SUPPRESSION DES TABLES EXISTANTES (si nécessaire)
-- ============================================
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS advertisements CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS tourism_events CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS real_estate CASCADE;
DROP TABLE IF EXISTS car_rentals CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS admin_credentials CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 2. TABLE DES PROFILS
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role VARCHAR(20) CHECK (role IN ('admin', 'partner_tourism', 'partner_car', 'partner_realestate', 'client')) DEFAULT 'client',
  company_name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Maroc',
  avatar_url TEXT,
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. TABLE DES IDENTIFIANTS ADMIN
-- ============================================
CREATE TABLE admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. CATÉGORIES DE SERVICES
-- ============================================
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100),
  type VARCHAR(50) CHECK (type IN ('tourism', 'car_rental', 'real_estate', 'hotel', 'event')),
  icon VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertion des catégories
INSERT INTO service_categories (name, name_ar, type, icon) VALUES
('Tourisme', 'السياحة', 'tourism', '🏔️'),
('Location de Voitures', 'تأجير السيارات', 'car_rental', '🚗'),
('Appartements', 'الشقق', 'real_estate', '🏢'),
('Villas', 'الفيلات', 'real_estate', '🏠'),
('Hôtels', 'الفنادق', 'hotel', '🏨'),
('Événements', 'الفعاليات', 'event', '🎪'),
('Guides Touristiques', 'المرشدين السياحيين', 'tourism', '🧭');

-- ============================================
-- 5. SERVICES PRINCIPAUX
-- ============================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id),
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  price DECIMAL(10,2),
  price_per VARCHAR(50) DEFAULT 'jour',
  location VARCHAR(255),
  city VARCHAR(100),
  region VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  images TEXT[],
  features JSONB,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index pour optimisation
CREATE INDEX idx_services_partner ON services(partner_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_city ON services(city);
CREATE INDEX idx_services_available ON services(available);

-- ============================================
-- 6. LOCATIONS DE VOITURES
-- ============================================
CREATE TABLE car_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  brand VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  seats INTEGER,
  luggage_capacity INTEGER,
  insurance_included BOOLEAN DEFAULT false,
  unlimited_mileage BOOLEAN DEFAULT true,
  minimum_rental_days INTEGER DEFAULT 1
);

CREATE INDEX idx_car_rentals_service ON car_rentals(service_id);

-- ============================================
-- 7. IMMOBILIER
-- ============================================
CREATE TABLE real_estate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  property_type VARCHAR(50) CHECK (property_type IN ('apartment', 'villa', 'riad', 'house')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  area DECIMAL(8,2),
  furnished BOOLEAN DEFAULT false,
  air_conditioning BOOLEAN DEFAULT false,
  heating BOOLEAN DEFAULT false,
  terrace BOOLEAN DEFAULT false,
  pool BOOLEAN DEFAULT false,
  garden BOOLEAN DEFAULT false,
  security BOOLEAN DEFAULT false,
  amenities TEXT[]
);

CREATE INDEX idx_real_estate_service ON real_estate(service_id);

-- ============================================
-- 8. HÔTELS
-- ============================================
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  stars INTEGER CHECK (stars BETWEEN 1 AND 5),
  check_in TIME DEFAULT '14:00',
  check_out TIME DEFAULT '12:00',
  restaurant BOOLEAN DEFAULT false,
  spa BOOLEAN DEFAULT false,
  parking BOOLEAN DEFAULT false,
  wifi BOOLEAN DEFAULT false,
  pool BOOLEAN DEFAULT false,
  amenities TEXT[]
);

CREATE INDEX idx_hotels_service ON hotels(service_id);

-- ============================================
-- 9. ÉVÉNEMENTS TOURISTIQUES
-- ============================================
CREATE TABLE tourism_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  event_date DATE,
  event_time TIME,
  duration INTEGER,
  max_participants INTEGER,
  meeting_point VARCHAR(255),
  guide_included BOOLEAN DEFAULT false,
  transport_included BOOLEAN DEFAULT false,
  difficulty_level VARCHAR(50)
);

CREATE INDEX idx_tourism_events_service ON tourism_events(service_id);
CREATE INDEX idx_tourism_events_date ON tourism_events(event_date);

-- ============================================
-- 10. RÉSERVATIONS
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  booking_date TIMESTAMP DEFAULT NOW(),
  start_date DATE,
  end_date DATE,
  number_of_guests INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  special_requests TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- ============================================
-- 11. PAIEMENTS
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'MAD',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- 12. MESSAGES DE CONTACT
-- ============================================
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT,
  replied BOOLEAN DEFAULT false,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_replied ON contact_messages(replied);

-- ============================================
-- 13. ANNONCES PUBLICITAIRES
-- ============================================
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  title_ar VARCHAR(255),
  content TEXT,
  content_ar TEXT,
  image_url VARCHAR(255),
  active BOOLEAN DEFAULT true,
  position VARCHAR(50),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_advertisements_active ON advertisements(active);
CREATE INDEX idx_advertisements_dates ON advertisements(start_date, end_date);

-- ============================================
-- 14. AVIS DES CLIENTS
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_reviews_client ON reviews(client_id);
CREATE INDEX idx_reviews_approved ON reviews(approved);

-- ============================================
-- 15. ACTIVATION DE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 16. POLITIQUES RLS - PROFILES
-- ============================================

-- Tout le monde peut voir les profils publics
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Les admins peuvent tout faire
CREATE POLICY "Admins can do everything on profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 17. POLITIQUES RLS - SERVICES
-- ============================================

-- Tout le monde peut voir les services disponibles
CREATE POLICY "Anyone can view available services"
  ON services FOR SELECT
  USING (available = true OR auth.uid() = partner_id);

-- Les partenaires peuvent créer leurs services
CREATE POLICY "Partners can create services"
  ON services FOR INSERT
  WITH CHECK (
    auth.uid() = partner_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role IN ('partner_tourism', 'partner_car', 'partner_realestate', 'admin')
    )
  );

-- Les partenaires peuvent modifier leurs services
CREATE POLICY "Partners can update own services"
  ON services FOR UPDATE
  USING (auth.uid() = partner_id);

-- Les partenaires peuvent supprimer leurs services
CREATE POLICY "Partners can delete own services"
  ON services FOR DELETE
  USING (auth.uid() = partner_id);

-- Les admins peuvent tout faire
CREATE POLICY "Admins can do everything on services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 18. POLITIQUES RLS - CAR RENTALS
-- ============================================

CREATE POLICY "Anyone can view car rentals"
  ON car_rentals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = car_rentals.service_id
      AND services.available = true
    )
  );

CREATE POLICY "Partners can manage their car rentals"
  ON car_rentals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = car_rentals.service_id
      AND services.partner_id = auth.uid()
    )
  );

-- ============================================
-- 19. POLITIQUES RLS - REAL ESTATE
-- ============================================

CREATE POLICY "Anyone can view real estate"
  ON real_estate FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = real_estate.service_id
      AND services.available = true
    )
  );

CREATE POLICY "Partners can manage their real estate"
  ON real_estate FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = real_estate.service_id
      AND services.partner_id = auth.uid()
    )
  );

-- ============================================
-- 20. POLITIQUES RLS - HOTELS
-- ============================================

CREATE POLICY "Anyone can view hotels"
  ON hotels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = hotels.service_id
      AND services.available = true
    )
  );

CREATE POLICY "Partners can manage their hotels"
  ON hotels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = hotels.service_id
      AND services.partner_id = auth.uid()
    )
  );

-- ============================================
-- 21. POLITIQUES RLS - TOURISM EVENTS
-- ============================================

CREATE POLICY "Anyone can view tourism events"
  ON tourism_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = tourism_events.service_id
      AND services.available = true
    )
  );

CREATE POLICY "Partners can manage their events"
  ON tourism_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = tourism_events.service_id
      AND services.partner_id = auth.uid()
    )
  );

-- ============================================
-- 22. POLITIQUES RLS - BOOKINGS
-- ============================================

-- Les clients peuvent voir leurs propres réservations
CREATE POLICY "Clients can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = client_id);

-- Les partenaires peuvent voir les réservations de leurs services
CREATE POLICY "Partners can view bookings for their services"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = bookings.service_id
      AND services.partner_id = auth.uid()
    )
  );

-- Les clients peuvent créer des réservations
CREATE POLICY "Clients can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Les clients peuvent annuler leurs réservations
CREATE POLICY "Clients can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = client_id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 23. POLITIQUES RLS - PAYMENTS
-- ============================================

-- Les clients peuvent voir leurs paiements
CREATE POLICY "Clients can view own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.client_id = auth.uid()
    )
  );

-- Les partenaires peuvent voir les paiements de leurs services
CREATE POLICY "Partners can view payments for their services"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      JOIN services ON services.id = bookings.service_id
      WHERE bookings.id = payments.booking_id
      AND services.partner_id = auth.uid()
    )
  );

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 24. POLITIQUES RLS - CONTACT MESSAGES
-- ============================================

-- Tout le monde peut créer un message
CREATE POLICY "Anyone can create contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all contact messages"
  ON contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Les admins peuvent mettre à jour
CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 25. POLITIQUES RLS - ADVERTISEMENTS
-- ============================================

-- Tout le monde peut voir les annonces actives
CREATE POLICY "Anyone can view active advertisements"
  ON advertisements FOR SELECT
  USING (active = true AND CURRENT_DATE BETWEEN start_date AND end_date);

-- Les admins peuvent tout faire
CREATE POLICY "Admins can manage advertisements"
  ON advertisements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 26. POLITIQUES RLS - REVIEWS
-- ============================================

-- Tout le monde peut voir les avis approuvés
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (approved = true);

-- Les clients peuvent voir leurs propres avis
CREATE POLICY "Clients can view own reviews"
  ON reviews FOR SELECT
  USING (auth.uid() = client_id);

-- Les clients peuvent créer des avis
CREATE POLICY "Clients can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.client_id = auth.uid()
    )
  );

-- Les admins peuvent tout faire
CREATE POLICY "Admins can manage reviews"
  ON reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 27. FONCTION POUR CRÉER UN PROFIL AUTOMATIQUEMENT
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 28. CRÉATION DES COMPTES ADMIN
-- ============================================

-- Note: Les utilisateurs doivent d'abord être créés dans Supabase Auth
-- Ensuite, exécutez ces requêtes pour mettre à jour leur rôle

-- Pour maroc2031@gmail.com
-- UPDATE profiles 
-- SET role = 'admin', 
--     company_name = 'Maroc 2030 Admin',
--     is_verified = true
-- WHERE id IN (
--   SELECT id FROM auth.users WHERE email = 'maroc2031@gmail.com'
-- );

-- Pour maroc2032@gmail.com
-- UPDATE profiles 
-- SET role = 'admin',
--     company_name = 'Maroc 2030 Admin',
--     is_verified = true
-- WHERE id IN (
--   SELECT id FROM auth.users WHERE email = 'maroc2032@gmail.com'
-- );

-- ============================================
-- FIN DU SCHÉMA
-- ============================================

-- Vérification finale
SELECT 'Base de données Maroc 2030 créée avec succès!' as message;
