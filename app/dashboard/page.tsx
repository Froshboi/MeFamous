export default async function DashboardDebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white">Dashboard loads ✅</h1>
      <p className="mt-2 text-slate-400">If you see this, the crash is in the queries or components.</p>
    </div>
  );
}
