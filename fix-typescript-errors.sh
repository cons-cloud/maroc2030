#!/bin/bash

# Script pour installer les types manquants et corriger les erreurs TypeScript

echo "🔧 Installation des types manquants..."

# Installer les types pour crypto-js
npm install --save-dev @types/crypto-js

# Installer canvas-confetti et ses types
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti

echo "✅ Types installés avec succès!"
echo ""
echo "📝 Erreurs restantes à corriger manuellement:"
echo "- Imports inutilisés (warnings)"
echo "- Propriétés d'index signature (utiliser la notation avec crochets)"
echo ""
echo "Pour voir toutes les erreurs: npm run build"
