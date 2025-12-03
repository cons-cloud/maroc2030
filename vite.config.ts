import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

// Configuration Vite
export default defineConfig(({ mode }: ConfigEnv) => {

  // Charger les variables d'environnement
  loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const base = isProduction ? './' : '/';
  
  const plugins = [
    react({
      // Configuration minimale de React
      jsxImportSource: 'react',
      babel: {
        babelrc: false,
        configFile: false,
      }
    }),
    tailwindcss(),
  ];

  // Désactiver le HMR en production
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
  const config: UserConfig = {
    base: base,
    define: {
      'process.env': {},
      ...(isProduction ? {
        'import.meta.env.VITE_APP_HMR': 'false',
        'import.meta.hot': 'undefined',
        'process.env.NODE_ENV': '"production"'
      } : {})
    },
    plugins,
    
    // Configuration du serveur de développement
    server: {
      port: 4000,
      host: true,
      strictPort: true,
      hmr: !isProduction ? {
        protocol: 'ws',
        host: 'localhost',
        port: 4000,
      } : false,
    },
    
    // Configuration pour la prévisualisation
    preview: {
      port: 4000,
      host: true,
      strictPort: true,
    },
    
    // Configuration pour la construction
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false as boolean | 'esbuild' | 'terser' | undefined,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('@chakra-ui') || id.includes('@emotion')) {
                return 'vendor-chakra';
              }
              if (id.includes('@tanstack') || id.includes('@tanstack/')) {
                return 'vendor-tanstack';
              }
              if (id.includes('@stripe')) {
                return 'vendor-stripe';
              }
              return 'vendor-other';
            }
            return undefined;
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  };

  return config;
});