-- ============================================
-- SCRIPT DE CRÉATION DES COMPTES ADMIN
-- Maroc 2030
-- ============================================

-- Ce script crée les 2 comptes administrateurs
-- IMPORTANT : Exécutez ce script APRÈS avoir exécuté supabase-schema.sql

-- ============================================
-- COMPTE ADMIN 1 : maroc2031@gmail.com
-- ============================================

-- Insérer le profil admin 1
-- Note: L'ID doit correspondre à l'ID de l'utilisateur créé dans Supabase Auth
-- Vous devez d'abord créer l'utilisateur dans Supabase Auth UI, puis exécuter cette requête

-- Étape 1: Créez l'utilisateur dans Supabase Dashboard > Authentication > Users
-- Email: maroc2031@gmail.com
-- Password: Maroc2031@
-- Cochez "Auto Confirm User"

-- Étape 2: Une fois l'utilisateur créé, récupérez son ID et exécutez:
-- Remplacez 'USER_ID_1' par l'ID réel de l'utilisateur

-- INSERT INTO profiles (id, email, role, first_name, last_name, is_active)
-- VALUES (
--     'USER_ID_1',  -- Remplacez par l'ID réel
--     'maroc2031@gmail.com',
--     'admin',
--     'Admin',
--     'Maroc 2031',
--     true
-- );

-- ============================================
-- COMPTE ADMIN 2 : maroc2032@gmail.com
-- ============================================

-- Étape 1: Créez l'utilisateur dans Supabase Dashboard > Authentication > Users
-- Email: maroc2032@gmail.com
-- Password: Maroc2032@
-- Cochez "Auto Confirm User"

-- Étape 2: Une fois l'utilisateur créé, récupérez son ID et exécutez:
-- Remplacez 'USER_ID_2' par l'ID réel de l'utilisateur

-- INSERT INTO profiles (id, email, role, first_name, last_name, is_active)
-- VALUES (
--     'USER_ID_2',  -- Remplacez par l'ID réel
--     'maroc2032@gmail.com',
--     'admin',
--     'Admin',
--     'Maroc 2032',
--     true
-- );

-- ============================================
-- MÉTHODE ALTERNATIVE : Mise à jour automatique
-- ============================================

-- Si les utilisateurs existent déjà dans auth.users,
-- vous pouvez mettre à jour leur rôle automatiquement :

-- Pour maroc2031@gmail.com
UPDATE profiles 
SET role = 'admin', 
    first_name = 'Admin',
    last_name = 'Maroc 2031',
    is_active = true
WHERE email = 'maroc2031@gmail.com';

-- Pour maroc2032@gmail.com
UPDATE profiles 
SET role = 'admin',
    first_name = 'Admin', 
    last_name = 'Maroc 2032',
    is_active = true
WHERE email = 'maroc2032@gmail.com';

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que les comptes admin sont bien créés
SELECT id, email, role, first_name, last_name, is_active, created_at
FROM profiles
WHERE email IN ('maroc2031@gmail.com', 'maroc2032@gmail.com');

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- 1. Les utilisateurs doivent d'abord être créés dans Supabase Auth
-- 2. Ensuite, leurs profils sont automatiquement créés dans la table profiles
-- 3. Ce script met à jour leur rôle en 'admin'
-- 4. Ces comptes auront accès uniquement au dashboard admin
-- 5. Ils ne pourront PAS accéder aux dashboards partenaire ou client

-- ============================================
-- EN CAS DE PROBLÈME
-- ============================================

-- Si un profil n'existe pas, créez-le manuellement :
-- (Remplacez USER_ID par l'ID réel de auth.users)

-- INSERT INTO profiles (id, email, role, first_name, last_name, is_active)
-- SELECT 
--     id,
--     email,
--     'admin'::user_role,
--     'Admin',
--     'Maroc 2031',
--     true
-- FROM auth.users
-- WHERE email = 'maroc2031@gmail.com'
-- ON CONFLICT (id) DO UPDATE
-- SET role = 'admin', is_active = true;

-- INSERT INTO profiles (id, email, role, first_name, last_name, is_active)
-- SELECT 
--     id,
--     email,
--     'admin'::user_role,
--     'Admin',
--     'Maroc 2032',
--     true
-- FROM auth.users
-- WHERE email = 'maroc2032@gmail.com'
-- ON CONFLICT (id) DO UPDATE
-- SET role = 'admin', is_active = true;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
