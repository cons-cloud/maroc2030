import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

// Configuration pour Vercel
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  
  const plugins = [
    // Configuration minimale de React Refresh
    react({
      // Désactive le chargement automatique de Babel pour éviter les doublons
      babel: {
        babelrc: false,
        configFile: false,
        plugins: []
      }
    }),
    tailwindcss(),
  ];

  // Désactive complètement le HMR en production
  if (isProduction) {
    process.env.VITE_DISABLE_HMR = 'true';
  }

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

  // Configuration de base
  const config = {
    base: '/',
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 3000,
      host: true,
      strictPort: true,
      hmr: !isProduction ? {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
      } : false,
    },
    preview: {
      port: 3000,
      host: true,
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      target: 'esnext',
      minify: isProduction ? ('terser' as const) : false,
      sourcemap: !isProduction,
      chunkSizeWarningLimit: 1000,
      emptyOutDir: true,
      modulePreload: {
        polyfill: true
      },
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: (id: string) => {
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
            if (id.includes('src/Pages/dashboards/admin')) {
              return 'admin';
            }
            if (id.includes('src/Pages/dashboards/partner')) {
              return 'partner';
            }
            if (id.includes('src/Pages/dashboards/client')) {
              return 'client';
            }
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
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    define: {
      'process.env': {},
      ...(isProduction ? {
        'import.meta.env.VITE_APP_HMR': 'false',
        'import.meta.hot': 'undefined',
        'process.env.NODE_ENV': '"production"'
      } : {})
    }
  };

  return config;
});