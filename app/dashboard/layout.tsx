import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/queries/profile";
import { createClient } from "@/lib/supabase/server";
import DashboardLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  let notifications: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, body, link, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    notifications = data ?? [];
  } catch {
    notifications = [];
  }

  return (
    <DashboardLayoutClient
      user={{
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }}
      notifications={notifications}
    >
      {children}
    </DashboardLayoutClient>
  );
}
