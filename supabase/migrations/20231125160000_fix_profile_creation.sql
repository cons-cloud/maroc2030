-- Script pour corriger la création de profil utilisateur

-- 1. Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  country TEXT,
  address TEXT,
  city TEXT,
  avatar_url TEXT,
  description TEXT,
  company_name TEXT,
  partner_type TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 0,
  bank_account TEXT,
  iban TEXT,
  total_earnings NUMERIC(10,2) DEFAULT 0,
  pending_earnings NUMERIC(10,2) DEFAULT 0,
  paid_earnings NUMERIC(10,2) DEFAULT 0
);

-- 2. Activer RLS sur la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les politiques existantes si elles existent
DO $$
BEGIN
  -- Supprimer toutes les politiques existantes sur la table profiles
  PERFORM
  FROM pg_policies
  WHERE tablename = 'profiles' 
  AND schemaname = 'public';
  
  -- Supprimer l'ancienne fonction si elle existe
  DROP FUNCTION IF EXISTS public.create_user_profile(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
  ) CASCADE;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erreur lors du nettoyage des politiques existantes: %', SQLERRM;
END $$;

-- 4. Créer la fonction pour gérer la création de profil
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT,
  country TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_profile JSONB;
BEGIN
  -- Vérifier que l'utilisateur existe dans auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;

  -- Insérer le nouveau profil
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    role,
    country,
    is_verified,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    first_name,
    last_name,
    phone,
    role,
    country,
    false, -- is_verified
    NOW(),
    NOW()
  )
  RETURNING to_jsonb(profiles.*) INTO new_profile;

  -- Retourner le profil créé
  RETURN new_profile;
END;
$$;

-- 5. Créer les politiques RLS nécessaires

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY users_can_view_own_profile
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Les utilisateurs peuvent créer leur propre profil
CREATE POLICY users_can_create_own_profile
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY users_can_update_own_profile
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 6. Donner les permissions nécessaires
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;
      email,
      role,
      is_verified,
      first_name,
      last_name,
      phone
    ) VALUES (
      NEW.id,
      NEW.email,
      'client',
      false,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'phone'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer le déclencheur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_signup();

-- 7. Créer une fonction pour mettre à jour la date de modification
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

-- 8. Créer le trigger pour la mise à jour automatique de updated_at
DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();

-- 9. Accorder les permissions nécessaires
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_signup() TO anon, authenticated;
