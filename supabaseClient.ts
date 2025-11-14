import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement
const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'];
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Configuration Supabase manquante dans les variables d'environnement");
  console.log("VALEURS ACTUELLES:", {
    VITE_SUPABASE_URL: import.meta.env['VITE_SUPABASE_URL'] ? 'défini' : 'non défini',
    VITE_SUPABASE_ANON_KEY: import.meta.env['VITE_SUPABASE_ANON_KEY'] ? 'défini' : 'non défini'
  });
  
  // Lancer une erreur plus descriptive
  throw new Error(
    "Configuration Supabase manquante. Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définis dans votre fichier .env"
  );
}

// Créer et exporter le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Types pour les données couramment utilisées
export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  role?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  start_date: string;
  end_date?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_price: number;
  created_at: string;
  updated_at: string;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number; // en minutes
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: string;
  image_url?: string;
}
