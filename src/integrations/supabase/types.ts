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
  public: {
    Tables: {
      ai_daily_usage: {
        Row: {
          day: string
          points: number
          user_id: string
        }
        Insert: {
          day?: string
          points?: number
          user_id: string
        }
        Update: {
          day?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          created_at: string
          id: string
          message: Json
          message_key: string
          thread_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: Json
          message_key: string
          thread_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: Json
          message_key?: string
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ai_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_service_state: {
        Row: {
          blocked: boolean
          created_at: string
          message: string | null
          service: string
          updated_at: string
        }
        Insert: {
          blocked?: boolean
          created_at?: string
          message?: string | null
          service: string
          updated_at?: string
        }
        Update: {
          blocked?: boolean
          created_at?: string
          message?: string | null
          service?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          last_used_at: string | null
          name: string
          prefix: string
          requests: number
          revoked: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          last_used_at?: string | null
          name?: string
          prefix: string
          requests?: number
          revoked?: boolean
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          last_used_at?: string | null
          name?: string
          prefix?: string
          requests?: number
          revoked?: boolean
          user_id?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          created_at: string
          id: number
          key_id: string
          status: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          key_id: string
          status?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          key_id?: string
          status?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      console_members: {
        Row: {
          created_at: string
          email: string
          id: string
          project_id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          project_id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "console_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "console_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      console_projects: {
        Row: {
          created_at: string
          description: string
          id: string
          kind: string
          name: string
          owner_id: string
          phase: string
          preview_url: string | null
          share_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          kind?: string
          name: string
          owner_id?: string
          phase?: string
          preview_url?: string | null
          share_token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          kind?: string
          name?: string
          owner_id?: string
          phase?: string
          preview_url?: string | null
          share_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      console_tasks: {
        Row: {
          created_at: string
          created_by: string
          done: boolean
          id: string
          kind: string
          project_id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          done?: boolean
          id?: string
          kind?: string
          project_id: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          done?: boolean
          id?: string
          kind?: string
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "console_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "console_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_profiles: {
        Row: {
          avatar_url: string | null
          display_name: string
          joined_at: string
          last_active: string | null
          points: number
          referral_code: string
          referrals: number
          referred_by: string | null
          streak: number
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string
          joined_at?: string
          last_active?: string | null
          points?: number
          referral_code?: string
          referrals?: number
          referred_by?: string | null
          streak?: number
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          display_name?: string
          joined_at?: string
          last_active?: string | null
          points?: number
          referral_code?: string
          referrals?: number
          referred_by?: string | null
          streak?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ai_points_status: { Args: never; Returns: Json }
      can_access_project: { Args: { _project_id: string }; Returns: boolean }
      check_in: {
        Args: { _avatar?: string; _name?: string; _ref?: string }
        Returns: {
          avatar_url: string | null
          display_name: string
          joined_at: string
          last_active: string | null
          points: number
          referral_code: string
          referrals: number
          referred_by: string | null
          streak: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "leaderboard_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      consume_ai_point: { Args: never; Returns: boolean }
      has_console_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_project: { Args: { _project_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "pro"
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
  public: {
    Enums: {
      app_role: ["owner", "pro"],
    },
  },
} as const
