"use client";

import { useActionState, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { claimCryptoTopupAction, type WalletActionState } from "@/lib/actions/wallet";
import { inputClass, primaryButtonClass } from "@/components/auth/auth-card";

const initialState: WalletActionState = {};

const ASSETS: { value: string; label: string; address?: string }[] = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "USDT_TRC20", label: "USDT (TRC-20)" },
  { value: "USDT_ERC20", label: "USDT (ERC-20)" },
  { value: "LTC", label: "Litecoin (LTC)" },
  { value: "SOL", label: "Solana (SOL)" },
];
const DEFAULT_ASSET = ASSETS[0]!.value;

export function CryptoTopupPanel({ addresses }: { addresses: Record<string, string | undefined> }) {
  const [state, formAction] = useActionState(claimCryptoTopupAction, initialState);
  const [selectedAsset, setSelectedAsset] = useState(DEFAULT_ASSET);
  const address = addresses[selectedAsset];

  return (
    <div className="space-y-4">
      {state.success ? (
        <p className="rounded-lg border border-emerald-900/50 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-300">
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="crypto-asset" className="mb-1 block text-xs text-slate-400">Asset</label>
        <select
          id="crypto-asset"
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
          className={inputClass}
        >
          {ASSETS.map((asset) => (
            <option key={asset.value} value={asset.value}>
              {asset.label}
            </option>
          ))}
        </select>
      </div>

      {address ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <QRCodeSVG value={address} size={140} bgColor="transparent" fgColor="#f8fafc" role="img" aria-label={`QR code for ${selectedAsset} deposit address`} />
          <p className="break-all text-center font-mono text-xs text-slate-300">{address}</p>
        </div>
      ) : (
        <p className="text-sm text-slate-500">This deposit address hasn&apos;t been configured yet.</p>
      )}

      <form action={formAction} className="space-y-3 border-t border-slate-800 pt-4">
        <input type="hidden" name="asset" value={selectedAsset} />
        {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
        <div>
          <label htmlFor="crypto-amount" className="mb-1 block text-xs text-slate-400">Amount sent (USD equivalent)</label>
          <input id="crypto-amount" name="amount" type="number" min={1} step="0.01" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="crypto-tx-note" className="mb-1 block text-xs text-slate-400">Transaction hash / note</label>
          <input id="crypto-tx-note" name="txNote" type="text" required placeholder="0xabc123…" className={inputClass} />
        </div>
        <button type="submit" className={primaryButtonClass}>
          I&apos;ve sent this — submit for review
        </button>
        <p className="text-xs text-slate-500">
          Crypto deposits are confirmed manually against the blockchain by an admin — your wallet is
          credited once confirmed, not instantly.
        </p>
      </form>
    </div>
  );
}
