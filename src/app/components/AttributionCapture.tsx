"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/attribution";

/**
 * Records campaign parameters (utm_*, fbclid, gclid) when a visitor arrives,
 * so checkout can attach them to the order. Runs on every client-side
 * navigation too, in case a campaign link points deeper than the homepage.
 */
export default function AttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
  }, [pathname]);

  return null;
}
