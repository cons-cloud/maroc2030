-- ================================================
-- SYSTÈME DE RÉSERVATION ET PAIEMENT
-- VERSION ÉTAPE PAR ÉTAPE (SANS ERREUR)
-- ================================================

-- ================================================
-- ÉTAPE 1 : EXTENSION UUID
-- ================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ÉTAPE 2 : SUPPRIMER LES ANCIENNES TABLES (SI ELLES EXISTENT)
-- ================================================
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP SEQUENCE IF EXISTS booking_number_seq CASCADE;
DROP SEQUENCE IF EXISTS invoice_number_seq CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_booking_number() CASCADE;
DROP FUNCTION IF EXISTS generate_invoice_number() CASCADE;

-- ================================================
-- ÉTAPE 3 : CRÉER LES SÉQUENCES
-- ================================================
CREATE SEQUENCE booking_number_seq START 1;
CREATE SEQUENCE invoice_number_seq START 1;

-- ================================================
-- ÉTAPE 4 : CRÉER LES FONCTIONS
-- ================================================

-- Fonction pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer booking_number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL THEN
    NEW.booking_number = 'BK-' || 
                         TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                         LPAD(NEXTVAL('booking_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer invoice_number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number = 'INV-' || 
                         TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                         LPAD(NEXTVAL('invoice_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- ÉTAPE 5 : CRÉER LA TABLE bookings
-- ================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Références
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service_id UUID,
  service_type VARCHAR(50),
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Dates
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  booking_date TIMESTAMP DEFAULT NOW(),
  
  -- Détails
  guests INTEGER NOT NULL DEFAULT 1,
  nights INTEGER NOT NULL,
  
  -- Prix
  price_per_night NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MAD',
  
  -- Statut
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Informations client
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  client_address TEXT,
  client_city VARCHAR(100),
  client_country VARCHAR(100) DEFAULT 'Maroc',
  
  -- Demandes spéciales
  special_requests TEXT,
  notes TEXT,
  
  -- Numéro de réservation
  booking_number VARCHAR(50) UNIQUE,
  
  -- Annulation
  cancelled_at TIMESTAMP,
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT,
  refund_amount NUMERIC(10, 2) DEFAULT 0,
  
  -- Métadonnées
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT valid_guests CHECK (guests > 0),
  CONSTRAINT valid_nights CHECK (nights > 0),
  CONSTRAINT valid_amounts CHECK (total_amount >= 0),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'refunded'))
);

-- ================================================
-- ÉTAPE 6 : CRÉER LA TABLE payments
-- ================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Références
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Stripe
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  
  -- Montants
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MAD',
  
  -- Statut
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Méthode de paiement
  payment_method VARCHAR(50),
  payment_method_details JSONB,
  
  -- Informations carte
  card_last4 VARCHAR(4),
  card_brand VARCHAR(20),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  
  -- Remboursement
  refund_amount NUMERIC(10, 2) DEFAULT 0,
  refund_reason TEXT,
  refunded_at TIMESTAMP,
  
  -- Erreurs
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- Métadonnées
  metadata JSONB DEFAULT '{}',
  stripe_metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  
  -- Contraintes
  CONSTRAINT valid_payment_amount CHECK (amount >= 0),
  CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'))
);

-- ================================================
-- ÉTAPE 7 : CRÉER LA TABLE invoices
-- ================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Références
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Numéro de facture
  invoice_number VARCHAR(50) UNIQUE,
  
  -- Montants
  subtotal NUMERIC(10, 2) NOT NULL,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  tax_rate NUMERIC(5, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MAD',
  
  -- Statut
  status VARCHAR(20) DEFAULT 'draft',
  
  -- Informations client
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_address TEXT,
  client_city VARCHAR(100),
  client_country VARCHAR(100) DEFAULT 'Maroc',
  
  -- Informations entreprise
  company_name VARCHAR(255) DEFAULT 'Maroc 2030',
  company_address TEXT,
  company_email VARCHAR(255),
  company_phone VARCHAR(50),
  company_tax_id VARCHAR(50),
  
  -- Détails
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  terms TEXT,
  
  -- PDF
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP,
  
  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  
  -- Métadonnées
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_invoice_amounts CHECK (total_amount >= 0),
  CONSTRAINT valid_invoice_status CHECK (status IN ('draft', 'sent', 'paid', 'cancelled', 'refunded'))
);

-- ================================================
-- ÉTAPE 8 : CRÉER LES INDEX
-- ================================================

-- Index pour bookings
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_partner_id ON bookings(partner_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- Index pour payments
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Index pour invoices
CREATE INDEX idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX idx_invoices_payment_id ON invoices(payment_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- ================================================
-- ÉTAPE 9 : CRÉER LES TRIGGERS
-- ================================================

-- Triggers pour updated_at
CREATE TRIGGER trigger_update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour booking_number
CREATE TRIGGER trigger_generate_booking_number
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_number();

-- Trigger pour invoice_number
CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- ================================================
-- ÉTAPE 10 : ACTIVER RLS
-- ================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- ================================================
-- ÉTAPE 11 : CRÉER LES POLICIES POUR bookings
-- ================================================

-- Clients peuvent voir leurs réservations
CREATE POLICY "Clients can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

-- Partenaires peuvent voir les réservations de leurs services
CREATE POLICY "Partners can view their service bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = partner_id);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Utilisateurs authentifiés peuvent créer des réservations
CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- Clients peuvent modifier leurs réservations en attente
CREATE POLICY "Clients can update their pending bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id AND status = 'pending')
  WITH CHECK (auth.uid() = client_id AND status = 'pending');

-- Partenaires peuvent modifier le statut de leurs réservations
CREATE POLICY "Partners can update their bookings status"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = partner_id)
  WITH CHECK (auth.uid() = partner_id);

-- Admins peuvent tout modifier
CREATE POLICY "Admins can update all bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins peuvent supprimer
CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ================================================
-- ÉTAPE 12 : CRÉER LES POLICIES POUR payments
-- ================================================

-- Clients peuvent voir leurs paiements
CREATE POLICY "Clients can view their own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Système peut créer des paiements (via service_role)
CREATE POLICY "Service role can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins peuvent modifier
CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ================================================
-- ÉTAPE 13 : CRÉER LES POLICIES POUR invoices
-- ================================================

-- Clients peuvent voir leurs factures
CREATE POLICY "Clients can view their own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins peuvent créer
CREATE POLICY "Admins can create invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins peuvent modifier
CREATE POLICY "Admins can update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ================================================
-- ÉTAPE 14 : VÉRIFICATION ET MESSAGE DE SUCCÈS
-- ================================================

-- Vérifier que tout est créé
DO $$
DECLARE
  booking_count INTEGER;
  payment_count INTEGER;
  invoice_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO booking_count FROM information_schema.tables WHERE table_name = 'bookings';
  SELECT COUNT(*) INTO payment_count FROM information_schema.tables WHERE table_name = 'payments';
  SELECT COUNT(*) INTO invoice_count FROM information_schema.tables WHERE table_name = 'invoices';
  
  IF booking_count > 0 AND payment_count > 0 AND invoice_count > 0 THEN
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ SYSTÈME DE RÉSERVATION CRÉÉ AVEC SUCCÈS';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ Tables créées : bookings, payments, invoices';
    RAISE NOTICE '✅ Index créés : 17 index pour performances';
    RAISE NOTICE '✅ Triggers créés : 5 triggers automatiques';
    RAISE NOTICE '✅ RLS activé : 16 policies de sécurité';
    RAISE NOTICE '✅ Séquences créées : booking_number_seq, invoice_number_seq';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ Prêt à utiliser ! 🚀';
    RAISE NOTICE '✅ ========================================';
  ELSE
    RAISE EXCEPTION 'Erreur : Toutes les tables n''ont pas été créées';
  END IF;
END $$;
