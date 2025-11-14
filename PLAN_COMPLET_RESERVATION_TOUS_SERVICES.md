# 🎯 PLAN COMPLET - SYSTÈME DE RÉSERVATION POUR TOUS LES SERVICES

## 📋 **OBJECTIF**

Créer un système de réservation complet pour :
- ✅ Appartements
- ✅ Hôtels  
- ✅ Villas
- ✅ Locations de voitures

**Exactement comme pour les circuits** :
- Formulaire de réservation dynamique
- Paiement Stripe + CMI
- Synchronisé avec dashboard admin
- Tout enregistré dans Supabase

---

## 🗂️ **STRUCTURE**

### **1. FICHIERS À CRÉER**

#### **A. Composants de réservation**
```
/src/components/
├── UniversalBookingForm.tsx       (Formulaire universel)
├── AppartementBookingForm.tsx     (Spécifique appartements)
├── HotelBookingForm.tsx           (Spécifique hôtels)
├── VillaBookingForm.tsx           (Spécifique villas)
└── CarRentalBookingForm.tsx       (Spécifique voitures)
```

#### **B. Pages de détails**
```
/src/Pages/
├── AppartementDetails.tsx         (Détails appartement)
├── HotelDetails.tsx               (Détails hôtel)
├── VillaDetails.tsx               (Détails villa)
└── CarDetails.tsx                 (Détails voiture)
```

#### **C. Pages dashboard admin**
```
/src/Pages/dashboards/admin/
├── AppartementBookingsManagement.tsx
├── HotelBookingsManagement.tsx
├── VillaBookingsManagement.tsx
├── CarRentalBookingsManagement.tsx
└── AllBookingsManagement.tsx      (Vue globale)
```

---

## 🔄 **FLUX POUR CHAQUE SERVICE**

### **APPARTEMENTS**

```
1. Client sur /services/appartements
   ↓ SELECT FROM appartements
   
2. Clique sur un appartement
   ↓ Navigation /appartement/:id
   
3. Page AppartementDetails
   ↓ Affiche : prix/nuit, chambres, max invités, équipements
   
4. Clique "Réserver"
   ↓ Formulaire AppartementBookingForm
   
5. Remplit :
   - Nom, email, téléphone
   - Date d'arrivée / départ
   - Nombre d'invités
   - Demandes spéciales
   ↓
   
6. Paie avec Stripe/CMI
   ↓
   
7. INSERT INTO bookings
   {
     service_type: 'appartement',
     service_id: appartement.id,
     service_title: appartement.title,
     check_in_date,
     check_out_date,
     number_of_guests,
     number_of_nights,
     total_price,
     ...
   }
   ↓
   
8. INSERT INTO payments
   ↓
   
9. Admin voit dans /dashboard/admin/appartement-bookings
```

### **HÔTELS**

```
Même flux + champs spécifiques :
- Type de chambre (Simple, Double, Suite)
- Nombre de chambres
- Petit-déjeuner inclus ?
```

### **VILLAS**

```
Même flux + champs spécifiques :
- Nombre de chambres
- Piscine privée ?
- Chef à domicile ?
```

### **LOCATIONS DE VOITURES**

```
Flux différent :
- Date/heure de prise en charge
- Date/heure de retour
- Lieu de prise en charge
- Lieu de retour
- Assurance ?
- Conducteur supplémentaire ?
```

---

## 📊 **TABLE BOOKINGS UNIFIÉE**

Une seule table pour tous les services :

```sql
bookings {
  id
  service_type              ('appartement', 'hotel', 'villa', 'voiture', 'circuit')
  service_id                (UUID du service)
  service_title             (Nom du service)
  
  -- Client
  client_name
  client_email
  client_phone
  
  -- Dates
  check_in_date             (Arrivée / Prise en charge)
  check_out_date            (Départ / Retour)
  
  -- Quantités
  number_of_guests          (Pour hébergements)
  number_of_nights          (Pour hébergements)
  number_of_days            (Pour voitures)
  number_of_people          (Pour circuits)
  
  -- Spécifiques
  room_type                 (Pour hôtels)
  pickup_location           (Pour voitures)
  dropoff_location          (Pour voitures)
  custom_duration           (Pour circuits)
  
  -- Paiement
  total_price
  payment_status
  payment_method
  
  -- Autre
  special_requests
  created_at
}
```

---

## 🎨 **COMPOSANT UNIVERSEL**

### **UniversalBookingForm.tsx**

Composant réutilisable qui s'adapte au type de service :

```typescript
interface UniversalBookingFormProps {
  serviceType: 'appartement' | 'hotel' | 'villa' | 'voiture' | 'circuit';
  service: any;
  onClose: () => void;
}

const UniversalBookingForm = ({ serviceType, service, onClose }) => {
  // Champs communs
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Champs spécifiques selon le type
  const renderServiceSpecificFields = () => {
    switch(serviceType) {
      case 'appartement':
      case 'hotel':
      case 'villa':
        return (
          <>
            <DatePicker label="Date d'arrivée" />
            <DatePicker label="Date de départ" />
            <NumberInput label="Nombre d'invités" max={service.max_guests} />
          </>
        );
        
      case 'voiture':
        return (
          <>
            <DateTimePicker label="Prise en charge" />
            <DateTimePicker label="Retour" />
            <LocationInput label="Lieu de prise en charge" />
            <LocationInput label="Lieu de retour" />
          </>
        );
        
      case 'circuit':
        return (
          <>
            <NumberInput label="Nombre de personnes" max={service.max_participants} />
            <NumberInput label="Durée (jours)" />
            <DatePicker label="Date de départ" />
          </>
        );
    }
  };
  
  // Calcul du prix
  const calculatePrice = () => {
    switch(serviceType) {
      case 'appartement':
      case 'hotel':
      case 'villa':
        return service.price_per_night * numberOfNights;
        
      case 'voiture':
        return service.price_per_day * numberOfDays;
        
      case 'circuit':
        return service.price_per_person * numberOfPeople;
    }
  };
  
  // Enregistrement
  const handleSubmit = async () => {
    const booking = {
      service_type: serviceType,
      service_id: service.id,
      service_title: service.title,
      client_name: clientInfo.name,
      client_email: clientInfo.email,
      client_phone: clientInfo.phone,
      total_price: calculatePrice(),
      payment_status: 'pending',
      // ... champs spécifiques
    };
    
    await supabase.from('bookings').insert(booking);
    // ... paiement
  };
};
```

---

## 🎛️ **DASHBOARD ADMIN**

### **Vue globale : AllBookingsManagement.tsx**

```typescript
const AllBookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all'); // all, appartement, hotel, villa, voiture, circuit
  
  useEffect(() => {
    loadBookings();
  }, [filter]);
  
  const loadBookings = async () => {
    let query = supabase.from('bookings').select('*');
    
    if (filter !== 'all') {
      query = query.eq('service_type', filter);
    }
    
    const { data } = await query.order('created_at', { ascending: false });
    setBookings(data);
  };
  
  return (
    <div>
      <h1>Toutes les Réservations</h1>
      
      {/* Filtres */}
      <div className="filters">
        <button onClick={() => setFilter('all')}>Toutes</button>
        <button onClick={() => setFilter('appartement')}>Appartements</button>
        <button onClick={() => setFilter('hotel')}>Hôtels</button>
        <button onClick={() => setFilter('villa')}>Villas</button>
        <button onClick={() => setFilter('voiture')}>Voitures</button>
        <button onClick={() => setFilter('circuit')}>Circuits</button>
      </div>
      
      {/* Statistiques */}
      <div className="stats">
        <StatCard title="Total" value={bookings.length} />
        <StatCard title="Revenu" value={totalRevenue} />
        <StatCard title="En attente" value={pendingCount} />
      </div>
      
      {/* Liste */}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Service</th>
            <th>Client</th>
            <th>Dates</th>
            <th>Prix</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking.id}>
              <td>{formatDate(booking.created_at)}</td>
              <td>{booking.service_type}</td>
              <td>{booking.service_title}</td>
              <td>{booking.client_name}</td>
              <td>
                {booking.check_in_date} → {booking.check_out_date}
              </td>
              <td>{booking.total_price} MAD</td>
              <td>
                <select 
                  value={booking.payment_status}
                  onChange={(e) => updateStatus(booking.id, e.target.value)}
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </td>
              <td>
                <button onClick={() => viewDetails(booking)}>👁️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 📝 **CHECKLIST DE CRÉATION**

### **Phase 1 : Base de données** ⚠️
- [ ] Exécuter `COMPLETE-BOOKING-SYSTEM-ALL-SERVICES.sql`
- [ ] Vérifier que toutes les colonnes sont créées
- [ ] Vérifier les vues

### **Phase 2 : Composants de réservation**
- [ ] Créer `UniversalBookingForm.tsx`
- [ ] Créer `AppartementBookingForm.tsx`
- [ ] Créer `HotelBookingForm.tsx`
- [ ] Créer `VillaBookingForm.tsx`
- [ ] Créer `CarRentalBookingForm.tsx`

### **Phase 3 : Pages de détails**
- [ ] Créer `AppartementDetails.tsx`
- [ ] Créer `HotelDetails.tsx`
- [ ] Créer `VillaDetails.tsx`
- [ ] Créer `CarDetails.tsx`

### **Phase 4 : Dashboard admin**
- [ ] Créer `AllBookingsManagement.tsx`
- [ ] Créer `AppartementBookingsManagement.tsx`
- [ ] Créer `HotelBookingsManagement.tsx`
- [ ] Créer `VillaBookingsManagement.tsx`
- [ ] Créer `CarRentalBookingsManagement.tsx`

### **Phase 5 : Routes**
- [ ] Ajouter routes détails dans `App.tsx`
- [ ] Ajouter routes dashboard dans `App.tsx`

### **Phase 6 : Tests**
- [ ] Tester réservation appartement
- [ ] Tester réservation hôtel
- [ ] Tester réservation villa
- [ ] Tester location voiture
- [ ] Vérifier dashboard admin

---

## 🚀 **ORDRE D'EXÉCUTION**

1. **Exécuter le script SQL** (5 min)
2. **Créer le composant universel** (30 min)
3. **Créer les pages de détails** (1h)
4. **Créer les dashboards admin** (1h)
5. **Ajouter les routes** (10 min)
6. **Tester** (30 min)

**Total estimé : 3h15**

---

## 💡 **AVANTAGES DE CETTE APPROCHE**

✅ **Une seule table `bookings`** pour tout
✅ **Code réutilisable** (composant universel)
✅ **Dashboard centralisé** (vue globale)
✅ **Facile à maintenir**
✅ **Facile à étendre** (ajouter un nouveau service)

---

**Je vais maintenant créer tous ces fichiers !** 🚀

**Voulez-vous que je commence ?** 
1. Par le composant universel ?
2. Par les pages de détails ?
3. Par le dashboard admin ?
