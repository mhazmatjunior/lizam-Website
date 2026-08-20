-- ===========================================================================
-- Base schema. ONLY for a fresh/empty Supabase project (e.g. your own dev
-- project). If the target project already has `orders` and `products` -- as
-- the live one does -- SKIP this file and run 001 and 002 instead.
--
-- Safe to run more than once.
-- ===========================================================================

-- products -------------------------------------------------------------------
-- Ids are assigned explicitly by the seed data (7TH OCT is 71099), so this is
-- a plain bigint rather than an identity column.
create table if not exists public.products (
  id               bigint primary key,
  name             text        not null,
  price            numeric     not null,
  category         text        not null default 'Signature Collection',
  description      text        not null default '',
  long_description text        not null default '',
  image            text        not null default '/placeholder.png',
  stock            integer     not null default 0,
  notes            jsonb       not null default '{"top":"","heart":"","base":""}'::jsonb,
  characteristics  jsonb,
  usps             jsonb,
  created_at       timestamptz not null default now()
);

-- orders ---------------------------------------------------------------------
create table if not exists public.orders (
  id                bigserial   primary key,
  order_id          text        not null unique,
  name              text        not null,
  email             text        not null,
  phone             text        not null,
  address           text        not null,
  product           text        not null default '',
  amount            numeric     not null default 0,
  currency          text        not null default 'PKR',
  -- pending | awaiting_verification | proof_rejected | processing
  -- | paid | shipped | cancelled
  status            text        not null default 'pending',
  tracker           text,
  payment_method    text        not null default 'safepay',
  payment_proof_url text,
  payment_reference text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx     on public.orders (status);

-- Row level security ---------------------------------------------------------
-- Every read/write goes through Next.js API routes on the service-role key,
-- which bypasses RLS. Enabling RLS with no permissive policy on orders means a
-- leaked anon key cannot read customer names, phones or addresses.
alter table public.orders   enable row level security;
alter table public.products enable row level security;

drop policy if exists "products are publicly readable" on public.products;
create policy "products are publicly readable"
  on public.products for select to anon, authenticated using (true);

-- orders deliberately gets no anon policy.

select table_name, column_name, data_type
  from information_schema.columns
 where table_schema = 'public' and table_name in ('orders','products')
 order by table_name, ordinal_position;
