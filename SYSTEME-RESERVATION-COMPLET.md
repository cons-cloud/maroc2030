# 🎯 SYSTÈME DE RÉSERVATION COMPLET

## 📋 **FLUX DE RÉSERVATION**

### **1. Visiteur Non Connecté**
```
Visiteur clique "Réserver"
    ↓
Vérification : Est-il connecté ?
    ↓ NON
Modal : "Connectez-vous pour réserver"
    ↓
Boutons : [Se connecter] [Créer un compte]
    ↓
Redirection vers Login/Inscription
    ↓
Après connexion → Retour à la page du service
    ↓
Peut maintenant réserver
```

### **2. Client Connecté**
```
Client clique "Réserver"
    ↓
Vérification : Est-il connecté ?
    ↓ OUI
Formulaire de réservation s'ouvre
    ↓
Client remplit : dates, options, etc.
    ↓
Validation et calcul du prix
    ↓
Page de paiement
    ↓
Paiement effectué
    ↓
Réservation enregistrée dans Supabase
    ↓
Synchronisation automatique :
  - Dashboard Client (Mes Réservations)
  - Dashboard Admin (Gestion Réservations)
  - Dashboard Partenaire (Mes Réservations)
```

---

## 🔄 **SYNCHRONISATION TOTALE**

### **Base de Données Supabase**
```sql
-- Tables principales
- profiles (utilisateurs)
- bookings (réservations)
- payments (paiements)
- services (produits/services)
- locations_voitures
- circuits_touristiques
- activites_touristiques
- hotels
- villas
- appartements
```

### **Flux de Données**
```
SUPABASE (Source de vérité)
    ↓
    ├─→ SITE WEB PUBLIC
    │   - Affichage des services
    │   - Bouton "Réserver"
    │   - Vérification authentification
    │
    ├─→ DASHBOARD CLIENT
    │   - Mes Réservations (lecture)
    │   - Annuler réservation (écriture)
    │   - Mon Profil (lecture/écriture)
    │
    ├─→ DASHBOARD ADMIN
    │   - Toutes les réservations (lecture)
    │   - Gestion réservations (écriture)
    │   - Gestion utilisateurs (lecture/écriture)
    │   - Gestion services (lecture/écriture)
    │
    └─→ DASHBOARD PARTENAIRE
        - Mes réservations (lecture)
        - Mes services (lecture/écriture)
        - Mes gains (lecture)
```

---

## 🔐 **AUTORISATIONS PAR RÔLE**

### **Client**
- ✅ Voir ses propres réservations
- ✅ Créer une réservation
- ✅ Annuler sa réservation (si statut = pending/confirmed)
- ✅ Modifier son profil
- ❌ Voir les réservations des autres
- ❌ Gérer les services

### **Partenaire**
- ✅ Voir les réservations de SES services
- ✅ Confirmer/Annuler les réservations
- ✅ Gérer SES services (ajouter, modifier, supprimer)
- ✅ Voir SES gains
- ❌ Voir les réservations des autres partenaires
- ❌ Gérer les utilisateurs

### **Admin**
- ✅ Voir TOUTES les réservations
- ✅ Gérer TOUS les services
- ✅ Gérer TOUS les utilisateurs
- ✅ Gérer TOUS les partenaires
- ✅ Voir TOUS les paiements
- ✅ Accès complet à tout

---

## 📊 **TABLES SUPABASE**

### **1. Réservations (bookings)**
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES profiles(id),
  service_id UUID REFERENCES services(id),
  partner_id UUID REFERENCES profiles(id),
  status TEXT, -- pending, confirmed, cancelled, completed
  start_date DATE,
  end_date DATE,
  total_price DECIMAL,
  payment_status TEXT, -- pending, paid, refunded
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **2. Paiements (payments)**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  user_id UUID REFERENCES profiles(id),
  amount DECIMAL,
  status TEXT, -- pending, paid, failed, refunded
  payment_method TEXT, -- card, cash, bank_transfer
  transaction_id TEXT,
  created_at TIMESTAMP
);
```

---

## 🔧 **COMPOSANTS À CRÉER**

### **1. AuthGuard Component**
Vérifie si l'utilisateur est connecté avant de réserver
```tsx
// src/components/AuthGuard.tsx
- Vérifie l'authentification
- Affiche modal si non connecté
- Redirige vers login/inscription
```

### **2. BookingModal Component**
Formulaire de réservation pour clients connectés
```tsx
// src/components/BookingModal.tsx
- Formulaire de réservation
- Sélection dates
- Calcul du prix
- Validation
- Envoi à Supabase
```

### **3. PaymentModal Component**
Gestion du paiement
```tsx
// src/components/PaymentModal.tsx
- Choix du mode de paiement
- Traitement du paiement
- Confirmation
- Enregistrement dans Supabase
```

---

## 🎯 **IMPLÉMENTATION**

### **Étape 1 : Vérification Authentification**
```tsx
const handleReservation = () => {
  if (!user) {
    // Afficher modal "Connectez-vous"
    setShowAuthModal(true);
  } else {
    // Ouvrir formulaire de réservation
    setShowBookingModal(true);
  }
};
```

### **Étape 2 : Création de la Réservation**
```tsx
const createBooking = async (bookingData) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      client_id: user.id,
      service_id: serviceId,
      partner_id: partnerId,
      status: 'pending',
      start_date: bookingData.startDate,
      end_date: bookingData.endDate,
      total_price: bookingData.totalPrice,
      payment_status: 'pending'
    }]);
  
  if (!error) {
    // Rediriger vers paiement
    navigate('/payment', { state: { bookingId: data.id } });
  }
};
```

### **Étape 3 : Traitement du Paiement**
```tsx
const processPayment = async (paymentData) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([{
      booking_id: bookingId,
      user_id: user.id,
      amount: totalPrice,
      status: 'paid',
      payment_method: paymentData.method
    }]);
  
  if (!error) {
    // Mettre à jour le statut de la réservation
    await supabase
      .from('bookings')
      .update({ 
        status: 'confirmed',
        payment_status: 'paid'
      })
      .eq('id', bookingId);
    
    // Notification de succès
    toast.success('Réservation confirmée !');
    navigate('/dashboard/client/bookings');
  }
};
```

---

## 🔄 **SYNCHRONISATION EN TEMPS RÉEL**

### **Supabase Realtime**
```tsx
// Écouter les changements en temps réel
useEffect(() => {
  const subscription = supabase
    .channel('bookings')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'bookings' },
      (payload) => {
        // Recharger les données
        loadBookings();
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## ✅ **RÉSULTAT FINAL**

### **Pour le Visiteur**
1. Visite le site
2. Clique "Réserver"
3. Voit "Connectez-vous pour réserver"
4. Se connecte ou crée un compte
5. Peut maintenant réserver

### **Pour le Client Connecté**
1. Clique "Réserver"
2. Remplit le formulaire
3. Effectue le paiement
4. Voit sa réservation dans "Mes Réservations"

### **Pour le Partenaire**
1. Voit les nouvelles réservations de SES services
2. Peut confirmer/annuler
3. Voit ses gains

### **Pour l'Admin**
1. Voit TOUTES les réservations
2. Peut gérer tout le système
3. Accès complet

**Synchronisation automatique entre tous les dashboards et Supabase !** 🎉
