export interface Database {
  public: {
    Tables: {
      dealerships: {
        Row: {
          id: string
          name: string
          slug: string
          phone: string | null
          email: string | null
          city: string | null
          state: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['dealerships']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['dealerships']['Insert']>
      }
      vehicles: {
        Row: {
          id: string
          dealership_id: string | null
          slug: string
          brand: string
          model: string
          version: string
          year_manufacture: number
          year_model: number
          price: number
          mileage: number
          transmission: string
          fuel_type: string
          color: string
          doors: number
          plate_final: string | null
          description_short: string
          description_full: string
          status: string
          is_featured: boolean
          is_published: boolean
          published_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vehicles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>
      }
      vehicle_images: {
        Row: {
          id: string
          vehicle_id: string
          storage_path: string
          image_url: string
          position: string | null
          is_cover: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['vehicle_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['vehicle_images']['Insert']>
      }
      vehicle_features: {
        Row: {
          id: string
          vehicle_id: string
          feature_name: string
        }
        Insert: Omit<Database['public']['Tables']['vehicle_features']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['vehicle_features']['Insert']>
      }
      leads: {
        Row: {
          id: string
          dealership_id: string | null
          vehicle_id: string | null
          name: string
          phone: string
          email: string | null
          source: string
          message: string | null
          status: string
          created_at: string
          last_contact_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
    }
  }
}
