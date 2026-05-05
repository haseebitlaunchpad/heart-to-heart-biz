import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { writeWorkflowLog } from "@/lib/logs";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/matches/workbench")({ component: Workbench });

function Workbench() {
  const nav = useNavigate();
  const [leadId, setLeadId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [catalogId, setCatalogId] = useState("");
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: leads = [] } = useQuery({ queryKey: ["wb-leads", search1], queryFn: async () => (await supabase.from("leads").select("id,record_number,lead_name,company_name").eq("is_archived", false).ilike("lead_name", `%${search1}%`).limit(30)).data ?? [] });
  const { data: accounts = [] } = useQuery({ queryKey: ["wb-accounts", search1], queryFn: async () => (await supabase.from("accounts").select("id,record_number,account_name").eq("is_archived", false).ilike("account_name", `%${search1}%`).limit(30)).data ?? [] });
  const { data: catalog = [] } = useQuery({ queryKey: ["wb-cat", search2], queryFn: async () => (await supabase.from("opportunity_catalog").select("id,record_number,title,journey_area").eq("is_archived", false).ilike("title", `%${search2}%`).limit(30)).data ?? [] });

  const selectedLead = (leads as any[]).find((l) => l.id === leadId);
  const selectedAccount = (accounts as any[]).find((l) => l.id === accountId);
  const selectedCat = (catalog as any[]).find((l) => l.id === catalogId);

  async function createMatch() {
    if (!catalogId || (!leadId && !accountId)) { toast.error("Select a lead/account and a catalog item"); return; }
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await (supabase as any).from("opportunity_matches").insert({
        catalog_opportunity_id: catalogId, lead_id: leadId || null, account_id: accountId || null,
        owner_id: u.user?.id, created_by: u.user?.id, eligibility_result: "pending",
      }).select("id").single();
      if (error) throw error;
      await writeWorkflowLog({ process: "match_create", objectType: "opportunity_matches", objectId: data.id, action: "manual_match" });
      toast.success("Match created");
      nav({ to: `/matches/${data.id}` as any });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title="Manual Match Workbench" subtitle="Pair a lead/account with a catalog opportunity" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-4">
        <Panel title="1. Lead / Account">
          <Input placeholder="Search…" value={search1} onChange={(e) => setSearch1(e.target.value)} className="mb-2" />
          <div className="text-xs uppercase text-muted-foreground mt-2 mb-1">Leads</div>
          {(leads as any[]).map((l) => (
            <button key={l.id} onClick={() => { setLeadId(l.id); setAccountId(""); }} className={`block w-full text-left text-sm p-2 rounded hover:bg-accent ${leadId === l.id ? "bg-accent" : ""}`}>
              <div className="font-medium">{l.lead_name}</div><div className="text-xs text-muted-foreground">{l.record_number} · {l.company_name ?? ""}</div>
            </button>
          ))}
          <div className="text-xs uppercase text-muted-foreground mt-3 mb-1">Accounts</div>
          {(accounts as any[]).map((l) => (
            <button key={l.id} onClick={() => { setAccountId(l.id); setLeadId(""); }} className={`block w-full text-left text-sm p-2 rounded hover:bg-accent ${accountId === l.id ? "bg-accent" : ""}`}>
              <div className="font-medium">{l.account_name}</div><div className="text-xs text-muted-foreground">{l.record_number}</div>
            </button>
          ))}
        </Panel>
        <Panel title="2. Catalog Opportunity">
          <Input placeholder="Search…" value={search2} onChange={(e) => setSearch2(e.target.value)} className="mb-2" />
          {(catalog as any[]).map((l) => (
            <button key={l.id} onClick={() => setCatalogId(l.id)} className={`block w-full text-left text-sm p-2 rounded hover:bg-accent ${catalogId === l.id ? "bg-accent" : ""}`}>
              <div className="font-medium">{l.title}</div><div className="text-xs text-muted-foreground">{l.record_number} · {l.journey_area ?? ""}</div>
            </button>
          ))}
        </Panel>
        <Panel title="3. Summary">
          <div className="space-y-3 text-sm">
            <div><div className="text-xs uppercase text-muted-foreground">Lead</div>{selectedLead?.lead_name ?? "—"}</div>
            <div><div className="text-xs uppercase text-muted-foreground">Account</div>{selectedAccount?.account_name ?? "—"}</div>
            <div><div className="text-xs uppercase text-muted-foreground">Catalog</div>{selectedCat?.title ?? "—"}</div>
            <Button className="w-full" disabled={busy} onClick={createMatch}>{busy ? "Creating…" : "Create Match"}</Button>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-lg p-3 max-h-[75vh] overflow-y-auto">
      <div className="font-medium mb-2">{title}</div>
      {children}
    </div>
  );
}
