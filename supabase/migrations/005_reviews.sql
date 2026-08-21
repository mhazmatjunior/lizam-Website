-- ===========================================================================
-- Product reviews: star ratings, optional comment, optional photos.
-- Run in Supabase -> SQL Editor. Safe to run more than once.
--
-- Model (option A): anyone may submit, nothing is public until an admin
-- approves it. Supplying a valid order number earns a "Verified Purchase"
-- badge but is never required.
-- ===========================================================================

-- 1. The table ---------------------------------------------------------------
create table if not exists public.reviews (
  id           bigserial   primary key,

  -- Cascade: deleting a product should not leave orphaned reviews behind.
  product_id   bigint      not null references public.products (id) on delete cascade,

  author_name  text        not null,
  rating       smallint    not null check (rating between 1 and 5),
  title        text,
  -- Nullable on purpose: a star-only rating is allowed.
  body         text,

  -- Storage paths in the private review-photos bucket, e.g. ["12/ab.jpg"].
  -- Never public URLs; the app mints signed links for approved reviews only.
  photo_paths  jsonb       not null default '[]'::jsonb,

  -- Optional proof of purchase. Loose reference rather than a foreign key so a
  -- deleted order cannot wipe an otherwise valid review.
  order_id     text,
  is_verified  boolean     not null default false,

  -- pending | approved | rejected
  status       text        not null default 'pending',

  -- Coarse per-person marker used to stop one visitor rating the same product
  -- repeatedly. Not an identity: it is a hashed client value, best-effort only.
  fingerprint  text,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- The product page reads approved reviews for one product, newest first.
create index if not exists reviews_product_status_idx
  on public.reviews (product_id, status, created_at desc);

-- The admin queue reads pending ones across all products.
create index if not exists reviews_status_idx
  on public.reviews (status, created_at desc);

-- One rating per product per visitor. Partial so rejected rows do not block a
-- genuine resubmission.
create unique index if not exists reviews_one_per_visitor_idx
  on public.reviews (product_id, fingerprint)
  where fingerprint is not null and status <> 'rejected';


-- 2. Row level security ------------------------------------------------------
-- Same posture as orders: every read and write goes through the Next.js API
-- routes on the service-role key, which bypasses RLS. No anon policy, so a
-- leaked anon key cannot read unapproved reviews or write fake ones.
alter table public.reviews enable row level security;


-- 3. Private bucket for review photos ----------------------------------------
-- Private even though approved photos are shown publicly. An unapproved photo
-- must not be reachable by URL: someone could upload anything, and it would be
-- live on the internet until it was rejected. Approved photos are served via
-- /api/reviews/photo, which checks the review status and then redirects to a
-- short-lived signed link.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-photos', 'review-photos', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];


-- 4. Verify ------------------------------------------------------------------
select column_name, data_type
  from information_schema.columns
 where table_schema = 'public' and table_name = 'reviews'
 order by ordinal_position;

select id, public, file_size_limit from storage.buckets where id = 'review-photos';
