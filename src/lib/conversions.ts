import { supabase } from "@/integrations/supabase/client";
import { writeWorkflowLog } from "./logs";

const sb = supabase as any;

async function uid() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function findLookupId(table: string, code: string) {
  const { data } = await sb.from(table).select("id,code,name").or(`code.eq.${code},name.ilike.${code}`).maybeSingle();
  return data?.id ?? null;
}

/** Convert Lead → Account (+ Contact). Returns new account id. */
export async function convertLeadToAccount(leadId: string): Promise<string> {
  const userId = await uid();
  const { data: lead, error: le } = await sb.from("leads").select("*").eq("id", leadId).single();
  if (le) throw le;

  const accountPayload: any = {
    account_name: lead.company_name || lead.lead_name,
    company_name: lead.company_name,
    cr_number: lead.cr_number,
    nationality_id: lead.nationality_id,
    primary_mobile: lead.mobile,
    primary_email: lead.email,
    country_id: lead.country_of_residence_id,
    city_id: lead.city_id,
    sector_id: lead.sector_id,
    sub_sector_id: lead.sub_sector_id,
    investment_size_band_id: lead.investment_size_band_id,
    preferred_region_id: lead.preferred_region_id,
    source_lead_id: lead.id,
    original_channel_id: lead.source_channel_id,
    owner_id: lead.owner_id ?? userId,
    created_by: userId,
  };
  const { data: acc, error: ae } = await sb.from("accounts").insert(accountPayload).select("id").single();
  if (ae) throw ae;

  const contactPayload: any = {
    full_name: lead.lead_name,
    mobile: lead.mobile,
    email: lead.email,
    nationality_id: lead.nationality_id,
    account_id: acc.id,
    lead_id: lead.id,
    is_primary_contact: true,
    owner_id: lead.owner_id ?? userId,
    created_by: userId,
  };
  const { data: con, error: ce } = await sb.from("contacts").insert(contactPayload).select("id").single();
  if (ce) throw ce;

  const qualifiedStage = await findLookupId("lead_stages", "qualified");
  await sb.from("leads").update({
    linked_account_id: acc.id,
    linked_contact_id: con.id,
    lead_stage_id: qualifiedStage ?? lead.lead_stage_id,
    qualified_at: new Date().toISOString(),
  }).eq("id", lead.id);

  await writeWorkflowLog({
    process: "lead_conversion", objectType: "leads", objectId: lead.id,
    action: "convert_to_account", toStatus: "qualified",
    comments: `Converted to account ${acc.id}`,
  });
  return acc.id as string;
}

/** Create a Match from a Lead (with optional Catalog id). Returns match id. */
export async function createMatchFromLead(leadId: string, catalogOpportunityId: string): Promise<string> {
  const userId = await uid();
  const { data: lead } = await sb.from("leads").select("id,linked_account_id,linked_contact_id,owner_id").eq("id", leadId).single();
  const payload: any = {
    catalog_opportunity_id: catalogOpportunityId,
    lead_id: lead.id,
    account_id: lead.linked_account_id,
    contact_id: lead.linked_contact_id,
    eligibility_result: "pending",
    owner_id: lead.owner_id ?? userId,
    created_by: userId,
  };
  const { data, error } = await sb.from("opportunity_matches").insert(payload).select("id").single();
  if (error) throw error;
  await writeWorkflowLog({
    process: "match_create", objectType: "opportunity_matches", objectId: data.id,
    action: "create", comments: `From lead ${leadId}`,
  });
  return data.id as string;
}

/** Submit object for approval. */
export async function submitForApproval(objectType: string, objectId: string, comments?: string, matchId?: string): Promise<string> {
  const userId = await uid();
  const pendingId = await findLookupId("approval_statuses", "pending");
  const payload: any = {
    related_object_type: objectType,
    related_object_id: objectId,
    opportunity_match_id: matchId ?? (objectType === "opportunity_matches" ? objectId : null),
    approval_status_id: pendingId,
    requested_by: userId,
    comments,
  };
  const { data, error } = await sb.from("approvals").insert(payload).select("id").single();
  if (error) throw error;

  // Update source object's approval_status_id when applicable
  if (objectType === "opportunity_matches" && pendingId) {
    await sb.from("opportunity_matches").update({ approval_status_id: pendingId, submitted_at: new Date().toISOString(), submitted_by: userId }).eq("id", objectId);
  }

  await writeWorkflowLog({
    process: "approval_request", objectType, objectId, action: "submit_for_approval", toStatus: "pending", comments,
  });
  return data.id as string;
}

/** Promote an approved Match to a Handoff. */
export async function promoteMatchToHandoff(matchId: string, comments?: string): Promise<string> {
  const userId = await uid();
  const { data: m } = await sb.from("opportunity_matches").select("*").eq("id", matchId).single();
  const draftStatusId = await findLookupId("handoff_statuses", "draft");
  const payload: any = {
    opportunity_match_id: m.id,
    account_id: m.account_id,
    contact_id: m.contact_id,
    catalog_opportunity_id: m.catalog_opportunity_id,
    selected_path_id: m.selected_path_id,
    handoff_status_id: draftStatusId,
    owner_id: m.owner_id ?? userId,
    created_by: userId,
    checklist_state: {},
  };
  const { data, error } = await sb.from("handoffs").insert(payload).select("id").single();
  if (error) throw error;

  await sb.from("opportunity_matches").update({ handoff_status_id: draftStatusId }).eq("id", matchId);

  await writeWorkflowLog({
    process: "handoff_create", objectType: "handoffs", objectId: data.id,
    action: "create_from_match", comments: comments ?? `From match ${matchId}`,
  });
  return data.id as string;
}

/** Decide an approval (approve/reject) and propagate to source. */
export async function decideApproval(approvalId: string, decision: "approved" | "rejected", reason?: string) {
  const userId = await uid();
  const statusId = await findLookupId("approval_statuses", decision);
  const { data: ap } = await sb.from("approvals").select("*").eq("id", approvalId).single();

  await sb.from("approvals").update({
    approval_status_id: statusId,
    decision,
    decided_by: userId,
    decided_at: new Date().toISOString(),
    rejection_reason: decision === "rejected" ? reason : null,
  }).eq("id", approvalId);

  if (ap?.related_object_type && ap?.related_object_id) {
    const patch: any = { approval_status_id: statusId };
    if (ap.related_object_type === "opportunity_matches") {
      if (decision === "approved") { patch.approved_by = userId; patch.approved_at = new Date().toISOString(); }
      else { patch.rejected_by = userId; patch.rejected_at = new Date().toISOString(); patch.rejection_reason = reason; }
    }
    await sb.from(ap.related_object_type).update(patch).eq("id", ap.related_object_id);

    await writeWorkflowLog({
      process: "approval_decision", objectType: ap.related_object_type, objectId: ap.related_object_id,
      action: decision, toStatus: decision, comments: reason,
    });
  }

  await writeWorkflowLog({
    process: "approval_decision", objectType: "approvals", objectId: approvalId,
    action: decision, toStatus: decision, comments: reason,
  });
}
