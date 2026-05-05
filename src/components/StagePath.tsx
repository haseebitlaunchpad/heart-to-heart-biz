export type Stage = { id: string; code: string; name: string; sort_order?: number | null };
export function StagePath({ stages, currentId, onSelect }: { stages: Stage[]; currentId?: string | null; onSelect?: (s: Stage) => void }) {
  const idx = stages.findIndex((s) => s.id === currentId);
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1">
      {stages.map((s, i) => {
        const active = i === idx;
        const past = idx >= 0 && i < idx;
        return (
          <button
            key={s.id}
            onClick={() => onSelect?.(s)}
            className={`px-3 py-1.5 text-xs whitespace-nowrap border rounded-full transition ${
              active ? "bg-primary text-primary-foreground border-primary"
                : past ? "bg-accent text-accent-foreground"
                : "bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            {i + 1}. {s.name}
          </button>
        );
      })}
    </div>
  );
}
