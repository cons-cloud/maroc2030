# 🧹 GUIDE DE NETTOYAGE DES DONNÉES DE TEST

## 📋 **ÉTAPES À SUIVRE**

### **Étape 1 : Identifier les données de test** 🔍

1. Ouvrez **Supabase Dashboard** : https://supabase.com/dashboard
2. Allez dans votre projet **Maroc-2030**
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Ouvrez le fichier `IDENTIFIER-DONNEES-TEST.sql`
5. Copiez et collez le contenu dans le SQL Editor
6. Cliquez sur **Run** pour exécuter

**Résultat** : Vous verrez toutes vos données avec des indicateurs :
- 🔴 **TEST** = Données de test à supprimer
- ✅ **RÉEL** = Données réelles à conserver

---

### **Étape 2 : Noter les emails/IDs à supprimer** 📝

Regardez les résultats et notez :
- Les **emails** des comptes de test (ex: test@example.com)
- Les **IDs** des profils à supprimer
- Les **noms** des services/produits de test

**Exemple** :
```
Profils à supprimer :
- test@example.com
- demo@test.com
- user1@test.com
```

---

### **Étape 3 : Supprimer les données de test** 🗑️

#### **Option A : Suppression par email (Recommandé)**

Dans le SQL Editor, exécutez :

```sql
-- Supprimer les profils avec emails de test
DELETE FROM profiles 
WHERE email LIKE '%test%' 
   OR email LIKE '%demo%' 
   OR email LIKE '%example%';
```

#### **Option B : Suppression par emails spécifiques**

```sql
-- Remplacez par vos emails de test
DELETE FROM profiles WHERE email IN (
  'test@example.com',
  'demo@test.com',
  'user1@test.com'
);
```

#### **Option C : Suppression par ID**

```sql
-- Remplacez par les IDs de vos profils de test
DELETE FROM profiles WHERE id IN (
  'uuid-du-profil-1',
  'uuid-du-profil-2',
  'uuid-du-profil-3'
);
```

---

### **Étape 4 : Vérifier le résultat** ✅

Exécutez cette requête pour voir ce qui reste :

```sql
SELECT 
  'PROFILS' as table_name, 
  COUNT(*) as remaining 
FROM profiles

UNION ALL

SELECT 'RÉSERVATIONS', COUNT(*) FROM bookings
UNION ALL
SELECT 'PAIEMENTS', COUNT(*) FROM payments
UNION ALL
SELECT 'SERVICES', COUNT(*) FROM services
UNION ALL
SELECT 'HÔTELS', COUNT(*) FROM hotels
UNION ALL
SELECT 'GUIDES', COUNT(*) FROM guides
UNION ALL
SELECT 'VOITURES', COUNT(*) FROM voitures;
```

---

## ⚠️ **IMPORTANT : CONTRAINTES CASCADE**

Si votre base de données a des contraintes **ON DELETE CASCADE**, les données liées seront supprimées automatiquement :

- Supprimer un **profil** → Supprime automatiquement :
  - Ses réservations
  - Ses paiements
  - Ses services/produits
  - Ses hôtels, guides, voitures, etc.

**Vérifiez vos contraintes** :
```sql
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---

## 🎯 **MÉTHODE RECOMMANDÉE**

### **Pour supprimer TOUTES les données de test :**

```sql
-- 1. Supprimer les profils de test
DELETE FROM profiles 
WHERE email LIKE '%test%' 
   OR email LIKE '%demo%' 
   OR email LIKE '%example%';

-- 2. Vérifier le résultat
SELECT COUNT(*) as remaining_profiles FROM profiles;
```

Si vous avez **CASCADE**, c'est tout ! Sinon, continuez :

```sql
-- 3. Supprimer les données orphelines (si pas de CASCADE)
DELETE FROM bookings WHERE client_id NOT IN (SELECT id FROM profiles);
DELETE FROM payments WHERE user_id NOT IN (SELECT id FROM profiles);
DELETE FROM services WHERE partner_id NOT IN (SELECT id FROM profiles);
DELETE FROM hotels WHERE partner_id NOT IN (SELECT id FROM profiles);
DELETE FROM guides WHERE partner_id NOT IN (SELECT id FROM profiles);
DELETE FROM voitures WHERE partner_id NOT IN (SELECT id FROM profiles);
```

---

## 🔒 **SÉCURITÉ**

### **Avant de supprimer :**

1. ✅ **Faites une sauvegarde** de votre base de données
2. ✅ **Testez avec SELECT** avant DELETE
3. ✅ **Notez les IDs** des données à conserver
4. ✅ **Vérifiez deux fois** les emails/IDs

### **Exemple de test avant suppression :**

```sql
-- Tester ce qui sera supprimé (SELECT au lieu de DELETE)
SELECT * FROM profiles 
WHERE email LIKE '%test%' 
   OR email LIKE '%demo%' 
   OR email LIKE '%example%';
```

---

## 📊 **APRÈS LE NETTOYAGE**

Votre dashboard admin devrait afficher :
- **Total Utilisateurs** : Seulement les vrais comptes
- **Clients** : Seulement les vrais clients
- **Partenaires** : Seulement les vrais partenaires
- **Réservations** : Seulement les vraies réservations
- **Services** : Seulement les vrais services

---

## 🆘 **EN CAS DE PROBLÈME**

### **Si vous supprimez par erreur :**
- Restaurez depuis votre sauvegarde
- Contactez le support Supabase si nécessaire

### **Si des données restent :**
- Vérifiez les critères de suppression
- Utilisez des IDs spécifiques au lieu de LIKE
- Supprimez manuellement via le Table Editor

---

## 📁 **FICHIERS FOURNIS**

1. **IDENTIFIER-DONNEES-TEST.sql** 🔍
   - Voir toutes les données
   - Identifier les données de test
   - Obtenir un résumé

2. **SUPPRIMER-DONNEES-TEST.sql** 🗑️
   - Scripts de suppression commentés
   - À décommenter selon vos besoins
   - Avec vérifications

3. **GUIDE-NETTOYAGE-DONNEES.md** 📖
   - Ce guide complet
   - Étapes détaillées
   - Conseils de sécurité

---

## ✅ **CHECKLIST**

- [ ] J'ai fait une sauvegarde de ma base de données
- [ ] J'ai exécuté IDENTIFIER-DONNEES-TEST.sql
- [ ] J'ai noté les emails/IDs à supprimer
- [ ] J'ai testé avec SELECT avant DELETE
- [ ] J'ai vérifié les contraintes CASCADE
- [ ] J'ai exécuté les DELETE
- [ ] J'ai vérifié le résultat
- [ ] Mon dashboard affiche les bonnes données

---

## 🎉 **RÉSULTAT ATTENDU**

Après le nettoyage :
- ✅ **0 données de test**
- ✅ **Seulement des données réelles**
- ✅ **Dashboard propre**
- ✅ **Statistiques exactes**

**Votre application est maintenant prête pour la production !** 🚀
