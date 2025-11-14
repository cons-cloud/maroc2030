-- ============================================
-- FIX RAPIDE : ERREUR CHARGEMENT CIRCUITS
-- Exécutez UNIQUEMENT ce script pour corriger l'erreur
-- ============================================

-- OPTION 1 : Désactiver temporairement RLS (pour tester)
-- ⚠️ ATTENTION : Ceci désactive la sécurité temporairement
-- Décommentez les lignes ci-dessous si vous voulez juste tester

-- ALTER TABLE circuits_touristiques DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE partner_products DISABLE ROW LEVEL SECURITY;

-- ============================================
-- OPTION 2 : Activer RLS avec politiques publiques (RECOMMANDÉ)
-- ============================================

-- CIRCUITS TOURISTIQUES
ALTER TABLE circuits_touristiques ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Public read access" ON circuits_touristiques;
DROP POLICY IF EXISTS "Public can view available circuits" ON circuits_touristiques;
DROP POLICY IF EXISTS "Admin full access" ON circuits_touristiques;
DROP POLICY IF EXISTS "Enable read access for all users" ON circuits_touristiques;

-- Créer une politique simple de lecture publique
CREATE POLICY "Enable read access for all users"
ON circuits_touristiques
FOR SELECT
TO public
USING (true);

-- Permettre aux admins de tout faire
CREATE POLICY "Admin full access"
ON circuits_touristiques
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- PARTNER PRODUCTS
ALTER TABLE partner_products ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Public can view available products" ON partner_products;
DROP POLICY IF EXISTS "Partners can manage own products" ON partner_products;
DROP POLICY IF EXISTS "Admin full access" ON partner_products;
DROP POLICY IF EXISTS "Enable read access for all users" ON partner_products;

-- Créer une politique simple de lecture publique
CREATE POLICY "Enable read access for all users"
ON partner_products
FOR SELECT
TO public
USING (true);

-- Permettre aux partenaires de gérer leurs produits
CREATE POLICY "Partners can manage own products"
ON partner_products
FOR ALL
TO authenticated
USING (
  auth.uid() = partner_id OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('partner', 'admin')
  )
);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que RLS est activé
SELECT 
    tablename, 
    rowsecurity as "RLS Activé"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('circuits_touristiques', 'partner_products');

-- Voir les politiques créées
SELECT 
    tablename as "Table",
    policyname as "Politique",
    cmd as "Commande",
    roles as "Rôles"
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('circuits_touristiques', 'partner_products')
ORDER BY tablename, policyname;

-- ============================================
-- TEST MANUEL
-- ============================================

-- Tester la lecture des circuits (devrait fonctionner)
SELECT COUNT(*) as "Nombre de circuits" FROM circuits_touristiques;

-- Tester la lecture des produits partenaires (devrait fonctionner)
SELECT COUNT(*) as "Nombre de produits" FROM partner_products;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================

/*
✅ RLS Activé: true pour les deux tables
✅ 2 politiques créées pour circuits_touristiques
✅ 2 politiques créées pour partner_products
✅ Les requêtes SELECT retournent des résultats

Si vous voyez des erreurs :
1. Vérifiez que les tables existent
2. Vérifiez que vous avez les droits admin dans Supabase
3. Essayez l'OPTION 1 (désactiver RLS temporairement)
*/
