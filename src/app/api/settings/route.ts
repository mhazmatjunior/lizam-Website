import { NextResponse } from "next/server";

// Global in-memory fallback for global settings
let globalSettings = {
  deliveryFee: 250,
};

export async function GET() {
  return NextResponse.json({
    success: true,
    settings: globalSettings,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (typeof body.deliveryFee === "number" && body.deliveryFee >= 0) {
      globalSettings.deliveryFee = body.deliveryFee;
      return NextResponse.json({
        success: true,
        settings: globalSettings,
        message: "Global delivery fee updated successfully",
      });
    }

    return NextResponse.json({ error: "Invalid delivery fee provided" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update global settings" }, { status: 500 });
  }
}
