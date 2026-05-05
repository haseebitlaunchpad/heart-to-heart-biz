import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export type KanbanCol = { id: string; title: string; color?: string | null };
export type KanbanCard = { id: string; columnId: string; title: string; subtitle?: string; meta?: string };

export function KanbanBoard({ columns, cards, linkBase }: { columns: KanbanCol[]; cards: KanbanCard[]; linkBase: string }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {columns.map((c) => {
        const items = cards.filter((x) => x.columnId === c.id);
        return (
          <div key={c.id} className="min-w-[260px] w-[260px] bg-muted/30 rounded-lg flex flex-col">
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <div className="text-sm font-medium flex items-center gap-2">
                {c.color && <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />}
                {c.title}
              </div>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="p-2 space-y-2 max-h-[70vh] overflow-y-auto">
              {items.map((card) => (
                <Link key={card.id} to={`${linkBase}/${card.id}` as any} className="block bg-card border rounded p-2 text-sm hover:border-primary transition">
                  <div className="font-medium truncate">{card.title}</div>
                  {card.subtitle && <div className="text-xs text-muted-foreground truncate">{card.subtitle}</div>}
                  {card.meta && <div className="text-xs text-muted-foreground mt-1">{card.meta}</div>}
                </Link>
              ))}
              {!items.length && <div className="text-xs text-muted-foreground italic px-2 py-3">Empty</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
