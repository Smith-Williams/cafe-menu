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
          is_owner: boolean
          created_at: string
        }
        Insert: {
          id: string
          is_owner?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          is_owner?: boolean
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name_ar: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name_ar: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name_ar?: string
          sort_order?: number
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          category_id: string
          name_ar: string
          description_ar: string | null
          price: number
          image_url: string | null
          available: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name_ar: string
          description_ar?: string | null
          price: number
          image_url?: string | null
          available?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name_ar?: string
          description_ar?: string | null
          price?: number
          image_url?: string | null
          available?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string
          notes: string | null
          total_amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone: string
          notes?: string | null
          total_amount: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_phone?: string
          notes?: string | null
          total_amount?: number
          status?: string
          created_at?: string
        }
      }
      cafe_settings: {
        Row: {
          id: string
          cafe_name_ar: string
          tagline_ar: string | null
          logo_url: string | null
          primary_color: string
          accent_color: string
          currency_code: string
          updated_at: string
        }
        Insert: {
          id?: string
          cafe_name_ar?: string
          tagline_ar?: string | null
          logo_url?: string | null
          primary_color?: string
          accent_color?: string
          currency_code?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cafe_name_ar?: string
          tagline_ar?: string | null
          logo_url?: string | null
          primary_color?: string
          accent_color?: string
          currency_code?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string | null
          quantity: number
          unit_price: number
          item_name_ar: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id?: string | null
          quantity: number
          unit_price: number
          item_name_ar: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string | null
          quantity?: number
          unit_price?: number
          item_name_ar?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Category = Database['public']['Tables']['categories']['Row']
export type MenuItem = Database['public']['Tables']['items']['Row']
export type CafeSettings = Database['public']['Tables']['cafe_settings']['Row']

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
