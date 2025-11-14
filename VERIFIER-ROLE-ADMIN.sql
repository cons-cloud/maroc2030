-- ============================================
-- VÉRIFIER ET CORRIGER LE RÔLE ADMIN
-- ============================================

-- ÉTAPE 1 : Vérifier tous les utilisateurs et leurs rôles
-- ============================================

SELECT 
  id,
  email,
  role,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- ÉTAPE 2 : Vérifier les profils
-- ============================================

SELECT 
  id,
  role,
  company_name,
  phone,
  is_verified,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- ÉTAPE 3 : Trouver votre utilisateur admin
-- ============================================

-- Remplacez 'votre-email@example.com' par votre email admin
SELECT 
  u.id as user_id,
  u.email,
  p.role as profile_role,
  p.is_verified,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'votre-email@example.com';  -- ⚠️ CHANGEZ CET EMAIL

-- ÉTAPE 4 : Mettre à jour le rôle en admin
-- ============================================

-- Option A : Si vous connaissez votre email
UPDATE profiles
SET role = 'admin', is_verified = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'votre-email@example.com'  -- ⚠️ CHANGEZ CET EMAIL
);

-- Option B : Si vous connaissez votre ID utilisateur
-- UPDATE profiles
-- SET role = 'admin', is_verified = true
-- WHERE id = 'VOTRE-USER-ID-ICI';

-- Option C : Mettre le premier utilisateur en admin
-- UPDATE profiles
-- SET role = 'admin', is_verified = true
-- WHERE id = (
--   SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
-- );

-- ÉTAPE 5 : Vérifier que le changement a été appliqué
-- ============================================

SELECT 
  u.id,
  u.email,
  p.role,
  p.is_verified
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.role = 'admin';

-- ÉTAPE 6 : Si la table profiles n'existe pas ou est vide
-- ============================================

-- Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client',
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Maroc',
  avatar_url TEXT,
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un profil pour tous les utilisateurs qui n'en ont pas
INSERT INTO profiles (id, email, role, is_verified)
SELECT 
  u.id,
  u.email,
  'client' as role,
  false as is_verified
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- Mettre le premier utilisateur en admin
UPDATE profiles
SET role = 'admin', is_verified = true
WHERE id = (
  SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
);

-- ============================================
-- RÉSULTAT FINAL
-- ============================================

SELECT 
  '✅ Vérification terminée' as status,
  COUNT(*) FILTER (WHERE role = 'admin') as admins,
  COUNT(*) FILTER (WHERE role LIKE 'partner%') as partners,
  COUNT(*) FILTER (WHERE role = 'client') as clients,
  COUNT(*) as total
FROM profiles;
