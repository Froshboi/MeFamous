"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
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
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-[#13131a] dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "#DC2626" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#13131a] md:w-80">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 ? (
                <button
                  disabled={isPending}
                  onClick={() => startTransition(async () => { await markAllNotificationsReadAction(); })}
                  className="flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:text-white"
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </button>
              ) : null}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-8 text-center">
                  <Bell className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                  <p className="mt-2 text-sm font-medium text-slate-400">You&apos;re all caught up.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() =>
                      startTransition(async () => {
                        if (!n.read_at) await markNotificationReadAction(n.id);
                      })
                    }
                    className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/30 ${n.read_at ? "opacity-50" : ""}`}
                  >
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-slate-200 dark:bg-slate-700" : "bg-red-500"}`} />
                    <div className="min-w-0 flex-1">
                      {n.link ? (
                        <Link href={n.link} onClick={(e) => e.stopPropagation()}>
                          <NotificationBody n={n} />
                        </Link>
                      ) : (
                        <NotificationBody n={n} />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function NotificationBody({ n }: { n: NotificationItem }) {
  return (
    <>
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{n.title}</p>
      {n.body ? <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.body}</p> : null}
      <p className="mt-1 text-[11px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</p>
    </>
  );
}
