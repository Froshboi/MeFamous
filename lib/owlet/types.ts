/**
 * Types for The-Owlet SMM Panel API v2.
 *
 * Source of truth: https://the-owlet.com/api (fetched and verified before
 * writing this file — every field below matches the documented request
 * parameters and example responses verbatim. Nothing here is invented.
 *
 * Transport: single POST endpoint (`OWLET_API_URL`, e.g.
 * https://the-owlet.com/api/v2), `action` in the body selects the method,
 * response is always JSON.
 */

export type OwletAction =
  | "services"
  | "add"
  | "status"
  | "refill"
  | "refill_status"
  | "cancel"
  | "balance";

// ── Service list ─────────────────────────────────────────────────────────────

export interface OwletService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string; // price per 1000, as a string, provider currency (USD)
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
}

// ── Add order ────────────────────────────────────────────────────────────────
// The docs list several order "types" (Default, Package, SEO, Custom Comments,
// Mentions, Mentions with Hashtags, Mentions Custom List, Mentions Hashtag,
// Mentions User Followers, Mentions Media Likers, Custom Comments Package,
// Comment Likes, Poll, Comment Replies, Invites from Groups, Subscriptions).
// MeFamous only sells "Default" services in this phase (link + quantity),
// so we model that shape here and keep the rest as documented optional
// fields for forward-compatibility rather than inventing new ones.
export interface OwletAddOrderParams {
  service: number;
  link: string;
  quantity: number;
  runs?: number;
  interval?: number;
}

export interface OwletAddOrderResponse {
  order: number;
}

// ── Order status ─────────────────────────────────────────────────────────────

export type OwletOrderStatusValue =
  | "Pending"
  | "In progress"
  | "Processing"
  | "Completed"
  | "Partial"
  | "Canceled"
  | "Cancelled"
  | "Error";

export interface OwletOrderStatus {
  charge: string;
  start_count: string;
  status: OwletOrderStatusValue | string;
  remains: string;
  currency: string;
}

export interface OwletOrderStatusError {
  error: string;
}

/** Keyed by order ID (as a string) when requesting multiple statuses. */
export type OwletMultiOrderStatusResponse = Record<
  string,
  OwletOrderStatus | OwletOrderStatusError
>;

// ── Refill ───────────────────────────────────────────────────────────────────

export interface OwletRefillResponse {
  refill: string | number;
}

export interface OwletMultiRefillResultItem {
  order: number;
  refill: number | OwletOrderStatusError;
}

export type OwletMultiRefillResponse = OwletMultiRefillResultItem[];

export interface OwletRefillStatusResponse {
  status: string;
}

export interface OwletMultiRefillStatusResultItem {
  refill: number;
  status: string | OwletOrderStatusError;
}

export type OwletMultiRefillStatusResponse = OwletMultiRefillStatusResultItem[];

// ── Cancel ───────────────────────────────────────────────────────────────────

export interface OwletCancelResultItem {
  order: number;
  cancel: number | OwletOrderStatusError;
}

export type OwletCancelResponse = OwletCancelResultItem[];

// ── Balance ──────────────────────────────────────────────────────────────────

export interface OwletBalanceResponse {
  balance: string;
  currency: string;
}

// ── Errors ───────────────────────────────────────────────────────────────────

/**
 * Thrown by the client for transport-level failures (timeout, network,
 * non-2xx HTTP, rate limiting) and for provider-level `{ "error": "..." }`
 * payloads. `code` distinguishes the failure category for callers that
 * want to react differently (e.g. retry a timeout, but not an auth error).
 */
export class OwletApiError extends Error {
  readonly code:
    | "timeout"
    | "network"
    | "rate_limited"
    | "http_error"
    | "provider_error"
    | "invalid_response"
    | "not_configured";
  readonly status?: number;
  readonly action: OwletAction;

  constructor(params: {
    message: string;
    code: OwletApiError["code"];
    action: OwletAction;
    status?: number;
  }) {
    super(params.message);
    this.name = "OwletApiError";
    this.code = params.code;
    this.action = params.action;
    this.status = params.status;
  }
}
