"use client";

import { useState } from "react";
import Link from "next/link";

export function WelcomeBanner({
  fullName,
  hasOrders,
  hasWalletTopup,
}: {
  fullName: string;
  hasOrders: boolean;
  hasWalletTopup: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const steps = [
    { done: true, label: "Create account" },
    { done: hasWalletTopup, label: "Add funds", href: "/dashboard/wallet" },
    { done: hasOrders, label: "Place first order", href: "/dashboard/services" },
  ];

  const completed = steps.filter((s) => s.done).length;
  const progress = Math.round((completed / steps.length) * 100);

  return (
    <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-950/50 to-slate-900 p-5">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-xs text-slate-500 hover:text-slate-300"
      >
        ✕
      </button>
      
      <h2 className="text-lg font-semibold text-slate-50">
        Welcome{fullName ? `, ${fullName.split(" ")[0]}` : ""}! 👋
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Complete your setup to start growing your social presence.
      </p>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-violet-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex gap-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${step.done ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
              {step.done ? "✓" : i + 1}
            </span>
            {step.href && !step.done ? (
              <Link href={step.href} className="text-xs text-violet-400 hover:underline">
                {step.label}
              </Link>
            ) : (
              <span className={`text-xs ${step.done ? "text-slate-500 line-through" : "text-slate-400"}`}>
                {step.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
