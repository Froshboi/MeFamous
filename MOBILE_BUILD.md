# Mobile app bundling (Android APK + iOS IPA)

## First, an important correction: IPSW is not an app format

**IPSW is Apple's full device *firmware/restore image* format** — the file
used to flash or restore an entire iPhone/iPad's operating system in
Finder/iTunes or via `apple-configurator`. It is not something individual
apps are packaged into, and there is no tool that "bundles an app as an
IPSW" — that request isn't a smaller version of something bigger, it's a
different thing than what you build for an app.

What you almost certainly want instead is an **IPA** (`.ipa`) — Apple's
actual app-distribution package format, the iOS equivalent of an APK.
Everything below produces an IPA, not an IPSW.

## Why this can't be a fully offline/native rewrite

MeFamous is a server-rendered Next.js app — Server Actions, Supabase auth
cookies, Vercel Cron, Owlet/Korapay webhooks. None of that can execute
inside a phone's WebView; it needs a live Next.js server. So this project
uses **Capacitor** to wrap the *deployed* web app in a native shell rather
than trying to reimplement the whole backend on-device:

- `capacitor.config.ts` → `server.url` points the native shell at your
  production URL (`MOBILE_APP_URL` env var, defaults to
  `https://mefamous.vercel.app` — **change this to your real domain**).
- `mobile/www/index.html` is a fallback only seen if that URL fails to
  load on first launch (e.g. no network) — it is not the app itself.
- `android/` and `ios/` (already scaffolded via `npx cap add android` /
  `npx cap add ios`) are real native projects that host that WebView.

This gives you an installable, app-store-distributable app with almost no
extra code to maintain — but it is a WebView wrapper, not a from-scratch
native rewrite. If you want genuinely native navigation/animations later,
that's a much larger separate project (React Native / native Swift+Kotlin),
not a bundling step.

## Before building anything

1. Deploy MeFamous to Vercel first — the native shell just loads that URL.
2. Update `capacitor.config.ts` → `server.url` (or set `MOBILE_APP_URL`)
   to your real production domain.
3. `npm install && npm run cap:sync` after any config change, to push it
   into the native projects.

## Building the Android APK

Requires: **Android Studio** (or just the Android SDK command-line
tools) and a JDK — this repo was scaffolded with JDK 21. None of this
can be done in a sandboxed CI container without network access to
`dl.google.com` / `services.gradle.org` — do this on a normal dev
machine or a real CI runner (GitHub Actions, Codemagic, etc.) with that
access.

```bash
npm run cap:sync
npm run cap:open:android   # opens android/ in Android Studio
```

From Android Studio: **Build → Generate Signed Bundle / APK → APK**,
create/select a keystore, choose `release`, build. Or from the command
line once you have a signing config set up in `android/app/build.gradle`:

```bash
cd android
./gradlew assembleRelease
# output: android/app/build/outputs/apk/release/app-release.apk
```

An **unsigned debug APK** (fine for sideloading/testing, not for the
Play Store) needs no signing setup at all:

```bash
cd android
./gradlew assembleDebug
# output: android/app/build/outputs/apk/debug/app-debug.apk
```

## Building the iOS IPA

**Requires macOS + Xcode + a paid Apple Developer Program membership
($99/year).** Apple does not allow building or signing iOS apps on
Linux or Windows — there's no way around this step, from this sandbox
or any other non-Mac environment.

```bash
npm run cap:sync
npm run cap:open:ios       # opens ios/App/App.xcworkspace in Xcode
```

In Xcode:
1. Select the `App` target → **Signing & Capabilities** → choose your
   Apple Developer team, set a unique Bundle Identifier
   (`com.mefamous.app` is the placeholder in `capacitor.config.ts` —
   change it to something you actually own).
2. **Product → Archive**.
3. In the Organizer window that opens: **Distribute App** → choose App
   Store Connect (for TestFlight/App Store) or Ad Hoc/Enterprise (for
   direct install) → follow the export wizard.
4. The exported `.ipa` is what you upload to App Store Connect or
   install via Apple Configurator / TestFlight.

## What I could and couldn't do for you here

- ✅ Added Capacitor config, npm scripts, and scaffolded real
  `android/` and `ios/` native projects (`npx cap add android` / `ios`
  ran successfully in this environment).
- ❌ Could not compile an actual `.apk` or `.ipa` in this sandbox —
  Gradle's own distribution download is blocked by this environment's
  network allowlist (confirmed: `services.gradle.org` returns 403
  here), and iOS builds require Xcode on macOS, which doesn't exist in
  any Linux sandbox. Both builds need to happen on your machine or in
  a proper CI runner using the commands above.
