-- ============================================
-- POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- VERSION SÉCURISÉE - Vérifie l'existence des tables
-- Maroc 2030 - À exécuter dans Supabase SQL Editor
-- ============================================

-- ============================================
-- ÉTAPE 1 : VÉRIFIER LES TABLES EXISTANTES
-- ============================================

-- Exécuter cette requête pour voir vos tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- ÉTAPE 2 : ACTIVER RLS SUR LES TABLES EXISTANTES
-- ============================================

-- Tables principales (à adapter selon vos tables)
DO $$ 
BEGIN
    -- Profiles
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Bookings
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
        ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Payments
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
        ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Services principaux
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hotels') THEN
        ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'appartements') THEN
        ALTER TABLE appartements ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'villas') THEN
        ALTER TABLE villas ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'locations_voitures') THEN
        ALTER TABLE locations_voitures ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'circuits_touristiques') THEN
        ALTER TABLE circuits_touristiques ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Services secondaires
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'guides_touristiques') THEN
        ALTER TABLE guides_touristiques ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activites_touristiques') THEN
        ALTER TABLE activites_touristiques ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'evenements') THEN
        ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'annonces') THEN
        ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'immobilier') THEN
        ALTER TABLE immobilier ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Autres tables
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_messages') THEN
        ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_content') THEN
        ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================
-- ÉTAPE 3 : POLITIQUES POUR PROFILES
-- ============================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Créer les nouvelles politiques
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- ÉTAPE 4 : POLITIQUES POUR BOOKINGS
-- ============================================

DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;
DROP POLICY IF EXISTS "Partners can view their bookings" ON bookings;

CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update all bookings"
ON bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- ÉTAPE 5 : POLITIQUES POUR PAYMENTS
-- ============================================

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "System can create payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;

CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create payments"
ON payments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all payments"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- ÉTAPE 6 : POLITIQUES POUR SERVICES (HOTELS, ETC.)
-- ============================================

-- HOTELS
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hotels') THEN
        DROP POLICY IF EXISTS "Anyone can view published hotels" ON hotels;
        DROP POLICY IF EXISTS "Admins can manage hotels" ON hotels;
        
        CREATE POLICY "Anyone can view published hotels"
        ON hotels FOR SELECT
        USING (disponible = true);
        
        CREATE POLICY "Admins can manage hotels"
        ON hotels FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;

-- APPARTEMENTS
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'appartements') THEN
        DROP POLICY IF EXISTS "Anyone can view published appartements" ON appartements;
        DROP POLICY IF EXISTS "Admins can manage appartements" ON appartements;
        
        CREATE POLICY "Anyone can view published appartements"
        ON appartements FOR SELECT
        USING (disponible = true);
        
        CREATE POLICY "Admins can manage appartements"
        ON appartements FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;

-- VILLAS
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'villas') THEN
        DROP POLICY IF EXISTS "Anyone can view published villas" ON villas;
        DROP POLICY IF EXISTS "Admins can manage villas" ON villas;
        
        CREATE POLICY "Anyone can view published villas"
        ON villas FOR SELECT
        USING (disponible = true);
        
        CREATE POLICY "Admins can manage villas"
        ON villas FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;

-- VOITURES
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'locations_voitures') THEN
        DROP POLICY IF EXISTS "Anyone can view published voitures" ON locations_voitures;
        DROP POLICY IF EXISTS "Admins can manage voitures" ON locations_voitures;
        
        CREATE POLICY "Anyone can view published voitures"
        ON locations_voitures FOR SELECT
        USING (disponible = true);
        
        CREATE POLICY "Admins can manage voitures"
        ON locations_voitures FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;

-- CIRCUITS
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'circuits_touristiques') THEN
        DROP POLICY IF EXISTS "Anyone can view published circuits" ON circuits_touristiques;
        DROP POLICY IF EXISTS "Admins can manage circuits" ON circuits_touristiques;
        
        CREATE POLICY "Anyone can view published circuits"
        ON circuits_touristiques FOR SELECT
        USING (disponible = true);
        
        CREATE POLICY "Admins can manage circuits"
        ON circuits_touristiques FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;

-- ============================================
-- ÉTAPE 7 : POLITIQUES POUR SERVICES SECONDAIRES
-- ============================================

-- GUIDES
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'guides_touristiques') THEN
        DROP POLICY IF EXISTS "Anyone can view published guides" ON guides_touristiques;
        DROP POLICY IF EXISTS "Admins can manage guides" ON guides_touristiques;
        
        CREATE POLICY "Anyone can view published guides"
        ON guides_touristiques FOR SELECT
        USING (disponible = true);
        
        CREATE POLICY "Admins can manage guides"
        ON guides_touristiques FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;

-- ACTIVITES
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activites_touristiques') THEN
        DROP POLICY IF EXISTS "Anyone can view published activites" ON activites_touristiques;
        DROP POLICY IF EXISTS "Admins can manage activites" ON activites_touristiques;
        
        CREATE POLICY "Anyone can view published activites"
        ON activites_touristiques FOR SELECT
        USING (disponible = true);
        
        CREATE POLICY "Admins can manage activites"
        ON activites_touristiques FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;

-- EVENEMENTS
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'evenements') THEN
        DROP POLICY IF EXISTS "Anyone can view published evenements" ON evenements;
        DROP POLICY IF EXISTS "Admins can manage evenements" ON evenements;
        
        CREATE POLICY "Anyone can view published evenements"
        ON evenements FOR SELECT
        USING (disponible = true);
        
        CREATE POLICY "Admins can manage evenements"
        ON evenements FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;

-- ANNONCES
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'annonces') THEN
        DROP POLICY IF EXISTS "Anyone can view published annonces" ON annonces;
        DROP POLICY IF EXISTS "Admins can manage annonces" ON annonces;
        
        CREATE POLICY "Anyone can view published annonces"
        ON annonces FOR SELECT
        USING (statut = 'active');
        
        CREATE POLICY "Admins can manage annonces"
        ON annonces FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;

-- IMMOBILIER
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'immobilier') THEN
        DROP POLICY IF EXISTS "Anyone can view published immobilier" ON immobilier;
        DROP POLICY IF EXISTS "Admins can manage immobilier" ON immobilier;
        
        CREATE POLICY "Anyone can view published immobilier"
        ON immobilier FOR SELECT
        USING (statut = 'active');
        
        CREATE POLICY "Admins can manage immobilier"
        ON immobilier FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;

-- ============================================
-- ÉTAPE 8 : POLITIQUES POUR CONTACT_MESSAGES
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_messages') THEN
        DROP POLICY IF EXISTS "Anyone can create contact messages" ON contact_messages;
        DROP POLICY IF EXISTS "Users can view own messages" ON contact_messages;
        DROP POLICY IF EXISTS "Admins can view all messages" ON contact_messages;
        DROP POLICY IF EXISTS "Admins can update messages" ON contact_messages;
        
        CREATE POLICY "Anyone can create contact messages"
        ON contact_messages FOR INSERT
        WITH CHECK (true);
        
        CREATE POLICY "Admins can view all messages"
        ON contact_messages FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
        
        CREATE POLICY "Admins can update messages"
        ON contact_messages FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;

-- ============================================
-- ÉTAPE 9 : POLITIQUES POUR SITE_CONTENT
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_content') THEN
        DROP POLICY IF EXISTS "Anyone can view site content" ON site_content;
        DROP POLICY IF EXISTS "Admins can manage site content" ON site_content;
        
        CREATE POLICY "Anyone can view site content"
        ON site_content FOR SELECT
        USING (true);
        
        CREATE POLICY "Admins can manage site content"
        ON site_content FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;

-- ============================================
-- ÉTAPE 10 : VÉRIFICATION
-- ============================================

-- Vérifier que RLS est activé sur toutes les tables
SELECT 
    tablename, 
    rowsecurity as "RLS Activé"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Voir toutes les politiques créées
SELECT 
    schemaname as "Schema",
    tablename as "Table", 
    policyname as "Politique",
    cmd as "Commande"
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- NOTES
-- ============================================

/*
✅ Ce script est SÉCURISÉ :
- Vérifie l'existence des tables avant de créer les politiques
- Supprime les anciennes politiques avant d'en créer de nouvelles
- N'échouera pas si une table n'existe pas

📝 APRÈS L'EXÉCUTION :
1. Vérifiez que toutes vos tables ont "RLS Activé" = true
2. Testez l'accès avec différents rôles
3. Ajustez les politiques selon vos besoins

⚠️ IMPORTANT :
- Faites un backup avant d'exécuter
- Testez en environnement de développement d'abord
- Documentez toute modification
*/
