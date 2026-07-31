import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">MeFamous</h1>
      <p className="text-lg text-slate-600">Instant Social Authority, Engineered for Impact.</p>
      <div className="flex gap-4">
        <Link href="/login" className="rounded-lg bg-slate-900 px-5 py-2.5 text-white">Get Started</Link>
        <Link href="/dashboard" className="rounded-lg border border-slate-300 px-5 py-2.5">Dashboard</Link>
      </div>
    </div>
  );
}
