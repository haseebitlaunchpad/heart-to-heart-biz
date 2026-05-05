import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, MessageSquare } from "lucide-react";

export function ApprovalActions({
  onApprove, onReject, onRequestInfo, disabled,
}: {
  onApprove: (note?: string) => void;
  onReject: (reason: string) => void;
  onRequestInfo: (note: string) => void;
  disabled?: boolean;
}) {
  const [mode, setMode] = useState<null | "reject" | "info">(null);
  const [text, setText] = useState("");
  return (
    <div className="flex gap-2 flex-wrap">
      <Button size="sm" onClick={() => onApprove()} disabled={disabled}>
        <Check className="h-4 w-4 mr-1" /> Approve
      </Button>
      <Button size="sm" variant="destructive" onClick={() => { setText(""); setMode("reject"); }} disabled={disabled}>
        <X className="h-4 w-4 mr-1" /> Reject
      </Button>
      <Button size="sm" variant="outline" onClick={() => { setText(""); setMode("info"); }} disabled={disabled}>
        <MessageSquare className="h-4 w-4 mr-1" /> Request Info
      </Button>
      <Dialog open={!!mode} onOpenChange={(v) => !v && setMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === "reject" ? "Reject — provide reason" : "Request more information"}</DialogTitle>
          </DialogHeader>
          <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder={mode === "reject" ? "Reason (required)" : "What additional information do you need?"} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMode(null)}>Cancel</Button>
            <Button
              disabled={!text.trim()}
              onClick={() => {
                if (mode === "reject") onReject(text); else onRequestInfo(text);
                setMode(null);
              }}
            >Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
