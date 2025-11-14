-- ============================================
-- CONFIGURATION SUPABASE STORAGE (CORRIGÉ)
-- Pour stocker les images et fichiers
-- ============================================

-- Créer les buckets de stockage
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('services', 'services', true),
  ('profiles', 'profiles', true),
  ('hero', 'hero', true),
  ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLITIQUES DE STOCKAGE (CORRIGÉES)
-- ============================================

-- Services : tout le monde peut voir
CREATE POLICY "Public Access Services"
ON storage.objects FOR SELECT
USING (bucket_id = 'services');

-- Utilisateurs authentifiés peuvent uploader
CREATE POLICY "Authenticated users can upload services"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'services' AND
  auth.role() = 'authenticated'
);

-- Utilisateurs peuvent modifier leurs propres fichiers
CREATE POLICY "Users can update own service files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'services' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Utilisateurs peuvent supprimer leurs propres fichiers
CREATE POLICY "Users can delete own service files"
ON storage.objects FOR DELETE
USING (bucket_id = 'services' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Profiles : tout le monde peut voir
CREATE POLICY "Public Access Profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- Utilisateurs peuvent uploader leur avatar
CREATE POLICY "Users can upload profiles"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles' AND
  auth.role() = 'authenticated'
);

-- Hero : tout le monde peut voir
CREATE POLICY "Public Access Hero"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero');

-- Admins peuvent uploader hero
CREATE POLICY "Admins can upload hero"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero' AND
  auth.role() = 'authenticated'
);

-- Categories : tout le monde peut voir
CREATE POLICY "Public Access Categories"
ON storage.objects FOR SELECT
USING (bucket_id = 'categories');

-- Admins peuvent uploader categories
CREATE POLICY "Admins can upload categories"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'categories' AND
  auth.role() = 'authenticated'
);

-- ============================================
-- TABLE POUR LE CONTENU DU SITE
-- ============================================

CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section VARCHAR(100) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  value_ar TEXT,
  type VARCHAR(50) DEFAULT 'text',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(section, key)
);

-- Index pour optimisation
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
CREATE INDEX IF NOT EXISTS idx_site_content_active ON site_content(is_active);

-- Trigger pour updated_at
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS pour site_content
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire le contenu actif
CREATE POLICY "Public can view active content"
  ON site_content FOR SELECT
  USING (is_active = true);

-- Admins peuvent tout faire (sans récursion)
CREATE POLICY "Admins can manage content"
  ON site_content FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- INSÉRER LE CONTENU PAR DÉFAUT DU SITE
-- ============================================

INSERT INTO site_content (section, key, value, value_ar, type) VALUES
-- Hero Section
('hero', 'title', 'Découvrez le Maroc Authentique', 'اكتشف المغرب الأصيل', 'text'),
('hero', 'subtitle', 'Votre plateforme complète pour le tourisme, l''immobilier et les services au Maroc', 'منصتك الكاملة للسياحة والعقارات والخدمات في المغرب', 'text'),
('hero', 'image', '/hero-morocco.jpg', '/hero-morocco.jpg', 'image'),
('hero', 'cta_text', 'Explorer maintenant', 'استكشف الآن', 'text'),

-- About Section
('about', 'title', 'À propos de Maroc 2030', 'حول المغرب 2030', 'text'),
('about', 'description', 'Plateforme innovante connectant touristes, investisseurs et prestataires de services', 'منصة مبتكرة تربط السياح والمستثمرين ومقدمي الخدمات', 'text'),

-- Features
('features', 'feature1_title', 'Tourisme', 'السياحة', 'text'),
('features', 'feature1_desc', 'Circuits, excursions et guides', 'جولات ورحلات ومرشدين', 'text'),
('features', 'feature2_title', 'Location de voitures', 'تأجير السيارات', 'text'),
('features', 'feature2_desc', 'Large choix de véhicules', 'مجموعة واسعة من المركبات', 'text'),
('features', 'feature3_title', 'Immobilier', 'العقارات', 'text'),
('features', 'feature3_desc', 'Appartements, villas et riads', 'شقق وفيلات ورياضات', 'text'),

-- Contact
('contact', 'email', 'contact@maroc2030.ma', 'contact@maroc2030.ma', 'text'),
('contact', 'phone', '+212 5XX-XXXXXX', '+212 5XX-XXXXXX', 'text'),
('contact', 'address', 'Casablanca, Maroc', 'الدار البيضاء، المغرب', 'text')

ON CONFLICT (section, key) DO NOTHING;

-- ============================================
-- TABLE POUR LES STATISTIQUES DU SITE
-- ============================================

CREATE TABLE IF NOT EXISTS site_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_key VARCHAR(100) UNIQUE NOT NULL,
  stat_value INTEGER DEFAULT 0,
  label VARCHAR(255),
  label_ar VARCHAR(255),
  icon VARCHAR(50),
  is_visible BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insérer les statistiques par défaut
INSERT INTO site_stats (stat_key, stat_value, label, label_ar, icon) VALUES
('total_services', 0, 'Services disponibles', 'الخدمات المتاحة', '🏨'),
('total_bookings', 0, 'Réservations', 'الحجوزات', '📅'),
('happy_clients', 0, 'Clients satisfaits', 'عملاء راضون', '😊'),
('partners', 0, 'Partenaires', 'شركاء', '🤝')
ON CONFLICT (stat_key) DO NOTHING;

-- RLS pour site_stats
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view stats"
  ON site_stats FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Admins can manage stats"
  ON site_stats FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- FONCTION POUR METTRE À JOUR LES STATS AUTO
-- ============================================

CREATE OR REPLACE FUNCTION update_site_stats()
RETURNS void AS $$
BEGIN
  -- Mettre à jour le nombre de services
  UPDATE site_stats
  SET stat_value = (SELECT COUNT(*) FROM services WHERE available = true)
  WHERE stat_key = 'total_services';
  
  -- Mettre à jour le nombre de réservations
  UPDATE site_stats
  SET stat_value = (SELECT COUNT(*) FROM bookings)
  WHERE stat_key = 'total_bookings';
  
  -- Mettre à jour le nombre de partenaires
  UPDATE site_stats
  SET stat_value = (SELECT COUNT(*) FROM profiles WHERE role LIKE 'partner%')
  WHERE stat_key = 'partners';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIN DU SCRIPT
-- ============================================

SELECT 'Configuration du stockage et du contenu terminée !' as message;
