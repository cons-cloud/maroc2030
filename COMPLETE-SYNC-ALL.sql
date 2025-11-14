-- ================================================
-- SYNCHRONISATION COMPLÈTE - CIRCUITS + RÉSERVATIONS + PAIEMENTS
-- Tout ce qui manque pour que tout soit connecté
-- ================================================

-- ================================================
-- PARTIE 1 : TABLE CIRCUITS_TOURISTIQUES
-- ================================================

-- Ajouter max_participants
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'circuits_touristiques' 
    AND column_name = 'max_participants'
  ) THEN
    ALTER TABLE circuits_touristiques 
    ADD COLUMN max_participants INTEGER DEFAULT 15;
  END IF;
END $$;

-- Ajouter highlights
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'circuits_touristiques' 
    AND column_name = 'highlights'
  ) THEN
    ALTER TABLE circuits_touristiques 
    ADD COLUMN highlights TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Ajouter included
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'circuits_touristiques' 
    AND column_name = 'included'
  ) THEN
    ALTER TABLE circuits_touristiques 
    ADD COLUMN included TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Ajouter not_included
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'circuits_touristiques' 
    AND column_name = 'not_included'
  ) THEN
    ALTER TABLE circuits_touristiques 
    ADD COLUMN not_included TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Mettre à jour les circuits existants
UPDATE circuits_touristiques
SET max_participants = 15
WHERE max_participants IS NULL OR max_participants = 0;

UPDATE circuits_touristiques
SET highlights = ARRAY['Découverte culturelle', 'Paysages exceptionnels', 'Guide expérimenté']
WHERE highlights IS NULL OR array_length(highlights, 1) IS NULL;

UPDATE circuits_touristiques
SET included = ARRAY['Transport', 'Guide francophone', 'Eau minérale']
WHERE included IS NULL OR array_length(included, 1) IS NULL;

UPDATE circuits_touristiques
SET not_included = ARRAY['Repas non mentionnés', 'Boissons', 'Pourboires']
WHERE not_included IS NULL OR array_length(not_included, 1) IS NULL;

-- ================================================
-- PARTIE 2 : TABLE BOOKINGS (RÉSERVATIONS)
-- ================================================

-- Ajouter circuit_id
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

-- Ajouter circuit_title
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

-- Ajouter client_name
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

-- Ajouter client_email
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

-- Ajouter client_phone
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

-- Ajouter number_of_people
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

-- Ajouter custom_duration
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

-- Ajouter start_date
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

-- Ajouter total_price
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

-- Ajouter payment_status
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

-- Ajouter payment_method
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

-- Ajouter special_requests
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
-- PARTIE 3 : TABLE PAYMENTS (PAIEMENTS)
-- ================================================

-- Vérifier si la table payments existe
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'MAD',
  payment_method TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  cmi_transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ajouter des colonnes supplémentaires si nécessaire
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' 
    AND column_name = 'cmi_transaction_id'
  ) THEN
    ALTER TABLE payments 
    ADD COLUMN cmi_transaction_id TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' 
    AND column_name = 'client_name'
  ) THEN
    ALTER TABLE payments 
    ADD COLUMN client_name TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' 
    AND column_name = 'client_email'
  ) THEN
    ALTER TABLE payments 
    ADD COLUMN client_email TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' 
    AND column_name = 'service_type'
  ) THEN
    ALTER TABLE payments 
    ADD COLUMN service_type TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' 
    AND column_name = 'service_title'
  ) THEN
    ALTER TABLE payments 
    ADD COLUMN service_title TEXT;
  END IF;
END $$;

-- ================================================
-- PARTIE 4 : INDEX POUR PERFORMANCES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_bookings_circuit_id ON bookings(circuit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- ================================================
-- PARTIE 5 : VUES POUR LE DASHBOARD ADMIN
-- ================================================

-- Vue pour les réservations de circuits
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
  c.duration_days as standard_duration,
  c.max_participants
FROM bookings b
LEFT JOIN circuits_touristiques c ON b.circuit_id = c.id
WHERE b.circuit_id IS NOT NULL
ORDER BY b.created_at DESC;

-- Vue pour tous les paiements (circuits + autres services)
CREATE OR REPLACE VIEW admin_all_payments_view AS
SELECT 
  p.id,
  p.booking_id,
  p.amount,
  p.currency,
  p.payment_method,
  p.status,
  p.paid_at,
  p.created_at,
  COALESCE(p.client_name, b.client_name) as client_name,
  COALESCE(p.client_email, b.client_email) as client_email,
  COALESCE(p.service_type, 'circuit') as service_type,
  COALESCE(p.service_title, b.circuit_title) as service_title,
  p.stripe_payment_intent_id,
  p.cmi_transaction_id
FROM payments p
LEFT JOIN bookings b ON p.booking_id = b.id
ORDER BY p.created_at DESC;

-- ================================================
-- PARTIE 6 : TRIGGER POUR METTRE À JOUR updated_at
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur payments
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- PARTIE 7 : VÉRIFICATION FINALE
-- ================================================

-- Afficher la structure de circuits_touristiques
SELECT 'CIRCUITS_TOURISTIQUES' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'circuits_touristiques'
ORDER BY ordinal_position;

-- Afficher la structure de bookings
SELECT 'BOOKINGS' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- Afficher la structure de payments
SELECT 'PAYMENTS' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- Statistiques
SELECT 
  'Circuits' as type,
  COUNT(*) as total,
  COUNT(CASE WHEN available = true THEN 1 END) as actifs
FROM circuits_touristiques
UNION ALL
SELECT 
  'Réservations' as type,
  COUNT(*) as total,
  COUNT(CASE WHEN payment_status = 'confirmed' THEN 1 END) as confirmées
FROM bookings
WHERE circuit_id IS NOT NULL
UNION ALL
SELECT 
  'Paiements' as type,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as réussis
FROM payments;

-- Afficher le revenu total
SELECT 
  SUM(amount) as revenu_total,
  COUNT(*) as nombre_paiements,
  AVG(amount) as montant_moyen
FROM payments
WHERE status = 'succeeded';
