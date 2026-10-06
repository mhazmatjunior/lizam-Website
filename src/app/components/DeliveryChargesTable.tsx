"use client";

import { useEffect, useState } from "react";
import { COD_ADVANCE, COD_DELIVERY_FEE } from "@/data/pricing";

/**
 * The published delivery charges.
 *
 * The standard COD fee is admin-editable (app_settings.delivery_fee), so it is
 * fetched the same way checkout fetches it rather than hard-coded here -- a
 * policy page quoting a fee the shop no longer charges is exactly the sort of
 * thing a compliance review picks up. COD_DELIVERY_FEE is the API's own default
 * and is used until the request resolves.
 *
 */
export default function DeliveryChargesTable() {
  const [codFee, setCodFee] = useState<number>(COD_DELIVERY_FEE);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.deliveryFee !== undefined) {
          setCodFee(data.settings.deliveryFee);
        }
      })
      .catch(() => {
        /* Keep the default: a missing fee must not blank out the policy. */
      });
  }, []);

  const rows: Array<{ method: string; charge: string; note: string }> = [
    {
      method: "Paid in advance (card, wallet or bank transfer)",
      charge: "Free",
      note: "Delivery is free nationwide, plus a 10% discount, when the full amount is paid before dispatch.",
    },
    {
      method: "Cash on Delivery",
      charge: `Rs ${codFee.toLocaleString("en-PK")}`,
      note: `Rs ${COD_ADVANCE.toLocaleString("en-PK")} is paid in advance to book the order; the rest of the total is paid in cash at your door.`,
    },
  ];

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-3 pr-4 text-[9px] uppercase tracking-[0.25em] font-black text-gold/80">
              Delivery Method
            </th>
            <th className="py-3 pr-4 text-[9px] uppercase tracking-[0.25em] font-black text-gold/80 whitespace-nowrap">
              Charge
            </th>
            <th className="py-3 text-[9px] uppercase tracking-[0.25em] font-black text-gold/80">
              How it is paid
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.method} className="border-b border-white/[0.06] align-top">
              <td className="py-4 pr-4 text-[12.5px] leading-relaxed text-white/80">{row.method}</td>
              <td className="py-4 pr-4 text-[12.5px] font-bold text-gold whitespace-nowrap">
                {row.charge}
              </td>
              <td className="py-4 text-[12px] leading-relaxed text-white/55">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
