# 🔐 AUTHENTIFICATION SOCIALE (Google & Facebook)

## 📋 **ÉTAT ACTUEL**

### **❌ Non Fonctionnel**
- Les boutons Google et Facebook sont affichés dans Login.tsx
- **Aucune fonction onClick** n'est attachée
- Pas de configuration Supabase pour les providers OAuth
- Pas d'implémentation dans Inscription.tsx

---

## ✅ **SOLUTION COMPLÈTE**

### **Étape 1 : Configuration Supabase**

#### **1.1 Google OAuth**
```
1. Aller sur https://console.cloud.google.com
2. Créer un projet ou sélectionner un existant
3. Activer Google+ API
4. Créer des identifiants OAuth 2.0
5. Ajouter les URLs autorisées :
   - Authorized JavaScript origins: https://votre-projet.supabase.co
   - Authorized redirect URIs: https://votre-projet.supabase.co/auth/v1/callback
6. Copier Client ID et Client Secret
```

#### **1.2 Facebook OAuth**
```
1. Aller sur https://developers.facebook.com
2. Créer une application
3. Ajouter le produit "Facebook Login"
4. Configurer les URLs de redirection :
   - Valid OAuth Redirect URIs: https://votre-projet.supabase.co/auth/v1/callback
5. Copier App ID et App Secret
```

#### **1.3 Configuration dans Supabase Dashboard**
```
1. Aller dans Authentication > Providers
2. Activer Google :
   - Client ID: [votre-client-id]
   - Client Secret: [votre-client-secret]
3. Activer Facebook :
   - Client ID: [votre-app-id]
   - Client Secret: [votre-app-secret]
```

---

### **Étape 2 : Implémentation dans le Code**

#### **2.1 Fonction de connexion Google**
```tsx
const handleGoogleLogin = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard/client`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
  } catch (error: any) {
    console.error('Erreur Google:', error);
    toast.error('Erreur lors de la connexion avec Google');
  }
};
```

#### **2.2 Fonction de connexion Facebook**
```tsx
const handleFacebookLogin = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/dashboard/client`,
      },
    });

    if (error) throw error;
  } catch (error: any) {
    console.error('Erreur Facebook:', error);
    toast.error('Erreur lors de la connexion avec Facebook');
  }
};
```

---

### **Étape 3 : Gestion du Profil après OAuth**

#### **3.1 Trigger Supabase pour créer le profil**
```sql
-- Fonction pour créer automatiquement un profil après inscription OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user_oauth()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    '',
    'client',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour exécuter la fonction
CREATE TRIGGER on_auth_user_created_oauth
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_app_meta_data->>'provider' IN ('google', 'facebook'))
  EXECUTE FUNCTION public.handle_new_user_oauth();
```

---

## 🎯 **FLUX D'AUTHENTIFICATION OAUTH**

### **Connexion avec Google**
```
1. Utilisateur clique "Continuer avec Google"
    ↓
2. Redirection vers Google OAuth
    ↓
3. Utilisateur autorise l'application
    ↓
4. Google redirige vers Supabase callback
    ↓
5. Supabase crée l'utilisateur dans auth.users
    ↓
6. Trigger crée automatiquement le profil
    ↓
7. Redirection vers /dashboard/client
    ↓
8. Utilisateur connecté ✅
```

### **Connexion avec Facebook**
```
1. Utilisateur clique "Continuer avec Facebook"
    ↓
2. Redirection vers Facebook OAuth
    ↓
3. Utilisateur autorise l'application
    ↓
4. Facebook redirige vers Supabase callback
    ↓
5. Supabase crée l'utilisateur dans auth.users
    ↓
6. Trigger crée automatiquement le profil
    ↓
7. Redirection vers /dashboard/client
    ↓
8. Utilisateur connecté ✅
```

---

## 📊 **DONNÉES RÉCUPÉRÉES**

### **Google**
```json
{
  "email": "user@gmail.com",
  "full_name": "John Doe",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "email_verified": true,
  "provider": "google"
}
```

### **Facebook**
```json
{
  "email": "user@facebook.com",
  "full_name": "John Doe",
  "avatar_url": "https://graph.facebook.com/.../picture",
  "email_verified": true,
  "provider": "facebook"
}
```

---

## ⚠️ **IMPORTANT**

### **Sécurité**
- ✅ Les tokens OAuth sont gérés par Supabase (sécurisé)
- ✅ Pas besoin de stocker les secrets côté client
- ✅ HTTPS obligatoire en production

### **Redirection**
- ✅ Configurer `redirectTo` pour rediriger après connexion
- ✅ Gérer les erreurs de redirection
- ✅ Vérifier que l'URL est autorisée dans Supabase

### **Profil**
- ✅ Créer automatiquement le profil avec le trigger
- ✅ Extraire le nom depuis `raw_user_meta_data`
- ✅ Définir le rôle par défaut à 'client'

---

## 🚀 **IMPLÉMENTATION RAPIDE**

### **Option 1 : Configuration Complète (Recommandé)**
1. Configurer Google OAuth dans Google Cloud Console
2. Configurer Facebook OAuth dans Facebook Developers
3. Ajouter les credentials dans Supabase Dashboard
4. Créer le trigger SQL pour les profils
5. Ajouter les fonctions onClick dans Login.tsx et Inscription.tsx

### **Option 2 : Désactiver Temporairement**
Si vous ne voulez pas configurer OAuth maintenant :
1. Masquer les boutons Google et Facebook
2. Garder uniquement l'authentification par email/mot de passe

---

## ✅ **RÉSULTAT ATTENDU**

### **Avec OAuth Configuré**
- ✅ Bouton Google fonctionnel
- ✅ Bouton Facebook fonctionnel
- ✅ Création automatique du profil
- ✅ Redirection vers dashboard client
- ✅ Connexion en 1 clic

### **Sans OAuth**
- ❌ Boutons affichés mais non fonctionnels (état actuel)
- ✅ Connexion par email/mot de passe fonctionne

---

## 📝 **RECOMMANDATION**

**Je recommande l'Option 2 (désactiver temporairement)** car :
1. La configuration OAuth nécessite des comptes Google Cloud et Facebook Developers
2. Nécessite une URL de production (HTTPS)
3. L'authentification par email/mot de passe fonctionne déjà parfaitement
4. Vous pourrez activer OAuth plus tard quand nécessaire

**Voulez-vous que je :**
- A) Implémente OAuth complet (nécessite configuration externe)
- B) Masque les boutons Google/Facebook pour l'instant
- C) Ajoute les fonctions mais avec un message "Bientôt disponible"
