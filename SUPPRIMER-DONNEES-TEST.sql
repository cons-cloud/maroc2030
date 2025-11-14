-- ============================================
-- SCRIPT POUR SUPPRIMER LES DONNÉES DE TEST
-- ============================================
-- ⚠️ ATTENTION : Ce script supprime définitivement les données !
-- ⚠️ Exécutez d'abord IDENTIFIER-DONNEES-TEST.sql pour voir ce qui sera supprimé
-- ⚠️ Faites une sauvegarde avant d'exécuter ce script !
-- ============================================

-- ÉTAPE 1 : Voir d'abord ce qui sera supprimé
-- ============================================
SELECT 
  id,
  email,
  role,
  first_name,
  last_name,
  created_at
FROM profiles
WHERE email LIKE '%test%' 
   OR email LIKE '%demo%' 
   OR email LIKE '%example%';

-- ============================================
-- ÉTAPE 2 : SUPPRIMER LES PROFILS DE TEST
-- ============================================
-- ⚠️ Décommentez la ligne suivante pour VRAIMENT supprimer les données

-- DELETE FROM profiles 
-- WHERE email LIKE '%test%' 
--    OR email LIKE '%demo%' 
--    OR email LIKE '%example%';

-- ============================================
-- ÉTAPE 3 : Vérifier le résultat
-- ============================================
SELECT 
  role,
  COUNT(*) as nombre
FROM profiles
GROUP BY role
ORDER BY role;

-- ============================================
-- NOTES : Données liées
-- ============================================
-- Les données liées (réservations, paiements, services, etc.) 
-- seront supprimées automatiquement si vous avez des contraintes 
-- ON DELETE CASCADE dans votre base de données.

-- Si vous n'avez pas de CASCADE, supprimez manuellement :

-- Supprimer les réservations des utilisateurs de test
-- DELETE FROM bookings 
-- WHERE client_id IN (
--   SELECT id FROM profiles 
--   WHERE email LIKE '%test%' OR email LIKE '%demo%'
-- );

-- Supprimer les paiements des utilisateurs de test
-- DELETE FROM payments 
-- WHERE user_id IN (
--   SELECT id FROM profiles 
--   WHERE email LIKE '%test%' OR email LIKE '%demo%'
-- );

-- Supprimer les services des partenaires de test
-- DELETE FROM services 
-- WHERE partner_id IN (
--   SELECT id FROM profiles 
--   WHERE email LIKE '%test%' OR email LIKE '%demo%'
-- );

-- Supprimer les hôtels des partenaires de test
-- DELETE FROM hotels 
-- WHERE partner_id IN (
--   SELECT id FROM profiles 
--   WHERE email LIKE '%test%' OR email LIKE '%demo%'
-- );

-- Supprimer les voitures des partenaires de test
-- DELETE FROM locations_voitures 
-- WHERE partner_id IN (
--   SELECT id FROM profiles 
--   WHERE email LIKE '%test%' OR email LIKE '%demo%'
-- );

-- Supprimer les circuits des partenaires de test
-- DELETE FROM circuits_touristiques 
-- WHERE partner_id IN (
--   SELECT id FROM profiles 
--   WHERE email LIKE '%test%' OR email LIKE '%demo%'
-- );

-- Supprimer les activités des partenaires de test
-- DELETE FROM activites_touristiques 
-- WHERE partner_id IN (
--   SELECT id FROM profiles 
--   WHERE email LIKE '%test%' OR email LIKE '%demo%'
-- );

-- Supprimer les événements des partenaires de test
-- DELETE FROM evenements 
-- WHERE partner_id IN (
--   SELECT id FROM profiles 
--   WHERE email LIKE '%test%' OR email LIKE '%demo%'
-- );

-- Supprimer les annonces des partenaires de test
-- DELETE FROM annonces 
-- WHERE partner_id IN (
--   SELECT id FROM profiles 
--   WHERE email LIKE '%test%' OR email LIKE '%demo%'
-- );

-- Supprimer les villas des partenaires de test
-- DELETE FROM villas 
-- WHERE partner_id IN (
--   SELECT id FROM profiles 
--   WHERE email LIKE '%test%' OR email LIKE '%demo%'
-- );

-- Supprimer les appartements des partenaires de test
-- DELETE FROM appartements 
-- WHERE partner_id IN (
--   SELECT id FROM profiles 
--   WHERE email LIKE '%test%' OR email LIKE '%demo%'
-- );

-- ============================================
-- ÉTAPE 3 : Vérifier le résultat
-- ============================================
-- Après suppression, vérifiez les comptages :

SELECT 'PROFILS' as table_name, COUNT(*) as remaining FROM profiles
UNION ALL
SELECT 'RÉSERVATIONS', COUNT(*) FROM bookings
UNION ALL
SELECT 'PAIEMENTS', COUNT(*) FROM payments
UNION ALL
SELECT 'SERVICES', COUNT(*) FROM services
UNION ALL
SELECT 'HÔTELS', COUNT(*) FROM hotels
UNION ALL
SELECT 'VOITURES', COUNT(*) FROM locations_voitures
UNION ALL
SELECT 'CIRCUITS', COUNT(*) FROM circuits_touristiques
UNION ALL
SELECT 'ACTIVITÉS', COUNT(*) FROM activites_touristiques
UNION ALL
SELECT 'ÉVÉNEMENTS', COUNT(*) FROM evenements
UNION ALL
SELECT 'ANNONCES', COUNT(*) FROM annonces;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Décommentez SEULEMENT les lignes que vous voulez exécuter
-- 2. Testez d'abord avec un SELECT avant de faire un DELETE
-- 3. Faites une sauvegarde de votre base de données avant
-- 4. Les suppressions sont IRRÉVERSIBLES
-- 5. Si vous avez des contraintes CASCADE, les données liées seront supprimées automatiquement
