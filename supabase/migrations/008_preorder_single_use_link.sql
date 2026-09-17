-- ===========================================================================
-- Make the emailed balance-payment link single use.
-- Run in Supabase -> SQL Editor. Safe to run more than once.
--
-- The link is now delivered as a QR code the customer scans. A printed or
-- screenshotted QR outlives the email it arrived in and is easy to pass on by
-- accident, so the token it carries has to stop working the moment it has done
-- its job rather than staying live for its full 30 days.
--
-- "Used" means the customer submitted their balance payment through it. The
-- token is spent in the same statement that records the payment, so a second
-- submission -- a double tap, a forwarded code, a replayed request -- finds
-- nothing to update. Resending the payment email mints a fresh token and
-- clears this again.
-- ===========================================================================

alter table public.preorders
  add column if not exists balance_token_used_at timestamptz;

comment on column public.preorders.balance_token_used_at is
  'When the customer completed their balance payment through the QR link. Non-null means the link is spent and will not open again.';


-- Verify ---------------------------------------------------------------------
select column_name, data_type, is_nullable
  from information_schema.columns
 where table_schema = 'public' and table_name = 'preorders'
   and column_name in ('balance_token', 'balance_token_expires_at', 'balance_token_used_at')
 order by ordinal_position;
