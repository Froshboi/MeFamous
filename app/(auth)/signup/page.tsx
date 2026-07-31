"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "@/lib/actions/auth";
import { AuthCard, FormError, FormSuccess, inputClass } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/auth/submit-button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const initialState: AuthActionState = {};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);
  const searchParams = useSearchParams();
  const prefilledRef = searchParams.get("ref") ?? "";

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start growing your socials or start reselling in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-cyan hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {state.success ? (
        <FormSuccess message={state.message} />
      ) : (
        <>
          <div className="mb-4 space-y-4">
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
            <label htmlFor="fullName" className="mb-1 block text-sm text-slate-300">
              Full name
            </label>
            <input id="fullName" name="fullName" type="text" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
              Email
            </label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-slate-300">
              Password
            </label>
            <input id="password" name="password" type="password" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm text-slate-300">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="role" className="mb-1 block text-sm text-slate-300">
              Account type
            </label>
            <select id="role" name="role" defaultValue="customer" className={inputClass}>
              <option value="customer">Customer — order social growth services</option>
              <option value="reseller">Reseller — resell to my own clients</option>
            </select>
          </div>
          <div>
            <label htmlFor="referralCode" className="mb-1 block text-sm text-slate-300">
              Referral code <span className="text-slate-500">(optional)</span>
            </label>
            <input id="referralCode" name="referralCode" type="text" defaultValue={prefilledRef} className={inputClass} />
          </div>
          <SubmitButton label="Create account" pendingLabel="Creating account…" />
        </form>
        </>
      )}
    </AuthCard>
  );
}
