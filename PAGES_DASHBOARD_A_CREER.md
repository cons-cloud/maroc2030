# 📋 PAGES DASHBOARD À CRÉER

## ✅ DÉJÀ CRÉÉ

### 1. **HotelsManagement.tsx** ✅
- Liste des hôtels avec images
- Étoiles, prix/nuit
- Recherche
- Suppression
- **Fichier** : `/src/Pages/dashboards/admin/HotelsManagement.tsx`

---

## 📝 À CRÉER (Même structure que HotelsManagement)

### 2. **AppartementsManagement.tsx**
```typescript
// Liste des appartements
// Type (studio, F2, F3, F4)
// Prix location/vente
// Chambres, surface
```

### 3. **VillasManagement.tsx**
```typescript
// Liste des villas
// Piscine, jardin
// Prix location/vente
// Surface terrain
```

### 4. **LocationsVoituresManagement.tsx**
```typescript
// Liste des voitures
// Marque, modèle, catégorie
// Prix/jour
// Carburant, transmission
```

### 5. **ImmobilierManagement.tsx**
```typescript
// Immobilier général
// Type (riad, terrain, commerce)
// Prix, surface
```

### 6. **CircuitsTouristiquesManagement.tsx**
```typescript
// Circuits et tours
// Durée, destinations
// Prix/personne
// Programme
```

### 7. **GuidesTouristiquesManagement.tsx**
```typescript
// Guides professionnels
// Langues, spécialités
// Note, expérience
// Prix/jour
```

### 8. **ActivitesTouristiquesManagement.tsx**
```typescript
// Activités et excursions
// Type (sport, culture)
// Durée, prix
// Max participants
```

### 9. **EvenementsManagement.tsx**
```typescript
// Événements, festivals
// Dates, lieu
// Prix, capacité
// Statut
```

### 10. **AnnoncesManagement.tsx**
```typescript
// Petites annonces
// Catégorie
// Prix, statut
```

---

## 🎯 STRUCTURE STANDARD

Toutes les pages suivent le même modèle :

```typescript
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Icon, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../../components/DashboardLayout';

const [NOM]Management: React.FC = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = async () => {
    const { data } = await supabase
      .from('[TABLE_NAME]')
      .select('*')
      .order('created_at', { ascending: false });
    setItems(data || []);
  };

  const deleteItem = async (id: string) => {
    await supabase.from('[TABLE_NAME]').delete().eq('id', id);
    toast.success('Supprimé');
    loadItems();
  };

  return (
    <DashboardLayout role="admin">
      {/* Header */}
      {/* Search */}
      {/* Grid */}
    </DashboardLayout>
  );
};
```

---

## 🔗 ROUTES À AJOUTER (App.tsx)

```typescript
// Importer les pages
const HotelsManagement = lazy(() => import("./Pages/dashboards/admin/HotelsManagement"));
const AppartementsManagement = lazy(() => import("./Pages/dashboards/admin/AppartementsManagement"));
// ... etc

// Ajouter les routes
<Route path="/dashboard/admin/hotels" element={<HotelsManagement />} />
<Route path="/dashboard/admin/appartements" element={<AppartementsManagement />} />
<Route path="/dashboard/admin/villas" element={<VillasManagement />} />
<Route path="/dashboard/admin/voitures" element={<LocationsVoituresManagement />} />
<Route path="/dashboard/admin/immobilier" element={<ImmobilierManagement />} />
<Route path="/dashboard/admin/circuits" element={<CircuitsTouristiquesManagement />} />
<Route path="/dashboard/admin/guides" element={<GuidesTouristiquesManagement />} />
<Route path="/dashboard/admin/activites" element={<ActivitesTouristiquesManagement />} />
<Route path="/dashboard/admin/evenements" element={<EvenementsManagement />} />
<Route path="/dashboard/admin/annonces" element={<AnnoncesManagement />} />
```

---

## 📱 MENU À METTRE À JOUR (DashboardLayout.tsx)

```typescript
if (role === 'admin') {
  return [
    { name: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard/admin' },
    { name: 'Utilisateurs', icon: Users, path: '/dashboard/admin/users' },
    
    // NOUVEAU MENU ORGANISÉ
    { name: '🏨 Hôtels', icon: Hotel, path: '/dashboard/admin/hotels' },
    { name: '🏢 Appartements', icon: Building, path: '/dashboard/admin/appartements' },
    { name: '🏡 Villas', icon: Home, path: '/dashboard/admin/villas' },
    { name: '🚗 Voitures', icon: Car, path: '/dashboard/admin/voitures' },
    { name: '🏘️ Immobilier', icon: Building2, path: '/dashboard/admin/immobilier' },
    { name: '🗺️ Circuits', icon: Map, path: '/dashboard/admin/circuits' },
    { name: '👨‍🏫 Guides', icon: UserCheck, path: '/dashboard/admin/guides' },
    { name: '🎯 Activités', icon: Activity, path: '/dashboard/admin/activites' },
    { name: '🎉 Événements', icon: Calendar, path: '/dashboard/admin/evenements' },
    { name: '📢 Annonces', icon: Megaphone, path: '/dashboard/admin/annonces' },
    
    { name: 'Réservations', icon: Calendar, path: '/dashboard/admin/bookings' },
    { name: 'Paiements', icon: CreditCard, path: '/dashboard/admin/payments' },
    { name: 'Messages', icon: MessageSquare, path: '/dashboard/admin/messages' },
    { name: 'Paramètres', icon: Settings, path: '/dashboard/admin/settings' },
  ];
}
```

---

## 🎨 ICÔNES À IMPORTER

```typescript
import {
  Hotel,
  Building,
  Building2,
  Home,
  Car,
  Map,
  UserCheck,
  Activity,
  Calendar,
  Megaphone,
  // ... autres
} from 'lucide-react';
```

---

## ✅ CHECKLIST

### Base de données
- [x] Tables créées (create-specialized-tables.sql)
- [ ] Données insérées

### Frontend
- [x] HotelsManagement.tsx créé
- [ ] 9 autres pages à créer
- [ ] Routes ajoutées dans App.tsx
- [ ] Menu mis à jour dans DashboardLayout.tsx
- [ ] Formulaires de création/édition

### Fonctionnalités
- [x] Liste et affichage
- [x] Recherche
- [x] Suppression
- [ ] Création (formulaires)
- [ ] Édition (formulaires)
- [ ] Upload d'images

---

## 🚀 ORDRE DE PRIORITÉ

1. **Créer les 9 pages restantes** (copier HotelsManagement)
2. **Ajouter les routes** dans App.tsx
3. **Mettre à jour le menu** dans DashboardLayout
4. **Créer les formulaires** pour chaque type
5. **Insérer les données** dans chaque table

---

## 💡 CONSEIL

Pour gagner du temps, je peux :
1. Créer un **composant générique** `EntityManagement<T>`
2. Réutiliser pour toutes les entités
3. Juste changer les props (table, colonnes, icône)

**Voulez-vous que je crée ce composant générique ?** 🚀
