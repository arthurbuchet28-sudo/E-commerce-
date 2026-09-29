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
      consent_log: {
        Row: {
          created_at: string;
          id: string;
          kind: string;
          order_id: string | null;
          subscriber_id: string | null;
          text_version: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kind: string;
          order_id?: string | null;
          subscriber_id?: string | null;
          text_version: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          kind?: string;
          order_id?: string | null;
          subscriber_id?: string | null;
          text_version?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "consent_log_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consent_log_subscriber_id_fkey";
            columns: ["subscriber_id"];
            isOneToOne: false;
            referencedRelation: "newsletter_subscribers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consent_log_user_id_fkey";
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
          revoked_at: string | null;
          source: string;
          starts_at: string;
          user_id: string;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          expires_at?: string | null;
          order_id?: string | null;
          revoked_at?: string | null;
          source: string;
          starts_at?: string;
          user_id: string;
        };
        Update: {
          course_id?: string;
          created_at?: string;
          expires_at?: string | null;
          order_id?: string | null;
          revoked_at?: string | null;
          source?: string;
          starts_at?: string;
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
            foreignKeyName: "enrollments_order_fk";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
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
      invoice_counters: {
        Row: {
          kind: string;
          last_number: number;
          year: number;
        };
        Insert: {
          kind: string;
          last_number?: number;
          year: number;
        };
        Update: {
          kind?: string;
          last_number?: number;
          year?: number;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          data: NonNullable<Json>;
          id: string;
          issued_at: string;
          kind: string;
          number: string;
          order_id: string;
        };
        Insert: {
          data: NonNullable<Json>;
          id?: string;
          issued_at?: string;
          kind: string;
          number: string;
          order_id: string;
        };
        Update: {
          data?: NonNullable<Json>;
          id?: string;
          issued_at?: string;
          kind?: string;
          number?: string;
          order_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
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
      newsletter_subscribers: {
        Row: {
          access_token: string;
          confirm_expires_at: string | null;
          confirm_token_hash: string | null;
          confirmed_at: string | null;
          consent_text_version: string;
          email: string;
          id: string;
          next_email_at: string | null;
          requested_at: string;
          sequence_step: number;
          source: string;
          status: string;
          unsubscribed_at: string | null;
        };
        Insert: {
          access_token?: string;
          confirm_expires_at?: string | null;
          confirm_token_hash?: string | null;
          confirmed_at?: string | null;
          consent_text_version: string;
          email: string;
          id?: string;
          next_email_at?: string | null;
          requested_at?: string;
          sequence_step?: number;
          source?: string;
          status?: string;
          unsubscribed_at?: string | null;
        };
        Update: {
          access_token?: string;
          confirm_expires_at?: string | null;
          confirm_token_hash?: string | null;
          confirmed_at?: string | null;
          consent_text_version?: string;
          email?: string;
          id?: string;
          next_email_at?: string | null;
          requested_at?: string;
          sequence_step?: number;
          source?: string;
          status?: string;
          unsubscribed_at?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          course_id: string;
          order_id: string;
          title: string;
          unit_price_cents: number;
        };
        Insert: {
          course_id: string;
          order_id: string;
          title: string;
          unit_price_cents: number;
        };
        Update: {
          course_id?: string;
          order_id?: string;
          title?: string;
          unit_price_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          amount_cents: number;
          cgv_accepted_at: string;
          cgv_version: string;
          created_at: string;
          currency: string;
          customer_name: string | null;
          email: string;
          id: string;
          immediate_access: boolean;
          paid_at: string | null;
          reference: string;
          status: string;
          stripe_payment_intent: string | null;
          stripe_session_id: string | null;
          user_id: string | null;
          waiver_at: string | null;
          waiver_text_version: string | null;
        };
        Insert: {
          amount_cents: number;
          cgv_accepted_at: string;
          cgv_version: string;
          created_at?: string;
          currency?: string;
          customer_name?: string | null;
          email: string;
          id?: string;
          immediate_access: boolean;
          paid_at?: string | null;
          reference?: string;
          status?: string;
          stripe_payment_intent?: string | null;
          stripe_session_id?: string | null;
          user_id?: string | null;
          waiver_at?: string | null;
          waiver_text_version?: string | null;
        };
        Update: {
          amount_cents?: number;
          cgv_accepted_at?: string;
          cgv_version?: string;
          created_at?: string;
          currency?: string;
          customer_name?: string | null;
          email?: string;
          id?: string;
          immediate_access?: boolean;
          paid_at?: string | null;
          reference?: string;
          status?: string;
          stripe_payment_intent?: string | null;
          stripe_session_id?: string | null;
          user_id?: string | null;
          waiver_at?: string | null;
          waiver_text_version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
      rate_limits: {
        Row: {
          hits: number;
          key: string;
          window_start: string;
        };
        Insert: {
          hits?: number;
          key: string;
          window_start: string;
        };
        Update: {
          hits?: number;
          key?: string;
          window_start?: string;
        };
        Relationships: [];
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
      stripe_events: {
        Row: {
          id: string;
          received_at: string;
          type: string;
        };
        Insert: {
          id: string;
          received_at?: string;
          type: string;
        };
        Update: {
          id?: string;
          received_at?: string;
          type?: string;
        };
        Relationships: [];
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
      withdrawals: {
        Row: {
          ack_sent_at: string | null;
          consumer_name: string;
          email: string;
          id: string;
          order_id: string;
          refund_status: string;
          refunded_at: string | null;
          requested_at: string;
          stripe_refund_id: string | null;
        };
        Insert: {
          ack_sent_at?: string | null;
          consumer_name: string;
          email: string;
          id?: string;
          order_id: string;
          refund_status?: string;
          refunded_at?: string | null;
          requested_at?: string;
          stripe_refund_id?: string | null;
        };
        Update: {
          ack_sent_at?: string | null;
          consumer_name?: string;
          email?: string;
          id?: string;
          order_id?: string;
          refund_status?: string;
          refunded_at?: string | null;
          requested_at?: string;
          stripe_refund_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "withdrawals_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
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
      create_order: {
        Args: {
          p_cgv_version: string;
          p_course_slug: string;
          p_immediate_access: boolean;
          p_waiver_text_version: string;
        };
        Returns: Json;
      };
      enroll_free: { Args: { p_course_id: string }; Returns: undefined };
      expire_order: { Args: { p_event_id: string; p_session_id: string }; Returns: Json };
      fulfill_order: {
        Args: {
          p_amount_cents: number;
          p_currency: string;
          p_event_id: string;
          p_payment_intent: string;
          p_seller: Json;
          p_session_id: string;
          p_withdrawal_days: number;
        };
        Returns: Json;
      };
      has_access: { Args: { p_course_id: string }; Returns: boolean };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      issue_certificate: { Args: { p_course_id: string }; Returns: string };
      issue_invoice: {
        Args: { p_kind: string; p_order_id: string; p_seller: Json };
        Returns: string;
      };
      newsletter_advance: {
        Args: { p_id: string; p_next_at: string; p_step: number };
        Returns: undefined;
      };
      newsletter_claim_due: {
        Args: { p_limit: number; p_max_step: number };
        Returns: {
          access_token: string;
          email: string;
          id: string;
          sequence_step: number;
        }[];
      };
      newsletter_confirm: { Args: { p_token_hash: string }; Returns: Json };
      newsletter_purge: {
        Args: { p_pending_days: number; p_unsubscribed_days: number };
        Returns: Json;
      };
      newsletter_request: {
        Args: {
          p_consent_version: string;
          p_email: string;
          p_source: string;
          p_token_hash: string;
          p_ttl_hours: number;
        };
        Returns: Json;
      };
      newsletter_token_status: { Args: { p_token_hash: string }; Returns: string };
      newsletter_unsubscribe: { Args: { p_access_token: string }; Returns: string };
      next_invoice_number: { Args: { p_at: string; p_kind: string }; Returns: string };
      order_reference: { Args: Record<PropertyKey, never>; Returns: string };
      rate_limit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number };
        Returns: boolean;
      };
      record_refund: {
        Args: {
          p_amount_refunded: number;
          p_event_id: string;
          p_payment_intent: string;
          p_refund_id: string;
          p_seller: Json;
        };
        Returns: Json;
      };
      request_withdrawal: {
        Args: {
          p_consumer_name: string;
          p_email: string;
          p_reference: string;
          p_seller: Json;
          p_withdrawal_days: number;
        };
        Returns: Json;
      };
      submit_quiz: { Args: { p_answers: number[]; p_module_id: string }; Returns: Json };
      withdrawal_eligibility: {
        Args: { p_order_id: string; p_withdrawal_days: number };
        Returns: string;
      };
      withdrawal_lookup: {
        Args: { p_email: string; p_reference: string; p_withdrawal_days: number };
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
