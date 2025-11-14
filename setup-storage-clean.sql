-- ============================================
-- NETTOYAGE ET CONFIGURATION SUPABASE STORAGE
-- ============================================

-- ÉTAPE 1 : Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Public Access Services" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload services" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own service files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own service files" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Profiles" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload profiles" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Hero" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload hero" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Categories" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload categories" ON storage.objects;

-- ÉTAPE 2 : Créer les buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('services', 'services', true),
  ('profiles', 'profiles', true),
  ('hero', 'hero', true),
  ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;

-- ÉTAPE 3 : Créer les nouvelles politiques
CREATE POLICY "services_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'services');

CREATE POLICY "services_auth_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'services');

CREATE POLICY "services_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'services');

CREATE POLICY "services_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'services');

CREATE POLICY "profiles_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

CREATE POLICY "profiles_auth_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles');

CREATE POLICY "hero_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hero');

CREATE POLICY "hero_auth_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hero');

CREATE POLICY "categories_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'categories');

CREATE POLICY "categories_auth_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'categories');

-- ÉTAPE 4 : Tables pour le contenu
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

CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
CREATE INDEX IF NOT EXISTS idx_site_content_active ON site_content(is_active);

DROP TRIGGER IF EXISTS update_site_content_updated_at ON site_content;
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active content" ON site_content;
CREATE POLICY "Public can view active content"
  ON site_content FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage content" ON site_content;
CREATE POLICY "Admins can manage content"
  ON site_content FOR ALL
  USING (auth.role() = 'authenticated');

-- ÉTAPE 5 : Insérer le contenu par défaut
INSERT INTO site_content (section, key, value, value_ar, type) VALUES
('hero', 'title', 'Découvrez le Maroc Authentique', 'اكتشف المغرب الأصيل', 'text'),
('hero', 'subtitle', 'Votre plateforme complète pour le tourisme, l''immobilier et les services au Maroc', 'منصتك الكاملة للسياحة والعقارات والخدمات في المغرب', 'text'),
('hero', 'image', '/hero-morocco.jpg', '/hero-morocco.jpg', 'image'),
('hero', 'cta_text', 'Explorer maintenant', 'استكشف الآن', 'text'),
('about', 'title', 'À propos de Maroc 2030', 'حول المغرب 2030', 'text'),
('about', 'description', 'Plateforme innovante connectant touristes, investisseurs et prestataires de services', 'منصة مبتكرة تربط السياح والمستثمرين ومقدمي الخدمات', 'text'),
('features', 'feature1_title', 'Tourisme', 'السياحة', 'text'),
('features', 'feature1_desc', 'Circuits, excursions et guides', 'جولات ورحلات ومرشدين', 'text'),
('features', 'feature2_title', 'Location de voitures', 'تأجير السيارات', 'text'),
('features', 'feature2_desc', 'Large choix de véhicules', 'مجموعة واسعة من المركبات', 'text'),
('features', 'feature3_title', 'Immobilier', 'العقارات', 'text'),
('features', 'feature3_desc', 'Appartements, villas et riads', 'شقق وفيلات ورياضات', 'text'),
('contact', 'email', 'contact@maroc2030.ma', 'contact@maroc2030.ma', 'text'),
('contact', 'phone', '+212 5XX-XXXXXX', '+212 5XX-XXXXXX', 'text'),
('contact', 'address', 'Casablanca, Maroc', 'الدار البيضاء، المغرب', 'text')
ON CONFLICT (section, key) DO NOTHING;

-- ÉTAPE 6 : Table des statistiques
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

INSERT INTO site_stats (stat_key, stat_value, label, label_ar, icon) VALUES
('total_services', 0, 'Services disponibles', 'الخدمات المتاحة', '🏨'),
('total_bookings', 0, 'Réservations', 'الحجوزات', '📅'),
('happy_clients', 0, 'Clients satisfaits', 'عملاء راضون', '😊'),
('partners', 0, 'Partenaires', 'شركاء', '🤝')
ON CONFLICT (stat_key) DO NOTHING;

ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view stats" ON site_stats;
CREATE POLICY "Public can view stats"
  ON site_stats FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS "Admins can manage stats" ON site_stats;
CREATE POLICY "Admins can manage stats"
  ON site_stats FOR ALL
  USING (auth.role() = 'authenticated');

-- ÉTAPE 7 : Fonction de mise à jour des stats
CREATE OR REPLACE FUNCTION update_site_stats()
RETURNS void AS $$
BEGIN
  UPDATE site_stats
  SET stat_value = (SELECT COUNT(*) FROM services WHERE available = true)
  WHERE stat_key = 'total_services';
  
  UPDATE site_stats
  SET stat_value = (SELECT COUNT(*) FROM bookings)
  WHERE stat_key = 'total_bookings';
  
  UPDATE site_stats
  SET stat_value = (SELECT COUNT(*) FROM profiles WHERE role LIKE 'partner%')
  WHERE stat_key = 'partners';
END;
$$ LANGUAGE plpgsql;

SELECT 'Configuration terminée avec succès !' as message;
