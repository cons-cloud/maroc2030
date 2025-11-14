import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Vérification des variables d'environnement critiques
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLIC_KEY',
  'VITE_APP_URL'
] as const;

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  const errorMessage = `\n\nERREUR: Variables d'environnement manquantes :\n${missingVars.join('\n')}\n\n` +
    'Assurez-vous que ces variables sont définies dans votre fichier .env\n' +
    'Consultez le fichier .env.example pour la configuration requise.\n';
  
  // Affiche une alerte en mode développement
  if (import.meta.env.DEV) {
    console.error(errorMessage);
    
    // Affiche une alerte dans l'interface utilisateur
    const alertDiv = document.createElement('div');
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '0';
    alertDiv.style.left = '0';
    alertDiv.style.right = '0';
    alertDiv.style.padding = '1rem';
    alertDiv.style.backgroundColor = '#fef2f2';
    alertDiv.style.color = '#991b1b';
    alertDiv.style.borderBottom = '1px solid #fecaca';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.fontFamily = 'monospace';
    alertDiv.style.whiteSpace = 'pre';
    alertDiv.style.overflowX = 'auto';
    alertDiv.textContent = errorMessage;
    document.body.prepend(alertDiv);
  }
  
  // En production, on peut choisir de bloquer le chargement ou de continuer avec des valeurs par défaut
  if (import.meta.env.PROD) {
    console.error('Erreur critique : variables d\'environnement manquantes');
    // Ici, vous pourriez rediriger vers une page d'erreur ou afficher un message utilisateur
  }
}

// Création d'un client React Query avec des options par défaut
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Récupération de l'élément racine
const container = document.getElementById('root');

if (!container) {
  throw new Error("L'élément racine 'root' est introuvable dans le DOM");
}

// Création de la racine de rendu
const root = createRoot(container);

// Rendu de l'application avec les fournisseurs nécessaires
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  </React.StrictMode>
);
