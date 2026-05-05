
-- RBAC: permissions catalog + role->permission mapping
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  resource text not null,
  action text not null,
  description text,
  unique (resource, action)
);

create table if not exists public.role_permissions (
  role public.app_role not null,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role, permission_id)
);

alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists "perm read" on public.permissions;
drop policy if exists "perm admin" on public.permissions;
create policy "perm read" on public.permissions for select to authenticated using (true);
create policy "perm admin" on public.permissions for all to authenticated
  using (public.has_role(auth.uid(),'system_admin')) with check (public.has_role(auth.uid(),'system_admin'));

drop policy if exists "rp read" on public.role_permissions;
drop policy if exists "rp admin" on public.role_permissions;
create policy "rp read" on public.role_permissions for select to authenticated using (true);
create policy "rp admin" on public.role_permissions for all to authenticated
  using (public.has_role(auth.uid(),'system_admin')) with check (public.has_role(auth.uid(),'system_admin'));

create or replace function public.has_permission(_user uuid, _resource text, _action text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role = ur.role
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = _user and p.resource = _resource and p.action = _action
  ) or public.has_role(_user, 'system_admin'::public.app_role)
$$;

-- Seed permissions
insert into public.permissions (resource, action, description) values
  ('leads','create','Create leads'),
  ('leads','read','Read leads'),
  ('leads','update','Update leads'),
  ('leads','delete','Delete leads'),
  ('leads','convert','Convert leads'),
  ('leads','change_status','Change lead stage/status'),
  ('accounts','create',null),('accounts','read',null),('accounts','update',null),('accounts','delete',null),
  ('contacts','create',null),('contacts','read',null),('contacts','update',null),('contacts','delete',null),
  ('opportunity_catalog','create',null),('opportunity_catalog','read',null),('opportunity_catalog','update',null),('opportunity_catalog','delete',null),
  ('opportunity_matches','create',null),('opportunity_matches','read',null),('opportunity_matches','update',null),('opportunity_matches','delete',null),('opportunity_matches','change_status',null),
  ('approvals','read',null),('approvals','approve',null),('approvals','reject',null),
  ('handoffs','create',null),('handoffs','read',null),('handoffs','update',null),('handoffs','delete',null),('handoffs','change_status',null),
  ('activities','create',null),('activities','read',null),('activities','update',null),('activities','delete',null),
  ('admin','manage_users','Manage users and roles'),
  ('admin','manage_setup','Manage lookup tables')
on conflict (resource, action) do nothing;

-- Default role->permission seed (admin gets all via has_permission shortcut)
insert into public.role_permissions (role, permission_id)
select 'crm_manager'::public.app_role, id from public.permissions
where resource in ('leads','accounts','contacts','activities','opportunity_matches','handoffs')
on conflict do nothing;

insert into public.role_permissions (role, permission_id)
select 'relationship_manager'::public.app_role, id from public.permissions
where (resource in ('leads','accounts','contacts','activities') and action in ('create','read','update','change_status','convert'))
   or (resource in ('opportunity_catalog','opportunity_matches','approvals') and action = 'read')
   or (resource = 'opportunity_matches' and action in ('create','update'))
on conflict do nothing;

insert into public.role_permissions (role, permission_id)
select 'catalog_manager'::public.app_role, id from public.permissions
where resource = 'opportunity_catalog' or (resource in ('leads','accounts','opportunity_matches') and action = 'read')
on conflict do nothing;

insert into public.role_permissions (role, permission_id)
select 'approver'::public.app_role, id from public.permissions
where action in ('read','approve','reject')
on conflict do nothing;

insert into public.role_permissions (role, permission_id)
select 'handoff_officer'::public.app_role, id from public.permissions
where resource = 'handoffs' or action = 'read'
on conflict do nothing;

insert into public.role_permissions (role, permission_id)
select 'leadership_viewer'::public.app_role, id from public.permissions
where action = 'read'
on conflict do nothing;
