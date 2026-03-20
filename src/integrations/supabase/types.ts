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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bets: {
        Row: {
          actual_profit: number | null
          bet_type: Database["public"]["Enums"]["bet_type"]
          created_at: string
          exposure: number
          game_round_id: string | null
          game_type: Database["public"]["Enums"]["game_type"] | null
          id: string
          market_id: string | null
          odds: number
          potential_profit: number
          runner_id: string | null
          settled_at: string | null
          stake: number
          status: Database["public"]["Enums"]["bet_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_profit?: number | null
          bet_type: Database["public"]["Enums"]["bet_type"]
          created_at?: string
          exposure?: number
          game_round_id?: string | null
          game_type?: Database["public"]["Enums"]["game_type"] | null
          id?: string
          market_id?: string | null
          odds: number
          potential_profit?: number
          runner_id?: string | null
          settled_at?: string | null
          stake: number
          status?: Database["public"]["Enums"]["bet_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_profit?: number | null
          bet_type?: Database["public"]["Enums"]["bet_type"]
          created_at?: string
          exposure?: number
          game_round_id?: string | null
          game_type?: Database["public"]["Enums"]["game_type"] | null
          id?: string
          market_id?: string | null
          odds?: number
          potential_profit?: number
          runner_id?: string | null
          settled_at?: string | null
          stake?: number
          status?: Database["public"]["Enums"]["bet_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "runners"
            referencedColumns: ["id"]
          },
        ]
      }
      game_logs: {
        Row: {
          action: string
          bet_id: string | null
          created_at: string
          details: Json | null
          game: Database["public"]["Enums"]["game_type"]
          id: string
          round_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          bet_id?: string | null
          created_at?: string
          details?: Json | null
          game: Database["public"]["Enums"]["game_type"]
          id?: string
          round_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          bet_id?: string | null
          created_at?: string
          details?: Json | null
          game?: Database["public"]["Enums"]["game_type"]
          id?: string
          round_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_logs_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_logs_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "game_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rounds: {
        Row: {
          created_at: string
          ended_at: string | null
          game: Database["public"]["Enums"]["game_type"]
          id: string
          multiplier: number | null
          result: Json | null
          round_data: Json
          started_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          game: Database["public"]["Enums"]["game_type"]
          id?: string
          multiplier?: number | null
          result?: Json | null
          round_data?: Json
          started_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          game?: Database["public"]["Enums"]["game_type"]
          id?: string
          multiplier?: number | null
          result?: Json | null
          round_data?: Json
          started_at?: string
        }
        Relationships: []
      }
      markets: {
        Row: {
          competition: string
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          sport: Database["public"]["Enums"]["sport_type"]
          start_time: string
          status: Database["public"]["Enums"]["market_status"]
          updated_at: string
        }
        Insert: {
          competition: string
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          sport: Database["public"]["Enums"]["sport_type"]
          start_time: string
          status?: Database["public"]["Enums"]["market_status"]
          updated_at?: string
        }
        Update: {
          competition?: string
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          sport?: Database["public"]["Enums"]["sport_type"]
          start_time?: string
          status?: Database["public"]["Enums"]["market_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          parent_id: string | null
          phone: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          parent_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          parent_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      runners: {
        Row: {
          back_odds: number
          back_size: number
          created_at: string
          id: string
          is_winner: boolean | null
          lay_odds: number
          lay_size: number
          market_id: string
          name: string
          sort_order: number
        }
        Insert: {
          back_odds?: number
          back_size?: number
          created_at?: string
          id?: string
          is_winner?: boolean | null
          lay_odds?: number
          lay_size?: number
          market_id: string
          name: string
          sort_order?: number
        }
        Update: {
          back_odds?: number
          back_size?: number
          created_at?: string
          id?: string
          is_winner?: boolean | null
          lay_odds?: number
          lay_size?: number
          market_id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "runners_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          type: Database["public"]["Enums"]["txn_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type: Database["public"]["Enums"]["txn_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type?: Database["public"]["Enums"]["txn_type"]
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          bonus_balance: number
          exposure: number
          id: string
          total_profit_loss: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          bonus_balance?: number
          exposure?: number
          id?: string
          total_profit_loss?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          bonus_balance?: number
          exposure?: number
          id?: string
          total_profit_loss?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { uid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"]; uid: string }
        Returns: boolean
      }
      is_admin_or_above: { Args: { uid: string }; Returns: boolean }
      is_in_downline: {
        Args: { admin_uid: string; target_uid: string }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "active" | "suspended" | "blocked"
      app_role: "user" | "admin" | "master_admin" | "superadmin"
      bet_status: "pending" | "matched" | "won" | "lost" | "void" | "cancelled"
      bet_type:
        | "back"
        | "lay"
        | "fancy_yes"
        | "fancy_no"
        | "session_over"
        | "session_under"
        | "casino"
        | "crash"
        | "dice"
        | "mines"
        | "plinko"
        | "aviator"
        | "teen_patti"
      game_type:
        | "aviator"
        | "plinko"
        | "crash"
        | "dice"
        | "mines"
        | "teen_patti"
        | "casino"
      market_status: "open" | "suspended" | "closed" | "settled"
      sport_type: "cricket" | "football" | "tennis"
      txn_type:
        | "deposit"
        | "withdrawal"
        | "bet_debit"
        | "bet_win"
        | "bet_refund"
        | "admin_credit"
        | "admin_debit"
        | "bonus_credit"
        | "adjustment"
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
      account_status: ["active", "suspended", "blocked"],
      app_role: ["user", "admin", "master_admin", "superadmin"],
      bet_status: ["pending", "matched", "won", "lost", "void", "cancelled"],
      bet_type: [
        "back",
        "lay",
        "fancy_yes",
        "fancy_no",
        "session_over",
        "session_under",
        "casino",
        "crash",
        "dice",
        "mines",
        "plinko",
        "aviator",
        "teen_patti",
      ],
      game_type: [
        "aviator",
        "plinko",
        "crash",
        "dice",
        "mines",
        "teen_patti",
        "casino",
      ],
      market_status: ["open", "suspended", "closed", "settled"],
      sport_type: ["cricket", "football", "tennis"],
      txn_type: [
        "deposit",
        "withdrawal",
        "bet_debit",
        "bet_win",
        "bet_refund",
        "admin_credit",
        "admin_debit",
        "bonus_credit",
        "adjustment",
      ],
    },
  },
} as const
