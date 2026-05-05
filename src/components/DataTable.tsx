import { ReactNode } from "react";

export type Column<T> = { key: string; header: string; render?: (row: T) => ReactNode };

export function DataTable<T extends { id: string }>({
  rows, columns, linkBase, empty = "No records found.",
}: { rows: T[]; columns: Column<T>[]; linkBase?: string; empty?: string }) {
  if (!rows.length) {
    return <div className="p-8 text-center text-sm text-muted-foreground">{empty}</div>;
  }
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>{columns.map((c) => <th key={c.key} className="text-left px-4 py-2 font-medium">{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-accent/40 cursor-pointer border-t"
              onClick={() => linkBase && (window.location.href = `${linkBase}/${row.id}`)}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-2">
                  {c.render ? c.render(row) : (row as any)[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
