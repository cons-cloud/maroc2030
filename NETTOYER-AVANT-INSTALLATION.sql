-- ============================================
-- NETTOYAGE COMPLET AVANT INSTALLATION
-- Exécutez ce script AVANT DASHBOARD-PARTENAIRE-COMPLET.sql
-- ============================================

-- ÉTAPE 1 : Supprimer les policies RLS
-- ============================================
DROP POLICY IF EXISTS "Partners can view own products" ON partner_products;
DROP POLICY IF EXISTS "Partners can insert own products" ON partner_products;
DROP POLICY IF EXISTS "Partners can update own products" ON partner_products;
DROP POLICY IF EXISTS "Partners can delete own products" ON partner_products;
DROP POLICY IF EXISTS "Public can view available products" ON partner_products;
DROP POLICY IF EXISTS "Admins can manage all products" ON partner_products;
DROP POLICY IF EXISTS "Partners can view own earnings" ON partner_earnings;
DROP POLICY IF EXISTS "Admins can manage all earnings" ON partner_earnings;

-- ÉTAPE 2 : Supprimer les triggers
-- ============================================
DROP TRIGGER IF EXISTS trigger_create_partner_earning ON bookings;

-- ÉTAPE 2 : Supprimer les fonctions
-- ============================================
DROP FUNCTION IF EXISTS create_partner_earning() CASCADE;
DROP FUNCTION IF EXISTS mark_partner_paid(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS calculate_commission(DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS get_partner_dashboard_stats(UUID) CASCADE;

-- ÉTAPE 3 : Supprimer les vues
-- ============================================
DROP VIEW IF EXISTS partner_bookings_view CASCADE;
DROP VIEW IF EXISTS admin_bookings_commission_view CASCADE;
DROP VIEW IF EXISTS partner_stats_view CASCADE;

-- ÉTAPE 4 : Supprimer les tables (⚠️ ATTENTION : supprime les données !)
-- ============================================
-- Décommentez SEULEMENT si vous voulez tout supprimer et recommencer
-- DROP TABLE IF EXISTS partner_earnings CASCADE;
-- DROP TABLE IF EXISTS partner_products CASCADE;

-- ÉTAPE 5 : Supprimer les colonnes ajoutées à profiles (⚠️ ATTENTION)
-- ============================================
-- Décommentez SEULEMENT si vous voulez supprimer ces colonnes
-- ALTER TABLE profiles DROP COLUMN IF EXISTS partner_type CASCADE;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS commission_rate CASCADE;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS bank_account CASCADE;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS iban CASCADE;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS total_earnings CASCADE;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS pending_earnings CASCADE;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS paid_earnings CASCADE;

-- ÉTAPE 6 : Supprimer les colonnes ajoutées à bookings (⚠️ ATTENTION)
-- ============================================
-- Décommentez SEULEMENT si vous voulez supprimer ces colonnes
-- ALTER TABLE bookings DROP COLUMN IF EXISTS partner_id CASCADE;
-- ALTER TABLE bookings DROP COLUMN IF EXISTS total_amount CASCADE;
-- ALTER TABLE bookings DROP COLUMN IF EXISTS commission_amount CASCADE;
-- ALTER TABLE bookings DROP COLUMN IF EXISTS partner_amount CASCADE;
-- ALTER TABLE bookings DROP COLUMN IF EXISTS commission_rate CASCADE;
-- ALTER TABLE bookings DROP COLUMN IF EXISTS partner_paid CASCADE;
-- ALTER TABLE bookings DROP COLUMN IF EXISTS partner_paid_at CASCADE;

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que les triggers sont supprimés
SELECT 
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%partner%';

-- Vérifier que les fonctions sont supprimées
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%partner%'
  AND routine_schema = 'public';

-- Vérifier que les vues sont supprimées
SELECT 
  table_name
FROM information_schema.views
WHERE table_name LIKE '%partner%'
  AND table_schema = 'public';

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Toutes les requêtes ci-dessus doivent retourner 0 lignes
-- Si c'est le cas, vous pouvez exécuter DASHBOARD-PARTENAIRE-COMPLET.sql

SELECT '✅ Nettoyage terminé ! Vous pouvez maintenant exécuter DASHBOARD-PARTENAIRE-COMPLET.sql' as message;
