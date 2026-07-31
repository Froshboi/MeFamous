/**
 * MeFamous brand constants.
 * Single source of truth — import from here rather than hardcoding
 * colors, copy, or contact details anywhere else in the app.
 */

export const BRAND = {
  name: "MeFamous",
  tagline: "Instant Social Authority, Engineered for Impact.",
  colors: {
    deepSlate: "#0F172A",
    electricViolet: "#7C3AED",
    neonCyan: "#06B6D4",
  },
  fonts: {
    display: "Geist",
    body: "Inter",
  },
} as const;

export const SUPPORT = {
  whatsapp: "+234 901 853 6491",
  whatsappHref: "https://wa.me/2349018536491",
  email: "Trotskybuilds@gmail.com",
} as const;

export const FOOTER_CREDIT = "Built By Trotskybuilds Technology - We build Ideas";
