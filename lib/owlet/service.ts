import "server-only";
import { callOwlet } from "./client";
import { getCached, setCached } from "./cache";
import type {
  OwletAddOrderParams,
  OwletAddOrderResponse,
  OwletBalanceResponse,
  OwletCancelResponse,
  OwletMultiOrderStatusResponse,
  OwletMultiRefillResponse,
  OwletMultiRefillStatusResponse,
  OwletOrderStatus,
  OwletRefillResponse,
  OwletRefillStatusResponse,
  OwletService,
} from "./types";

const SERVICES_CACHE_KEY = "owlet:services";
const SERVICES_CACHE_TTL_MS = 5 * 60 * 1000;

/** GET services — cached briefly since the full catalog rarely changes minute-to-minute. */
export async function getOwletServices(options: { skipCache?: boolean } = {}): Promise<OwletService[]> {
  if (!options.skipCache) {
    const cached = getCached<OwletService[]>(SERVICES_CACHE_KEY);
    if (cached) return cached;
  }

  const services = await callOwlet<OwletService[]>("services");
  setCached(SERVICES_CACHE_KEY, services, SERVICES_CACHE_TTL_MS);
  return services;
}

export async function addOwletOrder(params: OwletAddOrderParams): Promise<OwletAddOrderResponse> {
  return callOwlet<OwletAddOrderResponse>("add", { ...params });
}

export async function getOwletOrderStatus(orderId: number): Promise<OwletOrderStatus> {
  return callOwlet<OwletOrderStatus>("status", { order: orderId });
}

/** Up to 100 order IDs per the documented limit. */
export async function getOwletMultiOrderStatus(
  orderIds: number[]
): Promise<OwletMultiOrderStatusResponse> {
  if (orderIds.length === 0) return {};
  if (orderIds.length > 100) {
    throw new Error("getOwletMultiOrderStatus supports at most 100 order IDs per call.");
  }
  return callOwlet<OwletMultiOrderStatusResponse>("status", { orders: orderIds.join(",") });
}

export async function createOwletRefill(orderId: number): Promise<OwletRefillResponse> {
  return callOwlet<OwletRefillResponse>("refill", { order: orderId });
}

export async function createOwletMultiRefill(orderIds: number[]): Promise<OwletMultiRefillResponse> {
  if (orderIds.length > 100) {
    throw new Error("createOwletMultiRefill supports at most 100 order IDs per call.");
  }
  return callOwlet<OwletMultiRefillResponse>("refill", { orders: orderIds.join(",") });
}

export async function getOwletRefillStatus(refillId: number): Promise<OwletRefillStatusResponse> {
  return callOwlet<OwletRefillStatusResponse>("refill_status", { refill: refillId });
}

export async function getOwletMultiRefillStatus(
  refillIds: number[]
): Promise<OwletMultiRefillStatusResponse> {
  if (refillIds.length > 100) {
    throw new Error("getOwletMultiRefillStatus supports at most 100 refill IDs per call.");
  }
  return callOwlet<OwletMultiRefillStatusResponse>("refill_status", {
    refills: refillIds.join(","),
  });
}

/** The API only documents a bulk cancel (`orders`, comma-separated), no single-order variant. */
export async function cancelOwletOrders(orderIds: number[]): Promise<OwletCancelResponse> {
  if (orderIds.length === 0) return [];
  if (orderIds.length > 100) {
    throw new Error("cancelOwletOrders supports at most 100 order IDs per call.");
  }
  return callOwlet<OwletCancelResponse>("cancel", { orders: orderIds.join(",") });
}

export async function getOwletBalance(): Promise<OwletBalanceResponse> {
  return callOwlet<OwletBalanceResponse>("balance");
}
