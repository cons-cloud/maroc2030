# 🎨 Script de remplacement des couleurs - Dashboards

## ✅ Déjà fait

- **DashboardLayout.tsx** : Logo "Maroc 2030" en vert émeraude ✅
- **DashboardLayout.tsx** : Fond sidebar en dégradé vert ✅
- **DashboardLayout.tsx** : Icônes et liens en vert ✅

---

## 🔄 Remplacements à faire dans TOUS les fichiers dashboards

### **Rechercher et remplacer dans VS Code** :

1. **Ouvrir la recherche globale** : `Cmd+Shift+F` (Mac) ou `Ctrl+Shift+F` (Windows)

2. **Activer le mode Regex** : Cliquer sur `.*` dans la barre de recherche

3. **Définir le dossier** : `/src/Pages/dashboards`

---

### **Remplacement 1 : Boutons bleus → verts**

**Chercher** :
```
bg-blue-(\d+)
```

**Remplacer par** :
```
bg-emerald-$1
```

**Exemples** :
- `bg-blue-600` → `bg-emerald-600`
- `bg-blue-500` → `bg-emerald-500`

---

### **Remplacement 2 : Texte bleu → vert**

**Chercher** :
```
text-blue-(\d+)
```

**Remplacer par** :
```
text-emerald-$1
```

---

### **Remplacement 3 : Hover bleu → vert**

**Chercher** :
```
hover:bg-blue-(\d+)
```

**Remplacer par** :
```
hover:bg-emerald-$1
```

---

### **Remplacement 4 : Dégradés from-blue → from-emerald**

**Chercher** :
```
from-blue-(\d+)
```

**Remplacer par** :
```
from-emerald-$1
```

---

### **Remplacement 5 : Dégradés to-blue → to-green**

**Chercher** :
```
to-blue-(\d+)
```

**Remplacer par** :
```
to-green-$1
```

---

### **Remplacement 6 : Focus ring bleu → vert**

**Chercher** :
```
focus:ring-blue-(\d+)
```

**Remplacer par** :
```
focus:ring-emerald-$1
```

---

### **Remplacement 7 : Border bleu → vert**

**Chercher** :
```
border-blue-(\d+)
```

**Remplacer par** :
```
border-emerald-$1
```

---

## 🎯 Ordre d'exécution

1. ✅ Remplacer `bg-blue-` → `bg-emerald-`
2. ✅ Remplacer `text-blue-` → `text-emerald-`
3. ✅ Remplacer `hover:bg-blue-` → `hover:bg-emerald-`
4. ✅ Remplacer `hover:text-blue-` → `hover:text-emerald-`
5. ✅ Remplacer `from-blue-` → `from-emerald-`
6. ✅ Remplacer `to-blue-` → `to-green-`
7. ✅ Remplacer `focus:ring-blue-` → `focus:ring-emerald-`
8. ✅ Remplacer `border-blue-` → `border-emerald-`

---

## 📊 Fichiers concernés (147 occurrences)

- PartnerDashboard.tsx (29)
- PartnerDashboardComplete.tsx (13)
- PartnerEvents.tsx (9)
- MessagesManagement.tsx (8)
- ServiceForm.tsx (8)
- PartnerAnnonces.tsx (7)
- SettingsManagement.tsx (6)
- Et 30 autres fichiers...

---

## ⚡ Méthode rapide (Recommandée)

### **Dans VS Code** :

1. **Cmd+Shift+H** (Rechercher et remplacer dans les fichiers)
2. **Fichiers à inclure** : `src/Pages/dashboards/**/*.tsx`
3. **Activer Regex** : `.*`
4. **Faire les 8 remplacements ci-dessus un par un**
5. **Cliquer sur "Remplacer tout"** pour chaque

---

## 🎨 Résultat attendu

### **Avant** ❌ :
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white">
  Ajouter
</button>
```

### **Après** ✅ :
```tsx
<button className="bg-emerald-600 hover:bg-emerald-700 text-white">
  Ajouter
</button>
```

---

## ✅ Vérification

Après les remplacements, chercher :
```
bg-blue|text-blue|from-blue|to-blue
```

**Résultat attendu** : 0 occurrence dans `/src/Pages/dashboards`

---

## 🚨 Attention

**Ne pas remplacer** :
- Les couleurs dans les commentaires
- Les noms de variables (ex: `blueColor`)
- Les imports

**Remplacer uniquement** :
- Les classes Tailwind CSS

---

## 📝 Checklist

- [ ] Ouvrir VS Code
- [ ] Cmd+Shift+H (Rechercher/Remplacer global)
- [ ] Définir dossier : `src/Pages/dashboards`
- [ ] Activer Regex
- [ ] Faire les 8 remplacements
- [ ] Vérifier qu'il ne reste plus de bleu
- [ ] Tester les dashboards

---

**Temps estimé : 5 minutes** ⏱️

**Tous les boutons et éléments bleus seront en vert émeraude !** 🎨✨
