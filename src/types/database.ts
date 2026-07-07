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
          acquired_at: string | null
          acquisition_source: string
          preparation_status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vehicles']['Row'], 'id' | 'created_at' | 'updated_at' | 'acquired_at' | 'acquisition_source' | 'preparation_status'> &
          Partial<Pick<Database['public']['Tables']['vehicles']['Row'], 'acquired_at' | 'acquisition_source' | 'preparation_status'>>
        Update: Partial<Omit<Database['public']['Tables']['vehicles']['Row'], 'id' | 'created_at' | 'updated_at'>>
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
      team_members: {
        Row: {
          id: string
          dealership_id: string
          user_id: string | null
          name: string
          email: string | null
          phone: string | null
          role: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>
      }
      vehicle_acquisitions: {
        Row: {
          id: string
          vehicle_id: string
          acquisition_price: number
          supplier_name: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['vehicle_acquisitions']['Row'], 'id' | 'created_at' | 'created_by'>
        Update: Partial<Database['public']['Tables']['vehicle_acquisitions']['Insert']>
      }
      vehicle_costs: {
        Row: {
          id: string
          dealership_id: string
          vehicle_id: string
          cost_type: string
          amount: number
          description: string
          supplier: string | null
          incurred_at: string
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['vehicle_costs']['Row'], 'id' | 'created_at' | 'created_by'>
        Update: Partial<Database['public']['Tables']['vehicle_costs']['Insert']>
      }
      dealership_settings: {
        Row: {
          dealership_id: string
          commission_type: string
          commission_base: string
          commission_value: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['dealership_settings']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['dealership_settings']['Insert']>
      }
      sales: {
        Row: {
          id: string
          dealership_id: string
          vehicle_id: string
          seller_id: string | null
          lead_id: string | null
          buyer_name: string
          buyer_phone: string | null
          sale_price: number
          sold_at: string
          payment_method: string
          acquisition_price_snapshot: number
          costs_total_snapshot: number
          commission_type_snapshot: string
          commission_base_snapshot: string
          commission_value_snapshot: number
          commission_amount: number
          gross_profit: number
          net_profit: number
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sales']['Row'],
          'id' | 'created_at' | 'created_by' | 'gross_profit' | 'net_profit'>
        Update: Partial<Database['public']['Tables']['sales']['Insert']>
      }
      financial_entries: {
        Row: {
          id: string
          dealership_id: string
          kind: string
          category: string
          description: string
          amount: number
          due_date: string
          paid_at: string | null
          vehicle_id: string | null
          sale_id: string | null
          team_member_id: string | null
          created_by: string | null
          created_at: string
          group_id: string | null
          series_type: string | null
          series_index: number | null
          series_total: number | null
          series_frequency: string | null
        }
        Insert: Omit<Database['public']['Tables']['financial_entries']['Row'],
          'id' | 'created_at' | 'created_by' | 'group_id' | 'series_type' | 'series_index' | 'series_total' | 'series_frequency'> &
          Partial<Pick<Database['public']['Tables']['financial_entries']['Row'],
            'group_id' | 'series_type' | 'series_index' | 'series_total' | 'series_frequency'>>
        Update: Partial<Database['public']['Tables']['financial_entries']['Insert']>
      }
    }
    Views: {
      seller_sales: {
        Row: {
          id: string
          vehicle_id: string
          seller_id: string
          buyer_name: string
          sale_price: number
          sold_at: string
          payment_method: string
          commission_amount: number
        }
      }
    }
  }
}
