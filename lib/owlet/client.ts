import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { OwletApiError, type OwletAction } from "./types";

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 400;

type OwletParams = Record<string, string | number | boolean | undefined>;

function getConfig() {
  const url = process.env.OWLET_API_URL;
  const key = process.env.OWLET_API_KEY;

  if (!url || !key) {
    throw new OwletApiError({
      message:
        "Owlet API is not configured — set OWLET_API_URL and OWLET_API_KEY in your environment.",
      code: "not_configured",
      action: "balance",
    });
  }

  return { url, key };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function logRequest(entry: {
  action: OwletAction;
  params: OwletParams;
  status: "success" | "error";
  httpStatus?: number;
  errorMessage?: string;
  durationMs: number;
}) {
  try {
    const supabase = createAdminClient();
    // `key` (the API credential) is never logged.
    const { key: _omit, ...safeParams } = entry.params as OwletParams & { key?: unknown };
    await supabase.from("provider_api_logs").insert({
      provider: "owlet",
      action: entry.action,
      request_params: safeParams,
      success: entry.status === "success",
      http_status: entry.httpStatus ?? null,
      error_message: entry.errorMessage ?? null,
      duration_ms: entry.durationMs,
    });
  } catch (loggingError) {
    // Logging must never take down a real API call.
    console.error("[owlet] failed to write API log", loggingError);
  }
}

/**
 * Calls a single The-Owlet API action with retry, timeout, and rate-limit
 * handling. Every call is logged (to `provider_api_logs`, credentials
 * redacted) regardless of outcome.
 */
export async function callOwlet<T>(
  action: OwletAction,
  params: OwletParams = {},
  options: { timeoutMs?: number } = {}
): Promise<T> {
  const { url, key } = getConfig();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const body = new URLSearchParams();
  body.set("key", key);
  body.set("action", action);
  for (const [paramKey, value] of Object.entries(params)) {
    if (value !== undefined) body.set(paramKey, String(value));
  }

  let lastError: OwletApiError | null = null;
  const startedAt = Date.now();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timer);

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get("retry-after");
        const retryAfterMs = retryAfterHeader
          ? Number(retryAfterHeader) * 1000
          : BASE_BACKOFF_MS * 2 ** attempt;

        lastError = new OwletApiError({
          message: "The-Owlet API rate-limited this request.",
          code: "rate_limited",
          action,
          status: 429,
        });

        if (attempt < MAX_ATTEMPTS) {
          await sleep(Math.min(retryAfterMs, 10_000));
          continue;
        }
        break;
      }

      if (!response.ok) {
        lastError = new OwletApiError({
          message: `The-Owlet API returned HTTP ${response.status}.`,
          code: "http_error",
          action,
          status: response.status,
        });

        if (response.status >= 500 && attempt < MAX_ATTEMPTS) {
          await sleep(BASE_BACKOFF_MS * 2 ** attempt);
          continue;
        }
        break;
      }

      const data = await response.json().catch(() => {
        throw new OwletApiError({
          message: "The-Owlet API returned a response that was not valid JSON.",
          code: "invalid_response",
          action,
          status: response.status,
        });
      });

      // Single-object provider error, e.g. { "error": "Incorrect API key" }
      if (data && typeof data === "object" && !Array.isArray(data) && "error" in data) {
        lastError = new OwletApiError({
          message: String((data as { error: string }).error),
          code: "provider_error",
          action,
          status: response.status,
        });
        break; // provider-level errors are not transient — don't retry
      }

      await logRequest({
        action,
        params,
        status: "success",
        httpStatus: response.status,
        durationMs: Date.now() - startedAt,
      });

      return data as T;
    } catch (err) {
      clearTimeout(timer);

      if (err instanceof OwletApiError) {
        lastError = err;
        break;
      }

      const isAbort = err instanceof Error && err.name === "AbortError";
      lastError = new OwletApiError({
        message: isAbort
          ? `The-Owlet API did not respond within ${timeoutMs}ms.`
          : `Could not reach The-Owlet API: ${err instanceof Error ? err.message : String(err)}`,
        code: isAbort ? "timeout" : "network",
        action,
      });

      if (attempt < MAX_ATTEMPTS) {
        await sleep(BASE_BACKOFF_MS * 2 ** attempt);
        continue;
      }
    }
  }

  await logRequest({
    action,
    params,
    status: "error",
    httpStatus: lastError?.status,
    errorMessage: lastError?.message,
    durationMs: Date.now() - startedAt,
  });

  throw (
    lastError ??
    new OwletApiError({ message: "Unknown Owlet API failure.", code: "network", action })
  );
}
