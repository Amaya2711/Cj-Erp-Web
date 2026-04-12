import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { createServerSupabaseClient } from "@/services/supabase/server-client";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <AppSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader userEmail={user.email ?? "sin-correo"} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
