# 🔧 CONFIGURATION SUPABASE - DÉSACTIVER CONFIRMATION EMAIL

## 🔴 **PROBLÈME**

Lors de la création d'un partenaire, vous rencontrez :
- "Email address is invalid"
- "User not allowed"

## ✅ **SOLUTION : Désactiver la confirmation d'email**

### **ÉTAPE 1 : Aller dans Supabase Dashboard**

1. Ouvrir https://supabase.com
2. Se connecter
3. Sélectionner votre projet

### **ÉTAPE 2 : Désactiver la confirmation d'email**

```
1. Menu gauche → "Authentication"
2. Cliquer sur "Providers"
3. Cliquer sur "Email"
4. Trouver "Confirm email"
5. ❌ DÉSACTIVER "Confirm email"
6. Cliquer sur "Save"
```

### **ÉTAPE 3 : Tester**

Maintenant, créer un partenaire devrait fonctionner :
- ✅ Pas de validation stricte d'email
- ✅ Pas de confirmation requise
- ✅ Partenaire créé immédiatement
- ✅ Visible dans la liste

---

## 🎯 **ALTERNATIVE : Utiliser un email valide**

Si vous ne voulez pas désactiver la confirmation, utilisez des emails valides :

### **Emails valides** ✅
```
✅ partner@hotel.com
✅ contact@riad-marrakech.ma
✅ info@villa-casablanca.com
✅ reservation@hotel-royal.ma
```

### **Emails invalides** ❌
```
❌ villa@gmail.com (Gmail bloque)
❌ test@test.com (domaine suspect)
❌ admin@localhost (domaine invalide)
```

---

## 📊 **CONFIGURATION RECOMMANDÉE**

### **Pour le développement** 🔧
```
Authentication → Providers → Email
❌ Désactiver "Confirm email"
❌ Désactiver "Secure email change"
✅ Activer "Enable sign ups"
```

### **Pour la production** 🚀
```
Authentication → Providers → Email
✅ Activer "Confirm email"
✅ Activer "Secure email change"
✅ Activer "Enable sign ups"
✅ Configurer SMTP personnalisé
```

---

## 🔐 **PERMISSIONS RLS**

Vérifier que les admins peuvent créer des profils :

```sql
-- Dans SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Si nécessaire, ajouter cette policy :

```sql
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

---

## 🧪 **TEST COMPLET**

### **Après configuration**

1. **Créer un partenaire**
   ```
   Dashboard Admin → Partenaires → Nouveau
   Email : test@example.com
   Mot de passe : test123
   ```

2. **Vérifier**
   ```
   ✅ Pas d'erreur
   ✅ Message de succès
   ✅ Partenaire dans la liste
   ```

3. **Vérifier dans Supabase**
   ```
   Table Editor → profiles
   ✅ Le nouveau partenaire est là
   ```

---

## 💡 **SI LE PROBLÈME PERSISTE**

### **Vérifier les logs**
```
1. Supabase Dashboard
2. Menu → "Logs"
3. Chercher les erreurs récentes
```

### **Vérifier la console du navigateur**
```
1. F12 dans le navigateur
2. Onglet "Console"
3. Voir les erreurs détaillées
```

### **Contacter le support**
Si rien ne fonctionne, le problème peut venir de :
- Configuration du projet Supabase
- Limites du plan gratuit
- Problème de permissions

---

## 🎊 **RÉSULTAT ATTENDU**

Après avoir désactivé la confirmation d'email :

```
✅ Création de partenaires instantanée
✅ Pas de validation d'email
✅ Pas de confirmation requise
✅ Partenaire visible immédiatement
✅ Peut se connecter tout de suite
```

**Suivez ces étapes et testez à nouveau !** 🚀
