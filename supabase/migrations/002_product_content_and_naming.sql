-- ===========================================================================
-- Fixes the live product page. Run in Supabase -> SQL Editor.
--
-- Three problems this solves, all confirmed against the live API:
--   1. products has no characteristics/usps columns, so the API cannot return
--      them and the "Scent Characteristics" + "What Makes Us Different?"
--      sections render as nothing on production.
--   2. Product 71099 is still named "7TH OCT (Pre-Order)" in the database.
--      Editing src/data/products.ts does NOT change this: that file only seeds
--      an EMPTY table.
--   3. The fragrance content lives only in the code, never in the database.
--
-- Safe to run more than once.
-- ===========================================================================

-- 1. Columns -----------------------------------------------------------------
alter table public.products add column if not exists characteristics jsonb;
alter table public.products add column if not exists usps            jsonb;


-- 2. Rename: drop the "(Pre-Order)" suffix -----------------------------------
update public.products
   set name = '7TH OCT'
 where id = 71099
   and name <> '7TH OCT';


-- 3. PRICE -------------------------------------------------------------------
-- Rs 3,600 is the product price for every payment method (client brief, 19 Aug).
-- Delivery is added on top at checkout: free when paid in advance (Safepay or
-- bank transfer), Rs 200 for cash on delivery, and a city-based charge for
-- founder delivery. See src/data/pricing.ts.
update public.products
   set price = 3600
 where id = 71099
   and price <> 3600;


-- 4. Fragrance content -------------------------------------------------------
update public.products
   set notes = jsonb_build_object(
         'top',   'Crisp Apple, Rich Davana',
         'heart', 'Elegant Damask Rose, Earthy Cedarwood, Exotic Osmanthus',
         'base',  'Deep Vanilla Absolute, Warm Tonka Bean, Grounding Patchouli'
       ),
       characteristics = jsonb_build_object(
         'intensity', 'Parfum Intense',
         'profile',   'A captivating blend of Woody, Gourmand, Sweet, and Powdery accords',
         'longevity', 'Exceptional 15 to 20 Hours of lasting performance'
       )
 where id = 71099;


-- 5. Verify ------------------------------------------------------------------
select id,
       name,
       price,
       stock,
       characteristics is not null as has_characteristics,
       from public.products
 where id = 71099;
