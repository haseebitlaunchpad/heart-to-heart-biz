import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

const DEMO = [
  { role: "System Admin", email: "admin@senaei.demo" },
  { role: "CRM Manager", email: "crm.manager@senaei.demo" },
  { role: "Relationship Manager", email: "rm@senaei.demo" },
  { role: "Catalog Manager", email: "catalog@senaei.demo" },
  { role: "Approver", email: "approver@senaei.demo" },
  { role: "Handoff Officer", email: "handoff@senaei.demo" },
  { role: "Leadership Viewer", email: "leadership@senaei.demo" },
];
const DEMO_PASS = "Demo!2026";

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@senaei.demo");
  const [password, setPassword] = useState(DEMO_PASS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav({ to: "/" }); });
  }, [nav]);

  async function go(asEmail = email) {
    setBusy(true);
    try {
      let { error } = await supabase.auth.signInWithPassword({ email: asEmail, password: DEMO_PASS });
      if (error) {
        const { error: e2 } = await supabase.auth.signUp({
          email: asEmail, password: DEMO_PASS,
          options: { data: { full_name: asEmail.split("@")[0] } },
        });
        if (e2) throw e2;
        const { error: e3 } = await supabase.auth.signInWithPassword({ email: asEmail, password: DEMO_PASS });
        if (e3) throw e3;
      }
      toast.success("Signed in");
      nav({ to: "/" });
    } catch (e: any) {
      toast.error(e.message ?? "Sign in failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card border rounded-lg p-6 shadow-sm">
        <div className="text-primary font-semibold text-lg">Senaei CRM</div>
        <h1 className="text-2xl font-semibold mt-2">Sign in</h1>
        <p className="text-sm text-muted-foreground">Use any demo account below or your credentials.</p>

        <div className="mt-5 space-y-3">
          <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button className="w-full" onClick={() => go()} disabled={busy}>
            {busy ? "Working…" : "Sign in / auto-create"}
          </Button>
        </div>

        <div className="mt-6">
          <div className="text-xs uppercase text-muted-foreground mb-2">Quick demo accounts</div>
          <div className="grid grid-cols-1 gap-1.5">
            {DEMO.map((d) => (
              <button
                key={d.email}
                onClick={() => { setEmail(d.email); go(d.email); }}
                className="text-left text-sm px-3 py-2 rounded border hover:bg-accent flex justify-between"
              >
                <span>{d.role}</span><span className="text-muted-foreground">{d.email}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Password: <code>{DEMO_PASS}</code></p>
        </div>
      </div>
    </div>
  );
}
