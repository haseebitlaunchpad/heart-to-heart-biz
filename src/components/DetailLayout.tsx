import { ReactNode, useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export type TabDef = { key: string; label: string; render: () => ReactNode };

export function DetailLayout({
  title, subtitle, badges, summary, actions, tabs, defaultTab, breadcrumbLabel,
}: {
  title: string;
  subtitle?: ReactNode;
  badges?: ReactNode;
  summary?: ReactNode;
  actions?: ReactNode;
  tabs: TabDef[];
  defaultTab?: string;
  breadcrumbLabel?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-card px-4 sm:px-6 py-3 sm:py-4">
        <Breadcrumbs overrideLast={breadcrumbLabel ?? title} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold break-words">{title}</h1>
            {subtitle && <div className="text-sm text-muted-foreground mt-0.5">{subtitle}</div>}
            {badges && <div className="flex gap-1.5 mt-2 flex-wrap">{badges}</div>}
          </div>
          {actions && <div className="flex gap-2 flex-wrap sm:shrink-0 sm:justify-end">{actions}</div>}
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0 lg:overflow-hidden overflow-y-auto">
        <aside className="border-b lg:border-b-0 lg:border-r bg-muted/30 p-4 sm:p-5 lg:overflow-y-auto">
          <details className="lg:hidden mb-2" open={false}>
            <summary className="text-xs font-medium text-muted-foreground cursor-pointer select-none">Show summary</summary>
            <div className="mt-3">{summary}</div>
          </details>
          <div className="hidden lg:block">{summary}</div>
        </aside>
        <section className="flex flex-col lg:overflow-hidden">
          <div className="border-b bg-card px-2 sm:px-4 sticky top-0 z-10 lg:static">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`px-3 sm:px-4 py-3 text-sm border-b-2 -mb-px transition whitespace-nowrap ${
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
          <div className="flex-1 lg:overflow-y-auto p-3 sm:p-5">
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
