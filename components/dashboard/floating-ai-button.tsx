"use client";

import { useState } from "react";

export function FloatingAIButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-lg shadow-lg shadow-violet-900/40 transition hover:scale-110 hover:bg-violet-500 md:bottom-6"
        aria-label="MeFamous AI"
      >
        ✨
      </button>

      {open && (
        <div className="fixed bottom-36 right-4 z-50 w-72 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl md:bottom-24">
          <div className="flex items-center justify-between">
            <p className="font-medium text-slate-50">MeFamous AI</p>
            <button onClick={() => setOpen(false)} className="text-xs text-slate-500">✕</button>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Our AI assistant is coming soon! It will help you pick the best services, track orders, and optimize your growth strategy even offer support.
          </p>
          <div className="mt-3 rounded-lg bg-slate-800/50 p-2 text-center text-xs text-slate-500">
            🚧 Coming in the next update
          </div>
        </div>
      )}
    </>
  );
}
