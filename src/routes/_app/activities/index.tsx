import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Timeline } from "@/components/Timeline";
import { FilterBar } from "@/components/FilterBar";
import { ActivityDrawer } from "@/components/ActivityDrawer";
import { Button } from "@/components/ui/button";
import { useLookup } from "@/lib/lookups";
import { Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/activities/")({ component: ActivitiesPage });

function ActivitiesPage() {
  const [search, setSearch] = useState("");
  const [typeId, setTypeId] = useState("");
  const [drawer, setDrawer] = useState(false);
  const { data: types = [] } = useLookup("activity_types");
  const { data: rows = [] } = useQuery({
    queryKey: ["activities-all"],
    queryFn: async () => (await supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(500)).data ?? [],
  });
  const filtered = (rows as any[]).filter((r) => {
    if (typeId && r.activity_type_id !== typeId) return false;
    if (search && !`${r.subject} ${r.description ?? ""} ${r.record_number ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const items = filtered.map((r: any) => ({
    id: r.id,
    title: <>
      <span>{r.subject}</span>
      {r.related_object_id && r.related_object_type === "lead" && <Link to={`/leads/${r.related_object_id}` as any} className="ml-2 text-xs text-primary">→ Lead</Link>}
      {r.related_object_id && r.related_object_type === "account" && <Link to={`/accounts/${r.related_object_id}` as any} className="ml-2 text-xs text-primary">→ Account</Link>}
      {r.related_object_id && r.related_object_type === "contact" && <Link to={`/contacts/${r.related_object_id}` as any} className="ml-2 text-xs text-primary">→ Contact</Link>}
    </>,
    description: r.description,
    meta: r.completed_at ? "Completed" : (r.due_date ? `Due ${new Date(r.due_date).toLocaleDateString()}` : "Open"),
    timestamp: r.created_at,
  }));

  return (
    <>
      <PageHeader title="Activities" subtitle="Global timeline across all objects" actions={
        <Button onClick={() => setDrawer(true)}><Plus className="h-4 w-4 mr-1" />Log Activity</Button>
      } />
      <div className="p-4">
        <FilterBar search={search} onSearch={setSearch}>
          <select className="h-9 border rounded px-2 text-sm bg-background" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
            <option value="">All types</option>
            {(types as any[]).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </FilterBar>
        <Timeline items={items} />
      </div>
      <ActivityDrawer open={drawer} onOpenChange={setDrawer} relatedType={null as any} relatedId={null as any} defaultSubject="" />
    </>
  );
}
