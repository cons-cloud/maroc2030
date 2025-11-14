# 📊 Guide des Scripts SQL - Maroc 2030

## 📁 Scripts disponibles

Votre projet contient 3 scripts SQL à exécuter dans Supabase.

---

## 1️⃣ supabase-schema.sql

### 📝 Description
Script principal qui crée toute la structure de la base de données.

### 📦 Contenu
- **16 tables** principales
- **4 types ENUM** (user_role, partner_type, booking_status, payment_status)
- **20+ indexes** pour optimisation
- **10+ triggers** pour updated_at
- **30+ politiques RLS** pour la sécurité
- **Fonctions PostgreSQL**

### 🎯 Quand l'exécuter
**À exécuter EN PREMIER** - Une seule fois lors de la configuration initiale

### ⚙️ Comment l'exécuter
1. Supabase Dashboard > SQL Editor
2. New query
3. Copier tout le contenu de `supabase-schema.sql`
4. Coller dans l'éditeur
5. Cliquer sur **Run**
6. Attendre le message "Success"

### ⏱️ Temps d'exécution
~10-20 secondes

### ✅ Résultat attendu
```
Success. No rows returned
```

### 📊 Tables créées
1. profiles
2. partners
3. tourism_packages
4. events
5. cars
6. properties
7. hotel_rooms
8. tourism_bookings
9. car_bookings
10. property_bookings
11. event_bookings
12. payments
13. announcements
14. contact_messages
15. reviews
16. admin_logs

---

## 2️⃣ create-admin-accounts.sql

### 📝 Description
Script pour créer et configurer les 2 comptes administrateurs.

### 📦 Contenu
- Instructions pour créer les utilisateurs dans Supabase Auth
- Requêtes UPDATE pour mettre à jour les rôles
- Requête de vérification

### 🎯 Quand l'exécuter
**APRÈS** avoir :
1. Exécuté `supabase-schema.sql`
2. Créé les utilisateurs dans Supabase Auth UI

### ⚙️ Comment l'exécuter

#### Étape 1 : Créer les utilisateurs
1. Supabase Dashboard > Authentication > Users
2. Add user > Create new user
3. Email : `maroc2031@gmail.com`
4. Password : `Maroc2031@`
5. ✅ Cocher "Auto Confirm User"
6. Create user
7. Répéter pour `maroc2032@gmail.com` / `Maroc2032@`

#### Étape 2 : Mettre à jour les rôles
1. SQL Editor > New query
2. Copier les requêtes UPDATE du fichier
3. Coller et Run

### ⏱️ Temps d'exécution
~1 seconde

### ✅ Résultat attendu
```
2 rows affected
```

Puis la requête SELECT affiche :
```
email                  | role  | first_name | last_name
-----------------------|-------|------------|------------
maroc2031@gmail.com   | admin | Admin      | Maroc 2031
maroc2032@gmail.com   | admin | Admin      | Maroc 2032
```

---

## 3️⃣ verify-setup.sql

### 📝 Description
Script de vérification complète de la configuration.

### 📦 Contenu
- Vérification des tables
- Vérification des comptes admin
- Vérification des types ENUM
- Vérification des indexes
- Vérification des triggers
- Vérification RLS
- Vérification des politiques
- Statistiques générales
- Résumé final

### 🎯 Quand l'exécuter
**APRÈS** avoir exécuté les 2 autres scripts

### ⚙️ Comment l'exécuter
1. SQL Editor > New query
2. Copier tout le contenu de `verify-setup.sql`
3. Coller et Run

### ⏱️ Temps d'exécution
~2-3 secondes

### ✅ Résultat attendu
Plusieurs tableaux avec des statuts :
- ✅ OK = Tout est bon
- ⚠️ ATTENTION = À vérifier
- ❌ ERREUR = Problème à corriger

### 📊 Exemple de résultat

```
verification          | nombre | statut
---------------------|--------|------------------
Tables créées        | 16     | ✅ OK
Comptes Admin        | 2      | ✅ OK - 2 comptes admin trouvés
Types ENUM           | 4      | ✅ OK
Indexes              | 23     | ✅ OK
Triggers             | 11     | ✅ OK
RLS activé           | 16     | ✅ OK - RLS activé sur toutes les tables
Politiques RLS       | 32     | ✅ OK
```

---

## 📋 Ordre d'exécution

### Séquence complète

```
1. supabase-schema.sql
   ↓
2. Créer les utilisateurs dans Auth UI
   ↓
3. create-admin-accounts.sql
   ↓
4. verify-setup.sql
```

### Timeline

| Étape | Script | Temps | Statut |
|-------|--------|-------|--------|
| 1 | supabase-schema.sql | 20s | ⏳ |
| 2 | Créer users Auth | 2min | ⏳ |
| 3 | create-admin-accounts.sql | 1s | ⏳ |
| 4 | verify-setup.sql | 3s | ⏳ |
| **Total** | | **~3 min** | |

---

## 🔧 Commandes SQL utiles

### Voir toutes les tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Voir tous les utilisateurs
```sql
SELECT id, email, role, created_at 
FROM profiles 
ORDER BY created_at DESC;
```

### Voir tous les admins
```sql
SELECT email, role, first_name, last_name, is_active
FROM profiles 
WHERE role = 'admin';
```

### Compter les enregistrements
```sql
SELECT 
    'Utilisateurs' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Partenaires', COUNT(*) FROM partners
UNION ALL
SELECT 'Circuits', COUNT(*) FROM tourism_packages
UNION ALL
SELECT 'Voitures', COUNT(*) FROM cars
UNION ALL
SELECT 'Propriétés', COUNT(*) FROM properties
UNION ALL
SELECT 'Événements', COUNT(*) FROM events;
```

### Réinitialiser un mot de passe (via Auth UI)
1. Authentication > Users
2. Cliquer sur l'utilisateur
3. Reset Password
4. Envoyer l'email de réinitialisation

---

## 🆘 Dépannage

### Erreur : "relation already exists"
**Cause** : Vous essayez de créer une table qui existe déjà

**Solution** :
```sql
-- Supprimer toutes les tables (ATTENTION : perte de données)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Puis réexécuter supabase-schema.sql
```

### Erreur : "type already exists"
**Cause** : Les types ENUM existent déjà

**Solution** :
```sql
-- Supprimer les types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS partner_type CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Puis réexécuter supabase-schema.sql
```

### Erreur : "duplicate key value"
**Cause** : Vous essayez d'insérer un enregistrement qui existe déjà

**Solution** : Utilisez UPDATE au lieu de INSERT

### Vérifier si un utilisateur existe
```sql
SELECT * FROM auth.users WHERE email = 'maroc2031@gmail.com';
SELECT * FROM profiles WHERE email = 'maroc2031@gmail.com';
```

---

## 📊 Statistiques après installation

### Tables
- **16 tables** créées
- **~50 colonnes** au total
- **Relations** entre toutes les tables

### Sécurité
- **RLS activé** sur toutes les tables
- **30+ politiques** configurées
- **Authentification** Supabase

### Performance
- **20+ indexes** créés
- **Triggers** pour updated_at
- **Optimisations** PostgreSQL

---

## 💡 Bonnes pratiques

### ✅ À faire
- Exécuter les scripts dans l'ordre
- Vérifier les résultats après chaque script
- Faire des backups réguliers
- Tester en local avant production

### ❌ À éviter
- Ne pas exécuter plusieurs fois le même script
- Ne pas modifier les scripts sans comprendre
- Ne pas supprimer les tables en production
- Ne pas partager les identifiants admin

---

## 📚 Ressources

### Documentation
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

### Outils
- **Supabase Studio** : Interface visuelle
- **pgAdmin** : Client PostgreSQL
- **DBeaver** : Client universel

---

## 🎉 Conclusion

Ces 3 scripts SQL sont tout ce dont vous avez besoin pour configurer votre base de données Maroc 2030.

**Suivez l'ordre, vérifiez les résultats, et vous serez opérationnel en quelques minutes !**

---

**Dernière mise à jour** : Novembre 2024  
**Version** : 1.0.0  
**Statut** : ✅ Prêt à l'emploi
