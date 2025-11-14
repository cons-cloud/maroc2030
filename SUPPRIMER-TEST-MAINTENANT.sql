-- ============================================
-- SUPPRIMER LES DONNÉES DE TEST - SCRIPT DIRECT
-- ============================================
-- ⚠️ ATTENTION : Ce script va VRAIMENT supprimer les données !
-- ⚠️ Faites une sauvegarde avant d'exécuter !
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

-- Si vous êtes satisfait de ce qui sera supprimé, continuez...

-- ============================================
-- ÉTAPE 2 : SUPPRIMER LES PROFILS DE TEST
-- ============================================
-- Cette commande va supprimer tous les profils avec emails de test
-- Si vous avez des contraintes CASCADE, toutes les données liées seront supprimées automatiquement

DELETE FROM profiles 
WHERE email LIKE '%test%' 
   OR email LIKE '%demo%' 
   OR email LIKE '%example%';

-- ============================================
-- ÉTAPE 3 : Vérifier le résultat
-- ============================================
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
-- ÉTAPE 4 : Vérifier les profils restants
-- ============================================
SELECT 
  role,
  COUNT(*) as nombre
FROM profiles
GROUP BY role
ORDER BY role;
