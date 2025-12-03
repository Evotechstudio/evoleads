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
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
          plan: 'trial' | 'starter' | 'growth' | 'agency'
          credits: number
          trial_searches_used: number
          invite_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          plan?: 'trial' | 'starter' | 'growth' | 'agency'
          credits?: number
          trial_searches_used?: number
          invite_code?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          plan?: 'trial' | 'starter' | 'growth' | 'agency'
          credits?: number
          trial_searches_used?: number
          invite_code?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_searches: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          business_type: string
          country: string
          state: string
          city: string
          leads_requested: number
          status: 'pending' | 'processing' | 'completed' | 'failed'
          industry: string | null
          company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null
          location_radius: number | null
          advanced_filters: Json | null
          is_saved: boolean | null
          search_name: string | null
          alert_enabled: boolean | null
          alert_frequency: 'daily' | 'weekly' | 'monthly' | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          business_type: string
          country: string
          state: string
          city: string
          leads_requested: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          industry?: string | null
          company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null
          location_radius?: number | null
          advanced_filters?: Json | null
          is_saved?: boolean | null
          search_name?: string | null
          alert_enabled?: boolean | null
          alert_frequency?: 'daily' | 'weekly' | 'monthly' | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          business_type?: string
          country?: string
          state?: string
          city?: string
          leads_requested?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          industry?: string | null
          company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null
          location_radius?: number | null
          advanced_filters?: Json | null
          is_saved?: boolean | null
          search_name?: string | null
          alert_enabled?: boolean | null
          alert_frequency?: 'daily' | 'weekly' | 'monthly' | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_searches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      leads: {
        Row: {
          id: string
          organization_id: string
          search_id: string
          business_name: string
          email: string | null
          phone: string | null
          website: string | null
          confidence_score: number | null
          industry: string | null
          company_size: string | null
          employee_count: number | null
          annual_revenue: number | null
          location_data: Json | null
          social_profiles: Json | null
          lead_score: number | null
          quality_score: number | null
          verification_status: 'unverified' | 'verified' | 'invalid' | null
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          search_id: string
          business_name: string
          email?: string | null
          phone?: string | null
          website?: string | null
          confidence_score?: number | null
          industry?: string | null
          company_size?: string | null
          employee_count?: number | null
          annual_revenue?: number | null
          location_data?: Json | null
          social_profiles?: Json | null
          lead_score?: number | null
          quality_score?: number | null
          verification_status?: 'unverified' | 'verified' | 'invalid' | null
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          search_id?: string
          business_name?: string
          email?: string | null
          phone?: string | null
          website?: string | null
          confidence_score?: number | null
          industry?: string | null
          company_size?: string | null
          employee_count?: number | null
          annual_revenue?: number | null
          location_data?: Json | null
          social_profiles?: Json | null
          lead_score?: number | null
          quality_score?: number | null
          verification_status?: 'unverified' | 'verified' | 'invalid' | null
          tags?: string[] | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "user_searches"
            referencedColumns: ["id"]
          }
        ]
      }
      billing_history: {
        Row: {
          id: string
          organization_id: string
          plan: string
          amount: number
          currency: string
          payment_status: string
          safepay_transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          plan: string
          amount: number
          currency?: string
          payment_status?: string
          safepay_transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          plan?: string
          amount?: number
          currency?: string
          payment_status?: string
          safepay_transaction_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      plans: {
        Row: {
          id: string
          name: string
          price: number
          credits: number
          features: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          credits: number
          features?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          credits?: number
          features?: Json
          created_at?: string
        }
        Relationships: []
      }
      serp_cache: {
        Row: {
          id: string
          query_hash: string
          results: Json
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          query_hash: string
          results: Json
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          query_hash?: string
          results?: Json
          created_at?: string
          expires_at?: string
        }
        Relationships: []
      }
      usage_records: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          action_type: string
          credits_used: number
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          action_type: string
          credits_used: number
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          action_type?: string
          credits_used?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_metadata: {
        Row: {
          id: string
          lead_id: string
          user_id?: string
          organization_id?: string
          is_favorited?: boolean
          note?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          rating?: number | null
          review_count?: number | null
          google_maps_url?: string | null
          place_id?: string | null
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          lead_id: string
          user_id?: string
          organization_id?: string
          is_favorited?: boolean
          note?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          rating?: number | null
          review_count?: number | null
          google_maps_url?: string | null
          place_id?: string | null
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          user_id?: string
          organization_id?: string
          is_favorited?: boolean
          note?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          rating?: number | null
          review_count?: number | null
          google_maps_url?: string | null
          place_id?: string | null
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_metadata_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_metadata_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      saved_searches: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          name: string
          search_criteria: Json
          alert_enabled: boolean | null
          alert_frequency: 'daily' | 'weekly' | 'monthly' | null
          last_run_at: string | null
          results_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          name: string
          search_criteria: Json
          alert_enabled?: boolean | null
          alert_frequency?: 'daily' | 'weekly' | 'monthly' | null
          last_run_at?: string | null
          results_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          name?: string
          search_criteria?: Json
          alert_enabled?: boolean | null
          alert_frequency?: 'daily' | 'weekly' | 'monthly' | null
          last_run_at?: string | null
          results_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      search_alerts: {
        Row: {
          id: string
          saved_search_id: string
          organization_id: string
          user_id: string
          alert_type: 'new_leads' | 'threshold_reached' | 'scheduled'
          trigger_criteria: Json | null
          is_active: boolean | null
          last_triggered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          saved_search_id: string
          organization_id: string
          user_id: string
          alert_type: 'new_leads' | 'threshold_reached' | 'scheduled'
          trigger_criteria?: Json | null
          is_active?: boolean | null
          last_triggered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          saved_search_id?: string
          organization_id?: string
          user_id?: string
          alert_type?: 'new_leads' | 'threshold_reached' | 'scheduled'
          trigger_criteria?: Json | null
          is_active?: boolean | null
          last_triggered_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_alerts_saved_search_id_fkey"
            columns: ["saved_search_id"]
            isOneToOne: false
            referencedRelation: "saved_searches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_tags: {
        Row: {
          id: string
          organization_id: string
          name: string
          color: string | null
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          color?: string | null
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          color?: string | null
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_tag_assignments: {
        Row: {
          id: string
          lead_id: string
          tag_id: string
          assigned_by: string | null
          assigned_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          tag_id: string
          assigned_by?: string | null
          assigned_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          tag_id?: string
          assigned_by?: string | null
          assigned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tag_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "lead_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_tag_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      bulk_actions: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          action_type: 'tag' | 'export' | 'delete' | 'update_score' | 'verify'
          target_leads: string[]
          action_data: Json | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          results: Json | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          action_type: 'tag' | 'export' | 'delete' | 'update_score' | 'verify'
          target_leads: string[]
          action_data?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          results?: Json | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          action_type?: 'tag' | 'export' | 'delete' | 'update_score' | 'verify'
          target_leads?: string[]
          action_data?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          results?: Json | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      export_templates: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          name: string
          field_mapping: Json
          export_format: 'csv' | 'excel' | 'json'
          is_default: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          name: string
          field_mapping: Json
          export_format?: 'csv' | 'excel' | 'json'
          is_default?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          name?: string
          field_mapping?: Json
          export_format?: 'csv' | 'excel' | 'json'
          is_default?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}