
DROP POLICY IF EXISTS "auth_insert_workflow_logs"    ON public.workflow_logs;
DROP POLICY IF EXISTS "auth_insert_integration_logs" ON public.integration_logs;
DROP POLICY IF EXISTS "auth_insert_duplicate_logs"   ON public.duplicate_logs;
DROP POLICY IF EXISTS "auth_insert_security_logs"    ON public.security_logs;

CREATE POLICY "auth_insert_workflow_logs" ON public.workflow_logs
  FOR INSERT TO authenticated
  WITH CHECK (performed_by = auth.uid());

CREATE POLICY "auth_insert_integration_logs" ON public.integration_logs
  FOR INSERT TO authenticated
  WITH CHECK (triggered_by = auth.uid());

CREATE POLICY "auth_insert_duplicate_logs" ON public.duplicate_logs
  FOR INSERT TO authenticated
  WITH CHECK (decided_by = auth.uid());

CREATE POLICY "auth_insert_security_logs" ON public.security_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
