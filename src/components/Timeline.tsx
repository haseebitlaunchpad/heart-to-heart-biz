import { ReactNode } from "react";

export type TimelineItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  timestamp?: string | null;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (!items.length) {
    return <div className="text-sm text-muted-foreground p-6 text-center">No activity yet.</div>;
  }
  return (
    <ol className="relative border-l border-border ml-3 space-y-4">
      {items.map((it) => (
        <li key={it.id} className="ml-4">
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border bg-card border-primary" />
          <div className="bg-card border rounded-md p-3">
            <div className="flex justify-between items-start gap-3">
              <div className="text-sm font-medium">{it.title}</div>
              {it.timestamp && (
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(it.timestamp).toLocaleString()}
                </div>
              )}
            </div>
            {it.description && <div className="text-sm text-muted-foreground mt-1">{it.description}</div>}
            {it.meta && <div className="text-xs text-muted-foreground mt-2">{it.meta}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
