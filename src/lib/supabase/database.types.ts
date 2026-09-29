export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      certificates: {
        Row: {
          course_id: string;
          holder_name: string;
          id: string;
          issued_at: string;
          serial: string;
          user_id: string;
        };
        Insert: {
          course_id: string;
          holder_name: string;
          id?: string;
          issued_at?: string;
          serial: string;
          user_id: string;
        };
        Update: {
          course_id?: string;
          holder_name?: string;
          id?: string;
          issued_at?: string;
          serial?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: {
          access_months: number;
          audience: string;
          code: string;
          created_at: string;
          faq: NonNullable<Json>;
          id: string;
          is_free: boolean;
          level: string;
          objectives: string[];
          position: number;
          prerequisites: string[];
          price_cents: number | null;
          slug: string;
          status: string;
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          access_months?: number;
          audience: string;
          code: string;
          created_at?: string;
          faq?: NonNullable<Json>;
          id?: string;
          is_free?: boolean;
          level: string;
          objectives?: string[];
          position?: number;
          prerequisites?: string[];
          price_cents?: number | null;
          slug: string;
          status?: string;
          summary: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          access_months?: number;
          audience?: string;
          code?: string;
          created_at?: string;
          faq?: NonNullable<Json>;
          id?: string;
          is_free?: boolean;
          level?: string;
          objectives?: string[];
          position?: number;
          prerequisites?: string[];
          price_cents?: number | null;
          slug?: string;
          status?: string;
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      enrollments: {
        Row: {
          course_id: string;
          created_at: string;
          expires_at: string | null;
          order_id: string | null;
          source: string;
          user_id: string;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          expires_at?: string | null;
          order_id?: string | null;
          source: string;
          user_id: string;
        };
        Update: {
          course_id?: string;
          created_at?: string;
          expires_at?: string | null;
          order_id?: string | null;
          source?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_progress: {
        Row: {
          completed_at: string | null;
          course_id: string;
          last_seen_at: string;
          lesson_id: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          course_id: string;
          last_seen_at?: string;
          lesson_id: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          course_id?: string;
          last_seen_at?: string;
          lesson_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_resources: {
        Row: {
          id: string;
          label: string;
          lesson_id: string;
          position: number;
          storage_path: string;
        };
        Insert: {
          id?: string;
          label: string;
          lesson_id: string;
          position?: number;
          storage_path: string;
        };
        Update: {
          id?: string;
          label?: string;
          lesson_id?: string;
          position?: number;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_resources_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          course_id: string;
          duration_min: number;
          has_video: boolean;
          id: string;
          is_preview: boolean;
          mdx_path: string;
          module_id: string;
          position: number;
          slug: string;
          title: string;
          video_id: string | null;
        };
        Insert: {
          course_id: string;
          duration_min: number;
          has_video?: boolean;
          id?: string;
          is_preview?: boolean;
          mdx_path: string;
          module_id: string;
          position: number;
          slug: string;
          title: string;
          video_id?: string | null;
        };
        Update: {
          course_id?: string;
          duration_min?: number;
          has_video?: boolean;
          id?: string;
          is_preview?: boolean;
          mdx_path?: string;
          module_id?: string;
          position?: number;
          slug?: string;
          title?: string;
          video_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      modules: {
        Row: {
          course_id: string;
          id: string;
          pass_score: number;
          position: number;
          question_count: number;
          title: string;
        };
        Insert: {
          course_id: string;
          id?: string;
          pass_score?: number;
          position: number;
          question_count?: number;
          title: string;
        };
        Update: {
          course_id?: string;
          id?: string;
          pass_score?: number;
          position?: number;
          question_count?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          cgu_accepted_at: string | null;
          cgu_version: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          cgu_accepted_at?: string | null;
          cgu_version?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          cgu_accepted_at?: string | null;
          cgu_version?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          answers: NonNullable<Json>;
          created_at: string;
          id: string;
          module_id: string;
          passed: boolean;
          score: number;
          user_id: string;
        };
        Insert: {
          answers: NonNullable<Json>;
          created_at?: string;
          id?: string;
          module_id: string;
          passed: boolean;
          score: number;
          user_id: string;
        };
        Update: {
          answers?: NonNullable<Json>;
          created_at?: string;
          id?: string;
          module_id?: string;
          passed?: boolean;
          score?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_questions: {
        Row: {
          choices: string[];
          correct_index: number;
          explanation: string;
          id: string;
          module_id: string;
          position: number;
          prompt: string;
        };
        Insert: {
          choices: string[];
          correct_index: number;
          explanation: string;
          id?: string;
          module_id: string;
          position: number;
          prompt: string;
        };
        Update: {
          choices?: string[];
          correct_index?: number;
          explanation?: string;
          id?: string;
          module_id?: string;
          position?: number;
          prompt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_questions_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_simulations: {
        Row: {
          created_at: string;
          id: string;
          inputs: NonNullable<Json>;
          title: string;
          tool: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          inputs: NonNullable<Json>;
          title: string;
          tool: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          inputs?: NonNullable<Json>;
          title?: string;
          tool?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_simulations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_progress: {
        Row: {
          client_updated_at: string;
          data: NonNullable<Json>;
          key: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          client_updated_at: string;
          data: NonNullable<Json>;
          key: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          client_updated_at?: string;
          data?: NonNullable<Json>;
          key?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      course_completed: { Args: { p_course_id: string; p_user_id: string }; Returns: boolean };
      enroll_free: { Args: { p_course_id: string }; Returns: undefined };
      has_access: { Args: { p_course_id: string }; Returns: boolean };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      issue_certificate: { Args: { p_course_id: string }; Returns: string };
      submit_quiz: { Args: { p_answers: number[]; p_module_id: string }; Returns: Json };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
