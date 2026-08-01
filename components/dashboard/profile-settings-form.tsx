"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, changePasswordAction } from "@/lib/actions/profile";
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
  const [copied, setCopied] = useState(false);

  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-lg font-medium">Profile</h2>
        
        <div className="mb-4 flex items-center gap-4">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-700" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-600 text-2xl font-semibold text-white">
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-slate-50">{fullName || "User"}</p>
            <p className="text-sm text-slate-400">{email}</p>
          </div>
        </div>

        <form action={profileAction} className="space-y-4">
          {profileState.success && <p className="text-sm text-emerald-400">✓ Profile updated!</p>}
          {profileState.error && <p className="text-sm text-red-400">{profileState.error}</p>}
          
          <input type="hidden" name="userId" value={userId} />
          
          <div>
            <label className="mb-1 block text-xs text-slate-400">Full name</label>
            <input name="fullName" defaultValue={fullName} className={inputClass} placeholder="Your name" />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Profile picture URL</label>
            <input 
              name="avatarUrl" 
              defaultValue={avatarUrl ?? ""} 
              placeholder="https://example.com/avatar.jpg"
              className={inputClass}
              onChange={(e) => setAvatarPreview(e.target.value || null)}
            />
            <p className="mt-1 text-xs text-slate-500">Paste an image URL or leave blank for initials</p>
          </div>

          <button type="submit" className={primaryButtonClass}>Save profile</button>
        </form>
      </div>

      {/* Security Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-lg font-medium">Security</h2>
        <form action={passwordAction} className="space-y-4">
          {passwordState.success && <p className="text-sm text-emerald-400">✓ Password updated!</p>}
          {passwordState.error && <p className="text-sm text-red-400">{passwordState.error}</p>}
          
          <div>
            <label className="mb-1 block text-xs text-slate-400">New password</label>
            <input name="newPassword" type="password" minLength={6} className={inputClass} placeholder="••••••••" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Confirm password</label>
            <input name="confirmPassword" type="password" className={inputClass} placeholder="••••••••" />
          </div>
          <button type="submit" className={primaryButtonClass}>Change password</button>
        </form>
      </div>

      {/* Referrals Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-lg font-medium">Referrals</h2>
        
        <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <p className="text-xs text-slate-400">Your referral link</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-slate-900 px-3 py-2 font-mono text-sm text-violet-400">
              {referralLink}
            </code>
            <button 
              onClick={copyLink}
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Referred" value={referralCount} />
          <Stat label="Earnings" value={`₦${referralEarnings.toFixed(2)}`} />
          <Stat label="Balance" value={`₦${walletBalance.toFixed(2)}`} />
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
