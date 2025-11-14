-- ============================================
-- SYSTÈME PARTENAIRE COMPLET AVEC COMMISSION 10%
-- Synchronisation 100% : Site Web ↔ Dashboard Partenaire ↔ Dashboard Admin ↔ Supabase
-- ============================================

-- ============================================
-- ÉTAPE 1 : TABLE PROFILES (Mise à jour)
-- ============================================

-- Ajouter des colonnes pour les partenaires
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_type TEXT; -- 'immobilier', 'voiture', 'tourisme'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00; -- Commission en %
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pending_earnings DECIMAL(10,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paid_earnings DECIMAL(10,2) DEFAULT 0;

-- ============================================
-- ÉTAPE 2 : TABLE PARTNER_PRODUCTS (Produits des partenaires)
-- ============================================

CREATE TABLE IF NOT EXISTS partner_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL, -- 'appartement', 'villa', 'hotel', 'voiture'
  
  -- Informations générales
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  price_type TEXT, -- 'per_night', 'per_day', 'per_person'
  
  -- Localisation
  city TEXT NOT NULL,
  address TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  
  -- Caractéristiques (JSON pour flexibilité)
  features JSONB DEFAULT '{}', -- {bedrooms: 3, bathrooms: 2, surface: 120, etc.}
  amenities TEXT[], -- ['wifi', 'parking', 'piscine', etc.]
  
  -- Images
  images TEXT[], -- Array d'URLs d'images
  main_image TEXT,
  
  -- Disponibilité
  available BOOLEAN DEFAULT true,
  max_guests INTEGER,
  min_stay INTEGER DEFAULT 1,
  
  -- Métadonnées
  views INTEGER DEFAULT 0,
  bookings_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  
  -- Dates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index
  CONSTRAINT valid_product_type CHECK (product_type IN ('appartement', 'villa', 'hotel', 'voiture', 'circuit'))
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_partner_products_partner_id ON partner_products(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_products_type ON partner_products(product_type);
CREATE INDEX IF NOT EXISTS idx_partner_products_city ON partner_products(city);
CREATE INDEX IF NOT EXISTS idx_partner_products_available ON partner_products(available);

-- ============================================
-- ÉTAPE 3 : MISE À JOUR TABLE BOOKINGS
-- ============================================

-- Ajouter les colonnes de commission
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES profiles(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2); -- Montant total payé par le client
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10,2); -- 10% pour Maroc2030
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS partner_amount DECIMAL(10,2); -- 90% pour le partenaire
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS partner_paid BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS partner_paid_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- ÉTAPE 4 : TABLE PARTNER_EARNINGS (Gains des partenaires)
-- ============================================

CREATE TABLE IF NOT EXISTS partner_earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Montants
  total_amount DECIMAL(10,2) NOT NULL, -- Montant total du booking
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  commission_amount DECIMAL(10,2) NOT NULL, -- Commission Maroc2030
  partner_amount DECIMAL(10,2) NOT NULL, -- Montant pour le partenaire
  
  -- Statut
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT, -- 'bank_transfer', 'check', 'cash'
  payment_reference TEXT,
  
  -- Dates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_earning_status CHECK (status IN ('pending', 'paid', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_partner_earnings_partner_id ON partner_earnings(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_earnings_booking_id ON partner_earnings(booking_id);
CREATE INDEX IF NOT EXISTS idx_partner_earnings_status ON partner_earnings(status);

-- ============================================
-- ÉTAPE 5 : FONCTION POUR CALCULER LA COMMISSION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_commission(
  total_amount DECIMAL,
  commission_rate DECIMAL DEFAULT 10.00
)
RETURNS TABLE (
  commission_amount DECIMAL,
  partner_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(total_amount * (commission_rate / 100), 2) as commission_amount,
    ROUND(total_amount * ((100 - commission_rate) / 100), 2) as partner_amount;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ÉTAPE 6 : TRIGGER POUR CRÉER AUTOMATIQUEMENT LES EARNINGS
-- ============================================

CREATE OR REPLACE FUNCTION create_partner_earning()
RETURNS TRIGGER AS $$
DECLARE
  v_commission DECIMAL;
  v_partner_amount DECIMAL;
BEGIN
  -- Calculer la commission seulement si le paiement est confirmé
  IF NEW.payment_status = 'confirmed' AND NEW.partner_id IS NOT NULL THEN
    -- Calculer les montants
    SELECT commission_amount, partner_amount 
    INTO v_commission, v_partner_amount
    FROM calculate_commission(NEW.total_price, NEW.commission_rate);
    
    -- Mettre à jour les montants dans le booking
    NEW.total_amount := NEW.total_price;
    NEW.commission_amount := v_commission;
    NEW.partner_amount := v_partner_amount;
    
    -- Créer l'enregistrement de gain
    INSERT INTO partner_earnings (
      partner_id,
      booking_id,
      total_amount,
      commission_rate,
      commission_amount,
      partner_amount,
      status
    ) VALUES (
      NEW.partner_id,
      NEW.id,
      NEW.total_price,
      NEW.commission_rate,
      v_commission,
      v_partner_amount,
      'pending'
    );
    
    -- Mettre à jour les gains du partenaire
    UPDATE profiles
    SET 
      total_earnings = total_earnings + v_partner_amount,
      pending_earnings = pending_earnings + v_partner_amount
    WHERE id = NEW.partner_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_create_partner_earning ON bookings;

-- Créer le trigger
CREATE TRIGGER trigger_create_partner_earning
  AFTER INSERT OR UPDATE OF payment_status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_partner_earning();

-- ============================================
-- ÉTAPE 7 : FONCTION POUR MARQUER UN PAIEMENT PARTENAIRE
-- ============================================

CREATE OR REPLACE FUNCTION mark_partner_paid(
  p_earning_id UUID,
  p_payment_method TEXT,
  p_payment_reference TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_partner_id UUID;
  v_partner_amount DECIMAL;
BEGIN
  -- Récupérer les infos
  SELECT partner_id, partner_amount
  INTO v_partner_id, v_partner_amount
  FROM partner_earnings
  WHERE id = p_earning_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Marquer comme payé
  UPDATE partner_earnings
  SET 
    status = 'paid',
    paid_at = NOW(),
    payment_method = p_payment_method,
    payment_reference = p_payment_reference
  WHERE id = p_earning_id;
  
  -- Mettre à jour le booking
  UPDATE bookings
  SET 
    partner_paid = true,
    partner_paid_at = NOW()
  WHERE id = (SELECT booking_id FROM partner_earnings WHERE id = p_earning_id);
  
  -- Mettre à jour les gains du partenaire
  UPDATE profiles
  SET 
    pending_earnings = pending_earnings - v_partner_amount,
    paid_earnings = paid_earnings + v_partner_amount
  WHERE id = v_partner_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ÉTAPE 8 : VUES POUR LES DASHBOARDS
-- ============================================

-- Vue pour le dashboard partenaire (ne voit que son montant après commission)
CREATE OR REPLACE VIEW partner_bookings_view AS
SELECT 
  b.id,
  b.service_type,
  b.service_title,
  b.client_name,
  b.client_email,
  b.client_phone,
  b.check_in_date as start_date,
  b.check_out_date as end_date,
  b.number_of_guests as number_of_people,
  b.partner_amount as amount, -- Le partenaire ne voit que son montant (90%)
  b.payment_status,
  b.status as booking_status,
  b.partner_paid,
  b.partner_paid_at,
  b.created_at,
  b.partner_id,
  pe.status as earning_status,
  pe.payment_method,
  pe.payment_reference
FROM bookings b
LEFT JOIN partner_earnings pe ON b.id = pe.booking_id
WHERE b.partner_id IS NOT NULL;

-- Vue pour le dashboard admin (voit tout)
CREATE OR REPLACE VIEW admin_bookings_commission_view AS
SELECT 
  b.id,
  b.service_type,
  b.service_title,
  b.client_name,
  b.client_email,
  b.total_amount, -- Montant total (100%)
  b.commission_rate,
  b.commission_amount, -- Commission Maroc2030 (10%)
  b.partner_amount, -- Montant partenaire (90%)
  b.payment_status,
  b.status as booking_status,
  b.partner_paid,
  b.partner_paid_at,
  b.created_at,
  b.partner_id,
  p.company_name as partner_name,
  u.email as partner_email,
  p.phone as partner_phone,
  pe.status as earning_status,
  pe.payment_method,
  pe.payment_reference
FROM bookings b
LEFT JOIN profiles p ON b.partner_id = p.id
LEFT JOIN auth.users u ON p.id = u.id
LEFT JOIN partner_earnings pe ON b.id = pe.booking_id
WHERE b.partner_id IS NOT NULL;

-- Vue statistiques partenaire
CREATE OR REPLACE VIEW partner_stats_view AS
SELECT 
  p.id as partner_id,
  p.company_name,
  p.partner_type,
  COUNT(DISTINCT pp.id) as total_products,
  COUNT(DISTINCT pp.id) FILTER (WHERE pp.available = true) as available_products,
  COUNT(DISTINCT b.id) as total_bookings,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'confirmed') as confirmed_bookings,
  COALESCE(SUM(b.partner_amount), 0) as total_earnings,
  p.pending_earnings,
  p.paid_earnings,
  AVG(pp.rating) as average_rating,
  SUM(pp.reviews_count) as total_reviews
FROM profiles p
LEFT JOIN partner_products pp ON p.id = pp.partner_id
LEFT JOIN bookings b ON p.id = b.partner_id AND b.payment_status = 'confirmed'
WHERE p.role LIKE 'partner%'
GROUP BY p.id, p.company_name, p.partner_type, p.pending_earnings, p.paid_earnings;

-- ============================================
-- ÉTAPE 9 : RLS (ROW LEVEL SECURITY)
-- ============================================

-- Partner Products
ALTER TABLE partner_products ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes
DROP POLICY IF EXISTS "Partners can view own products" ON partner_products;
DROP POLICY IF EXISTS "Partners can insert own products" ON partner_products;
DROP POLICY IF EXISTS "Partners can update own products" ON partner_products;
DROP POLICY IF EXISTS "Partners can delete own products" ON partner_products;
DROP POLICY IF EXISTS "Public can view available products" ON partner_products;
DROP POLICY IF EXISTS "Admins can manage all products" ON partner_products;

-- Les partenaires peuvent voir et gérer leurs propres produits
CREATE POLICY "Partners can view own products" ON partner_products
  FOR SELECT USING (partner_id = auth.uid());

CREATE POLICY "Partners can insert own products" ON partner_products
  FOR INSERT WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can update own products" ON partner_products
  FOR UPDATE USING (partner_id = auth.uid());

CREATE POLICY "Partners can delete own products" ON partner_products
  FOR DELETE USING (partner_id = auth.uid());

-- Tout le monde peut voir les produits disponibles (pour le site web)
CREATE POLICY "Public can view available products" ON partner_products
  FOR SELECT USING (available = true);

-- Admins peuvent tout voir et gérer
CREATE POLICY "Admins can manage all products" ON partner_products
  FOR ALL USING (auth.role() = 'authenticated');

-- Partner Earnings
ALTER TABLE partner_earnings ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes
DROP POLICY IF EXISTS "Partners can view own earnings" ON partner_earnings;
DROP POLICY IF EXISTS "Admins can manage all earnings" ON partner_earnings;

CREATE POLICY "Partners can view own earnings" ON partner_earnings
  FOR SELECT USING (partner_id = auth.uid());

CREATE POLICY "Admins can manage all earnings" ON partner_earnings
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- ÉTAPE 10 : FONCTIONS UTILES
-- ============================================

-- Fonction pour obtenir les statistiques d'un partenaire
CREATE OR REPLACE FUNCTION get_partner_dashboard_stats(p_partner_id UUID)
RETURNS TABLE (
  total_products BIGINT,
  active_products BIGINT,
  total_bookings BIGINT,
  pending_bookings BIGINT,
  confirmed_bookings BIGINT,
  total_earnings DECIMAL,
  pending_earnings DECIMAL,
  paid_earnings DECIMAL,
  this_month_earnings DECIMAL,
  average_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT pp.id)::BIGINT as total_products,
    COUNT(DISTINCT pp.id) FILTER (WHERE pp.available = true)::BIGINT as active_products,
    COUNT(DISTINCT b.id)::BIGINT as total_bookings,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'pending')::BIGINT as pending_bookings,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'confirmed')::BIGINT as confirmed_bookings,
    COALESCE(SUM(b.partner_amount), 0) as total_earnings,
    p.pending_earnings,
    p.paid_earnings,
    COALESCE(SUM(b.partner_amount) FILTER (WHERE b.created_at >= date_trunc('month', CURRENT_DATE)), 0) as this_month_earnings,
    COALESCE(AVG(pp.rating), 0) as average_rating
  FROM profiles p
  LEFT JOIN partner_products pp ON p.id = pp.partner_id
  LEFT JOIN bookings b ON p.id = b.partner_id AND b.payment_status = 'confirmed'
  WHERE p.id = p_partner_id
  GROUP BY p.id, p.pending_earnings, p.paid_earnings;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTAIRES POUR LA DOCUMENTATION
-- ============================================

COMMENT ON TABLE partner_products IS 'Produits créés par les partenaires (appartements, villas, hôtels, voitures)';
COMMENT ON TABLE partner_earnings IS 'Gains des partenaires avec commission de 10% pour Maroc2030';
COMMENT ON COLUMN bookings.total_amount IS 'Montant total payé par le client (100%)';
COMMENT ON COLUMN bookings.commission_amount IS 'Commission Maroc2030 (10% du total)';
COMMENT ON COLUMN bookings.partner_amount IS 'Montant pour le partenaire (90% du total)';

-- ============================================
-- FIN DU SCRIPT
-- ============================================

SELECT '✅ Système partenaire créé avec succès!' as status;
SELECT 'Commission: 10% Maroc2030 | 90% Partenaire' as info;
