# 🚨 SÉCURISATION IMMÉDIATE - ACTIONS URGENTES

## ⚠️ NIVEAU DE SÉCURITÉ ACTUEL : 44.5/100 🔴

**Votre site est actuellement vulnérable à plusieurs attaques critiques.**

---

## 🔴 ACTIONS URGENTES (À FAIRE AUJOURD'HUI)

### **1. ACTIVER ROW LEVEL SECURITY (RLS)** 🔴 CRITIQUE

**Temps estimé : 30 minutes**

#### **Étape 1 : Ouvrir Supabase**
1. Aller sur https://supabase.com
2. Ouvrir votre projet Maroc 2030
3. Cliquer sur "SQL Editor" dans le menu gauche

#### **Étape 2 : Exécuter le script RLS**
1. Ouvrir le fichier `/supabase/rls-policies.sql`
2. Copier TOUT le contenu
3. Coller dans SQL Editor
4. Cliquer sur "Run"
5. Vérifier qu'il n'y a pas d'erreurs

#### **Étape 3 : Vérifier que RLS est activé**
```sql
-- Exécuter cette requête pour vérifier
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Toutes les tables doivent avoir rowsecurity = true
```

#### **⚠️ ATTENTION** :
Si vous avez des erreurs, c'est probablement parce que :
- Une table n'existe pas → Commentez la ligne correspondante
- Une politique existe déjà → Supprimez-la d'abord avec `DROP POLICY`

---

### **2. PROTÉGER LES ROUTES DASHBOARDS** 🔴 CRITIQUE

**Temps estimé : 15 minutes**

#### **Étape 1 : Importer RoleGuard dans App.tsx**
```typescript
import RoleGuard from './components/RoleGuard';
```

#### **Étape 2 : Protéger les routes admin**
```typescript
// AVANT (NON SÉCURISÉ)
<Route path="/dashboard/admin" element={<AdminDashboard />} />

// APRÈS (SÉCURISÉ)
<Route path="/dashboard/admin" element={
  <RoleGuard allowedRoles={['admin']}>
    <AdminDashboard />
  </RoleGuard>
} />
```

#### **Étape 3 : Protéger TOUTES les routes dashboards**
```typescript
// Admin routes
<Route path="/dashboard/admin/*" element={
  <RoleGuard allowedRoles={['admin']}>
    <AdminDashboard />
  </RoleGuard>
} />

// Partner routes
<Route path="/dashboard/partner/*" element={
  <RoleGuard allowedRoles={['partner', 'admin']}>
    <PartnerDashboard />
  </RoleGuard>
} />

// Client routes
<Route path="/dashboard/client/*" element={
  <RoleGuard allowedRoles={['client', 'admin']}>
    <ClientDashboard />
  </RoleGuard>
} />
```

---

### **3. AJOUTER VALIDATION DES MOTS DE PASSE** 🔴 CRITIQUE

**Temps estimé : 10 minutes**

#### **Étape 1 : Importer la validation**
Dans `/src/contexts/AuthContext.tsx` :
```typescript
import { validatePassword } from '../utils/validation';
```

#### **Étape 2 : Valider avant l'inscription**
```typescript
const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
  // AJOUTER CETTE VALIDATION
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors.join(', '));
  }
  
  // Reste du code...
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  // ...
};
```

#### **Étape 3 : Afficher les erreurs dans le formulaire**
Dans `/src/Pages/Inscription.tsx`, ajouter un message d'erreur clair.

---

### **4. CRÉER .env.example** 🟡 IMPORTANT

**Temps estimé : 5 minutes**

Créer le fichier `.env.example` à la racine :
```env
# Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_publique_ici

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique
VITE_STRIPE_SECRET_KEY=sk_test_votre_cle_secrete

# App
VITE_APP_URL=http://localhost:5173
```

**⚠️ NE JAMAIS commiter le vrai fichier .env !**

---

## 🟡 ACTIONS IMPORTANTES (CETTE SEMAINE)

### **5. AJOUTER RATE LIMITING**

**Option 1 : Supabase Edge Functions (Recommandé)**
```typescript
// Créer une Edge Function pour limiter les tentatives de connexion
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const rateLimits = new Map();

serve(async (req) => {
  const ip = req.headers.get('x-forwarded-for');
  const now = Date.now();
  
  // Vérifier le rate limit
  const attempts = rateLimits.get(ip) || [];
  const recentAttempts = attempts.filter(t => now - t < 60000);
  
  if (recentAttempts.length >= 5) {
    return new Response('Too many attempts', { status: 429 });
  }
  
  rateLimits.set(ip, [...recentAttempts, now]);
  
  // Continuer avec la requête
  // ...
});
```

**Option 2 : Rate limiting côté client (Temporaire)**
```typescript
import { checkRateLimit } from '../utils/validation';

const handleLogin = async () => {
  if (!checkRateLimit('login', 5, 60000)) {
    toast.error('Trop de tentatives. Réessayez dans 1 minute.');
    return;
  }
  
  // Continuer avec le login
  await signIn(email, password);
};
```

---

### **6. VALIDER TOUS LES INPUTS**

**Exemple pour les réservations** :
```typescript
import { validateBooking } from '../utils/validation';

const createBooking = async (bookingData: any) => {
  // AJOUTER CETTE VALIDATION
  const validation = validateBooking(bookingData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // Continuer avec la création
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData);
};
```

---

### **7. AJOUTER CONTENT SECURITY POLICY (CSP)**

Dans `/index.html`, ajouter dans le `<head>` :
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co https://api.stripe.com;
  frame-src https://js.stripe.com;
">
```

---

### **8. NETTOYER LES LOGS**

**Rechercher et supprimer** :
```typescript
// ❌ JAMAIS faire ça
console.log('Password:', password);
console.log('Token:', token);
console.log('User data:', userData);

// ✅ À la place
import { maskSensitiveData } from '../utils/validation';
console.log('User data:', maskSensitiveData(userData));
```

---

## 🟢 ACTIONS RECOMMANDÉES (CE MOIS)

### **9. AJOUTER MONITORING**

**Option 1 : Sentry (Gratuit jusqu'à 5K événements/mois)**
```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "votre_dsn_sentry",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

**Option 2 : LogRocket**
```bash
npm install logrocket
```

---

### **10. AJOUTER AUTHENTIFICATION À DEUX FACTEURS (2FA)**

Supabase supporte 2FA nativement :
```typescript
// Activer 2FA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
});

// Vérifier le code
const { data, error } = await supabase.auth.mfa.verify({
  factorId: data.id,
  code: userCode,
});
```

---

### **11. CRÉER DES BACKUPS AUTOMATIQUES**

Dans Supabase :
1. Aller dans "Database" → "Backups"
2. Activer les backups automatiques quotidiens
3. Configurer la rétention (7-30 jours)

---

### **12. TESTS DE SÉCURITÉ**

**Tests à faire** :
1. Essayer d'accéder aux dashboards sans être connecté
2. Essayer d'accéder au dashboard admin en tant que client
3. Essayer de modifier les données d'un autre utilisateur
4. Essayer d'injecter du SQL dans les formulaires
5. Essayer d'injecter du JavaScript (XSS)
6. Tester avec des mots de passe faibles

---

## 📊 CHECKLIST DE SÉCURISATION

### **Urgent (Aujourd'hui)** 🔴
- [ ] Activer RLS sur toutes les tables Supabase
- [ ] Créer les politiques de sécurité RLS
- [ ] Protéger les routes dashboards avec RoleGuard
- [ ] Ajouter validation des mots de passe forts
- [ ] Créer .env.example

### **Important (Cette semaine)** 🟡
- [ ] Ajouter rate limiting
- [ ] Valider tous les inputs utilisateur
- [ ] Ajouter Content Security Policy
- [ ] Nettoyer les logs sensibles
- [ ] Tester les protections

### **Recommandé (Ce mois)** 🟢
- [ ] Ajouter monitoring (Sentry)
- [ ] Activer 2FA
- [ ] Configurer backups automatiques
- [ ] Faire des tests de pénétration
- [ ] Audit de sécurité externe

---

## 🎯 RÉSULTAT ATTENDU

**Après ces actions** :
- Score de sécurité : 44.5/100 → 85/100 🟢
- Protection contre les attaques courantes
- Conformité aux standards de sécurité
- Prêt pour la production

---

## 📞 BESOIN D'AIDE ?

### **Ressources** :
- Documentation Supabase RLS : https://supabase.com/docs/guides/auth/row-level-security
- OWASP Top 10 : https://owasp.org/www-project-top-ten/
- Guide sécurité React : https://react.dev/learn/security

### **Support** :
- Supabase Discord : https://discord.supabase.com
- Stack Overflow : Tag `supabase` ou `react-security`

---

## ⚠️ AVERTISSEMENT FINAL

**VOTRE SITE N'EST PAS SÉCURISÉ ACTUELLEMENT.**

Les vulnérabilités identifiées permettent :
- ✗ Vol de données utilisateurs
- ✗ Escalade de privilèges (client → admin)
- ✗ Manipulation de réservations
- ✗ Attaques par force brute
- ✗ Injection de code malveillant

**NE METTEZ PAS EN PRODUCTION SANS APPLIQUER CES CORRECTIONS.**

---

**Temps total estimé pour sécuriser : 2-3 heures**

**Bonne chance ! 🔒**
