-- ============================================
-- RÉINITIALISER LE MOT DE PASSE D'UN PARTENAIRE
-- ============================================

-- ÉTAPE 1 : Vérifier si le compte existe
-- ============================================

-- Voir tous les utilisateurs
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at,
  raw_user_meta_data->>'role' as role
FROM auth.users
ORDER BY created_at DESC;

-- Chercher un partenaire spécifique
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  p.company_name,
  p.role,
  p.phone
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.role LIKE 'partner%'
ORDER BY u.created_at DESC;

-- ÉTAPE 2 : Vérifier le profil du partenaire
-- ============================================

SELECT 
  id,
  role,
  company_name,
  phone,
  city,
  partner_type,
  created_at
FROM profiles
WHERE role LIKE 'partner%'
ORDER BY created_at DESC;

-- ÉTAPE 3 : Réinitialiser le mot de passe
-- ============================================

-- ⚠️ IMPORTANT : Cette commande ne fonctionne PAS directement en SQL
-- Vous devez utiliser le Dashboard Supabase ou l'API Admin

-- OPTION A : Via Dashboard Supabase
-- 1. Allez sur Supabase → Authentication → Users
-- 2. Trouvez l'utilisateur
-- 3. Cliquez sur les 3 points → "Reset Password"
-- 4. Envoyez un email de réinitialisation OU définissez un nouveau mot de passe

-- OPTION B : Créer un nouveau compte avec un mot de passe connu
-- Si le compte est corrompu, supprimez-le et recréez-le

-- Supprimer l'ancien compte (⚠️ Attention : supprime aussi le profil !)
-- DELETE FROM auth.users WHERE email = 'partenaire@example.com';

-- Puis recréez-le via le Dashboard Admin de votre application

-- ÉTAPE 4 : Vérifier que l'email est confirmé
-- ============================================

-- Si email_confirmed_at est NULL, le confirmer manuellement
-- Via Dashboard Supabase → Authentication → Users → Cliquez sur l'utilisateur → "Confirm Email"

-- ÉTAPE 5 : Test de connexion
-- ============================================

-- Après avoir réinitialisé le mot de passe, testez :
-- 1. Allez sur http://localhost:5173/login
-- 2. Entrez l'email du partenaire
-- 3. Entrez le nouveau mot de passe
-- 4. ✅ Devrait fonctionner

-- ============================================
-- CRÉER UN NOUVEAU PARTENAIRE TEST
-- ============================================

-- Si vous voulez créer un partenaire test manuellement :

-- 1. Créer l'utilisateur dans Supabase Auth
-- Via Dashboard Supabase → Authentication → Users → Add User
-- Email: partenaire.test@maroc2030.ma
-- Password: Test1234!
-- ✅ Cochez "Auto Confirm User"

-- 2. Récupérer l'ID utilisateur créé
SELECT id, email FROM auth.users WHERE email = 'partenaire.test@maroc2030.ma';

-- 3. Créer ou mettre à jour le profil
INSERT INTO profiles (
  id,
  role,
  company_name,
  partner_type,
  phone,
  city
) VALUES (
  'USER_ID_FROM_STEP_2',  -- ⚠️ Remplacez par l'ID réel
  'partner_immobilier',
  'Agence Test',
  'immobilier',
  '+212600000000',
  'Casablanca'
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  company_name = EXCLUDED.company_name,
  partner_type = EXCLUDED.partner_type,
  phone = EXCLUDED.phone,
  city = EXCLUDED.city;

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

-- Vérifier que tout est correct
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.company_name,
  p.partner_type
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'partenaire.test@maroc2030.ma';

-- Résultat attendu :
-- ✅ email_confirmed_at : doit avoir une date (pas NULL)
-- ✅ role : doit être 'partner_immobilier' (ou autre partner_*)
-- ✅ company_name : doit être rempli

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- 1. Le mot de passe ne peut PAS être lu en SQL (hashé)
-- 2. Pour réinitialiser, utilisez le Dashboard Supabase
-- 3. Assurez-vous que email_confirmed_at n'est pas NULL
-- 4. Le rôle doit commencer par 'partner_'
-- 5. L'ID dans profiles doit correspondre à l'ID dans auth.users
