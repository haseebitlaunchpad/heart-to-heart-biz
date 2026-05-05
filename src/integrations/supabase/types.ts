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
      accounts: {
        Row: {
          account_category_id: string | null
          account_name: string
          account_status_id: string | null
          city_id: string | null
          company_name: string | null
          country_id: string | null
          cr_number: string | null
          created_at: string
          created_by: string | null
          estimated_investment_budget: number | null
          financial_notes: string | null
          funding_source_id: string | null
          funding_status_id: string | null
          id: string
          investment_size_band_id: string | null
          investment_timeline_id: string | null
          investor_type_id: string | null
          is_archived: boolean
          nationality_id: string | null
          original_channel_id: string | null
          owner_id: string | null
          owner_team_id: string | null
          preferred_financing_support: string | null
          preferred_language: string | null
          preferred_region_id: string | null
          primary_email: string | null
          primary_mobile: string | null
          record_number: string | null
          sector_id: string | null
          source_lead_id: string | null
          sub_sector_id: string | null
          territory_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          account_category_id?: string | null
          account_name: string
          account_status_id?: string | null
          city_id?: string | null
          company_name?: string | null
          country_id?: string | null
          cr_number?: string | null
          created_at?: string
          created_by?: string | null
          estimated_investment_budget?: number | null
          financial_notes?: string | null
          funding_source_id?: string | null
          funding_status_id?: string | null
          id?: string
          investment_size_band_id?: string | null
          investment_timeline_id?: string | null
          investor_type_id?: string | null
          is_archived?: boolean
          nationality_id?: string | null
          original_channel_id?: string | null
          owner_id?: string | null
          owner_team_id?: string | null
          preferred_financing_support?: string | null
          preferred_language?: string | null
          preferred_region_id?: string | null
          primary_email?: string | null
          primary_mobile?: string | null
          record_number?: string | null
          sector_id?: string | null
          source_lead_id?: string | null
          sub_sector_id?: string | null
          territory_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          account_category_id?: string | null
          account_name?: string
          account_status_id?: string | null
          city_id?: string | null
          company_name?: string | null
          country_id?: string | null
          cr_number?: string | null
          created_at?: string
          created_by?: string | null
          estimated_investment_budget?: number | null
          financial_notes?: string | null
          funding_source_id?: string | null
          funding_status_id?: string | null
          id?: string
          investment_size_band_id?: string | null
          investment_timeline_id?: string | null
          investor_type_id?: string | null
          is_archived?: boolean
          nationality_id?: string | null
          original_channel_id?: string | null
          owner_id?: string | null
          owner_team_id?: string | null
          preferred_financing_support?: string | null
          preferred_language?: string | null
          preferred_region_id?: string | null
          primary_email?: string | null
          primary_mobile?: string | null
          record_number?: string | null
          sector_id?: string | null
          source_lead_id?: string | null
          sub_sector_id?: string | null
          territory_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_account_category_id_fkey"
            columns: ["account_category_id"]
            isOneToOne: false
            referencedRelation: "account_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_account_status_id_fkey"
            columns: ["account_status_id"]
            isOneToOne: false
            referencedRelation: "account_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_funding_source_id_fkey"
            columns: ["funding_source_id"]
            isOneToOne: false
            referencedRelation: "funding_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_funding_status_id_fkey"
            columns: ["funding_status_id"]
            isOneToOne: false
            referencedRelation: "funding_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_investment_size_band_id_fkey"
            columns: ["investment_size_band_id"]
            isOneToOne: false
            referencedRelation: "investment_size_bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_investment_timeline_id_fkey"
            columns: ["investment_timeline_id"]
            isOneToOne: false
            referencedRelation: "investment_timelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_investor_type_id_fkey"
            columns: ["investor_type_id"]
            isOneToOne: false
            referencedRelation: "investor_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_nationality_id_fkey"
            columns: ["nationality_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_original_channel_id_fkey"
            columns: ["original_channel_id"]
            isOneToOne: false
            referencedRelation: "lead_source_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_preferred_region_id_fkey"
            columns: ["preferred_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_source_lead_fk"
            columns: ["source_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_sub_sector_id_fkey"
            columns: ["sub_sector_id"]
            isOneToOne: false
            referencedRelation: "sub_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          account_id: string | null
          activity_type_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          handoff_id: string | null
          id: string
          is_archived: boolean
          lead_id: string | null
          next_follow_up_date: string | null
          opportunity_match_id: string | null
          outcome_id: string | null
          owner_id: string | null
          owner_team_id: string | null
          record_number: string | null
          related_object_id: string | null
          related_object_type: string | null
          status_id: string | null
          subject: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          account_id?: string | null
          activity_type_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          handoff_id?: string | null
          id?: string
          is_archived?: boolean
          lead_id?: string | null
          next_follow_up_date?: string | null
          opportunity_match_id?: string | null
          outcome_id?: string | null
          owner_id?: string | null
          owner_team_id?: string | null
          record_number?: string | null
          related_object_id?: string | null
          related_object_type?: string | null
          status_id?: string | null
          subject: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          account_id?: string | null
          activity_type_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          handoff_id?: string | null
          id?: string
          is_archived?: boolean
          lead_id?: string | null
          next_follow_up_date?: string | null
          opportunity_match_id?: string | null
          outcome_id?: string | null
          owner_id?: string | null
          owner_team_id?: string | null
          record_number?: string | null
          related_object_id?: string | null
          related_object_type?: string | null
          status_id?: string | null
          subject?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_activity_type_id_fkey"
            columns: ["activity_type_id"]
            isOneToOne: false
            referencedRelation: "activity_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_handoff_fk"
            columns: ["handoff_id"]
            isOneToOne: false
            referencedRelation: "handoffs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_opportunity_match_id_fkey"
            columns: ["opportunity_match_id"]
            isOneToOne: false
            referencedRelation: "opportunity_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_outcome_id_fkey"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "activity_outcomes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "activity_statuses"
            referencedColumns: ["id"]
          },
        ]
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
      approvals: {
        Row: {
          approval_status_id: string | null
          assigned_to: string | null
          comments: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision: string | null
          handoff_id: string | null
          id: string
          opportunity_match_id: string | null
          record_number: string | null
          rejection_reason: string | null
          related_object_id: string
          related_object_type: string
          requested_at: string | null
          requested_by: string | null
          updated_at: string
        }
        Insert: {
          approval_status_id?: string | null
          assigned_to?: string | null
          comments?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string | null
          handoff_id?: string | null
          id?: string
          opportunity_match_id?: string | null
          record_number?: string | null
          rejection_reason?: string | null
          related_object_id: string
          related_object_type: string
          requested_at?: string | null
          requested_by?: string | null
          updated_at?: string
        }
        Update: {
          approval_status_id?: string | null
          assigned_to?: string | null
          comments?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string | null
          handoff_id?: string | null
          id?: string
          opportunity_match_id?: string | null
          record_number?: string | null
          rejection_reason?: string | null
          related_object_id?: string
          related_object_type?: string
          requested_at?: string | null
          requested_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_approval_status_id_fkey"
            columns: ["approval_status_id"]
            isOneToOne: false
            referencedRelation: "approval_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_handoff_fk"
            columns: ["handoff_id"]
            isOneToOne: false
            referencedRelation: "handoffs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_opportunity_match_id_fkey"
            columns: ["opportunity_match_id"]
            isOneToOne: false
            referencedRelation: "opportunity_matches"
            referencedColumns: ["id"]
          },
        ]
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
      audit_logs: {
        Row: {
          action_type: string
          change_reason: string | null
          change_source: string | null
          changed_at: string
          changed_by: string | null
          field_name: string | null
          id: string
          new_value: Json | null
          object_id: string
          object_number: string | null
          object_type: string
          old_value: Json | null
        }
        Insert: {
          action_type: string
          change_reason?: string | null
          change_source?: string | null
          changed_at?: string
          changed_by?: string | null
          field_name?: string | null
          id?: string
          new_value?: Json | null
          object_id: string
          object_number?: string | null
          object_type: string
          old_value?: Json | null
        }
        Update: {
          action_type?: string
          change_reason?: string | null
          change_source?: string | null
          changed_at?: string
          changed_by?: string | null
          field_name?: string | null
          id?: string
          new_value?: Json | null
          object_id?: string
          object_number?: string | null
          object_type?: string
          old_value?: Json | null
        }
        Relationships: []
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
      contacts: {
        Row: {
          account_id: string | null
          consent_given: boolean | null
          consent_notes: string | null
          contact_role_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          is_archived: boolean
          is_primary_contact: boolean
          job_title: string | null
          lead_id: string | null
          mobile: string | null
          nationality_id: string | null
          owner_id: string | null
          owner_team_id: string | null
          preferred_channel_id: string | null
          preferred_language: string | null
          record_number: string | null
          territory_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          account_id?: string | null
          consent_given?: boolean | null
          consent_notes?: string | null
          contact_role_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_archived?: boolean
          is_primary_contact?: boolean
          job_title?: string | null
          lead_id?: string | null
          mobile?: string | null
          nationality_id?: string | null
          owner_id?: string | null
          owner_team_id?: string | null
          preferred_channel_id?: string | null
          preferred_language?: string | null
          record_number?: string | null
          territory_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          account_id?: string | null
          consent_given?: boolean | null
          consent_notes?: string | null
          contact_role_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_archived?: boolean
          is_primary_contact?: boolean
          job_title?: string | null
          lead_id?: string | null
          mobile?: string | null
          nationality_id?: string | null
          owner_id?: string | null
          owner_team_id?: string | null
          preferred_channel_id?: string | null
          preferred_language?: string | null
          record_number?: string | null
          territory_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_contact_role_id_fkey"
            columns: ["contact_role_id"]
            isOneToOne: false
            referencedRelation: "contact_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_nationality_id_fkey"
            columns: ["nationality_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_preferred_channel_id_fkey"
            columns: ["preferred_channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
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
      documents: {
        Row: {
          description: string | null
          file_name: string
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          related_object_id: string
          related_object_type: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          description?: string | null
          file_name: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          related_object_id: string
          related_object_type: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          description?: string | null
          file_name?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          related_object_id?: string
          related_object_type?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      duplicate_logs: {
        Row: {
          decided_at: string
          decided_by: string | null
          decision: string | null
          duplicate_object_id: string
          duplicate_object_type: string
          id: string
          match_confidence: number | null
          match_field: string | null
          notes: string | null
          object_id: string | null
          object_type: string
        }
        Insert: {
          decided_at?: string
          decided_by?: string | null
          decision?: string | null
          duplicate_object_id: string
          duplicate_object_type: string
          id?: string
          match_confidence?: number | null
          match_field?: string | null
          notes?: string | null
          object_id?: string | null
          object_type: string
        }
        Update: {
          decided_at?: string
          decided_by?: string | null
          decision?: string | null
          duplicate_object_id?: string
          duplicate_object_type?: string
          id?: string
          match_confidence?: number | null
          match_field?: string | null
          notes?: string | null
          object_id?: string | null
          object_type?: string
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
      handoffs: {
        Row: {
          accepted_at: string | null
          account_id: string | null
          catalog_opportunity_id: string | null
          checklist_state: Json | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          failed_at: string | null
          failure_reason: string | null
          handoff_status_id: string | null
          id: string
          integration_status_id: string | null
          is_archived: boolean
          opportunity_match_id: string
          owner_id: string | null
          owner_team_id: string | null
          package_payload: Json | null
          record_number: string | null
          retry_count: number
          selected_path_id: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          accepted_at?: string | null
          account_id?: string | null
          catalog_opportunity_id?: string | null
          checklist_state?: Json | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          handoff_status_id?: string | null
          id?: string
          integration_status_id?: string | null
          is_archived?: boolean
          opportunity_match_id: string
          owner_id?: string | null
          owner_team_id?: string | null
          package_payload?: Json | null
          record_number?: string | null
          retry_count?: number
          selected_path_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          accepted_at?: string | null
          account_id?: string | null
          catalog_opportunity_id?: string | null
          checklist_state?: Json | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          handoff_status_id?: string | null
          id?: string
          integration_status_id?: string | null
          is_archived?: boolean
          opportunity_match_id?: string
          owner_id?: string | null
          owner_team_id?: string | null
          package_payload?: Json | null
          record_number?: string | null
          retry_count?: number
          selected_path_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handoffs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_catalog_opportunity_id_fkey"
            columns: ["catalog_opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunity_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_handoff_status_id_fkey"
            columns: ["handoff_status_id"]
            isOneToOne: false
            referencedRelation: "handoff_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_integration_status_id_fkey"
            columns: ["integration_status_id"]
            isOneToOne: false
            referencedRelation: "integration_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_opportunity_match_id_fkey"
            columns: ["opportunity_match_id"]
            isOneToOne: false
            referencedRelation: "opportunity_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_selected_path_id_fkey"
            columns: ["selected_path_id"]
            isOneToOne: false
            referencedRelation: "investment_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_logs: {
        Row: {
          direction: string
          error_message: string | null
          id: string
          integration_name: string
          related_object_id: string | null
          related_object_type: string | null
          request_payload: Json | null
          response_payload: Json | null
          retry_count: number
          status: string | null
          triggered_at: string
          triggered_by: string | null
        }
        Insert: {
          direction: string
          error_message?: string | null
          id?: string
          integration_name: string
          related_object_id?: string | null
          related_object_type?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          retry_count?: number
          status?: string | null
          triggered_at?: string
          triggered_by?: string | null
        }
        Update: {
          direction?: string
          error_message?: string | null
          id?: string
          integration_name?: string
          related_object_id?: string | null
          related_object_type?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          retry_count?: number
          status?: string | null
          triggered_at?: string
          triggered_by?: string | null
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
      leads: {
        Row: {
          accepted_at: string | null
          accepted_by_owner: boolean | null
          ai_last_processed_at: string | null
          ai_match_explanation: string | null
          ai_score_reason: string | null
          ai_source_summary: string | null
          ai_suggested_next_action: string | null
          archived_at: string | null
          archived_by: string | null
          assigned_at: string | null
          assigned_by: string | null
          best_time_to_contact: string | null
          campaign_id: string | null
          captured_by: string | null
          city_id: string | null
          company_name: string | null
          contact_consent: boolean | null
          conversion_status: string | null
          converted_account_id: string | null
          converted_at: string | null
          converted_by: string | null
          converted_contact_id: string | null
          converted_match_id: string | null
          country_of_residence_id: string | null
          cr_number: string | null
          cr_verified: boolean | null
          created_at: string
          created_by: string | null
          data_completeness_percentage: number | null
          days_in_stage: number | null
          disqualification_reason_id: string | null
          duplicate_status: string | null
          email: string | null
          event_id: string | null
          handoff_readiness_status: string | null
          id: string
          interest_notes: string | null
          investment_objective: string | null
          investment_size_band_id: string | null
          is_archived: boolean
          last_activity_at: string | null
          lead_name: string
          lead_score: number | null
          lead_stage_id: string | null
          lead_status_id: string | null
          lead_type: string | null
          linked_account_id: string | null
          linked_contact_id: string | null
          mobile: string | null
          national_id: string | null
          nationality_id: string | null
          next_follow_up_date: string | null
          nurture_reason_id: string | null
          owner_id: string | null
          owner_team_id: string | null
          preferred_city_id: string | null
          preferred_contact_channel_id: string | null
          preferred_language: string | null
          preferred_region_id: string | null
          priority: string | null
          qualification_notes: string | null
          qualification_temperature_id: string | null
          qualified_at: string | null
          received_at: string | null
          record_number: string | null
          sector_id: string | null
          source_channel_id: string | null
          source_reference_id: string | null
          source_system: string | null
          sub_sector_id: string | null
          territory_id: string | null
          updated_at: string
          updated_by: string | null
          whatsapp_number: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_owner?: boolean | null
          ai_last_processed_at?: string | null
          ai_match_explanation?: string | null
          ai_score_reason?: string | null
          ai_source_summary?: string | null
          ai_suggested_next_action?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          best_time_to_contact?: string | null
          campaign_id?: string | null
          captured_by?: string | null
          city_id?: string | null
          company_name?: string | null
          contact_consent?: boolean | null
          conversion_status?: string | null
          converted_account_id?: string | null
          converted_at?: string | null
          converted_by?: string | null
          converted_contact_id?: string | null
          converted_match_id?: string | null
          country_of_residence_id?: string | null
          cr_number?: string | null
          cr_verified?: boolean | null
          created_at?: string
          created_by?: string | null
          data_completeness_percentage?: number | null
          days_in_stage?: number | null
          disqualification_reason_id?: string | null
          duplicate_status?: string | null
          email?: string | null
          event_id?: string | null
          handoff_readiness_status?: string | null
          id?: string
          interest_notes?: string | null
          investment_objective?: string | null
          investment_size_band_id?: string | null
          is_archived?: boolean
          last_activity_at?: string | null
          lead_name: string
          lead_score?: number | null
          lead_stage_id?: string | null
          lead_status_id?: string | null
          lead_type?: string | null
          linked_account_id?: string | null
          linked_contact_id?: string | null
          mobile?: string | null
          national_id?: string | null
          nationality_id?: string | null
          next_follow_up_date?: string | null
          nurture_reason_id?: string | null
          owner_id?: string | null
          owner_team_id?: string | null
          preferred_city_id?: string | null
          preferred_contact_channel_id?: string | null
          preferred_language?: string | null
          preferred_region_id?: string | null
          priority?: string | null
          qualification_notes?: string | null
          qualification_temperature_id?: string | null
          qualified_at?: string | null
          received_at?: string | null
          record_number?: string | null
          sector_id?: string | null
          source_channel_id?: string | null
          source_reference_id?: string | null
          source_system?: string | null
          sub_sector_id?: string | null
          territory_id?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by_owner?: boolean | null
          ai_last_processed_at?: string | null
          ai_match_explanation?: string | null
          ai_score_reason?: string | null
          ai_source_summary?: string | null
          ai_suggested_next_action?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          best_time_to_contact?: string | null
          campaign_id?: string | null
          captured_by?: string | null
          city_id?: string | null
          company_name?: string | null
          contact_consent?: boolean | null
          conversion_status?: string | null
          converted_account_id?: string | null
          converted_at?: string | null
          converted_by?: string | null
          converted_contact_id?: string | null
          converted_match_id?: string | null
          country_of_residence_id?: string | null
          cr_number?: string | null
          cr_verified?: boolean | null
          created_at?: string
          created_by?: string | null
          data_completeness_percentage?: number | null
          days_in_stage?: number | null
          disqualification_reason_id?: string | null
          duplicate_status?: string | null
          email?: string | null
          event_id?: string | null
          handoff_readiness_status?: string | null
          id?: string
          interest_notes?: string | null
          investment_objective?: string | null
          investment_size_band_id?: string | null
          is_archived?: boolean
          last_activity_at?: string | null
          lead_name?: string
          lead_score?: number | null
          lead_stage_id?: string | null
          lead_status_id?: string | null
          lead_type?: string | null
          linked_account_id?: string | null
          linked_contact_id?: string | null
          mobile?: string | null
          national_id?: string | null
          nationality_id?: string | null
          next_follow_up_date?: string | null
          nurture_reason_id?: string | null
          owner_id?: string | null
          owner_team_id?: string | null
          preferred_city_id?: string | null
          preferred_contact_channel_id?: string | null
          preferred_language?: string | null
          preferred_region_id?: string | null
          priority?: string | null
          qualification_notes?: string | null
          qualification_temperature_id?: string | null
          qualified_at?: string | null
          received_at?: string | null
          record_number?: string | null
          sector_id?: string | null
          source_channel_id?: string | null
          source_reference_id?: string | null
          source_system?: string | null
          sub_sector_id?: string | null
          territory_id?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_account_fk"
            columns: ["converted_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_contact_fk"
            columns: ["converted_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_match_fk"
            columns: ["converted_match_id"]
            isOneToOne: false
            referencedRelation: "opportunity_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_country_of_residence_id_fkey"
            columns: ["country_of_residence_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_disqualification_reason_id_fkey"
            columns: ["disqualification_reason_id"]
            isOneToOne: false
            referencedRelation: "lead_disqualification_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_investment_size_band_id_fkey"
            columns: ["investment_size_band_id"]
            isOneToOne: false
            referencedRelation: "investment_size_bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_lead_stage_id_fkey"
            columns: ["lead_stage_id"]
            isOneToOne: false
            referencedRelation: "lead_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_lead_status_id_fkey"
            columns: ["lead_status_id"]
            isOneToOne: false
            referencedRelation: "lead_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_linked_account_fk"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_linked_contact_fk"
            columns: ["linked_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_nationality_id_fkey"
            columns: ["nationality_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_nurture_reason_id_fkey"
            columns: ["nurture_reason_id"]
            isOneToOne: false
            referencedRelation: "lead_nurture_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_preferred_city_id_fkey"
            columns: ["preferred_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_preferred_contact_channel_id_fkey"
            columns: ["preferred_contact_channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_preferred_region_id_fkey"
            columns: ["preferred_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_qualification_temperature_id_fkey"
            columns: ["qualification_temperature_id"]
            isOneToOne: false
            referencedRelation: "lead_temperatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_source_channel_id_fkey"
            columns: ["source_channel_id"]
            isOneToOne: false
            referencedRelation: "lead_source_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_sub_sector_id_fkey"
            columns: ["sub_sector_id"]
            isOneToOne: false
            referencedRelation: "sub_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
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
      opportunity_catalog: {
        Row: {
          area_size: number | null
          available_from: string | null
          available_paths: string[] | null
          capacity: number | null
          category_id: string | null
          city_id: string | null
          created_at: string
          created_by: string | null
          currency_id: string | null
          default_path_id: string | null
          description: string | null
          eligible_channels: string[] | null
          eligible_investment_bands: string[] | null
          eligible_investor_type: string | null
          eligible_nationality_type: string | null
          eligible_sectors: string[] | null
          exclusion_criteria: string | null
          expected_benefit: string | null
          expiry_date: string | null
          id: string
          internal_notes: string | null
          investment_size_band_id: string | null
          is_archived: boolean
          journey_area: string | null
          lifecycle_phase_id: string | null
          max_investment: number | null
          min_investment: number | null
          mrl_max: number | null
          mrl_min: number | null
          opportunity_type_id: string | null
          owner_id: string | null
          path_a_description: string | null
          path_b_description: string | null
          path_c_description: string | null
          path_owner_team_id: string | null
          program_service_category: string | null
          record_number: string | null
          reference_url: string | null
          region_id: string | null
          required_cr: boolean | null
          required_documents: string[] | null
          sector_id: string | null
          site_name: string | null
          status_id: string | null
          strategic_objective: string | null
          sub_sector_id: string | null
          title: string
          trl_max: number | null
          trl_min: number | null
          updated_at: string
          updated_by: string | null
          visibility_id: string | null
        }
        Insert: {
          area_size?: number | null
          available_from?: string | null
          available_paths?: string[] | null
          capacity?: number | null
          category_id?: string | null
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          currency_id?: string | null
          default_path_id?: string | null
          description?: string | null
          eligible_channels?: string[] | null
          eligible_investment_bands?: string[] | null
          eligible_investor_type?: string | null
          eligible_nationality_type?: string | null
          eligible_sectors?: string[] | null
          exclusion_criteria?: string | null
          expected_benefit?: string | null
          expiry_date?: string | null
          id?: string
          internal_notes?: string | null
          investment_size_band_id?: string | null
          is_archived?: boolean
          journey_area?: string | null
          lifecycle_phase_id?: string | null
          max_investment?: number | null
          min_investment?: number | null
          mrl_max?: number | null
          mrl_min?: number | null
          opportunity_type_id?: string | null
          owner_id?: string | null
          path_a_description?: string | null
          path_b_description?: string | null
          path_c_description?: string | null
          path_owner_team_id?: string | null
          program_service_category?: string | null
          record_number?: string | null
          reference_url?: string | null
          region_id?: string | null
          required_cr?: boolean | null
          required_documents?: string[] | null
          sector_id?: string | null
          site_name?: string | null
          status_id?: string | null
          strategic_objective?: string | null
          sub_sector_id?: string | null
          title: string
          trl_max?: number | null
          trl_min?: number | null
          updated_at?: string
          updated_by?: string | null
          visibility_id?: string | null
        }
        Update: {
          area_size?: number | null
          available_from?: string | null
          available_paths?: string[] | null
          capacity?: number | null
          category_id?: string | null
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          currency_id?: string | null
          default_path_id?: string | null
          description?: string | null
          eligible_channels?: string[] | null
          eligible_investment_bands?: string[] | null
          eligible_investor_type?: string | null
          eligible_nationality_type?: string | null
          eligible_sectors?: string[] | null
          exclusion_criteria?: string | null
          expected_benefit?: string | null
          expiry_date?: string | null
          id?: string
          internal_notes?: string | null
          investment_size_band_id?: string | null
          is_archived?: boolean
          journey_area?: string | null
          lifecycle_phase_id?: string | null
          max_investment?: number | null
          min_investment?: number | null
          mrl_max?: number | null
          mrl_min?: number | null
          opportunity_type_id?: string | null
          owner_id?: string | null
          path_a_description?: string | null
          path_b_description?: string | null
          path_c_description?: string | null
          path_owner_team_id?: string | null
          program_service_category?: string | null
          record_number?: string | null
          reference_url?: string | null
          region_id?: string | null
          required_cr?: boolean | null
          required_documents?: string[] | null
          sector_id?: string | null
          site_name?: string | null
          status_id?: string | null
          strategic_objective?: string | null
          sub_sector_id?: string | null
          title?: string
          trl_max?: number | null
          trl_min?: number | null
          updated_at?: string
          updated_by?: string | null
          visibility_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_catalog_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "opportunity_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_catalog_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_catalog_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_catalog_default_path_id_fkey"
            columns: ["default_path_id"]
            isOneToOne: false
            referencedRelation: "investment_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_catalog_investment_size_band_id_fkey"
            columns: ["investment_size_band_id"]
            isOneToOne: false
            referencedRelation: "investment_size_bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_catalog_lifecycle_phase_id_fkey"
            columns: ["lifecycle_phase_id"]
            isOneToOne: false
            referencedRelation: "lifecycle_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_catalog_opportunity_type_id_fkey"
            columns: ["opportunity_type_id"]
            isOneToOne: false
            referencedRelation: "opportunity_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_catalog_path_owner_team_id_fkey"
            columns: ["path_owner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_catalog_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_catalog_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_catalog_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "opportunity_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_catalog_sub_sector_id_fkey"
            columns: ["sub_sector_id"]
            isOneToOne: false
            referencedRelation: "sub_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_catalog_visibility_id_fkey"
            columns: ["visibility_id"]
            isOneToOne: false
            referencedRelation: "visibility_types"
            referencedColumns: ["id"]
          },
        ]
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
      opportunity_matches: {
        Row: {
          account_id: string | null
          approval_status_id: string | null
          approved_at: string | null
          approved_by: string | null
          catalog_opportunity_id: string
          contact_id: string | null
          created_at: string
          created_by: string | null
          eligibility_result: string | null
          handoff_status_id: string | null
          id: string
          is_archived: boolean
          lead_id: string | null
          manual_override_flag: boolean | null
          match_status_id: string | null
          match_type_id: string | null
          missing_requirements: string[] | null
          notes: string | null
          owner_id: string | null
          owner_team_id: string | null
          path_notes: string | null
          record_number: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          selected_path_id: string | null
          submitted_at: string | null
          submitted_by: string | null
          territory_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          account_id?: string | null
          approval_status_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          catalog_opportunity_id: string
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          eligibility_result?: string | null
          handoff_status_id?: string | null
          id?: string
          is_archived?: boolean
          lead_id?: string | null
          manual_override_flag?: boolean | null
          match_status_id?: string | null
          match_type_id?: string | null
          missing_requirements?: string[] | null
          notes?: string | null
          owner_id?: string | null
          owner_team_id?: string | null
          path_notes?: string | null
          record_number?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          selected_path_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          territory_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          account_id?: string | null
          approval_status_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          catalog_opportunity_id?: string
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          eligibility_result?: string | null
          handoff_status_id?: string | null
          id?: string
          is_archived?: boolean
          lead_id?: string | null
          manual_override_flag?: boolean | null
          match_status_id?: string | null
          match_type_id?: string | null
          missing_requirements?: string[] | null
          notes?: string | null
          owner_id?: string | null
          owner_team_id?: string | null
          path_notes?: string | null
          record_number?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          selected_path_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          territory_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_matches_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_matches_approval_status_id_fkey"
            columns: ["approval_status_id"]
            isOneToOne: false
            referencedRelation: "approval_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_matches_catalog_opportunity_id_fkey"
            columns: ["catalog_opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunity_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_matches_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_matches_handoff_status_id_fkey"
            columns: ["handoff_status_id"]
            isOneToOne: false
            referencedRelation: "handoff_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_matches_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_matches_match_status_id_fkey"
            columns: ["match_status_id"]
            isOneToOne: false
            referencedRelation: "match_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_matches_match_type_id_fkey"
            columns: ["match_type_id"]
            isOneToOne: false
            referencedRelation: "match_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_matches_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_matches_selected_path_id_fkey"
            columns: ["selected_path_id"]
            isOneToOne: false
            referencedRelation: "investment_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_matches_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
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
      permissions: {
        Row: {
          action: string
          description: string | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          description?: string | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
          description?: string | null
          id?: string
          resource?: string
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
      role_permissions: {
        Row: {
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
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
      security_logs: {
        Row: {
          details: Json | null
          event_at: string
          event_type: string
          id: string
          ip_address: string | null
          module_name: string | null
          object_id: string | null
          object_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          details?: Json | null
          event_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          module_name?: string | null
          object_id?: string | null
          object_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          details?: Json | null
          event_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          module_name?: string | null
          object_id?: string | null
          object_type?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      workflow_logs: {
        Row: {
          action_taken: string
          comments: string | null
          from_status: string | null
          id: string
          object_id: string
          object_type: string
          performed_at: string
          performed_by: string | null
          process_name: string
          to_status: string | null
        }
        Insert: {
          action_taken: string
          comments?: string | null
          from_status?: string | null
          id?: string
          object_id: string
          object_type: string
          performed_at?: string
          performed_by?: string | null
          process_name: string
          to_status?: string | null
        }
        Update: {
          action_taken?: string
          comments?: string | null
          from_status?: string | null
          id?: string
          object_id?: string
          object_type?: string
          performed_at?: string
          performed_by?: string | null
          process_name?: string
          to_status?: string | null
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
      has_permission: {
        Args: { _action: string; _resource: string; _user: string }
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
