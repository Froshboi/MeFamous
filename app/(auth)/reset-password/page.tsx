"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthActionState } from "@/lib/actions/auth";
import { AuthCard, FormError, inputClass } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: AuthActionState = {};

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <AuthCard title="Choose a new password" subtitle="Make it something you haven't used before.">
      <form action={formAction} className="space-y-4">
        <FormError message={state.error} />
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-slate-300">
            New password
          </label>
          <input id="password" name="password" type="password" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm text-slate-300">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className={inputClass}
          />
        </div>
        <SubmitButton label="Update password" pendingLabel="Updating…" />
      </form>
    </AuthCard>
  );
}
