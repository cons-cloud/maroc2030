-- ================================================
-- SYSTÈME COMPLET DE RÉSERVATION ET PAIEMENT
-- ================================================
-- Ce script crée toutes les tables nécessaires pour un système
-- de réservation et paiement sécurisé avec intégration Stripe
-- ================================================

-- ================================================
-- EXTENSION UUID (si pas déjà activée)
-- ================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE : bookings (Réservations)
-- ================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- ==========================================
  -- RÉFÉRENCES
  -- ==========================================
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service_id UUID, -- Peut référencer hotels ou services
  service_type VARCHAR(50), -- 'hotel', 'appartement', 'villa', 'voiture', etc.
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- ==========================================
  -- DATES DE RÉSERVATION
  -- ==========================================
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  booking_date TIMESTAMP DEFAULT NOW(),
  
  -- ==========================================
  -- DÉTAILS DE LA RÉSERVATION
  -- ==========================================
  guests INTEGER NOT NULL DEFAULT 1,
  nights INTEGER NOT NULL,
  
  -- ==========================================
  -- PRIX ET MONTANTS
  -- ==========================================
  price_per_night NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MAD',
  
  -- ==========================================
  -- STATUT DE LA RÉSERVATION
  -- ==========================================
  status VARCHAR(20) DEFAULT 'pending',
  -- Valeurs possibles :
  -- 'pending'    : En attente de paiement
  -- 'confirmed'  : Confirmée et payée
  -- 'cancelled'  : Annulée
  -- 'completed'  : Terminée (après check-out)
  -- 'refunded'   : Remboursée
  
  -- ==========================================
  -- INFORMATIONS CLIENT
  -- ==========================================
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  client_address TEXT,
  client_city VARCHAR(100),
  client_country VARCHAR(100) DEFAULT 'Maroc',
  
  -- ==========================================
  -- DEMANDES SPÉCIALES
  -- ==========================================
  special_requests TEXT,
  notes TEXT, -- Notes internes (admin/partenaire)
  
  -- ==========================================
  -- NUMÉRO DE RÉSERVATION
  -- ==========================================
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- ==========================================
  -- ANNULATION
  -- ==========================================
  cancelled_at TIMESTAMP,
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT,
  refund_amount NUMERIC(10, 2) DEFAULT 0,
  
  -- ==========================================
  -- MÉTADONNÉES
  -- ==========================================
  metadata JSONB DEFAULT '{}',
  
  -- ==========================================
  -- TIMESTAMPS
  -- ==========================================
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- ==========================================
  -- CONTRAINTES
  -- ==========================================
  CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT valid_guests CHECK (guests > 0),
  CONSTRAINT valid_nights CHECK (nights > 0),
  CONSTRAINT valid_amounts CHECK (total_amount >= 0),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'refunded'))
);

-- ==========================================
-- INDEX POUR PERFORMANCES
-- ==========================================
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_partner_id ON bookings(partner_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- ==========================================
-- TRIGGER : Mise à jour automatique de updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- ==========================================
-- FONCTION : Générer un numéro de réservation unique
-- ==========================================
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Format : BK-YYYYMMDD-XXXXX
  -- Exemple : BK-20241108-00001
  NEW.booking_number = 'BK-' || 
                       TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                       LPAD(NEXTVAL('booking_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer la séquence pour les numéros
CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 1;

-- Créer le trigger
CREATE TRIGGER trigger_generate_booking_number
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_number IS NULL)
  EXECUTE FUNCTION generate_booking_number();

-- ================================================
-- TABLE : payments (Paiements)
-- ================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- ==========================================
  -- RÉFÉRENCES
  -- ==========================================
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- ==========================================
  -- STRIPE
  -- ==========================================
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  
  -- ==========================================
  -- MONTANTS
  -- ==========================================
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MAD',
  
  -- ==========================================
  -- STATUT DU PAIEMENT
  -- ==========================================
  status VARCHAR(20) DEFAULT 'pending',
  -- Valeurs possibles :
  -- 'pending'     : En attente
  -- 'processing'  : En cours de traitement
  -- 'succeeded'   : Réussi
  -- 'failed'      : Échoué
  -- 'cancelled'   : Annulé
  -- 'refunded'    : Remboursé
  
  -- ==========================================
  -- MÉTHODE DE PAIEMENT
  -- ==========================================
  payment_method VARCHAR(50), -- 'card', 'bank_transfer', etc.
  payment_method_details JSONB, -- Détails de la méthode
  
  -- ==========================================
  -- INFORMATIONS CARTE (si applicable)
  -- ==========================================
  card_last4 VARCHAR(4),
  card_brand VARCHAR(20), -- 'visa', 'mastercard', etc.
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  
  -- ==========================================
  -- REMBOURSEMENT
  -- ==========================================
  refund_amount NUMERIC(10, 2) DEFAULT 0,
  refund_reason TEXT,
  refunded_at TIMESTAMP,
  
  -- ==========================================
  -- ERREURS
  -- ==========================================
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- ==========================================
  -- MÉTADONNÉES
  -- ==========================================
  metadata JSONB DEFAULT '{}',
  stripe_metadata JSONB DEFAULT '{}',
  
  -- ==========================================
  -- TIMESTAMPS
  -- ==========================================
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  
  -- ==========================================
  -- CONTRAINTES
  -- ==========================================
  CONSTRAINT valid_payment_amount CHECK (amount >= 0),
  CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'))
);

-- ==========================================
-- INDEX POUR PERFORMANCES
-- ==========================================
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- ==========================================
-- TRIGGER : Mise à jour automatique de updated_at
-- ==========================================
CREATE TRIGGER trigger_update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- ================================================
-- TABLE : invoices (Factures)
-- ================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- ==========================================
  -- RÉFÉRENCES
  -- ==========================================
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- ==========================================
  -- NUMÉRO DE FACTURE
  -- ==========================================
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- ==========================================
  -- MONTANTS
  -- ==========================================
  subtotal NUMERIC(10, 2) NOT NULL,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  tax_rate NUMERIC(5, 2) DEFAULT 0, -- En pourcentage
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MAD',
  
  -- ==========================================
  -- STATUT DE LA FACTURE
  -- ==========================================
  status VARCHAR(20) DEFAULT 'draft',
  -- Valeurs possibles :
  -- 'draft'      : Brouillon
  -- 'sent'       : Envoyée au client
  -- 'paid'       : Payée
  -- 'cancelled'  : Annulée
  -- 'refunded'   : Remboursée
  
  -- ==========================================
  -- INFORMATIONS CLIENT
  -- ==========================================
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_address TEXT,
  client_city VARCHAR(100),
  client_country VARCHAR(100) DEFAULT 'Maroc',
  
  -- ==========================================
  -- INFORMATIONS ENTREPRISE
  -- ==========================================
  company_name VARCHAR(255) DEFAULT 'Maroc 2030',
  company_address TEXT,
  company_email VARCHAR(255),
  company_phone VARCHAR(50),
  company_tax_id VARCHAR(50),
  
  -- ==========================================
  -- DÉTAILS DE LA FACTURE
  -- ==========================================
  items JSONB NOT NULL, -- Liste des items de la facture
  notes TEXT,
  terms TEXT,
  
  -- ==========================================
  -- PDF
  -- ==========================================
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP,
  
  -- ==========================================
  -- DATES
  -- ==========================================
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  
  -- ==========================================
  -- MÉTADONNÉES
  -- ==========================================
  metadata JSONB DEFAULT '{}',
  
  -- ==========================================
  -- TIMESTAMPS
  -- ==========================================
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- ==========================================
  -- CONTRAINTES
  -- ==========================================
  CONSTRAINT valid_invoice_amounts CHECK (total_amount >= 0),
  CONSTRAINT valid_invoice_status CHECK (status IN ('draft', 'sent', 'paid', 'cancelled', 'refunded'))
);

-- ==========================================
-- INDEX POUR PERFORMANCES
-- ==========================================
CREATE INDEX idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX idx_invoices_payment_id ON invoices(payment_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- ==========================================
-- TRIGGER : Mise à jour automatique de updated_at
-- ==========================================
CREATE TRIGGER trigger_update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- ==========================================
-- FONCTION : Générer un numéro de facture unique
-- ==========================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Format : INV-YYYYMMDD-XXXXX
  -- Exemple : INV-20241108-00001
  NEW.invoice_number = 'INV-' || 
                       TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                       LPAD(NEXTVAL('invoice_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer la séquence pour les numéros
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Créer le trigger
CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Activer RLS sur toutes les tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLICIES : bookings
-- ==========================================

-- Les clients peuvent voir leurs propres réservations
CREATE POLICY "Clients can view their own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() = client_id
  );

-- Les partenaires peuvent voir les réservations de leurs services
CREATE POLICY "Partners can view their service bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() = partner_id
  );

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Les clients authentifiés peuvent créer des réservations
CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    auth.uid() = client_id
  );

-- Les clients peuvent mettre à jour leurs propres réservations (avant confirmation)
CREATE POLICY "Clients can update their pending bookings"
  ON bookings FOR UPDATE
  USING (
    auth.uid() = client_id
    AND status = 'pending'
  );

-- Les partenaires peuvent mettre à jour le statut de leurs réservations
CREATE POLICY "Partners can update their bookings status"
  ON bookings FOR UPDATE
  USING (
    auth.uid() = partner_id
  );

-- Les admins peuvent tout mettre à jour
CREATE POLICY "Admins can update all bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Les admins peuvent supprimer
CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ==========================================
-- POLICIES : payments
-- ==========================================

-- Les clients peuvent voir leurs propres paiements
CREATE POLICY "Clients can view their own payments"
  ON payments FOR SELECT
  USING (
    auth.uid() = client_id
  );

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Seul le système peut créer des paiements (via service_role)
CREATE POLICY "Service role can create payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Les admins peuvent mettre à jour les paiements
CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ==========================================
-- POLICIES : invoices
-- ==========================================

-- Les clients peuvent voir leurs propres factures
CREATE POLICY "Clients can view their own invoices"
  ON invoices FOR SELECT
  USING (
    auth.uid() = client_id
  );

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Les admins peuvent créer des factures
CREATE POLICY "Admins can create invoices"
  ON invoices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Les admins peuvent mettre à jour les factures
CREATE POLICY "Admins can update invoices"
  ON invoices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ================================================
-- FONCTIONS UTILITAIRES
-- ================================================

-- ==========================================
-- FONCTION : Calculer le nombre de nuits
-- ==========================================
CREATE OR REPLACE FUNCTION calculate_nights(check_in DATE, check_out DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN (check_out - check_in);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ==========================================
-- FONCTION : Calculer le montant total
-- ==========================================
CREATE OR REPLACE FUNCTION calculate_total_amount(
  price_per_night NUMERIC,
  nights INTEGER,
  tax_rate NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0
)
RETURNS NUMERIC AS $$
DECLARE
  subtotal NUMERIC;
  tax_amount NUMERIC;
  total NUMERIC;
BEGIN
  subtotal := price_per_night * nights;
  tax_amount := subtotal * (tax_rate / 100);
  total := subtotal + tax_amount - discount_amount;
  RETURN GREATEST(total, 0); -- Ne jamais retourner un montant négatif
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================================
-- VUES UTILES
-- ================================================

-- ==========================================
-- VUE : Statistiques des réservations
-- ==========================================
CREATE OR REPLACE VIEW booking_stats AS
SELECT
  COUNT(*) as total_bookings,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
  SUM(total_amount) as total_revenue,
  SUM(total_amount) FILTER (WHERE status = 'confirmed') as confirmed_revenue,
  AVG(total_amount) as average_booking_value,
  DATE_TRUNC('month', created_at) as month
FROM bookings
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- ==========================================
-- VUE : Réservations avec détails complets
-- ==========================================
CREATE OR REPLACE VIEW bookings_detailed AS
SELECT
  b.*,
  partner.company_name as partner_name,
  partner.phone as partner_phone,
  client.company_name as client_company_name,
  pay.status as payment_status,
  pay.stripe_payment_intent_id,
  i.invoice_number,
  i.pdf_url as invoice_pdf_url
FROM bookings b
LEFT JOIN profiles partner ON b.partner_id = partner.id
LEFT JOIN profiles client ON b.client_id = client.id
LEFT JOIN payments pay ON b.id = pay.booking_id
LEFT JOIN invoices i ON b.id = i.booking_id;

-- ================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ================================================

-- Insérer quelques réservations de test
-- DÉCOMMENTER SI VOUS VOULEZ DES DONNÉES DE TEST

/*
INSERT INTO bookings (
  client_id,
  service_id,
  service_type,
  check_in_date,
  check_out_date,
  guests,
  nights,
  price_per_night,
  subtotal,
  total_amount,
  status,
  client_name,
  client_email,
  client_phone
) VALUES
(
  (SELECT id FROM profiles WHERE role = 'client' LIMIT 1),
  (SELECT id FROM hotels LIMIT 1),
  'hotel',
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '10 days',
  2,
  3,
  800.00,
  2400.00,
  2400.00,
  'confirmed',
  'Ahmed Test',
  'ahmed@test.com',
  '+212 6 12 34 56 78'
);
*/

-- ================================================
-- COMMENTAIRES SUR LES TABLES
-- ================================================

COMMENT ON TABLE bookings IS 'Table des réservations de services (hôtels, appartements, villas, voitures, etc.)';
COMMENT ON TABLE payments IS 'Table des paiements avec intégration Stripe';
COMMENT ON TABLE invoices IS 'Table des factures générées pour les réservations';

-- ================================================
-- FIN DU SCRIPT
-- ================================================

-- Afficher un message de succès
DO $$
BEGIN
  RAISE NOTICE '✅ Tables créées avec succès !';
  RAISE NOTICE '✅ RLS activé et policies configurées';
  RAISE NOTICE '✅ Triggers et fonctions créés';
  RAISE NOTICE '✅ Système de réservation et paiement prêt !';
END $$;
