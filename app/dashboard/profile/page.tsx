import { createClient } from "@/lib/supabase/server";
import { ProfileSettingsForm } from "@/components/dashboard/profile-settings-form";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url, referral_code, referred_by, role, wallet_balance")
    .eq("id", user.id)
    .single();

  const { count: referralCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", user.id);

  const { data: referralEarnings } = await supabase
    .from("referral_rewards")
    .select("amount")
    .eq("referrer_id", user.id);

  const totalEarnings = referralEarnings?.reduce((sum, r) => sum + Number(r.amount || 0), 0) ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Profile & Settings</h1>
        <p className="text-sm text-slate-400">Manage your account, security, and referrals.</p>
      </div>

      <ProfileSettingsForm
        userId={user.id}
        email={user.email ?? ""}
        fullName={profile?.full_name ?? ""}
        avatarUrl={profile?.avatar_url ?? null}
        referralCode={profile?.referral_code ?? ""}
        referralCount={referralCount ?? 0}
        referralEarnings={totalEarnings}
        walletBalance={profile?.wallet_balance ?? 0}
      />
    </div>
  );
}
