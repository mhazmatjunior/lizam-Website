-- ===========================================================================
-- Pre-orders.
-- Run in Supabase -> SQL Editor. Safe to run more than once.
--
-- A pre-order is a two-payment purchase:
--   1. The customer pays a deposit (set per product) to reserve the item.
--   2. Later the admin sends a unique payment link for the remaining balance.
--
-- Both payments use the same manual bank/wallet + screenshot flow as the rest
-- of the checkout, so each one has its own proof/reference/verified_at trio
-- rather than a single shared set of columns.
-- ===========================================================================

-- 1. Products: opt a product into pre-ordering ------------------------------
alter table public.products
  add column if not exists preorder_enabled boolean not null default false;

alter table public.products
  add column if not exists preorder_amount numeric not null default 0;

comment on column public.products.preorder_enabled is
  'When true the storefront offers Pre-Order instead of Add to Cart.';
comment on column public.products.preorder_amount is
  'Deposit payable up front to reserve one unit. The balance (price - deposit) is collected later.';


-- 2. The pre-orders table ----------------------------------------------------
create table if not exists public.preorders (
  id                       bigserial   primary key,
  -- Customer-facing reference, e.g. "PRE-1787234049226".
  preorder_id              text        not null unique,

  -- Customer ----------------------------------------------------------------
  name                     text        not null,
  email                    text        not null,
  phone                    text        not null,
  address                  text        not null,
  city                     text,

  -- Product snapshot --------------------------------------------------------
  -- Prices are copied in rather than joined, so editing the product later
  -- never silently rewrites what a customer already agreed to pay.
  product_id               bigint      references public.products (id) on delete set null,
  product_name             text        not null default '',
  quantity                 integer     not null default 1,
  unit_price               numeric     not null default 0,

  -- Money -------------------------------------------------------------------
  currency                 text        not null default 'PKR',
  -- unit_price * quantity. The goods total, delivery excluded.
  total_amount             numeric     not null default 0,
  -- What the customer was asked to pay up front (deposit_amount * quantity).
  deposit_amount           numeric     not null default 0,
  -- What the admin has actually verified as received. Stays 0 until approval.
  deposit_paid             numeric     not null default 0,
  -- Charged with the balance, not with the deposit, so it can be set once the
  -- dispatch destination is known. Admin-editable per pre-order.
  delivery_fee             numeric     not null default 0,
  balance_paid             numeric     not null default 0,
  -- Always consistent by construction -- a maintained column would drift the
  -- first time any of its inputs was updated on its own.
  balance_amount           numeric
    generated always as (total_amount + delivery_fee - deposit_paid - balance_paid) stored,

  -- Lifecycle ---------------------------------------------------------------
  -- deposit_unverified -> deposit_paid -> balance_requested
  --   -> balance_unverified -> fully_paid
  -- with deposit_rejected / balance_rejected / cancelled as off-ramps.
  status                   text        not null default 'deposit_unverified',

  -- Deposit payment ---------------------------------------------------------
  deposit_method           text,
  deposit_proof_url        text,
  deposit_reference        text,
  deposit_verified_at      timestamptz,

  -- Balance payment ---------------------------------------------------------
  -- Unguessable token behind the emailed payment link. Nullable because it is
  -- only minted when the admin sends the email, and cleared once spent.
  balance_token            text        unique,
  balance_token_expires_at timestamptz,
  balance_email_sent_at    timestamptz,
  balance_method           text,
  balance_proof_url        text,
  balance_reference        text,
  balance_verified_at      timestamptz,

  -- Fulfilment --------------------------------------------------------------
  -- Set once fully paid: the orders.order_id this pre-order became.
  order_id                 text,
  tracker                  text,
  admin_notes              text,

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists preorders_created_at_idx on public.preorders (created_at desc);
create index if not exists preorders_status_idx     on public.preorders (status);
create index if not exists preorders_email_idx      on public.preorders (lower(email));
-- The balance link looks a pre-order up by token on every page load.
create index if not exists preorders_balance_token_idx on public.preorders (balance_token);


-- 3. Row level security ------------------------------------------------------
-- Same posture as orders: every read/write goes through a Next.js API route on
-- the service-role key, which bypasses RLS. With RLS on and no permissive
-- policy, a leaked anon key cannot read customer names, phones or addresses.
alter table public.preorders enable row level security;

-- preorders deliberately gets no anon policy.


-- 4. Verify ------------------------------------------------------------------
select column_name, data_type, is_nullable, column_default
  from information_schema.columns
 where table_schema = 'public' and table_name = 'preorders'
 order by ordinal_position;

select column_name, data_type, column_default
  from information_schema.columns
 where table_schema = 'public' and table_name = 'products'
   and column_name in ('preorder_enabled', 'preorder_amount');
