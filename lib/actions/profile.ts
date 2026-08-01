"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().min(2).max(100),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

const changePasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ProfileActionState = { error?: string; success?: boolean; message?: string };

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const parsed = updateProfileSchema.safeParse({
    userId: formData.get("userId"),
    fullName: formData.get("fullName"),
    avatarUrl: formData.get("avatarUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      avatar_url: parsed.data.avatarUrl || null,
    })
    .eq("id", parsed.data.userId);

  if (error) return { error: "Could not update profile" };
  return { success: true, message: "Profile updated" };
}

export async function changePasswordAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const parsed = changePasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (error) return { error: error.message };
  return { success: true, message: "Password changed" };
}
