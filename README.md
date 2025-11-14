# 🇲🇦 Maroc 2030 - Plateforme Complète de Tourisme et Services

Plateforme web moderne et complète pour les services de voyage au Maroc avec système de réservation, paiement en ligne, et dashboards pour admin, partenaires et clients.

## ✨ Fonctionnalités Principales

### 🌐 Site Public
- 🏠 Location d'appartements, villas et hôtels
- 🚗 Location de voitures
- ✈️ Circuits touristiques et excursions
- 🎉 Événements et activités
- 📢 Annonces et promotions
- 📞 Formulaire de contact

### 👨‍💼 Dashboard Admin
- Gestion complète des utilisateurs
- Création et gestion des partenaires
- Vue d'ensemble des réservations
- Gestion des paiements
- Messages de contact
- Statistiques détaillées

### 🤝 Dashboard Partenaire
- Ajout et gestion de services (voitures, propriétés, circuits)
- Suivi des réservations
- Statistiques de performance
- Gestion du profil d'entreprise

### 👤 Dashboard Client
- Réservation de services
- Historique des réservations
- Gestion des paiements
- Profil utilisateur

## 🚀 Technologies Utilisées

### Frontend
- **React 19** avec TypeScript
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS 4** - Framework CSS utility-first
- **React Router 7** - Navigation et routing
- **Framer Motion** - Animations fluides
- **React Hot Toast** - Notifications élégantes
- **Lucide React** - Icônes modernes

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
- **Stripe** - Paiements en ligne (à intégrer)

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn** ou **pnpm**
- Un compte **Supabase** (gratuit)

### Installation en 5 minutes

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd Maroc-2030

# 2. Installer les dépendances
npm install

# 3. Configurer Supabase (voir QUICK_START.md)
cp .env.example .env
# Remplir les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 4. Créer la base de données
# Exécuter supabase-schema.sql dans Supabase SQL Editor

# 5. Démarrer l'application
npm run dev
```

📖 **Guide détaillé** : Consultez [QUICK_START.md](./QUICK_START.md) pour un guide pas à pas complet.

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Démarrage en 5 minutes
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Guide de configuration complet
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture détaillée du projet
- **[supabase-schema.sql](./supabase-schema.sql)** - Schéma de la base de données

## 🛠️ Scripts Disponibles

```bash
# Développement (avec hot reload)
npm run dev

# Build de production
npm run build

# Prévisualiser le build de production
npm run preview

# Linter le code
npm run lint
```

## 📁 Structure du Projet

```
Maroc-2030/
├── public/                    # Assets statiques
│   └── assets/               # Images et médias
├── src/
│   ├── Pages/
│   │   ├── Home.tsx          # Page d'accueil
│   │   ├── Services.tsx      # Page des services
│   │   ├── Contact.tsx       # Formulaire de contact
│   │   ├── Login.tsx         # ✨ Page de connexion
│   │   ├── Inscription.tsx   # ✨ Page d'inscription
│   │   ├── services/         # Sous-pages de services
│   │   │   ├── Tourisme.tsx
│   │   │   ├── Voitures.tsx
│   │   │   ├── Appartements.tsx
│   │   │   ├── Villas.tsx
│   │   │   └── Hotels.tsx
│   │   └── dashboards/       # ✨ Dashboards
│   │       ├── AdminDashboard.tsx
│   │       ├── PartnerDashboard.tsx
│   │       └── ClientDashboard.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── DashboardLayout.tsx    # ✨ Layout des dashboards
│   │   ├── ProtectedRoute.tsx     # ✨ Protection des routes
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx        # ✨ Contexte d'authentification
│   ├── lib/
│   │   └── supabase.ts            # ✨ Configuration Supabase
│   ├── App.tsx
│   └── main.tsx
├── supabase-schema.sql            # ✨ Schéma de la base de données
├── .env.example                   # ✨ Variables d'environnement
├── QUICK_START.md                 # ✨ Guide de démarrage rapide
├── SETUP_GUIDE.md                 # ✨ Guide de configuration
├── ARCHITECTURE.md                # ✨ Architecture du projet
└── package.json
```

✨ = Nouveaux fichiers ajoutés pour le backend et les dashboards

## 🎨 Personnalisation

### Couleurs

Les couleurs personnalisées sont définies dans `tailwind.config.js` :

- **Primary** : Bleu (#0ea5e9)
- **Secondary** : Violet (#8b5cf6)
- **Success** : Vert (#22c55e)
- **Warning** : Orange (#f59e0b)
- **Error** : Rouge (#ef4444)

### Police

Les polices sont configurées avec Google Fonts :
- **Inter** : Police principale
- **Poppins** : Police de titre
- **Scheherazade New** : Police pour l'arabe

## 🌐 Routes Disponibles

### Routes Publiques
- `/` - Accueil
- `/services` - Page principale des services
  - `/services/appartements` - Location d'appartements
  - `/services/tourisme` - Services touristiques
  - `/services/voitures` - Location de voitures
  - `/services/villas` - Location de villas
  - `/services/hotels` - Réservation d'hôtels
- `/evenements` - Événements au Maroc
- `/annonces` - Annonces
- `/apropos` - À propos
- `/contact` - Contact

### Routes d'Authentification
- `/inscription` - ✨ Inscription
- `/login` - ✨ Connexion

### Routes Protégées (Dashboards)
- `/dashboard/admin` - ✨ Dashboard Administrateur
- `/dashboard/partner` - ✨ Dashboard Partenaire
- `/dashboard/client` - ✨ Dashboard Client

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`.

### Déploiement sur Vercel, Netlify, ou autre plateforme

1. Connectez votre repository GitHub
2. Configurez la commande de build : `npm run build`
3. Définissez le dossier de sortie : `dist`
4. Déployez !

## 📝 Notes Importantes

- Assurez-vous que Node.js version 18+ est installé
- Le projet utilise React 19 (version récente)
- TypeScript est configuré en mode strict
- Les images sont optimisées pour le web
- Le lazy loading est activé pour les routes

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre feature
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👤 Auteur

**Maroc 2030** - Plateforme de services touristiques au Maroc
