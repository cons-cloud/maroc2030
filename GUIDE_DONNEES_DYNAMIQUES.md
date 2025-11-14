# 🔄 RENDRE LES DONNÉES DYNAMIQUES

## ❌ **PROBLÈME ACTUEL**

Les circuits affichent des données **fixes** ou **vides** :
- Prix : 950 DH (toujours le même)
- Max participants : Fixe
- Durée : Fixe
- Pas de détails (highlights, inclus, itinéraire)

## ✅ **SOLUTION**

Les données doivent venir de **Supabase** et être **modifiables** depuis le dashboard admin.

---

## 📋 **ÉTAPE 1 : METTRE À JOUR LA BASE DE DONNÉES**

### **Exécuter le script SQL**

1. Ouvrir **Supabase SQL Editor**
2. Copier tout le contenu de `update-circuits-dynamic-data.sql`
3. Coller dans l'éditeur
4. Cliquer sur **"Run"**

Ce script va :
- ✅ Ajouter les colonnes manquantes (`max_participants`, `highlights`, `included`, `not_included`, `itinerary`)
- ✅ Mettre à jour vos circuits existants avec des données réelles
- ✅ Ajouter des exemples complets

### **Vérification**

Après exécution, vérifiez :

```sql
SELECT 
  title,
  price_per_person,
  duration_days,
  max_participants
FROM circuits_touristiques;
```

Vous devriez voir :
```
Désert de Merzouga    | 1200 | 3 | 15
Villes Impériales     | 2500 | 7 | 20
Vallée du Dadès       | 950  | 2 | 12
Essaouira             | 450  | 1 | 25
```

---

## 📊 **ÉTAPE 2 : STRUCTURE DES DONNÉES**

### **Colonnes de la table `circuits_touristiques`**

```sql
CREATE TABLE circuits_touristiques (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[],
  city TEXT,
  
  -- DONNÉES DYNAMIQUES
  price_per_person NUMERIC NOT NULL,      -- Prix par personne
  duration_days INTEGER NOT NULL,         -- Durée en jours
  max_participants INTEGER DEFAULT 15,    -- Nombre max de participants
  
  -- DÉTAILS
  highlights TEXT[],                      -- Points forts
  included TEXT[],                        -- Ce qui est inclus
  not_included TEXT[],                    -- Ce qui n'est pas inclus
  itinerary JSONB,                        -- Itinéraire jour par jour
  
  -- AUTRES
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 **ÉTAPE 3 : COMMENT MODIFIER LES DONNÉES**

### **Option 1 : Depuis Supabase (Rapide)**

1. Aller dans **Supabase → Table Editor**
2. Sélectionner la table `circuits_touristiques`
3. Cliquer sur une ligne pour modifier
4. Changer les valeurs :
   - `price_per_person` : 1500
   - `duration_days` : 4
   - `max_participants` : 20
5. Sauvegarder

### **Option 2 : Avec SQL (Précis)**

```sql
-- Modifier un circuit spécifique
UPDATE circuits_touristiques
SET 
  price_per_person = 1500,
  duration_days = 4,
  max_participants = 20,
  highlights = ARRAY[
    'Point fort 1',
    'Point fort 2',
    'Point fort 3'
  ],
  included = ARRAY[
    'Transport',
    'Hébergement',
    'Repas'
  ],
  not_included = ARRAY[
    'Boissons',
    'Pourboires'
  ]
WHERE title = 'Nom du circuit';
```

### **Option 3 : Dashboard Admin (À créer)**

Créer une page admin pour gérer les circuits :
- Formulaire de modification
- Upload d'images
- Gestion de l'itinéraire
- Activation/désactivation

---

## 📝 **EXEMPLES DE DONNÉES**

### **Circuit 1 : Désert de Merzouga (3 jours)**

```sql
UPDATE circuits_touristiques
SET 
  price_per_person = 1200,
  duration_days = 3,
  max_participants = 15,
  highlights = ARRAY[
    'Coucher de soleil sur les dunes',
    'Nuit en bivouac berbère',
    'Balade à dos de chameau',
    'Visite des villages berbères',
    'Musique traditionnelle'
  ],
  included = ARRAY[
    'Transport en 4x4',
    'Hébergement en bivouac',
    'Tous les repas',
    'Guide francophone',
    'Balade à chameau'
  ],
  not_included = ARRAY[
    'Boissons alcoolisées',
    'Pourboires',
    'Dépenses personnelles'
  ],
  itinerary = '[
    {
      "day": 1,
      "title": "Marrakech - Merzouga",
      "description": "Départ de Marrakech. Traversée du Haut Atlas. Arrivée à Merzouga."
    },
    {
      "day": 2,
      "title": "Exploration du désert",
      "description": "Journée dans le désert. Balade à chameau. Nuit en bivouac."
    },
    {
      "day": 3,
      "title": "Retour à Marrakech",
      "description": "Lever de soleil. Retour à Marrakech."
    }
  ]'::jsonb
WHERE title ILIKE '%merzouga%';
```

### **Circuit 2 : Essaouira (1 jour)**

```sql
UPDATE circuits_touristiques
SET 
  price_per_person = 450,
  duration_days = 1,
  max_participants = 25,
  highlights = ARRAY[
    'Médina UNESCO',
    'Port de pêche',
    'Plages atlantiques',
    'Artisanat local'
  ],
  included = ARRAY[
    'Transport aller-retour',
    'Guide francophone',
    'Eau minérale'
  ],
  not_included = ARRAY[
    'Repas',
    'Entrées musées',
    'Activités nautiques'
  ],
  itinerary = '[
    {
      "day": 1,
      "title": "Marrakech - Essaouira - Marrakech",
      "description": "Journée complète à Essaouira. Visite de la médina et du port. Temps libre."
    }
  ]'::jsonb
WHERE title ILIKE '%essaouira%';
```

---

## 🔍 **VÉRIFIER QUE C'EST DYNAMIQUE**

### **Test 1 : Modifier un prix**

```sql
-- Changer le prix du circuit Merzouga
UPDATE circuits_touristiques
SET price_per_person = 1500
WHERE title ILIKE '%merzouga%';
```

Puis :
1. Rafraîchir la page `/services/tourisme`
2. Cliquer sur le circuit Merzouga
3. Vérifier que le prix affiché est **1500 DH** (et non 1200 DH)

### **Test 2 : Modifier la durée**

```sql
-- Changer la durée
UPDATE circuits_touristiques
SET duration_days = 4
WHERE title ILIKE '%merzouga%';
```

Rafraîchir → Le circuit doit afficher **4 jours**

### **Test 3 : Modifier max participants**

```sql
-- Changer le nombre max
UPDATE circuits_touristiques
SET max_participants = 10
WHERE title ILIKE '%merzouga%';
```

Rafraîchir → Doit afficher **Max 10 participants**

---

## 🎨 **PERSONNALISER POUR CHAQUE CIRCUIT**

### **Formule de prix**

Vous pouvez avoir des prix différents selon :
- La durée
- Le confort
- La saison
- Le nombre de participants

```sql
-- Circuit économique
UPDATE circuits_touristiques
SET price_per_person = 800
WHERE title = 'Circuit Budget Désert';

-- Circuit premium
UPDATE circuits_touristiques
SET price_per_person = 2500
WHERE title = 'Circuit Luxe Désert';
```

### **Durées variées**

```sql
-- Excursion 1 jour
UPDATE circuits_touristiques
SET duration_days = 1
WHERE title ILIKE '%essaouira%';

-- Weekend 2 jours
UPDATE circuits_touristiques
SET duration_days = 2
WHERE title ILIKE '%dadès%';

-- Semaine complète
UPDATE circuits_touristiques
SET duration_days = 7
WHERE title ILIKE '%villes impériales%';
```

### **Capacités différentes**

```sql
-- Petit groupe (intimiste)
UPDATE circuits_touristiques
SET max_participants = 8
WHERE title ILIKE '%luxe%';

-- Groupe moyen
UPDATE circuits_touristiques
SET max_participants = 15
WHERE title ILIKE '%standard%';

-- Grand groupe (économique)
UPDATE circuits_touristiques
SET max_participants = 30
WHERE title ILIKE '%budget%';
```

---

## 📱 **DASHBOARD ADMIN (Recommandé)**

Pour faciliter la gestion, créez une page admin :

### **Fonctionnalités**

1. **Liste des circuits**
   - Tableau avec tous les circuits
   - Filtres par ville, durée, prix

2. **Formulaire de modification**
   - Titre, description
   - Prix, durée, max participants
   - Images (upload)
   - Points forts (liste)
   - Inclus / Non inclus
   - Itinéraire (éditeur)

3. **Actions rapides**
   - Activer / Désactiver
   - Dupliquer
   - Supprimer

### **Exemple de formulaire**

```typescript
// /src/Pages/dashboards/admin/CircuitsManagement.tsx
const CircuitForm = ({ circuit }) => {
  const [formData, setFormData] = useState({
    title: circuit.title,
    price_per_person: circuit.price_per_person,
    duration_days: circuit.duration_days,
    max_participants: circuit.max_participants,
    // ... autres champs
  });

  const handleSave = async () => {
    await supabase
      .from('circuits_touristiques')
      .update(formData)
      .eq('id', circuit.id);
  };

  return (
    <form>
      <input 
        type="number" 
        value={formData.price_per_person}
        onChange={(e) => setFormData({
          ...formData, 
          price_per_person: parseFloat(e.target.value)
        })}
      />
      {/* ... autres champs */}
      <button onClick={handleSave}>Sauvegarder</button>
    </form>
  );
};
```

---

## ✅ **CHECKLIST**

### **Base de données**
- [ ] Exécuter `update-circuits-dynamic-data.sql`
- [ ] Vérifier que les colonnes existent
- [ ] Vérifier que les données sont remplies

### **Test**
- [ ] Modifier un prix dans Supabase
- [ ] Rafraîchir la page
- [ ] Vérifier que le nouveau prix s'affiche
- [ ] Tester avec durée et max participants

### **Données**
- [ ] Tous les circuits ont un prix
- [ ] Tous les circuits ont une durée
- [ ] Tous les circuits ont max_participants
- [ ] Tous les circuits ont des highlights
- [ ] Tous les circuits ont included/not_included

### **Dashboard (Optionnel)**
- [ ] Créer la page admin de gestion
- [ ] Formulaire de modification
- [ ] Upload d'images
- [ ] Gestion de l'itinéraire

---

## 🚀 **RÉSULTAT ATTENDU**

### **Avant** ❌
```
Tous les circuits : 950 DH
Durée : Toujours la même
Max participants : Fixe
Pas de détails
```

### **Après** ✅
```
Circuit Merzouga : 1200 DH | 3 jours | Max 15
Circuit Essaouira : 450 DH | 1 jour | Max 25
Circuit Impériales : 2500 DH | 7 jours | Max 20
Avec highlights, inclus, itinéraire complet
```

---

## 📞 **SUPPORT**

### **Problème : Les données ne changent pas**

1. Vérifier que le script SQL a bien été exécuté
2. Vider le cache du navigateur (Ctrl+Shift+R)
3. Vérifier dans Supabase Table Editor
4. Vérifier les logs de la console

### **Problème : Colonnes manquantes**

```sql
-- Vérifier les colonnes
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'circuits_touristiques';
```

Si une colonne manque, l'ajouter :

```sql
ALTER TABLE circuits_touristiques 
ADD COLUMN max_participants INTEGER DEFAULT 15;
```

---

**Maintenant vos circuits sont 100% dynamiques !** 🎉

**Exécutez le script SQL et testez !** 🚀
