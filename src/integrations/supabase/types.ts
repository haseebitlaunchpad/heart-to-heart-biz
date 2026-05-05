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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_categories: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      account_statuses: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      activity_outcomes: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      activity_statuses: {
        Row: {
          code: string
          color: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          color?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          color?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      activity_types: {
        Row: {
          code: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      approval_statuses: {
        Row: {
          code: string
          color: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          color?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          color?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      assignment_rules: {
        Row: {
          assigned_team_id: string | null
          assigned_user_id: string | null
          channel: string | null
          created_at: string
          id: string
          is_active: boolean
          object_type: string
          priority: number
          region_id: string | null
          sector_id: string | null
          territory_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_team_id?: string | null
          assigned_user_id?: string | null
          channel?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          object_type: string
          priority?: number
          region_id?: string | null
          sector_id?: string | null
          territory_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_team_id?: string | null
          assigned_user_id?: string | null
          channel?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          object_type?: string
          priority?: number
          region_id?: string | null
          sector_id?: string | null
          territory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_rules_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_rules_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_rules_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_rules_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          name_ar: string | null
          region_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          name_ar?: string | null
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          name_ar?: string | null
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_channels: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      contact_roles: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          name_ar: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          name_ar?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          name_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      funding_sources: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      funding_statuses: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      handoff_checklist_items: {
        Row: {
          code: string
          description: string | null
          id: string
          is_active: boolean
          is_required: boolean
          name: string
          sort_order: number | null
        }
        Insert: {
          code: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      handoff_statuses: {
        Row: {
          code: string
          color: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          color?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          color?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      integration_statuses: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      investment_paths: {
        Row: {
          code: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      investment_size_bands: {
        Row: {
          code: string
          currency_code: string | null
          id: string
          is_active: boolean
          max_amount: number | null
          min_amount: number | null
          name: string
          sort_order: number | null
        }
        Insert: {
          code: string
          currency_code?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          currency_code?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      investment_timelines: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      investor_types: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      lead_disqualification_reasons: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      lead_nurture_reasons: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      lead_source_channels: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      lead_stages: {
        Row: {
          code: string
          color: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
        }
        Insert: {
          code: string
          color?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          color?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      lead_statuses: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      lead_temperatures: {
        Row: {
          code: string
          color: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
        }
        Insert: {
          code: string
          color?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          color?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      lifecycle_phases: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      match_statuses: {
        Row: {
          code: string
          color: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
        }
        Insert: {
          code: string
          color?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          color?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      match_types: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      opportunity_categories: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      opportunity_statuses: {
        Row: {
          code: string
          color: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          color?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          color?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      opportunity_types: {
        Row: {
          code: string
          family: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          family?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          family?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          code: string
          country_id: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          name_ar: string | null
          updated_at: string
        }
        Insert: {
          code: string
          country_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          name_ar?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          country_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          name_ar?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regions_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          name_ar: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_ar?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sub_sectors: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
          name_ar: string | null
          sector_id: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
          name_ar?: string | null
          sector_id: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
          name_ar?: string | null
          sector_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_sectors_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          end_date: string | null
          id: string
          is_active: boolean
          is_team_lead: boolean
          member_role: string | null
          start_date: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_team_lead?: boolean
          member_role?: string | null
          start_date?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_team_lead?: boolean
          member_role?: string | null
          start_date?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          manager_user_id: string | null
          name: string
          parent_team_id: string | null
          status: string
          type: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          manager_user_id?: string | null
          name: string
          parent_team_id?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          manager_user_id?: string | null
          name?: string
          parent_team_id?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_parent_team_id_fkey"
            columns: ["parent_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      territories: {
        Row: {
          city_id: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          manager_user_id: string | null
          name: string
          owner_team_id: string | null
          region_id: string | null
          sector_id: string | null
          status: string
          type: string | null
          updated_at: string
        }
        Insert: {
          city_id?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          manager_user_id?: string | null
          name: string
          owner_team_id?: string | null
          region_id?: string | null
          sector_id?: string | null
          status?: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          city_id?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          manager_user_id?: string | null
          name?: string
          owner_team_id?: string | null
          region_id?: string | null
          sector_id?: string | null
          status?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "territories_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territories_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territories_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territories_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          created_by: string | null
          default_territory_id: string | null
          department: string | null
          email: string
          employee_number: string | null
          full_name: string
          id: string
          is_active: boolean
          job_title: string | null
          last_login_at: string | null
          manager_user_id: string | null
          mobile: string | null
          preferred_language: string | null
          status: string
          team_id: string | null
          timezone: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          default_territory_id?: string | null
          department?: string | null
          email: string
          employee_number?: string | null
          full_name: string
          id: string
          is_active?: boolean
          job_title?: string | null
          last_login_at?: string | null
          manager_user_id?: string | null
          mobile?: string | null
          preferred_language?: string | null
          status?: string
          team_id?: string | null
          timezone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          default_territory_id?: string | null
          department?: string | null
          email?: string
          employee_number?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          job_title?: string | null
          last_login_at?: string | null
          manager_user_id?: string | null
          mobile?: string | null
          preferred_language?: string | null
          status?: string
          team_id?: string | null
          timezone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_team_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_territory_fk"
            columns: ["default_territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visibility_types: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "system_admin"
        | "crm_manager"
        | "relationship_manager"
        | "catalog_manager"
        | "approver"
        | "handoff_officer"
        | "leadership_viewer"
        | "integration_user"
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
      app_role: [
        "system_admin",
        "crm_manager",
        "relationship_manager",
        "catalog_manager",
        "approver",
        "handoff_officer",
        "leadership_viewer",
        "integration_user",
      ],
    },
  },
} as const
