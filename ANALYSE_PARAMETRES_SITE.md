# 🔍 ANALYSE - PARAMÈTRES DU SITE

## ❌ **PROBLÈME ACTUEL**

### **Ce qui est synchronisé** ✅
- ✅ Hôtels, Appartements, Villas
- ✅ Voitures, Circuits touristiques
- ✅ Messages de contact
- ✅ Réservations, Paiements

### **Ce qui N'EST PAS synchronisé** ❌
- ❌ **Coordonnées** : Email, téléphone, adresse (hardcodés)
- ❌ **Réseaux sociaux** : Facebook, Instagram, Twitter, YouTube (hardcodés)
- ❌ **Heures d'ouverture** : Horaires (hardcodés)
- ❌ **Description du site** : Textes de présentation (hardcodés)
- ❌ **Logo et images** : Logo, bannières (hardcodés)
- ❌ **Paramètres généraux** : Nom du site, slogan, etc. (hardcodés)

---

## 📋 **CE QUI DOIT ÊTRE GÉRÉ DEPUIS LE DASHBOARD**

### **1. Informations de Contact** 📞
```
Dashboard Admin → Paramètres du Site → Contact
├─ Email principal
├─ Téléphone principal
├─ Téléphone secondaire
├─ Adresse complète
├─ Ville
├─ Code postal
└─ Pays
```

### **2. Réseaux Sociaux** 📱
```
Dashboard Admin → Paramètres du Site → Réseaux Sociaux
├─ Facebook (URL)
├─ Instagram (URL)
├─ Twitter (URL)
├─ YouTube (URL)
├─ LinkedIn (URL)
└─ TikTok (URL)
```

### **3. Heures d'Ouverture** 🕐
```
Dashboard Admin → Paramètres du Site → Horaires
├─ Lundi (ouverture - fermeture)
├─ Mardi (ouverture - fermeture)
├─ Mercredi (ouverture - fermeture)
├─ Jeudi (ouverture - fermeture)
├─ Vendredi (ouverture - fermeture)
├─ Samedi (ouverture - fermeture)
└─ Dimanche (fermé / ouverture - fermeture)
```

### **4. Informations Générales** ℹ️
```
Dashboard Admin → Paramètres du Site → Général
├─ Nom du site
├─ Slogan
├─ Description courte
├─ Description longue
├─ Mots-clés SEO
├─ Logo (upload)
└─ Favicon (upload)
```

### **5. Textes du Site** 📝
```
Dashboard Admin → Paramètres du Site → Contenu
├─ Texte page d'accueil
├─ Texte "À propos"
├─ Texte "Pourquoi nous choisir"
├─ Texte footer
└─ Mentions légales
```

### **6. Paramètres Techniques** ⚙️
```
Dashboard Admin → Paramètres du Site → Technique
├─ Google Analytics ID
├─ Facebook Pixel ID
├─ Maintenance mode (ON/OFF)
├─ Langue par défaut
└─ Devise par défaut
```

---

## 🗄️ **STRUCTURE DE LA BASE DE DONNÉES**

### **Table : `site_settings`**
```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact
  email TEXT,
  phone_primary TEXT,
  phone_secondary TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Maroc',
  
  -- Réseaux sociaux
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  tiktok_url TEXT,
  
  -- Horaires (JSON)
  opening_hours JSONB,
  
  -- Informations générales
  site_name TEXT DEFAULT 'Maroc 2030',
  site_slogan TEXT,
  site_description_short TEXT,
  site_description_long TEXT,
  site_keywords TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  
  -- Textes du site
  home_hero_title TEXT,
  home_hero_subtitle TEXT,
  about_text TEXT,
  why_choose_us TEXT,
  footer_text TEXT,
  legal_mentions TEXT,
  
  -- Paramètres techniques
  google_analytics_id TEXT,
  facebook_pixel_id TEXT,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  default_language TEXT DEFAULT 'fr',
  default_currency TEXT DEFAULT 'MAD',
  
  -- Métadonnées
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insérer les paramètres par défaut
INSERT INTO site_settings (
  email,
  phone_primary,
  address,
  city,
  site_name,
  site_slogan
) VALUES (
  'contact@maroc2030.com',
  '+212 6 12 34 56 78',
  '123 Avenue Mohammed V',
  'Marrakech',
  'Maroc 2030',
  'Votre destination de rêve au Maroc'
);
```

---

## 🎯 **SOLUTION À IMPLÉMENTER**

### **Étape 1 : Créer la table `site_settings`** ✅
- Exécuter le SQL ci-dessus dans Supabase

### **Étape 2 : Créer la page de gestion** ✅
- `src/Pages/dashboards/admin/SiteSettingsManagement.tsx`
- Formulaire avec onglets :
  - Contact
  - Réseaux sociaux
  - Horaires
  - Général
  - Contenu
  - Technique

### **Étape 3 : Connecter le site web** ✅
- Charger les paramètres depuis Supabase
- Remplacer toutes les valeurs hardcodées
- Utiliser un context pour partager les paramètres

### **Étape 4 : Créer un Context** ✅
- `src/contexts/SiteSettingsContext.tsx`
- Charger les paramètres au démarrage
- Fournir les paramètres à toute l'application

---

## 🔄 **FLUX COMPLET**

```
Admin modifie les paramètres
         ↓
Enregistré dans Supabase
    (site_settings)
         ↓
Context recharge les paramètres
         ↓
Toutes les pages se mettent à jour
         ↓
Coordonnées, réseaux sociaux, etc.
affichés partout sur le site
```

---

## 📊 **EXEMPLE D'UTILISATION**

### **Dans le Dashboard**
```typescript
// SiteSettingsManagement.tsx
const [settings, setSettings] = useState({
  email: '',
  phone_primary: '',
  facebook_url: '',
  // ...
});

const handleSave = async () => {
  await supabase
    .from('site_settings')
    .update(settings)
    .eq('id', settingsId);
  
  toast.success('Paramètres enregistrés !');
};
```

### **Dans le Site Web**
```typescript
// Contact.tsx
import { useSiteSettings } from '../contexts/SiteSettingsContext';

const Contact = () => {
  const { settings } = useSiteSettings();
  
  return (
    <div>
      <p>Email: {settings.email}</p>
      <p>Téléphone: {settings.phone_primary}</p>
      <a href={settings.facebook_url}>Facebook</a>
    </div>
  );
};
```

---

## ✅ **AVANTAGES**

### **1. Gestion Centralisée** 🎯
- Tout se gère depuis le dashboard
- Pas besoin de modifier le code
- Changements instantanés

### **2. Flexibilité** 🔄
- Modifier les coordonnées facilement
- Changer les liens sociaux
- Mettre à jour les textes

### **3. Multi-langue** 🌍
- Possibilité d'ajouter plusieurs langues
- Textes différents par langue
- Facile à étendre

### **4. SEO** 📈
- Mots-clés modifiables
- Descriptions optimisables
- Balises meta dynamiques

---

## 🚀 **PROCHAINES ÉTAPES**

### **Priorité 1 : Base de données** 🔴
1. Créer la table `site_settings`
2. Insérer les valeurs par défaut
3. Tester les requêtes

### **Priorité 2 : Dashboard** 🟡
1. Créer `SiteSettingsManagement.tsx`
2. Formulaire avec onglets
3. Upload d'images (logo, favicon)
4. Sauvegarde dans Supabase

### **Priorité 3 : Context** 🟢
1. Créer `SiteSettingsContext.tsx`
2. Charger les paramètres au démarrage
3. Fournir aux composants

### **Priorité 4 : Site Web** 🔵
1. Remplacer les valeurs hardcodées
2. Utiliser le context partout
3. Tester la synchronisation

---

## 📝 **FICHIERS À CRÉER**

1. **SQL** : `create-site-settings-table.sql`
2. **Dashboard** : `src/Pages/dashboards/admin/SiteSettingsManagement.tsx`
3. **Context** : `src/contexts/SiteSettingsContext.tsx`
4. **Hook** : `src/hooks/useSiteSettings.ts`

---

## 🎊 **RÉSULTAT ATTENDU**

### **Dashboard Admin** ✅
```
Paramètres du Site
├─ Contact
│  ├─ Email: [input]
│  ├─ Téléphone: [input]
│  └─ Adresse: [input]
├─ Réseaux Sociaux
│  ├─ Facebook: [input]
│  ├─ Instagram: [input]
│  └─ Twitter: [input]
└─ [Bouton Enregistrer]
```

### **Site Web** ✅
```
Toutes les pages affichent :
✅ Email depuis la base de données
✅ Téléphone depuis la base de données
✅ Liens sociaux depuis la base de données
✅ Horaires depuis la base de données
✅ Textes depuis la base de données
```

---

## 💡 **CONCLUSION**

**Actuellement** : ❌ 20% synchronisé (services uniquement)
**Après implémentation** : ✅ 100% synchronisé (tout le site)

**Voulez-vous que je crée ce système complet de gestion des paramètres du site ?** 🚀
