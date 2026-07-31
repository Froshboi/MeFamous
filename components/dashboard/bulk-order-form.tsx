"use client";

import { useActionState } from "react";
import { bulkPlaceOrdersAction, type BulkOrderState } from "@/lib/actions/orders";
import { inputClass, primaryButtonClass } from "@/components/auth/auth-card";

const initialState: BulkOrderState = {};

export function BulkOrderForm({
  services,
}: {
  services: { id: number; name: string; category: string }[];
}) {
  const [state, formAction] = useActionState(bulkPlaceOrdersAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <div>
        <label htmlFor="bulk-service" className="mb-1 block text-xs text-slate-400">Service</label>
        <select id="bulk-service" name="serviceId" required className={inputClass}>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.category} — {service.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="bulk-lines" className="mb-1 block text-xs text-slate-400">
          Orders — one per line: <code>link,quantity</code>
        </label>
        <textarea
          id="bulk-lines"
          name="lines"
          required
          rows={8}
          placeholder={"https://instagram.com/client1,1000\nhttps://instagram.com/client2,2000"}
          className={`${inputClass} font-mono text-xs`}
        />
        <p className="mt-1 text-xs text-slate-500">Up to 50 lines per submission.</p>
      </div>
      <button type="submit" className={primaryButtonClass}>
        Submit bulk order
      </button>

      {state.results ? (
        <div className="mt-4 space-y-1 rounded-lg border border-slate-800 bg-slate-950 p-3">
          {state.results.map((r, i) => (
            <p key={i} className={`text-xs ${r.success ? "text-emerald-400" : "text-red-400"}`}>
              {r.success ? "✓" : "✗"} {r.line} — {r.message}
            </p>
          ))}
        </div>
      ) : null}
    </form>
  );
}
