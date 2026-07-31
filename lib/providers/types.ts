import "server-only";

/**
 * Every SMM provider integration implements this interface. Nothing
 * outside lib/providers/ should import lib/owlet/* (or any future
 * lib/<provider>/*) directly — Server Actions, cron routes, and admin
 * pages depend on THIS shape only, so adding or swapping a provider means
 * writing one new adapter file and registering it, not touching order
 * placement, sync, or admin code.
 *
 * `id` fields are strings throughout, even though Owlet's are numeric —
 * a different provider might use alphanumeric ids, and nothing upstream
 * should have to care either way.
 */

export interface ProviderService {
  providerServiceId: string;
  name: string;
  type: string;
  category: string;
  rate: number; // per 1,000, in the provider's own currency
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
}

export interface ProviderAddOrderParams {
  providerServiceId: string;
  link: string;
  quantity: number;
}

export interface ProviderAddOrderResult {
  providerOrderId: string;
}

/** Already normalized to our internal OrderStatus values by the adapter — callers never see provider-specific status text. */
export type NormalizedOrderStatus =
  | "pending"
  | "submitted"
  | "in_progress"
  | "partial"
  | "completed"
  | "cancelled"
  | "failed";

export interface ProviderOrderStatus {
  status: NormalizedOrderStatus;
  charge: number;
  startCount: string | null;
  remains: string | null;
  currency: string;
}

export interface ProviderBalance {
  balance: number;
  currency: string;
}

export class ProviderApiError extends Error {
  readonly provider: string;
  readonly code: string;

  constructor(params: { message: string; provider: string; code: string }) {
    super(params.message);
    this.name = "ProviderApiError";
    this.provider = params.provider;
    this.code = params.code;
  }
}

export interface SmmProvider {
  /** Internal key only (e.g. "owlet") — never surfaced to customers. */
  readonly key: string;
  /** Human-readable name for the admin panel only. */
  readonly displayName: string;

  getServices(options?: { skipCache?: boolean }): Promise<ProviderService[]>;
  addOrder(params: ProviderAddOrderParams): Promise<ProviderAddOrderResult>;
  getMultiOrderStatus(
    providerOrderIds: string[]
  ): Promise<Record<string, ProviderOrderStatus | { error: string }>>;
  cancelOrders(providerOrderIds: string[]): Promise<void>;
  getBalance(): Promise<ProviderBalance>;
}
