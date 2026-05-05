import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors,
  useDraggable, useDroppable, DragOverlay,
} from "@dnd-kit/core";
import { useState } from "react";

export type KanbanCol = { id: string; title: string; color?: string | null };
export type KanbanCard = { id: string; columnId: string; title: string; subtitle?: string; meta?: string };

export function KanbanBoard({
  columns, cards, linkBase, onCardMove,
}: {
  columns: KanbanCol[];
  cards: KanbanCard[];
  linkBase: string;
  onCardMove?: (cardId: string, fromColId: string, toColId: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = cards.find((c) => c.id === activeId) ?? null;

  function handleEnd(e: DragEndEvent) {
    setActiveId(null);
    const cardId = String(e.active.id);
    const toCol = e.over ? String(e.over.id) : null;
    if (!toCol) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.columnId === toCol) return;
    onCardMove?.(cardId, card.columnId, toCol);
  }

  return (
    <DndContext sensors={sensors} onDragStart={(e) => setActiveId(String(e.active.id))} onDragEnd={handleEnd} onDragCancel={() => setActiveId(null)}>
      <div className="flex gap-3 overflow-x-auto pb-3">
        {columns.map((c) => (
          <Column key={c.id} col={c} cards={cards.filter((x) => x.columnId === c.id)} linkBase={linkBase} canDrop={!!onCardMove} />
        ))}
      </div>
      <DragOverlay>{active ? <CardShell card={active} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}

function Column({ col, cards, linkBase, canDrop }: { col: KanbanCol; cards: KanbanCard[]; linkBase: string; canDrop: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id, disabled: !canDrop });
  return (
    <div className="min-w-[260px] w-[260px] bg-muted/30 rounded-lg flex flex-col">
      <div className="px-3 py-2 border-b flex items-center justify-between">
        <div className="text-sm font-medium flex items-center gap-2">
          {col.color && <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />}
          {col.title}
        </div>
        <span className="text-xs text-muted-foreground">{cards.length}</span>
      </div>
      <div ref={setNodeRef} className={`p-2 space-y-2 max-h-[70vh] overflow-y-auto min-h-[80px] transition ${isOver ? "bg-primary/5 outline outline-primary/40 outline-2 -outline-offset-2 rounded" : ""}`}>
        {cards.map((card) => (
          <DraggableCard key={card.id} card={card} linkBase={linkBase} canDrag={canDrop} />
        ))}
        {!cards.length && <div className="text-xs text-muted-foreground italic px-2 py-3">Empty</div>}
      </div>
    </div>
  );
}

function DraggableCard({ card, linkBase, canDrag }: { card: KanbanCard; linkBase: string; canDrag: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id, disabled: !canDrag });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={{ opacity: isDragging ? 0.4 : 1 }}>
      <Link to={`${linkBase}/${card.id}` as any} className="block">
        <CardShell card={card} />
      </Link>
    </div>
  );
}

function CardShell({ card, dragging }: { card: KanbanCard; dragging?: boolean }): ReactNode {
  return (
    <div className={`bg-card border rounded p-2 text-sm hover:border-primary transition ${dragging ? "shadow-lg ring-2 ring-primary/30" : ""}`}>
      <div className="font-medium truncate">{card.title}</div>
      {card.subtitle && <div className="text-xs text-muted-foreground truncate">{card.subtitle}</div>}
      {card.meta && <div className="text-xs text-muted-foreground mt-1">{card.meta}</div>}
    </div>
  );
}
