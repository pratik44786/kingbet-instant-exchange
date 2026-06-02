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
      company_settings: {
        Row: {
          ceo_name: string | null
          company_name: string
          created_at: string
          facebook_url: string | null
          favicon_url: string | null
          founder_name: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          office_address: string | null
          support_email: string | null
          support_phone: string | null
          tagline: string | null
          telegram_url: string | null
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          ceo_name?: string | null
          company_name?: string
          created_at?: string
          facebook_url?: string | null
          favicon_url?: string | null
          founder_name?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          office_address?: string | null
          support_email?: string | null
          support_phone?: string | null
          tagline?: string | null
          telegram_url?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          ceo_name?: string | null
          company_name?: string
          created_at?: string
          facebook_url?: string | null
          favicon_url?: string | null
          founder_name?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          office_address?: string | null
          support_email?: string | null
          support_phone?: string | null
          tagline?: string | null
          telegram_url?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      deposit_addresses: {
        Row: {
          created_at: string
          crypto_name: string
          crypto_symbol: string
          id: string
          is_active: boolean
          min_deposit: number
          network: string
          qr_image_url: string | null
          sort_order: number
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          crypto_name: string
          crypto_symbol: string
          id?: string
          is_active?: boolean
          min_deposit?: number
          network: string
          qr_image_url?: string | null
          sort_order?: number
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          crypto_name?: string
          crypto_symbol?: string
          id?: string
          is_active?: boolean
          min_deposit?: number
          network?: string
          qr_image_url?: string | null
          sort_order?: number
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          crypto_symbol: string
          id: string
          network: string
          proof_image_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transaction_hash: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          crypto_symbol: string
          id?: string
          network: string
          proof_image_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_hash?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          crypto_symbol?: string
          id?: string
          network?: string
          proof_image_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_hash?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      investment_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          id: string
          is_active: boolean
          max_deposit: number
          min_deposit: number
          monthly_return_percent: number
          name: string
          payout_frequency: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          max_deposit?: number
          min_deposit?: number
          monthly_return_percent?: number
          name: string
          payout_frequency?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          max_deposit?: number
          min_deposit?: number
          monthly_return_percent?: number
          name?: string
          payout_frequency?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          end_date: string | null
          id: string
          last_payout_at: string | null
          monthly_return_percent: number
          plan_id: string
          start_date: string
          status: string
          total_profit_earned: number
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_date?: string | null
          id?: string
          last_payout_at?: string | null
          monthly_return_percent: number
          plan_id: string
          start_date?: string
          status?: string
          total_profit_earned?: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string | null
          id?: string
          last_payout_at?: string | null
          monthly_return_percent?: number
          plan_id?: string
          start_date?: string
          status?: string
          total_profit_earned?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_submissions: {
        Row: {
          admin_note: string | null
          back_image_url: string | null
          country: string | null
          created_at: string
          document_number: string
          document_type: string
          front_image_url: string
          full_name: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_image_url: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          back_image_url?: string | null
          country?: string | null
          created_at?: string
          document_number: string
          document_type: string
          front_image_url: string
          full_name: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_image_url: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          back_image_url?: string | null
          country?: string | null
          created_at?: string
          document_number?: string
          document_type?: string
          front_image_url?: string
          full_name?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_image_url?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          kyc_status: string
          parent_id: string | null
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          status: Database["public"]["Enums"]["account_status"]
          two_fa_enabled: boolean
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          kyc_status?: string
          parent_id?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          two_fa_enabled?: boolean
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_status?: string
          parent_id?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          two_fa_enabled?: boolean
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
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          level: number
          referred_user_id: string
          referrer_id: string
          total_commission: number
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          referred_user_id: string
          referrer_id: string
          total_commission?: number
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          referred_user_id?: string
          referrer_id?: string
          total_commission?: number
        }
        Relationships: []
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
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
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
          type?: Database["public"]["Enums"]["transaction_type"]
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
          active_investment: number
          balance: number
          id: string
          pending_withdrawal: number
          referral_earnings: number
          total_profit_loss: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active_investment?: number
          balance?: number
          id?: string
          pending_withdrawal?: number
          referral_earnings?: number
          total_profit_loss?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active_investment?: number
          balance?: number
          id?: string
          pending_withdrawal?: number
          referral_earnings?: number
          total_profit_loss?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          crypto_symbol: string
          id: string
          network: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transaction_hash: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          crypto_symbol: string
          id?: string
          network: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_hash?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          crypto_symbol?: string
          id?: string
          network?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_hash?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      distribute_profit_to_investment: {
        Args: { _investment_id: string; _profit: number }
        Returns: undefined
      }
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
      process_deposit_approval: {
        Args: {
          _admin_id: string
          _deposit_id: string
          _note?: string
          _tx_hash?: string
        }
        Returns: Json
      }
      process_deposit_rejection: {
        Args: { _admin_id: string; _deposit_id: string; _note?: string }
        Returns: Json
      }
      process_kyc_review: {
        Args: {
          _admin_id: string
          _kyc_id: string
          _note?: string
          _status: string
        }
        Returns: Json
      }
      process_withdrawal_approval: {
        Args: {
          _admin_id: string
          _note?: string
          _tx_hash?: string
          _withdrawal_id: string
        }
        Returns: Json
      }
      process_withdrawal_rejection: {
        Args: { _admin_id: string; _note?: string; _withdrawal_id: string }
        Returns: Json
      }
    }
    Enums: {
      account_status: "active" | "suspended" | "blocked"
      app_role: "user" | "admin" | "master_admin" | "superadmin"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "investment"
        | "profit"
        | "referral_commission"
        | "admin_adjustment"
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
      transaction_type: [
        "deposit",
        "withdrawal",
        "investment",
        "profit",
        "referral_commission",
        "admin_adjustment",
      ],
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
