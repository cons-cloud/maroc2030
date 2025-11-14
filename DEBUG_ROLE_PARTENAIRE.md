# 🔍 DEBUG : Redirection Partenaire

## ✅ Correction appliquée

La logique de redirection a été améliorée dans `/src/Pages/Login.tsx` :

```typescript
// AVANT (ne fonctionnait pas toujours)
if (userProfile?.role?.startsWith('partner')) {
  navigate('/dashboard/partner');
}

// APRÈS (fonctionne pour tous les cas)
const role = userProfile?.role?.toLowerCase() || '';

if (role === 'partner' || role.startsWith('partner_')) {
  toast.success('Bienvenue Partenaire !');
  navigate('/dashboard/partner');
}
```

---

## 🧪 Comment tester

### **1. Vérifier le rôle dans la base de données**

Dans Supabase SQL Editor, exécutez :

```sql
-- Voir tous les utilisateurs et leurs rôles
SELECT 
    id,
    email,
    role,
    company_name,
    created_at
FROM profiles
ORDER BY created_at DESC;
```

**Résultat attendu pour un partenaire** :
```
role: 'partner'  ✅
OU
role: 'partner_hotel'  ✅
OU
role: 'partner_voiture'  ✅
```

---

### **2. Vérifier dans la console du navigateur**

Lors de la connexion, ouvrez la console (F12) et regardez les logs :

```
=== DEBUG LOGIN ===
User ID: xxx-xxx-xxx
User Email: partenaire@example.com
Profile: { id: "xxx", role: "partner", ... }
Profile Role: partner
✅ Redirection vers PARTNER dashboard
```

---

## 🔧 Si ça ne fonctionne toujours pas

### **Problème 1 : Le rôle n'est pas 'partner'**

**Solution** : Mettre à jour le rôle dans Supabase :

```sql
-- Mettre à jour le rôle d'un utilisateur
UPDATE profiles 
SET role = 'partner'
WHERE email = 'votre-email-partenaire@example.com';
```

---

### **Problème 2 : Le profil n'existe pas**

**Solution** : Créer le profil :

```sql
-- Vérifier si le profil existe
SELECT * FROM profiles WHERE email = 'votre-email@example.com';

-- Si pas de résultat, créer le profil
INSERT INTO profiles (id, email, role, company_name)
VALUES (
    'user-id-from-auth',
    'votre-email@example.com',
    'partner',
    'Nom de votre entreprise'
);
```

---

### **Problème 3 : RLS bloque l'accès au profil**

**Solution** : Vérifier que le script RLS a été exécuté :

```sql
-- Vérifier les politiques sur profiles
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```

**Résultat attendu** :
```
✅ Users can view own profile | SELECT
✅ Users can update own profile | UPDATE
✅ Admins can view all profiles | SELECT
```

Si pas de politiques, exécutez `/supabase/FIX_RECURSION_RLS.sql`

---

## 📊 Valeurs de rôle acceptées

| Rôle dans la DB | Redirection |
|-----------------|-------------|
| `'partner'` | ✅ Dashboard Partner |
| `'partner_hotel'` | ✅ Dashboard Partner |
| `'partner_voiture'` | ✅ Dashboard Partner |
| `'partner_immobilier'` | ✅ Dashboard Partner |
| `'client'` | ✅ Dashboard Client |
| `'admin'` | ✅ Dashboard Admin (via email) |

---

## 🎯 Test complet

### **Étape 1 : Vérifier le rôle**
```sql
SELECT email, role FROM profiles WHERE email = 'VOTRE_EMAIL';
```

### **Étape 2 : Se connecter**
1. Aller sur `/login`
2. Entrer vos identifiants partenaire
3. Ouvrir la console (F12)
4. Regarder les logs

### **Étape 3 : Vérifier la redirection**
- ✅ Vous devez voir : "Bienvenue Partenaire !"
- ✅ Vous devez être sur : `/dashboard/partner`

---

## 🚨 Si le problème persiste

### **Logs à vérifier** :

1. **Console navigateur** (F12) :
```
Profile Role: [QUELLE VALEUR ?]
```

2. **Supabase** :
```sql
SELECT * FROM profiles WHERE email = 'VOTRE_EMAIL';
```

3. **AuthContext** :
Vérifiez que le profil est bien chargé dans le contexte.

---

## ✅ Checklist de débogage

- [ ] Le rôle dans la DB est bien `'partner'` (ou `'partner_*'`)
- [ ] Le profil existe dans la table `profiles`
- [ ] RLS est configuré correctement
- [ ] La console affiche "Redirection vers PARTNER dashboard"
- [ ] Le toast "Bienvenue Partenaire !" s'affiche
- [ ] L'URL change vers `/dashboard/partner`

---

## 📞 Commandes utiles

### **Voir tous les partenaires** :
```sql
SELECT email, role, company_name 
FROM profiles 
WHERE role LIKE 'partner%';
```

### **Changer un client en partenaire** :
```sql
UPDATE profiles 
SET role = 'partner', 
    company_name = 'Nom Entreprise'
WHERE email = 'email@example.com';
```

### **Créer un compte partenaire de test** :
```sql
-- 1. Créer l'utilisateur dans Auth (via interface Supabase)
-- 2. Puis créer le profil :
INSERT INTO profiles (id, email, role, company_name, phone)
VALUES (
    'uuid-from-auth-users',
    'test-partner@example.com',
    'partner',
    'Test Hotel',
    '+212600000000'
);
```

---

**Avec ces corrections, la redirection vers le dashboard partenaire devrait fonctionner !** ✅
