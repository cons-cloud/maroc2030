-- ============================================
-- CONFIGURATION GOOGLE OAUTH - MAROC 2030
-- ============================================
-- À exécuter dans Supabase SQL Editor après avoir configuré Google OAuth

-- ============================================
-- 1. FONCTION POUR CRÉER LE PROFIL AUTOMATIQUEMENT
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user_oauth()
RETURNS TRIGGER AS $$
DECLARE
  full_name TEXT;
  first_name TEXT;
  last_name TEXT;
BEGIN
  -- Récupérer le nom complet depuis les métadonnées Google
  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  
  -- Séparer prénom et nom
  IF full_name != '' THEN
    first_name := split_part(full_name, ' ', 1);
    last_name := CASE 
      WHEN array_length(string_to_array(full_name, ' '), 1) > 1 
      THEN substring(full_name from length(first_name) + 2)
      ELSE ''
    END;
  ELSE
    -- Si pas de nom, utiliser l'email
    first_name := split_part(NEW.email, '@', 1);
    last_name := '';
  END IF;

  -- Créer ou mettre à jour le profil
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    avatar_url,
    role, 
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    first_name,
    last_name,
    NEW.raw_user_meta_data->>'avatar_url',
    'client',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. TRIGGER POUR NOUVELLE INSCRIPTION GOOGLE
-- ============================================

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created_oauth ON auth.users;

-- Créer le trigger pour les nouvelles inscriptions Google
CREATE TRIGGER on_auth_user_created_oauth
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_app_meta_data->>'provider' = 'google')
  EXECUTE FUNCTION public.handle_new_user_oauth();

-- ============================================
-- 3. FONCTION POUR METTRE À JOUR LE PROFIL
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_user_updated_oauth()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'utilisateur se reconnecte avec Google, mettre à jour l'avatar
  IF NEW.raw_app_meta_data->>'provider' = 'google' THEN
    UPDATE public.profiles
    SET 
      avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. TRIGGER POUR MISE À JOUR PROFIL
-- ============================================

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_updated_oauth ON auth.users;

-- Créer le trigger pour les mises à jour
CREATE TRIGGER on_auth_user_updated_oauth
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_updated_oauth();

-- ============================================
-- 5. VÉRIFICATION
-- ============================================

-- Vérifier que les fonctions sont créées
SELECT 
  proname as function_name,
  prosrc as function_code
FROM pg_proc 
WHERE proname IN ('handle_new_user_oauth', 'handle_user_updated_oauth');

-- Vérifier que les triggers sont créés
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created_oauth', 'on_auth_user_updated_oauth');

-- ============================================
-- ✅ CONFIGURATION TERMINÉE
-- ============================================
-- Les utilisateurs qui se connectent avec Google auront automatiquement :
-- - Un profil créé dans la table profiles
-- - Leur prénom et nom extraits de Google
-- - Leur photo de profil Google
-- - Le rôle 'client' par défaut
-- ============================================
