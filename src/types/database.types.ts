// Types générés automatiquement par Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          company_name: string | null
          phone: string | null
          address: string | null
          city: string | null
          description: string | null
          role: string | null
          bank_account: string | null
          iban: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          company_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          description?: string | null
          role?: string | null
          bank_account?: string | null
          iban?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          company_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          description?: string | null
          role?: string | null
          bank_account?: string | null
          iban?: string | null
        }
      }
      services: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          price: number | null
          category: string | null
          partner_id: string
          is_active: boolean
          images: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          price?: number | null
          category?: string | null
          partner_id: string
          is_active?: boolean
          images?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          price?: number | null
          category?: string | null
          partner_id?: string
          is_active?: boolean
          images?: string[] | null
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          user_id: string
          service_id: string
          status: string
          start_date: string
          end_date: string | null
          total_price: number
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          service_id: string
          status?: string
          start_date: string
          end_date?: string | null
          total_price: number
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          service_id?: string
          status?: string
          start_date?: string
          end_date?: string | null
          total_price?: number
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'partner' | 'client'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    }
  }
}