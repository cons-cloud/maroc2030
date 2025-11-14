-- ============================================
-- SYNCHRONISATION ÉVÉNEMENTS ET ANNONCES PARTENAIRES
-- ============================================

-- 1. AJOUTER CHAMP PARTNER_ID AUX ÉVÉNEMENTS
ALTER TABLE evenements 
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_partner_event BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS registration_required BOOLEAN DEFAULT false;

-- Index pour les événements partenaires
CREATE INDEX IF NOT EXISTS idx_evenements_partner_id ON evenements(partner_id);
CREATE INDEX IF NOT EXISTS idx_evenements_is_partner ON evenements(is_partner_event);

-- 2. AJOUTER CHAMP PARTNER_ID AUX ANNONCES
ALTER TABLE annonces 
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_partner_annonce BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;

-- Index pour les annonces partenaires
CREATE INDEX IF NOT EXISTS idx_annonces_partner_id ON annonces(partner_id);
CREATE INDEX IF NOT EXISTS idx_annonces_is_partner ON annonces(is_partner_annonce);
CREATE INDEX IF NOT EXISTS idx_annonces_category ON annonces(category);

-- 3. TABLE POUR LES INSCRIPTIONS AUX ÉVÉNEMENTS
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES evenements(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20),
  number_of_people INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(50) DEFAULT 'pending',
  registration_status VARCHAR(50) DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les inscriptions
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_partner ON event_registrations(partner_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(registration_status);

-- 4. TABLE POUR LES GAINS DES ÉVÉNEMENTS PARTENAIRES
CREATE TABLE IF NOT EXISTS event_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES event_registrations(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL,
  partner_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les gains événements
CREATE INDEX IF NOT EXISTS idx_event_earnings_partner ON event_earnings(partner_id);
CREATE INDEX IF NOT EXISTS idx_event_earnings_status ON event_earnings(status);

-- 5. TRIGGER POUR CRÉER AUTOMATIQUEMENT LES GAINS D'ÉVÉNEMENTS
CREATE OR REPLACE FUNCTION trigger_create_event_earning()
RETURNS TRIGGER AS $$
DECLARE
  v_commission DECIMAL(10,2);
  v_partner_amount DECIMAL(10,2);
BEGIN
  -- Calculer commission 10% et gain partenaire 90%
  v_commission := NEW.total_amount * 0.10;
  v_partner_amount := NEW.total_amount * 0.90;

  -- Insérer dans event_earnings
  INSERT INTO event_earnings (
    partner_id,
    registration_id,
    amount,
    commission,
    partner_amount,
    status
  ) VALUES (
    NEW.partner_id,
    NEW.id,
    NEW.total_amount,
    v_commission,
    v_partner_amount,
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger (supprimer d'abord s'il existe)
DROP TRIGGER IF EXISTS create_event_earning_trigger ON event_registrations;
CREATE TRIGGER create_event_earning_trigger
  AFTER INSERT ON event_registrations
  FOR EACH ROW
  WHEN (NEW.payment_status = 'paid')
  EXECUTE FUNCTION trigger_create_event_earning();

-- 6. FONCTION POUR MARQUER UN GAIN D'ÉVÉNEMENT COMME PAYÉ
CREATE OR REPLACE FUNCTION mark_event_earning_paid(p_earning_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE event_earnings
  SET 
    status = 'paid',
    paid_at = NOW()
  WHERE id = p_earning_id;
END;
$$ LANGUAGE plpgsql;

-- 7. VUE POUR LES STATISTIQUES DES ÉVÉNEMENTS PARTENAIRES
CREATE OR REPLACE VIEW partner_events_stats AS
SELECT 
  e.partner_id,
  COUNT(DISTINCT e.id) as total_events,
  COUNT(DISTINCT CASE WHEN e.available = true THEN e.id END) as active_events,
  COUNT(DISTINCT er.id) as total_registrations,
  COUNT(DISTINCT CASE WHEN er.registration_status = 'confirmed' THEN er.id END) as confirmed_registrations,
  COALESCE(SUM(ee.partner_amount), 0) as total_earnings,
  COALESCE(SUM(CASE WHEN ee.status = 'pending' THEN ee.partner_amount ELSE 0 END), 0) as pending_earnings,
  COALESCE(SUM(CASE WHEN ee.status = 'paid' THEN ee.partner_amount ELSE 0 END), 0) as paid_earnings
FROM evenements e
LEFT JOIN event_registrations er ON e.id = er.event_id
LEFT JOIN event_earnings ee ON er.id = ee.registration_id
WHERE e.is_partner_event = true
GROUP BY e.partner_id;

-- 8. VUE POUR LES STATISTIQUES DES ANNONCES PARTENAIRES
CREATE OR REPLACE VIEW partner_annonces_stats AS
SELECT 
  partner_id,
  COUNT(*) as total_annonces,
  COUNT(CASE WHEN available = true THEN 1 END) as active_annonces,
  COUNT(CASE WHEN available = false THEN 1 END) as inactive_annonces,
  COUNT(CASE WHEN expiry_date IS NOT NULL AND expiry_date > NOW() THEN 1 END) as valid_annonces,
  COUNT(CASE WHEN expiry_date IS NOT NULL AND expiry_date <= NOW() THEN 1 END) as expired_annonces
FROM annonces
WHERE is_partner_annonce = true
GROUP BY partner_id;

-- 9. RLS (Row Level Security) POUR LES ÉVÉNEMENTS
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;

-- Les partenaires peuvent voir et modifier leurs propres événements
CREATE POLICY "Partners can view own events"
  ON evenements FOR SELECT
  TO authenticated
  USING (partner_id = auth.uid() OR is_partner_event = false);

CREATE POLICY "Partners can insert own events"
  ON evenements FOR INSERT
  TO authenticated
  WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can update own events"
  ON evenements FOR UPDATE
  TO authenticated
  USING (partner_id = auth.uid());

CREATE POLICY "Partners can delete own events"
  ON evenements FOR DELETE
  TO authenticated
  USING (partner_id = auth.uid());

-- 10. RLS POUR LES ANNONCES
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;

-- Les partenaires peuvent voir et modifier leurs propres annonces
CREATE POLICY "Partners can view own annonces"
  ON annonces FOR SELECT
  TO authenticated
  USING (partner_id = auth.uid() OR is_partner_annonce = false);

CREATE POLICY "Partners can insert own annonces"
  ON annonces FOR INSERT
  TO authenticated
  WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can update own annonces"
  ON annonces FOR UPDATE
  TO authenticated
  USING (partner_id = auth.uid());

CREATE POLICY "Partners can delete own annonces"
  ON annonces FOR DELETE
  TO authenticated
  USING (partner_id = auth.uid());

-- 11. RLS POUR LES INSCRIPTIONS AUX ÉVÉNEMENTS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own event registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (partner_id = auth.uid());

-- 12. RLS POUR LES GAINS D'ÉVÉNEMENTS
ALTER TABLE event_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own event earnings"
  ON event_earnings FOR SELECT
  TO authenticated
  USING (partner_id = auth.uid());

-- 13. FONCTION RPC POUR OBTENIR LES STATS COMPLÈTES DU PARTENAIRE
CREATE OR REPLACE FUNCTION get_partner_complete_stats(p_partner_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'products', (SELECT row_to_json(s) FROM partner_stats_view s WHERE s.partner_id = p_partner_id),
    'events', (SELECT row_to_json(e) FROM partner_events_stats e WHERE e.partner_id = p_partner_id),
    'annonces', (SELECT row_to_json(a) FROM partner_annonces_stats a WHERE a.partner_id = p_partner_id)
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIN DE LA SYNCHRONISATION
-- ============================================

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Synchronisation événements et annonces partenaires terminée avec succès !';
END $$;
