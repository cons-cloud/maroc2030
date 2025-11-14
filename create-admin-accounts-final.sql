-- ============================================
-- CRÉATION DES COMPTES ADMIN - MAROC 2030
-- ============================================

-- IMPORTANT: Exécutez ce script APRÈS avoir créé les utilisateurs
-- dans Supabase Dashboard > Authentication > Users

-- ============================================
-- ÉTAPE 1: Créer les utilisateurs dans Supabase Auth UI
-- ============================================

-- 1. Allez dans Supabase Dashboard > Authentication > Users
-- 2. Cliquez sur "Add user" > "Create new user"
-- 
-- Premier admin:
--   Email: maroc2031@gmail.com
--   Password: Maroc2031@
--   ✅ Cochez "Auto Confirm User"
--
-- Deuxième admin:
--   Email: maroc2032@gmail.com
--   Password: Maroc2032@
--   ✅ Cochez "Auto Confirm User"

-- ============================================
-- ÉTAPE 2: Mettre à jour les rôles en admin
-- ============================================

-- Mettre à jour maroc2031@gmail.com en admin
UPDATE profiles 
SET 
  role = 'admin',
  company_name = 'Maroc 2030 Administration',
  is_verified = true,
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'maroc2031@gmail.com'
);

-- Mettre à jour maroc2032@gmail.com en admin
UPDATE profiles 
SET 
  role = 'admin',
  company_name = 'Maroc 2030 Administration',
  is_verified = true,
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'maroc2032@gmail.com'
);

-- ============================================
-- ÉTAPE 3: Vérification
-- ============================================

-- Vérifier que les comptes admin sont bien créés
SELECT 
  id,
  role,
  company_name,
  is_verified,
  created_at
FROM profiles
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('maroc2031@gmail.com', 'maroc2032@gmail.com')
);

-- Afficher les emails des admins
SELECT 
  au.email,
  p.role,
  p.company_name,
  p.is_verified
FROM auth.users au
JOIN profiles p ON p.id = au.id
WHERE p.role = 'admin'
ORDER BY au.created_at;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================

-- Vous devriez voir:
-- email                  | role  | company_name                    | is_verified
-- -----------------------|-------|--------------------------------|-------------
-- maroc2031@gmail.com   | admin | Maroc 2030 Administration      | true
-- maroc2032@gmail.com   | admin | Maroc 2030 Administration      | true

-- ============================================
-- EN CAS DE PROBLÈME
-- ============================================

-- Si les profils n'existent pas, créez-les manuellement:
-- (Remplacez 'USER_ID_HERE' par l'ID réel de auth.users)

/*
INSERT INTO profiles (id, role, company_name, is_verified)
SELECT 
  id,
  'admin',
  'Maroc 2030 Administration',
  true
FROM auth.users
WHERE email = 'maroc2031@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  company_name = 'Maroc 2030 Administration',
  is_verified = true;

INSERT INTO profiles (id, role, company_name, is_verified)
SELECT 
  id,
  'admin',
  'Maroc 2030 Administration',
  true
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

SELECT '✅ Comptes admin configurés avec succès!' as message;
