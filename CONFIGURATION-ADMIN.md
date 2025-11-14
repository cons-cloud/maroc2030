# ✅ CONFIGURATION DES ADMINS - SANS PROFIL

## 🎯 **SYSTÈME D'AUTHENTIFICATION ADMIN**

Les **admins n'ont PAS de profil** dans la table `profiles`. Ils sont identifiés uniquement par leur **email**.

---

## ✅ **COMMENT ÇA FONCTIONNE**

### **1. Vérification par Email**

Le système vérifie si l'email de l'utilisateur est dans la liste des emails admin autorisés :

```typescript
// src/config/admins.ts
export const ADMIN_EMAILS = [
  'admin@maroc2030.ma',
  'contact@maroc2030.ma',
  // Ajoutez vos emails admin ici
];
```

### **2. Flux de Connexion**

```
Utilisateur se connecte
    ↓
Vérifier l'email
    ↓
Email dans ADMIN_EMAILS ?
    ↓ OUI
Redirection → /dashboard/admin ✅
    ↓ NON
Vérifier le profil dans la table profiles
    ↓
Role = partner ? → /dashboard/partner
Role = client ? → /dashboard/client
```

---

## 🚀 **AJOUTER UN ADMIN**

### **ÉTAPE 1 : Créer le Compte dans Supabase**

1. Allez sur Supabase → **Authentication** → **Users**
2. Cliquez sur **Add User**
3. Entrez :
   - **Email** : `votre-email@example.com`
   - **Password** : Votre mot de passe sécurisé
4. Cliquez **Create User**

### **ÉTAPE 2 : Ajouter l'Email à la Liste Admin**

Ouvrez le fichier : `src/config/admins.ts`

```typescript
export const ADMIN_EMAILS = [
  'admin@maroc2030.ma',
  'contact@maroc2030.ma',
  'votre-email@example.com',  // ← Ajoutez votre email ici
];
```

### **ÉTAPE 3 : Redémarrer le Serveur**

```bash
Ctrl + C
npm run dev
```

### **ÉTAPE 4 : Se Connecter**

1. Allez sur http://localhost:5173/login
2. Connectez-vous avec votre email admin
3. ✅ Vous serez redirigé vers `/dashboard/admin`

---

## ✅ **DIFFÉRENCES ENTRE LES RÔLES**

| Rôle | Profil dans `profiles` | Vérification | Dashboard |
|------|----------------------|--------------|-----------|
| **Admin** | ❌ NON | Email dans `ADMIN_EMAILS` | `/dashboard/admin` |
| **Partner** | ✅ OUI | `role = 'partner_*'` | `/dashboard/partner` |
| **Client** | ✅ OUI | `role = 'client'` | `/dashboard/client` |

---

## 🔧 **FICHIERS MODIFIÉS**

### **1. src/config/admins.ts** (NOUVEAU)
```typescript
export const ADMIN_EMAILS = [
  'admin@maroc2030.ma',
  'contact@maroc2030.ma',
];

export const isAdminEmail = (email: string | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
```

### **2. src/Pages/Login.tsx**
```typescript
import { isAdminEmail } from '../config/admins';

// Vérifier si c'est un admin (par email)
if (isAdminEmail(user.email)) {
  console.log('✅ ADMIN détecté par email');
  toast.success('Bienvenue Admin !');
  navigate('/dashboard/admin');
  return;
}
```

### **3. src/components/ProtectedRoute.tsx**
```typescript
import { isAdminEmail } from '../config/admins';

// Vérifier si c'est un admin (pas de profil)
const isAdmin = isAdminEmail(user.email);

// Si c'est un admin, autoriser l'accès aux routes admin
if (isAdmin && allowedRoles?.includes('admin' as UserRole)) {
  return <>{children}</>;
}
```

---

## 📋 **VÉRIFICATION**

### **1. Vérifier les Utilisateurs dans Supabase**

```sql
-- Voir tous les utilisateurs
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;
```

### **2. Vérifier les Profils**

```sql
-- Voir tous les profils (admins n'apparaissent PAS ici)
SELECT 
  id,
  role,
  company_name,
  phone,
  created_at
FROM profiles
ORDER BY created_at DESC;
```

### **3. Tester la Connexion Admin**

1. Ouvrez la console du navigateur (F12)
2. Connectez-vous avec un email admin
3. Vous devriez voir :
   ```
   === DEBUG LOGIN ===
   User Email: admin@maroc2030.ma
   ✅ ADMIN détecté par email
   ```
4. Redirection vers `/dashboard/admin`

---

## ⚠️ **IMPORTANT**

### **Sécurité** :
- ✅ Les emails admin sont en dur dans le code
- ✅ Pas de profil = pas de données sensibles en base
- ✅ Seuls les emails autorisés peuvent accéder au dashboard admin

### **Ajout d'Admins** :
1. Créer le compte dans Supabase Auth
2. Ajouter l'email dans `src/config/admins.ts`
3. Redémarrer le serveur
4. ✅ L'admin peut se connecter

### **Suppression d'Admins** :
1. Retirer l'email de `src/config/admins.ts`
2. Redémarrer le serveur
3. ✅ L'utilisateur n'a plus accès admin

---

## 🎯 **EXEMPLE COMPLET**

### **Ajouter un nouvel admin** :

1. **Dans Supabase** :
   - Email : `nouvel.admin@maroc2030.ma`
   - Password : `MotDePasseSecurise123!`

2. **Dans `src/config/admins.ts`** :
   ```typescript
   export const ADMIN_EMAILS = [
     'admin@maroc2030.ma',
     'contact@maroc2030.ma',
     'nouvel.admin@maroc2030.ma',  // ← Nouveau
   ];
   ```

3. **Redémarrer** :
   ```bash
   Ctrl + C
   npm run dev
   ```

4. **Tester** :
   - Login avec `nouvel.admin@maroc2030.ma`
   - ✅ Accès au dashboard admin

---

## 🔍 **DÉPANNAGE**

### **Problème : Redirigé vers dashboard client**

**Cause** : Votre email n'est pas dans `ADMIN_EMAILS`

**Solution** :
1. Vérifiez `src/config/admins.ts`
2. Ajoutez votre email
3. Redémarrez le serveur

### **Problème : "User not found"**

**Cause** : Le compte n'existe pas dans Supabase

**Solution** :
1. Allez dans Supabase → Authentication → Users
2. Créez le compte
3. Réessayez de vous connecter

### **Problème : "Invalid login credentials"**

**Cause** : Mauvais mot de passe

**Solution** :
1. Vérifiez votre mot de passe
2. Ou réinitialisez-le dans Supabase

---

## ✅ **RÉSUMÉ**

### **Pour être admin** :
1. ✅ Compte créé dans Supabase Auth
2. ✅ Email dans `ADMIN_EMAILS`
3. ✅ PAS de profil dans la table `profiles`

### **Pour être partner** :
1. ✅ Compte créé dans Supabase Auth
2. ✅ Profil dans `profiles` avec `role = 'partner_*'`

### **Pour être client** :
1. ✅ Compte créé dans Supabase Auth
2. ✅ Profil dans `profiles` avec `role = 'client'`

---

**Ajoutez maintenant votre email dans `src/config/admins.ts` et reconnectez-vous !** 🚀
