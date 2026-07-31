import "server-only";
import crypto from "node:crypto";
import {
  KorapayApiError,
  type KorapayInitializeChargeParams,
  type KorapayInitializeChargeResponse,
  type KorapayChargeQueryResponse,
} from "./types";

const BASE_URL = "https://api.korapay.com/merchant/api/v1";
const TIMEOUT_MS = 20_000;

function getSecretKey(): string {
  const key = process.env.KORAPAY_SECRET_KEY;
  if (!key) {
    throw new KorapayApiError({
      message: "KORAPAY_SECRET_KEY is not set.",
      code: "not_configured",
    });
  }
  return key;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    const data = await response.json().catch(() => {
      throw new KorapayApiError({
        message: "Korapay returned a response that was not valid JSON.",
        code: "http_error",
        status: response.status,
      });
    });

    if (!response.ok || data?.status === false) {
      throw new KorapayApiError({
        message: data?.message ?? `Korapay returned HTTP ${response.status}.`,
        code: "provider_error",
        status: response.status,
      });
    }

    return data as T;
  } catch (err) {
    if (err instanceof KorapayApiError) throw err;
    const isAbort = err instanceof Error && err.name === "AbortError";
    throw new KorapayApiError({
      message: isAbort
        ? `Korapay did not respond within ${TIMEOUT_MS}ms.`
        : `Could not reach Korapay: ${err instanceof Error ? err.message : String(err)}`,
      code: isAbort ? "timeout" : "network",
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Initializes a Checkout Redirect charge. NOT retried automatically — a
 * network failure here means we genuinely don't know whether Korapay
 * created the charge, so blindly retrying risks a duplicate. Callers
 * should surface the error and let the customer try again with a fresh
 * top-up request (and therefore a fresh reference).
 */
export async function initializeKorapayCharge(
  params: KorapayInitializeChargeParams
): Promise<KorapayInitializeChargeResponse> {
  return request<KorapayInitializeChargeResponse>("/charges/initialize", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/** GET is idempotent — safe to call as often as needed to confirm status. */
export async function verifyKorapayCharge(reference: string): Promise<KorapayChargeQueryResponse> {
  return request<KorapayChargeQueryResponse>(`/charges/${encodeURIComponent(reference)}`, {
    method: "GET",
  });
}

/**
 * Per Korapay's docs, the `x-korapay-signature` header is an HMAC-SHA256
 * of ONLY the `data` object (not the whole payload), signed with the
 * merchant secret key — the same key used for API auth, not a separate
 * webhook-signing secret.
 */
export function verifyKorapayWebhookSignature(dataObject: unknown, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const secretKey = getSecretKey();
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(JSON.stringify(dataObject))
    .digest("hex");

  // Constant-time compare to avoid leaking the expected signature via timing.
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
