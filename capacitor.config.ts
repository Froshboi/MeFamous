import type { CapacitorConfig } from "@capacitor/cli";

/**
 * MeFamous is a server-rendered Next.js app (Server Actions, Supabase
 * auth cookies, Vercel Cron, webhooks) — none of that can run inside a
 * WebView. So this config does NOT bundle a static export as the app;
 * `server.url` points the native shell straight at the deployed site,
 * and the WebView is effectively a branded browser for it. `webDir`
 * still has to point at *something* on disk (Capacitor requires it),
 * but mobile/www/index.html is only ever seen if server.url fails to
 * load (e.g. no network on first launch).
 *
 * Before building, replace the URL below with your real production
 * domain (and consider using a custom scheme + universal links /
 * app links instead of a bare https URL for a more "native" feel).
 */
const config: CapacitorConfig = {
  appId: "com.mefamous.app",
  appName: "MeFamous",
  webDir: "mobile/www",
  server: {
    url: process.env.MOBILE_APP_URL ?? "https://mefamous.vercel.app",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
