import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries/profile";

export default async function ReferralsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: profile } = user
    ? await supabase.from("profiles").select("referral_code").eq("id", user.id).single()
    : { data: null };

  const { data: referredUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("referred_by", user?.id ?? "");

  const { data: rewards } = await supabase
    .from("referral_rewards")
    .select("id, amount, created_at")
    .order("created_at", { ascending: false });

  const totalEarned = (rewards ?? []).reduce((sum, r) => sum + r.amount, 0);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const referralLink = profile ? `${appUrl}/signup?ref=${profile.referral_code}` : "";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Referrals</h1>
        <p className="text-sm text-slate-400">
          Share your link — when someone signs up and tops up their wallet for the first time, you
          earn a bonus.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Your code</p>
          <p className="mt-2 font-mono text-lg">{profile?.referral_code ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Referred users</p>
          <p className="mt-2 text-2xl font-semibold">{referredUsers?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total earned</p>
          <p className="mt-2 text-2xl font-semibold">${totalEarned.toFixed(2)}</p>
        </div>
      </div>

      {referralLink ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Your referral link</p>
          <p className="break-all rounded-lg bg-slate-950 px-3 py-2 font-mono text-sm text-cyan">
            {referralLink}
          </p>
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-lg font-medium">Referred users</h2>
        {!referredUsers || referredUsers.length === 0 ? (
          <p className="text-sm text-slate-400">No one has signed up with your code yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/70 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {referredUsers.map((r) => (
                  <tr key={r.id} className="border-t border-slate-800">
                    <td className="px-4 py-3">{r.full_name ?? r.email}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
