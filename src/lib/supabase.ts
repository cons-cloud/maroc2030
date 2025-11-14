import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

// Création du client Supabase avec les variables d'environnement validées
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types pour la base de données
export type UserRole = 'admin' | 'partner_tourism' | 'partner_car' | 'partner_realestate' | 'client';
export type ServiceType = 'tourism' | 'car_rental' | 'real_estate' | 'hotel' | 'event';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PropertyType = 'apartment' | 'villa' | 'riad' | 'house';

export interface Profile {
  id: string;
  role: UserRole;
  email?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  avatar_url?: string;
  description?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // Champs partenaires
  partner_type?: string;
  commission_rate?: number;
  bank_account?: string;
  iban?: string;
  total_earnings?: number;
  pending_earnings?: number;
  paid_earnings?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  name_ar?: string;
  type: ServiceType;
  icon?: string;
  description?: string;
  created_at: string;
}

export interface Service {
  id: string;
  partner_id: string;
  category_id: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  price: number;
  price_per: string;
  location?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  available: boolean;
  featured: boolean;
  images?: string[];
  features?: any;
  contact_phone?: string;
  contact_email?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TourismPackage {
  id: string;
  partner_id: string;
  title: string;
  description?: string;
  destination: string;
  duration_days: number;
  price_per_person: number;
  max_participants?: number;
  includes?: string[];
  excludes?: string[];
  itinerary?: any;
  images?: string[];
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  partner_id: string;
  title: string;
  description?: string;
  event_type?: string;
  location: string;
  address?: string;
  start_date: string;
  end_date: string;
  price?: number;
  max_attendees?: number;
  images?: string[];
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Car {
  id: string;
  partner_id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuel_type: string;
  seats: number;
  doors: number;
  price_per_day: number;
  features?: string[];
  images?: string[];
  license_plate?: string;
  is_available: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  partner_id: string;
  property_type: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  max_guests?: number;
  area_sqm?: number;
  price_per_night: number;
  amenities?: string[];
  images?: string[];
  is_available: boolean;
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  booking_type: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: PaymentStatus;
  stripe_payment_intent_id?: string;
  transaction_id?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  replied_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  booking_type: string;
  booking_id: string;
  rating: number;
  comment?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}
