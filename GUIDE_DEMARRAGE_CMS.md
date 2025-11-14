# 🚀 Guide de Démarrage - CMS Maroc 2030

## ✅ Ce qui a été créé

### 1. **Système de gestion des services** ✅
- Page de liste des services (`/dashboard/admin/services`)
- Formulaire d'ajout/modification (`/dashboard/admin/services/new`)
- Upload d'images multiples
- Filtres et recherche
- Actions : Modifier, Supprimer, Activer/Désactiver, Mettre en avant

### 2. **Utilitaires d'upload d'images** ✅
- `src/lib/storage.ts` - Fonctions pour uploader/supprimer des images
- Support de plusieurs formats (JPG, PNG, WEBP, GIF)
- Validation de taille (max 5MB)

### 3. **Configuration Supabase Storage** ✅
- `setup-storage.sql` - Script pour créer les buckets et politiques

---

## 📋 ÉTAPES À SUIVRE MAINTENANT

### Étape 1 : Exécuter le script SQL ⚠️ IMPORTANT

**Ouvrez Supabase SQL Editor et exécutez `setup-storage.sql`**

Ce script va :
- ✅ Créer les buckets de stockage (services, profiles, hero, categories)
- ✅ Configurer les politiques de sécurité
- ✅ Créer la table `site_content` pour le contenu du site
- ✅ Créer la table `site_stats` pour les statistiques
- ✅ Insérer le contenu par défaut

```bash
# Ouvrez le fichier
/Users/jamilaaitbouchnani/Maroc-2030/setup-storage.sql

# Copiez TOUT le contenu
# Collez dans Supabase SQL Editor
# Cliquez sur Run
```

### Étape 2 : Redémarrer l'application

```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

### Étape 3 : Tester la gestion des services

1. **Connectez-vous** avec `maroc2031@gmail.com` / `Maroc2031@`
2. **Allez dans le menu** > **Services**
3. **Cliquez sur "Nouveau Service"**
4. **Remplissez le formulaire** :
   - Titre
   - Description
   - Prix
   - Catégorie
   - Ville
   - Upload d'images (glissez-déposez ou cliquez)
5. **Cliquez sur "Créer le service"**
6. ✅ Le service apparaît dans la liste !

---

## 🎯 Fonctionnalités disponibles

### Page de liste des services

**URL** : `/dashboard/admin/services`

**Fonctionnalités** :
- ✅ Voir tous les services
- ✅ Rechercher par titre ou ville
- ✅ Filtrer par catégorie
- ✅ Voir le statut (disponible/indisponible)
- ✅ Voir si mis en avant (featured)
- ✅ Actions rapides :
  - 👁️ Activer/Désactiver
  - ⭐ Mettre en avant / Retirer
  - ✏️ Modifier
  - 🗑️ Supprimer

### Formulaire de service

**URL** : `/dashboard/admin/services/new` (nouveau) ou `/dashboard/admin/services/edit/:id` (modifier)

**Sections** :
1. **Images**
   - Upload multiple (drag & drop)
   - Prévisualisation
   - Supprimer une image
   - Formats : JPG, PNG, WEBP, GIF
   - Taille max : 5MB par image

2. **Informations de base**
   - Titre (FR + AR)
   - Description (FR + AR)
   - Catégorie
   - Prix (MAD)
   - Prix par (jour/nuit/personne/heure/semaine/mois)

3. **Localisation**
   - Ville
   - Région
   - Adresse complète

4. **Contact**
   - Téléphone
   - Email

5. **Options**
   - ☑️ Service disponible
   - ☑️ Mettre en avant (featured)

---

## 🔄 Synchronisation en temps réel

### Comment ça fonctionne ?

1. **Vous ajoutez un service dans le dashboard**
   ```
   Dashboard Admin → Supabase (INSERT) → Base de données
   ```

2. **Le service est immédiatement disponible**
   - Dans la liste des services du dashboard
   - Sur le site web (si vous créez la page d'affichage)
   - Dans les recherches et filtres

3. **Vous modifiez un service**
   ```
   Dashboard Admin → Supabase (UPDATE) → Mise à jour instantanée
   ```

4. **Vous supprimez un service**
   ```
   Dashboard Admin → Supabase (DELETE) → Disparaît partout
   ```

---

## 📊 Structure de la base de données

### Table `services`

```sql
- id (UUID)
- partner_id (UUID) → profiles
- category_id (UUID) → service_categories
- title (VARCHAR)
- title_ar (VARCHAR)
- description (TEXT)
- description_ar (TEXT)
- price (DECIMAL)
- price_per (VARCHAR)
- location (VARCHAR)
- city (VARCHAR)
- region (VARCHAR)
- latitude (DECIMAL)
- longitude (DECIMAL)
- available (BOOLEAN)
- featured (BOOLEAN)
- images (TEXT[])
- features (JSONB)
- contact_phone (VARCHAR)
- contact_email (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Buckets Supabase Storage

1. **services** - Images des services
2. **profiles** - Avatars des utilisateurs
3. **hero** - Images du hero/bannières
4. **categories** - Icônes des catégories

---

## 🎨 Afficher les services sur le site web

Pour afficher les services sur votre site, créez une page qui récupère les données :

```typescript
// Exemple : Page des services de tourisme
const { data: services } = await supabase
  .from('services')
  .select(`
    *,
    category:category_id (name, type)
  `)
  .eq('available', true)
  .eq('category.type', 'tourism')
  .order('created_at', { ascending: false });
```

Les services ajoutés dans le dashboard apparaîtront automatiquement !

---

## 🔐 Sécurité

### Politiques RLS

- ✅ **Lecture** : Tout le monde peut voir les services disponibles
- ✅ **Création** : Seuls les admins et partenaires peuvent créer
- ✅ **Modification** : Seul le propriétaire peut modifier
- ✅ **Suppression** : Seul le propriétaire peut supprimer

### Upload d'images

- ✅ Seuls les utilisateurs authentifiés peuvent uploader
- ✅ Validation de type et taille
- ✅ Stockage sécurisé dans Supabase Storage
- ✅ URLs publiques pour l'affichage

---

## 📝 Prochaines étapes

### Phase 2 : Gestion du contenu du site

Je vais créer :
- ✅ Page pour modifier le hero (titre, sous-titre, image)
- ✅ Page pour modifier les sections du site
- ✅ Éditeur de texte riche
- ✅ Prévisualisation en temps réel

### Phase 3 : Gestion des médias

- ✅ Galerie d'images complète
- ✅ Organisation par dossiers
- ✅ Recherche d'images
- ✅ Copier l'URL

### Phase 4 : Autres modules

- ✅ Gestion des utilisateurs
- ✅ Gestion des réservations
- ✅ Gestion des paiements
- ✅ Gestion des avis
- ✅ Statistiques avancées

---

## 🆘 Dépannage

### Erreur : "Missing bucket"

**Solution** : Exécutez `setup-storage.sql` dans Supabase

### Erreur : "Upload failed"

**Causes possibles** :
- Fichier trop volumineux (> 5MB)
- Format non supporté
- Pas de connexion internet

**Solution** : Vérifiez la taille et le format du fichier

### Les services n'apparaissent pas

**Solution** :
1. Vérifiez que le service est "disponible" (available = true)
2. Vérifiez les politiques RLS
3. Ouvrez la console (F12) pour voir les erreurs

---

## ✅ Checklist

- [ ] Script `setup-storage.sql` exécuté
- [ ] Application redémarrée
- [ ] Connexion au dashboard admin
- [ ] Page Services accessible
- [ ] Formulaire de création fonctionne
- [ ] Upload d'images fonctionne
- [ ] Service créé apparaît dans la liste
- [ ] Modification d'un service fonctionne
- [ ] Suppression d'un service fonctionne

---

## 🎉 Félicitations !

Vous avez maintenant un **système de gestion de services complet** !

Vous pouvez :
- ✅ Ajouter tous vos services (tourisme, voitures, propriétés, hôtels, événements)
- ✅ Uploader des photos
- ✅ Modifier les prix et descriptions
- ✅ Activer/Désactiver des services
- ✅ Mettre en avant vos meilleurs services
- ✅ Tout est synchronisé avec Supabase

**Prêt à ajouter votre premier service ? 🚀**

---

**Besoin d'aide ?** Consultez les autres fichiers de documentation ou demandez-moi !
