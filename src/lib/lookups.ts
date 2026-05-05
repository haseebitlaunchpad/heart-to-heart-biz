import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLookup(table: string, opts: { activeOnly?: boolean; orderBy?: string } = {}) {
  const { activeOnly = true, orderBy } = opts;
  return useQuery({
    queryKey: ["lookup", table, activeOnly, orderBy],
    queryFn: async () => {
      let q: any = (supabase as any).from(table).select("*");
      if (activeOnly) q = q.eq("is_active", true);
      if (orderBy) q = q.order(orderBy, { ascending: true });
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
    staleTime: 5 * 60_000,
  });
}

export function lookupName(rows: any[] | undefined, id: string | null | undefined) {
  if (!id || !rows) return null;
  return rows.find((r) => r.id === id)?.name ?? null;
}
