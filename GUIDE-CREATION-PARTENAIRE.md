# 🎯 GUIDE COMPLET - CRÉATION DE PARTENAIRE DEPUIS LE DASHBOARD ADMIN

## ✅ SYSTÈME AUTOMATIQUE

Le système crée **automatiquement** le partenaire dans Supabase quand vous utilisez le dashboard admin.

---

## 🚀 COMMENT CRÉER UN PARTENAIRE

### **ÉTAPE 1 : Ouvrir le Dashboard Admin**

1. Connectez-vous en tant qu'admin
2. Allez sur le dashboard admin

### **ÉTAPE 2 : Cliquer sur "Ajouter un Partenaire"**

1. Cliquez sur le bouton **"Ajouter un partenaire"** (icône UserCog)
2. Un formulaire s'ouvre

### **ÉTAPE 3 : Remplir le Formulaire**

Remplissez tous les champs :

- **Nom de l'entreprise** : `Agence Immobilière Atlas`
- **Nom du responsable** : `Ahmed Benali`
- **Email** : `ahmed@agenceatlas.ma`
- **Mot de passe** : `Atlas2024!` (minimum 6 caractères)
- **Téléphone** : `+212 5 22 12 34 56`
- **Ville** : `Casablanca`
- **Type de service** : 
  - `Tourisme` (Hôtels, Circuits, Guides)
  - `Location de voiture`
  - `Immobilier` (Appartements, Villas)

### **ÉTAPE 4 : Cliquer sur "Créer le partenaire"**

1. Cliquez sur le bouton bleu
2. ✅ Le système crée automatiquement :
   - Le compte dans `auth.users` (avec email confirmé)
   - Le profil dans `profiles`
   - Le rôle `partner_tourism` / `partner_car` / `partner_realestate`

### **ÉTAPE 5 : Vérifier dans la Console**

Ouvrez la console du navigateur (F12), vous verrez :

```
=== CRÉATION PARTENAIRE ===
Email: ahmed@agenceatlas.ma
Type: tourism
✅ Utilisateur créé: abc123-def456-...
✅ Email confirmé: 2024-11-10T00:00:00.000Z
Création du profil...
✅ Profil créé
=== SUCCÈS ===
```

### **ÉTAPE 6 : Le Partenaire Peut Se Connecter**

Le partenaire peut maintenant :
1. Aller sur http://localhost:5173/login
2. Entrer son email : `ahmed@agenceatlas.ma`
3. Entrer son mot de passe : `Atlas2024!`
4. ✅ Connexion réussie → Redirection vers `/dashboard/partner`

---

## 🔍 VÉRIFICATION DANS SUPABASE

### **Vérifier le Compte Auth**

1. Allez sur Supabase → **Authentication** → **Users**
2. Vous devriez voir :
   - ✅ Email : `ahmed@agenceatlas.ma`
   - ✅ Email Confirmed : `Yes`
   - ✅ Created At : Date/heure de création

### **Vérifier le Profil**

Dans Supabase SQL Editor :

```sql
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.company_name,
  p.partner_type,
  p.phone,
  p.city
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'ahmed@agenceatlas.ma';
```

**Résultat attendu** :
```
id: abc123-def456-...
email: ahmed@agenceatlas.ma
email_confirmed_at: 2024-11-10 00:00:00+00
role: partner_tourism
company_name: Agence Immobilière Atlas
partner_type: tourism
phone: +212 5 22 12 34 56
city: Casablanca
```

---

## ✅ CE QUI EST CRÉÉ AUTOMATIQUEMENT

### **1. Dans `auth.users`** :
- ✅ ID utilisateur (UUID)
- ✅ Email
- ✅ Mot de passe (hashé)
- ✅ Email confirmé automatiquement
- ✅ Métadonnées (nom, entreprise, etc.)

### **2. Dans `profiles`** :
- ✅ ID (même que auth.users)
- ✅ Role : `partner_tourism` / `partner_car` / `partner_realestate`
- ✅ company_name
- ✅ phone
- ✅ city
- ✅ partner_type
- ✅ is_verified : `false` (à activer par l'admin)

---

## 🎯 TYPES DE PARTENAIRES

| Type Sélectionné | Rôle Créé | Peut Gérer |
|------------------|-----------|------------|
| **Tourisme** | `partner_tourism` | Hôtels, Circuits, Guides |
| **Location de voiture** | `partner_car` | Voitures |
| **Immobilier** | `partner_realestate` | Appartements, Villas |

---

## 🔧 DÉPANNAGE

### **Problème : "Invalid login credentials"**

**Causes possibles** :
1. ❌ Mauvais email ou mot de passe
2. ❌ Email non confirmé
3. ❌ Compte pas encore créé

**Solutions** :

#### **Solution 1 : Vérifier dans Supabase**
```sql
SELECT 
  u.email,
  u.email_confirmed_at,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'VOTRE_EMAIL';
```

Si `email_confirmed_at` est NULL :
1. Allez sur Supabase → Authentication → Users
2. Trouvez l'utilisateur
3. Cliquez ⋮ → "Confirm Email"

#### **Solution 2 : Réinitialiser le Mot de Passe**
1. Allez sur Supabase → Authentication → Users
2. Trouvez l'utilisateur
3. Cliquez ⋮ → "Reset Password"
4. Définissez un nouveau mot de passe
5. Testez la connexion

#### **Solution 3 : Recréer le Partenaire**
1. Supprimez l'ancien compte dans Supabase
2. Recréez-le via le dashboard admin
3. Vérifiez les logs dans la console

---

## 📋 CHECKLIST DE CRÉATION

Avant de créer un partenaire, vérifiez :

- [ ] Le dashboard admin fonctionne
- [ ] Vous êtes connecté en tant qu'admin
- [ ] Supabase est accessible
- [ ] La clé `service_role` est correcte dans `supabaseAdmin.ts`
- [ ] Le formulaire s'ouvre correctement

Après création :

- [ ] Message de succès affiché
- [ ] Logs dans la console (F12)
- [ ] Compte visible dans Supabase → Authentication
- [ ] Profil visible dans Supabase → Table Editor → profiles
- [ ] Email confirmé (email_confirmed_at pas NULL)
- [ ] Le partenaire peut se connecter

---

## 🎯 EXEMPLE COMPLET

### **Créer un Partenaire Immobilier**

1. **Dashboard Admin** → "Ajouter un partenaire"
2. **Remplir** :
   - Entreprise : `Agence Immobilière Casablanca`
   - Responsable : `Fatima El Amrani`
   - Email : `fatima@agence-casa.ma`
   - Mot de passe : `Casa2024!`
   - Téléphone : `+212 5 22 98 76 54`
   - Ville : `Casablanca`
   - Type : `Immobilier`
3. **Créer**
4. ✅ **Succès** : "Partenaire créé avec succès !"

### **Le Partenaire Se Connecte**

1. http://localhost:5173/login
2. Email : `fatima@agence-casa.ma`
3. Mot de passe : `Casa2024!`
4. ✅ **Connexion** → Dashboard Partenaire

### **Le Partenaire Crée un Produit**

1. Dashboard Partenaire → "Ajouter un produit"
2. Type : `Appartement`
3. Titre : `Appartement 3 chambres Maarif`
4. Prix : `800 MAD/nuit`
5. Ville : `Casablanca`
6. ✅ **Créé** → Visible sur le site web immédiatement

### **Un Client Réserve**

1. Site web → Page Appartements
2. Voir `Appartement 3 chambres Maarif`
3. Cliquer "Réserver"
4. Payer 800 MAD
5. ✅ **Réservation confirmée**

### **Commission Calculée Automatiquement**

```
Client paie : 800 MAD (100%)
    ↓
Commission Maroc2030 : 80 MAD (10%)
Partenaire reçoit : 720 MAD (90%)
```

### **Dashboard Partenaire**

Le partenaire voit :
- ✅ Réservation de "Client Test"
- ✅ Montant : **720 MAD** (son gain après commission)
- ✅ Statut : "En attente de paiement"

### **Dashboard Admin**

L'admin voit :
- ✅ Réservation de "Client Test"
- ✅ Montant total : **800 MAD**
- ✅ Commission Maroc2030 : **80 MAD**
- ✅ À verser au partenaire : **720 MAD**
- ✅ Bouton "Marquer comme payé"

---

## ✅ RÉSUMÉ

### **Création Automatique** :
- ✅ Compte auth.users
- ✅ Profil profiles
- ✅ Email confirmé
- ✅ Rôle partenaire
- ✅ Prêt à se connecter

### **Synchronisation 100%** :
- ✅ Dashboard Admin → Supabase
- ✅ Dashboard Partenaire → Supabase
- ✅ Site Web → Supabase
- ✅ Temps réel

### **Commission Automatique** :
- ✅ 10% Maroc2030
- ✅ 90% Partenaire
- ✅ Calcul automatique
- ✅ Visible dans les deux dashboards

---

**Le système fonctionne à 100% depuis le dashboard admin !** 🚀

Créez un partenaire, vérifiez les logs, et testez la connexion !
