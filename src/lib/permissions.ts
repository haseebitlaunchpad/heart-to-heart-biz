import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function useRoles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await (supabase as any).from("user_roles").select("role").eq("user_id", user!.id);
      return (data ?? []).map((r: any) => r.role) as string[];
    },
    staleTime: 60_000,
  });
}

export function useCan() {
  const { data: roles = [] } = useRoles();
  const isAdmin = roles.includes("system_admin");
  const { data: perms = [] } = useQuery({
    queryKey: ["my-perms", roles.join(",")],
    enabled: roles.length > 0 && !isAdmin,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("role_permissions")
        .select("permissions(resource,action)")
        .in("role", roles);
      return (data ?? []).map((r: any) => `${r.permissions.resource}:${r.permissions.action}`);
    },
    staleTime: 60_000,
  });
  const set = new Set(perms);
  return {
    roles,
    isAdmin,
    can: (resource: string, action: string) => isAdmin || set.has(`${resource}:${action}`),
  };
}
