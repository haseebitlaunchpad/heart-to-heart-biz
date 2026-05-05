import { ReactNode, useMemo, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronRight } from "lucide-react";

export type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  /** custom value used for sorting/grouping; defaults to row[key] */
  value?: (row: T) => any;
};

export function DataTable<T extends { id: string }>({
  rows, columns, linkBase, empty = "No records found.",
  groupableKeys,
}: {
  rows: T[]; columns: Column<T>[]; linkBase?: string; empty?: string;
  /** keys (matching column.key) that can be grouped */
  groupableKeys?: string[];
}) {
  const navigate = useNavigate();
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [groupBy, setGroupBy] = useState<string>("");

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const get = (r: T) => (col?.value ? col.value(r) : (r as any)[sort.key]);
    return [...rows].sort((a, b) => {
      const va = get(a) ?? ""; const vb = get(b) ?? "";
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, columns]);

  const grouped = useMemo(() => {
    if (!groupBy) return null;
    const col = columns.find((c) => c.key === groupBy);
    const get = (r: T) => (col?.value ? col.value(r) : (r as any)[groupBy]) ?? "—";
    const map = new Map<string, T[]>();
    sorted.forEach((r) => {
      const k = String(get(r));
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    });
    return Array.from(map.entries());
  }, [sorted, groupBy, columns]);

  const toggleSort = (k: string) =>
    setSort((s) => (s?.key === k ? (s.dir === "asc" ? { key: k, dir: "desc" } : null) : { key: k, dir: "asc" }));

  if (!rows.length) return <div className="p-8 text-center text-sm text-muted-foreground">{empty}</div>;

  return (
    <div>
      {(groupableKeys?.length ?? 0) > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 border-b text-xs">
          <span className="text-muted-foreground">Group by</span>
          <select className="h-7 border rounded px-2 bg-background" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="">— none —</option>
            {groupableKeys!.map((k) => {
              const c = columns.find((x) => x.key === k);
              return <option key={k} value={k}>{c?.header ?? k}</option>;
            })}
          </select>
        </div>
      )}
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="text-left px-3 py-2 font-medium select-none">
                  {c.sortable !== false ? (
                    <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-foreground">
                      {c.header}
                      {sort?.key === c.key
                        ? (sort.dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
                        : <ChevronsUpDown className="h-3 w-3 opacity-40" />}
                    </button>
                  ) : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped
              ? grouped.map(([gname, gRows]) => (
                  <GroupRows key={gname} name={gname} count={gRows.length} columns={columns} rows={gRows} linkBase={linkBase} navigate={navigate} />
                ))
              : sorted.map((row) => (
                  <BodyRow key={row.id} row={row} columns={columns} linkBase={linkBase} navigate={navigate} />
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BodyRow<T extends { id: string }>({ row, columns, linkBase, navigate }: any) {
  return (
    <tr
      className="hover:bg-accent/40 cursor-pointer border-t"
      onClick={(e) => {
        if (!linkBase) return;
        const t = e.target as HTMLElement;
        if (t.closest("a,button,input,select,textarea")) return;
        navigate({ to: `${linkBase}/${row.id}` });
      }}
    >
      {columns.map((c: any, idx: number) => (
        <td key={c.key} className="px-3 py-1.5">
          {idx === 0 && linkBase ? (
            <Link to={`${linkBase}/${row.id}` as any} className="text-foreground hover:text-primary hover:underline">
              {c.render ? c.render(row) : (row as any)[c.key] ?? "—"}
            </Link>
          ) : (c.render ? c.render(row) : (row as any)[c.key] ?? "—")}
        </td>
      ))}
    </tr>
  );
}

function GroupRows({ name, count, columns, rows, linkBase, navigate }: any) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <tr className="bg-muted/40 border-t">
        <td colSpan={columns.length} className="px-3 py-1.5 text-xs">
          <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-1 font-medium">
            <ChevronRight className={`h-3 w-3 transition ${open ? "rotate-90" : ""}`} />
            {name} <span className="text-muted-foreground">· {count}</span>
          </button>
        </td>
      </tr>
      {open && rows.map((r: any) => <BodyRow key={r.id} row={r} columns={columns} linkBase={linkBase} navigate={navigate} />)}
    </>
  );
}
