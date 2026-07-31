-- =============================================================================
-- MeFamous — Phase 5: Notifications + referral rewards
-- Run AFTER 0001, 0002, 0003. Safe to re-run.
-- =============================================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('order_status', 'wallet_topup', 'referral_reward', 'system')),
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_unread_idx on public.notifications (user_id) where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users may only mark their own notifications read — nothing else about a
-- notification (title/body/link) is ever user-editable.
drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No insert policy: rows are only created by the SECURITY DEFINER trigger
-- functions below.

create or replace function public.mark_notification_read(p_notification_id uuid)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.notifications%rowtype;
begin
  update public.notifications
    set read_at = now()
    where id = p_notification_id and user_id = auth.uid()
    returning * into v_row;

  if not found then
    raise exception 'Notification % not found', p_notification_id;
  end if;

  return v_row;
end;
$$;

create or replace function public.mark_all_notifications_read()
returns void
language sql
security definer
set search_path = public
as $$
  update public.notifications set read_at = now()
  where user_id = auth.uid() and read_at is null;
$$;

-- ── referral_rewards — audit trail for referrer bonuses ─────────────────────
create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles (id) on delete cascade,
  referred_id uuid not null references public.profiles (id) on delete cascade,
  source_topup_id uuid references public.wallet_topups (id) on delete set null,
  amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists referral_rewards_referrer_id_idx on public.referral_rewards (referrer_id);

alter table public.referral_rewards enable row level security;

drop policy if exists referral_rewards_select_own on public.referral_rewards;
create policy referral_rewards_select_own
  on public.referral_rewards for select
  using (auth.uid() = referrer_id);

drop policy if exists referral_rewards_select_admin on public.referral_rewards;
create policy referral_rewards_select_admin
  on public.referral_rewards for select
  using (public.is_admin());

insert into public.app_settings (key, value)
values ('referral_reward_percent', '5'::jsonb)
on conflict (key) do nothing;

-- Lets a referrer's dashboard list who signed up under them. Row-level
-- visibility only — the referrals page itself selects just
-- (id, full_name, email, created_at), never wallet_balance/role, keeping
-- what a referrer can actually see narrow even though this policy grants
-- row-level access to the whole referred profile.
drop policy if exists profiles_select_referred on public.profiles;
create policy profiles_select_referred
  on public.profiles for select
  using (referred_by = auth.uid());

-- ── Order status change → notify the customer ───────────────────────────────
create or replace function public.notify_on_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status and new.status in ('completed', 'partial', 'cancelled', 'failed') then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.user_id,
      'order_status',
      case new.status
        when 'completed' then 'Order completed'
        when 'partial' then 'Order partially completed'
        when 'cancelled' then 'Order cancelled'
        when 'failed' then 'Order failed'
        else 'Order updated'
      end,
      format('Your order for %s units is now %s.', new.quantity, new.status),
      '/dashboard/orders'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists orders_notify_status_change on public.orders;
create trigger orders_notify_status_change
  after update of status on public.orders
  for each row
  execute function public.notify_on_order_status_change();

-- ── Wallet top-up completed → notify + pay referral reward on first topup ──
create or replace function public.handle_topup_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer_id uuid;
  v_reward_percent numeric;
  v_reward_amount numeric(12, 2);
  v_prior_completed_count int;
begin
  if new.status is distinct from old.status and new.status = 'completed' then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.user_id,
      'wallet_topup',
      'Wallet top-up confirmed',
      format('%s %s has been added to your wallet.', new.currency, new.amount),
      '/dashboard/wallet'
    );

    select referred_by into v_referrer_id from public.profiles where id = new.user_id;

    if v_referrer_id is not null then
      select count(*) into v_prior_completed_count
      from public.wallet_topups
      where user_id = new.user_id and status = 'completed' and id <> new.id;

      -- Only the referred user's FIRST completed top-up ever triggers a reward.
      if v_prior_completed_count = 0 then
        select coalesce((value #>> '{}')::numeric, 5)
          into v_reward_percent
          from public.app_settings where key = 'referral_reward_percent';

        v_reward_amount := round(new.amount * (v_reward_percent / 100.0), 2);

        if v_reward_amount > 0 then
          update public.profiles set wallet_balance = wallet_balance + v_reward_amount
            where id = v_referrer_id;

          insert into public.referral_rewards (referrer_id, referred_id, source_topup_id, amount)
          values (v_referrer_id, new.user_id, new.id, v_reward_amount);

          insert into public.notifications (user_id, type, title, body, link)
          values (
            v_referrer_id,
            'referral_reward',
            'Referral reward earned',
            format('You earned %s %s from a referral''s first top-up.', new.currency, v_reward_amount),
            '/dashboard/referrals'
          );
        end if;
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists wallet_topups_handle_completed on public.wallet_topups;
create trigger wallet_topups_handle_completed
  after update of status on public.wallet_topups
  for each row
  execute function public.handle_topup_completed();
