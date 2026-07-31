import "server-only";
import {
  getOwletServices,
  addOwletOrder,
  getOwletMultiOrderStatus,
  cancelOwletOrders,
  getOwletBalance,
} from "@/lib/owlet/service";
import { mapOwletStatus } from "@/lib/owlet/status-map";
import { OwletApiError } from "@/lib/owlet/types";
import { ProviderApiError, type SmmProvider, type ProviderService, type NormalizedOrderStatus } from "./types";

interface RawStatusResult {
  status: string;
  charge: string;
  start_count: string;
  remains: string;
  currency: string;
}

export class OwletProvider implements SmmProvider {
  readonly key = "owlet";
  readonly displayName = "The-Owlet";

  async getServices(options?: { skipCache?: boolean }): Promise<ProviderService[]> {
    const services = await this.wrap(() => getOwletServices(options));
    return services.map((s) => ({
      providerServiceId: String(s.service),
      name: s.name,
      type: s.type,
      category: s.category,
      rate: Number(s.rate),
      min: Number(s.min),
      max: Number(s.max),
      refill: s.refill,
      cancel: s.cancel,
    }));
  }

  async addOrder(params: { providerServiceId: string; link: string; quantity: number }) {
    const result = await this.wrap(() =>
      addOwletOrder({
        service: Number(params.providerServiceId),
        link: params.link,
        quantity: params.quantity,
      })
    );
    return { providerOrderId: String(result.order) };
  }

  async getMultiOrderStatus(providerOrderIds: string[]) {
    const numericIds = providerOrderIds.map(Number);
    const statuses = await this.wrap(() => getOwletMultiOrderStatus(numericIds));

    const normalized: Record<
      string,
      { status: NormalizedOrderStatus; charge: number; startCount: string | null; remains: string | null; currency: string } | { error: string }
    > = {};

    for (const [id, result] of Object.entries(statuses)) {
      normalized[id] = "error" in result ? result : this.normalizeStatus(result as RawStatusResult);
    }
    return normalized;
  }

  async cancelOrders(providerOrderIds: string[]): Promise<void> {
    await this.wrap(() => cancelOwletOrders(providerOrderIds.map(Number)));
  }

  async getBalance() {
    const balance = await this.wrap(() => getOwletBalance());
    return { balance: Number(balance.balance), currency: balance.currency };
  }

  private normalizeStatus(result: RawStatusResult) {
    return {
      status: mapOwletStatus(result.status),
      charge: Number(result.charge),
      startCount: result.start_count,
      remains: result.remains,
      currency: result.currency,
    };
  }

  private async wrap<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof OwletApiError) {
        throw new ProviderApiError({ message: err.message, provider: this.key, code: err.code });
      }
      throw err;
    }
  }
}
