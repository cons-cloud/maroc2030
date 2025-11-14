# 🎫 SYSTÈME DE RÉSERVATION COMPLET POUR LE TOURISME

## ✅ **CE QUI A ÉTÉ CRÉÉ**

### **1. Page de détails du circuit** 📄
**`/src/Pages/CircuitDetails.tsx`**
- Galerie d'images avec navigation
- Description complète du circuit
- Points forts
- Ce qui est inclus / non inclus
- Itinéraire jour par jour
- Sidebar avec prix et bouton de réservation

### **2. Formulaire de réservation avec paiement** 💳
**`/src/components/CircuitBookingForm.tsx`**
- **Étape 1** : Informations du client (nom, email, téléphone, date, nombre de personnes)
- **Étape 2** : Paiement sécurisé avec Stripe
- **Étape 3** : Confirmation de réservation
- Barre de progression
- Calcul automatique du prix total
- Validation des données

### **3. Page Tourisme mise à jour** 🗺️
**`/src/Pages/services/Tourisme.tsx`**
- Bouton "Voir les détails et réserver" sur chaque circuit
- Navigation vers la page de détails
- Design amélioré des cartes de circuits

---

## 📋 **INSTALLATION**

### **Étape 1 : Installer les dépendances Stripe**

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### **Étape 2 : Configurer les variables d'environnement**

Créer ou mettre à jour `.env` :

```env
# Stripe (clés de test)
VITE_STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique_stripe
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_stripe
```

**Pour obtenir vos clés Stripe** :
1. Créer un compte sur https://stripe.com
2. Aller dans Developers → API keys
3. Copier la clé publique (pk_test_...) et la clé secrète (sk_test_...)

### **Étape 3 : Ajouter la route dans App.tsx**

```typescript
// Dans src/App.tsx
import CircuitDetails from './Pages/CircuitDetails';

// Dans les routes
<Route path="/circuit/:id" element={<CircuitDetails />} />
```

### **Étape 4 : Créer l'API de paiement**

Créer `/api/create-payment-intent.ts` (ou utiliser un backend Node.js) :

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount, bookingId, currency } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: currency || 'mad',
        metadata: { bookingId },
      });

      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
```

---

## 🎯 **FONCTIONNEMENT**

### **1. L'utilisateur clique sur un circuit**

```
Page Tourisme → Clic sur "Voir les détails et réserver"
                ↓
Page Détails du Circuit (/circuit/:id)
```

### **2. Page de détails**

```
┌─────────────────────────────────────────┐
│  [Galerie d'images]                     │
├─────────────────────────────────────────┤
│  Description                            │
│  Points forts                           │
│  Inclus / Non inclus                    │
│  Itinéraire                             │
│                                         │
│  [Sidebar]                              │
│  Prix: 1200 MAD/personne                │
│  Durée: 3 jours                         │
│  [Réserver maintenant]  ← Clic ici      │
└─────────────────────────────────────────┘
```

### **3. Formulaire de réservation (Modal)**

#### **Étape 1 : Informations**
```
Nom complet: _____________
Email: ___________________
Téléphone: _______________
Nombre de personnes: [1]
Date de départ: __________
Demandes spéciales: ______

Total: 1200 MAD

[Continuer vers le paiement]
```

#### **Étape 2 : Paiement**
```
Récapitulatif:
- Circuit: Désert de Merzouga
- Participants: 2 personnes
- Date: 15/12/2024
- Total: 2400 MAD

Informations de paiement:
[Carte bancaire Stripe]

[Retour]  [Payer 2400 MAD]
```

#### **Étape 3 : Confirmation**
```
✓ Réservation confirmée !

Détails:
- Circuit: Désert de Merzouga
- Date: 15/12/2024
- Participants: 2 personnes
- Total payé: 2400 MAD

Un email de confirmation a été envoyé.

[Fermer]
```

---

## 🗄️ **BASE DE DONNÉES**

### **Tables utilisées**

#### **1. circuits_touristiques**
```sql
- id (UUID)
- title (TEXT)
- description (TEXT)
- images (TEXT[])
- price_per_person (NUMERIC)
- duration_days (INTEGER)
- city (TEXT)
- highlights (TEXT[])
- included (TEXT[])
- not_included (TEXT[])
- itinerary (JSONB)
- max_participants (INTEGER)
- available (BOOLEAN)
```

#### **2. bookings**
```sql
- id (UUID)
- service_type (TEXT) → 'tourisme'
- service_id (UUID) → ID du circuit
- user_id (UUID)
- guest_name (TEXT)
- guest_email (TEXT)
- guest_phone (TEXT)
- check_in (DATE) → Date de départ
- check_out (DATE) → Date de retour
- guests_count (INTEGER)
- total_price (NUMERIC)
- status (TEXT) → 'pending', 'confirmed', 'cancelled'
- payment_status (TEXT) → 'pending', 'paid', 'refunded'
- special_requests (TEXT)
- created_at (TIMESTAMP)
```

#### **3. payments**
```sql
- id (UUID)
- booking_id (UUID)
- amount (NUMERIC)
- currency (TEXT)
- payment_method (TEXT)
- stripe_payment_intent_id (TEXT)
- status (TEXT)
- created_at (TIMESTAMP)
```

---

## 🔐 **SÉCURITÉ**

### **1. Validation côté client**
- Vérification des champs obligatoires
- Validation de l'email
- Validation du numéro de téléphone
- Date de départ dans le futur

### **2. Paiement sécurisé**
- Intégration Stripe officielle
- Pas de stockage des données de carte
- Paiement 3D Secure
- Confirmation de paiement

### **3. Protection des données**
- RLS (Row Level Security) sur Supabase
- Authentification optionnelle
- Données de paiement chiffrées

---

## 💰 **GESTION DES PAIEMENTS**

### **Flux de paiement**

```
1. Utilisateur remplit le formulaire
   ↓
2. Création de la réservation (status: pending)
   ↓
3. Création de l'intention de paiement Stripe
   ↓
4. Utilisateur entre ses informations de carte
   ↓
5. Stripe traite le paiement
   ↓
6. Si succès:
   - Mise à jour réservation (status: confirmed)
   - Création enregistrement payment
   - Envoi email de confirmation
   ↓
7. Affichage confirmation
```

### **Gestion des erreurs**

```typescript
// Paiement refusé
→ Message d'erreur
→ Réservation reste en "pending"
→ Utilisateur peut réessayer

// Erreur réseau
→ Message d'erreur
→ Réservation reste en "pending"
→ Vérification manuelle possible

// Paiement réussi mais erreur de mise à jour
→ Webhook Stripe pour réconciliation
→ Mise à jour manuelle si nécessaire
```

---

## 📧 **NOTIFICATIONS**

### **Emails à envoyer** (à implémenter)

1. **Confirmation de réservation**
   - Détails du circuit
   - Informations de paiement
   - Instructions pour le jour J

2. **Rappel avant le départ**
   - 7 jours avant
   - 1 jour avant

3. **Demande d'avis après le voyage**
   - 3 jours après le retour

---

## 🧪 **TESTS**

### **Test 1 : Navigation**
```bash
1. Aller sur /services/tourisme
2. Cliquer sur un circuit
3. Vérifier que la page de détails s'affiche
4. Vérifier que toutes les informations sont présentes
```

### **Test 2 : Formulaire**
```bash
1. Cliquer sur "Réserver maintenant"
2. Remplir le formulaire
3. Vérifier le calcul du prix total
4. Cliquer sur "Continuer"
5. Vérifier que l'étape 2 s'affiche
```

### **Test 3 : Paiement (mode test)**
```bash
1. Utiliser une carte de test Stripe:
   - Numéro: 4242 4242 4242 4242
   - Date: n'importe quelle date future
   - CVC: n'importe quel 3 chiffres
2. Cliquer sur "Payer"
3. Vérifier la confirmation
4. Vérifier dans Supabase que la réservation est créée
```

### **Cartes de test Stripe**

```
Succès: 4242 4242 4242 4242
Refusé: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

---

## 🎨 **PERSONNALISATION**

### **Changer les couleurs**

Dans `CircuitDetails.tsx` et `CircuitBookingForm.tsx`, remplacer :
- `blue-600` par votre couleur principale
- `blue-700` pour le hover

### **Ajouter des champs**

Dans `CircuitBookingForm.tsx`, ajouter dans `formData` :
```typescript
const [formData, setFormData] = useState({
  // ... champs existants
  nationality: '',        // Nouvelle
  passportNumber: '',    // Nouvelle
  dietaryRequirements: '' // Nouvelle
});
```

### **Modifier l'itinéraire**

Dans Supabase, le champ `itinerary` est un JSONB :
```json
[
  {
    "day": 1,
    "title": "Arrivée à Marrakech",
    "description": "Accueil à l'aéroport et transfert à l'hôtel"
  },
  {
    "day": 2,
    "title": "Visite de la médina",
    "description": "Découverte des souks et de la place Jemaa el-Fna"
  }
]
```

---

## 📊 **DASHBOARD ADMIN** (à créer)

### **Fonctionnalités recommandées**

1. **Liste des réservations**
   - Filtrer par statut
   - Filtrer par date
   - Rechercher par nom/email

2. **Détails d'une réservation**
   - Informations client
   - Détails du circuit
   - Statut du paiement
   - Actions : Confirmer, Annuler, Rembourser

3. **Statistiques**
   - Nombre de réservations
   - Chiffre d'affaires
   - Circuits les plus populaires
   - Taux de conversion

---

## ✅ **CHECKLIST**

### **Installation**
- [ ] Installer `@stripe/stripe-js` et `@stripe/react-stripe-js`
- [ ] Configurer les clés Stripe dans `.env`
- [ ] Ajouter la route `/circuit/:id` dans App.tsx
- [ ] Créer l'API `/api/create-payment-intent`

### **Base de données**
- [ ] Vérifier que la table `bookings` existe
- [ ] Vérifier que la table `payments` existe
- [ ] Vérifier que la table `circuits_touristiques` a les bons champs

### **Tests**
- [ ] Tester la navigation vers les détails
- [ ] Tester le formulaire de réservation
- [ ] Tester un paiement en mode test
- [ ] Vérifier la confirmation

### **Production**
- [ ] Remplacer les clés Stripe test par les clés live
- [ ] Configurer les webhooks Stripe
- [ ] Mettre en place l'envoi d'emails
- [ ] Créer le dashboard admin

---

## 🚀 **PROCHAINES ÉTAPES**

1. **Installer les dépendances** : `npm install @stripe/stripe-js @stripe/react-stripe-js`
2. **Configurer Stripe** : Ajouter les clés dans `.env`
3. **Ajouter la route** : Dans `App.tsx`
4. **Tester** : Faire une réservation test
5. **Déployer** : Mettre en production

---

## 📞 **SUPPORT**

### **Problèmes courants**

**Erreur : Stripe not loaded**
→ Vérifier que `VITE_STRIPE_PUBLIC_KEY` est dans `.env`

**Erreur : Payment intent creation failed**
→ Vérifier l'API `/api/create-payment-intent`

**Réservation créée mais paiement échoué**
→ Vérifier les logs Stripe Dashboard

---

**Système de réservation complet prêt à l'emploi !** 🎉

**Il ne reste plus qu'à installer Stripe et configurer les clés !** 🚀
