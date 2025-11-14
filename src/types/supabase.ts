import type { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type Profile = Tables<'profiles'>;

export type ServiceType = 'hotel' | 'restaurant' | 'activity' | 'transport' | 'guide' | 'evenement' | 'activite' | 'appartement' | 'villa' | 'voiture';

// Extension du type Service pour inclure toutes les propriétés nécessaires
export interface ServiceBase {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  rating?: number;
  type: ServiceType;
  images: string[];
  available?: boolean;
  capacity?: number;
  duration?: number;
  features?: string[];
  rules?: string[];
  cancellation_policy?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  amenities?: string[];
  is_featured?: boolean;
  is_verified?: boolean;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  status?: 'draft' | 'published' | 'archived';
  views_count?: number;
  favorites_count?: number;
  bookings_count?: number;
  average_rating?: number;
  reviews_count?: number;
  partner_id?: string;
  partner?: Partner;
  category_id?: string;
  subcategory_id?: string;
  tags?: string[];
  start_date?: string;
  end_date?: string;
  time_slots?: Array<{
    id: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }>;
  availability?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  pricing_options?: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    duration?: number;
    is_popular?: boolean;
  }>;
  faqs?: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  reviews?: Array<{
    id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    user: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  }>;
}

export type Partner = Profile & {
  services?: Service[];
  ratings?: number;
};

// Type de base pour les services
export type Service = Omit<ServiceBase, keyof Tables<'services'>> & Tables<'services'> & {
  // Propriétés spécifiques qui peuvent être ajoutées ou surchargées
  name: string;
  title: string;
  type: ServiceType;
  price: number;
  location: string;
  images: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  description?: string;
  rating?: number;
};

export type Booking = Tables<'bookings'> & {
  id: string;
  service_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_price: number;
  created_at: string;
  updated_at: string;
};

// Types pour les formulaires
export interface PartnerFormData {
  company_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  description?: string;
  bank_account?: string;
  iban?: string;
}
export interface ServiceWithPartner extends Service {
  partner?: Partner;
}

export interface BookingWithService extends Booking {
  service?: ServiceWithPartner;
}
