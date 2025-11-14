#!/bin/bash

# Liste des fichiers à corriger
FILES=(
  "AppartementsManagement.tsx"
  "VillasManagement.tsx"
  "LocationsVoituresManagement.tsx"
  "CircuitsTouristiquesManagement.tsx"
  "ActivitesTouristiquesManagement.tsx"
  "BookingsManagement.tsx"
  "MessagesManagement.tsx"
  "SettingsManagement.tsx"
)

# Dossier des composants
COMPONENTS_DIR="/Users/jamilaaitbouchnani/Maroc-2030/src/Pages/dashboards/admin/"

# Fonction pour corriger un fichier
fix_component() {
  local file=$1
  local filepath="${COMPONENTS_DIR}${file}"
  
  echo "Traitement de $file..."
  
  # Créer une sauvegarde
  cp "$filepath" "${filepath}.bak"
  
  # 1. Supprimer l'import de DashboardLayout
  sed -i '' '/import.*DashboardLayout/d' "$filepath"
  
  # 2. Supprimer le wrapper DashboardLayout
  sed -i '' 's/<DashboardLayout[^>]*>//g' "$filepath"
  sed -i '' 's/<\/DashboardLayout>//g' "$filepath"
  
  # 3. Vérifier et corriger le JSX racine
  if ! grep -q "return (.*<div className=\"space-y-6\">" "$filepath"; then
    sed -i '' 's/return (.*<div/return (\n    <div className="space-y-6">\n      <div/' "$filepath"
  fi
  
  # 4. Corriger l'exportation
  sed -i '' '/export default/s/export default \(.*\);/\/\/ Exportation nommée pour la compatibilité avec React.lazy\nexport { \1 as default };/' "$filepath"
  
  echo "✅ $file corrigé"
}

# Exécuter la correction pour chaque fichier
for file in "${FILES[@]}"; do
  if [ -f "${COMPONENTS_DIR}${file}" ]; then
    fix_component "$file"
  else
    echo "⚠️ Fichier non trouvé : $file"
  fi
done

echo "✅ Tous les composants ont été mis à jour"
