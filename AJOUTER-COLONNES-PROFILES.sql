-- ============================================
-- AJOUTER LES COLONNES MANQUANTES À PROFILES
-- ============================================
-- Pour une synchronisation complète des données utilisateurs
-- ============================================

-- ÉTAPE 1 : Voir la structure actuelle
-- ============================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- ÉTAPE 2 : Ajouter les colonnes manquantes
-- ============================================

-- Ajouter first_name
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);

-- Ajouter last_name
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Ajouter email (si pas déjà fait)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- ÉTAPE 3 : Synchroniser les emails depuis auth.users
-- ============================================
UPDATE profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id
  AND (p.email IS NULL OR p.email = '');

-- ÉTAPE 4 : Vérifier tous les utilisateurs
-- ============================================
UPDATE profiles 
SET is_verified = true
WHERE is_verified = false;

-- ÉTAPE 5 : Nettoyer les profils orphelins
-- ============================================
DELETE FROM profiles 
WHERE id NOT IN (
  SELECT id FROM auth.users
);

-- ÉTAPE 6 : Vérifier le résultat
-- ============================================
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.company_name,
  p.phone,
  p.city,
  p.country,
  p.role,
  p.is_verified,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC;

-- ÉTAPE 7 : Résumé par rôle
-- ============================================
SELECT 
  p.role,
  COUNT(*) as nombre,
  COUNT(CASE WHEN p.is_verified = true THEN 1 END) as verifies,
  COUNT(CASE WHEN p.email IS NOT NULL THEN 1 END) as avec_email,
  COUNT(CASE WHEN p.first_name IS NOT NULL THEN 1 END) as avec_prenom
FROM profiles p
GROUP BY p.role
ORDER BY p.role;
