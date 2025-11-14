-- ============================================
-- FIX CRITIQUE : RÉCURSION INFINIE RLS
-- ============================================

-- ============================================
-- ÉTAPE 1 : CORRIGER LES POLITIQUES PROFILES
-- ============================================

-- Supprimer TOUTES les politiques existantes sur profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;

-- Créer des politiques SANS récursion
-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Les admins peuvent tout voir (utiliser auth.jwt() au lieu de SELECT sur profiles)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  (auth.jwt() ->> 'role')::text = 'admin'
);

-- Les admins peuvent tout modifier
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR 
  (auth.jwt() ->> 'role')::text = 'admin'
)
WITH CHECK (
  auth.uid() = id OR 
  (auth.jwt() ->> 'role')::text = 'admin'
);

-- ============================================
-- ÉTAPE 2 : CORRIGER CIRCUITS_TOURISTIQUES
-- ============================================

DROP POLICY IF EXISTS "Public read access" ON circuits_touristiques;
DROP POLICY IF EXISTS "Public can view available circuits" ON circuits_touristiques;
DROP POLICY IF EXISTS "Admin full access" ON circuits_touristiques;
DROP POLICY IF EXISTS "Enable read access for all users" ON circuits_touristiques;

-- Lecture publique (anonyme + authentifié)
CREATE POLICY "Enable read access for all users"
ON circuits_touristiques FOR SELECT
USING (true);

-- Admin peut tout faire (sans récursion)
CREATE POLICY "Admin full access"
ON circuits_touristiques FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');

-- ============================================
-- ÉTAPE 3 : CORRIGER PARTNER_PRODUCTS
-- ============================================

DROP POLICY IF EXISTS "Public can view available products" ON partner_products;
DROP POLICY IF EXISTS "Partners can manage own products" ON partner_products;
DROP POLICY IF EXISTS "Admin full access" ON partner_products;
DROP POLICY IF EXISTS "Enable read access for all users" ON partner_products;

-- Lecture publique
CREATE POLICY "Enable read access for all users"
ON partner_products FOR SELECT
USING (true);

-- Partenaires et admins peuvent gérer (sans récursion)
CREATE POLICY "Partners and admins can manage"
ON partner_products FOR ALL
TO authenticated
USING (
  auth.uid() = partner_id OR 
  (auth.jwt() ->> 'role')::text IN ('partner', 'admin')
);

-- ============================================
-- ÉTAPE 4 : CORRIGER TOUS LES AUTRES SERVICES
-- ============================================

-- HOTELS
DROP POLICY IF EXISTS "Public read access" ON hotels;
DROP POLICY IF EXISTS "Admin full access" ON hotels;

CREATE POLICY "Public read access" ON hotels FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON hotels FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');

-- APPARTEMENTS
DROP POLICY IF EXISTS "Public read access" ON appartements;
DROP POLICY IF EXISTS "Admin full access" ON appartements;

CREATE POLICY "Public read access" ON appartements FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON appartements FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');

-- VILLAS
DROP POLICY IF EXISTS "Public read access" ON villas;
DROP POLICY IF EXISTS "Admin full access" ON villas;

CREATE POLICY "Public read access" ON villas FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON villas FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');

-- VOITURES
DROP POLICY IF EXISTS "Public read access" ON locations_voitures;
DROP POLICY IF EXISTS "Admin full access" ON locations_voitures;

CREATE POLICY "Public read access" ON locations_voitures FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON locations_voitures FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');

-- GUIDES
DROP POLICY IF EXISTS "Public read access" ON guides_touristiques;
DROP POLICY IF EXISTS "Admin full access" ON guides_touristiques;

CREATE POLICY "Public read access" ON guides_touristiques FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON guides_touristiques FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');

-- ACTIVITES
DROP POLICY IF EXISTS "Public read access" ON activites_touristiques;
DROP POLICY IF EXISTS "Admin full access" ON activites_touristiques;

CREATE POLICY "Public read access" ON activites_touristiques FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON activites_touristiques FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');

-- EVENEMENTS
DROP POLICY IF EXISTS "Public read access" ON evenements;
DROP POLICY IF EXISTS "Admin full access" ON evenements;

CREATE POLICY "Public read access" ON evenements FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON evenements FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');

-- ANNONCES
DROP POLICY IF EXISTS "Public read access" ON annonces;
DROP POLICY IF EXISTS "Admin full access" ON annonces;

CREATE POLICY "Public read access" ON annonces FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON annonces FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');

-- IMMOBILIER
DROP POLICY IF EXISTS "Public read access" ON immobilier;
DROP POLICY IF EXISTS "Admin full access" ON immobilier;

CREATE POLICY "Public read access" ON immobilier FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON immobilier FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');

-- SITE_CONTENT
DROP POLICY IF EXISTS "Public read access" ON site_content;
DROP POLICY IF EXISTS "Admin full access" ON site_content;

CREATE POLICY "Public read access" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON site_content FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');

-- CONTACT_MESSAGES
DROP POLICY IF EXISTS "Anyone can create" ON contact_messages;
DROP POLICY IF EXISTS "Admin can view all" ON contact_messages;

CREATE POLICY "Anyone can create" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view all" ON contact_messages FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
    tablename as "Table",
    policyname as "Politique",
    cmd as "Commande"
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

/*
✅ CORRECTION APPLIQUÉE :

Au lieu de :
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ↑ Crée une récursion infinie

On utilise :
  (auth.jwt() ->> 'role')::text = 'admin'
  ↑ Lit directement depuis le JWT, pas de récursion

⚠️ IMPORTANT :
Le rôle doit être stocké dans le JWT de Supabase.
Si ce n'est pas le cas, vous devrez configurer les Custom Claims.

Alternative si JWT ne contient pas le rôle :
Utilisez une fonction PostgreSQL avec SECURITY DEFINER
*/
