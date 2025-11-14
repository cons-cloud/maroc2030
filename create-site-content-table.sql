-- ================================================
-- TABLE : CONTENU DU SITE (site_content)
-- ================================================
-- Cette table stocke tous les textes modifiables du site
-- depuis le dashboard admin

CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  value_ar TEXT,
  type TEXT DEFAULT 'text',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(section, key)
);

-- ================================================
-- PERMISSIONS (RLS)
-- ================================================
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes si elles existent
DROP POLICY IF EXISTS "Anyone can read site content" ON site_content;
DROP POLICY IF EXISTS "Only admins can update site content" ON site_content;

-- Tout le monde peut lire le contenu
CREATE POLICY "Anyone can read site content"
  ON site_content FOR SELECT
  USING (true);

-- Seuls les admins peuvent modifier
CREATE POLICY "Only admins can update site content"
  ON site_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ================================================
-- TRIGGER POUR updated_at
-- ================================================
CREATE OR REPLACE FUNCTION update_site_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_content_updated_at ON site_content;
CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_site_content_updated_at();

-- ================================================
-- INSÉRER DU CONTENU PAR DÉFAUT
-- ================================================
INSERT INTO site_content (section, key, value, type, order_index) VALUES
-- Page d'accueil
('home', 'hero.title', 'Découvrez le Maroc', 'text', 1),
('home', 'hero.subtitle', 'Votre voyage commence ici', 'text', 2),
('home', 'hero.description', 'Explorez les merveilles du Maroc avec nos services de qualité', 'text', 3),
('home', 'about.title', 'À propos de nous', 'text', 4),
('home', 'about.description', 'Nous sommes une équipe passionnée dédiée à vous faire découvrir les merveilles du Maroc.', 'textarea', 5),
('home', 'why.title', 'Pourquoi nous choisir ?', 'text', 6),
('home', 'why.subtitle', 'Votre partenaire de confiance', 'text', 7),
('home', 'services.title', 'Nos Services', 'text', 8),
('home', 'services.subtitle', 'Découvrez notre gamme complète de services', 'text', 9),

-- Page Contact
('contact', 'title', 'Contactez-nous', 'text', 1),
('contact', 'subtitle', 'Nous sommes là pour répondre à toutes vos questions', 'text', 2),
('contact', 'form.title', 'Envoyez-nous un message', 'text', 3),
('contact', 'form.success', 'Message envoyé avec succès ! Nous vous répondrons bientôt.', 'text', 4),

-- Footer
('footer', 'text', '© 2024 Maroc 2030. Tous droits réservés.', 'text', 1),
('footer', 'description', 'Votre partenaire de confiance pour découvrir le Maroc', 'text', 2),

-- Textes communs
('common', 'loading', 'Chargement...', 'text', 1),
('common', 'error', 'Une erreur est survenue', 'text', 2),
('common', 'success', 'Opération réussie', 'text', 3),
('common', 'book_now', 'Réserver maintenant', 'text', 4),
('common', 'learn_more', 'En savoir plus', 'text', 5),
('common', 'contact_us', 'Nous contacter', 'text', 6)

ON CONFLICT (section, key) DO NOTHING;

-- ================================================
-- INDEX POUR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);

-- ================================================
-- COMMENTAIRES
-- ================================================
COMMENT ON TABLE site_content IS 'Contenu textuel du site modifiable depuis le dashboard admin';
COMMENT ON COLUMN site_content.section IS 'Section du site (home, contact, footer, etc.)';
COMMENT ON COLUMN site_content.key IS 'Clé unique du contenu dans la section';
COMMENT ON COLUMN site_content.value IS 'Valeur du contenu en français';
COMMENT ON COLUMN site_content.value_ar IS 'Valeur du contenu en arabe (optionnel)';
COMMENT ON COLUMN site_content.type IS 'Type de contenu (text, textarea, image, etc.)';
