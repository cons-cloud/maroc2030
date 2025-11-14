-- ============================================
-- AJOUTER LA COLONNE EMAIL À LA TABLE PROFILES
-- ============================================
-- Pour une synchronisation complète des données
-- ============================================

-- ÉTAPE 1 : Vérifier si la colonne email existe
-- ============================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'email';

-- ÉTAPE 2 : Ajouter la colonne email si elle n'existe pas
-- ============================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- ÉTAPE 3 : Synchroniser les emails depuis auth.users
-- ============================================
UPDATE profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id
  AND (p.email IS NULL OR p.email = '');

-- ÉTAPE 4 : Vérifier le résultat
-- ============================================
-- Afficher un échantillon des profils avec leurs emails
SELECT id, email, created_at 
FROM profiles 
WHERE email IS NOT NULL
LIMIT 10;

-- Compter les profils avec et sans email
SELECT 
    COUNT(*) AS total_profiles,
    COUNT(email) AS profiles_with_email,
    COUNT(*) - COUNT(email) AS profiles_without_email
FROM profiles;

-- Vérifier les contraintes d'unicité
SELECT email, COUNT(*) as count
FROM profiles
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Ajouter un index sur la colonne email pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Vérifier que l'index a été créé
SELECT 
    tablename, 
    indexname, 
    indexdef
FROM 
    pg_indexes 
WHERE 
    tablename = 'profiles'
ORDER BY 
    indexname;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'La synchronisation des emails est terminée avec succès.';
    RAISE NOTICE 'Pour plus de détails, consultez les résultats des requêtes ci-dessus.';
END $$;

-- Vérification finale : Comparaison entre auth.users et profiles
-- ============================================
SELECT 
  p.id,
  p.email as profile_email,
  au.email as auth_email,
  p.first_name,
  p.last_name,
  p.role,
  CASE 
    WHEN p.email = au.email THEN '✅ SYNCHRONISÉ'
    WHEN p.email IS NULL THEN '⚠️ EMAIL MANQUANT'
    WHEN p.email != au.email THEN '❌ INCOHÉRENCE'
    ELSE '❓ ÉTAT INCONNU'
  END as statut_synchronisation
FROM 
  profiles p
JOIN 
  auth.users au ON p.id = au.id
WHERE 
  p.email IS DISTINCT FROM au.email  -- Ne montrer que les différences
  OR p.email IS NULL
ORDER BY 
  statut_synchronisation, p.updated_at DESC
LIMIT 50;

-- ============================================
-- RÉSUMÉ DES ACTIONS EFFECTUÉES :
-- 1. Vérification de l'existence de la colonne email
-- 2. Ajout de la colonne si nécessaire
-- 3. Synchronisation des emails depuis auth.users
-- 4. Vérification des résultats
-- 5. Création d'un index sur la colonne email
-- 6. Vérification finale des incohérences
-- ============================================

-- STATISTIQUES FINALES
-- ============================================
-- Statistiques générales
SELECT 
  COUNT(*) as total_profils,
  COUNT(CASE WHEN p.email IS NOT NULL THEN 1 END) as avec_email,
  COUNT(CASE WHEN p.email IS NULL THEN 1 END) as sans_email,
  ROUND(COUNT(CASE WHEN p.email IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as pourcentage_avec_email
FROM profiles p;

-- Statistiques par rôle
SELECT 
  p.role,
  COUNT(*) as total,
  COUNT(CASE WHEN p.email IS NOT NULL THEN 1 END) as avec_email,
  ROUND(COUNT(CASE WHEN p.email IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as pourcentage_avec_email
FROM profiles p
GROUP BY p.role
ORDER BY total DESC;

-- ============================================
-- INSTRUCTIONS D'EXÉCUTION :
-- 1. Allez dans l'onglet SQL de Supabase
-- 2. Copiez-collez tout ce script
-- 3. Exécutez avec CMD+Enter (Mac) ou Ctrl+Enter (Windows/Linux)
-- 4. Consultez les résultats dans l'onglet "Results"
-- 5. Vérifiez les notifications pour les messages d'état
-- ============================================

-- Message de fin
DO $$
BEGIN
    RAISE NOTICE 'Script exécuté avec succès à %', now();
    RAISE NOTICE 'Consultez les résultats dans les onglets ci-dessous.';
END $$;
