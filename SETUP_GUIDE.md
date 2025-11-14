# Guide de Configuration - Maroc 2030

Ce guide vous explique comment configurer votre plateforme de tourisme avec Supabase et tous les services nécessaires.

## 📋 Prérequis

- Node.js 18+ installé
- Un compte Supabase (gratuit)
- Un compte Stripe (pour les paiements)

## 🚀 Configuration de Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Donnez un nom à votre projet (ex: "maroc-2030")
5. Choisissez un mot de passe fort pour la base de données
6. Sélectionnez une région proche (ex: Frankfurt pour l'Europe)
7. Cliquez sur "Create new project"

### 2. Configurer la base de données

1. Une fois le projet créé, allez dans l'onglet **SQL Editor**
2. Ouvrez le fichier `supabase-schema.sql` de ce projet
3. Copiez tout le contenu du fichier
4. Collez-le dans l'éditeur SQL de Supabase
5. Cliquez sur **Run** pour exécuter le script
6. Attendez que toutes les tables soient créées (vous verrez "Success" en vert)

### 3. Récupérer les clés API

1. Allez dans **Settings** > **API**
2. Vous verrez deux clés importantes :
   - **Project URL** : Votre URL Supabase
   - **anon public** : Votre clé publique
   - **service_role** : Votre clé secrète (à garder privée!)

### 4. Configurer l'authentification

1. Allez dans **Authentication** > **Providers**
2. Activez **Email** (déjà activé par défaut)
3. Optionnel : Activez Google et Facebook OAuth si vous le souhaitez
4. Dans **Email Templates**, personnalisez les emails de confirmation

### 5. Configurer les politiques de sécurité (RLS)

Les politiques RLS (Row Level Security) sont déjà configurées dans le script SQL.
Vérifiez qu'elles sont bien actives :

1. Allez dans **Authentication** > **Policies**
2. Vous devriez voir toutes les tables avec leurs politiques

## 🔐 Configuration des variables d'environnement

### 1. Créer le fichier .env

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

### 2. Remplir les variables

Ouvrez le fichier `.env` et remplissez les valeurs :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# Stripe Configuration (optionnel pour l'instant)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# JWT Configuration
JWT_SECRET=un_secret_tres_long_et_aleatoire_ici

# Admin Credentials
ADMIN_EMAIL=admin@maroc2030.com
ADMIN_PASSWORD_HASH=hash_bcrypt_du_mot_de_passe

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Créer le compte admin

Pour créer le premier compte admin :

1. Allez dans Supabase > **Authentication** > **Users**
2. Cliquez sur **Add user** > **Create new user**
3. Email : `admin@maroc2030.com`
4. Mot de passe : Choisissez un mot de passe fort
5. Cliquez sur **Create user**

Ensuite, dans **SQL Editor**, exécutez :

```sql
-- Mettre à jour le rôle de l'utilisateur admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@maroc2030.com';
```

## 📦 Installation des dépendances

```bash
npm install
```

## 🎯 Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🔑 Connexion aux dashboards

### Dashboard Admin
- URL : `http://localhost:5173/login`
- Email : `admin@maroc2030.com`
- Mot de passe : Celui que vous avez défini

### Dashboard Partenaire
1. L'admin doit d'abord créer un compte partenaire
2. Aller dans le dashboard admin > Partenaires > Ajouter un partenaire
3. Le partenaire recevra ses identifiants par email

### Dashboard Client
- Les clients peuvent s'inscrire directement sur `/inscription`
- Ou se connecter sur `/login`

## 📊 Structure de la base de données

### Tables principales

- **profiles** : Tous les utilisateurs (admin, partenaires, clients)
- **partners** : Informations des partenaires
- **tourism_packages** : Circuits touristiques
- **cars** : Voitures de location
- **properties** : Appartements, villas, hôtels
- **events** : Événements
- **bookings** : Toutes les réservations
- **payments** : Tous les paiements
- **contact_messages** : Messages de contact
- **reviews** : Avis clients

## 🎨 Fonctionnalités implémentées

### ✅ Authentification
- Inscription / Connexion avec email
- Gestion des sessions
- Protection des routes
- Rôles utilisateurs (admin, partner, client)

### ✅ Dashboard Admin
- Vue d'ensemble des statistiques
- Gestion des utilisateurs
- Gestion des partenaires
- Gestion des réservations
- Gestion des paiements
- Messages de contact

### ✅ Dashboard Partenaire
- Gestion de ses services
- Ajout de voitures / propriétés / circuits
- Suivi des réservations
- Statistiques de performance

### ✅ Dashboard Client
- Vue de toutes ses réservations
- Historique des paiements
- Profil utilisateur
- Accès direct au site public

## 🔄 Prochaines étapes

### 1. Intégration des paiements Stripe
- Configurer Stripe
- Créer les webhooks
- Tester les paiements

### 2. Upload d'images
- Configurer Supabase Storage
- Permettre l'upload d'images pour les services

### 3. Notifications
- Emails de confirmation
- Notifications en temps réel

### 4. Recherche avancée
- Filtres par prix, date, localisation
- Recherche full-text

## 🆘 Dépannage

### Erreur "Missing Supabase environment variables"
- Vérifiez que le fichier `.env` existe
- Vérifiez que les variables commencent par `VITE_` pour être accessibles côté client

### Erreur de connexion à Supabase
- Vérifiez que l'URL et les clés sont correctes
- Vérifiez que le projet Supabase est actif

### Les tables n'existent pas
- Exécutez à nouveau le script `supabase-schema.sql`
- Vérifiez qu'il n'y a pas d'erreurs dans l'exécution

### Impossible de se connecter
- Vérifiez que l'utilisateur existe dans Supabase Auth
- Vérifiez que le profil existe dans la table `profiles`
- Vérifiez que le rôle est correct

## 📞 Support

Pour toute question ou problème :
1. Vérifiez d'abord ce guide
2. Consultez la documentation Supabase : [supabase.com/docs](https://supabase.com/docs)
3. Vérifiez les logs dans la console du navigateur

## 🎉 Félicitations !

Votre plateforme Maroc 2030 est maintenant configurée et prête à l'emploi !

Vous pouvez maintenant :
- Créer des partenaires
- Ajouter des services (voitures, propriétés, circuits)
- Permettre aux clients de réserver
- Gérer les paiements
- Suivre les statistiques

Bon développement ! 🚀
