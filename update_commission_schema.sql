-- Mise à jour de la table partner_products pour ajouter les champs de commission
ALTER TABLE partner_products 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS is_commission_included BOOLEAN DEFAULT false;

-- Mise à jour de la table bookings pour ajouter les champs de paiement partenaire
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS partner_payment_status VARCHAR(20) DEFAULT 'pending' CHECK (partner_payment_status IN ('pending', 'processing', 'paid', 'failed')),
ADD COLUMN IF NOT EXISTS partner_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS partner_payment_details JSONB DEFAULT '{}';

-- Création d'une vue pour les statistiques des partenaires
CREATE OR REPLACE VIEW partner_dashboard_stats AS
SELECT 
  p.id AS partner_id,
  p.company_name,
  p.email,
  p.phone,
  p.avatar_url,
  p.created_at AS partner_since,
  
  -- Statistiques des produits
  COUNT(DISTINCT pp.id) AS total_products,
  COUNT(DISTINCT CASE WHEN pp.available = true THEN pp.id END) AS active_products,
  
  -- Statistiques des réservations
  COUNT(DISTINCT b.id) AS total_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) AS confirmed_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) AS completed_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.id END) AS cancelled_bookings,
  
  -- Statistiques financières
  COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_amount ELSE 0 END), 0) AS total_revenue,
  COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.commission_amount ELSE 0 END), 0) AS total_commission,
  COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.partner_amount ELSE 0 END), 0) AS total_earnings,
  COALESCE(SUM(CASE WHEN b.partner_payment_status = 'paid' THEN b.partner_amount ELSE 0 END), 0) AS total_paid,
  COALESCE(SUM(CASE WHEN b.partner_payment_status = 'pending' AND b.status IN ('confirmed', 'completed') THEN b.partner_amount ELSE 0 END), 0) AS pending_payment
  
FROM profiles p
LEFT JOIN partner_products pp ON p.id = pp.partner_id
LEFT JOIN bookings b ON p.id = b.partner_id
WHERE p.role = 'partner'
GROUP BY p.id, p.company_name, p.email, p.phone, p.avatar_url, p.created_at;

-- Fonction pour calculer automatiquement les commissions
CREATE OR REPLACE FUNCTION calculate_booking_commissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est une nouvelle réservation ou si le montant total a changé
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.total_amount IS DISTINCT FROM NEW.total_amount OR OLD.commission_rate IS DISTINCT FROM NEW.commission_rate)) THEN
    -- Calculer la commission (10% par défaut)
    NEW.commission_amount := ROUND((NEW.total_amount * COALESCE(NEW.commission_rate, 10) / 100)::numeric, 2);
    NEW.partner_amount := NEW.total_amount - NEW.commission_amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour calculer automatiquement les commissions
DROP TRIGGER IF EXISTS trg_calculate_booking_commissions ON bookings;
CREATE TRIGGER trg_calculate_booking_commissions
  BEFORE INSERT OR UPDATE OF total_amount, commission_rate ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_booking_commissions();
