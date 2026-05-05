import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { writeWorkflowLog } from "@/lib/logs";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export function DeleteRecordButton({ table, recordId, recordNumber, redirectTo }: { table: string; recordId: string; recordNumber?: string | null; redirectTo: string }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) return;
    (supabase as any).from("user_roles").select("role").eq("user_id", user.id).eq("role", "system_admin").maybeSingle()
      .then(({ data }: any) => setIsAdmin(!!data));
  }, [user]);
  if (!isAdmin) return null;
  const expected = recordNumber || "DELETE";
  return (
    <>
      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4 mr-1" />Delete
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">This permanently deletes the record. Type <code className="bg-muted px-1 rounded">{expected}</code> to confirm.</p>
            <div><Label>Confirmation</Label><Input value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={busy || confirm !== expected} onClick={async () => {
              setBusy(true);
              try {
                const { error } = await (supabase as any).from(table).delete().eq("id", recordId);
                if (error) throw error;
                await writeWorkflowLog({ process: "record_delete", objectType: table, objectId: recordId, action: "delete", comments: expected });
                toast.success("Deleted");
                nav({ to: redirectTo as any });
              } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
