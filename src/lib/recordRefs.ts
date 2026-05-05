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
};

export const RECORD_TABLES = new Set([
  "leads","accounts","contacts","opportunity_catalog","opportunity_matches","handoffs","activities","approvals",
]);

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRecordRef(table: string | undefined, id: string | undefined) {
  return useQuery({
    queryKey: ["recordref", table, id],
    enabled: !!table && !!id && RECORD_TABLES.has(table),
    staleTime: 5 * 60_000,
    queryFn: async () => {
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
