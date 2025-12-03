import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { CurrencyProvider } from './contexts/CurrencyContext';
import App from './App';
import './index.css';

// Vérifier que le navigateur supporte les fonctionnalités nécessaires
const isSupported = (() => {
  try {
    return (
      typeof window !== 'undefined' &&
      'Promise' in window &&
      'fetch' in window &&
      typeof createRoot === 'function'
    );
  } catch (e) {
    return false;
  }
})();

if (!isSupported) {
  document.body.innerHTML = `
    <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
      <h1>Navigateur non supporté</h1>
      <p>Votre navigateur ne prend pas en charge toutes les fonctionnalités nécessaires pour cette application.</p>
      <p>Veuillez mettre à jour votre navigateur ou utiliser une version récente de Chrome, Firefox, Safari ou Edge.</p>
    </div>
  `;
  throw new Error('Navigateur non supporté');
}

// Création du client Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Vérification des variables d'environnement critiques (uniquement en production)
const requiredEnvVars = import.meta.env.PROD ? [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLIC_KEY',
  'VITE_APP_URL'
] as const : [];

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
    alertDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#f8d7da;color:#721c24;padding:1rem;z-index:9999;font-family:sans-serif;';
    alertDiv.textContent = 'ERREUR: Variables d\'environnement manquantes. Voir la console pour plus de détails.';
    document.body.prepend(alertDiv);
  }
  
  // En production, on lance une erreur qui sera attrapée par le bloc try/catch plus bas
  if (import.meta.env.PROD) {
    throw new Error(errorMessage);
  }
}

// Fonction pour afficher l'erreur de manière élégante
function renderError(message: string) {
  const errorStyle = {
    fontFamily: 'sans-serif',
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    color: '#721c24',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '0.25rem',
    whiteSpace: 'pre-line',
    textAlign: 'center' as const,
  };

  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = Object.entries(errorStyle).map(([key, value]) => 
    `${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}:${value}${typeof value === 'number' ? 'px' : ''}`
  ).join(';');
  
  errorDiv.textContent = message;
  document.body.innerHTML = '';
  document.body.appendChild(errorDiv);
  document.title = 'Erreur - Maroc 2030';
}

// Création de la racine React
try {
  const container = document.getElementById('root');
  if (!container) throw new Error('Élément racine introuvable');

  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CurrencyProvider>
            <App />
          </CurrencyProvider>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Erreur lors du rendu de l\'application :', error);
  renderError(`Erreur critique lors du chargement de l'application :\n\n${error instanceof Error ? error.message : String(error)}`);
}
