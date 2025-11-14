# Architecture du Projet Maroc 2030

## 🏗️ Vue d'ensemble

Maroc 2030 est une plateforme complète de tourisme et de réservation comprenant :
- Un site web public pour les visiteurs
- Un dashboard admin pour la gestion globale
- Un dashboard partenaire pour la gestion des services
- Un dashboard client pour la gestion des réservations

## 📁 Structure du projet

```
maroc-2030/
├── src/
│   ├── Pages/
│   │   ├── Home.tsx                    # Page d'accueil
│   │   ├── Services.tsx                # Page des services
│   │   ├── Contact.tsx                 # Page de contact
│   │   ├── Login.tsx                   # Page de connexion
│   │   ├── Inscription.tsx             # Page d'inscription
│   │   ├── services/
│   │   │   ├── Tourisme.tsx           # Circuits touristiques
│   │   │   ├── Voitures.tsx           # Location de voitures
│   │   │   ├── Appartements.tsx       # Location d'appartements
│   │   │   ├── Villas.tsx             # Location de villas
│   │   │   └── Hotels.tsx             # Réservation d'hôtels
│   │   └── dashboards/
│   │       ├── AdminDashboard.tsx     # Dashboard administrateur
│   │       ├── PartnerDashboard.tsx   # Dashboard partenaire
│   │       └── ClientDashboard.tsx    # Dashboard client
│   ├── components/
│   │   ├── Navbar.tsx                 # Barre de navigation
│   │   ├── Footer.tsx                 # Pied de page
│   │   ├── DashboardLayout.tsx        # Layout des dashboards
│   │   ├── ProtectedRoute.tsx         # Protection des routes
│   │   └── ...                        # Autres composants
│   ├── contexts/
│   │   └── AuthContext.tsx            # Contexte d'authentification
│   ├── lib/
│   │   └── supabase.ts                # Configuration Supabase
│   ├── App.tsx                        # Composant principal
│   └── main.tsx                       # Point d'entrée
├── supabase-schema.sql                # Schéma de la base de données
├── .env.example                       # Variables d'environnement exemple
├── SETUP_GUIDE.md                     # Guide de configuration
└── package.json                       # Dépendances

```

## 🗄️ Base de données Supabase

### Tables principales

#### 1. **profiles**
Stocke tous les utilisateurs (admin, partenaires, clients)
```sql
- id (UUID, PK)
- email (TEXT)
- role (user_role: admin, partner, client)
- first_name, last_name, phone
- avatar_url
- is_active
```

#### 2. **partners**
Informations des partenaires (agences)
```sql
- id (UUID, PK)
- user_id (FK -> profiles)
- partner_type (tourism, car_rental, real_estate)
- company_name, company_description
- company_logo, address, city
- is_verified, is_active
```

#### 3. **tourism_packages**
Circuits et forfaits touristiques
```sql
- id (UUID, PK)
- partner_id (FK -> partners)
- title, description, destination
- duration_days, price_per_person
- max_participants
- includes[], excludes[], images[]
- is_active, featured
```

#### 4. **cars**
Véhicules de location
```sql
- id (UUID, PK)
- partner_id (FK -> partners)
- brand, model, year
- category, transmission, fuel_type
- seats, doors, price_per_day
- features[], images[]
- is_available, is_active
```

#### 5. **properties**
Propriétés (appartements, villas, hôtels)
```sql
- id (UUID, PK)
- partner_id (FK -> partners)
- property_type (apartment, villa, hotel)
- title, description, address, city
- bedrooms, bathrooms, max_guests
- price_per_night
- amenities[], images[]
- is_available, is_active
```

#### 6. **events**
Événements et activités
```sql
- id (UUID, PK)
- partner_id (FK -> partners)
- title, description, event_type
- location, start_date, end_date
- price, max_attendees
- images[]
```

#### 7. Tables de réservations
- **tourism_bookings** : Réservations de circuits
- **car_bookings** : Réservations de voitures
- **property_bookings** : Réservations de propriétés
- **event_bookings** : Réservations d'événements

#### 8. **payments**
Tous les paiements
```sql
- id (UUID, PK)
- user_id (FK -> profiles)
- booking_type, booking_id
- amount, currency
- payment_method, payment_status
- stripe_payment_intent_id
```

#### 9. **contact_messages**
Messages du formulaire de contact
```sql
- id (UUID, PK)
- first_name, last_name, email
- subject, message
- is_read, replied_at
```

#### 10. **reviews**
Avis et commentaires clients
```sql
- id (UUID, PK)
- user_id (FK -> profiles)
- booking_type, booking_id
- rating (1-5), comment
- is_approved
```

## 🔐 Système d'authentification

### Flow d'authentification

1. **Inscription** (`/inscription`)
   - L'utilisateur crée un compte avec email/mot de passe
   - Supabase Auth crée l'utilisateur
   - Un profil est automatiquement créé dans la table `profiles`
   - Rôle par défaut : `client`

2. **Connexion** (`/login`)
   - L'utilisateur se connecte avec email/mot de passe
   - Supabase Auth vérifie les credentials
   - Le profil est chargé depuis la table `profiles`
   - Redirection selon le rôle :
     - Admin → `/dashboard/admin`
     - Partner → `/dashboard/partner`
     - Client → `/dashboard/client`

3. **Protection des routes**
   - Composant `ProtectedRoute` vérifie l'authentification
   - Vérifie les rôles autorisés
   - Redirige si non autorisé

### Rôles utilisateurs

#### 👨‍💼 Admin
- **Accès** : Dashboard admin complet
- **Permissions** :
  - Gérer tous les utilisateurs
  - Créer/modifier/supprimer des partenaires
  - Voir toutes les réservations
  - Gérer tous les paiements
  - Voir les messages de contact
  - Gérer les annonces
  - Accès aux statistiques globales

#### 🤝 Partner (Partenaire)
- **Accès** : Dashboard partenaire
- **Permissions** :
  - Gérer ses propres services (ajouter/modifier/supprimer)
  - Voir ses réservations
  - Voir ses revenus
  - Créer des annonces
  - Gérer son profil d'entreprise

#### 👤 Client
- **Accès** : Dashboard client + Site public
- **Permissions** :
  - Réserver des services
  - Voir ses réservations
  - Voir ses paiements
  - Laisser des avis
  - Gérer son profil

## 🎨 Dashboards

### Dashboard Admin

**URL** : `/dashboard/admin`

**Fonctionnalités** :
- 📊 Vue d'ensemble avec statistiques
- 👥 Gestion des utilisateurs
- 🤝 Gestion des partenaires (création, activation, désactivation)
- 📅 Gestion des réservations (toutes)
- 💳 Gestion des paiements
- 📦 Gestion des services
- 💬 Messages de contact
- 📢 Gestion des annonces
- 📈 Statistiques détaillées

**Composants clés** :
- Cartes de statistiques (utilisateurs, partenaires, réservations, revenus)
- Liste des réservations récentes
- Activité récente
- Actions rapides

### Dashboard Partenaire

**URL** : `/dashboard/partner`

**Fonctionnalités** :
- 📊 Statistiques de ses services
- ➕ Ajouter des services :
  - Voitures (si type = car_rental)
  - Propriétés (si type = real_estate)
  - Circuits (si type = tourism)
- 📅 Voir ses réservations
- 💰 Suivre ses revenus
- 📢 Créer des annonces
- ⚙️ Gérer son profil d'entreprise

**Composants clés** :
- Cartes de statistiques (services, réservations, revenus)
- Formulaires d'ajout de services
- Liste des réservations
- Graphiques de performance

### Dashboard Client

**URL** : `/dashboard/client`

**Fonctionnalités** :
- 🏠 Accès au site public
- 📅 Voir toutes ses réservations
- 💳 Historique des paiements
- ⭐ Laisser des avis
- ⚙️ Gérer son profil

**Composants clés** :
- Cartes de statistiques (réservations, dépenses)
- Liste des réservations avec statuts
- Bouton pour explorer les services
- Recommandations personnalisées

## 🔄 Flux de réservation

### 1. Client parcourt le site
- Visite les pages de services
- Filtre et recherche
- Consulte les détails

### 2. Client crée un compte ou se connecte
- Si nouveau : inscription sur `/inscription`
- Si existant : connexion sur `/login`

### 3. Client réserve un service
- Sélectionne les dates
- Choisit les options
- Voit le prix total

### 4. Client paie en ligne
- Intégration Stripe (à venir)
- Paiement sécurisé
- Confirmation immédiate

### 5. Réservation enregistrée
- Stockée dans la table appropriée
- Statut : `pending`
- Email de confirmation envoyé

### 6. Partenaire reçoit la notification
- Voit la réservation dans son dashboard
- Peut confirmer ou annuler
- Statut mis à jour : `confirmed`

### 7. Client reçoit la confirmation
- Email de confirmation
- Détails de la réservation
- Instructions

### 8. Après le service
- Statut : `completed`
- Client peut laisser un avis
- Partenaire reçoit le paiement

## 🔒 Sécurité (RLS - Row Level Security)

Toutes les tables ont des politiques RLS activées :

### Exemples de politiques

```sql
-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Les partenaires peuvent gérer leurs propres services
CREATE POLICY "Partners can manage own services" ON tourism_packages
    FOR ALL USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

-- Les clients peuvent voir leurs propres réservations
CREATE POLICY "Users can view own bookings" ON tourism_bookings
    FOR SELECT USING (user_id = auth.uid());

-- Les admins peuvent tout faire
CREATE POLICY "Admins can do everything" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

## 🚀 Technologies utilisées

### Frontend
- **React 19** : Framework UI
- **TypeScript** : Typage statique
- **React Router** : Navigation
- **Tailwind CSS** : Styling
- **Lucide React** : Icônes
- **React Hot Toast** : Notifications
- **Framer Motion** : Animations

### Backend / Database
- **Supabase** : Backend as a Service
  - PostgreSQL : Base de données
  - Auth : Authentification
  - Storage : Stockage de fichiers (à venir)
  - Realtime : Temps réel (à venir)

### Paiements (à venir)
- **Stripe** : Traitement des paiements

## 📊 Statistiques et Analytics

### Métriques suivies

#### Dashboard Admin
- Nombre total d'utilisateurs
- Nombre de partenaires actifs
- Nombre de réservations
- Revenus totaux
- Réservations en attente
- Services actifs

#### Dashboard Partenaire
- Nombre de services
- Nombre de réservations
- Revenus générés
- Taux de conversion
- Services les plus populaires

#### Dashboard Client
- Nombre de réservations
- Réservations à venir
- Réservations terminées
- Total dépensé

## 🔮 Fonctionnalités futures

### Phase 2
- [ ] Intégration complète de Stripe
- [ ] Upload d'images avec Supabase Storage
- [ ] Système de notifications en temps réel
- [ ] Chat entre clients et partenaires

### Phase 3
- [ ] Application mobile (React Native)
- [ ] Système de fidélité
- [ ] Programme d'affiliation
- [ ] Multi-langues (FR, EN, AR)

### Phase 4
- [ ] Intelligence artificielle pour recommandations
- [ ] Chatbot d'assistance
- [ ] Analyse prédictive
- [ ] Intégration avec Google Maps

## 📝 Notes importantes

1. **Variables d'environnement** : Ne jamais committer le fichier `.env`
2. **Clés API** : Garder les clés secrètes privées
3. **RLS** : Toujours tester les politiques de sécurité
4. **Backups** : Faire des sauvegardes régulières de la base de données
5. **Tests** : Tester toutes les fonctionnalités avant déploiement

## 🆘 Debugging

### Logs utiles
- Console du navigateur : Erreurs frontend
- Supabase Dashboard > Logs : Erreurs backend
- Network tab : Requêtes API

### Commandes utiles
```bash
# Démarrer en mode développement
npm run dev

# Build pour production
npm run build

# Prévisualiser le build
npm run preview

# Linter
npm run lint
```

---

**Dernière mise à jour** : Novembre 2024
**Version** : 1.0.0
**Auteur** : Maroc 2030 Team
