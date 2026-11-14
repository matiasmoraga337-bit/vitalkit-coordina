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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      availability: {
        Row: {
          active: boolean
          created_at: string
          end_time: string
          id: string
          professional_id: string
          start_time: string
          updated_at: string
          weekday: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          end_time?: string
          id?: string
          professional_id: string
          start_time?: string
          updated_at?: string
          weekday: number
        }
        Update: {
          active?: boolean
          created_at?: string
          end_time?: string
          id?: string
          professional_id?: string
          start_time?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      care_plans: {
        Row: {
          created_at: string
          created_by: string | null
          frequency: string | null
          goals: string[]
          household_id: string
          id: string
          next_review: string | null
          recommendations: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          frequency?: string | null
          goals?: string[]
          household_id: string
          id?: string
          next_review?: string | null
          recommendations?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          frequency?: string | null
          goals?: string[]
          household_id?: string
          id?: string
          next_review?: string | null
          recommendations?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_plans_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          document_url: string | null
          household_id: string
          id: string
          profile_id: string | null
          signed_at: string
          type: string
        }
        Insert: {
          document_url?: string | null
          household_id: string
          id?: string
          profile_id?: string | null
          signed_at?: string
          type?: string
        }
        Update: {
          document_url?: string | null
          household_id?: string
          id?: string
          profile_id?: string | null
          signed_at?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      elders: {
        Row: {
          birth_date: string | null
          created_at: string
          full_name: string
          household_id: string
          id: string
          mobility: string | null
          notes: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          full_name: string
          household_id: string
          id?: string
          mobility?: string | null
          notes?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          full_name?: string
          household_id?: string
          id?: string
          mobility?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elders_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          household_id: string
          profile_id: string
          relationship: string | null
        }
        Insert: {
          household_id: string
          profile_id: string
          relationship?: string | null
        }
        Update: {
          household_id?: string
          profile_id?: string
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          address: string | null
          comuna: string
          coordinator_id: string | null
          created_at: string
          id: string
          name: string
          plan_id: string | null
        }
        Insert: {
          address?: string | null
          comuna?: string
          coordinator_id?: string | null
          created_at?: string
          id?: string
          name: string
          plan_id?: string | null
        }
        Update: {
          address?: string | null
          comuna?: string
          coordinator_id?: string | null
          created_at?: string
          id?: string
          name?: string
          plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "households_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "households_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string
          description: string
          household_id: string
          id: string
          reported_by: string | null
          resolved_at: string | null
          severity: string
          status: Database["public"]["Enums"]["incident_status"]
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          household_id: string
          id?: string
          reported_by?: string | null
          resolved_at?: string | null
          severity?: string
          status?: Database["public"]["Enums"]["incident_status"]
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          household_id?: string
          id?: string
          reported_by?: string | null
          resolved_at?: string | null
          severity?: string
          status?: Database["public"]["Enums"]["incident_status"]
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          due_at: string | null
          extras_amount_clp: number
          household_id: string
          id: string
          issued_at: string
          period: string
          plan_amount_clp: number
          status: string
          total_clp: number
        }
        Insert: {
          created_at?: string
          due_at?: string | null
          extras_amount_clp?: number
          household_id: string
          id?: string
          issued_at?: string
          period: string
          plan_amount_clp?: number
          status?: string
          total_clp?: number
        }
        Update: {
          created_at?: string
          due_at?: string | null
          extras_amount_clp?: number
          household_id?: string
          id?: string
          issued_at?: string
          period?: string
          plan_amount_clp?: number
          status?: string
          total_clp?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          comuna: string | null
          consent: boolean
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          needs: Json
          phone: string | null
          plan_id: string | null
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          comuna?: string | null
          consent?: boolean
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          needs?: Json
          phone?: string | null
          plan_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          comuna?: string | null
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          needs?: Json
          phone?: string | null
          plan_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          household_id: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          household_id: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          household_id?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          price_clp: number
          visits: Json
        }
        Insert: {
          active?: boolean
          created_at?: string
          id: string
          name: string
          price_clp: number
          visits?: Json
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          price_clp?: number
          visits?: Json
        }
        Relationships: []
      }
      professionals: {
        Row: {
          bio: string | null
          coverage: string[]
          created_at: string
          discipline: Database["public"]["Enums"]["discipline"]
          id: string
          verification: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          bio?: string | null
          coverage?: string[]
          created_at?: string
          discipline: Database["public"]["Enums"]["discipline"]
          id: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          bio?: string | null
          coverage?: string[]
          created_at?: string
          discipline?: Database["public"]["Enums"]["discipline"]
          id?: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "professionals_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      requests: {
        Row: {
          created_at: string
          discipline: Database["public"]["Enums"]["discipline"]
          household_id: string
          id: string
          preferred_date: string | null
          preferred_time: string | null
          reason: string
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["request_status"]
          type: Database["public"]["Enums"]["request_type"]
        }
        Insert: {
          created_at?: string
          discipline: Database["public"]["Enums"]["discipline"]
          household_id: string
          id?: string
          preferred_date?: string | null
          preferred_time?: string | null
          reason: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          type?: Database["public"]["Enums"]["request_type"]
        }
        Update: {
          created_at?: string
          discipline?: Database["public"]["Enums"]["discipline"]
          household_id?: string
          id?: string
          preferred_date?: string | null
          preferred_time?: string | null
          reason?: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          type?: Database["public"]["Enums"]["request_type"]
        }
        Relationships: [
          {
            foreignKeyName: "requests_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          household_id: string
          id: string
          plan_id: string
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          plan_id: string
          start_date?: string
          status?: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          plan_id?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_reports: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          recommendations: string[]
          summary: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          recommendations?: string[]
          summary: string
          visit_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          recommendations?: string[]
          summary?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_reports_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          address: string | null
          cancellation_reason: string | null
          created_at: string
          created_by: string | null
          discipline: Database["public"]["Enums"]["discipline"]
          duration_min: number
          elder_id: string | null
          household_id: string
          id: string
          professional_id: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["visit_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          discipline: Database["public"]["Enums"]["discipline"]
          duration_min?: number
          elder_id?: string | null
          household_id: string
          id?: string
          professional_id?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          discipline?: Database["public"]["Enums"]["discipline"]
          duration_min?: number
          elder_id?: string | null
          household_id?: string
          id?: string
          professional_id?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_elder_id_fkey"
            columns: ["elder_id"]
            isOneToOne: false
            referencedRelation: "elders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_coordinator: { Args: never; Returns: boolean }
      is_household_member: {
        Args: { target_household: string }
        Returns: boolean
      }
      is_my_coordinator: { Args: { target_profile: string }; Returns: boolean }
      is_my_professional: { Args: { target_profile: string }; Returns: boolean }
    }
    Enums: {
      app_role: "family" | "coordinator" | "professional" | "admin"
      discipline: "kinesiologia" | "nutricion" | "enfermeria" | "aseo"
      incident_status: "open" | "in_review" | "resolved"
      lead_status: "new" | "contacted" | "converted" | "discarded"
      request_status: "pending" | "approved" | "rejected"
      request_type: "extra_visit" | "change" | "contact"
      verification_status: "pending" | "verified" | "rejected"
      visit_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["family", "coordinator", "professional", "admin"],
      discipline: ["kinesiologia", "nutricion", "enfermeria", "aseo"],
      incident_status: ["open", "in_review", "resolved"],
      lead_status: ["new", "contacted", "converted", "discarded"],
      request_status: ["pending", "approved", "rejected"],
      request_type: ["extra_visit", "change", "contact"],
      verification_status: ["pending", "verified", "rejected"],
      visit_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
