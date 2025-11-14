-- ============================================
-- VÉRIFIER ET CRÉER LES COMPTES ADMIN
-- ============================================

-- ÉTAPE 1 : Vérifier si les comptes admin existent
-- ============================================

SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email IN ('maroc2031@gmail.com', 'maroc2032@gmail.com')
ORDER BY email;

-- ÉTAPE 2 : Vérifier qu'ils n'ont PAS de profil (normal pour les admins)
-- ============================================

SELECT 
  u.email,
  p.id as profile_id,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN ('maroc2031@gmail.com', 'maroc2032@gmail.com');

-- Résultat attendu : profile_id et role doivent être NULL pour les admins

-- ÉTAPE 3 : Si un admin a un profil par erreur, le supprimer
-- ============================================

-- ⚠️ Décommentez SEULEMENT si vous voulez supprimer les profils admin
-- DELETE FROM profiles
-- WHERE id IN (
--   SELECT id FROM auth.users 
--   WHERE email IN ('maroc2031@gmail.com', 'maroc2032@gmail.com')
-- );

-- ÉTAPE 4 : Vérification finale
-- ============================================

SELECT 
  '✅ Vérification terminée' as status,
  COUNT(*) as nombre_admins
FROM auth.users
WHERE email IN ('maroc2031@gmail.com', 'maroc2032@gmail.com');

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- Les comptes admin doivent être créés manuellement dans Supabase :
-- 1. Allez sur Supabase → Authentication → Users
-- 2. Cliquez "Add User"
-- 3. Email : maroc2031@gmail.com
-- 4. Password : Maroc2031@
-- 5. Répétez pour maroc2032@gmail.com avec Maroc2032@

-- Les admins N'ONT PAS de profil dans la table profiles
-- Ils sont identifiés uniquement par leur email dans le code

-- ============================================
-- VÉRIFICATIONS SUPPLÉMENTAIRES
-- ============================================

-- Voir tous les utilisateurs
SELECT 
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- Voir tous les profils (les admins ne doivent PAS apparaître ici)
SELECT 
  p.id,
  u.email,
  p.role,
  p.company_name
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;
