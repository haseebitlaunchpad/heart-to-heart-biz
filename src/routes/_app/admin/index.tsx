import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import {
  Shield, Target, Building2, CalendarClock, Link2, Send, Globe, Cog, FileText, Search,
} from "lucide-react";

export const Route = createFileRoute("/_app/admin/")({ component: AdminPage });

type Group = {
  key: string;
  label: string;
  icon: any;
  cards: Array<{ label: string; to?: string; params?: any; table?: string; description?: string }>;
};

const GROUPS: Group[] = [
  {
    key: "access", label: "Access control", icon: Shield, cards: [
      { label: "Users", to: "/admin/users", description: "Assign roles to users" },
      { label: "Roles & Permissions", to: "/admin/roles", description: "CRUD & status permissions per role" },
    ],
  },
  {
    key: "leads", label: "Lead management", icon: Target, cards: [
      { label: "Lead stages", table: "lead_stages" },
      { label: "Lead statuses", table: "lead_statuses" },
      { label: "Lead temperatures", table: "lead_temperatures" },
      { label: "Source channels", table: "lead_source_channels" },
      { label: "Disqualification reasons", table: "lead_disqualification_reasons" },
      { label: "Nurture reasons", table: "lead_nurture_reasons" },
    ],
  },
  {
    key: "accounts", label: "Account & contact", icon: Building2, cards: [
      { label: "Account categories", table: "account_categories" },
      { label: "Account statuses", table: "account_statuses" },
      { label: "Investor types", table: "investor_types" },
      { label: "Contact roles", table: "contact_roles" },
    ],
  },
  {
    key: "activities", label: "Activities", icon: CalendarClock, cards: [
      { label: "Activity types", table: "activity_types" },
      { label: "Activity statuses", table: "activity_statuses" },
      { label: "Activity outcomes", table: "activity_outcomes" },
    ],
  },
  {
    key: "opps", label: "Opportunities & matching", icon: Link2, cards: [
      { label: "Match statuses", table: "match_statuses" },
      { label: "Investment size bands", table: "investment_size_bands" },
      { label: "Investment paths", table: "investment_paths" },
      { label: "Investment timelines", table: "investment_timelines" },
      { label: "Funding sources", table: "funding_sources" },
      { label: "Funding statuses", table: "funding_statuses" },
      { label: "Lifecycle phases", table: "lifecycle_phases" },
    ],
  },
  {
    key: "approvals", label: "Approvals & handoffs", icon: Send, cards: [
      { label: "Approval statuses", table: "approval_statuses" },
      { label: "Handoff statuses", table: "handoff_statuses" },
      { label: "Handoff checklist items", table: "handoff_checklist_items" },
      { label: "Integration statuses", table: "integration_statuses" },
    ],
  },
  {
    key: "geo", label: "Geography & localization", icon: Globe, cards: [
      { label: "Countries", table: "countries" },
      { label: "Cities", table: "cities" },
      { label: "Currencies", table: "currencies" },
      { label: "Languages", table: "languages" },
      { label: "Communication channels", table: "communication_channels" },
    ],
  },
  {
    key: "automation", label: "Automation", icon: Cog, cards: [
      { label: "Assignment rules", table: "assignment_rules" },
    ],
  },
  {
    key: "logs", label: "Audit & integration logs", icon: FileText, cards: [
      { label: "Audit logs", to: "/logs", description: "Field-level change history" },
      { label: "Integration logs", to: "/logs", description: "Outbound/inbound integration calls" },
      { label: "Duplicate logs", to: "/logs", description: "Duplicate-detection decisions" },
    ],
  },
];

function AdminPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return GROUPS;
    const needle = q.toLowerCase();
    return GROUPS
      .map((g) => ({ ...g, cards: g.cards.filter((c) => c.label.toLowerCase().includes(needle)) }))
      .filter((g) => g.cards.length > 0);
  }, [q]);

  return (
    <>
      <PageHeader title="Admin & Setup" subtitle="Users, roles, and reference data" />
      <div className="p-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search settings…" className="pl-9" />
        </div>
        <Accordion type="multiple" defaultValue={filtered.map((g) => g.key)} className="space-y-2">
          {filtered.map((g) => {
            const Icon = g.icon;
            return (
              <AccordionItem key={g.key} value={g.key} className="border rounded-lg bg-card overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{g.label}</span>
                    <span className="text-xs text-muted-foreground">· {g.cards.length}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {g.cards.map((c) => <SetupCard key={c.label} card={c} />)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </>
  );
}

function SetupCard({ card }: { card: Group["cards"][number] }) {
  const { data: count } = useQuery({
    queryKey: ["setup-count", card.table],
    enabled: !!card.table,
    queryFn: async () => {
      const { count } = await (supabase as any).from(card.table!).select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const inner = (
    <>
      <div className="text-sm font-medium">{card.label}</div>
      {card.table ? (
        <>
          <div className="text-xl font-semibold mt-1">{count ?? "…"}</div>
          <div className="text-xs text-muted-foreground">records — click to manage</div>
        </>
      ) : (
        <div className="text-xs text-muted-foreground mt-1">{card.description}</div>
      )}
    </>
  );
  if (card.table) {
    return (
      <Link to="/admin/$table" params={{ table: card.table }} className="bg-background border rounded-md p-3 hover:bg-accent/50 hover:border-primary/40 transition block">
        {inner}
      </Link>
    );
  }
  return (
    <Link to={card.to!} className="bg-background border rounded-md p-3 hover:bg-accent/50 hover:border-primary/40 transition block">
      {inner}
    </Link>
  );
}
