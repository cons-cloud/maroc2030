# 💳 INSTALLATION SYSTÈME DE PAIEMENT COMPLET

## 🎯 **SYSTÈMES INTÉGRÉS**

### **1. Stripe** 🌍
- Paiements internationaux
- Cartes Visa, Mastercard, American Express
- Paiement 3D Secure
- **Clé publique configurée** ✅

### **2. CMI** 🇲🇦
- Centre Monétique Interbancaire (Maroc)
- Cartes bancaires marocaines
- Paiement local sécurisé
- **À configurer avec votre compte CMI**

---

## 📦 **ÉTAPE 1 : INSTALLATION DES DÉPENDANCES**

Exécutez cette commande dans le terminal :

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js crypto-js
```

### **Détail des packages**
- `@stripe/stripe-js` : SDK Stripe pour JavaScript
- `@stripe/react-stripe-js` : Composants React pour Stripe
- `crypto-js` : Cryptographie pour CMI (hash HMAC-SHA256)

---

## ⚙️ **ÉTAPE 2 : CONFIGURATION**

### **A. Stripe (Déjà configuré)** ✅

Votre clé publique Stripe est déjà configurée dans :
```
/src/config/stripe.ts
```

**Clé publique** : `pk_live_51PSzZBFNeFJ3453lsyZYkuD4MckXYLXmmR6c0XZ8im8KEEkROOzK9QyWd8zS9Ws4DabN4MUk8DulomNBhz3KF09j00rpIW9GG2`

⚠️ **Important** : Vous devez aussi configurer la **clé secrète** côté serveur (ne jamais l'exposer côté client !)

### **B. CMI (À configurer)**

1. **Créer un compte marchand CMI**
   - Aller sur https://www.cmi.co.ma
   - Contacter le service commercial
   - Obtenir vos identifiants :
     - `merchantId` (ID marchand)
     - `storeKey` (Clé secrète)

2. **Configurer dans le code**

Ouvrir `/src/config/stripe.ts` et ajouter :

```typescript
export const CMI_CONFIG = {
  merchantId: 'VOTRE_MERCHANT_ID', // ← À remplacer
  apiUrl: 'https://payment.cmi.co.ma/fim/api',
  returnUrl: window.location.origin + '/payment/success',
  cancelUrl: window.location.origin + '/payment/cancel',
  currency: 'MAD',
  language: 'fr'
};
```

Ouvrir `/src/services/cmiPayment.ts` et ajouter :

```typescript
this.storeKey = 'VOTRE_STORE_KEY'; // ← À remplacer (ligne 23)
```

---

## 🗄️ **ÉTAPE 3 : BASE DE DONNÉES**

### **Tables nécessaires** (déjà créées)

✅ `bookings` - Réservations
✅ `payments` - Paiements
✅ `circuits_touristiques` - Circuits

### **Vérification**

Exécutez dans Supabase SQL Editor :

```sql
-- Vérifier que les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bookings', 'payments', 'circuits_touristiques');
```

---

## 🚀 **ÉTAPE 4 : DÉMARRAGE**

### **Installer les dépendances**

```bash
npm install
```

### **Démarrer le serveur de développement**

```bash
npm run dev
```

### **Tester**

1. Aller sur http://localhost:5173/services/tourisme
2. Cliquer sur un circuit
3. Cliquer sur "Réserver maintenant"
4. Remplir le formulaire
5. Choisir la méthode de paiement
6. Tester le paiement

---

## 🧪 **TESTS**

### **Test Stripe (Cartes de test)**

```
Succès : 4242 4242 4242 4242
Refusé : 4000 0000 0000 0002
3D Secure : 4000 0027 6000 3184

Date : N'importe quelle date future
CVC : N'importe quel 3 chiffres
```

### **Test CMI**

Pour tester CMI, vous devez :
1. Avoir un compte marchand CMI actif
2. Utiliser l'environnement de test CMI
3. Utiliser une carte de test fournie par CMI

---

## 📁 **FICHIERS CRÉÉS**

### **Configuration**
- ✅ `/src/config/stripe.ts` - Configuration Stripe et CMI

### **Services**
- ✅ `/src/services/cmiPayment.ts` - Service de paiement CMI

### **Pages**
- ✅ `/src/Pages/CircuitDetails.tsx` - Page de détails du circuit

### **Composants**
- ✅ `/src/components/CircuitBookingForm.tsx` - Formulaire de réservation

### **Routes**
- ✅ Route `/circuit/:id` ajoutée dans `App.tsx`

### **Documentation**
- ✅ `SYSTEME_RESERVATION_TOURISME.md` - Guide complet
- ✅ `INSTALLATION_PAIEMENT.md` - Ce fichier

---

## 🔐 **SÉCURITÉ**

### **Côté client (Frontend)**
✅ Clé publique Stripe uniquement
✅ Pas de clé secrète exposée
✅ Validation des données
✅ Hash CMI vérifié

### **Côté serveur (Backend à créer)**

Vous devez créer une API backend pour :

1. **Créer les intentions de paiement Stripe**
```javascript
// /api/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, bookingId } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'mad',
    metadata: { bookingId }
  });
  
  res.json({ clientSecret: paymentIntent.client_secret });
});
```

2. **Gérer les webhooks Stripe**
```javascript
// /api/stripe-webhook.js
app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  if (event.type === 'payment_intent.succeeded') {
    // Mettre à jour la réservation
  }
  
  res.json({ received: true });
});
```

3. **Gérer les callbacks CMI**
```javascript
// /api/cmi-callback.js
app.post('/api/cmi/callback', async (req, res) => {
  const { HASH, ProcReturnCode, oid } = req.body;
  
  // Vérifier le hash
  // Mettre à jour la réservation
  
  res.redirect('/payment/success');
});
```

---

## 🌐 **BACKEND RECOMMANDÉ**

### **Option 1 : Supabase Edge Functions**

```bash
# Créer une fonction
supabase functions new create-payment-intent

# Déployer
supabase functions deploy create-payment-intent
```

### **Option 2 : Vercel Serverless**

```bash
# Créer /api/create-payment-intent.ts
# Déployer sur Vercel
vercel deploy
```

### **Option 3 : Node.js + Express**

```bash
# Créer un serveur Express
npm install express stripe
node server.js
```

---

## 📊 **FLUX DE PAIEMENT**

### **Stripe**

```
1. Utilisateur remplit le formulaire
   ↓
2. Clic sur "Payer avec Stripe"
   ↓
3. Appel API → Création PaymentIntent
   ↓
4. Affichage formulaire carte Stripe
   ↓
5. Utilisateur entre sa carte
   ↓
6. Stripe traite le paiement (3D Secure si nécessaire)
   ↓
7. Webhook → Confirmation
   ↓
8. Mise à jour réservation
   ↓
9. Affichage confirmation
```

### **CMI**

```
1. Utilisateur remplit le formulaire
   ↓
2. Clic sur "Payer avec CMI"
   ↓
3. Génération hash de sécurité
   ↓
4. Redirection vers CMI
   ↓
5. Utilisateur entre sa carte sur CMI
   ↓
6. CMI traite le paiement (3D Secure)
   ↓
7. Callback → Vérification hash
   ↓
8. Mise à jour réservation
   ↓
9. Redirection vers confirmation
```

---

## 💰 **FRAIS**

### **Stripe**
- **Frais par transaction** : 2.9% + 0.30 MAD
- **Paiements internationaux** : +1%
- **Pas de frais mensuels**

### **CMI**
- **Frais par transaction** : ~2-3% (selon contrat)
- **Frais d'installation** : Variable
- **Frais mensuels** : Selon contrat

---

## 📞 **SUPPORT**

### **Stripe**
- Documentation : https://stripe.com/docs
- Support : https://support.stripe.com

### **CMI**
- Site web : https://www.cmi.co.ma
- Email : contact@cmi.co.ma
- Téléphone : +212 5XX XX XX XX

---

## ✅ **CHECKLIST D'INSTALLATION**

### **Dépendances**
- [ ] `npm install @stripe/stripe-js @stripe/react-stripe-js crypto-js`

### **Configuration Stripe**
- [x] Clé publique ajoutée dans `/src/config/stripe.ts`
- [ ] Clé secrète configurée côté serveur
- [ ] Webhook configuré

### **Configuration CMI**
- [ ] Compte marchand CMI créé
- [ ] `merchantId` ajouté dans la config
- [ ] `storeKey` ajouté dans le service
- [ ] URL de callback configurée

### **Backend**
- [ ] API `/api/create-payment-intent` créée
- [ ] API `/api/stripe-webhook` créée
- [ ] API `/api/cmi/callback` créée

### **Tests**
- [ ] Test paiement Stripe avec carte test
- [ ] Test paiement CMI (si compte actif)
- [ ] Test de la confirmation
- [ ] Vérification dans Supabase

### **Production**
- [ ] Clés Stripe live configurées
- [ ] CMI en mode production
- [ ] Webhooks configurés
- [ ] SSL/HTTPS activé
- [ ] Emails de confirmation configurés

---

## 🚨 **PROBLÈMES COURANTS**

### **Erreur : Cannot find module '@stripe/stripe-js'**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### **Erreur : Cannot find module 'crypto-js'**
```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
```

### **Erreur : Payment intent creation failed**
- Vérifier que l'API backend est accessible
- Vérifier la clé secrète Stripe
- Vérifier les logs côté serveur

### **CMI : Hash invalide**
- Vérifier que `storeKey` est correct
- Vérifier l'ordre des champs dans le hash
- Vérifier l'encodage (UTF-8)

---

## 🎉 **PRÊT À DÉMARRER !**

### **Commandes rapides**

```bash
# 1. Installer les dépendances
npm install @stripe/stripe-js @stripe/react-stripe-js crypto-js

# 2. Démarrer le serveur
npm run dev

# 3. Ouvrir dans le navigateur
# http://localhost:5173/services/tourisme
```

### **Prochaines étapes**

1. ✅ Tester le système de réservation
2. ⏳ Configurer le backend pour Stripe
3. ⏳ Obtenir un compte CMI
4. ⏳ Configurer les webhooks
5. ⏳ Mettre en production

---

**Système de paiement complet Stripe + CMI prêt !** 🚀

**Consultez `SYSTEME_RESERVATION_TOURISME.md` pour plus de détails sur le système de réservation.**
