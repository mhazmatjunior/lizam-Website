-- ===========================================================================
-- Add the payment_method column that the app has always assumed existed.
--
-- Without it, src/app/api/orders/route.ts falls back to appending the method
-- to the product name -- "7TH OCT x1 [bank_transfer]". The read path only
-- parsed the "[cod_...]" form, so bank transfers came back looking like
-- Safepay. That is why:
--   * every order showed "Safepay" in the admin,
--   * bank-transfer orders were auto-marked paid by the confirmation page,
--   * and the receipt upload panel never appeared.
--
-- Safe to run more than once.
-- ===========================================================================

-- 1. The column --------------------------------------------------------------
alter table public.orders
  add column if not exists payment_method text not null default 'safepay';


-- 2. Backfill from the "[method]" suffix the fallback wrote into product ------
update public.orders
   set payment_method = substring(product from '\[([a-z_]+)\]$')
 where product ~ '\[[a-z_]+\]$'
   and substring(product from '\[([a-z_]+)\]$') is not null;


-- 3. Clean the suffix back out of the product name ---------------------------
update public.orders
   set product = regexp_replace(product, '\s*\[[a-z_]+\]$', '')
 where product ~ '\[[a-z_]+\]$';


-- 4. Verify ------------------------------------------------------------------
select order_id, product, payment_method, status, amount
  from public.orders
 order by created_at desc;
