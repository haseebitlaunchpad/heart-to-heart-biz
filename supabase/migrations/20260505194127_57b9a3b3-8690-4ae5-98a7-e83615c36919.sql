
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM (
  'system_admin', 'crm_manager', 'relationship_manager',
  'catalog_manager', 'approver', 'handoff_officer',
  'leadership_viewer', 'integration_user'
);

-- =========================================================
-- REUSABLE updated_at TRIGGER FUNCTION
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- USER PROFILES + ROLES (RBAC)
-- =========================================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_number TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  job_title TEXT,
  department TEXT,
  team_id UUID,
  manager_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  default_territory_id UUID,
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Asia/Riyadh',
  status TEXT NOT NULL DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);
CREATE TRIGGER trg_user_profiles_updated BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID,
  UNIQUE (user_id, role)
);

-- security definer has_role to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  );
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- MASTER / GLOBAL DATA
-- =========================================================
CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_countries_updated BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (country_id, code)
);
CREATE TRIGGER trg_regions_updated BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES public.regions(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  name_ar TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_cities_updated BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_currencies_updated BEFORE UPDATE ON public.currencies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE public.sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_sectors_updated BEFORE UPDATE ON public.sectors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sub_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (sector_id, code)
);

-- =========================================================
-- ORGANIZATION
-- =========================================================
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT,
  parent_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  manager_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);
CREATE TRIGGER trg_teams_updated BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_team_fk FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_role TEXT,
  is_team_lead BOOLEAN NOT NULL DEFAULT false,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (team_id, user_id)
);

CREATE TABLE public.territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
  owner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  manager_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_territories_updated BEFORE UPDATE ON public.territories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_territory_fk FOREIGN KEY (default_territory_id) REFERENCES public.territories(id) ON DELETE SET NULL;

CREATE TABLE public.assignment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_type TEXT NOT NULL,
  channel TEXT,
  sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  territory_id UUID REFERENCES public.territories(id) ON DELETE SET NULL,
  assigned_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority INT NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_assignment_rules_updated BEFORE UPDATE ON public.assignment_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- GENERIC LOOKUP TABLES (status/type/stage/etc.)
-- All share the same shape: code, name, optional sort_order, is_active
-- =========================================================
-- Lead setup
CREATE TABLE public.lead_stages          (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, sort_order INT DEFAULT 100, color TEXT, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.lead_statuses        (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, sort_order INT DEFAULT 100, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.lead_temperatures    (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, sort_order INT DEFAULT 100, color TEXT, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.lead_source_channels (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.lead_disqualification_reasons (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.lead_nurture_reasons (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);

-- Account setup
CREATE TABLE public.account_categories   (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.investor_types       (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.account_statuses     (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);

-- Contact setup
CREATE TABLE public.contact_roles        (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.communication_channels (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);

-- Opportunity setup
CREATE TABLE public.opportunity_types    (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, family TEXT, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.opportunity_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.lifecycle_phases     (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, sort_order INT DEFAULT 100, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.opportunity_statuses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, color TEXT, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.visibility_types     (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.investment_paths     (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT, is_active BOOLEAN NOT NULL DEFAULT true);

-- Match setup
CREATE TABLE public.match_statuses       (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, color TEXT, sort_order INT DEFAULT 100, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.match_types          (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.approval_statuses    (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, color TEXT, is_active BOOLEAN NOT NULL DEFAULT true);

-- Activity setup
CREATE TABLE public.activity_types       (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, icon TEXT, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.activity_statuses    (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, color TEXT, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.activity_outcomes    (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);

-- Financial setup
CREATE TABLE public.investment_size_bands (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, min_amount NUMERIC, max_amount NUMERIC, currency_code TEXT, sort_order INT DEFAULT 100, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.funding_sources      (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.funding_statuses     (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.investment_timelines (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);

-- Handoff setup
CREATE TABLE public.handoff_statuses     (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, color TEXT, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.handoff_checklist_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT, is_required BOOLEAN NOT NULL DEFAULT true, sort_order INT DEFAULT 100, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE public.integration_statuses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
-- Helper: enable RLS + read-for-authenticated + admin-only-write on a list of tables
DO $$
DECLARE
  t TEXT;
  setup_tables TEXT[] := ARRAY[
    'countries','regions','cities','currencies','languages','sectors','sub_sectors',
    'teams','team_members','territories','assignment_rules',
    'lead_stages','lead_statuses','lead_temperatures','lead_source_channels',
    'lead_disqualification_reasons','lead_nurture_reasons',
    'account_categories','investor_types','account_statuses',
    'contact_roles','communication_channels',
    'opportunity_types','opportunity_categories','lifecycle_phases',
    'opportunity_statuses','visibility_types','investment_paths',
    'match_statuses','match_types','approval_statuses',
    'activity_types','activity_statuses','activity_outcomes',
    'investment_size_bands','funding_sources','funding_statuses','investment_timelines',
    'handoff_statuses','handoff_checklist_items','integration_statuses'
  ];
BEGIN
  FOREACH t IN ARRAY setup_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY "auth_read_%I" ON public.%I FOR SELECT TO authenticated USING (true);', t, t);
    EXECUTE format('CREATE POLICY "admin_write_%I" ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''system_admin'')) WITH CHECK (public.has_role(auth.uid(), ''system_admin''));', t, t);
  END LOOP;
END $$;

-- user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read_all_authenticated" ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_self" ON public.user_profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_admin_all" ON public.user_profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'system_admin')) WITH CHECK (public.has_role(auth.uid(), 'system_admin'));

-- user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_read_self_or_admin" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'system_admin'));
CREATE POLICY "roles_admin_write" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'system_admin')) WITH CHECK (public.has_role(auth.uid(), 'system_admin'));
