-- ===========================================================================
-- Per-order delivery cost, and somewhere durable to keep the default.
-- Run in Supabase -> SQL Editor. Safe to run more than once.
--
-- Two problems this solves:
--   1. Orders had no reliable delivery_fee column, so the amount was a single
--      lump and the delivery portion could not be seen or changed afterwards.
--   2. The global default fee lived in a module variable in
--      src/app/api/settings/route.ts. That resets on every Vercel cold start
--      and is not shared between instances, so changing it in the admin
--      appeared to work and then silently reverted.
-- ===========================================================================

-- 1. Per-order delivery fee --------------------------------------------------
alter table public.orders
  add column if not exists delivery_fee numeric not null default 0;

comment on column public.orders.delivery_fee is
  'Delivery portion of amount. amount = product subtotal + delivery_fee.';


-- 2. Durable app settings ----------------------------------------------------
-- A tiny key/value table rather than one column per setting, so adding the
-- next setting needs no migration.
create table if not exists public.app_settings (
  key        text        primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);

-- Same posture as the other tables: reads and writes go through the API on the
-- service-role key, which bypasses RLS. No anon policy.
alter table public.app_settings enable row level security;

-- Seed the standard delivery fee. Rs 200 matches the client's brief
-- (Rs 3,600 online with free delivery, Rs 3,800 cash on delivery).
insert into public.app_settings (key, value)
values ('delivery_fee', '200'::jsonb)
on conflict (key) do nothing;


-- 3. Verify ------------------------------------------------------------------
select column_name, data_type, column_default
  from information_schema.columns
 where table_schema = 'public' and table_name = 'orders'
   and column_name = 'delivery_fee';

select key, value from public.app_settings;
