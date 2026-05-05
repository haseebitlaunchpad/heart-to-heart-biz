import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { AuthProvider } from "@/lib/auth";
import { QueryProvider } from "@/lib/query";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: () => (
    <QueryProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </QueryProvider>
  ),
});
