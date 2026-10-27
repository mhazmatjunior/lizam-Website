-- ===========================================================================
-- Marketing attribution on orders.
-- Run in Supabase -> SQL Editor. Safe to run more than once.
--
-- The flat utm_* columns hold the LAST campaign touch before the order -- the
-- usual "which ad converted" answer -- so they can be filtered and grouped
-- directly. `attribution` keeps the full record as JSON:
--   { "first": {...}, "last": {...} }
-- each touch carrying utm_*, fbclid/gclid, landing_page, referrer and a
-- timestamp. First touch is the visit that introduced the customer.
--
-- Until this runs, /api/orders saves orders without these fields rather than
-- failing.
-- ===========================================================================

-- Columns /api/orders has always written but the live table never had. Their
-- absence failed every order's first insert and dropped it into a fallback
-- that stuffed payment details into `product` as "[m:...|ss:...]" tags and
-- discarded delivery_fee (so COD orders recorded Rs 0 delivery). Adding them
-- lets the normal insert succeed. Old tagged rows are still parsed by the
-- admin, so nothing needs backfilling.
alter table public.orders add column if not exists payment_sub_method text;
alter table public.orders add column if not exists payment_screenshot text;

alter table public.orders add column if not exists utm_source   text;
alter table public.orders add column if not exists utm_medium   text;
alter table public.orders add column if not exists utm_campaign text;
alter table public.orders add column if not exists utm_content  text;
alter table public.orders add column if not exists attribution  jsonb;

comment on column public.orders.utm_source is   'Last-touch utm_source before the order.';
comment on column public.orders.utm_medium is   'Last-touch utm_medium before the order.';
comment on column public.orders.utm_campaign is 'Last-touch utm_campaign before the order.';
comment on column public.orders.utm_content is  'Last-touch utm_content before the order.';
comment on column public.orders.attribution is  'First and last campaign touches: utm_*, click ids, landing page, referrer.';

create index if not exists orders_utm_campaign_idx on public.orders (utm_campaign);


-- Verify ---------------------------------------------------------------------
select order_id, utm_source, utm_medium, utm_campaign, utm_content, attribution
  from public.orders
 order by created_at desc
 limit 20;
