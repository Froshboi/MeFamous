import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";
import { BRAND, SUPPORT, FOOTER_CREDIT } from "@/lib/constants/brand";

const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Services", href: "/services" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Order Calculator", href: "/#calculator" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Refund Policy", href: "/legal/refunds" },
    ],
  },
];

/**
 * Full marketing footer — used on the public site only (landing, blog,
 * legal pages). Authenticated dashboard layouts use DashboardFooter
 * instead, which drops all promotional content per product requirements.
 */
export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <span className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {BRAND.name}
            </span>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{BRAND.tagline}</p>

            <div className="mt-6 space-y-2 text-sm">
              <a
                href={SUPPORT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-600 transition hover:text-cyan-500 dark:text-slate-300 dark:hover:text-cyan-400"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {SUPPORT.whatsapp}
              </a>
              <a
                href={`mailto:${SUPPORT.email}`}
                className="flex items-center gap-2 text-slate-600 transition hover:text-cyan-500 dark:text-slate-300 dark:hover:text-cyan-400"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {SUPPORT.email}
              </a>
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 dark:border-white/10 sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">{FOOTER_CREDIT}</p>
        </div>
      </div>
    </footer>
  );
}
