import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCan } from "@/lib/permissions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/users")({ component: UsersAdmin });

const ROLES = ["system_admin","crm_manager","relationship_manager","catalog_manager","approver","handoff_officer","leadership_viewer","integration_user"];

function UsersAdmin() {
  const qc = useQueryClient();
  const { isAdmin } = useCan();
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profs } = await (supabase as any).from("user_profiles").select("id, full_name, email").order("full_name");
      const { data: roles } = await (supabase as any).from("user_roles").select("user_id, role");
      const byUser: Record<string, string[]> = {};
      (roles ?? []).forEach((r: any) => { (byUser[r.user_id] ||= []).push(r.role); });
      return (profs ?? []).map((p: any) => ({ ...p, roles: byUser[p.id] ?? [] }));
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ userId, role, on }: { userId: string; role: string; on: boolean }) => {
      if (on) {
        const { error } = await (supabase as any).from("user_roles").insert({ user_id: userId, role });
        if (error && !String(error.message).includes("duplicate")) throw error;
      } else {
        const { error } = await (supabase as any).from("user_roles").delete().eq("user_id", userId).eq("role", role);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Roles updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  if (!isAdmin) return <div className="p-8 text-muted-foreground">Admin access required.</div>;

  return (
    <>
      <PageHeader title="Users & Roles" subtitle="Assign roles to control access and permissions" />
      <div className="p-4 bg-card border rounded-lg m-4">
        <DataTable
          rows={users as any}
          columns={[
            { key: "full_name", header: "Name" },
            { key: "email", header: "Email" },
            ...ROLES.map((role) => ({
              key: role,
              header: role.replace(/_/g, " "),
              sortable: false,
              render: (u: any) => (
                <Checkbox
                  checked={u.roles.includes(role)}
                  onCheckedChange={(v) => toggle.mutate({ userId: u.id, role, on: !!v })}
                />
              ),
            })),
          ]}
        />
      </div>
    </>
  );
}
