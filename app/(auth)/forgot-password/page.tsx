"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type AuthActionState } from "@/lib/actions/auth";
import { AuthCard, FormError, FormSuccess, inputClass } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: AuthActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialState);

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll email you a link to get back in."
      footer={
        <Link href="/login" className="font-medium text-cyan hover:underline">
          Back to sign in
        </Link>
      }
    >
      {state.success ? (
        <FormSuccess message={state.message} />
      ) : (
        <form action={formAction} className="space-y-4">
          <FormError message={state.error} />
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
              Email
            </label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
          <SubmitButton label="Send reset link" pendingLabel="Sending…" />
        </form>
      )}
    </AuthCard>
  );
}
