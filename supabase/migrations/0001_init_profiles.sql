-- =============================================================================
-- MeFamous — Phase 2: Auth & Profiles foundation
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh
-- project before deploying. Safe to re-run: guarded with IF NOT EXISTS /
-- CREATE OR REPLACE wherever Postgres supports it.
-- =============================================================================

-- ── Roles ────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('customer', 'reseller', 'moderator', 'admin', 'super_admin');
  end if;
end $$;

-- ── profiles ─────────────────────────────────────────────────────────────────
-- One row per auth.users row. Never trust `role` or `wallet_balance` from
-- client input — both are locked down by the trigger below.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'customer',
  avatar_url text,
  wallet_balance numeric(12, 2) not null default 0,
  referral_code text not null unique,
  referred_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_referred_by_idx on public.profiles (referred_by);
create index if not exists profiles_role_idx on public.profiles (role);

-- ── updated_at bookkeeping ───────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ── is_admin() helper ────────────────────────────────────────────────────────
-- SECURITY DEFINER so it can read profiles.role without triggering the RLS
-- policies below recursively (it runs as the function owner, which is
-- exempt from RLS on tables it owns).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

-- ── Guard against self-escalation ────────────────────────────────────────────
-- Row-level security controls which rows a user can touch, not which
-- columns — this trigger stops a customer from PATCHing their own role or
-- wallet_balance even though the update policy allows updating their row.
create or replace function public.protect_sensitive_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.wallet_balance := old.wallet_balance;
    new.referral_code := old.referral_code;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_sensitive_columns on public.profiles;
create trigger profiles_protect_sensitive_columns
  before update on public.profiles
  for each row
  execute function public.protect_sensitive_profile_columns();

-- ── Auto-provision a profile row on signup ──────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  final_role public.user_role;
  new_code text;
  attempt int := 0;
begin
  requested_role := new.raw_user_meta_data ->> 'requested_role';

  -- Only 'customer' or 'reseller' may ever be self-selected at signup.
  -- moderator/admin/super_admin can only be granted later by an existing admin.
  if requested_role = 'reseller' then
    final_role := 'reseller';
  else
    final_role := 'customer';
  end if;

  loop
    new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    begin
      insert into public.profiles (id, email, full_name, role, referral_code, referred_by)
      values (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'full_name',
        final_role,
        new_code,
        (
          select id from public.profiles
          where referral_code = nullif(new.raw_user_meta_data ->> 'referral_code', '')
          limit 1
        )
      );
      exit;
    exception when unique_violation then
      attempt := attempt + 1;
      if attempt > 5 then
        raise exception 'Could not generate a unique referral code after % attempts', attempt;
      end if;
    end;
  end loop;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin
  on public.profiles for select
  using (public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- No insert/delete policies are defined on purpose: rows are created only by
-- the handle_new_user() trigger (SECURITY DEFINER) and deleted only via the
-- auth.users cascade — direct client inserts/deletes are denied by default.
