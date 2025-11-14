# ✅ Instructions Finales - Configuration Maroc 2030

## 🎯 Ce que vous devez faire MAINTENANT

Suivez ces étapes **dans l'ordre** pour configurer votre plateforme.

---

## 📝 Étape 1 : Créer le fichier .env (2 minutes)

### Via Terminal
```bash
cd /Users/jamilaaitbouchnani/Maroc-2030
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://tywnsgsufwxienpgbosm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d25zZ3N1Znd4aWVucGdib3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDgwMzAsImV4cCI6MjA3NzkyNDAzMH0.SF3e9LcYLBogVHJq2hTSFnfFJVb34xHIGS2HsYZxXM8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d25zZ3N1Znd4aWVucGdib3NtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0ODAzMCwiZXhwIjoyMDc3OTI0MDMwfQ.WqKLHfhkSKCFDPTtVPl59WYBba7b7KVs5VrApHyd2Rg
JWT_SECRET=syUFut/a6imCEAQBlCd88R5IzeQbxyvRFvRc4/tciGPdz/0xqjutrEybKDuM+7jD/eKR9FFzmwzG5MzgtgD+GA==
PORT=3001
NODE_ENV=development
VITE_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
EOF
```

### Via VS Code
1. Créez un nouveau fichier nommé `.env` à la racine
2. Copiez-collez ce contenu :

```env
VITE_SUPABASE_URL=https://tywnsgsufwxienpgbosm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d25zZ3N1Znd4aWVucGdib3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDgwMzAsImV4cCI6MjA3NzkyNDAzMH0.SF3e9LcYLBogVHJq2hTSFnfFJVb34xHIGS2HsYZxXM8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d25zZ3N1Znd4aWVucGdib3NtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0ODAzMCwiZXhwIjoyMDc3OTI0MDMwfQ.WqKLHfhkSKCFDPTtVPl59WYBba7b7KVs5VrApHyd2Rg
JWT_SECRET=syUFut/a6imCEAQBlCd88R5IzeQbxyvRFvRc4/tciGPdz/0xqjutrEybKDuM+7jD/eKR9FFzmwzG5MzgtgD+GA==
PORT=3001
NODE_ENV=development
VITE_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
```

3. Sauvegardez (Cmd+S)

---

## 🗄️ Étape 2 : Créer la base de données (5 minutes)

### 2.1 Aller sur Supabase
1. Ouvrez https://supabase.com/dashboard
2. Connectez-vous
3. Sélectionnez le projet **tywnsgsufwxienpgbosm**

### 2.2 Exécuter le schéma
1. Cliquez sur **SQL Editor** dans le menu de gauche
2. Cliquez sur **New query**
3. Ouvrez le fichier `supabase-schema.sql` dans votre éditeur
4. **Sélectionnez TOUT** (Cmd+A)
5. **Copiez** (Cmd+C)
6. **Collez** dans l'éditeur SQL de Supabase (Cmd+V)
7. Cliquez sur **Run** (bouton en bas à droite)
8. Attendez 10-20 secondes
9. Vous devriez voir **"Success. No rows returned"** ✅

---

## 👥 Étape 3 : Créer les comptes admin (3 minutes)

### 3.1 Créer les utilisateurs

1. Dans Supabase, allez dans **Authentication** > **Users**
2. Cliquez sur **Add user** (bouton vert en haut à droite)
3. Sélectionnez **Create new user**

**Premier admin :**
- Email : `maroc2031@gmail.com`
- Password : `Maroc2031@`
- ✅ **Cochez "Auto Confirm User"**
- Cliquez sur **Create user**

**Deuxième admin :**
- Répétez avec :
- Email : `maroc2032@gmail.com`
- Password : `Maroc2032@`
- ✅ **Cochez "Auto Confirm User"**
- Cliquez sur **Create user**

### 3.2 Mettre à jour les rôles

1. Retournez dans **SQL Editor**
2. Nouvelle requête
3. Copiez-collez ce code :

```sql
-- Mettre à jour les rôles admin
UPDATE profiles 
SET role = 'admin', 
    first_name = 'Admin',
    last_name = 'Maroc 2031',
    is_active = true
WHERE email = 'maroc2031@gmail.com';

UPDATE profiles 
SET role = 'admin',
    first_name = 'Admin', 
    last_name = 'Maroc 2032',
    is_active = true
WHERE email = 'maroc2032@gmail.com';

-- Vérifier
SELECT email, role, first_name, last_name 
FROM profiles 
WHERE email IN ('maroc2031@gmail.com', 'maroc2032@gmail.com');
```

4. Cliquez sur **Run**
5. Vous devriez voir les 2 comptes avec `role = admin` ✅

---

## ✅ Étape 4 : Vérifier la configuration (2 minutes)

1. Dans **SQL Editor**, nouvelle requête
2. Ouvrez le fichier `verify-setup.sql`
3. Copiez tout le contenu
4. Collez dans l'éditeur
5. Cliquez sur **Run**
6. Vérifiez que tous les statuts sont ✅

---

## 🚀 Étape 5 : Lancer l'application (1 minute)

```bash
# Dans le terminal
cd /Users/jamilaaitbouchnani/Maroc-2030
npm run dev
```

L'application sera sur : **http://localhost:5173**

---

## 🔐 Étape 6 : Tester la connexion (2 minutes)

### Test Admin 1
1. Allez sur http://localhost:5173/login
2. Email : `maroc2031@gmail.com`
3. Password : `Maroc2031@`
4. Cliquez sur **Se connecter**
5. ✅ Vous devriez voir le **Dashboard Admin**

### Test Admin 2
1. Déconnectez-vous (bouton en haut à droite)
2. Reconnectez-vous avec `maroc2032@gmail.com` / `Maroc2032@`
3. ✅ Vous devriez voir le **Dashboard Admin**

---

## 📋 Checklist finale

Cochez au fur et à mesure :

- [ ] Fichier `.env` créé avec les bonnes clés
- [ ] Script `supabase-schema.sql` exécuté avec succès
- [ ] 2 utilisateurs créés dans Supabase Auth
- [ ] Rôles mis à jour en 'admin'
- [ ] Script `verify-setup.sql` exécuté (tous ✅)
- [ ] Application lancée avec `npm run dev`
- [ ] Connexion avec `maroc2031@gmail.com` fonctionne
- [ ] Connexion avec `maroc2032@gmail.com` fonctionne
- [ ] Dashboard admin s'affiche correctement

---

## 🎉 C'est terminé !

Si toutes les cases sont cochées, **félicitations** ! 🎊

Votre plateforme Maroc 2030 est maintenant **100% opérationnelle** !

---

## 📚 Prochaines étapes

Maintenant que tout fonctionne, consultez :

1. **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Pour savoir quoi développer ensuite
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Pour comprendre l'architecture
3. **[CONFIGURATION_FINALE.md](./CONFIGURATION_FINALE.md)** - Pour plus de détails

---

## 🆘 En cas de problème

### Problème : "Missing Supabase environment variables"
✅ **Solution** : Le fichier `.env` n'existe pas ou est mal configuré
- Vérifiez que le fichier `.env` est à la racine du projet
- Vérifiez que les variables commencent par `VITE_`
- Redémarrez : `Ctrl+C` puis `npm run dev`

### Problème : "relation 'profiles' does not exist"
✅ **Solution** : Les tables ne sont pas créées
- Retournez dans Supabase SQL Editor
- Réexécutez `supabase-schema.sql`

### Problème : "Invalid login credentials"
✅ **Solution** : Le compte n'existe pas ou le rôle n'est pas bon
- Vérifiez dans Supabase > Authentication > Users
- Vérifiez que le rôle est 'admin' dans la table profiles
- Réexécutez `create-admin-accounts.sql`

### Problème : Page blanche après connexion
✅ **Solution** : Erreur JavaScript
- Ouvrez la console (F12)
- Vérifiez les erreurs
- Vérifiez que les clés Supabase sont correctes

---

## 🎯 Résumé des identifiants

### Comptes Admin (Dashboard Admin uniquement)
- **Admin 1** : `maroc2031@gmail.com` / `Maroc2031@`
- **Admin 2** : `maroc2032@gmail.com` / `Maroc2032@`

### URLs
- **Site public** : http://localhost:5173
- **Connexion** : http://localhost:5173/login
- **Dashboard Admin** : http://localhost:5173/dashboard/admin
- **Dashboard Partner** : http://localhost:5173/dashboard/partner
- **Dashboard Client** : http://localhost:5173/dashboard/client

### Supabase
- **Projet ID** : tywnsgsufwxienpgbosm
- **URL** : https://tywnsgsufwxienpgbosm.supabase.co
- **Dashboard** : https://supabase.com/dashboard/project/tywnsgsufwxienpgbosm

---

## 💡 Conseils

1. **Gardez les identifiants secrets** - Ne les partagez jamais
2. **Faites des backups** - Exportez régulièrement votre base de données
3. **Testez avant de déployer** - Assurez-vous que tout fonctionne localement
4. **Lisez la documentation** - Tous les fichiers `.md` contiennent des infos utiles

---

## 🚀 Bon développement !

Votre plateforme est prête. Il ne reste plus qu'à :
1. Créer des partenaires
2. Ajouter des services
3. Tester les réservations
4. Configurer les paiements
5. Déployer en production

**Vous avez tout ce qu'il faut pour réussir ! 💪**

---

**Questions ?** Consultez la documentation ou les ressources en ligne.

**Prêt à coder ?** Commencez par [NEXT_STEPS.md](./NEXT_STEPS.md) !

---

**Date** : Novembre 2024  
**Version** : 1.0.0  
**Statut** : ✅ Prêt à démarrer
