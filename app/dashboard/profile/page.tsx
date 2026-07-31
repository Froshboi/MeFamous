import { getCurrentUser } from "@/lib/supabase/queries/profile";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Full name</p>
          <p className="mt-1 text-slate-50">{user?.fullName ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
          <p className="mt-1 text-slate-50">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Account type</p>
          <p className="mt-1 capitalize text-slate-50">{user?.role}</p>
        </div>
      </div>
    </div>
  );
}
