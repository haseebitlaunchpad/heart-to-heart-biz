
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  email_lc text := lower(NEW.email);
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- Demo role assignment
  IF email_lc = 'admin@senaei.demo' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'system_admin') ON CONFLICT DO NOTHING;
  ELSIF email_lc = 'crm.manager@senaei.demo' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'crm_manager') ON CONFLICT DO NOTHING;
  ELSIF email_lc = 'rm@senaei.demo' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'relationship_manager') ON CONFLICT DO NOTHING;
  ELSIF email_lc = 'catalog@senaei.demo' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'catalog_manager') ON CONFLICT DO NOTHING;
  ELSIF email_lc = 'approver@senaei.demo' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'approver') ON CONFLICT DO NOTHING;
  ELSIF email_lc = 'handoff@senaei.demo' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'handoff_officer') ON CONFLICT DO NOTHING;
  ELSIF email_lc = 'leadership@senaei.demo' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'leadership_viewer') ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Backfill existing crm.manager user
INSERT INTO public.user_roles(user_id, role)
SELECT id, 'crm_manager'::app_role FROM public.user_profiles
WHERE lower(email) = 'crm.manager@senaei.demo'
ON CONFLICT DO NOTHING;
