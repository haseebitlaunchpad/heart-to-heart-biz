// Map foreign-key column name to its target table for record_number lookup.
export const FK_TABLE_MAP: Record<string, string> = {
  lead_id: "leads",
  account_id: "accounts",
  contact_id: "contacts",
  opportunity_match_id: "opportunity_matches",
  catalog_opportunity_id: "opportunity_catalog",
  handoff_id: "handoffs",
  related_object_id: "", // resolved via related_object_type
  source_lead_id: "leads",
  linked_account_id: "accounts",
  linked_contact_id: "contacts",
  converted_account_id: "accounts",
  converted_contact_id: "contacts",
  converted_match_id: "opportunity_matches",
  // user references
  owner_id: "user_profiles",
  assigned_to: "user_profiles",
  assigned_by: "user_profiles",
  created_by: "user_profiles",
  updated_by: "user_profiles",
  submitted_by: "user_profiles",
  decided_by: "user_profiles",
  requested_by: "user_profiles",
  captured_by: "user_profiles",
  converted_by: "user_profiles",
  archived_by: "user_profiles",
  changed_by: "user_profiles",
  uploaded_by: "user_profiles",
  performed_by: "user_profiles",
  triggered_by: "user_profiles",
};

export const RECORD_TABLES = new Set([
  "leads","accounts","contacts","opportunity_catalog","opportunity_matches","handoffs","activities","approvals","user_profiles",
]);

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRecordRef(table: string | undefined, id: string | undefined) {
  return useQuery({
    queryKey: ["recordref", table, id],
    enabled: !!table && !!id && RECORD_TABLES.has(table),
    staleTime: 5 * 60_000,
    queryFn: async () => {
      if (table === "user_profiles") {
        const { data } = await (supabase as any).from("user_profiles").select("id, full_name, email").eq("id", id!).maybeSingle();
        if (!data) return null;
        return { recordNumber: data.full_name || data.email || "User", name: "" as string };
      }
      const nameCol =
        table === "leads" ? "lead_name"
        : table === "accounts" ? "account_name"
        : table === "contacts" ? "full_name"
        : table === "opportunity_catalog" ? "title"
        : table === "activities" ? "subject"
        : "record_number";
      const { data } = await (supabase as any).from(table!).select(`id, record_number, ${nameCol}`).eq("id", id!).maybeSingle();
      if (!data) return null;
      return { recordNumber: data.record_number as string, name: data[nameCol] as string };
    },
  });
}

const ROUTE_BY_TABLE: Record<string, string> = {
  leads: "/leads",
  accounts: "/accounts",
  contacts: "/contacts",
  opportunity_catalog: "/catalog",
  opportunity_matches: "/matches",
  handoffs: "/handoffs",
  activities: "/activities",
};

export function routeForTable(table: string) {
  return ROUTE_BY_TABLE[table];
}

// Map activity related_object_type → table name
export function tableForRelatedType(t: string | null | undefined): string | undefined {
  if (!t) return undefined;
  const map: Record<string, string> = {
    lead: "leads", account: "accounts", contact: "contacts",
    opportunity_match: "opportunity_matches", match: "opportunity_matches",
    handoff: "handoffs", catalog: "opportunity_catalog",
  };
  return map[t] ?? (RECORD_TABLES.has(t) ? t : undefined);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}
