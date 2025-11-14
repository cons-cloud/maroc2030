-- ================================================
-- SYSTÈME COMPLET DE RÉSERVATION
-- Pour : Appartements, Hôtels, Villas, Locations de voitures
-- Synchronisé avec Dashboard Admin + Stripe + CMI
-- ================================================

-- ================================================
-- PARTIE 1 : STRUCTURE DES TABLES
-- ================================================

-- Table APPARTEMENTS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appartements' 
    AND column_name = 'price_per_night'
  ) THEN
    ALTER TABLE appartements 
    ADD COLUMN price_per_night NUMERIC(10,2);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appartements' 
    AND column_name = 'max_guests'
  ) THEN
    ALTER TABLE appartements 
    ADD COLUMN max_guests INTEGER DEFAULT 4;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appartements' 
    AND column_name = 'bedrooms'
  ) THEN
    ALTER TABLE appartements 
    ADD COLUMN bedrooms INTEGER DEFAULT 1;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appartements' 
    AND column_name = 'amenities'
  ) THEN
    ALTER TABLE appartements 
    ADD COLUMN amenities TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Table HOTELS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hotels' 
    AND column_name = 'price_per_night'
  ) THEN
    ALTER TABLE hotels 
    ADD COLUMN price_per_night NUMERIC(10,2);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hotels' 
    AND column_name = 'room_types'
  ) THEN
    ALTER TABLE hotels 
    ADD COLUMN room_types JSONB DEFAULT '[]';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hotels' 
    AND column_name = 'amenities'
  ) THEN
    ALTER TABLE hotels 
    ADD COLUMN amenities TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Table VILLAS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'villas' 
    AND column_name = 'price_per_night'
  ) THEN
    ALTER TABLE villas 
    ADD COLUMN price_per_night NUMERIC(10,2);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'villas' 
    AND column_name = 'max_guests'
  ) THEN
    ALTER TABLE villas 
    ADD COLUMN max_guests INTEGER DEFAULT 6;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'villas' 
    AND column_name = 'bedrooms'
  ) THEN
    ALTER TABLE villas 
    ADD COLUMN bedrooms INTEGER DEFAULT 3;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'villas' 
    AND column_name = 'amenities'
  ) THEN
    ALTER TABLE villas 
    ADD COLUMN amenities TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Table LOCATIONS_VOITURES
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations_voitures' 
    AND column_name = 'price_per_day'
  ) THEN
    ALTER TABLE locations_voitures 
    ADD COLUMN price_per_day NUMERIC(10,2);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations_voitures' 
    AND column_name = 'seats'
  ) THEN
    ALTER TABLE locations_voitures 
    ADD COLUMN seats INTEGER DEFAULT 5;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations_voitures' 
    AND column_name = 'transmission'
  ) THEN
    ALTER TABLE locations_voitures 
    ADD COLUMN transmission TEXT DEFAULT 'Manuelle';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations_voitures' 
    AND column_name = 'fuel_type'
  ) THEN
    ALTER TABLE locations_voitures 
    ADD COLUMN fuel_type TEXT DEFAULT 'Essence';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations_voitures' 
    AND column_name = 'features'
  ) THEN
    ALTER TABLE locations_voitures 
    ADD COLUMN features TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- ================================================
-- PARTIE 2 : TABLE BOOKINGS (RÉSERVATIONS UNIFIÉE)
-- ================================================

-- Ajouter colonnes pour tous les types de services
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'service_type'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN service_type TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'service_id'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN service_id UUID;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'service_title'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN service_title TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'check_in_date'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN check_in_date DATE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'check_out_date'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN check_out_date DATE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'number_of_guests'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN number_of_guests INTEGER DEFAULT 1;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'number_of_nights'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN number_of_nights INTEGER;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'number_of_days'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN number_of_days INTEGER;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'room_type'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN room_type TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'pickup_location'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN pickup_location TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'dropoff_location'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN dropoff_location TEXT;
  END IF;
END $$;

-- ================================================
-- PARTIE 3 : INDEX POUR PERFORMANCES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON bookings(service_type);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out_date ON bookings(check_out_date);

CREATE INDEX IF NOT EXISTS idx_appartements_available ON appartements(available);
CREATE INDEX IF NOT EXISTS idx_appartements_city ON appartements(city);
CREATE INDEX IF NOT EXISTS idx_hotels_available ON hotels(available);
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_villas_available ON villas(available);
CREATE INDEX IF NOT EXISTS idx_villas_city ON villas(city);
CREATE INDEX IF NOT EXISTS idx_locations_voitures_available ON locations_voitures(available);

-- ================================================
-- PARTIE 4 : VUES POUR LE DASHBOARD ADMIN
-- ================================================

-- Vue pour toutes les réservations (tous services)
CREATE OR REPLACE VIEW admin_all_bookings_view AS
SELECT 
  b.id,
  b.service_type,
  b.service_id,
  b.service_title,
  b.client_name,
  b.client_email,
  b.client_phone,
  b.check_in_date,
  b.check_out_date,
  b.number_of_guests,
  b.number_of_nights,
  b.number_of_days,
  b.room_type,
  b.pickup_location,
  b.dropoff_location,
  b.total_price,
  b.payment_status,
  b.payment_method,
  b.special_requests,
  b.created_at,
  CASE 
    WHEN b.service_type = 'appartement' THEN a.city
    WHEN b.service_type = 'hotel' THEN h.city
    WHEN b.service_type = 'villa' THEN v.city
    ELSE NULL
  END as city
FROM bookings b
LEFT JOIN appartements a ON b.service_type = 'appartement' AND b.service_id = a.id
LEFT JOIN hotels h ON b.service_type = 'hotel' AND b.service_id = h.id
LEFT JOIN villas v ON b.service_type = 'villa' AND b.service_id = v.id
ORDER BY b.created_at DESC;

-- Vue pour réservations d'appartements
CREATE OR REPLACE VIEW admin_appartement_bookings_view AS
SELECT 
  b.id,
  b.service_id as appartement_id,
  b.service_title as appartement_title,
  b.client_name,
  b.client_email,
  b.client_phone,
  b.check_in_date,
  b.check_out_date,
  b.number_of_guests,
  b.number_of_nights,
  b.total_price,
  b.payment_status,
  b.payment_method,
  b.special_requests,
  b.created_at,
  a.city,
  a.price_per_night,
  a.max_guests
FROM bookings b
LEFT JOIN appartements a ON b.service_id = a.id
WHERE b.service_type = 'appartement'
ORDER BY b.created_at DESC;

-- Vue pour réservations d'hôtels
CREATE OR REPLACE VIEW admin_hotel_bookings_view AS
SELECT 
  b.id,
  b.service_id as hotel_id,
  b.service_title as hotel_title,
  b.client_name,
  b.client_email,
  b.client_phone,
  b.check_in_date,
  b.check_out_date,
  b.number_of_guests,
  b.number_of_nights,
  b.room_type,
  b.total_price,
  b.payment_status,
  b.payment_method,
  b.special_requests,
  b.created_at,
  h.city,
  h.price_per_night
FROM bookings b
LEFT JOIN hotels h ON b.service_id = h.id
WHERE b.service_type = 'hotel'
ORDER BY b.created_at DESC;

-- Vue pour réservations de villas
CREATE OR REPLACE VIEW admin_villa_bookings_view AS
SELECT 
  b.id,
  b.service_id as villa_id,
  b.service_title as villa_title,
  b.client_name,
  b.client_email,
  b.client_phone,
  b.check_in_date,
  b.check_out_date,
  b.number_of_guests,
  b.number_of_nights,
  b.total_price,
  b.payment_status,
  b.payment_method,
  b.special_requests,
  b.created_at,
  v.city,
  v.price_per_night,
  v.max_guests
FROM bookings b
LEFT JOIN villas v ON b.service_id = v.id
WHERE b.service_type = 'villa'
ORDER BY b.created_at DESC;

-- Vue pour locations de voitures
CREATE OR REPLACE VIEW admin_car_rental_bookings_view AS
SELECT 
  b.id,
  b.service_id as car_id,
  b.service_title as car_title,
  b.client_name,
  b.client_email,
  b.client_phone,
  b.check_in_date as pickup_date,
  b.check_out_date as return_date,
  b.number_of_days,
  b.pickup_location,
  b.dropoff_location,
  b.total_price,
  b.payment_status,
  b.payment_method,
  b.special_requests,
  b.created_at,
  lv.price_per_day,
  lv.transmission,
  lv.fuel_type
FROM bookings b
LEFT JOIN locations_voitures lv ON b.service_id = lv.id
WHERE b.service_type = 'voiture'
ORDER BY b.created_at DESC;

-- ================================================
-- PARTIE 5 : STATISTIQUES GLOBALES
-- ================================================

CREATE OR REPLACE VIEW admin_booking_statistics AS
SELECT 
  service_type,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN payment_status = 'confirmed' THEN 1 END) as confirmed,
  COUNT(CASE WHEN payment_status = 'cancelled' THEN 1 END) as cancelled,
  SUM(CASE WHEN payment_status = 'confirmed' THEN total_price ELSE 0 END) as total_revenue,
  AVG(CASE WHEN payment_status = 'confirmed' THEN total_price END) as average_booking_value
FROM bookings
WHERE service_type IS NOT NULL
GROUP BY service_type;

-- ================================================
-- PARTIE 6 : VÉRIFICATION FINALE
-- ================================================

-- Afficher les statistiques par service
SELECT * FROM admin_booking_statistics;

-- Compter les réservations par type
SELECT 
  service_type,
  COUNT(*) as total,
  SUM(total_price) as revenue
FROM bookings
WHERE service_type IS NOT NULL
GROUP BY service_type
ORDER BY total DESC;

-- Afficher les structures des tables
SELECT 'APPARTEMENTS' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appartements'
ORDER BY ordinal_position;

SELECT 'HOTELS' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'hotels'
ORDER BY ordinal_position;

SELECT 'VILLAS' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'villas'
ORDER BY ordinal_position;

SELECT 'LOCATIONS_VOITURES' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'locations_voitures'
ORDER BY ordinal_position;
