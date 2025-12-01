import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

// Configuration pour Vercel
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');
  
  const plugins = [
    react(),
    tailwindcss(),
  ];

  // Ajouter l'analyse du bundle en mode production
  if (mode === 'analyze') {
    plugins.push(
      visualizer({
        open: true,
        brotliSize: true,
        filename: 'dist/bundle-analysis.html',
      }) as any
    );
  }
  
  return {
    plugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/',
  server: {
    port: 3000,
    host: true,
    strictPort: true,
  },
  preview: {
    port: 3000,
    host: true,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode !== 'production',
    minify: 'terser',
    chunkSizeWarningLimit: 1000, // Augmente la limite d'avertissement de taille des chunks
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Groupe les dépendances node_modules dans des chunks séparés
          if (id.includes('node_modules')) {
            if (id.includes('@mui/') || id.includes('@emotion/')) {
              return 'vendor_mui';
            }
            if (id.includes('@stripe/')) {
              return 'vendor_stripe';
            }
            if (id.includes('date-fns')) {
              return 'vendor_datefns';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor_react';
            }
            if (id.includes('@tanstack/')) {
              return 'vendor_tanstack';
            }
            return 'vendor';
          }
          // Création de chunks séparés pour les pages
          if (id.includes('src/Pages/dashboards/admin')) {
            return 'admin';
          }
          if (id.includes('src/Pages/dashboards/partner')) {
            return 'partner';
          }
          if (id.includes('src/Pages/dashboards/client')) {
            return 'client';
          }
          // Regrouper les composants UI communs
          if (id.includes('src/components/ui/')) {
            return 'ui_components';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
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
  };
});