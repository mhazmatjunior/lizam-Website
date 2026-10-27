import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/auth";
import { DEFAULT_DELIVERY_FEE, readDeliveryFee } from "@/lib/settings";

/**
 * Global shop settings, stored in public.app_settings.
 *
 * This used to be a module-level variable. On Vercel each serverless instance
 * has its own memory and cold starts reset it, so saving a new delivery fee
 * appeared to work, then reverted — and two visitors could see two different
 * fees. It has to live in the database.
 */

export async function GET() {
  try {
    const deliveryFee = await readDeliveryFee();
    return NextResponse.json({ success: true, settings: { deliveryFee } });
  } catch (error: any) {
    console.error("❌ Settings read error:", error.message);
    // Checkout depends on this, so never fail hard.
    return NextResponse.json({
      success: true,
      settings: { deliveryFee: DEFAULT_DELIVERY_FEE },
      warning: "Using default delivery fee",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Anyone could otherwise set the shop's delivery fee to zero.
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: "Not authorised" }, { status: 401 });
    }

    const body = await req.json();
    const fee = Number(body.deliveryFee);

    if (!Number.isFinite(fee) || fee < 0 || fee > 100000) {
      return NextResponse.json({ error: "Enter a delivery fee between 0 and 100,000" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert(
        { key: "delivery_fee", value: fee, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (error) {
      console.error("❌ Settings write error:", error.message);
      return NextResponse.json(
        { error: "Could not save. Has migration 006 been run?" },
        { status: 500 }
      );
    }

    console.log(`⚙️ Default delivery fee set to Rs ${fee}`);
    return NextResponse.json({
      success: true,
      settings: { deliveryFee: fee },
      message: "Default delivery fee updated",
    });
  } catch (error: any) {
    console.error("❌ Settings update error:", error.message);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
