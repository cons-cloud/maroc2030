# ✅ CONFIGURATION GOOGLE OAUTH - URLS CORRECTES

## 🎯 **URLS À COPIER-COLLER**

### **Pour Google Cloud Console**

#### **Authorized JavaScript origins**
```
http://localhost:3000
https://tywnsgsufwxienpgbosm.supabase.co
```

#### **Authorized redirect URIs**
```
http://localhost:3000/auth/callback
https://tywnsgsufwxienpgbosm.supabase.co/auth/v1/callback
```

---

## 📝 **ÉTAPES RAPIDES**

### **1. Google Cloud Console** (5 min)
```
https://console.cloud.google.com
Projet: maroc2030

1. APIs & Services → Credentials
2. + CREATE CREDENTIALS → OAuth client ID
3. Application type: Web application
4. Name: Maroc 2030 Web Client
5. Copier-coller les URLs ci-dessus
6. CREATE
7. COPIER Client ID et Client Secret
```

### **2. Supabase Dashboard** (2 min)
```
https://supabase.com/dashboard

1. Authentication → Providers → Google
2. Enable
3. Coller Client ID et Client Secret
4. Save

5. Authentication → URL Configuration
   - Site URL: http://localhost:3000
   - Redirect URLs: http://localhost:3000/**
```

### **3. Exécuter SQL** (1 min)
```
Fichier: GOOGLE-OAUTH-TRIGGER.sql
Copier tout le contenu
Supabase → SQL Editor → Coller → Run
```

---

## ✅ **VÉRIFICATION**

Après configuration :
1. Démarrer l'app : `npm run dev`
2. Aller sur : `http://localhost:3000/login`
3. Cliquer sur le bouton Google
4. Se connecter avec Google
5. Devrait rediriger vers `/dashboard/client`

---

## 📊 **INFORMATIONS DU PROJET**

```
Projet Google Cloud: maroc2030
Numéro: 522159185241
URL Supabase: https://tywnsgsufwxienpgbosm.supabase.co
Port Local: 3000 (pas 5173!)
```

**Prêt à configurer !** 🚀
