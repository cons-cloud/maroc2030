# 🎯 Plan Complet - CMS Maroc 2030

## 📋 Objectif

Créer un système de gestion de contenu (CMS) complet où **TOUT** est synchronisé en temps réel entre :
- ✅ Dashboard Admin
- ✅ Site Web
- ✅ Base de données Supabase

## 🏗️ Architecture

```
Dashboard Admin → Supabase → Site Web
     ↑                           ↓
     └───────────────────────────┘
          Synchronisation temps réel
```

---

## 📦 Fonctionnalités à développer

### 1. 🖼️ Gestion des Images
**Localisation** : `/dashboard/admin/media`

**Fonctionnalités** :
- ✅ Upload d'images (drag & drop)
- ✅ Galerie d'images
- ✅ Supprimer des images
- ✅ Organiser par dossiers (services, hero, profiles, etc.)
- ✅ Copier l'URL de l'image
- ✅ Prévisualisation

**Stockage** : Supabase Storage
- Bucket `services` - Images des services
- Bucket `hero` - Images du hero/bannières
- Bucket `profiles` - Avatars des utilisateurs
- Bucket `categories` - Icônes des catégories

---

### 2. 🏨 Gestion des Services
**Localisation** : `/dashboard/admin/services`

**Fonctionnalités** :
- ✅ Liste de TOUS les services (tourisme, voitures, propriétés, hôtels, événements)
- ✅ Ajouter un nouveau service
- ✅ Modifier un service existant
- ✅ Supprimer un service
- ✅ Upload de photos multiples
- ✅ Définir le prix
- ✅ Ajouter une description (FR + AR)
- ✅ Définir la localisation
- ✅ Activer/Désactiver
- ✅ Mettre en avant (featured)
- ✅ Filtrer par catégorie
- ✅ Recherche

**Champs** :
- Titre (FR + AR)
- Description (FR + AR)
- Prix
- Prix par (jour/nuit/personne)
- Catégorie
- Ville/Région
- Latitude/Longitude
- Images (multiple)
- Caractéristiques (JSONB)
- Contact (téléphone, email)
- Disponibilité
- Featured

**Types de services** :
1. **Tourisme** - Circuits, excursions, guides
2. **Location de voitures** - Marque, modèle, année, carburant, etc.
3. **Immobilier** - Appartements, villas, riads
4. **Hôtels** - Étoiles, équipements
5. **Événements** - Date, durée, participants

---

### 3. 🎨 Gestion du Contenu du Site
**Localisation** : `/dashboard/admin/content`

**Sections modifiables** :
- **Hero** :
  - Titre principal
  - Sous-titre
  - Image de fond
  - Bouton CTA
- **À propos** :
  - Titre
  - Description
  - Image
- **Fonctionnalités** :
  - 3-6 cartes de fonctionnalités
  - Titre, description, icône
- **Statistiques** :
  - Nombre de services
  - Nombre de réservations
  - Clients satisfaits
  - Partenaires
- **Contact** :
  - Email
  - Téléphone
  - Adresse

**Fonctionnalités** :
- ✅ Modifier les textes
- ✅ Changer les images
- ✅ Version FR + AR
- ✅ Prévisualisation en temps réel
- ✅ Activer/Désactiver des sections

---

### 4. 👥 Gestion des Utilisateurs
**Localisation** : `/dashboard/admin/users`

**Fonctionnalités** :
- ✅ Liste de tous les utilisateurs
- ✅ Filtrer par rôle (admin, partenaire, client)
- ✅ Voir les détails d'un utilisateur
- ✅ Modifier le rôle
- ✅ Activer/Désactiver un compte
- ✅ Vérifier un partenaire
- ✅ Supprimer un utilisateur
- ✅ Recherche par email/nom

---

### 5. 📅 Gestion des Réservations
**Localisation** : `/dashboard/admin/bookings`

**Fonctionnalités** :
- ✅ Liste de toutes les réservations
- ✅ Filtrer par statut (pending, confirmed, cancelled, completed)
- ✅ Voir les détails d'une réservation
- ✅ Changer le statut
- ✅ Voir le client et le service
- ✅ Voir les dates et le montant
- ✅ Annuler une réservation
- ✅ Exporter en CSV/PDF

---

### 6. 💳 Gestion des Paiements
**Localisation** : `/dashboard/admin/payments`

**Fonctionnalités** :
- ✅ Liste de tous les paiements
- ✅ Filtrer par statut (pending, paid, failed, refunded)
- ✅ Voir les détails d'un paiement
- ✅ Lier à la réservation
- ✅ Marquer comme payé
- ✅ Rembourser
- ✅ Statistiques des revenus

---

### 7. 📊 Gestion des Catégories
**Localisation** : `/dashboard/admin/categories`

**Fonctionnalités** :
- ✅ Liste des catégories
- ✅ Ajouter une catégorie
- ✅ Modifier une catégorie
- ✅ Supprimer une catégorie
- ✅ Icône/Image
- ✅ Nom FR + AR
- ✅ Type (tourisme, voiture, immobilier, etc.)

---

### 8. 💬 Gestion des Messages
**Localisation** : `/dashboard/admin/messages`

**Fonctionnalités** :
- ✅ Liste des messages de contact
- ✅ Marquer comme lu
- ✅ Répondre (envoyer un email)
- ✅ Supprimer
- ✅ Filtrer (lu/non lu)

---

### 9. 📢 Gestion des Annonces
**Localisation** : `/dashboard/admin/announcements`

**Fonctionnalités** :
- ✅ Liste des annonces
- ✅ Créer une annonce
- ✅ Modifier une annonce
- ✅ Supprimer une annonce
- ✅ Titre + Contenu (FR + AR)
- ✅ Image
- ✅ Position (header, sidebar, footer)
- ✅ Dates de début/fin
- ✅ Activer/Désactiver

---

### 10. ⭐ Gestion des Avis
**Localisation** : `/dashboard/admin/reviews`

**Fonctionnalités** :
- ✅ Liste de tous les avis
- ✅ Filtrer (approuvés/en attente)
- ✅ Approuver un avis
- ✅ Rejeter un avis
- ✅ Supprimer un avis
- ✅ Voir le service et le client

---

### 11. 📈 Statistiques et Rapports
**Localisation** : `/dashboard/admin/stats`

**Fonctionnalités** :
- ✅ Graphiques des revenus
- ✅ Graphiques des réservations
- ✅ Services les plus populaires
- ✅ Partenaires les plus actifs
- ✅ Taux de conversion
- ✅ Exporter les rapports

---

### 12. ⚙️ Paramètres
**Localisation** : `/dashboard/admin/settings`

**Fonctionnalités** :
- ✅ Informations du site
- ✅ Configuration des emails
- ✅ Configuration des paiements (Stripe)
- ✅ Langues
- ✅ Devise
- ✅ Fuseau horaire
- ✅ Logo du site
- ✅ Favicon

---

## 🔄 Synchronisation Temps Réel

### Comment ça fonctionne ?

1. **Admin ajoute un service** :
   ```
   Dashboard Admin → Supabase (INSERT) → Site Web (affichage automatique)
   ```

2. **Admin modifie une image** :
   ```
   Dashboard Admin → Supabase Storage → URL mise à jour → Site Web (nouvelle image)
   ```

3. **Admin supprime un service** :
   ```
   Dashboard Admin → Supabase (DELETE) → Site Web (disparaît automatiquement)
   ```

4. **Client fait une réservation** :
   ```
   Site Web → Supabase (INSERT) → Dashboard Admin (notification)
   ```

### Technologies utilisées :
- **Supabase Realtime** - Écoute des changements en temps réel
- **React Query** - Cache et synchronisation des données
- **Supabase Storage** - Stockage des images
- **RLS Policies** - Sécurité des données

---

## 📱 Interface Utilisateur

### Composants réutilisables :
- ✅ `DataTable` - Tableau avec tri, filtre, pagination
- ✅ `ImageUploader` - Upload d'images avec drag & drop
- ✅ `RichTextEditor` - Éditeur de texte riche
- ✅ `Modal` - Fenêtres modales pour les formulaires
- ✅ `ConfirmDialog` - Confirmation avant suppression
- ✅ `Toast` - Notifications
- ✅ `LoadingSpinner` - Indicateur de chargement
- ✅ `EmptyState` - État vide avec illustration

### Design :
- ✅ Interface moderne et intuitive
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Dark mode (optionnel)
- ✅ Animations fluides
- ✅ Feedback visuel immédiat

---

## 🗂️ Structure des fichiers

```
src/
├── Pages/
│   └── dashboards/
│       └── admin/
│           ├── AdminDashboard.tsx (✅ Existe)
│           ├── ServicesManagement.tsx (À créer)
│           ├── MediaManagement.tsx (À créer)
│           ├── ContentManagement.tsx (À créer)
│           ├── UsersManagement.tsx (À créer)
│           ├── BookingsManagement.tsx (À créer)
│           ├── PaymentsManagement.tsx (À créer)
│           ├── CategoriesManagement.tsx (À créer)
│           ├── MessagesManagement.tsx (À créer)
│           ├── AnnouncementsManagement.tsx (À créer)
│           ├── ReviewsManagement.tsx (À créer)
│           ├── StatsManagement.tsx (À créer)
│           └── SettingsManagement.tsx (À créer)
├── components/
│   ├── admin/
│   │   ├── DataTable.tsx (À créer)
│   │   ├── ImageUploader.tsx (À créer)
│   │   ├── RichTextEditor.tsx (À créer)
│   │   ├── ServiceForm.tsx (À créer)
│   │   └── ... (autres composants)
│   └── DashboardLayout.tsx (✅ Existe)
├── lib/
│   ├── supabase.ts (✅ Existe)
│   └── storage.ts (✅ Créé)
└── hooks/
    ├── useServices.ts (À créer)
    ├── useContent.ts (À créer)
    └── useRealtime.ts (À créer)
```

---

## 🚀 Plan d'implémentation

### Phase 1 : Infrastructure (Fait ✅)
- [x] Configuration Supabase Storage
- [x] Utilitaires d'upload d'images
- [x] Tables pour le contenu du site

### Phase 2 : Gestion des Services (Priorité 1)
- [ ] Page de liste des services
- [ ] Formulaire d'ajout/modification
- [ ] Upload d'images multiples
- [ ] Filtres et recherche
- [ ] Synchronisation avec le site

### Phase 3 : Gestion du Contenu (Priorité 2)
- [ ] Éditeur de contenu du site
- [ ] Gestion du hero
- [ ] Gestion des sections
- [ ] Prévisualisation

### Phase 4 : Gestion des Médias (Priorité 3)
- [ ] Galerie d'images
- [ ] Upload multiple
- [ ] Organisation par dossiers
- [ ] Recherche d'images

### Phase 5 : Autres Modules (Priorité 4)
- [ ] Gestion des utilisateurs
- [ ] Gestion des réservations
- [ ] Gestion des paiements
- [ ] Gestion des avis
- [ ] Statistiques

---

## 📝 Prochaines étapes IMMÉDIATES

1. **Exécuter `setup-storage.sql`** dans Supabase
2. **Créer la page de gestion des services**
3. **Créer le formulaire d'ajout de service**
4. **Tester l'upload d'images**
5. **Afficher les services sur le site**

---

## ⏱️ Estimation du temps

- **Phase 1** : ✅ Terminée
- **Phase 2** : ~4-6 heures
- **Phase 3** : ~3-4 heures
- **Phase 4** : ~2-3 heures
- **Phase 5** : ~6-8 heures

**Total** : ~15-21 heures de développement

---

## 🎯 Résultat final

À la fin, vous aurez :
- ✅ Un dashboard admin complet et professionnel
- ✅ Gestion totale de tout le contenu du site
- ✅ Upload et gestion d'images
- ✅ Synchronisation temps réel
- ✅ Aucune donnée de test
- ✅ Tout modifiable depuis le dashboard
- ✅ Interface intuitive et moderne

**Voulez-vous que je commence par la Phase 2 (Gestion des Services) ? C'est la plus importante car elle vous permettra d'ajouter tous vos services (tourisme, voitures, propriétés, etc.) depuis le dashboard.** 🚀
