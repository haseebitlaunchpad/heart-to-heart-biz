import { supabase } from "@/integrations/supabase/client";

export async function writeWorkflowLog(opts: {
  process: string;
  objectType: string;
  objectId: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  action: string;
  comments?: string;
}) {
  const { data: u } = await supabase.auth.getUser();
  await (supabase as any).from("workflow_logs").insert({
    process_name: opts.process,
    object_type: opts.objectType,
    object_id: opts.objectId,
    from_status: opts.fromStatus ?? null,
    to_status: opts.toStatus ?? null,
    action_taken: opts.action,
    comments: opts.comments ?? null,
    performed_by: u.user?.id,
  });
}

export async function writeIntegrationLog(opts: {
  name: string;
  direction: "outbound" | "inbound";
  relatedType?: string;
  relatedId?: string;
  status: "success" | "failure" | "pending";
  request?: any;
  response?: any;
  error?: string;
}) {
  const { data: u } = await supabase.auth.getUser();
  await (supabase as any).from("integration_logs").insert({
    integration_name: opts.name,
    direction: opts.direction,
    related_object_type: opts.relatedType,
    related_object_id: opts.relatedId,
    status: opts.status,
    request_payload: opts.request,
    response_payload: opts.response,
    error_message: opts.error,
    triggered_by: u.user?.id,
  });
}
