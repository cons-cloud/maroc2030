# 🔧 FIX : Erreur de chargement des circuits

## 🚨 PROBLÈME IDENTIFIÉ

L'erreur "Erreur lors du chargement des circuits" est causée par le **Row Level Security (RLS)** que nous venons d'activer.

### **Pourquoi cette erreur ?**
Quand RLS est activé sans politiques appropriées, **toutes les requêtes sont bloquées par défaut**.

---

## ✅ SOLUTION : Script RLS mis à jour

J'ai corrigé le script `/supabase/rls-minimal.sql` pour :

### **1. Permettre la lecture publique des circuits**
```sql
CREATE POLICY "Public can view available circuits" 
ON circuits_touristiques FOR SELECT 
USING (true);
```

### **2. Permettre la lecture des produits partenaires**
```sql
CREATE POLICY "Public can view available products" 
ON partner_products FOR SELECT 
USING (true);
```

---

## 🚀 COMMENT CORRIGER L'ERREUR

### **Option 1 : Réexécuter le script complet (RECOMMANDÉ)**

1. **Ouvrir** `/supabase/rls-minimal.sql`
2. **Copier tout** le contenu (Cmd+A puis Cmd+C)
3. **Aller sur** https://supabase.com → SQL Editor
4. **Coller** et **Run**

✅ Le script supprime automatiquement les anciennes politiques et crée les nouvelles.

---

### **Option 2 : Exécuter uniquement les corrections (RAPIDE)**

Si vous avez déjà exécuté le script une fois, copiez et exécutez uniquement ceci :

```sql
-- Corriger les politiques pour circuits_touristiques
DROP POLICY IF EXISTS "Public read access" ON circuits_touristiques;
DROP POLICY IF EXISTS "Public can view available circuits" ON circuits_touristiques;

CREATE POLICY "Public can view available circuits" 
ON circuits_touristiques FOR SELECT 
USING (true);

-- Ajouter les politiques pour partner_products
ALTER TABLE partner_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view available products" ON partner_products;

CREATE POLICY "Public can view available products" 
ON partner_products FOR SELECT 
USING (true);
```

---

### **Option 3 : Désactiver temporairement RLS (DÉCONSEILLÉ)**

⚠️ **Attention** : Ceci désactive la sécurité !

```sql
-- Désactiver RLS temporairement (NON SÉCURISÉ)
ALTER TABLE circuits_touristiques DISABLE ROW LEVEL SECURITY;
ALTER TABLE partner_products DISABLE ROW LEVEL SECURITY;
```

**Ne faites ceci que pour tester !** Réactivez RLS ensuite avec l'Option 1.

---

## 🧪 VÉRIFIER QUE C'EST CORRIGÉ

### **1. Vérifier les politiques dans Supabase**

Dans SQL Editor, exécutez :
```sql
SELECT 
    tablename as "Table",
    policyname as "Politique",
    cmd as "Commande"
FROM pg_policies 
WHERE tablename IN ('circuits_touristiques', 'partner_products')
ORDER BY tablename;
```

**Résultat attendu** :
```
circuits_touristiques | Public can view available circuits | SELECT
circuits_touristiques | Admin full access | ALL
partner_products | Public can view available products | SELECT
partner_products | Partners can manage own products | ALL
partner_products | Admin full access | ALL
```

---

### **2. Tester le chargement des circuits**

1. Rafraîchir votre site (Cmd+R / Ctrl+R)
2. Aller sur `/services/tourisme`
3. **Résultat attendu** : Les circuits s'affichent ✅

---

## 📊 CE QUI A ÉTÉ CORRIGÉ

### **Avant** ❌
```
RLS activé → Pas de politique SELECT
→ Toutes les requêtes bloquées
→ Erreur de chargement
```

### **Après** ✅
```
RLS activé → Politique "Public can view"
→ Lecture publique autorisée
→ Circuits chargés correctement
```

---

## 🔒 SÉCURITÉ MAINTENUE

### **Ce qui est toujours protégé** :
- ✅ Seuls les admins peuvent **modifier** les circuits
- ✅ Seuls les partenaires peuvent **modifier** leurs produits
- ✅ Les utilisateurs peuvent uniquement **voir** les circuits
- ✅ Pas de suppression non autorisée
- ✅ Pas de création non autorisée

### **Ce qui est accessible publiquement** :
- ✅ **Lecture** des circuits (nécessaire pour le site)
- ✅ **Lecture** des produits partenaires (nécessaire pour le site)

**C'est le comportement normal et sécurisé !** 🔒

---

## 🐛 AUTRES ERREURS POSSIBLES

### **Erreur : "relation does not exist"**
**Cause** : La table n'existe pas dans votre base de données.

**Solution** : Vérifiez les tables existantes :
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

### **Erreur : "column does not exist"**
**Cause** : Une colonne référencée n'existe pas.

**Solution** : Vérifiez les colonnes de la table :
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'circuits_touristiques';
```

---

### **Erreur : "permission denied"**
**Cause** : RLS bloque l'accès.

**Solution** : Vérifiez les politiques RLS (voir section "Vérifier que c'est corrigé").

---

## 📝 RÉSUMÉ

### **Problème** :
RLS activé sans politiques → Circuits bloqués

### **Solution** :
Ajouter politiques de lecture publique → Circuits accessibles

### **Fichier corrigé** :
`/supabase/rls-minimal.sql`

### **Action requise** :
Réexécuter le script dans Supabase SQL Editor

---

## ✅ CHECKLIST

- [ ] Ouvrir `/supabase/rls-minimal.sql`
- [ ] Copier tout le contenu
- [ ] Aller sur Supabase → SQL Editor
- [ ] Coller et exécuter
- [ ] Vérifier les politiques créées
- [ ] Rafraîchir le site
- [ ] Tester `/services/tourisme`
- [ ] ✅ Les circuits s'affichent !

---

**Temps estimé : 2 minutes** ⏱️

**Après cette correction, tout fonctionnera normalement !** 🎉
