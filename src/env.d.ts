/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  
  // Stripe
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  
  // Application
  readonly VITE_APP_URL: string;
  
  // Google OAuth
  readonly VITE_GOOGLE_CLIENT_ID: string;
  
  // Autres variables d'environnement
  readonly MODE: 'development' | 'production' | 'test';
  readonly NODE_ENV: 'development' | 'production' | 'test';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
