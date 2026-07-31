"use client";

import { useActionState } from "react";
import { initiateKorapayTopupAction, type WalletActionState } from "@/lib/actions/wallet";
import { inputClass, primaryButtonClass } from "@/components/auth/auth-card";

const initialState: WalletActionState = {};

export function KorapayTopupForm() {
  const [state, formAction] = useActionState(initiateKorapayTopupAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <div>
        <label htmlFor="korapay-amount" className="mb-1 block text-xs text-slate-400">
          Amount (NGN)
        </label>
        <input id="korapay-amount" name="amount" type="number" min={100} step={1} required className={inputClass} />
      </div>
      <button type="submit" className={primaryButtonClass}>
        Pay with Korapay
      </button>
      <p className="text-xs text-slate-500">Card, bank transfer, or Pay with Bank — you&apos;ll choose on the next screen.</p>
    </form>
  );
}
