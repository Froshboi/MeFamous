"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notifications";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export function NotificationBell({ notifications }: { notifications: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-900"
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        aria-haspopup="true"
        aria-expanded={open}
      >
        🔔
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <p className="text-sm font-medium">Notifications</p>
            {unreadCount > 0 ? (
              <button
                disabled={isPending}
                onClick={() => startTransition(async () => { await markAllNotificationsReadAction(); })}
                className="text-xs text-cyan hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">You&apos;re all caught up.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() =>
                    startTransition(async () => {
                      if (!n.read_at) await markNotificationReadAction(n.id);
                    })
                  }
                  className={`block w-full border-b border-slate-800 px-4 py-3 text-left last:border-b-0 hover:bg-slate-800/50 ${
                    n.read_at ? "opacity-60" : ""
                  }`}
                >
                  {n.link ? (
                    <Link href={n.link} className="block">
                      <NotificationBody n={n} />
                    </Link>
                  ) : (
                    <NotificationBody n={n} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NotificationBody({ n }: { n: NotificationItem }) {
  return (
    <>
      <p className="text-sm font-medium text-slate-50">{n.title}</p>
      {n.body ? <p className="mt-0.5 text-xs text-slate-400">{n.body}</p> : null}
      <p className="mt-1 text-[11px] text-slate-500">{new Date(n.created_at).toLocaleString()}</p>
    </>
  );
}
