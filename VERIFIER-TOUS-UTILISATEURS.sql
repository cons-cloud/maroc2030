-- ============================================
-- VÉRIFIER AUTOMATIQUEMENT TOUS LES UTILISATEURS
-- ============================================
-- Ce script met is_verified = true pour tous les utilisateurs existants
-- ============================================

-- ÉTAPE 1 : Voir les utilisateurs non vérifiés
-- ============================================
SELECT 
  p.id,
  au.email,
  p.role,
  p.company_name,
  p.is_verified,
  p.created_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.is_verified = false
ORDER BY p.created_at DESC;

-- ÉTAPE 2 : VÉRIFIER TOUS LES UTILISATEURS
-- ============================================
UPDATE profiles 
SET is_verified = true
WHERE is_verified = false;

-- ÉTAPE 3 : VÉRIFIER LE RÉSULTAT
-- ============================================
SELECT 
  p.role,
  COUNT(*) as total,
  COUNT(CASE WHEN p.is_verified = true THEN 1 END) as verifies,
  COUNT(CASE WHEN p.is_verified = false THEN 1 END) as non_verifies
FROM profiles p
GROUP BY p.role
ORDER BY p.role;

-- Voir tous les utilisateurs
SELECT 
  p.id,
  au.email,
  p.role,
  p.company_name,
  p.is_verified,
  p.created_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;
