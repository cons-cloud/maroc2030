# 🔐 URLS GOOGLE OAUTH - CONFIGURATION EXACTE

## 📋 **INFORMATIONS DU PROJET**

```
Projet Google Cloud: maroc2030
URL Supabase: https://tywnsgsufwxienpgbosm.supabase.co
```

---

## 🎯 **URLS À AJOUTER DANS GOOGLE CLOUD CONSOLE**

### **Authorized JavaScript origins**
```
http://localhost:3000
https://tywnsgsufwxienpgbosm.supabase.co
```

### **Authorized redirect URIs**
```
http://localhost:3000/auth/callback
https://tywnsgsufwxienpgbosm.supabase.co/auth/v1/callback
```

---

## 📝 **ÉTAPES DANS GOOGLE CLOUD CONSOLE**

### **1. Créer OAuth Client ID**
```
1. https://console.cloud.google.com
2. Projet: maroc2030
3. APIs & Services → Credentials
4. + CREATE CREDENTIALS → OAuth client ID
5. Application type: Web application
6. Name: Maroc 2030 Web Client

7. Authorized JavaScript origins:
   Cliquez "+ ADD URI" et ajoutez :
   ✅ http://localhost:3000
   ✅ https://tywnsgsufwxienpgbosm.supabase.co

8. Authorized redirect URIs:
   Cliquez "+ ADD URI" et ajoutez :
   ✅ http://localhost:3000/auth/callback
   ✅ https://tywnsgsufwxienpgbosm.supabase.co/auth/v1/callback

9. CREATE
10. ⚠️ COPIER et me donner :
    - Client ID
    - Client Secret
```

---

## 🔧 **CONFIGURATION SUPABASE**

### **URLs à configurer dans Supabase Dashboard**
```
1. https://supabase.com/dashboard
2. Votre projet
3. Authentication → URL Configuration
4. Site URL: http://localhost:3000
5. Redirect URLs (ajouter):
   - http://localhost:3000/**
   - https://tywnsgsufwxienpgbosm.supabase.co/**
```

### **Activer Google Provider**
```
1. Authentication → Providers
2. Google → Enable
3. Client ID (OAuth): [À coller après création]
4. Client Secret (OAuth): [À coller après création]
5. Save
```

---

## ✅ **CHECKLIST**

- [ ] Écran de consentement OAuth configuré dans Google Cloud
- [ ] OAuth Client ID créé avec les URLs ci-dessus
- [ ] Client ID et Secret copiés
- [ ] Google Provider activé dans Supabase
- [ ] Client ID et Secret collés dans Supabase
- [ ] SQL trigger exécuté dans Supabase
- [ ] Code implémenté dans Login.tsx et Inscription.tsx

---

## 🚀 **PROCHAINE ÉTAPE**

**Créez les identifiants OAuth dans Google Cloud Console avec les URLs ci-dessus, puis donnez-moi :**
```
Client ID: [À copier]
Client Secret: [À copier]
```

**Ensuite je pourrai implémenter le code !** 🎯
