-- ============================================
-- SCRIPT SQL SIMPLIFIÉ - ÉVÉNEMENTS ET NEWSLETTER
-- Exécutez ce script en entier d'un seul coup
-- ============================================

-- ÉTAPE 1 : NETTOYAGE COMPLET
-- ============================================

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Allow public read access to evenements" ON evenements;
DROP POLICY IF EXISTS "Allow public insert to newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Allow public read access to newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Allow admin full access to evenements" ON evenements;
DROP POLICY IF EXISTS "Allow admin full access to newsletter" ON newsletter_subscriptions;

-- Supprimer les vues
DROP VIEW IF EXISTS upcoming_events CASCADE;
DROP VIEW IF EXISTS newsletter_stats CASCADE;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS update_evenements_updated_at ON evenements;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Supprimer les tables
DROP TABLE IF EXISTS evenements CASCADE;
DROP TABLE IF EXISTS newsletter_subscriptions CASCADE;

-- ÉTAPE 2 : CRÉATION DES TABLES
-- ============================================

-- Table événements
CREATE TABLE evenements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  location TEXT NOT NULL,
  event_time TEXT,
  category TEXT NOT NULL,
  image TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  available_seats INTEGER DEFAULT 100,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table newsletter
CREATE TABLE newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'website',
  active BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- ÉTAPE 3 : INDEX
-- ============================================

CREATE INDEX idx_evenements_event_date ON evenements(event_date);
CREATE INDEX idx_evenements_available ON evenements(available);
CREATE INDEX idx_evenements_featured ON evenements(featured);
CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_active ON newsletter_subscriptions(active);

-- ÉTAPE 4 : RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politiques pour evenements
CREATE POLICY "evenements_select_policy" ON evenements
  FOR SELECT USING (available = true);

CREATE POLICY "evenements_all_policy" ON evenements
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques pour newsletter
CREATE POLICY "newsletter_insert_policy" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "newsletter_select_policy" ON newsletter_subscriptions
  FOR SELECT USING (true);

CREATE POLICY "newsletter_all_policy" ON newsletter_subscriptions
  FOR ALL USING (auth.role() = 'authenticated');

-- ÉTAPE 5 : DONNÉES INITIALES
-- ============================================

INSERT INTO evenements (title, description, event_date, location, event_time, category, image, price, available_seats, available, featured)
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

-- ÉTAPE 6 : FONCTION ET TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_evenements_updated_at
  BEFORE UPDATE ON evenements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ÉTAPE 7 : VUES
-- ============================================

CREATE OR REPLACE VIEW upcoming_events AS
SELECT *
FROM evenements
WHERE available = true
ORDER BY event_date ASC;

CREATE OR REPLACE VIEW newsletter_stats AS
SELECT
  COUNT(*) as total_subscribers,
  COUNT(*) FILTER (WHERE active = true) as active_subscribers,
  COUNT(*) FILTER (WHERE active = false) as unsubscribed,
  COUNT(DISTINCT source) as sources_count
FROM newsletter_subscriptions;

-- FIN DU SCRIPT
-- ============================================
