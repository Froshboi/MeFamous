/**
 * Types for Korapay's Checkout Redirect flow (pay-ins).
 *
 * Source of truth (fetched and verified before writing this file):
 *  - https://developers.korapay.com/docs/checkout-redirect
 *  - https://developers.korapay.com/docs/webhooks
 *
 * Base URL: https://api.korapay.com/merchant
 */

export interface KorapayInitializeChargeParams {
  amount: number;
  currency: string; // e.g. "NGN"
  reference: string; // must be unique per transaction
  customer: { email: string; name?: string };
  redirect_url?: string;
  notification_url?: string;
  narration?: string;
  merchant_bears_cost?: boolean;
}

export interface KorapayInitializeChargeResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    checkout_url: string;
  };
}

export type KorapayChargeStatus =
  | "success"
  | "failed"
  | "processing"
  | "pending"
  | string;

export interface KorapayChargeQueryResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    fee?: number;
    status: KorapayChargeStatus;
    payment_method?: string;
  };
}

export type KorapayWebhookEvent =
  | "charge.success"
  | "charge.failed"
  | "transfer.success"
  | "transfer.failed"
  | "refund.success"
  | "refund.failed";

export interface KorapayWebhookPayload {
  event: KorapayWebhookEvent;
  data: {
    reference: string;
    amount: number;
    currency: string;
    fee?: number;
    status: "success" | "failed";
    payment_method?: string;
    payment_reference?: string;
  };
}

export class KorapayApiError extends Error {
  readonly code: "timeout" | "network" | "http_error" | "provider_error" | "not_configured";
  readonly status?: number;

  constructor(params: { message: string; code: KorapayApiError["code"]; status?: number }) {
    super(params.message);
    this.name = "KorapayApiError";
    this.code = params.code;
    this.status = params.status;
  }
}
