import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  leads: "Leads",
  accounts: "Accounts",
  contacts: "Contacts",
  catalog: "Opportunity Catalog",
  matches: "Matches",
  approvals: "Approvals",
  handoffs: "Handoffs",
  activities: "Activities",
  admin: "Admin & Setup",
  logs: "Logs",
  users: "Users",
  roles: "Roles",
  workbench: "Workbench",
};

function labelFor(seg: string) {
  if (LABELS[seg]) return LABELS[seg];
  if (/^[0-9a-f-]{8,}$/i.test(seg) || /^\d+$/.test(seg)) return "Detail";
  return seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs({ overrideLast }: { overrideLast?: string }) {
  const loc = useLocation();
  const segments = loc.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    const label = isLast && overrideLast ? overrideLast : labelFor(seg);
    return { path, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-2 -mt-1">
      <ol className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap">
        <li className="shrink-0">
          <Link to="/" className="flex items-center hover:text-foreground transition-colors" aria-label="Home">
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {crumbs.map((c) => (
          <li key={c.path} className="flex items-center gap-1 shrink-0 last:min-w-0">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            {c.isLast ? (
              <span className="text-foreground font-medium truncate max-w-[60vw] sm:max-w-md" title={c.label}>
                {c.label}
              </span>
            ) : (
              <Link to={c.path as any} className="hover:text-foreground transition-colors">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
