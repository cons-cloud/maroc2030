# 🚀 Guide de Démarrage Rapide - Maroc 2030

## ⚡ En 5 minutes

### 1️⃣ Créer un compte Supabase (2 min)

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Créez un compte avec Google ou GitHub
4. Créez un nouveau projet :
   - Nom : `maroc-2030`
   - Mot de passe : (notez-le bien!)
   - Région : `Frankfurt` (Europe)

### 2️⃣ Configurer la base de données (1 min)

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Cliquez sur **New query**
3. Copiez tout le contenu du fichier `supabase-schema.sql`
4. Collez-le dans l'éditeur
5. Cliquez sur **Run** (en bas à droite)
6. Attendez le message "Success" ✅

### 3️⃣ Récupérer les clés API (30 sec)

1. Allez dans **Settings** (icône ⚙️) > **API**
2. Copiez ces 2 valeurs :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** : `eyJhbGc...` (longue clé)

### 4️⃣ Configurer le projet (1 min)

1. Ouvrez le terminal dans le dossier du projet
2. Créez le fichier `.env` :
```bash
cp .env.example .env
```

3. Ouvrez `.env` et remplacez :
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

4. Installez les dépendances :
```bash
npm install
```

### 5️⃣ Créer le compte admin (30 sec)

1. Dans Supabase, allez dans **Authentication** > **Users**
2. Cliquez sur **Add user** > **Create new user**
3. Remplissez :
   - Email : `admin@maroc2030.com`
   - Password : `Admin123!` (changez-le après!)
   - ✅ Auto Confirm User
4. Cliquez sur **Create user**

5. Dans **SQL Editor**, exécutez :
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@maroc2030.com';
```

### 6️⃣ Lancer l'application (10 sec)

```bash
npm run dev
```

Ouvrez votre navigateur sur : **http://localhost:5173** 🎉

---

## 🎯 Première connexion

### Se connecter en tant qu'Admin

1. Allez sur http://localhost:5173/login
2. Email : `admin@maroc2030.com`
3. Mot de passe : `Admin123!`
4. Vous êtes redirigé vers le **Dashboard Admin** ✨

### Créer un compte client

1. Allez sur http://localhost:5173/inscription
2. Remplissez le formulaire
3. Vous recevrez un email de confirmation
4. Connectez-vous et accédez au **Dashboard Client**

---

## 📋 Checklist de vérification

Avant de commencer à utiliser la plateforme, vérifiez que :

- [ ] Supabase est configuré
- [ ] Le fichier `.env` contient les bonnes clés
- [ ] Les tables sont créées (vérifiez dans Supabase > Table Editor)
- [ ] Le compte admin existe et a le rôle `admin`
- [ ] L'application démarre sans erreur
- [ ] Vous pouvez vous connecter

---

## 🎨 Prochaines étapes

### Pour l'Admin

1. **Créer un partenaire**
   - Dashboard Admin > Utilisateurs > Ajouter un partenaire
   - Choisir le type (Tourisme, Location voiture, Immobilier)
   - Envoyer les identifiants

2. **Gérer les services**
   - Voir tous les services ajoutés par les partenaires
   - Activer/désactiver des services
   - Mettre en avant des services

3. **Suivre les réservations**
   - Voir toutes les réservations en temps réel
   - Gérer les paiements
   - Répondre aux messages de contact

### Pour les Partenaires

1. **Configurer son profil**
   - Ajouter le logo de l'entreprise
   - Remplir les informations
   - Ajouter l'adresse et contacts

2. **Ajouter des services**
   - **Tourisme** : Circuits, excursions, forfaits
   - **Voitures** : Véhicules avec photos et tarifs
   - **Immobilier** : Appartements, villas, hôtels

3. **Gérer les réservations**
   - Confirmer les réservations
   - Voir le calendrier
   - Suivre les revenus

### Pour les Clients

1. **Explorer le site**
   - Parcourir les services disponibles
   - Filtrer par prix, date, localisation
   - Voir les avis

2. **Réserver**
   - Sélectionner un service
   - Choisir les dates
   - Payer en ligne (Stripe - à venir)

3. **Gérer ses réservations**
   - Voir l'historique
   - Annuler si nécessaire
   - Laisser des avis

---

## 🆘 Problèmes courants

### ❌ "Missing Supabase environment variables"

**Solution** :
- Vérifiez que le fichier `.env` existe
- Vérifiez que les variables commencent par `VITE_`
- Redémarrez le serveur : `Ctrl+C` puis `npm run dev`

### ❌ "relation 'profiles' does not exist"

**Solution** :
- Les tables ne sont pas créées
- Retournez dans Supabase SQL Editor
- Réexécutez le script `supabase-schema.sql`

### ❌ "Invalid login credentials"

**Solution** :
- Vérifiez l'email et le mot de passe
- Vérifiez que l'utilisateur existe dans Supabase Auth
- Vérifiez que le profil existe dans la table `profiles`

### ❌ Page blanche après connexion

**Solution** :
- Ouvrez la console du navigateur (F12)
- Vérifiez les erreurs
- Vérifiez que le rôle de l'utilisateur est correct

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- **SETUP_GUIDE.md** : Guide de configuration détaillé
- **ARCHITECTURE.md** : Architecture complète du projet
- **supabase-schema.sql** : Schéma de la base de données

---

## 🎉 Félicitations !

Votre plateforme Maroc 2030 est maintenant opérationnelle !

Vous pouvez maintenant :
- ✅ Gérer les utilisateurs et partenaires
- ✅ Ajouter des services (voitures, propriétés, circuits)
- ✅ Recevoir des réservations
- ✅ Suivre les statistiques

**Bon développement ! 🚀**

---

## 💡 Conseils

1. **Testez d'abord en local** avant de déployer
2. **Changez le mot de passe admin** immédiatement
3. **Faites des backups** réguliers de la base de données
4. **Activez l'authentification 2FA** sur Supabase
5. **Lisez la documentation** Supabase pour aller plus loin

---

## 📞 Besoin d'aide ?

- 📖 Documentation Supabase : [supabase.com/docs](https://supabase.com/docs)
- 💬 Discord Supabase : [discord.supabase.com](https://discord.supabase.com)
- 🐛 Issues GitHub : Créez une issue si vous trouvez un bug

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2024
