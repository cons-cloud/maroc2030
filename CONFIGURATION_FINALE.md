# 🚀 Configuration Finale - Maroc 2030

## ✅ Vos identifiants Supabase

Vous avez fourni vos identifiants Supabase. Voici comment les configurer.

---

## 📝 Étape 1 : Créer le fichier .env

**Créez un fichier `.env`** à la racine du projet avec ce contenu :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tywnsgsufwxienpgbosm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d25zZ3N1Znd4aWVucGdib3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDgwMzAsImV4cCI6MjA3NzkyNDAzMH0.SF3e9LcYLBogVHJq2hTSFnfFJVb34xHIGS2HsYZxXM8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d25zZ3N1Znd4aWVucGdib3NtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0ODAzMCwiZXhwIjoyMDc3OTI0MDMwfQ.WqKLHfhkSKCFDPTtVPl59WYBba7b7KVs5VrApHyd2Rg

# Stripe Configuration (à configurer plus tard)
VITE_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=

# JWT Configuration
JWT_SECRET=syUFut/a6imCEAQBlCd88R5IzeQbxyvRFvRc4/tciGPdz/0xqjutrEybKDuM+7jD/eKR9FFzmwzG5MzgtgD+GA==

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Comment créer le fichier .env

**Option 1 : Via Terminal**
```bash
cd /Users/jamilaaitbouchnani/Maroc-2030
touch .env
open .env
# Collez le contenu ci-dessus et sauvegardez
```

**Option 2 : Via VS Code**
1. Clic droit dans l'explorateur de fichiers
2. "New File"
3. Nommez-le `.env`
4. Collez le contenu ci-dessus
5. Sauvegardez

---

## 🗄️ Étape 2 : Créer la base de données

### 2.1 Exécuter le schéma principal

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet `tywnsgsufwxienpgbosm`
3. Allez dans **SQL Editor** (icône de base de données)
4. Cliquez sur **New query**
5. Ouvrez le fichier `supabase-schema.sql` de votre projet
6. **Copiez TOUT le contenu** (Ctrl+A, Ctrl+C)
7. **Collez** dans l'éditeur SQL de Supabase
8. Cliquez sur **Run** (en bas à droite)
9. Attendez le message **"Success. No rows returned"** ✅

**Cela va créer :**
- 16 tables
- Tous les indexes
- Tous les triggers
- Toutes les politiques RLS

---

## 👥 Étape 3 : Créer les comptes admin

Vous avez 2 comptes admin à créer :
1. `maroc2031@gmail.com` / `Maroc2031@`
2. `maroc2032@gmail.com` / `Maroc2032@`

### Méthode recommandée (la plus simple)

#### 3.1 Créer les utilisateurs dans Supabase Auth

1. Dans Supabase Dashboard, allez dans **Authentication** > **Users**
2. Cliquez sur **Add user** > **Create new user**

**Pour le premier admin :**
- Email : `maroc2031@gmail.com`
- Password : `Maroc2031@`
- ✅ Cochez **Auto Confirm User**
- Cliquez sur **Create user**

**Pour le deuxième admin :**
- Email : `maroc2032@gmail.com`
- Password : `Maroc2032@`
- ✅ Cochez **Auto Confirm User**
- Cliquez sur **Create user**

#### 3.2 Mettre à jour les rôles

1. Retournez dans **SQL Editor**
2. Ouvrez le fichier `create-admin-accounts.sql`
3. Copiez ces lignes :

```sql
-- Mettre à jour le rôle pour maroc2031@gmail.com
UPDATE profiles 
SET role = 'admin', 
    first_name = 'Admin',
    last_name = 'Maroc 2031',
    is_active = true
WHERE email = 'maroc2031@gmail.com';

-- Mettre à jour le rôle pour maroc2032@gmail.com
UPDATE profiles 
SET role = 'admin',
    first_name = 'Admin', 
    last_name = 'Maroc 2032',
    is_active = true
WHERE email = 'maroc2032@gmail.com';

-- Vérifier que tout est OK
SELECT id, email, role, first_name, last_name, is_active
FROM profiles
WHERE email IN ('maroc2031@gmail.com', 'maroc2032@gmail.com');
```

4. Collez dans l'éditeur SQL
5. Cliquez sur **Run**
6. Vous devriez voir les 2 comptes avec `role = 'admin'` ✅

---

## 🚀 Étape 4 : Lancer l'application

```bash
# Dans le terminal, à la racine du projet
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

---

## 🔐 Étape 5 : Tester la connexion

### Test 1 : Connexion Admin 1

1. Allez sur http://localhost:5173/login
2. Email : `maroc2031@gmail.com`
3. Mot de passe : `Maroc2031@`
4. Cliquez sur **Se connecter**
5. Vous devriez être redirigé vers `/dashboard/admin` ✅

### Test 2 : Connexion Admin 2

1. Déconnectez-vous
2. Reconnectez-vous avec :
   - Email : `maroc2032@gmail.com`
   - Mot de passe : `Maroc2032@`
3. Vous devriez accéder au dashboard admin ✅

### Test 3 : Inscription Client

1. Allez sur http://localhost:5173/inscription
2. Créez un compte client
3. Vous devriez être redirigé vers `/dashboard/client` ✅

---

## ✅ Vérifications

### Vérifier que tout fonctionne

- [ ] Le fichier `.env` est créé avec les bonnes clés
- [ ] Les tables sont créées dans Supabase
- [ ] Les 2 comptes admin existent
- [ ] Les 2 comptes admin ont le rôle 'admin'
- [ ] L'application démarre sans erreur
- [ ] La connexion admin fonctionne
- [ ] Le dashboard admin s'affiche correctement

---

## 🎯 Accès aux dashboards

### Dashboard Admin
- **URL** : http://localhost:5173/dashboard/admin
- **Accès** : Uniquement `maroc2031@gmail.com` et `maroc2032@gmail.com`
- **Fonctionnalités** :
  - Voir tous les utilisateurs
  - Gérer les partenaires
  - Voir toutes les réservations
  - Gérer les paiements
  - Lire les messages de contact
  - Statistiques globales

### Dashboard Partenaire
- **URL** : http://localhost:5173/dashboard/partner
- **Accès** : Comptes avec rôle 'partner' (à créer par l'admin)
- **Fonctionnalités** :
  - Ajouter des services
  - Gérer ses réservations
  - Suivre ses revenus

### Dashboard Client
- **URL** : http://localhost:5173/dashboard/client
- **Accès** : Tous les utilisateurs inscrits
- **Fonctionnalités** :
  - Voir ses réservations
  - Gérer son profil
  - Historique des paiements

---

## 🔒 Sécurité des comptes admin

### Important

- ✅ Ces 2 comptes ont **uniquement** accès au dashboard admin
- ✅ Ils **ne peuvent pas** accéder aux dashboards partenaire ou client
- ✅ Ils ont tous les droits sur la plateforme
- ✅ Gardez ces identifiants **secrets**
- ✅ Ne les partagez **jamais** publiquement

### Politiques RLS

Les politiques de sécurité sont configurées pour :
- Seuls les admins peuvent voir tous les utilisateurs
- Seuls les admins peuvent créer des partenaires
- Seuls les admins peuvent voir tous les paiements
- Les partenaires ne voient que leurs propres données
- Les clients ne voient que leurs propres réservations

---

## 🆘 Dépannage

### Erreur "Missing Supabase environment variables"

**Solution** :
- Vérifiez que le fichier `.env` existe
- Vérifiez que les variables commencent par `VITE_`
- Redémarrez le serveur : `Ctrl+C` puis `npm run dev`

### Erreur "relation 'profiles' does not exist"

**Solution** :
- Les tables ne sont pas créées
- Retournez dans Supabase SQL Editor
- Réexécutez le script `supabase-schema.sql`

### Erreur "Invalid login credentials"

**Solution** :
- Vérifiez l'email et le mot de passe
- Vérifiez que l'utilisateur existe dans Supabase Auth
- Vérifiez que le profil existe dans la table `profiles`
- Vérifiez que le rôle est 'admin'

### Page blanche après connexion

**Solution** :
- Ouvrez la console du navigateur (F12)
- Vérifiez les erreurs
- Vérifiez que le rôle de l'utilisateur est correct
- Vérifiez que les clés Supabase sont correctes dans `.env`

---

## 📊 Prochaines étapes

Une fois que tout fonctionne :

1. **Créer des partenaires** depuis le dashboard admin
2. **Ajouter des services** (voitures, propriétés, circuits)
3. **Configurer Stripe** pour les paiements
4. **Ajouter l'upload d'images** avec Supabase Storage
5. **Tester les réservations**

Consultez [NEXT_STEPS.md](./NEXT_STEPS.md) pour plus de détails.

---

## 🎉 Félicitations !

Si vous avez suivi toutes les étapes, votre plateforme Maroc 2030 est maintenant **opérationnelle** !

Vous pouvez :
- ✅ Vous connecter en tant qu'admin
- ✅ Gérer la plateforme
- ✅ Créer des partenaires
- ✅ Suivre les statistiques

**Bon développement ! 🚀**

---

## 📞 Besoin d'aide ?

- Consultez [START_HERE.md](./START_HERE.md)
- Consultez [QUICK_START.md](./QUICK_START.md)
- Consultez [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Documentation Supabase : https://supabase.com/docs

---

**Dernière mise à jour** : Novembre 2024  
**Version** : 1.0.0  
**Statut** : ✅ Prêt à démarrer
