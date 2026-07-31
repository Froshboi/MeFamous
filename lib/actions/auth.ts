"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

export type AuthActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

function firstIssueMessage(issues: { message: string }[]): string {
  return issues[0]?.message ?? "Please check the form and try again.";
}

// Helper to get the app URL reliably on server
async function getAppUrl(): Promise<string> {
  // Try env var first
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl;

  // Fallback to request headers (for server actions)
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role") || "customer",
    referralCode: formData.get("referralCode") || "",
  });

  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error.issues) };
  }

  const { fullName, email, password, role, referralCode } = parsed.data;
  const supabase = await createClient();
  const appUrl = await getAppUrl();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback?next=/dashboard`,
      data: {
        full_name: fullName,
        requested_role: role,
        referral_code: referralCode || null,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Check your email to confirm your account before signing in.",
  };
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signInWithGoogleAction(): Promise<void> {
  const supabase = await createClient();
  const appUrl = await getAppUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { 
      redirectTo: `${appUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=google-oauth-failed");
  }

  redirect(data.url);
}

  if (error || !data.url) {
    return { error: "Google sign-in failed. Please try again." };
  }

  // Return the URL instead of redirecting — let the client handle it
  // This avoids server action redirect issues
  redirect(data.url);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error.issues) };
  }

  const supabase = await createClient();
  const appUrl = await getAppUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "If an account exists for that email, a reset link is on its way.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?resetSuccess=1");
}
