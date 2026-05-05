import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { useCan } from "@/lib/permissions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/roles")({ component: RolesAdmin });

const ROLES = ["system_admin","crm_manager","relationship_manager","catalog_manager","approver","handoff_officer","leadership_viewer","integration_user"];

function RolesAdmin() {
  const qc = useQueryClient();
  const { isAdmin } = useCan();
  const { data: perms = [] } = useQuery({ queryKey: ["all-perms"], queryFn: async () =>
    (await (supabase as any).from("permissions").select("*").order("resource").order("action")).data ?? [] });
  const { data: rp = [] } = useQuery({ queryKey: ["all-rp"], queryFn: async () =>
    (await (supabase as any).from("role_permissions").select("*")).data ?? [] });

  const has = (role: string, pid: string) => (rp as any[]).some((r) => r.role === role && r.permission_id === pid);

  const toggle = useMutation({
    mutationFn: async ({ role, pid, on }: { role: string; pid: string; on: boolean }) => {
      if (on) await (supabase as any).from("role_permissions").insert({ role, permission_id: pid });
      else await (supabase as any).from("role_permissions").delete().eq("role", role).eq("permission_id", pid);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-rp"] }); toast.success("Updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  if (!isAdmin) return <div className="p-8 text-muted-foreground">Admin access required.</div>;

  return (
    <>
      <PageHeader title="Roles & Permissions" subtitle="Toggle which actions each role can perform" />
      <div className="p-4 overflow-auto">
        <table className="text-xs bg-card border rounded">
          <thead className="bg-muted/60">
            <tr>
              <th className="text-left p-2 sticky left-0 bg-muted/60 z-10">Resource · Action</th>
              {ROLES.map((r) => <th key={r} className="p-2 text-center">{r.replace(/_/g, " ")}</th>)}
            </tr>
          </thead>
          <tbody>
            {(perms as any[]).map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2 sticky left-0 bg-card z-10 whitespace-nowrap">
                  <span className="font-medium">{p.resource}</span> · {p.action}
                </td>
                {ROLES.map((role) => (
                  <td key={role} className="p-2 text-center">
                    <Checkbox
                      checked={role === "system_admin" || has(role, p.id)}
                      disabled={role === "system_admin"}
                      onCheckedChange={(v) => toggle.mutate({ role, pid: p.id, on: !!v })}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-muted-foreground mt-2">System admin always has all permissions.</div>
      </div>
    </>
  );
}
