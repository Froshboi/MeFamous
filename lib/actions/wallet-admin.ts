"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { notifyTopupCompleted } from "@/lib/actions/notify-topup";

export type WalletAdminActionState = { error?: string; success?: boolean };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    throw new Error("Admin access required");
  }
}

export async function approveTopupAction(reference: string): Promise<WalletAdminActionState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { error } = await admin.rpc("credit_wallet_topup", { p_reference: reference });
    if (error) throw error;
    await notifyTopupCompleted(reference);
    revalidatePath("/admin/wallet-topups");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not approve this top-up." };
  }
}

export async function rejectTopupAction(reference: string): Promise<WalletAdminActionState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { error } = await admin.rpc("fail_wallet_topup", { p_reference: reference });
    if (error) throw error;
    revalidatePath("/admin/wallet-topups");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not reject this top-up." };
  }
}
