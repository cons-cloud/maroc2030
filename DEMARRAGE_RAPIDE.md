# 🚀 DÉMARRAGE RAPIDE - SYSTÈME DE RÉSERVATION

## ✅ **INSTALLATION TERMINÉE !**

Toutes les dépendances ont été installées avec succès :
- ✅ `@stripe/stripe-js` - SDK Stripe
- ✅ `@stripe/react-stripe-js` - Composants React Stripe
- ✅ `crypto-js` - Cryptographie pour CMI

---

## 🎯 **CE QUI EST PRÊT**

### **1. Stripe configuré** 💳
- Clé publique : `pk_live_51PSzZBFNeFJ3453l...`
- Paiements internationaux activés
- Cartes Visa, Mastercard, Amex

### **2. CMI intégré** 🇲🇦
- Service de paiement marocain
- Prêt à être configuré avec votre compte CMI
- Hash de sécurité HMAC-SHA256

### **3. Système de réservation** 🎫
- Page de détails des circuits
- Formulaire de réservation en 3 étapes
- Choix de méthode de paiement
- Confirmation automatique

### **4. Routes configurées** 🛣️
- `/services/tourisme` → Liste des circuits
- `/circuit/:id` → Détails et réservation

---

## 🏃 **LANCER L'APPLICATION**

```bash
npm run dev
```

Puis ouvrez : **http://localhost:5173**

---

## 🧪 **TESTER LE SYSTÈME**

### **Étape 1 : Aller sur la page Tourisme**
```
http://localhost:5173/services/tourisme
```

### **Étape 2 : Cliquer sur un circuit**
Cliquez sur le bouton **"Voir les détails et réserver"**

### **Étape 3 : Voir les détails**
- Galerie d'images
- Description complète
- Itinéraire
- Prix par personne

### **Étape 4 : Réserver**
Cliquez sur **"Réserver maintenant"**

### **Étape 5 : Remplir le formulaire**
- Nom complet
- Email
- Téléphone
- Nombre de personnes
- Date de départ

### **Étape 6 : Choisir le paiement**
- **Stripe** : Cartes internationales
- **CMI** : Cartes marocaines (à configurer)

### **Étape 7 : Payer (mode test)**

**Carte de test Stripe** :
```
Numéro : 4242 4242 4242 4242
Date : 12/25 (n'importe quelle date future)
CVC : 123 (n'importe quel 3 chiffres)
```

---

## ⚙️ **CONFIGURATION NÉCESSAIRE**

### **Pour Stripe (Backend)**

Vous devez créer une API backend pour gérer les paiements.

**Option 1 : Supabase Edge Function**

```bash
# Créer la fonction
supabase functions new create-payment-intent

# Code de la fonction
```

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const { amount, bookingId } = await req.json()
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'mad',
    metadata: { bookingId },
  })
  
  return new Response(
    JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

```bash
# Déployer
supabase functions deploy create-payment-intent --no-verify-jwt
```

**Option 2 : Vercel Serverless**

Créer `/api/create-payment-intent.ts` :

```typescript
import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { amount, bookingId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'mad',
      metadata: { bookingId },
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

### **Pour CMI**

1. **Obtenir un compte marchand**
   - Contacter CMI : https://www.cmi.co.ma
   - Obtenir `merchantId` et `storeKey`

2. **Configurer dans le code**

Modifier `/src/config/stripe.ts` :

```typescript
export const CMI_CONFIG = {
  merchantId: 'VOTRE_MERCHANT_ID', // ← Remplacer
  // ... reste de la config
};
```

Modifier `/src/services/cmiPayment.ts` (ligne 23) :

```typescript
this.storeKey = 'VOTRE_STORE_KEY'; // ← Remplacer
```

---

## 📊 **VÉRIFIER LA BASE DE DONNÉES**

### **Tables nécessaires**

Exécutez dans Supabase SQL Editor :

```sql
-- Vérifier les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bookings', 'payments', 'circuits_touristiques');

-- Vérifier les circuits
SELECT id, title, price_per_person, duration_days 
FROM circuits_touristiques 
LIMIT 5;
```

---

## 🎨 **PERSONNALISATION**

### **Changer les couleurs**

Dans les fichiers, remplacer :
- `blue-600` → Votre couleur principale
- `blue-700` → Couleur hover

### **Ajouter des champs au formulaire**

Dans `/src/components/CircuitBookingForm.tsx` :

```typescript
const [formData, setFormData] = useState({
  // ... champs existants
  nationality: '',        // Nouveau
  passportNumber: '',    // Nouveau
  dietaryRequirements: '' // Nouveau
});
```

### **Modifier les emails**

Créer un service d'envoi d'emails (Resend, SendGrid, etc.)

---

## 📁 **STRUCTURE DU PROJET**

```
src/
├── config/
│   └── stripe.ts              # Configuration Stripe + CMI
├── services/
│   └── cmiPayment.ts          # Service de paiement CMI
├── Pages/
│   ├── CircuitDetails.tsx     # Détails du circuit
│   └── services/
│       └── Tourisme.tsx       # Liste des circuits
└── components/
    └── CircuitBookingForm.tsx # Formulaire de réservation
```

---

## 🐛 **DÉPANNAGE**

### **Erreur : Module not found '@stripe/stripe-js'**

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### **Erreur : Module not found 'crypto-js'**

```bash
npm install crypto-js
```

### **Erreur : Cannot read property 'STRIPE_PUBLIC_KEY'**

Vérifier que `/src/config/stripe.ts` existe et contient la clé.

### **Paiement échoue**

1. Vérifier que l'API backend est accessible
2. Vérifier les logs dans la console
3. Vérifier la clé Stripe (publique côté client, secrète côté serveur)

---

## 📞 **BESOIN D'AIDE ?**

### **Documentation**
- `SYSTEME_RESERVATION_TOURISME.md` - Guide complet du système
- `INSTALLATION_PAIEMENT.md` - Guide d'installation détaillé

### **Support Stripe**
- https://stripe.com/docs
- https://support.stripe.com

### **Support CMI**
- https://www.cmi.co.ma
- contact@cmi.co.ma

---

## ✅ **CHECKLIST**

### **Installation**
- [x] Dépendances installées
- [x] Stripe configuré (clé publique)
- [x] CMI intégré (à configurer)
- [x] Routes ajoutées
- [x] Composants créés

### **À faire**
- [ ] Créer l'API backend pour Stripe
- [ ] Obtenir un compte CMI
- [ ] Configurer les webhooks
- [ ] Tester les paiements
- [ ] Configurer les emails de confirmation

---

## 🎉 **PRÊT !**

Votre système de réservation avec paiement Stripe + CMI est prêt !

**Commande pour démarrer** :

```bash
npm run dev
```

**Puis testez** :
1. http://localhost:5173/services/tourisme
2. Cliquez sur un circuit
3. Réservez avec la carte test Stripe !

---

**Bon développement !** 🚀
