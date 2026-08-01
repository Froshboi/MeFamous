"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, changePasswordAction, uploadAvatarAction } from "@/lib/actions/profile";
import { inputClass, primaryButtonClass } from "@/components/auth/auth-card";

type ProfileState = { error?: string; success?: boolean; message?: string };

export function ProfileSettingsForm({
  userId,
  email,
  fullName,
  avatarUrl,
  referralCode,
  referralCount,
  referralEarnings,
  walletBalance,
}: {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  walletBalance: number;
}) {
  const [profileState, profileAction] = useActionState(updateProfileAction, {});
  const [passwordState, passwordAction] = useActionState(changePasswordAction, {});
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);

  return (
    <div className="space-y-6">
      {/* Avatar & Basic Info */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-lg font-medium">Profile</h2>
        
        <div className="mb-4 flex items-center gap-4">
          <div className="relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-600 text-xl">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-slate-50">{fullName}</p>
            <p className="text-sm text-slate-400">{email}</p>
          </div>
        </div>

        <form action={profileAction} className="space-y-4">
          {profileState.success && <p className="text-sm text-emerald-400">Profile updated!</p>}
          {profileState.error && <p className="text-sm text-red-400">{profileState.error}</p>}
          
          <input type="hidden" name="userId" value={userId} />
          
          <div>
            <label className="mb-1 block text-xs text-slate-400">Full name</label>
            <input name="fullName" defaultValue={fullName} className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Profile picture URL</label>
            <input 
              name="avatarUrl" 
              defaultValue={avatarUrl ?? ""} 
              placeholder="https://..."
              className={inputClass}
              onChange={(e) => setAvatarPreview(e.target.value || null)}
            />
            <p className="mt-1 text-xs text-slate-500">Paste an image URL or upload via Supabase Storage</p>
          </div>

          <button type="submit" className={primaryButtonClass}>Save profile</button>
        </form>
      </div>

      {/* Password */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-lg font-medium">Security</h2>
        <form action={passwordAction} className="space-y-4">
          {passwordState.success && <p className="text-sm text-emerald-400">Password updated!</p>}
          {passwordState.error && <p className="text-sm text-red-400">{passwordState.error}</p>}
          
          <div>
            <label className="mb-1 block text-xs text-slate-400">New password</label>
            <input name="newPassword" type="password" minLength={6} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Confirm new password</label>
            <input name="confirmPassword" type="password" className={inputClass} />
          </div>
          <button type="submit" className={primaryButtonClass}>Change password</button>
        </form>
      </div>

      {/* Referrals */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-lg font-medium">Referrals</h2>
        <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <p className="text-xs text-slate-400">Your referral code</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded bg-slate-900 px-2 py-1 font-mono text-sm text-violet-400">{referralCode}</code>
            <button 
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${referralCode}`)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Copy link
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Referred" value={referralCount} />
          <Stat label="Earnings" value={`₦${referralEarnings.toFixed(2)}`} />
          <Stat label="Wallet" value={`₦${walletBalance.toFixed(2)}`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-center">
      <p className="text-lg font-semibold text-slate-50">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
