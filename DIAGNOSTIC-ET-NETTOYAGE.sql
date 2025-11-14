-- ============================================
-- DIAGNOSTIC ET NETTOYAGE COMPLET
-- ============================================

-- ÉTAPE 1 : DIAGNOSTIC - Voir tous les profils
-- ============================================
SELECT 
  p.id,
  au.email,
  p.role,
  p.company_name,
  p.phone,
  p.created_at,
  CASE 
    WHEN au.id IS NULL THEN '❌ ORPHELIN (pas de compte auth.users)'
    WHEN au.email LIKE '%test%' OR au.email LIKE '%demo%' THEN '🔴 DONNÉE DE TEST'
    ELSE '✅ UTILISATEUR VALIDE'
  END as statut
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY 
  CASE 
    WHEN au.id IS NULL THEN 1
    WHEN au.email LIKE '%test%' OR au.email LIKE '%demo%' THEN 2
    ELSE 3
  END,
  p.created_at DESC;

-- ÉTAPE 2 : RÉSUMÉ PAR STATUT
-- ============================================
SELECT 
  'TOTAL PROFILS' as categorie,
  COUNT(*) as nombre
FROM profiles

UNION ALL

SELECT 
  'UTILISATEURS VALIDES',
  COUNT(*)
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
WHERE au.email NOT LIKE '%test%' 
  AND au.email NOT LIKE '%demo%'

UNION ALL

SELECT 
  'PROFILS ORPHELINS (sans auth.users)',
  COUNT(*)
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL

UNION ALL

SELECT 
  'DONNÉES DE TEST',
  COUNT(*)
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.email LIKE '%test%' 
   OR au.email LIKE '%demo%';

-- ÉTAPE 3 : DÉTAIL PAR RÔLE (seulement utilisateurs valides)
-- ============================================
SELECT 
  p.role,
  COUNT(*) as nombre
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
WHERE au.email NOT LIKE '%test%' 
  AND au.email NOT LIKE '%demo%'
GROUP BY p.role
ORDER BY p.role;

-- ============================================
-- ÉTAPE 4 : NETTOYAGE
-- ============================================

-- A. Supprimer les profils orphelins (sans compte auth.users)
DELETE FROM profiles 
WHERE id NOT IN (
  SELECT id FROM auth.users
);

-- B. Supprimer les données de test
DELETE FROM profiles 
WHERE id IN (
  SELECT p.id 
  FROM profiles p
  LEFT JOIN auth.users au ON p.id = au.id
  WHERE au.email LIKE '%test%' 
     OR au.email LIKE '%demo%' 
     OR au.email LIKE '%example%'
     OR p.company_name LIKE '%Test%'
     OR p.company_name LIKE '%Demo%'
);

-- ============================================
-- ÉTAPE 5 : VÉRIFICATION FINALE
-- ============================================

-- Compter par rôle après nettoyage
SELECT 
  p.role,
  COUNT(*) as nombre
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
GROUP BY p.role
ORDER BY p.role;

-- Liste complète des utilisateurs valides
SELECT 
  p.id,
  au.email,
  p.role,
  p.company_name,
  p.phone,
  p.is_verified,
  p.created_at
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;

-- Résumé final
SELECT 
  'TOTAL UTILISATEURS VALIDES' as type,
  COUNT(*) as nombre
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id

UNION ALL

SELECT 
  'CLIENTS',
  COUNT(*)
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
WHERE p.role = 'client'

UNION ALL

SELECT 
  'PARTENAIRES',
  COUNT(*)
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
WHERE p.role LIKE 'partner%';
