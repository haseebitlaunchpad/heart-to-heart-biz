import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DetailLayout, SummaryField } from "@/components/DetailLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLookup } from "@/lib/lookups";
import { writeWorkflowLog } from "@/lib/logs";
import { ChangesTab, WorkflowTab, RelatedActivitiesTab } from "@/components/RelatedTabs";
import { ActivityDrawer } from "@/components/ActivityDrawer";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Crown } from "lucide-react";

export const Route = createFileRoute("/_app/accounts/$id")({ component: AccountDetail });

function AccountDetail() {
  const { id } = useParams({ from: "/_app/accounts/$id" });
  const qc = useQueryClient();
  const [actDrawer, setActDrawer] = useState(false);
  const { data: account, isLoading } = useQuery({
    queryKey: ["account", id],
    queryFn: async () => (await supabase.from("accounts").select("*").eq("id", id).maybeSingle()).data,
  });
  const { data: investorTypes = [] } = useLookup("investor_types");
  const { data: statuses = [] } = useLookup("account_statuses");

  const update = useMutation({
    mutationFn: async (patch: any) => {
      const { error } = await (supabase as any).from("accounts").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["account", id] }),
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!account) return <div className="p-8">Account not found.</div>;

  const status = (statuses as any[]).find((s) => s.id === account.account_status_id);
  const invType = (investorTypes as any[]).find((s) => s.id === account.investor_type_id);
  const isInvestor = invType?.code === "INVESTOR";

  async function promote() {
    const inv = (investorTypes as any[]).find((s) => s.code === "INVESTOR");
    if (!inv) { toast.error("Investor type missing in setup"); return; }
    await update.mutateAsync({ investor_type_id: inv.id });
    await writeWorkflowLog({ process: "account_promote", objectType: "accounts", objectId: id, fromStatus: invType?.code, toStatus: "INVESTOR", action: "promote_to_investor" });
    toast.success("Promoted to Investor");
  }

  return (
    <>
      <DetailLayout
        title={account.account_name}
        subtitle={`${account.record_number} · ${account.company_name ?? ""}`}
        badges={<>
          <StatusBadge label={status?.name} />
          <StatusBadge label={invType?.name} tone={isInvestor ? "success" : "info"} />
        </>}
        actions={<>
          <Button size="sm" variant="outline" onClick={() => setActDrawer(true)}><Plus className="h-4 w-4 mr-1" />Log Activity</Button>
          {!isInvestor && <Button size="sm" onClick={promote}><Crown className="h-4 w-4 mr-1" />Promote to Investor</Button>}
        </>}
        summary={<>
          <SummaryField label="Email" value={account.primary_email} />
          <SummaryField label="Mobile" value={account.primary_mobile} />
          <SummaryField label="CR Number" value={account.cr_number} />
          <SummaryField label="Budget (est.)" value={account.estimated_investment_budget} />
          <SummaryField label="Created" value={new Date(account.created_at).toLocaleString()} />
        </>}
        tabs={[
          { key: "overview", label: "Overview", render: () => <Editable account={account} update={update.mutateAsync} /> },
          { key: "contacts", label: "Contacts", render: () => <RelatedList table="contacts" filter={{ account_id: id }} columns={["record_number", "full_name", "email", "mobile"]} linkBase="/contacts" addLabel="Add Contact" addFields={[{key:"full_name",label:"Full name",required:true},{key:"email",label:"Email"},{key:"mobile",label:"Mobile"}]} /> },
          { key: "leads", label: "Leads", render: () => <RelatedList table="leads" filter={{ linked_account_id: id }} columns={["record_number", "lead_name", "email", "mobile"]} linkBase="/leads" addLabel="New Lead" addFields={[{key:"lead_name",label:"Lead name",required:true},{key:"email",label:"Email"},{key:"mobile",label:"Mobile"}]} /> },
          { key: "matches", label: "Matches", render: () => <MatchesRelated accountId={id} /> },
          { key: "activities", label: "Activities", render: () => <RelatedActivitiesTab relatedId={id} /> },
          { key: "changes", label: "Changes", render: () => <ChangesTab objectType="accounts" objectId={id} /> },
          { key: "workflow", label: "Workflow", render: () => <WorkflowTab objectType="accounts" objectId={id} /> },
        ]}
      />
      <ActivityDrawer open={actDrawer} onOpenChange={setActDrawer} relatedType="account" relatedId={id} defaultSubject={`Engage: ${account.account_name}`} />
    </>
  );
}

function Editable({ account, update }: { account: any; update: (p: any) => Promise<any> }) {
  const [form, setForm] = useState<any>({
    account_name: account.account_name, company_name: account.company_name ?? "",
    primary_email: account.primary_email ?? "", primary_mobile: account.primary_mobile ?? "",
    cr_number: account.cr_number ?? "", estimated_investment_budget: account.estimated_investment_budget ?? "",
    financial_notes: account.financial_notes ?? "",
  });
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
      {Object.entries(form).map(([k, v]) => (
        <div key={k} className={k === "financial_notes" ? "md:col-span-2" : ""}>
          <Label className="capitalize">{k.replaceAll("_", " ")}</Label>
          {k === "financial_notes" ? <Textarea value={v as any} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /> : <Input value={v as any} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
        </div>
      ))}
      <div className="md:col-span-2">
        <Button disabled={busy} onClick={async () => { setBusy(true); try { await update({ ...form, estimated_investment_budget: form.estimated_investment_budget || null }); toast.success("Saved"); } finally { setBusy(false); } }}>Save</Button>
      </div>
    </div>
  );
}

function RelatedList({ table, filter, columns, linkBase }: { table: string; filter: Record<string, any>; columns: string[]; linkBase: string }) {
  const { data = [] } = useQuery({
    queryKey: [table, "rel", filter],
    queryFn: async () => {
      let q: any = (supabase as any).from(table).select("*");
      Object.entries(filter).forEach(([k, v]) => { q = q.eq(k, v); });
      return (await q.limit(100)).data ?? [];
    },
  });
  if (!data.length) return <div className="text-sm text-muted-foreground p-6 text-center">None.</div>;
  return (
    <div className="bg-card border rounded">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>{columns.map((c) => <th key={c} className="px-3 py-2 text-left font-medium">{c.replaceAll("_", " ")}</th>)}</tr>
        </thead>
        <tbody>
          {(data as any[]).map((r) => (
            <tr key={r.id} className="border-t hover:bg-accent/40">
              {columns.map((c, i) => (
                <td key={c} className="px-3 py-2">
                  {i === 0 ? <Link to={`${linkBase}/${r.id}` as any} className="text-primary hover:underline">{r[c] ?? "—"}</Link> : (r[c] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
