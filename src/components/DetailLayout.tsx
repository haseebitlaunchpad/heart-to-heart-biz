import { ReactNode, useState } from "react";

export type TabDef = { key: string; label: string; render: () => ReactNode };

export function DetailLayout({
  title, subtitle, badges, summary, actions, tabs, defaultTab,
}: {
  title: string;
  subtitle?: ReactNode;
  badges?: ReactNode;
  summary?: ReactNode;
  actions?: ReactNode;
  tabs: TabDef[];
  defaultTab?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate">{title}</h1>
            {subtitle && <div className="text-sm text-muted-foreground mt-0.5">{subtitle}</div>}
            {badges && <div className="flex gap-1.5 mt-2 flex-wrap">{badges}</div>}
          </div>
          {actions && <div className="flex gap-2 shrink-0 flex-wrap justify-end">{actions}</div>}
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0 overflow-hidden">
        <aside className="border-r bg-muted/30 p-5 overflow-y-auto">
          {summary}
        </aside>
        <section className="flex flex-col overflow-hidden">
          <div className="border-b bg-card px-4">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`px-4 py-3 text-sm border-b-2 -mb-px transition whitespace-nowrap ${
                    active === t.key
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {current?.render()}
          </div>
        </section>
      </div>
    </div>
  );
}

export function SummaryField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm mt-0.5">{value ?? <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}
