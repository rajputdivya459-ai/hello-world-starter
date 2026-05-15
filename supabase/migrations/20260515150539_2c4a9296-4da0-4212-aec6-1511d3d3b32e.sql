-- ============================================================
-- Phase 1: Multi-tenant schema scaffold (additive only)
-- ============================================================

-- ─── Enums ───────────────────────────────────────────────────
do $$ begin
  create type public.app_role as enum ('super_admin', 'super_owner', 'owner', 'employee');
exception when duplicate_object then null; end $$;

-- ─── Vendors (gyms / tenants) ────────────────────────────────
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  owner_user_id uuid,
  is_demo boolean not null default false,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── App users (mirrors auth.users with app metadata) ────────
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  vendor_id uuid references public.vendors(id) on delete set null,
  full_name text,
  phone text,
  email text,
  is_active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_app_users_vendor on public.app_users(vendor_id);
create index if not exists idx_app_users_auth on public.app_users(auth_user_id);

-- ─── User roles ──────────────────────────────────────────────
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  vendor_id uuid references public.vendors(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, role, vendor_id)
);
create index if not exists idx_user_roles_user on public.user_roles(user_id);

-- ─── Role permissions (fine-grained module access) ───────────
create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role public.app_role not null,
  module text not null,
  action text not null,
  allowed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (role, module, action)
);

-- ─── Super owners + access map ───────────────────────────────
create table if not exists public.super_owners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.super_owner_vendor_access (
  id uuid primary key default gen_random_uuid(),
  super_owner_id uuid not null references public.super_owners(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (super_owner_id, vendor_id)
);
create index if not exists idx_so_access_vendor on public.super_owner_vendor_access(vendor_id);

-- ─── Helper functions (SECURITY DEFINER, no recursion) ───────
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.current_vendor_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select vendor_id from public.app_users
  where auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.can_access_vendor(_user_id uuid, _vendor_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select case
    when _vendor_id is null then false
    when public.has_role(_user_id, 'super_admin') then true
    when exists (
      select 1 from public.app_users
      where auth_user_id = _user_id and vendor_id = _vendor_id
    ) then true
    when exists (
      select 1 from public.super_owners so
      join public.super_owner_vendor_access sa on sa.super_owner_id = so.id
      where so.user_id = _user_id and sa.vendor_id = _vendor_id
    ) then true
    else false
  end
$$;

-- ─── Trainer assignments + sessions ──────────────────────────
create table if not exists public.trainer_assignments (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  trainer_id uuid not null,
  member_id uuid not null,
  start_date date not null default current_date,
  end_date date,
  total_sessions integer not null default 0,
  sessions_completed integer not null default 0,
  status text not null default 'active',
  notes text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ta_vendor on public.trainer_assignments(vendor_id);
create index if not exists idx_ta_trainer on public.trainer_assignments(trainer_id);
create index if not exists idx_ta_member on public.trainer_assignments(member_id);

create table if not exists public.trainer_sessions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  assignment_id uuid not null references public.trainer_assignments(id) on delete cascade,
  session_date date not null default current_date,
  status text not null default 'completed',
  notes text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_ts_assignment on public.trainer_sessions(assignment_id);
create index if not exists idx_ts_vendor on public.trainer_sessions(vendor_id);

-- ─── Recycle bin ─────────────────────────────────────────────
create table if not exists public.recycle_bin (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  payload jsonb not null,
  deleted_by uuid,
  deleted_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  is_demo boolean not null default false
);
create index if not exists idx_rb_vendor on public.recycle_bin(vendor_id);
create index if not exists idx_rb_expires on public.recycle_bin(expires_at);

-- ─── Invoices ────────────────────────────────────────────────
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  member_id uuid,
  payment_id uuid,
  invoice_number text,
  amount numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'paid',
  issued_date date not null default current_date,
  pdf_url text,
  metadata jsonb not null default '{}'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_inv_vendor on public.invoices(vendor_id);
create index if not exists idx_inv_member on public.invoices(member_id);

-- ─── Notifications ───────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  user_id uuid not null,
  type text not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notif_user on public.notifications(user_id, is_read);

-- ─── Popups ──────────────────────────────────────────────────
create table if not exists public.popups (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  title text not null,
  body text,
  image_url text,
  cta_label text,
  cta_url text,
  is_visible boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_popups_vendor on public.popups(vendor_id);

-- ─── YouTube content ─────────────────────────────────────────
create table if not exists public.youtube_testimonials (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  title text,
  video_id text not null,
  thumbnail_url text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_yt_test_vendor on public.youtube_testimonials(vendor_id);

create table if not exists public.youtube_shorts (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  title text,
  video_id text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_yt_shorts_vendor on public.youtube_shorts(vendor_id);

-- ─── Add vendor_id / is_demo to existing business tables ─────
alter table public.members            add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.members            add column if not exists is_demo boolean not null default false;
alter table public.members            add column if not exists updated_at timestamptz not null default now();

alter table public.payments           add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.payments           add column if not exists is_demo boolean not null default false;
alter table public.payments           add column if not exists updated_at timestamptz not null default now();

alter table public.plans              add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.plans              add column if not exists is_demo boolean not null default false;
alter table public.plans              add column if not exists updated_at timestamptz not null default now();

alter table public.leads              add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.leads              add column if not exists is_demo boolean not null default false;

alter table public.expenses           add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.expenses           add column if not exists is_demo boolean not null default false;
alter table public.expenses           add column if not exists updated_at timestamptz not null default now();

alter table public.trainers           add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.trainers           add column if not exists is_demo boolean not null default false;
alter table public.trainers           add column if not exists updated_at timestamptz not null default now();

alter table public.branches           add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.branches           add column if not exists is_demo boolean not null default false;
alter table public.branches           add column if not exists updated_at timestamptz not null default now();

alter table public.gallery            add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.gallery            add column if not exists is_demo boolean not null default false;
alter table public.gallery            add column if not exists updated_at timestamptz not null default now();

alter table public.reviews            add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.reviews            add column if not exists is_demo boolean not null default false;
alter table public.reviews            add column if not exists updated_at timestamptz not null default now();

alter table public.testimonials       add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.testimonials       add column if not exists is_demo boolean not null default false;
alter table public.testimonials       add column if not exists updated_at timestamptz not null default now();

alter table public.website_content    add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.website_content    add column if not exists is_demo boolean not null default false;

alter table public.website_sections   add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.website_sections   add column if not exists is_demo boolean not null default false;

alter table public.gym_settings       add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.gym_settings       add column if not exists is_demo boolean not null default false;

alter table public.contact_settings   add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.contact_settings   add column if not exists is_demo boolean not null default false;

-- ─── updated_at trigger reuse ────────────────────────────────
do $$
declare t text;
begin
  for t in select unnest(array[
    'vendors','app_users','super_owners','trainer_assignments',
    'invoices','popups'
  ]) loop
    execute format(
      'drop trigger if exists trg_%1$s_updated_at on public.%1$s;
       create trigger trg_%1$s_updated_at before update on public.%1$s
       for each row execute function public.update_updated_at_column();',
      t
    );
  end loop;
end $$;

-- ─── Enable RLS on every new table ───────────────────────────
alter table public.vendors                    enable row level security;
alter table public.app_users                  enable row level security;
alter table public.user_roles                 enable row level security;
alter table public.role_permissions           enable row level security;
alter table public.super_owners               enable row level security;
alter table public.super_owner_vendor_access  enable row level security;
alter table public.trainer_assignments        enable row level security;
alter table public.trainer_sessions           enable row level security;
alter table public.recycle_bin                enable row level security;
alter table public.invoices                   enable row level security;
alter table public.notifications              enable row level security;
alter table public.popups                     enable row level security;
alter table public.youtube_testimonials       enable row level security;
alter table public.youtube_shorts             enable row level security;

-- ─── RLS policies ────────────────────────────────────────────

-- vendors: super_admin manages all; users can read vendors they belong to
create policy "super_admin manages vendors"
  on public.vendors for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "users read accessible vendors"
  on public.vendors for select to authenticated
  using (public.can_access_vendor(auth.uid(), id));

-- app_users: self read, super_admin all, vendor-mates can read
create policy "users read self app_user"
  on public.app_users for select to authenticated
  using (auth_user_id = auth.uid() or public.has_role(auth.uid(), 'super_admin')
         or public.can_access_vendor(auth.uid(), vendor_id));

create policy "users update self app_user"
  on public.app_users for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

create policy "super_admin manages app_users"
  on public.app_users for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- user_roles: super_admin only
create policy "super_admin manages user_roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "users read own roles"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid());

-- role_permissions: super_admin manages, all authenticated can read
create policy "super_admin manages role_permissions"
  on public.role_permissions for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "authenticated read role_permissions"
  on public.role_permissions for select to authenticated
  using (true);

-- super_owners: super_admin manages, self read
create policy "super_admin manages super_owners"
  on public.super_owners for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "self read super_owner"
  on public.super_owners for select to authenticated
  using (user_id = auth.uid());

-- super_owner_vendor_access
create policy "super_admin manages so_access"
  on public.super_owner_vendor_access for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "super_owner reads own access"
  on public.super_owner_vendor_access for select to authenticated
  using (exists (
    select 1 from public.super_owners so
    where so.id = super_owner_id and so.user_id = auth.uid()
  ));

-- Generic vendor-scoped policy template applied to the rest:
do $$
declare t text;
begin
  for t in select unnest(array[
    'trainer_assignments','trainer_sessions','recycle_bin','invoices',
    'popups','youtube_testimonials','youtube_shorts'
  ]) loop
    execute format(
      'create policy "vendor members manage %1$s"
         on public.%1$s for all to authenticated
         using (public.can_access_vendor(auth.uid(), vendor_id))
         with check (public.can_access_vendor(auth.uid(), vendor_id));',
      t
    );
  end loop;
end $$;

-- notifications: recipient-only
create policy "users read own notifications"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

create policy "users update own notifications"
  on public.notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "vendor members insert notifications"
  on public.notifications for insert to authenticated
  with check (public.can_access_vendor(auth.uid(), vendor_id));

create policy "super_admin manages notifications"
  on public.notifications for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- Public read for landing-page content (visibility-gated)
create policy "public read visible popups"
  on public.popups for select to anon
  using (is_visible = true
         and (starts_at is null or starts_at <= now())
         and (ends_at is null or ends_at >= now()));

create policy "public read visible yt_testimonials"
  on public.youtube_testimonials for select to anon
  using (is_visible = true);

create policy "public read visible yt_shorts"
  on public.youtube_shorts for select to anon
  using (is_visible = true);
