-- ============================================
-- TABLES POUR ÉVÉNEMENTS ET NEWSLETTER
-- ============================================

-- 1. Table pour les événements
CREATE TABLE IF NOT EXISTS evenements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  time TEXT,
  category TEXT NOT NULL,
  image TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  available_seats INTEGER DEFAULT 100,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table pour les inscriptions à la newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'website',
  active BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evenements_date ON evenements("date");
CREATE INDEX IF NOT EXISTS idx_evenements_available ON evenements(available);
CREATE INDEX IF NOT EXISTS idx_evenements_featured ON evenements(featured);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions(active);

-- Activer RLS (Row Level Security)
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique des événements
CREATE POLICY "Allow public read access to evenements"
  ON evenements FOR SELECT
  USING (available = true);

-- Politique pour permettre l'insertion publique dans newsletter
CREATE POLICY "Allow public insert to newsletter"
  ON newsletter_subscriptions FOR INSERT
  WITH CHECK (true);

-- Politique pour permettre la lecture publique de newsletter (pour vérifier les doublons)
CREATE POLICY "Allow public read access to newsletter"
  ON newsletter_subscriptions FOR SELECT
  USING (true);

-- ============================================
-- DONNÉES INITIALES POUR LES ÉVÉNEMENTS 
-- ============================================

INSERT INTO evenements (title, description, date, location, time, category, image, price, available_seats, available, featured)
VALUES
  (
    'Festival des Roses à Kelaa M''Gouna',
    'Célébrez la récolte des roses dans la magnifique vallée du Dadès avec des défilés, des danses traditionnelles et des expositions d''artisanat local.',
    '15-17 Mai 2024',
    'Vallée des Roses, Maroc',
    'Toute la journée',
    'Festival',
    './assets/events/T0.jpeg',
    250.00,
    200,
    true,
    true
  ),
  (
    'Marathon des Sables',
    'Participez à l''une des courses à pied les plus difficiles au monde à travers les paysages époustouflants du désert marocain.',
    '12-22 Avril 2024',
    'Désert du Sahara, Maroc',
    '06:00 - 18:00',
    'Sport',
    './assets/events/1.jpg',
    3500.00,
    500,
    true,
    true
  ),
  (
    'Festival des Arts Populaires de Marrakech',
    'Découvrez la richesse du patrimoine culturel marocain à travers des spectacles de musique, de danse et d''art traditionnels.',
    '22-30 Juin 2024',
    'Marrakech, Maroc',
    '18:00 - Minuit',
    'Culture',
    './assets/events/2.jpg',
    150.00,
    300,
    true,
    true
  ),
  (
    'Festival Gnaoua et Musiques du Monde',
    'Le plus grand festival de musique Gnaoua au monde, avec des artistes internationaux et locaux.',
    '20-23 Juin 2024',
    'Essaouira, Maroc',
    '20:00 - 02:00',
    'Musique',
    './assets/events/mrkc.jpg',
    200.00,
    1000,
    true,
    false
  ),
  (
    'Festival International du Film de Marrakech',
    'Découvrez les meilleurs films du monde entier dans la ville rouge.',
    '1-9 Décembre 2024',
    'Marrakech, Maroc',
    '18:00 - 23:00',
    'Cinéma',
    './assets/events/2.jpg',
    300.00,
    500,
    true,
    false
  ),
  (
    'Moussem de Tan-Tan',
    'Patrimoine culturel immatériel de l''UNESCO, célébrant les traditions nomades.',
    '15-20 Mai 2024',
    'Tan-Tan, Maroc',
    'Toute la journée',
    'Culture',
    './assets/events/T0.jpeg',
    180.00,
    250,
    true,
    false
  );

-- ============================================
-- FONCTION POUR METTRE À JOUR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_evenements_updated_at
  BEFORE UPDATE ON evenements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue pour les événements à venir
CREATE OR REPLACE VIEW upcoming_events AS
SELECT *
FROM evenements
WHERE available = true
ORDER BY "date" ASC;

-- Vue pour les statistiques de newsletter
CREATE OR REPLACE VIEW newsletter_stats AS
SELECT
  COUNT(*) as total_subscribers,
  COUNT(*) FILTER (WHERE active = true) as active_subscribers,
  COUNT(*) FILTER (WHERE active = false) as unsubscribed,
  COUNT(DISTINCT source) as sources_count
FROM newsletter_subscriptions;

-- ============================================
-- PERMISSIONS POUR L'ADMIN
-- ============================================

-- Politique pour permettre toutes les opérations aux admins
CREATE POLICY "Allow admin full access to evenements"
  ON evenements FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to newsletter"
  ON newsletter_subscriptions FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- COMMENTAIRES POUR LA DOCUMENTATION
-- ============================================

COMMENT ON TABLE evenements IS 'Table contenant tous les événements disponibles sur le site';
COMMENT ON TABLE newsletter_subscriptions IS 'Table contenant les inscriptions à la newsletter';

COMMENT ON COLUMN evenements.price IS 'Prix par personne en MAD';
COMMENT ON COLUMN evenements.available_seats IS 'Nombre de places disponibles';
COMMENT ON COLUMN evenements.featured IS 'Événement mis en avant sur la page d''accueil';

COMMENT ON COLUMN newsletter_subscriptions.source IS 'Source de l''inscription (evenements_page, footer, homepage, etc.)';
COMMENT ON COLUMN newsletter_subscriptions.active IS 'Statut de l''abonnement (true = actif, false = désabonné)';

