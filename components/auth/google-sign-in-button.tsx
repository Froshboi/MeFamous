import { signInWithGoogleAction } from "@/lib/actions/auth";

export function GoogleSignInButton() {
  return (
    <form action={signInWithGoogleAction}>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-50 transition hover:bg-slate-900"
      >
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.3 5.1 29.4 3 24 3 16.1 3 9.3 7.4 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 45c5.3 0 10.1-2 13.7-5.4l-6.3-5.2C29.4 36 26.8 37 24 37c-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.2 40.6 16 45 24 45z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.3 5.2C41 35.9 44 30.4 44 24c0-1.4-.1-2.4-.4-3.5z"/>
        </svg>
        Continue with Google
      </button>
    </form>
  );
}
