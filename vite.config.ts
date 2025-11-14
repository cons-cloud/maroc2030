import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Configuration pour les imports dynamiques
    rollupOptions: {
      output: {
        manualChunks: {
          // Création de chunks séparés pour les pages
          admin: ['./src/Pages/dashboards/AdminDashboard'],
          partner: ['./src/Pages/dashboards/PartnerDashboard'],
          client: ['./src/Pages/dashboards/ClientDashboard'],
        },
      },
    },
  },
  // Configuration pour le chargement des modules
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Configuration pour le chargement des fichiers de traduction
  define: {
    'process.env': {}
  }
});