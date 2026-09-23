-- ===========================================================================
-- Replace the pre-order QR pass with a unique coupon code.
-- Run in Supabase -> SQL Editor. Safe to run more than once.
--
-- Every pre-order gets its own code (e.g. "RAN-7KQ2-M9XW-4HTP") the moment it
-- is placed. It is shown on the thank-you screen and printed in every
-- pre-order email. When the balance is due the customer enters it on the
-- ordinary checkout page, uploads their transfer screenshot, and a matching
-- code completes the order.
--
-- The code is single use: coupon_used_at is stamped in the same statement that
-- completes the order, so a double tap or a replayed request finds nothing to
-- update.
--
-- balance_token / balance_token_used_at are no longer read by the app. They
-- are left in place rather than dropped so this migration destroys nothing;
-- balance_token_expires_at is still used as the deadline on the payment
-- window opened by "Send Payment Email".
-- ===========================================================================

alter table public.preorders
  add column if not exists coupon_code text;

alter table public.preorders
  add column if not exists coupon_used_at timestamptz;

comment on column public.preorders.coupon_code is
  'Unique code the customer enters at checkout to pay the balance and complete the pre-order.';
comment on column public.preorders.coupon_used_at is
  'When the coupon code completed the order. Non-null means the code is spent.';

-- Unique, compared case-insensitively. The app always stores upper case, so a
-- plain unique index is enough.
create unique index if not exists preorders_coupon_code_key
  on public.preorders (coupon_code);


-- Backfill: give every existing pre-order a code, so customers who were sent
-- a QR can be re-sent a coupon with "Resend Payment Email". gen_random_uuid()
-- draws from a cryptographic source; the hex alphabet is fine for a code
-- nobody types from memory.
update public.preorders
   set coupon_code = 'RAN-' || upper(
         substr(h, 1, 4) || '-' || substr(h, 5, 4) || '-' || substr(h, 9, 4)
       )
  from (select id as pid, replace(gen_random_uuid()::text, '-', '') as h
          from public.preorders
         where coupon_code is null) g
 where public.preorders.id = g.pid;


-- Verify ---------------------------------------------------------------------
select preorder_id, coupon_code, coupon_used_at
  from public.preorders
 order by created_at desc
 limit 20;
