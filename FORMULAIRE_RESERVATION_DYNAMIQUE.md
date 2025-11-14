# ✅ FORMULAIRE DE RÉSERVATION DYNAMIQUE

## 🎯 **PROBLÈME RÉSOLU**

Avant, le formulaire affichait des valeurs **fixes** que l'utilisateur ne pouvait pas modifier.

Maintenant, l'utilisateur peut **personnaliser sa réservation** !

---

## 📋 **CE QUI A ÉTÉ MODIFIÉ**

### **1. Nombre de personnes** 👥

**Avant** ❌
```
Nombre de personnes : 1 (fixe)
```

**Maintenant** ✅
```
Nombre de personnes : [  2  ] ← L'utilisateur peut saisir
Maximum : 15 personnes
```

- ✅ L'utilisateur **saisit le nombre** de personnes
- ✅ Affichage du **maximum autorisé** (ex: "Maximum : 15 personnes")
- ✅ **Validation automatique** : impossible de dépasser le max
- ✅ Le **prix total** se calcule automatiquement

### **2. Durée du séjour** 📅

**Avant** ❌
```
Durée : 3 jours (fixe)
```

**Maintenant** ✅
```
Durée du séjour (jours) : [  4  ] ← L'utilisateur peut modifier
Durée standard : 3 jours (modifiable)
```

- ✅ L'utilisateur peut **ajuster la durée**
- ✅ Affichage de la **durée standard** comme référence
- ✅ Possibilité de **prolonger ou raccourcir** le séjour

### **3. Date de départ** 📆

```
Date de départ : [ 15/11/2025 ] ← L'utilisateur choisit
```

- ✅ Calendrier interactif
- ✅ Impossible de choisir une date passée

---

## 🎨 **EXEMPLE D'UTILISATION**

### **Scénario 1 : Couple (2 personnes)**

```
Circuit : Désert de Merzouga
Prix : 1200 MAD/personne

┌─────────────────────────────────────┐
│ Nombre de personnes : [  2  ]      │
│ Maximum : 15 personnes              │
│                                     │
│ Durée du séjour : [  3  ] jours    │
│ Durée standard : 3 jours            │
│                                     │
│ Date de départ : [ 20/11/2025 ]    │
│                                     │
│ TOTAL : 2 400 MAD                   │
└─────────────────────────────────────┘
```

### **Scénario 2 : Famille (4 personnes, séjour prolongé)**

```
Circuit : Désert de Merzouga
Prix : 1200 MAD/personne

┌─────────────────────────────────────┐
│ Nombre de personnes : [  4  ]      │
│ Maximum : 15 personnes              │
│                                     │
│ Durée du séjour : [  5  ] jours    │
│ Durée standard : 3 jours            │
│                                     │
│ Date de départ : [ 25/11/2025 ]    │
│                                     │
│ TOTAL : 4 800 MAD                   │
└─────────────────────────────────────┘
```

### **Scénario 3 : Groupe (10 personnes)**

```
Circuit : Villes Impériales
Prix : 2500 MAD/personne

┌─────────────────────────────────────┐
│ Nombre de personnes : [ 10  ]      │
│ Maximum : 20 personnes              │
│                                     │
│ Durée du séjour : [  7  ] jours    │
│ Durée standard : 7 jours            │
│                                     │
│ Date de départ : [ 01/12/2025 ]    │
│                                     │
│ TOTAL : 25 000 MAD                  │
└─────────────────────────────────────┘
```

---

## ✅ **VALIDATIONS AUTOMATIQUES**

### **1. Nombre de personnes**

```javascript
// Minimum : 1 personne
if (numberOfPeople < 1) {
  ❌ "Le nombre de personnes doit être au moins 1"
}

// Maximum : selon le circuit
if (numberOfPeople > max_participants) {
  ❌ "Le nombre maximum de participants est 15"
}
```

### **2. Durée**

```javascript
// Minimum : 1 jour
if (duration < 1) {
  ❌ "La durée doit être au moins 1 jour"
}
```

### **3. Date**

```javascript
// Pas de date passée
if (date < today) {
  ❌ Impossible de sélectionner (désactivé dans le calendrier)
}
```

---

## 💰 **CALCUL DU PRIX TOTAL**

Le prix se calcule **automatiquement** :

```
Prix total = Prix par personne × Nombre de personnes
```

**Exemples** :

```
1200 MAD/pers × 2 personnes = 2 400 MAD
1200 MAD/pers × 4 personnes = 4 800 MAD
2500 MAD/pers × 10 personnes = 25 000 MAD
```

Le total s'affiche en **temps réel** quand l'utilisateur change le nombre de personnes !

---

## 🎯 **AVANTAGES**

### **Pour l'utilisateur** 👤

✅ **Flexibilité totale** : choisit son nombre de personnes et sa durée
✅ **Transparence** : voit le max autorisé et la durée standard
✅ **Calcul automatique** : pas besoin de calculer le prix total
✅ **Validation en direct** : sait immédiatement si c'est possible

### **Pour vous** 💼

✅ **Contrôle** : limite automatique selon max_participants
✅ **Données précises** : savez exactement combien de personnes et combien de jours
✅ **Moins d'erreurs** : validations automatiques
✅ **Meilleure expérience** : clients satisfaits = plus de réservations

---

## 📊 **DONNÉES ENREGISTRÉES**

Quand l'utilisateur réserve, vous recevez :

```json
{
  "circuit_id": "abc123",
  "circuit_title": "Désert de Merzouga",
  "client_name": "Ahmed Benali",
  "client_email": "ahmed@example.com",
  "client_phone": "+212 6XX XX XX XX",
  "number_of_people": 4,
  "custom_duration": 5,
  "start_date": "2025-11-25",
  "total_price": 4800,
  "special_requests": "Régime végétarien pour 2 personnes"
}
```

Vous savez **exactement** :
- Combien de personnes : **4**
- Combien de jours : **5** (au lieu de 3 standard)
- Quand : **25 novembre 2025**
- Combien : **4 800 MAD**

---

## 🧪 **TESTER**

### **Étape 1 : Exécuter le script SQL**

D'abord, assurez-vous que vos circuits ont `max_participants` :

```sql
-- Dans Supabase SQL Editor
-- Copier et exécuter update-circuits-FIXED.sql
```

### **Étape 2 : Lancer l'application**

```bash
npm run dev
```

### **Étape 3 : Tester la réservation**

1. Aller sur http://localhost:5173/services/tourisme
2. Cliquer sur un circuit
3. Cliquer sur "Réserver maintenant"
4. **Tester les champs** :
   - Saisir 2 personnes → Prix × 2
   - Saisir 10 personnes → Prix × 10
   - Essayer de saisir plus que le max → ❌ Erreur
   - Changer la durée de 3 à 5 jours → ✅ Accepté
   - Saisir 0 personne → ❌ Erreur

---

## 🎨 **PERSONNALISATION**

### **Changer le maximum de participants**

Dans Supabase :

```sql
-- Pour un circuit spécifique
UPDATE circuits_touristiques
SET max_participants = 25
WHERE title = 'Essaouira';

-- Pour tous les circuits courts (1 jour)
UPDATE circuits_touristiques
SET max_participants = 30
WHERE duration_days = 1;

-- Pour les circuits premium (petits groupes)
UPDATE circuits_touristiques
SET max_participants = 8
WHERE title ILIKE '%luxe%' OR title ILIKE '%premium%';
```

### **Ajouter une durée minimum**

Dans le formulaire, vous pouvez ajouter :

```typescript
// CircuitBookingForm.tsx
<input
  type="number"
  name="customDuration"
  min="1"
  max="14"  // ← Ajouter un maximum aussi
  ...
/>
```

### **Ajouter des tarifs dégressifs**

```typescript
// Calcul avec réduction pour groupes
const calculatePrice = () => {
  let pricePerPerson = circuit.price_per_person;
  
  // Réduction pour groupes
  if (formData.numberOfPeople >= 10) {
    pricePerPerson *= 0.9; // -10%
  } else if (formData.numberOfPeople >= 5) {
    pricePerPerson *= 0.95; // -5%
  }
  
  return pricePerPerson * formData.numberOfPeople;
};
```

---

## ✅ **RÉSUMÉ**

```
✅ Nombre de personnes : Modifiable par l'utilisateur
✅ Maximum affiché : "Maximum : 15 personnes"
✅ Durée : Modifiable (avec durée standard affichée)
✅ Date : Sélectionnable avec calendrier
✅ Prix total : Calculé automatiquement
✅ Validations : Automatiques et claires
✅ Données : Enregistrées dans Supabase
```

---

## 🎉 **C'EST PRÊT !**

Le formulaire est maintenant **100% dynamique** !

L'utilisateur peut :
- ✅ Choisir le nombre de personnes (avec limite)
- ✅ Modifier la durée du séjour
- ✅ Sélectionner sa date de départ
- ✅ Voir le prix total en temps réel

**Testez maintenant !** 🚀
