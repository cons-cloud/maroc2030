-- ============================================
-- FORCER LE RÔLE ADMIN
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- Étape 1 : Vérifier l'état actuel
SELECT 
  'AVANT MODIFICATION' as etape,
  au.email,
  au.id,
  p.role as role_actuel,
  p.company_name,
  p.is_verified
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email IN ('maroc2031@gmail.com', 'maroc2032@gmail.com');

-- Étape 2 : Forcer le rôle admin pour maroc2031@gmail.com
UPDATE profiles 
SET 
  role = 'admin',
  company_name = 'Maroc 2030 Administration',
  is_verified = true,
  updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'maroc2031@gmail.com'
);

-- Étape 3 : Forcer le rôle admin pour maroc2032@gmail.com
UPDATE profiles 
SET 
  role = 'admin',
  company_name = 'Maroc 2030 Administration',
  is_verified = true,
  updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'maroc2032@gmail.com'
);

-- Étape 4 : Vérifier que ça a fonctionné
SELECT 
  'APRÈS MODIFICATION' as etape,
  au.email,
  au.id,
  p.role as role_actuel,
  p.company_name,
  p.is_verified,
  p.updated_at
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email IN ('maroc2031@gmail.com', 'maroc2032@gmail.com');

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Vous devriez voir :
-- email                  | role_actuel | company_name                    | is_verified
-- -----------------------|-------------|--------------------------------|-------------
-- maroc2031@gmail.com   | admin       | Maroc 2030 Administration      | true
-- maroc2032@gmail.com   | admin       | Maroc 2030 Administration      | true

-- ============================================
-- SI LE PROFIL N'EXISTE PAS
-- ============================================
-- Si vous voyez NULL pour le rôle, créez le profil :

/*
INSERT INTO profiles (id, role, company_name, is_verified, country)
SELECT 
  id,
  'admin',
  'Maroc 2030 Administration',
  true,
  'Maroc'
FROM auth.users
WHERE email = 'maroc2031@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  company_name = 'Maroc 2030 Administration',
  is_verified = true;

INSERT INTO profiles (id, role, company_name, is_verified, country)
SELECT 
  id,
  'admin',
  'Maroc 2030 Administration',
  true,
  'Maroc'
FROM auth.users
WHERE email = 'maroc2032@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  company_name = 'Maroc 2030 Administration',
  is_verified = true;
*/

-- ============================================
-- FIN DU SCRIPT
-- ============================================
