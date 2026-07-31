"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveTopupAction, rejectTopupAction } from "@/lib/actions/wallet-admin";

export function TopupReviewActions({ reference }: { reference: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await approveTopupAction(reference);
            router.refresh();
          })
        }
        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await rejectTopupAction(reference);
            router.refresh();
          })
        }
        className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
