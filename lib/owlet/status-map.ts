import type { OrderStatus } from "@/types/database";

/**
 * The-Owlet returns status as free text (see the documented example
 * values: "Partial", "In progress", plus the common SMM-panel set this
 * API family uses: "Pending", "Processing", "Completed", "Canceled").
 * This maps that text onto our fixed `orders.status` enum; anything
 * unrecognized falls back to 'in_progress' rather than guessing wrong.
 */
export function mapOwletStatus(providerStatus: string): OrderStatus {
  const normalized = providerStatus.trim().toLowerCase();

  switch (normalized) {
    case "pending":
      return "pending";
    case "in progress":
    case "processing":
      return "in_progress";
    case "partial":
      return "partial";
    case "completed":
      return "completed";
    case "canceled":
    case "cancelled":
      return "cancelled";
    default:
      return "in_progress";
  }
}
