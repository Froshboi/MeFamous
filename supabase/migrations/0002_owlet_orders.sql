-- =============================================================================
-- MeFamous — Phase 3: Owlet service catalog, orders, wallet ledger glue,
-- API request logging, and app settings.
-- Run AFTER 0001_init_profiles.sql. Safe to re-run.
-- =============================================================================

create extension if not exists pgcrypto;

-- ── Fix: service-role writes to profiles were being silently reverted ───────
-- 0001's protect_sensitive_profile_columns() only exempted admins
-- (public.is_admin(), which reads auth.uid()). Calls made with the Supabase
-- service-role key have no auth.uid() at all, so wallet credits/debits made
-- by trusted server code were getting clobbered back to their old value.
-- auth.role() reports 'service_role' for those calls — exempt it too.
create or replace function public.protect_sensitive_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' and not public.is_admin() then
    new.role := old.role;
    new.wallet_balance := old.wallet_balance;
    new.referral_code := old.referral_code;
  end if;
  return new;
end;
$$;

-- ── services — synced from The-Owlet, never hand-entered ────────────────────
-- `id` IS the Owlet service id (the provider is the platform's only source
-- for services, so there is no separate internal id to keep in sync).
create table if not exists public.services (
  id bigint primary key,
  name text not null,
  owlet_type text not null,
  category text not null,
  provider_rate numeric(12, 4) not null,
  markup_percent numeric(6, 2) not null default 30,
  customer_rate numeric(12, 4) generated always as
    (provider_rate * (1 + markup_percent / 100.0)) stored,
  min_quantity integer not null,
  max_quantity integer not null,
  supports_refill boolean not null default false,
  supports_cancel boolean not null default false,
  is_active boolean not null default true,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists services_category_idx on public.services (category);
create index if not exists services_is_active_idx on public.services (is_active);

alter table public.services enable row level security;

drop policy if exists services_select_active_public on public.services;
create policy services_select_active_public
  on public.services for select
  using (is_active = true or public.is_admin());

-- Inserts/updates happen only through the sync job (admin client / service
-- role), which bypasses RLS entirely — no write policy is defined for
-- regular authenticated users on purpose.

-- ── orders ───────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  service_id bigint not null references public.services (id),
  owlet_order_id bigint,
  link text not null,
  quantity integer not null,
  provider_charge numeric(12, 4),
  price_charged numeric(12, 2) not null,
  currency text not null default 'USD',
  status text not null default 'pending'
    check (status in ('pending', 'submitted', 'in_progress', 'partial', 'completed', 'cancelled', 'failed')),
  start_count text,
  remains text,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_owlet_order_id_idx on public.orders (owlet_order_id);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists orders_select_admin on public.orders;
create policy orders_select_admin
  on public.orders for select
  using (public.is_admin());

-- No direct insert/update policies: rows are only ever created/mutated via
-- the SECURITY DEFINER functions below, which enforce their own checks.

-- ── place_order — atomically reserve funds + create a pending order ─────────
-- Called from the "create order" Server Action *before* the external Owlet
-- API call. If the subsequent HTTP call to Owlet fails, the action must call
-- fail_order_and_refund() to release the hold — see confirm_order() below.
create or replace function public.place_order(
  p_service_id bigint,
  p_link text,
  p_quantity integer,
  p_price numeric
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_balance numeric(12, 2);
  v_service public.services%rowtype;
  v_order public.orders%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_price <= 0 then
    raise exception 'Order price must be greater than zero';
  end if;

  select * into v_service from public.services where id = p_service_id and is_active = true;
  if not found then
    raise exception 'Service % is not available', p_service_id;
  end if;

  if p_quantity < v_service.min_quantity or p_quantity > v_service.max_quantity then
    raise exception 'Quantity must be between % and %', v_service.min_quantity, v_service.max_quantity;
  end if;

  -- Lock the wallet row so two concurrent orders can't both pass the balance check.
  select wallet_balance into v_balance from public.profiles where id = v_user_id for update;

  if v_balance is null then
    raise exception 'Profile not found for current user';
  end if;

  if v_balance < p_price then
    raise exception 'Insufficient wallet balance';
  end if;

  update public.profiles set wallet_balance = wallet_balance - p_price where id = v_user_id;

  insert into public.orders (user_id, service_id, link, quantity, price_charged, status)
  values (v_user_id, p_service_id, p_link, p_quantity, p_price, 'pending')
  returning * into v_order;

  return v_order;
end;
$$;

-- ── confirm_order — attach the Owlet order id once submission succeeds ──────
create or replace function public.confirm_order(p_order_id uuid, p_owlet_order_id bigint)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found then
    raise exception 'Order % not found', p_order_id;
  end if;

  if auth.role() <> 'service_role' and not public.is_admin() and v_order.user_id <> auth.uid() then
    raise exception 'Not permitted';
  end if;

  update public.orders
    set owlet_order_id = p_owlet_order_id, status = 'submitted'
    where id = p_order_id
    returning * into v_order;

  return v_order;
end;
$$;

-- ── fail_order_and_refund — release the hold when the provider call fails ───
create or replace function public.fail_order_and_refund(p_order_id uuid, p_reason text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order % not found', p_order_id;
  end if;

  if v_order.status <> 'pending' then
    raise exception 'Order % is not pending, refusing to refund', p_order_id;
  end if;

  update public.profiles
    set wallet_balance = wallet_balance + v_order.price_charged
    where id = v_order.user_id;

  update public.orders
    set status = 'failed', failure_reason = p_reason
    where id = p_order_id
    returning * into v_order;

  return v_order;
end;
$$;

-- ── update_order_progress — used by the status-sync job/admin actions ───────
create or replace function public.update_order_progress(
  p_order_id uuid,
  p_status text,
  p_start_count text default null,
  p_remains text default null,
  p_provider_charge numeric default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  if auth.role() <> 'service_role' and not public.is_admin() then
    raise exception 'Not permitted';
  end if;

  update public.orders set
    status = coalesce(p_status, status),
    start_count = coalesce(p_start_count, start_count),
    remains = coalesce(p_remains, remains),
    provider_charge = coalesce(p_provider_charge, provider_charge)
  where id = p_order_id
  returning * into v_order;

  if not found then
    raise exception 'Order % not found', p_order_id;
  end if;

  return v_order;
end;
$$;

-- ── owlet_api_logs — every request/response for the admin log viewer ────────
create table if not exists public.owlet_api_logs (
  id bigint generated always as identity primary key,
  action text not null,
  request_params jsonb,
  success boolean not null,
  http_status integer,
  error_message text,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists owlet_api_logs_created_at_idx on public.owlet_api_logs (created_at desc);
create index if not exists owlet_api_logs_success_idx on public.owlet_api_logs (success);

alter table public.owlet_api_logs enable row level security;

drop policy if exists owlet_api_logs_select_admin on public.owlet_api_logs;
create policy owlet_api_logs_select_admin
  on public.owlet_api_logs for select
  using (public.is_admin());

-- Inserts happen only from server code using the service-role key, which
-- bypasses RLS — no insert policy is defined for regular users.

-- ── app_settings — small key/value store for admin toggles ──────────────────
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row
  execute function public.set_updated_at();

alter table public.app_settings enable row level security;

drop policy if exists app_settings_admin_all on public.app_settings;
create policy app_settings_admin_all
  on public.app_settings for select
  using (public.is_admin());

insert into public.app_settings (key, value)
values ('owlet_auto_sync_enabled', 'false'::jsonb)
on conflict (key) do nothing;
