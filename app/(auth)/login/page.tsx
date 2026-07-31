"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type AuthActionState } from "@/lib/actions/auth";
import { AuthCard, FormError, inputClass } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/auth/submit-button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const initialState: AuthActionState = {};

export default function LoginPage() {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to manage your orders and wallet."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-cyan hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <GoogleSignInButton />
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-slate-800" />
          or
          <div className="h-px flex-1 bg-slate-800" />
        </div>
      </div>
      <form action={formAction} className="space-y-4">
        <FormError message={state.error} />
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
            Email
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm text-slate-300">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-cyan hover:underline">
              Forgot password?
            </Link>
          </div>
          <input id="password" name="password" type="password" required className={inputClass} />
        </div>
        <SubmitButton label="Sign in" pendingLabel="Signing in…" />
      </form>
    </AuthCard>
  );
}
