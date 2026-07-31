import { MessageCircle, Mail } from "lucide-react";
import { SUPPORT, FOOTER_CREDIT } from "@/lib/constants/brand";

/**
 * Footer for authenticated areas (customer dashboard, admin dashboard).
 * Deliberately minimal: support contact + credit line only. No hero
 * copy, testimonials, pricing, or CTAs — logged-in users have already
 * converted, so the UI stays clean and functional rather than promotional.
 */
export function DashboardFooter() {
  return (
    <footer className="border-t border-white/5 px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
        <p>{FOOTER_CREDIT}</p>
        <div className="flex items-center gap-4">
          <a
            href={SUPPORT.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition hover:text-cyan-400"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {SUPPORT.whatsapp}
          </a>
          <a
            href={`mailto:${SUPPORT.email}`}
            className="flex items-center gap-1.5 transition hover:text-cyan-400"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            {SUPPORT.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
