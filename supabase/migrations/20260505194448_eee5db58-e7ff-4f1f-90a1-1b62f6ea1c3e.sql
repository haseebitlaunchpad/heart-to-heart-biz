
-- =========================================================
-- LEADS
-- =========================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number TEXT UNIQUE,
  -- Identity
  lead_type TEXT,
  lead_name TEXT NOT NULL,
  company_name TEXT,
  cr_number TEXT,
  national_id TEXT,
  nationality_id UUID REFERENCES public.countries(id),
  country_of_residence_id UUID REFERENCES public.countries(id),
  city_id UUID REFERENCES public.cities(id),
  preferred_language TEXT DEFAULT 'en',
  -- Contact
  mobile TEXT,
  email TEXT,
  whatsapp_number TEXT,
  preferred_contact_channel_id UUID REFERENCES public.communication_channels(id),
  best_time_to_contact TEXT,
  -- Source
  source_channel_id UUID REFERENCES public.lead_source_channels(id),
  source_system TEXT,
  source_reference_id TEXT,
  campaign_id UUID,
  event_id UUID,
  received_at TIMESTAMPTZ DEFAULT now(),
  captured_by UUID REFERENCES auth.users(id),
  -- Investment Interest
  sector_id UUID REFERENCES public.sectors(id),
  sub_sector_id UUID REFERENCES public.sub_sectors(id),
  investment_size_band_id UUID REFERENCES public.investment_size_bands(id),
  preferred_region_id UUID REFERENCES public.regions(id),
  preferred_city_id UUID REFERENCES public.cities(id),
  investment_objective TEXT,
  interest_notes TEXT,
  -- Qualification
  lead_stage_id UUID REFERENCES public.lead_stages(id),
  lead_status_id UUID REFERENCES public.lead_statuses(id),
  qualification_temperature_id UUID REFERENCES public.lead_temperatures(id),
  lead_score INT DEFAULT 0,
  priority TEXT DEFAULT 'normal',
  qualification_notes TEXT,
  qualified_at TIMESTAMPTZ,
  disqualification_reason_id UUID REFERENCES public.lead_disqualification_reasons(id),
  nurture_reason_id UUID REFERENCES public.lead_nurture_reasons(id),
  next_follow_up_date DATE,
  -- Ownership
  owner_id UUID REFERENCES auth.users(id),
  owner_team_id UUID REFERENCES public.teams(id),
  territory_id UUID REFERENCES public.territories(id),
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES auth.users(id),
  accepted_by_owner BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ,
  -- Readiness
  linked_account_id UUID,
  linked_contact_id UUID,
  duplicate_status TEXT,
  cr_verified BOOLEAN DEFAULT false,
  contact_consent BOOLEAN DEFAULT false,
  data_completeness_percentage INT DEFAULT 0,
  handoff_readiness_status TEXT,
  -- AI placeholders
  ai_source_summary TEXT,
  ai_suggested_next_action TEXT,
  ai_match_explanation TEXT,
  ai_score_reason TEXT,
  ai_last_processed_at TIMESTAMPTZ,
  -- Conversion
  conversion_status TEXT,
  converted_account_id UUID,
  converted_contact_id UUID,
  converted_match_id UUID,
  converted_at TIMESTAMPTZ,
  converted_by UUID REFERENCES auth.users(id),
  -- System
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  last_activity_at TIMESTAMPTZ,
  days_in_stage INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_leads_owner ON public.leads(owner_id);
CREATE INDEX idx_leads_stage ON public.leads(lead_stage_id);
CREATE INDEX idx_leads_status ON public.leads(lead_status_id);
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_leads_audit AFTER INSERT OR UPDATE OR DELETE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

-- Auto record_number for leads
CREATE OR REPLACE FUNCTION public.assign_record_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  next_seq INT;
BEGIN
  IF NEW.record_number IS NOT NULL AND NEW.record_number <> '' THEN
    RETURN NEW;
  END IF;
  prefix := CASE TG_TABLE_NAME
    WHEN 'leads' THEN 'LEAD'
    WHEN 'accounts' THEN 'ACC'
    WHEN 'contacts' THEN 'CON'
    WHEN 'opportunity_catalog' THEN 'OPP'
    WHEN 'opportunity_matches' THEN 'MTC'
    WHEN 'activities' THEN 'ACT'
    WHEN 'approvals' THEN 'APR'
    WHEN 'handoffs' THEN 'HND'
    ELSE 'REC' END;
  EXECUTE format('SELECT COALESCE(MAX(SUBSTRING(record_number FROM ''[0-9]+'')::INT), 0) + 1 FROM public.%I', TG_TABLE_NAME) INTO next_seq;
  NEW.record_number := prefix || '-' || LPAD(next_seq::TEXT, 6, '0');
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.assign_record_number() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_leads_recnum BEFORE INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.assign_record_number();

-- =========================================================
-- ACCOUNTS
-- =========================================================
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number TEXT UNIQUE,
  account_name TEXT NOT NULL,
  company_name TEXT,
  account_category_id UUID REFERENCES public.account_categories(id),
  investor_type_id UUID REFERENCES public.investor_types(id),
  account_status_id UUID REFERENCES public.account_statuses(id),
  cr_number TEXT,
  nationality_id UUID REFERENCES public.countries(id),
  primary_mobile TEXT,
  primary_email TEXT,
  country_id UUID REFERENCES public.countries(id),
  city_id UUID REFERENCES public.cities(id),
  preferred_language TEXT DEFAULT 'en',
  -- Investment profile
  sector_id UUID REFERENCES public.sectors(id),
  sub_sector_id UUID REFERENCES public.sub_sectors(id),
  investment_size_band_id UUID REFERENCES public.investment_size_bands(id),
  preferred_region_id UUID REFERENCES public.regions(id),
  -- Financial profile (basic)
  estimated_investment_budget NUMERIC,
  funding_source_id UUID REFERENCES public.funding_sources(id),
  funding_status_id UUID REFERENCES public.funding_statuses(id),
  investment_timeline_id UUID REFERENCES public.investment_timelines(id),
  preferred_financing_support TEXT,
  financial_notes TEXT,
  -- Ownership
  owner_id UUID REFERENCES auth.users(id),
  owner_team_id UUID REFERENCES public.teams(id),
  territory_id UUID REFERENCES public.territories(id),
  source_lead_id UUID,
  original_channel_id UUID REFERENCES public.lead_source_channels(id),
  -- System
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_accounts_owner ON public.accounts(owner_id);
CREATE INDEX idx_accounts_category ON public.accounts(account_category_id);
CREATE TRIGGER trg_accounts_updated BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_accounts_audit AFTER INSERT OR UPDATE OR DELETE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.audit_changes();
CREATE TRIGGER trg_accounts_recnum BEFORE INSERT ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.assign_record_number();

-- back-FK for leads.linked_account_id and converted_account_id
ALTER TABLE public.leads ADD CONSTRAINT leads_linked_account_fk FOREIGN KEY (linked_account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD CONSTRAINT leads_converted_account_fk FOREIGN KEY (converted_account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.accounts ADD CONSTRAINT accounts_source_lead_fk FOREIGN KEY (source_lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;

-- =========================================================
-- CONTACTS
-- =========================================================
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number TEXT UNIQUE,
  full_name TEXT NOT NULL,
  job_title TEXT,
  mobile TEXT,
  email TEXT,
  nationality_id UUID REFERENCES public.countries(id),
  preferred_language TEXT DEFAULT 'en',
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  contact_role_id UUID REFERENCES public.contact_roles(id),
  is_primary_contact BOOLEAN NOT NULL DEFAULT false,
  preferred_channel_id UUID REFERENCES public.communication_channels(id),
  consent_given BOOLEAN DEFAULT false,
  consent_notes TEXT,
  owner_id UUID REFERENCES auth.users(id),
  owner_team_id UUID REFERENCES public.teams(id),
  territory_id UUID REFERENCES public.territories(id),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_contacts_account ON public.contacts(account_id);
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_contacts_audit AFTER INSERT OR UPDATE OR DELETE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.audit_changes();
CREATE TRIGGER trg_contacts_recnum BEFORE INSERT ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.assign_record_number();

ALTER TABLE public.leads ADD CONSTRAINT leads_linked_contact_fk FOREIGN KEY (linked_contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD CONSTRAINT leads_converted_contact_fk FOREIGN KEY (converted_contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- =========================================================
-- OPPORTUNITY CATALOG
-- =========================================================
CREATE TABLE public.opportunity_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number TEXT UNIQUE,
  -- Basic
  title TEXT NOT NULL,
  description TEXT,
  opportunity_type_id UUID REFERENCES public.opportunity_types(id),
  category_id UUID REFERENCES public.opportunity_categories(id),
  status_id UUID REFERENCES public.opportunity_statuses(id),
  visibility_id UUID REFERENCES public.visibility_types(id),
  owner_id UUID REFERENCES auth.users(id),
  -- Lifecycle
  lifecycle_phase_id UUID REFERENCES public.lifecycle_phases(id),
  journey_area TEXT,
  program_service_category TEXT,
  strategic_objective TEXT,
  trl_min INT, trl_max INT,
  mrl_min INT, mrl_max INT,
  -- Sector / location
  sector_id UUID REFERENCES public.sectors(id),
  sub_sector_id UUID REFERENCES public.sub_sectors(id),
  region_id UUID REFERENCES public.regions(id),
  city_id UUID REFERENCES public.cities(id),
  site_name TEXT,
  area_size NUMERIC,
  -- Investment
  min_investment NUMERIC,
  max_investment NUMERIC,
  investment_size_band_id UUID REFERENCES public.investment_size_bands(id),
  currency_id UUID REFERENCES public.currencies(id),
  expected_benefit TEXT,
  capacity INT,
  available_from DATE,
  expiry_date DATE,
  -- Eligibility
  eligible_nationality_type TEXT,
  eligible_investor_type TEXT,
  required_cr BOOLEAN DEFAULT false,
  eligible_channels TEXT[],
  eligible_sectors TEXT[],
  eligible_investment_bands TEXT[],
  required_documents TEXT[],
  exclusion_criteria TEXT,
  -- Paths
  available_paths TEXT[],
  default_path_id UUID REFERENCES public.investment_paths(id),
  path_a_description TEXT,
  path_b_description TEXT,
  path_c_description TEXT,
  path_owner_team_id UUID REFERENCES public.teams(id),
  -- References
  reference_url TEXT,
  internal_notes TEXT,
  -- System
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_catalog_status ON public.opportunity_catalog(status_id);
CREATE INDEX idx_catalog_type ON public.opportunity_catalog(opportunity_type_id);
CREATE TRIGGER trg_catalog_updated BEFORE UPDATE ON public.opportunity_catalog FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_catalog_audit AFTER INSERT OR UPDATE OR DELETE ON public.opportunity_catalog FOR EACH ROW EXECUTE FUNCTION public.audit_changes();
CREATE TRIGGER trg_catalog_recnum BEFORE INSERT ON public.opportunity_catalog FOR EACH ROW EXECUTE FUNCTION public.assign_record_number();

-- =========================================================
-- OPPORTUNITY MATCHES
-- =========================================================
CREATE TABLE public.opportunity_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number TEXT UNIQUE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  catalog_opportunity_id UUID NOT NULL REFERENCES public.opportunity_catalog(id) ON DELETE RESTRICT,
  -- Eligibility
  match_type_id UUID REFERENCES public.match_types(id),
  eligibility_result TEXT,
  missing_requirements TEXT[],
  manual_override_flag BOOLEAN DEFAULT false,
  -- Path
  selected_path_id UUID REFERENCES public.investment_paths(id),
  path_notes TEXT,
  -- Status
  match_status_id UUID REFERENCES public.match_statuses(id),
  approval_status_id UUID REFERENCES public.approval_statuses(id),
  handoff_status_id UUID REFERENCES public.handoff_statuses(id),
  -- Approval
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  -- Ownership
  owner_id UUID REFERENCES auth.users(id),
  owner_team_id UUID REFERENCES public.teams(id),
  territory_id UUID REFERENCES public.territories(id),
  -- System
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_matches_owner ON public.opportunity_matches(owner_id);
CREATE INDEX idx_matches_catalog ON public.opportunity_matches(catalog_opportunity_id);
CREATE TRIGGER trg_matches_updated BEFORE UPDATE ON public.opportunity_matches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_matches_audit AFTER INSERT OR UPDATE OR DELETE ON public.opportunity_matches FOR EACH ROW EXECUTE FUNCTION public.audit_changes();
CREATE TRIGGER trg_matches_recnum BEFORE INSERT ON public.opportunity_matches FOR EACH ROW EXECUTE FUNCTION public.assign_record_number();

ALTER TABLE public.leads ADD CONSTRAINT leads_converted_match_fk FOREIGN KEY (converted_match_id) REFERENCES public.opportunity_matches(id) ON DELETE SET NULL;

-- =========================================================
-- ACTIVITIES
-- =========================================================
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number TEXT UNIQUE,
  activity_type_id UUID REFERENCES public.activity_types(id),
  subject TEXT NOT NULL,
  description TEXT,
  related_object_type TEXT,
  related_object_id UUID,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  opportunity_match_id UUID REFERENCES public.opportunity_matches(id) ON DELETE SET NULL,
  handoff_id UUID,
  owner_id UUID REFERENCES auth.users(id),
  owner_team_id UUID REFERENCES public.teams(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status_id UUID REFERENCES public.activity_statuses(id),
  outcome_id UUID REFERENCES public.activity_outcomes(id),
  next_follow_up_date DATE,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_activities_lead ON public.activities(lead_id);
CREATE INDEX idx_activities_account ON public.activities(account_id);
CREATE INDEX idx_activities_match ON public.activities(opportunity_match_id);
CREATE INDEX idx_activities_owner ON public.activities(owner_id);
CREATE TRIGGER trg_activities_updated BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_activities_audit AFTER INSERT OR UPDATE OR DELETE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.audit_changes();
CREATE TRIGGER trg_activities_recnum BEFORE INSERT ON public.activities FOR EACH ROW EXECUTE FUNCTION public.assign_record_number();

-- =========================================================
-- APPROVALS
-- =========================================================
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number TEXT UNIQUE,
  related_object_type TEXT NOT NULL,        -- 'opportunity_match' | 'handoff'
  related_object_id UUID NOT NULL,
  opportunity_match_id UUID REFERENCES public.opportunity_matches(id) ON DELETE CASCADE,
  handoff_id UUID,
  approval_status_id UUID REFERENCES public.approval_statuses(id),
  requested_by UUID REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ DEFAULT now(),
  assigned_to UUID REFERENCES auth.users(id),
  decision TEXT,                            -- approve / reject / request_more_info / cancel
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ,
  comments TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_approvals_assigned ON public.approvals(assigned_to);
CREATE INDEX idx_approvals_match ON public.approvals(opportunity_match_id);
CREATE TRIGGER trg_approvals_updated BEFORE UPDATE ON public.approvals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_approvals_audit AFTER INSERT OR UPDATE OR DELETE ON public.approvals FOR EACH ROW EXECUTE FUNCTION public.audit_changes();
CREATE TRIGGER trg_approvals_recnum BEFORE INSERT ON public.approvals FOR EACH ROW EXECUTE FUNCTION public.assign_record_number();

-- =========================================================
-- HANDOFFS
-- =========================================================
CREATE TABLE public.handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number TEXT UNIQUE,
  opportunity_match_id UUID NOT NULL REFERENCES public.opportunity_matches(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  catalog_opportunity_id UUID REFERENCES public.opportunity_catalog(id) ON DELETE SET NULL,
  selected_path_id UUID REFERENCES public.investment_paths(id),
  handoff_status_id UUID REFERENCES public.handoff_statuses(id),
  integration_status_id UUID REFERENCES public.integration_statuses(id),
  checklist_state JSONB DEFAULT '{}'::jsonb, -- { checklist_item_id: { complete: bool, note: text } }
  package_payload JSONB,
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id),
  owner_team_id UUID REFERENCES public.teams(id),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_handoffs_match ON public.handoffs(opportunity_match_id);
CREATE INDEX idx_handoffs_status ON public.handoffs(handoff_status_id);
CREATE TRIGGER trg_handoffs_updated BEFORE UPDATE ON public.handoffs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_handoffs_audit AFTER INSERT OR UPDATE OR DELETE ON public.handoffs FOR EACH ROW EXECUTE FUNCTION public.audit_changes();
CREATE TRIGGER trg_handoffs_recnum BEFORE INSERT ON public.handoffs FOR EACH ROW EXECUTE FUNCTION public.assign_record_number();

ALTER TABLE public.activities ADD CONSTRAINT activities_handoff_fk FOREIGN KEY (handoff_id) REFERENCES public.handoffs(id) ON DELETE SET NULL;
ALTER TABLE public.approvals ADD CONSTRAINT approvals_handoff_fk FOREIGN KEY (handoff_id) REFERENCES public.handoffs(id) ON DELETE CASCADE;

-- =========================================================
-- DOCUMENTS
-- =========================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  related_object_type TEXT NOT NULL,
  related_object_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT,
  mime_type TEXT,
  file_size INT,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_documents_related ON public.documents(related_object_type, related_object_id);

-- =========================================================
-- RLS POLICIES (CRM tables)
-- =========================================================
-- Common pattern: any authenticated user can read; owner/admin/role-based write.
-- We rely on the application + has_role for finer access; full data scoping (e.g. RM-only-sees-own) can be tightened later.

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_read" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "leads_insert" ON public.leads FOR INSERT TO authenticated WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager','relationship_manager','integration_user']::app_role[])
);
CREATE POLICY "leads_update" ON public.leads FOR UPDATE TO authenticated USING (
  owner_id = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager']::app_role[])
);
CREATE POLICY "leads_delete_admin" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'system_admin'));

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accounts_read" ON public.accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "accounts_insert" ON public.accounts FOR INSERT TO authenticated WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager','relationship_manager']::app_role[])
);
CREATE POLICY "accounts_update" ON public.accounts FOR UPDATE TO authenticated USING (
  owner_id = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager']::app_role[])
);
CREATE POLICY "accounts_delete_admin" ON public.accounts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'system_admin'));

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_read" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "contacts_insert" ON public.contacts FOR INSERT TO authenticated WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager','relationship_manager']::app_role[])
);
CREATE POLICY "contacts_update" ON public.contacts FOR UPDATE TO authenticated USING (
  owner_id = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager']::app_role[])
);
CREATE POLICY "contacts_delete_admin" ON public.contacts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'system_admin'));

ALTER TABLE public.opportunity_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog_read" ON public.opportunity_catalog FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalog_write" ON public.opportunity_catalog FOR ALL TO authenticated USING (
  public.has_any_role(auth.uid(), ARRAY['system_admin','catalog_manager']::app_role[])
) WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['system_admin','catalog_manager']::app_role[])
);

ALTER TABLE public.opportunity_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_read" ON public.opportunity_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "matches_insert" ON public.opportunity_matches FOR INSERT TO authenticated WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager','relationship_manager']::app_role[])
);
CREATE POLICY "matches_update" ON public.opportunity_matches FOR UPDATE TO authenticated USING (
  owner_id = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager','approver']::app_role[])
);
CREATE POLICY "matches_delete_admin" ON public.opportunity_matches FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'system_admin'));

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_read" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "activities_insert" ON public.activities FOR INSERT TO authenticated WITH CHECK (
  owner_id = auth.uid() OR created_by = auth.uid()
);
CREATE POLICY "activities_update" ON public.activities FOR UPDATE TO authenticated USING (
  owner_id = auth.uid() OR created_by = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager']::app_role[])
);
CREATE POLICY "activities_delete_admin" ON public.activities FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'system_admin'));

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approvals_read" ON public.approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "approvals_insert" ON public.approvals FOR INSERT TO authenticated WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager','relationship_manager']::app_role[])
);
CREATE POLICY "approvals_update" ON public.approvals FOR UPDATE TO authenticated USING (
  assigned_to = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager','approver']::app_role[])
);

ALTER TABLE public.handoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "handoffs_read" ON public.handoffs FOR SELECT TO authenticated USING (true);
CREATE POLICY "handoffs_write" ON public.handoffs FOR ALL TO authenticated USING (
  public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager','handoff_officer']::app_role[])
) WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager','handoff_officer']::app_role[])
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_read" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "documents_insert" ON public.documents FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "documents_delete_owner_admin" ON public.documents FOR DELETE TO authenticated USING (
  uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'system_admin')
);
