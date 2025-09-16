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
    PostgrestVersion: "13.0.4"
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
      lesson_templates: {
        Row: {
          created_at: string | null
          day_of_week: number
          duration_minutes: number
          id: string
          is_active: boolean | null
          note: string | null
          price: number
          start_time: string
          student_id: string
          subject: string
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          note?: string | null
          price: number
          start_time: string
          student_id: string
          subject: string
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          note?: string | null
          price?: number
          start_time?: string
          student_id?: string
          subject?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_templates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_templates_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          note: string | null
          price: number
          start_time: string
          status: string
          student_id: string
          subject: string
          teacher_id: string
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          note?: string | null
          price: number
          start_time: string
          status?: string
          student_id: string
          subject: string
          teacher_id: string
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          note?: string | null
          price?: number
          start_time?: string
          status?: string
          student_id?: string
          subject?: string
          teacher_id?: string
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "lesson_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      student_contacts: {
        Row: {
          created_at: string | null
          id: string
          student_id: string
          type: Database["public"]["Enums"]["ContactType"]
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          student_id: string
          type: Database["public"]["Enums"]["ContactType"]
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          student_id?: string
          type?: Database["public"]["Enums"]["ContactType"]
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_contacts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_relations: {
        Row: {
          contact_type: Database["public"]["Enums"]["ContactType"]
          contact_value: string
          created_at: string | null
          id: string
          relation_name: string
          student_id: string
        }
        Insert: {
          contact_type: Database["public"]["Enums"]["ContactType"]
          contact_value: string
          created_at?: string | null
          id?: string
          relation_name: string
          student_id: string
        }
        Update: {
          contact_type?: Database["public"]["Enums"]["ContactType"]
          contact_value?: string
          created_at?: string | null
          id?: string
          relation_name?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_relations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          created_at: string | null
          first_name: string
          id: string
          is_online: boolean | null
          last_name: string | null
          teacher_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          first_name: string
          id?: string
          is_online?: boolean | null
          last_name?: string | null
          teacher_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          is_online?: boolean | null
          last_name?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string | null
          first_name: string
          id: string
          photo_url: string | null
          telegram_id: number
          username: string | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id: string
          photo_url?: string | null
          telegram_id: number
          username?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: string
          photo_url?: string | null
          telegram_id?: number
          username?: string | null
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
      ContactType:
        | "phone"
        | "email"
        | "telegram"
        | "whatsapp"
        | "viber"
        | "other"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ContactType: ["phone", "email", "telegram", "whatsapp", "viber", "other"],
    },
  },
} as const
