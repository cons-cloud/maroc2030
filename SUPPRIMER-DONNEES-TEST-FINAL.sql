-- ============================================
-- SCRIPT POUR SUPPRIMER LES DONNÉES DE TEST
-- ============================================
-- ⚠️ ATTENTION : Ce script supprime définitivement les données !
-- ⚠️ Faites une sauvegarde avant d'exécuter ce script !
-- ============================================

-- ÉTAPE 1 : Voir d'abord ce qui sera supprimé
-- ============================================
SELECT 
  p.id,
  au.email,
  p.role,
  p.company_name,
  p.created_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.email LIKE '%test%' 
   OR au.email LIKE '%demo%' 
   OR au.email LIKE '%example%'
   OR p.company_name LIKE '%Test%'
   OR p.company_name LIKE '%Demo%';

-- ============================================
-- ÉTAPE 2 : SUPPRIMER LES PROFILS DE TEST
-- ============================================
-- ⚠️ Décommentez les lignes suivantes pour VRAIMENT supprimer les données

-- DELETE FROM profiles 
-- WHERE id IN (
--   SELECT p.id 
--   FROM profiles p
--   LEFT JOIN auth.users au ON p.id = au.id
--   WHERE au.email LIKE '%test%' 
--      OR au.email LIKE '%demo%' 
--      OR au.email LIKE '%example%'
--      OR p.company_name LIKE '%Test%'
--      OR p.company_name LIKE '%Demo%'
-- );

-- ============================================
-- ÉTAPE 3 : Vérifier le résultat
-- ============================================
SELECT 
  p.role,
  COUNT(*) as nombre
FROM profiles p
GROUP BY p.role
ORDER BY p.role;

-- Voir tous les utilisateurs restants
SELECT 
  p.id,
  au.email,
  p.role,
  p.company_name,
  p.created_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. L'email est stocké dans auth.users, pas dans profiles
-- 2. Il faut faire un JOIN pour accéder à l'email
-- 3. Les données liées seront supprimées si vous avez CASCADE
-- 4. Les suppressions sont IRRÉVERSIBLES
