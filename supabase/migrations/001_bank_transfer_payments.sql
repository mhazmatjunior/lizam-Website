-- ===========================================================================
-- Manual bank-transfer payments: schema + private storage bucket.
-- Run in Supabase -> SQL Editor. Safe to run more than once.
-- ===========================================================================

-- 1. Order columns -----------------------------------------------------------
-- Storage PATH of the receipt, not a public URL: the bucket is private and the
-- app mints a short-lived signed link when an admin views it.
alter table public.orders add column if not exists payment_proof_url text;

-- Bank/wallet transaction reference typed in by the customer. This is what
-- gets matched against the real bank statement; a screenshot alone is easy to
-- fake.
alter table public.orders add column if not exists payment_reference text;

create unique index if not exists orders_order_id_key on public.orders (order_id);

-- Statuses now in use: pending, awaiting_verification, proof_rejected,
-- processing, paid, shipped, cancelled. Left as free text to match the code,
-- which compares plain strings.


-- 2. Private bucket for receipts ---------------------------------------------
-- public = false is the whole point: receipts show account numbers and
-- customer names.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs', 'payment-proofs', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];


-- 3. Keep the bucket server-only ---------------------------------------------
-- No policies are granted to anon/authenticated on purpose: all reads and
-- writes go through the API routes on the service-role key, which keeps uploads
-- behind the order-state checks in
-- src/app/api/orders/[orderId]/proof/route.ts.
drop policy if exists "payment proofs are not publicly readable" on storage.objects;
create policy "payment proofs are not publicly readable"
  on storage.objects for select to anon
  using (bucket_id <> 'payment-proofs');


-- 4. Verify ------------------------------------------------------------------
select column_name, data_type
  from information_schema.columns
 where table_schema = 'public' and table_name = 'orders'
   and column_name in ('payment_proof_url', 'payment_reference');

select id, public, file_size_limit from storage.buckets where id = 'payment-proofs';
