
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'countries','currencies','languages','regions','sectors','sub_sectors',
    'lead_stages','lead_statuses','lead_temperatures','lead_source_channels',
    'lead_disqualification_reasons','lead_nurture_reasons','communication_channels',
    'contact_roles','account_categories','account_statuses','investor_types',
    'funding_sources','funding_statuses','investment_timelines','investment_size_bands',
    'activity_types','activity_statuses','activity_outcomes','approval_statuses',
    'handoff_statuses','integration_statuses','match_statuses','investment_paths',
    'lifecycle_phases','handoff_checklist_items'
  ]) LOOP
    EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I UNIQUE (code)', t, t||'_code_uq');
  END LOOP;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
