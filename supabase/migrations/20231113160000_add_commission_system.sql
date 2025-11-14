-- Migration pour ajouter le système de commission

-- 1. Ajout des colonnes à la table payments
ALTER TABLE payments
ADD COLUMN admin_commission DECIMAL(10,2),
ADD COLUMN partner_amount DECIMAL(10,2),
ADD COLUMN is_commission_paid BOOLEAN DEFAULT false,
ADD COLUMN partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Mise à jour des paiements existants (optionnel)
-- Cette partie est commentée car elle n'est nécessaire que si vous avez des données existantes
/*
UPDATE payments p
SET 
  admin_commission = ROUND(p.amount * 0.1, 2),
  partner_amount = ROUND(p.amount * 0.9, 2),
  partner_id = (
    SELECT s.partner_id 
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.id = p.booking_id
  );
*/

-- 3. Création d'une vue pour visualiser les commissions
CREATE OR REPLACE VIEW commission_reports AS
SELECT 
  p.id as payment_id,
  b.id as booking_id,
  s.title as service_title,
  s.partner_id,
  pr.business_name as partner_name,
  p.amount as total_amount,
  p.admin_commission,
  p.partner_amount,
  p.status as payment_status,
  p.paid_at,
  p.is_commission_paid,
  p.created_at
FROM payments p
JOIN bookings b ON p.booking_id = b.id
JOIN services s ON b.service_id = s.id
LEFT JOIN profiles pr ON s.partner_id = pr.id
ORDER BY p.paid_at DESC;

-- 4. Fonction pour calculer automatiquement les commissions lors de l'insertion d'un paiement
CREATE OR REPLACE FUNCTION calculate_commission()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculer la commission (10% pour l'admin, 90% pour le partenaire)
  NEW.admin_commission := ROUND(NEW.amount * 0.1, 2);
  NEW.partner_amount := NEW.amount - NEW.admin_commission;
  
  -- Récupérer l'ID du partenaire depuis le service
  SELECT s.partner_id INTO NEW.partner_id
  FROM bookings b
  JOIN services s ON b.service_id = s.id
  WHERE b.id = NEW.booking_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Déclencheur pour calculer automatiquement les commissions
CREATE TRIGGER trg_calculate_commission
BEFORE INSERT OR UPDATE OF amount ON payments
FOR EACH ROW
EXECUTE FUNCTION calculate_commission();

-- 6. Politiques RLS pour la sécurité
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Les partenaires peuvent voir leurs propres paiements
CREATE POLICY "Partners can view their payments"
  ON payments FOR SELECT
  USING (partner_id = auth.uid());

-- Les utilisateurs peuvent voir leurs propres paiements
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM bookings
    WHERE id = payments.booking_id AND client_id = auth.uid()
  ));

-- Seuls les admins peuvent mettre à jour le statut de paiement de la commission
CREATE POLICY "Only admins can update commission status"
  ON payments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));
