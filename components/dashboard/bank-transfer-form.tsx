"use client";

import { useActionState } from "react";
import { submitBankTransferAction, type WalletActionState } from "@/lib/actions/wallet";
import { inputClass, primaryButtonClass } from "@/components/auth/auth-card";

const initialState: WalletActionState = {};

export function BankTransferForm() {
  const [state, formAction] = useActionState(submitBankTransferAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-emerald-400">
          {state.message ?? "Submitted! We'll credit your wallet once confirmed."}
        </p>
      ) : null}

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <p className="text-sm font-medium text-slate-200">OPay</p>
        <p className="mt-1 text-sm text-slate-400">Account: <span className="font-mono text-slate-200">9060303273</span></p>
        <p className="text-sm text-slate-400">Name: <span className="text-slate-200">Chidomile Trotsky</span></p>
      </div>

      <div>
        <label htmlFor="amount" className="mb-1 block text-xs text-slate-400">
          Amount (₦)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min={100}
          required
          placeholder="1000"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="senderName" className="mb-1 block text-xs text-slate-400">
          Sender name (as shown on your transfer)
        </label>
        <input
          id="senderName"
          name="senderName"
          type="text"
          required
          placeholder="John Doe"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="txNote" className="mb-1 block text-xs text-slate-400">
          Transaction reference / note
        </label>
        <input
          id="txNote"
          name="txNote"
          type="text"
          required
          placeholder="TRF-123456 or last 4 digits of account"
          className={inputClass}
        />
      </div>

      <button type="submit" className={primaryButtonClass}>
        Submit for verification
      </button>
    </form>
  );
}
