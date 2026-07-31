"use client";

import { useActionState } from "react";
import { placeOrderAction, type PlaceOrderState } from "@/lib/actions/orders";
import { inputClass, primaryButtonClass } from "@/components/auth/auth-card";

const initialState: PlaceOrderState = {};

export function OrderForm({
  serviceId,
  minQuantity,
  maxQuantity,
  ratePerThousand,
}: {
  serviceId: number;
  minQuantity: number;
  maxQuantity: number;
  ratePerThousand: number;
}) {
  const [state, formAction] = useActionState(placeOrderAction, initialState);

  return (
    <form action={formAction} className="space-y-3 border-t border-slate-800 pt-4">
      <input type="hidden" name="serviceId" value={serviceId} />
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-400">Order placed — check your Orders page.</p> : null}
      <div>
        <label htmlFor={`link-${serviceId}`} className="mb-1 block text-xs text-slate-400">
          Link
        </label>
        <input
          id={`link-${serviceId}`}
          name="link"
          type="url"
          required
          placeholder="https://instagram.com/yourprofile"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`quantity-${serviceId}`} className="mb-1 block text-xs text-slate-400">
          Quantity ({minQuantity.toLocaleString()}–{maxQuantity.toLocaleString()})
        </label>
        <input
          id={`quantity-${serviceId}`}
          name="quantity"
          type="number"
          required
          min={minQuantity}
          max={maxQuantity}
          defaultValue={minQuantity}
          className={inputClass}
        />
      </div>
      <p className="text-xs text-slate-500">
        ₦{ratePerThousand.toFixed(2)} per 1,000
      </p>
      <button type="submit" className={primaryButtonClass}>
        Place order
      </button>
    </form>
  );
}
