# 🚀 CRÉATION RAPIDE DE TOUTES LES PAGES

## ✅ PAGES CRÉÉES
1. HotelsManagement.tsx ✅
2. AppartementsManagement.tsx ✅

## 📝 PAGES À CRÉER (Copier-coller le code)

Je vais créer un document avec tout le code nécessaire pour gagner du temps.

### Structure de chaque page :
- Même layout que HotelsManagement
- Juste changer : table name, fields, icons
- Copier-coller et adapter

## 🔧 ÉTAPES RAPIDES

### 1. Créer les fichiers manquants
Créez ces fichiers dans `/src/Pages/dashboards/admin/` :

- VillasManagement.tsx
- LocationsVoituresManagement.tsx  
- ImmobilierManagement.tsx
- CircuitsTouristiquesManagement.tsx
- GuidesTouristiquesManagement.tsx
- ActivitesTouristiquesManagement.tsx
- EvenementsManagement.tsx
- AnnoncesManagement.tsx

### 2. Copier le template
Chaque fichier suit ce template (remplacer [NOM] et [TABLE]) :

```typescript
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { [ICON], Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../../components/DashboardLayout';

const [NOM]Management: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('[TABLE]')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Supprimer ?')) return;
    try {
      const { error } = await supabase.from('[TABLE]').delete().eq('id', id);
      if (error) throw error;
      toast.success('Supprimé');
      loadItems();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">[TITRE]</h1>
            <p className="text-gray-600 mt-1">{filteredItems.length} élément(s)</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Nouveau
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.title || item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <[ICON] className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{item.title || item.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <span className="text-lg font-bold text-blue-600">{item.price} MAD</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <[ICON] className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun élément trouvé</h3>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default [NOM]Management;
```

### 3. Valeurs pour chaque page

| Fichier | [NOM] | [TABLE] | [ICON] | [TITRE] |
|---------|-------|---------|--------|---------|
| VillasManagement.tsx | Villas | villas | Home | Gestion des Villas |
| LocationsVoituresManagement.tsx | LocationsVoitures | locations_voitures | Car | Gestion des Voitures |
| ImmobilierManagement.tsx | Immobilier | immobilier | Building2 | Gestion Immobilier |
| CircuitsTouristiquesManagement.tsx | CircuitsTouristiques | circuits_touristiques | Map | Gestion des Circuits |
| GuidesTouristiquesManagement.tsx | GuidesTouristiques | guides_touristiques | UserCheck | Gestion des Guides |
| ActivitesTouristiquesManagement.tsx | ActivitesTouristiques | activites_touristiques | Activity | Gestion des Activités |
| EvenementsManagement.tsx | Evenements | evenements | Calendar | Gestion des Événements |
| AnnoncesManagement.tsx | Annonces | annonces | Megaphone | Gestion des Annonces |

---

## 🔗 ROUTES (App.tsx)

Ajoutez ces imports :
```typescript
const HotelsManagement = lazy(() => import("./Pages/dashboards/admin/HotelsManagement"));
const AppartementsManagement = lazy(() => import("./Pages/dashboards/admin/AppartementsManagement"));
const VillasManagement = lazy(() => import("./Pages/dashboards/admin/VillasManagement"));
const LocationsVoituresManagement = lazy(() => import("./Pages/dashboards/admin/LocationsVoituresManagement"));
const ImmobilierManagement = lazy(() => import("./Pages/dashboards/admin/ImmobilierManagement"));
const CircuitsTouristiquesManagement = lazy(() => import("./Pages/dashboards/admin/CircuitsTouristiquesManagement"));
const GuidesTouristiquesManagement = lazy(() => import("./Pages/dashboards/admin/GuidesTouristiquesManagement"));
const ActivitesTouristiquesManagement = lazy(() => import("./Pages/dashboards/admin/ActivitesTouristiquesManagement"));
const EvenementsManagement = lazy(() => import("./Pages/dashboards/admin/EvenementsManagement"));
const AnnoncesManagement = lazy(() => import("./Pages/dashboards/admin/AnnoncesManagement"));
```

Ajoutez ces routes :
```typescript
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

## 📱 MENU (DashboardLayout.tsx)

Ajoutez ces imports :
```typescript
import {
  LayoutDashboard, Users, Package, Calendar, MessageSquare, Settings,
  Hotel, Building, Home, Car, Building2, Map, UserCheck, Activity, Megaphone,
  CreditCard, BarChart3, UserCog, FileText, Image, Phone, Mail, MapPin
} from 'lucide-react';
```

Remplacez le menu admin :
```typescript
if (role === 'admin') {
  return [
    { name: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard/admin' },
    { name: 'Utilisateurs', icon: Users, path: '/dashboard/admin/users' },
    { name: 'Partenaires', icon: UserCog, path: '/dashboard/admin/partners' },
    
    // HÉBERGEMENT
    { name: 'Hôtels', icon: Hotel, path: '/dashboard/admin/hotels' },
    { name: 'Appartements', icon: Building, path: '/dashboard/admin/appartements' },
    { name: 'Villas', icon: Home, path: '/dashboard/admin/villas' },
    
    // TRANSPORT
    { name: 'Voitures', icon: Car, path: '/dashboard/admin/voitures' },
    
    // IMMOBILIER
    { name: 'Immobilier', icon: Building2, path: '/dashboard/admin/immobilier' },
    
    // TOURISME
    { name: 'Circuits', icon: Map, path: '/dashboard/admin/circuits' },
    { name: 'Guides', icon: UserCheck, path: '/dashboard/admin/guides' },
    { name: 'Activités', icon: Activity, path: '/dashboard/admin/activites' },
    
    // ÉVÉNEMENTS & ANNONCES
    { name: 'Événements', icon: Calendar, path: '/dashboard/admin/evenements' },
    { name: 'Annonces', icon: Megaphone, path: '/dashboard/admin/annonces' },
    
    // GESTION
    { name: 'Réservations', icon: Calendar, path: '/dashboard/admin/bookings' },
    { name: 'Paiements', icon: CreditCard, path: '/dashboard/admin/payments' },
    { name: 'Messages', icon: MessageSquare, path: '/dashboard/admin/messages' },
    { name: 'Contenu du Site', icon: Image, path: '/dashboard/admin/site-content' },
    { name: 'Paramètres', icon: Settings, path: '/dashboard/admin/settings' },
  ];
}
```

---

**TOUT EST PRÊT ! Suivez ces étapes et votre dashboard sera complet ! 🚀**
