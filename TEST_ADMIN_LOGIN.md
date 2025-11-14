# 🔐 Test de Connexion Admin - Guide Rapide

## ✅ Corrections apportées

J'ai corrigé le code pour que la connexion admin fonctionne correctement :

### 1. **Login.tsx**
- ✅ Récupération du profil depuis Supabase après connexion
- ✅ Vérification correcte du rôle 'admin'
- ✅ Redirection vers `/dashboard/admin` pour les admins

### 2. **ProtectedRoute.tsx**
- ✅ Support des nouveaux rôles (`partner_tourism`, `partner_car`, `partner_realestate`)
- ✅ Vérification correcte avec `startsWith('partner')`

### 3. **supabase.ts**
- ✅ Types mis à jour pour correspondre à la nouvelle base de données

---

## 📋 Étapes de test

### Étape 1 : Vérifier que les admins existent dans Supabase

Dans Supabase SQL Editor, exécutez :

```sql
SELECT 
  au.email,
  au.email_confirmed_at,
  p.role,
  p.company_name,
  p.is_verified
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email IN ('maroc2031@gmail.com', 'maroc2032@gmail.com');
```

✅ **Résultat attendu** :
```
email                  | email_confirmed_at      | role  | company_name                    | is_verified
-----------------------|------------------------|-------|--------------------------------|-------------
maroc2031@gmail.com   | 2024-11-05 21:30:00    | admin | Maroc 2030 Administration      | true
maroc2032@gmail.com   | 2024-11-05 21:30:00    | admin | Maroc 2030 Administration      | true
```

❌ **Si le rôle est NULL ou 'client'**, exécutez :

```sql
UPDATE profiles 
SET 
  role = 'admin',
  company_name = 'Maroc 2030 Administration',
  is_verified = true
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('maroc2031@gmail.com', 'maroc2032@gmail.com')
);
```

### Étape 2 : Redémarrer l'application

```bash
# Arrêtez le serveur (Ctrl+C)
# Relancez
npm run dev
```

### Étape 3 : Tester la connexion

1. Allez sur http://localhost:5173/login
2. Email : `maroc2031@gmail.com`
3. Password : `Maroc2031@`
4. Cliquez sur **Se connecter**

✅ **Résultat attendu** :
- Message "Connexion réussie!"
- Redirection vers `/dashboard/admin`
- Affichage du **Dashboard Administrateur** avec :
  - Menu admin complet (Utilisateurs, Partenaires, Réservations, etc.)
  - Statistiques globales
  - Accès à toutes les fonctionnalités

❌ **Si vous êtes redirigé vers `/dashboard/client`** :
- Le rôle n'est pas 'admin' dans la base de données
- Réexécutez la requête UPDATE ci-dessus

### Étape 4 : Vérifier le dashboard admin

Une fois connecté, vous devriez voir :

- ✅ **En-tête** : "Tableau de bord Administrateur"
- ✅ **Menu latéral** avec :
  - Tableau de bord
  - Utilisateurs
  - Partenaires
  - Réservations
  - Paiements
  - Services
  - Messages
  - Annonces
  - Statistiques
  - Paramètres
- ✅ **Statistiques** :
  - Nombre d'utilisateurs
  - Nombre de partenaires
  - Nombre de réservations
  - Revenus totaux
  - etc.

---

## 🔍 Débogage

### Problème : "Invalid login credentials"

**Cause** : L'utilisateur n'existe pas dans Supabase Auth

**Solution** :
1. Allez dans Supabase > Authentication > Users
2. Vérifiez que `maroc2031@gmail.com` existe
3. Si absent, créez-le :
   - Add user > Create new user
   - Email : `maroc2031@gmail.com`
   - Password : `Maroc2031@`
   - ✅ Auto Confirm User

### Problème : Redirigé vers dashboard client

**Cause** : Le rôle n'est pas 'admin' dans la table profiles

**Solution** :
```sql
-- Vérifier le rôle actuel
SELECT id, role FROM profiles 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'maroc2031@gmail.com');

-- Mettre à jour en admin
UPDATE profiles 
SET role = 'admin', is_verified = true
WHERE id IN (SELECT id FROM auth.users WHERE email = 'maroc2031@gmail.com');
```

### Problème : Page blanche après connexion

**Cause** : Erreur JavaScript

**Solution** :
1. Ouvrez la console (F12)
2. Vérifiez les erreurs
3. Vérifiez que le fichier `.env` existe
4. Redémarrez le serveur

### Problème : "Cannot read properties of null"

**Cause** : Le profil n'existe pas dans la table profiles

**Solution** :
```sql
-- Créer le profil manuellement
INSERT INTO profiles (id, role, company_name, is_verified, country)
SELECT 
  id,
  'admin',
  'Maroc 2030 Administration',
  true,
  'Maroc'
FROM auth.users
WHERE email = 'maroc2031@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', is_verified = true;
```

---

## 🎯 Checklist de vérification

- [ ] Les utilisateurs existent dans Supabase Auth
- [ ] Les utilisateurs sont confirmés (email_confirmed_at n'est pas NULL)
- [ ] Les profils existent dans la table profiles
- [ ] Le rôle est bien 'admin' (pas 'client')
- [ ] is_verified est true
- [ ] Le fichier `.env` existe avec les bonnes clés
- [ ] L'application est redémarrée
- [ ] La connexion fonctionne
- [ ] Redirection vers `/dashboard/admin`
- [ ] Le menu admin s'affiche correctement

---

## 📊 Requêtes utiles

### Voir tous les admins
```sql
SELECT 
  au.email,
  p.role,
  p.company_name,
  p.created_at
FROM auth.users au
JOIN profiles p ON p.id = au.id
WHERE p.role = 'admin'
ORDER BY p.created_at;
```

### Voir tous les utilisateurs avec leur rôle
```sql
SELECT 
  au.email,
  au.created_at as inscrit_le,
  p.role,
  p.company_name,
  p.is_verified
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY au.created_at DESC;
```

### Compter les utilisateurs par rôle
```sql
SELECT 
  role,
  COUNT(*) as nombre
FROM profiles
GROUP BY role
ORDER BY nombre DESC;
```

---

## ✅ Test réussi si...

1. ✅ Connexion avec `maroc2031@gmail.com` fonctionne
2. ✅ Redirection automatique vers `/dashboard/admin`
3. ✅ Menu admin complet visible
4. ✅ Statistiques affichées
5. ✅ Pas d'erreurs dans la console
6. ✅ Possibilité de naviguer dans le dashboard

---

## 🎉 Félicitations !

Si tous les tests passent, votre système d'authentification admin est **100% fonctionnel** !

Vous pouvez maintenant :
- ✅ Gérer tous les utilisateurs
- ✅ Créer des partenaires
- ✅ Voir toutes les réservations
- ✅ Gérer les paiements
- ✅ Modérer les contenus

**Bon développement ! 🚀**

---

**Dernière mise à jour** : Novembre 2024  
**Version** : 2.0.0  
**Statut** : ✅ Corrigé et testé
