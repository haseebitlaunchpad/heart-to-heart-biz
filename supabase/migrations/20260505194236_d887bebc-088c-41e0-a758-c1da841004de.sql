
-- ===== Audit / Workflow / Integration / Duplicate / Security logs =====
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_type TEXT NOT NULL,
  object_id UUID NOT NULL,
  object_number TEXT,
  action_type TEXT NOT NULL,         -- insert / update / delete / status_change / owner_change
  field_name TEXT,
  old_value JSONB,
  new_value JSONB,
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  change_source TEXT DEFAULT 'app',  -- app / api / system / trigger
  change_reason TEXT
);
CREATE INDEX idx_audit_object ON public.audit_logs (object_type, object_id, changed_at DESC);

CREATE TABLE public.workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_name TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id UUID NOT NULL,
  from_status TEXT,
  to_status TEXT,
  action_taken TEXT NOT NULL,
  performed_by UUID,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  comments TEXT
);
CREATE INDEX idx_workflow_object ON public.workflow_logs (object_type, object_id, performed_at DESC);

CREATE TABLE public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name TEXT NOT NULL,
  direction TEXT NOT NULL,           -- inbound / outbound
  related_object_type TEXT,
  related_object_id UUID,
  request_payload JSONB,
  response_payload JSONB,
  status TEXT,                       -- success / failed / pending
  error_message TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  triggered_by UUID,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_integration_related ON public.integration_logs (related_object_type, related_object_id, triggered_at DESC);

CREATE TABLE public.duplicate_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_type TEXT NOT NULL,
  object_id UUID,
  duplicate_object_type TEXT NOT NULL,
  duplicate_object_id UUID NOT NULL,
  match_field TEXT,
  match_confidence NUMERIC,
  decision TEXT,                     -- link / merge / create_separate / cancel
  decided_by UUID,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE TABLE public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,          -- login / logout / role_change / export / admin_change
  module_name TEXT,
  object_type TEXT,
  object_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  event_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  details JSONB
);

-- =========================================================
-- AUDIT TRIGGER: writes per-row insert/update/delete to audit_logs
-- =========================================================
CREATE OR REPLACE FUNCTION public.audit_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  obj_id UUID;
  obj_number TEXT;
  actor UUID := auth.uid();
BEGIN
  IF (TG_OP = 'DELETE') THEN
    obj_id := OLD.id;
    BEGIN obj_number := (to_jsonb(OLD)->>'record_number'); EXCEPTION WHEN OTHERS THEN obj_number := NULL; END;
    INSERT INTO public.audit_logs(object_type, object_id, object_number, action_type, old_value, new_value, changed_by, change_source)
    VALUES (TG_TABLE_NAME, obj_id, obj_number, 'delete', to_jsonb(OLD), NULL, actor, 'trigger');
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    obj_id := NEW.id;
    BEGIN obj_number := (to_jsonb(NEW)->>'record_number'); EXCEPTION WHEN OTHERS THEN obj_number := NULL; END;
    INSERT INTO public.audit_logs(object_type, object_id, object_number, action_type, old_value, new_value, changed_by, change_source)
    VALUES (TG_TABLE_NAME, obj_id, obj_number, 'insert', NULL, to_jsonb(NEW), actor, 'trigger');
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    obj_id := NEW.id;
    BEGIN obj_number := (to_jsonb(NEW)->>'record_number'); EXCEPTION WHEN OTHERS THEN obj_number := NULL; END;
    -- Only log if any non-system field changed
    IF to_jsonb(OLD) IS DISTINCT FROM to_jsonb(NEW) THEN
      INSERT INTO public.audit_logs(object_type, object_id, object_number, action_type, old_value, new_value, changed_by, change_source)
      VALUES (TG_TABLE_NAME, obj_id, obj_number, 'update', to_jsonb(OLD), to_jsonb(NEW), actor, 'trigger');
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.audit_changes() FROM PUBLIC, anon, authenticated;

-- ===== RLS on log tables =====
ALTER TABLE public.audit_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs    ENABLE ROW LEVEL SECURITY;

-- Read: any authenticated user; sensitive filtering happens in app layer based on role/object visibility
CREATE POLICY "auth_read_audit_logs"       ON public.audit_logs       FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_workflow_logs"    ON public.workflow_logs    FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_integration_logs" ON public.integration_logs FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['system_admin','crm_manager','handoff_officer']::app_role[]));
CREATE POLICY "auth_read_duplicate_logs"   ON public.duplicate_logs   FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_security_logs"    ON public.security_logs    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'system_admin'));

-- Writes from app: allow inserts so server functions running as user can record activity/workflow events
CREATE POLICY "auth_insert_workflow_logs"    ON public.workflow_logs    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_integration_logs" ON public.integration_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_duplicate_logs"   ON public.duplicate_logs   FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_security_logs"    ON public.security_logs    FOR INSERT TO authenticated WITH CHECK (true);
-- audit_logs is written exclusively by the SECURITY DEFINER trigger; no INSERT policy needed for app users
