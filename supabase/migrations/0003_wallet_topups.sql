-- =============================================================================
-- MeFamous — Phase 4: Wallet top-ups (Korapay + manually-verified crypto)
-- Run AFTER 0001 and 0002. Safe to re-run.
-- =============================================================================

create table if not exists public.wallet_topups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  reference text not null unique,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'NGN',
  method text not null check (method in ('korapay', 'crypto')),
  crypto_asset text,
  crypto_tx_note text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wallet_topups_user_id_idx on public.wallet_topups (user_id);
create index if not exists wallet_topups_status_idx on public.wallet_topups (status);

drop trigger if exists wallet_topups_set_updated_at on public.wallet_topups;
create trigger wallet_topups_set_updated_at
  before update on public.wallet_topups
  for each row
  execute function public.set_updated_at();

alter table public.wallet_topups enable row level security;

drop policy if exists wallet_topups_select_own on public.wallet_topups;
create policy wallet_topups_select_own
  on public.wallet_topups for select
  using (auth.uid() = user_id);

drop policy if exists wallet_topups_select_admin on public.wallet_topups;
create policy wallet_topups_select_admin
  on public.wallet_topups for select
  using (public.is_admin());

-- Users may create their OWN pending top-up request directly (no funds move
-- yet at this point — the row is just "I intend to pay"). Only the RPCs
-- below can ever move it out of 'pending'.
drop policy if exists wallet_topups_insert_own on public.wallet_topups;
create policy wallet_topups_insert_own
  on public.wallet_topups for insert
  with check (auth.uid() = user_id and status = 'pending');

-- ── credit_wallet_topup — idempotent: only ever fires once per reference ────
create or replace function public.credit_wallet_topup(p_reference text)
returns public.wallet_topups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_topup public.wallet_topups%rowtype;
begin
  if auth.role() <> 'service_role' and not public.is_admin() then
    raise exception 'Not permitted';
  end if;

  select * into v_topup from public.wallet_topups where reference = p_reference for update;
  if not found then
    raise exception 'Top-up with reference % not found', p_reference;
  end if;

  if v_topup.status <> 'pending' then
    -- Already credited or already failed — return as-is rather than
    -- double-crediting. Webhooks can and do arrive more than once.
    return v_topup;
  end if;

  update public.profiles set wallet_balance = wallet_balance + v_topup.amount where id = v_topup.user_id;

  update public.wallet_topups set status = 'completed' where reference = p_reference
  returning * into v_topup;

  return v_topup;
end;
$$;

create or replace function public.fail_wallet_topup(p_reference text)
returns public.wallet_topups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_topup public.wallet_topups%rowtype;
begin
  if auth.role() <> 'service_role' and not public.is_admin() then
    raise exception 'Not permitted';
  end if;

  update public.wallet_topups set status = 'failed'
  where reference = p_reference and status = 'pending'
  returning * into v_topup;

  if not found then
    select * into v_topup from public.wallet_topups where reference = p_reference;
  end if;

  return v_topup;
end;
$$;
