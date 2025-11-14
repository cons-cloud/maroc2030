# 🎛️ INTÉGRATION DASHBOARD ADMIN - CIRCUITS TOURISTIQUES

## ✅ **PAGES CRÉÉES**

### **1. Gestion des Circuits** 📍
**Fichier** : `/src/Pages/dashboards/admin/CircuitsManagement.tsx`

**Fonctionnalités** :
- ✅ Liste de tous les circuits
- ✅ Créer un nouveau circuit
- ✅ Modifier un circuit existant
- ✅ Supprimer un circuit
- ✅ Activer/Désactiver un circuit
- ✅ Statistiques (total, actifs, prix moyen, durée moyenne)
- ✅ Formulaire complet avec :
  - Titre, description
  - Prix par personne
  - Durée en jours
  - Max participants
  - Points forts (liste)
  - Ce qui est inclus (liste)
  - Ce qui n'est pas inclus (liste)
  - Disponibilité, en vedette

### **2. Gestion des Réservations** 📅
**Fichier** : `/src/Pages/dashboards/admin/CircuitBookingsManagement.tsx`

**Fonctionnalités** :
- ✅ Liste de toutes les réservations
- ✅ Filtres (Toutes, En attente, Confirmées, Annulées)
- ✅ Statistiques :
  - Total réservations
  - En attente
  - Confirmées
  - Annulées
  - Revenu total
  - Nombre total de voyageurs
- ✅ Détails complets de chaque réservation :
  - Circuit réservé
  - Informations client (nom, email, téléphone)
  - Nombre de personnes
  - Durée personnalisée
  - Date de départ
  - Prix total
  - Méthode de paiement
  - Demandes spéciales
- ✅ Changer le statut de paiement
- ✅ Voir les détails en modal
- ✅ Exporter en CSV

---

## 🔧 **INTÉGRATION AU DASHBOARD**

### **Étape 1 : Ajouter les routes**

Ouvrir `/src/App.tsx` et ajouter les imports :

```typescript
// Ajouter avec les autres imports admin
const CircuitsManagement = lazy(() => import("./Pages/dashboards/admin/CircuitsManagement"));
const CircuitBookingsManagement = lazy(() => import("./Pages/dashboards/admin/CircuitBookingsManagement"));
```

Puis ajouter les routes :

```typescript
// Dans la section des routes admin
<Route path="/admin/circuits" element={
  <>
    <Navbar />
    <CircuitsManagement />
    <Footer />
  </>
} />

<Route path="/admin/circuit-bookings" element={
  <>
    <Navbar />
    <CircuitBookingsManagement />
    <Footer />
  </>
} />
```

### **Étape 2 : Ajouter au menu du dashboard**

Ouvrir `/src/components/DashboardLayout.tsx` (ou le fichier du menu admin) et ajouter :

```typescript
import { MapPin, Calendar } from 'lucide-react';

// Dans le menu admin
const adminMenuItems = [
  // ... items existants
  {
    name: 'Circuits Touristiques',
    href: '/admin/circuits',
    icon: MapPin,
  },
  {
    name: 'Réservations Circuits',
    href: '/admin/circuit-bookings',
    icon: Calendar,
  },
];
```

---

## 📊 **CE QUE VOUS RECEVEZ DANS LE DASHBOARD**

### **Page Circuits** (`/admin/circuits`)

```
┌─────────────────────────────────────────────────┐
│  GESTION DES CIRCUITS                           │
│                                                 │
│  📊 Statistiques                                │
│  ├─ Total Circuits: 12                          │
│  ├─ Circuits Actifs: 10                         │
│  ├─ Prix Moyen: 1450 MAD                        │
│  └─ Durée Moyenne: 3 jours                      │
│                                                 │
│  📋 Liste des Circuits                          │
│  ┌──────────────────────────────────────────┐  │
│  │ Désert de Merzouga                       │  │
│  │ 1200 MAD | 3 jours | Max 15 pers.       │  │
│  │ [Actif] [✏️ Modifier] [🗑️ Supprimer]    │  │
│  ├──────────────────────────────────────────┤  │
│  │ Villes Impériales                        │  │
│  │ 2500 MAD | 7 jours | Max 20 pers.       │  │
│  │ [Actif] [✏️ Modifier] [🗑️ Supprimer]    │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [+ Nouveau Circuit]                            │
└─────────────────────────────────────────────────┘
```

### **Page Réservations** (`/admin/circuit-bookings`)

```
┌─────────────────────────────────────────────────┐
│  RÉSERVATIONS CIRCUITS                          │
│                                                 │
│  📊 Statistiques                                │
│  ├─ Total: 45                                   │
│  ├─ En attente: 8                               │
│  ├─ Confirmées: 35                              │
│  ├─ Annulées: 2                                 │
│  ├─ Revenu: 52 400 MAD                          │
│  └─ Voyageurs: 128                              │
│                                                 │
│  🔍 Filtres                                     │
│  [Toutes] [En attente] [Confirmées] [Annulées] │
│                                                 │
│  📋 Liste des Réservations                      │
│  ┌──────────────────────────────────────────┐  │
│  │ 09/11/2025 | Désert de Merzouga          │  │
│  │ Ahmed Benali | ahmed@email.com           │  │
│  │ 4 pers. | 5 jours | Départ: 20/11/2025   │  │
│  │ 4800 MAD | [Confirmée ▼]                 │  │
│  │ [👁️ Voir détails]                         │  │
│  ├──────────────────────────────────────────┤  │
│  │ 09/11/2025 | Essaouira                   │  │
│  │ Sara Idrissi | sara@email.com            │  │
│  │ 2 pers. | 1 jour | Départ: 15/11/2025    │  │
│  │ 900 MAD | [En attente ▼]                 │  │
│  │ [👁️ Voir détails]                         │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [📥 Exporter CSV]                              │
└─────────────────────────────────────────────────┘
```

---

## 💼 **UTILISATION QUOTIDIENNE**

### **Gérer les Circuits**

1. **Créer un nouveau circuit**
   - Cliquer sur "Nouveau Circuit"
   - Remplir le formulaire
   - Ajouter les points forts (Entrée + touche)
   - Ajouter ce qui est inclus/non inclus
   - Sauvegarder

2. **Modifier un circuit**
   - Cliquer sur l'icône ✏️
   - Modifier les informations
   - Sauvegarder

3. **Activer/Désactiver**
   - Cliquer sur le badge "Actif" ou "Inactif"
   - Le circuit devient visible/invisible sur le site

### **Gérer les Réservations**

1. **Voir toutes les réservations**
   - Accéder à `/admin/circuit-bookings`
   - Voir les statistiques en haut

2. **Filtrer**
   - Cliquer sur "En attente" pour voir uniquement celles-ci
   - Cliquer sur "Confirmées" pour voir les confirmées

3. **Changer le statut**
   - Cliquer sur le menu déroulant du statut
   - Sélectionner "Confirmée", "En attente" ou "Annulée"

4. **Voir les détails**
   - Cliquer sur l'icône 👁️
   - Voir toutes les informations
   - Voir les demandes spéciales du client

5. **Exporter**
   - Cliquer sur "Exporter CSV"
   - Fichier téléchargé avec toutes les données

---

## 📧 **INFORMATIONS REÇUES PAR RÉSERVATION**

Quand un client réserve, vous recevez :

```json
{
  "id": "abc123",
  "circuit_id": "circuit-xyz",
  "circuit_title": "Désert de Merzouga",
  
  "client_name": "Ahmed Benali",
  "client_email": "ahmed@email.com",
  "client_phone": "+212 6XX XX XX XX",
  
  "number_of_people": 4,
  "custom_duration": 5,
  "start_date": "2025-11-20",
  
  "total_price": 4800,
  "payment_method": "stripe",
  "payment_status": "confirmed",
  
  "special_requests": "Régime végétarien pour 2 personnes",
  
  "created_at": "2025-11-09T18:30:00"
}
```

---

## 🔄 **FLUX COMPLET**

```
1. Client visite /services/tourisme
   ↓
2. Client clique sur un circuit
   ↓
3. Client voit les détails (/circuit/:id)
   ↓
4. Client clique "Réserver maintenant"
   ↓
5. Client remplit le formulaire :
   - Nom, email, téléphone
   - Nombre de personnes (ex: 4)
   - Durée (ex: 5 jours au lieu de 3)
   - Date de départ
   - Demandes spéciales
   ↓
6. Client paie avec Stripe ou CMI
   ↓
7. Réservation enregistrée dans Supabase
   ↓
8. VOUS RECEVEZ dans le dashboard admin :
   ✅ Notification de nouvelle réservation
   ✅ Toutes les informations client
   ✅ Détails de la réservation
   ✅ Statut du paiement
   ↓
9. Vous pouvez :
   ✅ Confirmer la réservation
   ✅ Contacter le client
   ✅ Voir les demandes spéciales
   ✅ Exporter les données
```

---

## 📱 **NOTIFICATIONS (À IMPLÉMENTER)**

Pour recevoir des notifications en temps réel :

### **Option 1 : Email automatique**

Créer une fonction Supabase qui envoie un email quand une réservation est créée :

```sql
-- Trigger pour envoyer un email
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Envoyer email à l'admin
  PERFORM net.http_post(
    url := 'https://api.resend.com/emails',
    headers := '{"Authorization": "Bearer YOUR_KEY"}'::jsonb,
    body := json_build_object(
      'from', 'noreply@maroc2030.com',
      'to', 'admin@maroc2030.com',
      'subject', 'Nouvelle réservation circuit',
      'html', 'Nouvelle réservation de ' || NEW.client_name
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_booking
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION notify_new_booking();
```

### **Option 2 : Webhook**

Configurer un webhook dans Supabase pour être notifié :

```javascript
// Votre serveur reçoit la notification
app.post('/webhook/new-booking', (req, res) => {
  const booking = req.body;
  
  // Envoyer notification push
  // Envoyer SMS
  // Envoyer email
  
  res.json({ received: true });
});
```

---

## 📊 **RAPPORTS ET STATISTIQUES**

### **Rapport mensuel**

```sql
-- Réservations par mois
SELECT 
  DATE_TRUNC('month', created_at) as mois,
  COUNT(*) as nombre_reservations,
  SUM(total_price) as revenu_total,
  SUM(number_of_people) as total_voyageurs
FROM bookings
WHERE payment_status = 'confirmed'
GROUP BY mois
ORDER BY mois DESC;
```

### **Circuit le plus populaire**

```sql
-- Top 5 circuits
SELECT 
  c.title,
  COUNT(b.id) as nombre_reservations,
  SUM(b.total_price) as revenu_total
FROM circuits_touristiques c
LEFT JOIN bookings b ON b.circuit_id = c.id
WHERE b.payment_status = 'confirmed'
GROUP BY c.id, c.title
ORDER BY nombre_reservations DESC
LIMIT 5;
```

---

## ✅ **CHECKLIST D'INTÉGRATION**

### **Backend (Supabase)**
- [x] Table `circuits_touristiques` créée
- [x] Table `bookings` créée
- [x] Colonnes `max_participants`, `highlights`, `included`, `not_included`
- [ ] Exécuter `update-circuits-FIXED.sql`
- [ ] Configurer les webhooks (optionnel)
- [ ] Configurer les emails automatiques (optionnel)

### **Frontend**
- [x] Page `CircuitsManagement.tsx` créée
- [x] Page `CircuitBookingsManagement.tsx` créée
- [ ] Ajouter les routes dans `App.tsx`
- [ ] Ajouter au menu du dashboard admin
- [ ] Tester la création d'un circuit
- [ ] Tester la modification d'un circuit
- [ ] Tester la visualisation des réservations

### **Tests**
- [ ] Créer un circuit de test
- [ ] Faire une réservation de test
- [ ] Vérifier que la réservation apparaît dans le dashboard
- [ ] Tester le changement de statut
- [ ] Tester l'export CSV
- [ ] Tester les filtres

---

## 🚀 **PROCHAINES ÉTAPES**

1. **Intégrer les pages au dashboard** (routes + menu)
2. **Exécuter le script SQL** pour les données
3. **Tester le système complet**
4. **Configurer les notifications** (email/SMS)
5. **Former l'équipe** à l'utilisation du dashboard

---

## 📞 **SUPPORT**

### **Problèmes courants**

**Les réservations n'apparaissent pas** :
- Vérifier que la table `bookings` existe
- Vérifier les permissions RLS dans Supabase
- Regarder la console pour les erreurs

**Impossible de modifier un circuit** :
- Vérifier les permissions de l'utilisateur admin
- Vérifier que tous les champs requis sont remplis

**Export CSV ne fonctionne pas** :
- Vérifier que le navigateur autorise les téléchargements
- Essayer dans un autre navigateur

---

**Dashboard admin complet pour gérer circuits et réservations !** 🎉

**Tout est centralisé et facile à utiliser !** 🚀
