export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          is_demo: boolean
          phone: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_demo?: boolean
          phone?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_demo?: boolean
          phone?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_users_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          contact: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_demo: boolean
          location: string | null
          name: string
          sort_order: number | null
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          location?: string | null
          name: string
          sort_order?: number | null
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          location?: string | null
          name?: string
          sort_order?: number | null
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_settings: {
        Row: {
          created_at: string | null
          gym_id: string | null
          id: string
          instagram_url: string | null
          is_demo: boolean
          updated_at: string | null
          user_id: string
          vendor_id: string | null
          whatsapp_message: string | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          gym_id?: string | null
          id?: string
          instagram_url?: string | null
          is_demo?: boolean
          updated_at?: string | null
          user_id: string
          vendor_id?: string | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          gym_id?: string | null
          id?: string
          instagram_url?: string | null
          is_demo?: boolean
          updated_at?: string | null
          user_id?: string
          vendor_id?: string | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_settings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          expense_date: string
          id: string
          is_demo: boolean
          title: string
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string | null
          expense_date: string
          id?: string
          is_demo?: boolean
          title: string
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          expense_date?: string
          id?: string
          is_demo?: boolean
          title?: string
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          is_demo: boolean
          sort_order: number | null
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_demo?: boolean
          sort_order?: number | null
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_demo?: boolean
          sort_order?: number | null
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_settings: {
        Row: {
          created_at: string | null
          gym_name: string | null
          id: string
          is_demo: boolean
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          gym_name?: string | null
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          gym_name?: string | null
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_settings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_number: string | null
          is_demo: boolean
          issued_date: string
          member_id: string | null
          metadata: Json
          payment_id: string | null
          pdf_url: string | null
          status: string
          tax: number
          total: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          invoice_number?: string | null
          is_demo?: boolean
          issued_date?: string
          member_id?: string | null
          metadata?: Json
          payment_id?: string | null
          pdf_url?: string | null
          status?: string
          tax?: number
          total?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_number?: string | null
          is_demo?: boolean
          issued_date?: string
          member_id?: string | null
          metadata?: Json
          payment_id?: string | null
          pdf_url?: string | null
          status?: string
          tax?: number
          total?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string | null
          fitness_goal: string | null
          id: string
          is_demo: boolean
          name: string
          phone: string
          status: string | null
          updated_at: string | null
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          fitness_goal?: string | null
          id?: string
          is_demo?: boolean
          name: string
          phone: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          fitness_goal?: string | null
          id?: string
          is_demo?: boolean
          name?: string
          phone?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string | null
          expiry_date: string
          id: string
          is_demo: boolean
          name: string
          phone: string
          plan_id: string | null
          start_date: string
          status: string | null
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          expiry_date: string
          id?: string
          is_demo?: boolean
          name: string
          phone: string
          plan_id?: string | null
          start_date: string
          status?: string | null
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          expiry_date?: string
          id?: string
          is_demo?: boolean
          name?: string
          phone?: string
          plan_id?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_demo: boolean
          is_read: boolean
          link: string | null
          metadata: Json
          title: string
          type: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          is_read?: boolean
          link?: string | null
          metadata?: Json
          title: string
          type: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          is_read?: boolean
          link?: string | null
          metadata?: Json
          title?: string
          type?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          is_demo: boolean
          member_id: string
          method: string
          note: string | null
          payment_date: string
          status: string
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          is_demo?: boolean
          member_id: string
          method?: string
          note?: string | null
          payment_date: string
          status?: string
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          is_demo?: boolean
          member_id?: string
          method?: string
          note?: string | null
          payment_date?: string
          status?: string
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          benefits: string[] | null
          category: string | null
          created_at: string | null
          duration_days: number
          id: string
          is_demo: boolean
          is_highlighted: boolean | null
          name: string
          price: number
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          benefits?: string[] | null
          category?: string | null
          created_at?: string | null
          duration_days?: number
          id?: string
          is_demo?: boolean
          is_highlighted?: boolean | null
          name: string
          price?: number
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          benefits?: string[] | null
          category?: string | null
          created_at?: string | null
          duration_days?: number
          id?: string
          is_demo?: boolean
          is_highlighted?: boolean | null
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      popups: {
        Row: {
          body: string | null
          created_at: string
          cta_label: string | null
          cta_url: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_demo: boolean
          is_visible: boolean
          starts_at: string | null
          title: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          is_visible?: boolean
          starts_at?: string | null
          title: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          is_visible?: boolean
          starts_at?: string | null
          title?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "popups_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          gym_id: string | null
          id: string
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          gym_id?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          gym_id?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recycle_bin: {
        Row: {
          deleted_at: string
          deleted_by: string | null
          entity_id: string
          entity_type: string
          expires_at: string
          id: string
          is_demo: boolean
          payload: Json
          vendor_id: string | null
        }
        Insert: {
          deleted_at?: string
          deleted_by?: string | null
          entity_id: string
          entity_type: string
          expires_at?: string
          id?: string
          is_demo?: boolean
          payload: Json
          vendor_id?: string | null
        }
        Update: {
          deleted_at?: string
          deleted_by?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string
          id?: string
          is_demo?: boolean
          payload?: Json
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recycle_bin_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_demo: boolean
          name: string
          rating: number
          sort_order: number | null
          text: string | null
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          name: string
          rating?: number
          sort_order?: number | null
          text?: string | null
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          name?: string
          rating?: number
          sort_order?: number | null
          text?: string | null
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          action: string
          allowed: boolean
          created_at: string
          id: string
          module: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          action: string
          allowed?: boolean
          created_at?: string
          id?: string
          module: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          action?: string
          allowed?: boolean
          created_at?: string
          id?: string
          module?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      super_owner_vendor_access: {
        Row: {
          created_at: string
          id: string
          permissions: Json
          super_owner_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json
          super_owner_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json
          super_owner_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "super_owner_vendor_access_super_owner_id_fkey"
            columns: ["super_owner_id"]
            isOneToOne: false
            referencedRelation: "super_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "super_owner_vendor_access_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      super_owners: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_demo: boolean
          is_visible: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
          user_id: string
          vendor_id: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_demo?: boolean
          is_visible?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
          user_id: string
          vendor_id?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_demo?: boolean
          is_visible?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_assignments: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_demo: boolean
          member_id: string
          notes: string | null
          sessions_completed: number
          start_date: string
          status: string
          total_sessions: number
          trainer_id: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_demo?: boolean
          member_id: string
          notes?: string | null
          sessions_completed?: number
          start_date?: string
          status?: string
          total_sessions?: number
          trainer_id: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_demo?: boolean
          member_id?: string
          notes?: string | null
          sessions_completed?: number
          start_date?: string
          status?: string
          total_sessions?: number
          trainer_id?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_assignments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_sessions: {
        Row: {
          assignment_id: string
          created_at: string
          id: string
          is_demo: boolean
          notes: string | null
          session_date: string
          status: string
          vendor_id: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string
          id?: string
          is_demo?: boolean
          notes?: string | null
          session_date?: string
          status?: string
          vendor_id?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          notes?: string | null
          session_date?: string
          status?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_sessions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "trainer_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_sessions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_demo: boolean
          name: string
          sort_order: number | null
          specialization: string | null
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          name: string
          sort_order?: number | null
          specialization?: string | null
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          name?: string
          sort_order?: number | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_demo: boolean
          metadata: Json
          name: string
          owner_user_id: string | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_demo?: boolean
          metadata?: Json
          name: string
          owner_user_id?: string | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_demo?: boolean
          metadata?: Json
          name?: string
          owner_user_id?: string | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_demo: boolean
          is_enabled: boolean
          section_key: string
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_demo?: boolean
          is_enabled?: boolean
          section_key: string
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_demo?: boolean
          is_enabled?: boolean
          section_key?: string
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_content_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      website_sections: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_demo: boolean
          is_visible: boolean | null
          section_type: string
          sort_order: number | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          vendor_id: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          is_visible?: boolean | null
          section_type: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          vendor_id?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          is_visible?: boolean | null
          section_type?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          vendor_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_sections_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_shorts: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          is_visible: boolean
          sort_order: number
          title: string | null
          vendor_id: string | null
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          is_visible?: boolean
          sort_order?: number
          title?: string | null
          vendor_id?: string | null
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          is_visible?: boolean
          sort_order?: number
          title?: string | null
          vendor_id?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_shorts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_testimonials: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          is_visible: boolean
          sort_order: number
          thumbnail_url: string | null
          title: string | null
          vendor_id: string | null
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          is_visible?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title?: string | null
          vendor_id?: string | null
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          is_visible?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title?: string | null
          vendor_id?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_testimonials_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_vendor: {
        Args: { _user_id: string; _vendor_id: string }
        Returns: boolean
      }
      current_vendor_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "super_owner" | "owner" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "super_owner", "owner", "employee"],
    },
  },
} as const
