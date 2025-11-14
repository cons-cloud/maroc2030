-- ============================================
-- NETTOYER LES PROFILS ORPHELINS
-- ============================================
-- Ce script supprime les profils qui n'ont pas de compte auth.users correspondant
-- ============================================

-- ÉTAPE 1 : Voir les profils orphelins (sans compte auth.users)
-- ============================================
SELECT 
  p.id,
  p.role,
  p.company_name,
  p.created_at,
  'ORPHELIN - Pas de compte auth.users' as statut
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- Compter les profils orphelins
SELECT 
  COUNT(*) as profils_orphelins
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- ============================================
-- ÉTAPE 2 : SUPPRIMER LES PROFILS ORPHELINS
-- ============================================
-- ⚠️ Décommentez pour supprimer les profils sans compte auth.users

-- DELETE FROM profiles 
-- WHERE id NOT IN (
--   SELECT id FROM auth.users
-- );

-- ============================================
-- ÉTAPE 3 : Vérifier le résultat
-- ============================================
-- Compter les profils par rôle (seulement ceux avec compte auth.users)

SELECT 
  p.role,
  COUNT(*) as nombre
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
GROUP BY p.role
ORDER BY p.role;

-- Voir tous les utilisateurs valides
SELECT 
  p.id,
  au.email,
  p.role,
  p.company_name,
  p.created_at
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;

-- ============================================
-- RÉSUMÉ FINAL
-- ============================================
SELECT 
  'TOTAL PROFILS' as type,
  COUNT(*) as nombre
FROM profiles

UNION ALL

SELECT 
  'PROFILS VALIDES (avec auth.users)',
  COUNT(*)
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id

UNION ALL

SELECT 
  'PROFILS ORPHELINS (sans auth.users)',
  COUNT(*)
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;
