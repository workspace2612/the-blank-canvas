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
      applications: {
        Row: {
          ats_score: number | null
          candidate_id: string
          created_at: string | null
          id: string
          job_id: string
          rank: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ats_score?: number | null
          candidate_id: string
          created_at?: string | null
          id?: string
          job_id: string
          rank?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ats_score?: number | null
          candidate_id?: string
          created_at?: string | null
          id?: string
          job_id?: string
          rank?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_ranks: {
        Row: {
          consistency_score: number | null
          final_rank: number | null
          id: string
          rank_position: number | null
          skill_score: number | null
          streak_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consistency_score?: number | null
          final_rank?: number | null
          id?: string
          rank_position?: number | null
          skill_score?: number | null
          streak_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consistency_score?: number | null
          final_rank?: number | null
          id?: string
          rank_position?: number | null
          skill_score?: number | null
          streak_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      candidates: {
        Row: {
          about: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          education: Json | null
          email: string | null
          experience: Json | null
          github_url: string | null
          id: string
          kaggle_url: string | null
          leetcode_url: string | null
          name: string
          projects: Json | null
          skills: string[] | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          education?: Json | null
          email?: string | null
          experience?: Json | null
          github_url?: string | null
          id?: string
          kaggle_url?: string | null
          leetcode_url?: string | null
          name: string
          projects?: Json | null
          skills?: string[] | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          education?: Json | null
          email?: string | null
          experience?: Json | null
          github_url?: string | null
          id?: string
          kaggle_url?: string | null
          leetcode_url?: string | null
          name?: string
          projects?: Json | null
          skills?: string[] | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string | null
          id: string
          issue_date: string | null
          issuer: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          description: string | null
          email: string
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string | null
          degree: string | null
          end_date: string | null
          field_of_study: string | null
          id: string
          school: string
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          degree?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          school: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          degree?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          school?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      employee_requests: {
        Row: {
          company_id: string
          created_at: string | null
          department: string | null
          email: string
          id: string
          name: string
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          department?: string | null
          email: string
          id?: string
          name: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          name?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string | null
          department: string | null
          email: string | null
          id: string
          joined_at: string | null
          name: string
          role: string | null
          status: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          joined_at?: string | null
          name: string
          role?: string | null
          status?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          joined_at?: string | null
          name?: string
          role?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      experience: {
        Row: {
          company: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          location: string | null
          role: string
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          role: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          role?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hr_members: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          role: string | null
          status: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          role?: string | null
          status?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          role?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          ats_config: Json | null
          company_id: string
          created_at: string | null
          description: string | null
          github_requirement: Json | null
          id: string
          job_type: string | null
          kaggle_requirement: Json | null
          leetcode_requirement: Json | null
          location: string | null
          priority_order: Json | null
          requirements: Json | null
          status: string | null
          title: string
          updated_at: string | null
          work_mode: string | null
        }
        Insert: {
          ats_config?: Json | null
          company_id: string
          created_at?: string | null
          description?: string | null
          github_requirement?: Json | null
          id?: string
          job_type?: string | null
          kaggle_requirement?: Json | null
          leetcode_requirement?: Json | null
          location?: string | null
          priority_order?: Json | null
          requirements?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          work_mode?: string | null
        }
        Update: {
          ats_config?: Json | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          github_requirement?: Json | null
          id?: string
          job_type?: string | null
          kaggle_requirement?: Json | null
          leetcode_requirement?: Json | null
          location?: string | null
          priority_order?: Json | null
          requirements?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_goals: {
        Row: {
          completed: boolean | null
          created_at: string | null
          deadline: string | null
          id: string
          link: string | null
          proof_url: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          link?: string | null
          proof_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          link?: string | null
          proof_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          type: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          type?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string | null
          currently_learning: string | null
          full_name: string
          github_url: string | null
          id: string
          kaggle_url: string | null
          leetcode_url: string | null
          location: string | null
          open_to_work: boolean | null
          portfolio_url: string | null
          seeking_type: string | null
          updated_at: string | null
          user_id: string
          work_mode: string | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          currently_learning?: string | null
          full_name?: string
          github_url?: string | null
          id?: string
          kaggle_url?: string | null
          leetcode_url?: string | null
          location?: string | null
          open_to_work?: boolean | null
          portfolio_url?: string | null
          seeking_type?: string | null
          updated_at?: string | null
          user_id: string
          work_mode?: string | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          currently_learning?: string | null
          full_name?: string
          github_url?: string | null
          id?: string
          kaggle_url?: string | null
          leetcode_url?: string | null
          location?: string | null
          open_to_work?: boolean | null
          portfolio_url?: string | null
          seeking_type?: string | null
          updated_at?: string | null
          user_id?: string
          work_mode?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          project_link: string | null
          start_date: string | null
          tech_stack: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          project_link?: string | null
          start_date?: string | null
          tech_stack?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          project_link?: string | null
          start_date?: string | null
          tech_stack?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
          proficiency: number | null
          source: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          proficiency?: number | null
          source?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          proficiency?: number | null
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          active_days: number | null
          created_at: string | null
          id: string
          last_fetched_at: string | null
          platform: string
          raw_data: Json | null
          streak_days: number | null
          today_contributions: number | null
          total_contributions: number | null
          updated_at: string | null
          user_id: string
          weekly_contributions: number | null
        }
        Insert: {
          active_days?: number | null
          created_at?: string | null
          id?: string
          last_fetched_at?: string | null
          platform: string
          raw_data?: Json | null
          streak_days?: number | null
          today_contributions?: number | null
          total_contributions?: number | null
          updated_at?: string | null
          user_id: string
          weekly_contributions?: number | null
        }
        Update: {
          active_days?: number | null
          created_at?: string | null
          id?: string
          last_fetched_at?: string | null
          platform?: string
          raw_data?: Json | null
          streak_days?: number | null
          today_contributions?: number | null
          total_contributions?: number | null
          updated_at?: string | null
          user_id?: string
          weekly_contributions?: number | null
        }
        Relationships: []
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
