# 🆘 Guide de Dépannage - Maroc 2030

## Problèmes courants et solutions

---

## ❌ Erreur : "Missing Supabase environment variables"

### Symptômes
- Page blanche
- Erreur dans la console : `Uncaught Error: Missing Supabase environment variables at supabase.ts:7:9`

### Cause
Le fichier `.env` n'existe pas ou est mal configuré

### ✅ Solution

**Créez le fichier `.env` à la racine du projet avec ce contenu :**

```env
VITE_SUPABASE_URL=https://tywnsgsufwxienpgbosm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d25zZ3N1Znd4aWVucGdib3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDgwMzAsImV4cCI6MjA3NzkyNDAzMH0.SF3e9LcYLBogVHJq2hTSFnfFJVb34xHIGS2HsYZxXM8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d25zZ3N1Znd4aWVucGdib3NtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0ODAzMCwiZXhwIjoyMDc3OTI0MDMwfQ.WqKLHfhkSKCFDPTtVPl59WYBba7b7KVs5VrApHyd2Rg
JWT_SECRET=syUFut/a6imCEAQBlCd88R5IzeQbxyvRFvRc4/tciGPdz/0xqjutrEybKDuM+7jD/eKR9FFzmwzG5MzgtgD+GA==
PORT=3001
NODE_ENV=development
VITE_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
```

**Via Terminal :**
```bash
cat > /Users/jamilaaitbouchnani/Maroc-2030/.env << 'EOF'
VITE_SUPABASE_URL=https://tywnsgsufwxienpgbosm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d25zZ3N1Znd4aWVucGdib3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDgwMzAsImV4cCI6MjA3NzkyNDAzMH0.SF3e9LcYLBogVHJq2hTSFnfFJVb34xHIGS2HsYZxXM8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d25zZ3N1Znd4aWVucGdib3NtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0ODAzMCwiZXhwIjoyMDc3OTI0MDMwfQ.WqKLHfhkSKCFDPTtVPl59WYBba7b7KVs5VrApHyd2Rg
JWT_SECRET=syUFut/a6imCEAQBlCd88R5IzeQbxyvRFvRc4/tciGPdz/0xqjutrEybKDuM+7jD/eKR9FFzmwzG5MzgtgD+GA==
PORT=3001
NODE_ENV=development
VITE_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
EOF
```

**Puis redémarrez :**
```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

---

## ⚠️ Warning : "site.webmanifest Syntax error"

### Symptômes
- Warning dans la console : `Manifest: Line: 1, column: 1, Syntax error`

### Cause
Le fichier `site.webmanifest` n'existe pas ou est mal formaté

### ✅ Solution
Le fichier a été créé automatiquement. Si le warning persiste, rechargez la page (Cmd+R ou Ctrl+R)

---

## ❌ Erreur : "relation 'profiles' does not exist"

### Symptômes
- Erreur lors de la connexion
- Erreur dans la console réseau

### Cause
Les tables de la base de données n'ont pas été créées

### ✅ Solution

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet `tywnsgsufwxienpgbosm`
3. Allez dans **SQL Editor**
4. Ouvrez le fichier `supabase-schema.sql`
5. Copiez TOUT le contenu
6. Collez dans l'éditeur SQL
7. Cliquez sur **Run**
8. Attendez "Success"

---

## ❌ Erreur : "Invalid login credentials"

### Symptômes
- Impossible de se connecter
- Message "Invalid login credentials"

### Cause
Le compte n'existe pas ou le mot de passe est incorrect

### ✅ Solution

**Vérifiez que le compte existe :**
1. Supabase Dashboard > Authentication > Users
2. Cherchez l'email
3. Si absent, créez-le :
   - Add user > Create new user
   - Email : `maroc2031@gmail.com`
   - Password : `Maroc2031@`
   - ✅ Auto Confirm User

**Mettez à jour le rôle :**
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'maroc2031@gmail.com';
```

---

## ❌ Page blanche après connexion

### Symptômes
- Connexion réussie
- Mais page blanche ensuite

### Cause
- Erreur JavaScript
- Rôle incorrect
- Route non trouvée

### ✅ Solution

1. **Ouvrez la console** (F12)
2. **Vérifiez les erreurs** dans l'onglet Console
3. **Vérifiez le rôle** :
```sql
SELECT email, role FROM profiles WHERE email = 'votre@email.com';
```
4. **Vérifiez l'URL** :
   - Admin devrait être sur `/dashboard/admin`
   - Partner sur `/dashboard/partner`
   - Client sur `/dashboard/client`

---

## ❌ Erreur : "Failed to fetch"

### Symptômes
- Erreur réseau
- "Failed to fetch" dans la console

### Cause
- Problème de connexion à Supabase
- Clés API incorrectes
- Projet Supabase en pause

### ✅ Solution

1. **Vérifiez les clés dans `.env`**
2. **Vérifiez que le projet Supabase est actif**
3. **Testez la connexion** :
```bash
curl https://tywnsgsufwxienpgbosm.supabase.co
```

---

## ❌ npm run dev ne démarre pas

### Symptômes
- Erreur au démarrage
- Port déjà utilisé

### Cause
- Dépendances manquantes
- Port 5173 occupé
- Erreur de configuration

### ✅ Solution

**Réinstaller les dépendances :**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Changer le port :**
```bash
npm run dev -- --port 3000
```

---

## ❌ Erreur TypeScript

### Symptômes
- Erreurs de compilation TypeScript
- Types manquants

### Cause
- Dépendances TypeScript manquantes
- Configuration incorrecte

### ✅ Solution

```bash
npm install --save-dev @types/node @types/react @types/react-dom
npm run dev
```

---

## 🔍 Commandes de diagnostic

### Vérifier que .env existe
```bash
ls -la /Users/jamilaaitbouchnani/Maroc-2030/.env
```

### Voir le contenu de .env
```bash
cat /Users/jamilaaitbouchnani/Maroc-2030/.env
```

### Vérifier les dépendances
```bash
npm list @supabase/supabase-js
```

### Vérifier la connexion Supabase
```bash
curl https://tywnsgsufwxienpgbosm.supabase.co/rest/v1/
```

### Nettoyer le cache
```bash
rm -rf node_modules/.vite
npm run dev
```

---

## 📋 Checklist de vérification

Avant de demander de l'aide, vérifiez :

- [ ] Le fichier `.env` existe à la racine
- [ ] Les variables commencent par `VITE_`
- [ ] Le serveur a été redémarré après création du `.env`
- [ ] Les tables existent dans Supabase
- [ ] Le compte admin existe dans Supabase Auth
- [ ] Le rôle est bien 'admin' dans la table profiles
- [ ] La console du navigateur (F12) pour voir les erreurs
- [ ] Le projet Supabase est actif

---

## 🆘 Toujours bloqué ?

### Étapes de debug

1. **Console navigateur** (F12)
   - Onglet Console : erreurs JavaScript
   - Onglet Network : erreurs réseau
   - Onglet Application : vérifier le localStorage

2. **Logs Supabase**
   - Supabase Dashboard > Logs
   - Voir les erreurs API

3. **Vérifier la base de données**
   - Exécutez `verify-setup.sql`
   - Vérifiez que tout est ✅

4. **Redémarrage complet**
```bash
# Arrêter le serveur
Ctrl+C

# Nettoyer
rm -rf node_modules/.vite

# Redémarrer
npm run dev
```

---

## 📞 Ressources

- **Supabase Docs** : https://supabase.com/docs
- **React Docs** : https://react.dev
- **Vite Docs** : https://vitejs.dev

---

## 💡 Conseils

1. **Toujours vérifier la console** (F12) en premier
2. **Redémarrer le serveur** après modification du `.env`
3. **Vider le cache** si comportement étrange
4. **Vérifier Supabase Dashboard** pour les erreurs backend

---

**Dernière mise à jour** : Novembre 2024  
**Version** : 1.0.0
