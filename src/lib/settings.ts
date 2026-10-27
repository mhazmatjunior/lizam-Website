import { supabaseAdmin } from "@/lib/supabase";
import { COD_DELIVERY_FEE } from "@/data/pricing";

/**
 * The COD delivery charge, as set in the admin (public.app_settings).
 *
 * Shared by /api/settings, which shows it at checkout, and order pricing,
 * which charges it -- so the fee a customer sees is the fee they are billed.
 */
export const DEFAULT_DELIVERY_FEE = COD_DELIVERY_FEE;

export async function readDeliveryFee(): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "delivery_fee")
    .maybeSingle();

  // Missing table or row (migration 006 not run yet) falls back to the default
  // rather than breaking checkout.
  if (error || !data) return DEFAULT_DELIVERY_FEE;

  const n = Number(data.value);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_DELIVERY_FEE;
}
