-- ===========================================================================
-- Close the open-database hole.
--
-- The dashboard currently shows RLS "Disabled" on both tables. With RLS off,
-- anyone holding the anon key can read and write those tables directly through
-- the Supabase API -- and the anon key is public by design: it ships in the
-- browser bundle as NEXT_PUBLIC_SUPABASE_ANON_KEY. Today orders has 0 rows so
-- nothing is exposed, but the first real order would be readable by anyone.
--
-- Safe for this app: every query runs server-side in Next.js API routes using
-- the service-role key, which bypasses RLS. Verified -- no client component
-- imports the anon client for data access.
--
-- Safe to run more than once.
-- ===========================================================================

alter table public.orders   enable row level security;
alter table public.products enable row level security;

-- Products are public catalogue data. The app reads them server-side, but an
-- anon read policy keeps things working if the frontend ever queries directly.
drop policy if exists "products are publicly readable" on public.products;
create policy "products are publicly readable"
  on public.products for select to anon, authenticated using (true);

-- orders gets NO policy on purpose. Customer names, phone numbers and
-- addresses must never be reachable with the public anon key.


-- Verify: rowsecurity should be true for both tables.
select tablename, rowsecurity
  from pg_tables
 where schemaname = 'public'
   and tablename in ('orders', 'products');

select tablename, policyname, roles
  from pg_policies
 where schemaname = 'public'
 order by tablename;
