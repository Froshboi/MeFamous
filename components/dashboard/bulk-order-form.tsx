"use client";

import { useActionState, useState, useMemo } from "react";
import { bulkPlaceOrdersAction, type BulkOrderState } from "@/lib/actions/orders";
import { inputClass, primaryButtonClass } from "@/components/auth/auth-card";
import { getPlatformPlaceholder } from "@/lib/platform-branding";

const initialState: BulkOrderState = {};

type Service = { id: number; name: string; category: string; customer_rate: number; min_quantity: number; max_quantity: number };

export function BulkOrderForm({ services }: { services: Service[] }) {
  const [state, formAction] = useActionState(bulkPlaceOrdersAction, initialState);
  const [lines, setLines] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  const selectedService = services.find((s) => s.id === Number(selectedServiceId));

  const parsedLines = useMemo(() => {
    if (!lines.trim() || !selectedService) return [];
    return lines
      .trim()
      .split("\n")
      .map((line, i) => {
        const [link, qtyStr] = line.split(",").map((s) => s.trim());
        const qty = Number(qtyStr);
        const isValid =
          link &&
          link.startsWith("http") &&
          !isNaN(qty) &&
          qty >= selectedService.min_quantity &&
          qty <= selectedService.max_quantity;
        return {
          line: i + 1,
          link,
          quantity: qty,
          isValid,
          cost: isValid ? (qty / 1000) * selectedService.customer_rate : 0,
        };
      });
  }, [lines, selectedService]);

  const validLines = parsedLines.filter((l) => l.isValid);
  const totalCost = validLines.reduce((sum, l) => sum + l.cost, 0);

  // Group services by category for the dropdown
  const groupedServices = useMemo(() => {
    const groups = new Map<string, Service[]>();
    services.forEach((s) => {
      const list = groups.get(s.category) ?? [];
      list.push(s);
      groups.set(s.category, list);
    });
    return groups;
  }, [services]);

  // Dynamic placeholder based on selected service
  const placeholder = useMemo(() => {
    const base = selectedService ? getPlatformPlaceholder(selectedService.category) : "https://instagram.com/yourprofile";
    // Replace "yourprofile" with sample usernames for bulk format
    const url1 = base.replace("yourprofile", "user1").replace("1234567890", "1234567890");
    const url2 = base.replace("yourprofile", "user2").replace("1234567890", "2345678901");
    const url3 = base.replace("yourprofile", "user3").replace("1234567890", "3456789012");
    return `${url1}, 1000\n${url2}, 2000\n${url3}, 500`;
  }, [selectedService]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20 text-lg">⚡</div>
          <div>
            <h3 className="font-medium text-slate-50">Bulk Order</h3>
            <p className="text-xs text-slate-400">Place multiple orders at once</p>
          </div>
        </div>
      </div>

      {/* Service Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">Select service</label>
        <select
          name="serviceId"
          required
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className={`${inputClass} appearance-none bg_[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10`}
        >
          <option value="">Choose a service...</option>
          {[...groupedServices.entries()].map(([category, catServices]) => (
            <optgroup key={category} label={category} className="bg-slate-900 text-slate-300">
              {catServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {selectedService && (
          <p className="mt-1.5 text-xs text-slate-500">
            ₦{selectedService.customer_rate.toFixed(2)} per 1,000 — Min {selectedService.min_quantity.toLocaleString()} — Max {selectedService.max_quantity.toLocaleString()}
          </p>
        )}
      </div>

      {/* Order Lines */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Order list</label>
          <span className="text-xs text-slate-500">One per line: link, quantity</span>
        </div>

        <div className="relative">
          <textarea
            name="lines"
            required
            rows={10}
            value={lines}
            onChange={(e) => setLines(e.target.value)}
            placeholder={placeholder}
            className={`${inputClass} font-mono text-sm leading-relaxed`}
          />
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500">
              {parsedLines.length} / 50
            </span>
          </div>
        </div>

        {/* Live Preview */}
        {parsedLines.length > 0 && (
          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/50">
            <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
              <span className="text-xs font-medium text-slate-400">Preview</span>
              <span className={`text-xs ${validLines.length === parsedLines.length ? "text-emerald-400" : "text-amber-400"}`}>
                {validLines.length} valid {validLines.length !== parsedLines.length && `— ${parsedLines.length - validLines.length} invalid`}
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto p-2">
              {parsedLines.map((l) => (
                <div
                  key={l.line}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs ${
                    l.isValid ? "text-slate-300" : "bg-red-500/10 text-red-400"
                  }`}
                >
                  <span className="w-5 text-right text-slate-600">{l.line}.</span>
                  <span className="flex-1 truncate">{l.link}</span>
                  <span className="font-mono text-slate-400">{l.quantity.toLocaleString()}</span>
                  {l.isValid && <span className="text-slate-600">₦{l.cost.toFixed(2)}</span>}
                  <span className="w-4">{l.isValid ? "✅" : "❌"}</span>
                </div>
              ))}
            </div>
            {totalCost > 0 && (
              <div className="border-t border-slate-800 px-3 py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Estimated total</span>
                  <span className="font-medium text-slate-50">₦{totalCost.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={validLines.length === 0}
        className={`${primaryButtonClass} w-full ${validLines.length === 0 ? "opacity-50" : ""}`}
      >
        Submit {validLines.length > 0 && `${validLines.length} order${validLines.length > 1 ? "s" : ""}`}
      </button>

      {/* Results */}
      {state.error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}

      {state.results && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-medium text-slate-50">Results</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
              {state.results.filter((r) => r.success).length} / {state.results.length} success
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {state.results.map((r, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                  r.success
                    ? "border border-emerald-500/20 bg-emerald-500/10"
                    : "border border-red-500/20 bg-red-500/10"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${r.success ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="flex-1 truncate text-slate-300">{r.line}</span>
                <span className={r.success ? "text-emerald-400" : "text-red-400"}>{r.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
