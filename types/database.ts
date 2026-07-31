/**
 * Hand-written to mirror supabase/migrations/0001_init_profiles.sql and
 * 0002_owlet_orders.sql exactly, and to satisfy @supabase/postgrest-js's
 * GenericSchema/GenericTable/GenericFunction constraints (Relationships on
 * every table, Args/Returns on every function). Once the project is
 * linked, prefer regenerating this from the live schema instead of
 * hand-editing:
 *
 *   supabase gen types typescript --project-id <project-ref> > types/database.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "customer" | "reseller" | "moderator" | "admin" | "super_admin";

export type OrderStatus =
  | "pending"
  | "submitted"
  | "in_progress"
  | "partial"
  | "completed"
  | "cancelled"
  | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          avatar_url: string | null;
          wallet_balance: number;
          referral_code: string;
          referred_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          wallet_balance?: number;
          referral_code: string;
          referred_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: number;
          name: string;
          provider: string;
          provider_service_id: string;
          provider_type: string;
          category: string;
          provider_rate: number;
          markup_percent: number;
          customer_rate: number;
          min_quantity: number;
          max_quantity: number;
          supports_refill: boolean;
          supports_cancel: boolean;
          is_active: boolean;
          synced_at: string;
          created_at: string;
        };
        Insert: {
          name: string;
          provider: string;
          provider_service_id: string;
          provider_type: string;
          category: string;
          provider_rate: number;
          markup_percent?: number;
          min_quantity: number;
          max_quantity: number;
          supports_refill?: boolean;
          supports_cancel?: boolean;
          is_active?: boolean;
          synced_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          service_id: number;
          provider: string;
          provider_order_id: string | null;
          link: string;
          quantity: number;
          provider_charge: number | null;
          price_charged: number;
          currency: string;
          status: OrderStatus;
          start_count: string | null;
          remains: string | null;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        // Rows are only ever created/mutated via the place_order() /
        // confirm_order() / fail_order_and_refund() / update_order_progress()
        // RPCs — direct table Insert/Update isn't part of the app's contract,
        // but the shape still has to satisfy GenericTable's Record type.
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "orders_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      provider_api_logs: {
        Row: {
          id: number;
          provider: string;
          action: string;
          request_params: Json | null;
          success: boolean;
          http_status: number | null;
          error_message: string | null;
          duration_ms: number | null;
          created_at: string;
        };
        Insert: {
          provider: string;
          action: string;
          request_params?: Json | null;
          success: boolean;
          http_status?: number | null;
          error_message?: string | null;
          duration_ms?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["provider_api_logs"]["Insert"]>;
        Relationships: [];
      };
      app_settings: {
        Row: { key: string; value: Json; updated_at: string };
        Insert: { key: string; value: Json };
        Update: { key?: string; value?: Json };
        Relationships: [];
      };
      wallet_topups: {
        Row: {
          id: string;
          user_id: string;
          reference: string;
          amount: number;
          currency: string;
          method: "korapay" | "crypto";
          crypto_asset: string | null;
          crypto_tx_note: string | null;
          status: "pending" | "completed" | "failed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          reference: string;
          amount: number;
          currency?: string;
          method: "korapay" | "crypto";
          crypto_asset?: string | null;
          crypto_tx_note?: string | null;
          status?: "pending" | "completed" | "failed";
        };
        Update: Partial<Database["public"]["Tables"]["wallet_topups"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "order_status" | "wallet_topup" | "referral_reward" | "system";
          title: string;
          body: string | null;
          link: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: Record<string, never>; // only created via trigger functions
        Update: { read_at?: string | null };
        Relationships: [];
      };
      referral_rewards: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          source_topup_id: string | null;
          amount: number;
          created_at: string;
        };
        Insert: Record<string, never>; // only created via handle_topup_completed()
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      place_order: {
        Args: { p_service_id: number; p_link: string; p_quantity: number; p_price: number };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      confirm_order: {
        Args: { p_order_id: string; p_provider_order_id: string };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      fail_order_and_refund: {
        Args: { p_order_id: string; p_reason: string };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      update_order_progress: {
        Args: {
          p_order_id: string;
          p_status: string;
          p_start_count?: string | null;
          p_remains?: string | null;
          p_provider_charge?: number | null;
        };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      credit_wallet_topup: {
        Args: { p_reference: string };
        Returns: Database["public"]["Tables"]["wallet_topups"]["Row"];
      };
      fail_wallet_topup: {
        Args: { p_reference: string };
        Returns: Database["public"]["Tables"]["wallet_topups"]["Row"];
      };
      mark_notification_read: {
        Args: { p_notification_id: string };
        Returns: Database["public"]["Tables"]["notifications"]["Row"];
      };
      mark_all_notifications_read: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
    };
  };
}
