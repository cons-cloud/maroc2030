# 🔐 CONFIGURATION GOOGLE OAUTH - MAROC 2030

## 📋 **INFORMATIONS DU PROJET**

```
Nom du projet: maroc2030
Numéro du projet: 522159185241
ID du projet: maroc2030
```

---

## 🚀 **ÉTAPES DE CONFIGURATION**

### **Étape 1 : Créer les Identifiants OAuth 2.0**

#### **1.1 Accéder à Google Cloud Console**
```
1. Aller sur : https://console.cloud.google.com
2. Sélectionner le projet "maroc2030"
3. Menu ☰ → APIs & Services → Credentials
```

#### **1.2 Configurer l'écran de consentement OAuth**
```
1. Cliquer sur "OAuth consent screen" (dans le menu latéral)
2. Sélectionner "External" (pour permettre à tous les utilisateurs de se connecter)
3. Remplir les informations :
   - App name: Maroc 2030
   - User support email: [votre-email]
   - Developer contact email: [votre-email]
4. Cliquer "Save and Continue"
5. Scopes : Laisser par défaut (email, profile, openid)
6. Cliquer "Save and Continue"
7. Test users : Ajouter votre email pour tester
8. Cliquer "Save and Continue"
```

#### **1.3 Créer les identifiants OAuth**
```
1. Aller dans "Credentials"
2. Cliquer "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Maroc 2030 Web Client"
5. Authorized JavaScript origins:
   - http://localhost:5173 (pour développement)
   - https://[votre-domaine-supabase].supabase.co
6. Authorized redirect URIs:
   - http://localhost:5173/auth/callback (pour développement)
   - https://[votre-domaine-supabase].supabase.co/auth/v1/callback
7. Cliquer "CREATE"
8. ⚠️ COPIER le Client ID et Client Secret (vous en aurez besoin)
```

---

### **Étape 2 : Obtenir l'URL Supabase**

#### **2.1 Trouver votre URL Supabase**
```
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Settings → API
4. Copier "Project URL" (exemple: https://xxxxx.supabase.co)
```

#### **2.2 URL de callback à utiliser**
```
Format: https://[votre-project-ref].supabase.co/auth/v1/callback

Exemple:
Si votre URL est: https://abcdefgh.supabase.co
Alors callback: https://abcdefgh.supabase.co/auth/v1/callback
```

---

### **Étape 3 : Configurer Supabase**

#### **3.1 Activer Google Provider**
```
1. Aller dans Supabase Dashboard
2. Authentication → Providers
3. Trouver "Google" et cliquer pour l'activer
4. Coller :
   - Client ID (OAuth): [votre-client-id]
   - Client Secret (OAuth): [votre-client-secret]
5. Cliquer "Save"
```

#### **3.2 Vérifier les URLs autorisées**
```
1. Authentication → URL Configuration
2. Vérifier que ces URLs sont autorisées :
   - Site URL: http://localhost:5173 (dev)
   - Redirect URLs:
     * http://localhost:5173/**
     * https://[votre-domaine-production]/**
```

---

### **Étape 4 : Créer le Trigger SQL pour les Profils**

#### **4.1 Exécuter dans Supabase SQL Editor**
```sql
-- Fonction pour créer automatiquement un profil après connexion Google
CREATE OR REPLACE FUNCTION public.handle_new_user_oauth()
RETURNS TRIGGER AS $$
DECLARE
  full_name TEXT;
  first_name TEXT;
  last_name TEXT;
BEGIN
  -- Récupérer le nom complet depuis les métadonnées
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
    first_name := split_part(NEW.email, '@', 1);
    last_name := '';
  END IF;

  -- Créer le profil
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    avatar_url,
    role, 
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    first_name,
    last_name,
    NEW.raw_user_meta_data->>'avatar_url',
    'client',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created_oauth ON auth.users;

-- Créer le trigger pour Google OAuth
CREATE TRIGGER on_auth_user_created_oauth
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_app_meta_data->>'provider' = 'google')
  EXECUTE FUNCTION public.handle_new_user_oauth();

-- Trigger pour mise à jour du profil si l'utilisateur se reconnecte
CREATE OR REPLACE FUNCTION public.handle_user_updated_oauth()
RETURNS TRIGGER AS $$
BEGIN
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

DROP TRIGGER IF EXISTS on_auth_user_updated_oauth ON auth.users;

CREATE TRIGGER on_auth_user_updated_oauth
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_updated_oauth();
```

---

### **Étape 5 : Vérifier la Configuration**

#### **5.1 Checklist**
- [ ] Projet Google Cloud créé (maroc2030) ✅
- [ ] Écran de consentement OAuth configuré
- [ ] Identifiants OAuth créés (Client ID + Secret)
- [ ] URLs de redirection ajoutées dans Google Cloud
- [ ] Google Provider activé dans Supabase
- [ ] Client ID et Secret ajoutés dans Supabase
- [ ] Trigger SQL exécuté dans Supabase
- [ ] Code implémenté dans Login.tsx et Inscription.tsx

---

## 📝 **INFORMATIONS À RÉCUPÉRER**

### **De Google Cloud Console**
```
Client ID: [À copier après création]
Client Secret: [À copier après création]
```

### **De Supabase Dashboard**
```
Project URL: [À copier depuis Settings → API]
Callback URL: [Project URL]/auth/v1/callback
```

---

## 🎯 **PROCHAINES ÉTAPES**

1. **Suivre les étapes 1.2 et 1.3** pour créer les identifiants OAuth
2. **Me donner** :
   - Votre URL Supabase (Project URL)
   - Confirmation que les identifiants sont créés
3. **J'implémenterai** le code dans Login.tsx et Inscription.tsx
4. **Vous exécuterez** le SQL dans Supabase
5. **Nous testerons** la connexion Google

---

## ⚠️ **IMPORTANT**

### **URLs de Redirection**
```
Développement:
- http://localhost:5173/auth/callback

Production (à ajouter plus tard):
- https://[votre-domaine].com/auth/callback
- https://[votre-supabase].supabase.co/auth/v1/callback
```

### **Sécurité**
- ✅ Ne jamais exposer le Client Secret publiquement
- ✅ Le Client Secret reste dans Supabase (sécurisé)
- ✅ Seul le Client ID est utilisé côté client

---

**Prêt à continuer ? Suivez l'étape 1.2 et 1.3, puis donnez-moi votre URL Supabase !** 🚀
