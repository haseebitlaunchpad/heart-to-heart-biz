import { useState } from "react";
import { Link, Outlet, useRouter, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard, Users, Building2, UserCircle, Package, Link2,
  ClipboardCheck, Send, CalendarClock, Settings, FileText, LogOut, Menu,
} from "lucide-react";
import { GlobalSearch } from "@/components/GlobalSearch";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/accounts", label: "Accounts", icon: Building2 },
  { to: "/contacts", label: "Contacts", icon: UserCircle },
  { to: "/catalog", label: "Opportunity Catalog", icon: Package },
  { to: "/matches", label: "Matches", icon: Link2 },
  { to: "/approvals", label: "Approvals", icon: ClipboardCheck },
  { to: "/handoffs", label: "Handoffs", icon: Send },
  { to: "/activities", label: "Activities", icon: CalendarClock },
  { to: "/admin", label: "Admin & Setup", icon: Settings },
  { to: "/logs", label: "Logs", icon: FileText },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const loc = useLocation();
  return (
    <div className="flex h-full flex-col">
      <div className="h-14 border-b flex items-center px-4 font-semibold text-primary">
        Senaei CRM
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 text-sm">
        {NAV.map((n) => {
          const active = n.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNavigate}
              className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition ${
                active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t text-xs text-muted-foreground">
        <div className="truncate">{user?.email}</div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start mt-2"
          onClick={async () => {
            await signOut();
            onNavigate?.();
            router.navigate({ to: "/login" });
          }}
        >
          <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
        </Button>
      </div>
    </div>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="hidden lg:flex w-60 shrink-0 border-r bg-sidebar flex-col">
        <SidebarContent />
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 border-b flex items-center px-3 sm:px-4 gap-2 sm:gap-3 bg-card">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="lg:hidden font-semibold text-primary text-sm shrink-0">Senaei</div>
          <div className="flex-1 min-w-0">
            <GlobalSearch />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
