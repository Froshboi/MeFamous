import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Check your email"
      subtitle="We sent you a confirmation link — click it to activate your account."
      footer={
        <Link href="/login" className="font-medium text-cyan hover:underline">
          Back to sign in
        </Link>
      }
    >
      <p className="text-sm text-slate-400">
        Didn&apos;t get it? Check your spam folder, or try signing up again in a couple of minutes.
      </p>
    </AuthCard>
  );
}
