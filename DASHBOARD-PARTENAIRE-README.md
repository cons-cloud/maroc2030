# 🚀 DASHBOARD PARTENAIRE COMPLET - DOCUMENTATION

## ✅ CE QUI A ÉTÉ CRÉÉ

### **1. Script SQL Complet** : `DASHBOARD-PARTENAIRE-COMPLET.sql`

Ce script crée :
- ✅ Table `partner_products` - Produits des partenaires
- ✅ Table `partner_earnings` - Gains avec commission 10%
- ✅ Système de commission automatique (10% Maroc2030 / 90% Partenaire)
- ✅ Vues pour dashboards (partenaire ne voit que 90%)
- ✅ Triggers automatiques pour calculer les commissions
- ✅ Fonctions pour statistiques
- ✅ RLS (Row Level Security)

### **2. Système de Commission**

```
Client paie 1000 MAD (100%)
    ↓
Commission Maroc2030: 100 MAD (10%)
    ↓
Partenaire reçoit: 900 MAD (90%)
```

### **3. Tables Créées**

#### **partner_products**
- Produits créés par les partenaires
- Types: appartement, villa, hotel, voiture, circuit
- Synchronisé avec le site web en temps réel

#### **partner_earnings**
- Gains des partenaires
- Calcul automatique de la commission
- Statuts: pending, paid, cancelled

#### **Colonnes ajoutées à `bookings`**
- `partner_id` - ID du partenaire
- `total_amount` - Montant total (100%)
- `commission_amount` - Commission (10%)
- `partner_amount` - Montant partenaire (90%)
- `partner_paid` - Statut paiement partenaire

---

## 🎯 FONCTIONNALITÉS DU DASHBOARD PARTENAIRE

### **1. Gestion de Profil**
- Informations personnelles
- Coordonnées bancaires (IBAN)
- Type de partenaire (immobilier, voiture, tourisme)

### **2. Gestion des Produits**
- ✅ Créer un produit (appartement, villa, hôtel, voiture)
- ✅ Modifier un produit
- ✅ Supprimer un produit
- ✅ Voir les statistiques (vues, réservations, note)
- ✅ Activer/Désactiver la disponibilité

### **3. Réservations**
- ✅ Voir toutes les réservations de ses produits
- ✅ Informations client (nom, email, téléphone)
- ✅ Dates de réservation
- ✅ **Montant après commission (90%)**
- ✅ Statut de paiement (en attente / reçu)

### **4. Gains**
- ✅ Gains en attente (à recevoir)
- ✅ Gains reçus (déjà payés)
- ✅ Gains du mois en cours
- ✅ Historique des paiements

---

## 📊 DASHBOARD ADMIN - RÉPARTITION

### **Vue Admin Complète**

L'admin voit :
- ✅ Montant total payé par le client (100%)
- ✅ Commission Maroc2030 (10%)
- ✅ Montant à verser au partenaire (90%)
- ✅ Statut du paiement partenaire
- ✅ Informations du partenaire

### **Fonctions Admin**

- ✅ Marquer un paiement partenaire comme "payé"
- ✅ Voir tous les gains en attente
- ✅ Voir l'historique des paiements
- ✅ Exporter les données

---

## 🔄 SYNCHRONISATION 100%

### **Site Web ↔ Supabase**
```
Partenaire crée un produit dans le dashboard
    ↓
Enregistré dans Supabase (partner_products)
    ↓
Immédiatement visible sur le site web
    ↓
Client réserve le produit
    ↓
Réservation dans Supabase (bookings)
    ↓
Calcul automatique de la commission
    ↓
Visible dans dashboard partenaire (90%)
    ↓
Visible dans dashboard admin (100% + détails)
```

### **Dashboard Partenaire ↔ Supabase**
- Temps réel avec Supabase Realtime
- Pas de données test, que des données réelles
- Synchronisation instantanée

### **Dashboard Admin ↔ Supabase**
- Vue complète sur tous les partenaires
- Gestion des paiements
- Statistiques globales

---

## 🚀 ÉTAPES D'INSTALLATION

### **ÉTAPE 1 : Exécuter le Script SQL**

1. Ouvrez Supabase SQL Editor
2. Copiez le contenu de `DASHBOARD-PARTENAIRE-COMPLET.sql`
3. Exécutez le script
4. ✅ Vérifiez la création des tables

### **ÉTAPE 2 : Créer un Compte Partenaire Test**

```sql
-- Créer un utilisateur dans Supabase Auth
-- Email: partenaire@test.com
-- Password: Test1234!

-- Créer son profil
INSERT INTO profiles (id, role, company_name, partner_type, phone, email)
VALUES (
  'USER_ID_FROM_AUTH',
  'partner_immobilier',
  'Agence Immobilière Test',
  'immobilier',
  '+212600000000',
  'partenaire@test.com'
);
```

### **ÉTAPE 3 : Tester la Création de Produit**

```sql
-- Créer un produit test
INSERT INTO partner_products (
  partner_id,
  product_type,
  title,
  description,
  price,
  city,
  available
) VALUES (
  'PARTNER_ID',
  'appartement',
  'Appartement Test',
  'Description test',
  1000.00,
  'Casablanca',
  true
);
```

### **ÉTAPE 4 : Tester une Réservation**

```sql
-- Créer une réservation test
INSERT INTO bookings (
  partner_id,
  service_type,
  service_title,
  client_name,
  client_email,
  total_price,
  commission_rate,
  payment_status
) VALUES (
  'PARTNER_ID',
  'appartement',
  'Appartement Test',
  'Client Test',
  'client@test.com',
  1000.00,
  10.00,
  'confirmed'
);

-- Le trigger va automatiquement :
-- 1. Calculer commission_amount = 100 MAD (10%)
-- 2. Calculer partner_amount = 900 MAD (90%)
-- 3. Créer l'enregistrement dans partner_earnings
-- 4. Mettre à jour pending_earnings du partenaire
```

### **ÉTAPE 5 : Vérifier**

```sql
-- Voir les gains du partenaire
SELECT * FROM partner_earnings WHERE partner_id = 'PARTNER_ID';

-- Voir les statistiques
SELECT * FROM get_partner_dashboard_stats('PARTNER_ID');

-- Vue partenaire (ne voit que 90%)
SELECT * FROM partner_bookings_view WHERE partner_id = 'PARTNER_ID';

-- Vue admin (voit 100%)
SELECT * FROM admin_bookings_commission_view;
```

---

## 📋 VÉRIFICATIONS

### **1. Commission Correcte**

```sql
-- Vérifier le calcul
SELECT 
  total_amount,
  commission_amount,
  partner_amount,
  (commission_amount / total_amount * 100) as commission_percentage
FROM bookings
WHERE partner_id IS NOT NULL;

-- Résultat attendu: commission_percentage = 10.00
```

### **2. Synchronisation**

```sql
-- Produit créé par partenaire
SELECT * FROM partner_products WHERE partner_id = 'PARTNER_ID';

-- Visible sur le site (available = true)
SELECT * FROM partner_products WHERE available = true;

-- Réservation créée
SELECT * FROM bookings WHERE partner_id = 'PARTNER_ID';

-- Gain créé automatiquement
SELECT * FROM partner_earnings WHERE partner_id = 'PARTNER_ID';
```

---

## ✅ RÉSUMÉ

### **Système Complet**
- ✅ Tables créées
- ✅ Commission 10% automatique
- ✅ Vues séparées (partenaire vs admin)
- ✅ Triggers automatiques
- ✅ RLS configuré
- ✅ Synchronisation 100%

### **Dashboard Partenaire**
- ✅ Gestion de profil
- ✅ Gestion des produits
- ✅ Vue des réservations
- ✅ Suivi des gains (90%)
- ✅ Pas de données test

### **Dashboard Admin**
- ✅ Vue complète (100%)
- ✅ Répartition des montants
- ✅ Gestion des paiements partenaires
- ✅ Statistiques globales

---

**Exécutez maintenant le script SQL pour créer tout le système !** 🚀
