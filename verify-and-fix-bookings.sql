-- ================================================
-- VÉRIFICATION ET CORRECTION TABLE BOOKINGS
-- Pour les réservations de circuits touristiques
-- ================================================

-- 1. Vérifier la structure actuelle
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- ================================================
-- AJOUTER LES COLONNES MANQUANTES SI NÉCESSAIRE
-- ================================================

-- Ajouter circuit_id si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'circuit_id'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN circuit_id UUID REFERENCES circuits_touristiques(id);
  END IF;
END $$;

-- Ajouter circuit_title si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'circuit_title'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN circuit_title TEXT;
  END IF;
END $$;

-- Ajouter client_name si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'client_name'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN client_name TEXT;
  END IF;
END $$;

-- Ajouter client_email si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'client_email'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN client_email TEXT;
  END IF;
END $$;

-- Ajouter client_phone si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'client_phone'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN client_phone TEXT;
  END IF;
END $$;

-- Ajouter number_of_people si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'number_of_people'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN number_of_people INTEGER DEFAULT 1;
  END IF;
END $$;

-- Ajouter custom_duration si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'custom_duration'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN custom_duration INTEGER;
  END IF;
END $$;

-- Ajouter start_date si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'start_date'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN start_date DATE;
  END IF;
END $$;

-- Ajouter total_price si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'total_price'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN total_price NUMERIC(10,2);
  END IF;
END $$;

-- Ajouter payment_status si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Ajouter payment_method si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN payment_method TEXT;
  END IF;
END $$;

-- Ajouter special_requests si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'special_requests'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN special_requests TEXT;
  END IF;
END $$;

-- ================================================
-- CRÉER UN INDEX POUR AMÉLIORER LES PERFORMANCES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_bookings_circuit_id ON bookings(circuit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- ================================================
-- CRÉER UNE VUE POUR LE DASHBOARD ADMIN
-- ================================================

CREATE OR REPLACE VIEW admin_circuit_bookings_view AS
SELECT 
  b.id,
  b.circuit_id,
  COALESCE(b.circuit_title, c.title) as circuit_title,
  b.client_name,
  b.client_email,
  b.client_phone,
  b.number_of_people,
  b.custom_duration,
  b.start_date,
  b.total_price,
  b.payment_status,
  b.payment_method,
  b.special_requests,
  b.created_at,
  c.price_per_person,
  c.duration_days as standard_duration
FROM bookings b
LEFT JOIN circuits_touristiques c ON b.circuit_id = c.id
WHERE b.circuit_id IS NOT NULL
ORDER BY b.created_at DESC;

-- ================================================
-- VÉRIFICATION FINALE
-- ================================================

-- Afficher la structure finale
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- Compter les réservations
SELECT 
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN payment_status = 'confirmed' THEN 1 END) as confirmed,
  COUNT(CASE WHEN payment_status = 'cancelled' THEN 1 END) as cancelled
FROM bookings
WHERE circuit_id IS NOT NULL;
