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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          badge_type: string
          description: string | null
          icon: string
          id: string
          name: string
          xp_required: number | null
        }
        Insert: {
          badge_type?: string
          description?: string | null
          icon: string
          id?: string
          name: string
          xp_required?: number | null
        }
        Update: {
          badge_type?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          xp_required?: number | null
        }
        Relationships: []
      }
      group_achievements: {
        Row: {
          achieved_at: string
          achievement_type: string
          description: string | null
          group_id: string
          id: string
          title: string
        }
        Insert: {
          achieved_at?: string
          achievement_type: string
          description?: string | null
          group_id: string
          id?: string
          title: string
        }
        Update: {
          achieved_at?: string
          achievement_type?: string
          description?: string | null
          group_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_achievements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_activities: {
        Row: {
          activity_type: string
          created_at: string
          group_id: string
          habit_name: string | null
          id: string
          streak_count: number | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          group_id: string
          habit_name?: string | null
          id?: string
          streak_count?: number | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          group_id?: string
          habit_name?: string | null
          id?: string
          streak_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_activities_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean | null
          id: string
          progress_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          id?: string
          progress_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          id?: string
          progress_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "group_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      group_challenges: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          group_id: string
          habit_category: string | null
          id: string
          is_active: boolean | null
          start_date: string
          target_count: number
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          group_id: string
          habit_category?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_count?: number
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          group_id?: string
          habit_category?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_count?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_challenges_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chat: {
        Row: {
          created_at: string
          group_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chat_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          streak: number
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          streak?: number
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          streak?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_reactions: {
        Row: {
          activity_id: string
          created_at: string
          emoji: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          emoji: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          emoji?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_reactions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "group_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          level: number | null
          name: string
          total_xp: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code: string
          level?: number | null
          name: string
          total_xp?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          level?: number | null
          name?: string
          total_xp?: number | null
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed: boolean | null
          completed_at: string
          created_at: string | null
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string
          created_at?: string | null
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string
          created_at?: string | null
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          archived: boolean | null
          category: string
          color: string | null
          completed_today: boolean | null
          created_at: string | null
          icon: string | null
          id: string
          last_completed_date: string | null
          last_reset_date: string | null
          name: string
          notes: string | null
          streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          category?: string
          color?: string | null
          completed_today?: boolean | null
          created_at?: string | null
          icon?: string | null
          id?: string
          last_completed_date?: string | null
          last_reset_date?: string | null
          name: string
          notes?: string | null
          streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived?: boolean | null
          category?: string
          color?: string | null
          completed_today?: boolean | null
          created_at?: string | null
          icon?: string | null
          id?: string
          last_completed_date?: string | null
          last_reset_date?: string | null
          name?: string
          notes?: string | null
          streak?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      moods: {
        Row: {
          created_at: string | null
          date: string
          id: string
          mood_score: number
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          mood_score: number
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          mood_score?: number
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_premium: boolean | null
          premium_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_premium?: boolean | null
          premium_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_premium?: boolean | null
          premium_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          group_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          group_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          group_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          ambient_mode: string | null
          ambient_sounds_enabled: boolean | null
          ambient_visuals_enabled: boolean | null
          companion_type: string | null
          confetti_enabled: boolean | null
          created_at: string | null
          daily_notification: boolean | null
          daily_reset_time: string | null
          done_habit_position: string | null
          id: string
          music_enabled: boolean | null
          music_volume: number | null
          show_companion: boolean | null
          sound_enabled: boolean | null
          start_of_week: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
          vacation_mode: boolean | null
        }
        Insert: {
          ambient_mode?: string | null
          ambient_sounds_enabled?: boolean | null
          ambient_visuals_enabled?: boolean | null
          companion_type?: string | null
          confetti_enabled?: boolean | null
          created_at?: string | null
          daily_notification?: boolean | null
          daily_reset_time?: string | null
          done_habit_position?: string | null
          id?: string
          music_enabled?: boolean | null
          music_volume?: number | null
          show_companion?: boolean | null
          sound_enabled?: boolean | null
          start_of_week?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          vacation_mode?: boolean | null
        }
        Update: {
          ambient_mode?: string | null
          ambient_sounds_enabled?: boolean | null
          ambient_visuals_enabled?: boolean | null
          companion_type?: string | null
          confetti_enabled?: boolean | null
          created_at?: string | null
          daily_notification?: boolean | null
          daily_reset_time?: string | null
          done_habit_position?: string | null
          id?: string
          music_enabled?: boolean | null
          music_volume?: number | null
          show_companion?: boolean | null
          sound_enabled?: boolean | null
          start_of_week?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          vacation_mode?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
