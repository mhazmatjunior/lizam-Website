"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Printer, ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { PAYMENT_LABELS } from "@/data/payment-labels";

interface Order {
  orderId: string;
  status: string;
  paymentMethod: string;
  paymentSubMethod: string | null;
  amount: number;
  currency: string;
  deliveryFee: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  tracker: string | null;
  createdAt: string;
}

/**
 * Delivery receipt for one order — the slip that goes out with the parcel.
 *
 * Deliberately outside the (dashboard) route group so it prints without the
 * admin sidebar, and on a white ground rather than the dark admin theme:
 * printing the dark UI would waste a cartridge per order. Still under /admin,
 * so the middleware guards it.
 */
export default function ReceiptPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        // The public shape has no name field; that means the session is missing.
        if (!d.order?.name) throw new Error("Not authorised — please sign in to the admin panel again.");
        setOrder(d.order);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  const money = (n: number) => `Rs ${Number(n || 0).toLocaleString()}`;
  const productTotal = order ? Math.max(0, order.amount - (order.deliveryFee || 0)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full space-y-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-neutral-700">{error || "Order not found"}</p>
          <Link href="/admin/orders" className="inline-block text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-black">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-800"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </button>
      </div>

      {/* The slip itself */}
      <div className="max-w-[820px] mx-auto p-6 print:p-0">
        <div className="bg-white p-10 print:p-0 shadow-sm print:shadow-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-black pb-5">
            <div>
              <h1 className="text-3xl font-black tracking-tight">RAANAE</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mt-1">
                Delivery Receipt
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">Order Reference</p>
              <p className="text-xl font-black tracking-tight">{order.orderId}</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                {new Date(order.createdAt).toLocaleString("en-GB", {
                  day: "2-digit", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Deliver to / payment */}
          <div className="grid grid-cols-2 gap-8 py-6 border-b border-neutral-200">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Deliver To</p>
              <p className="text-base font-bold">{order.name}</p>
              <p className="text-[13px] leading-relaxed text-neutral-700 whitespace-pre-line">{order.address}</p>
              <p className="text-[13px] font-semibold pt-1">{order.phone}</p>
              <p className="text-[12px] text-neutral-500">{order.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Payment</p>
              <p className="text-[13px] font-semibold">
                {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
              </p>
              {order.paymentSubMethod && (
                <p className="text-[12px] text-neutral-500 capitalize">{order.paymentSubMethod}</p>
              )}
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold pt-3">Status</p>
              <p className="text-[13px] font-semibold uppercase">{order.status.replace(/_/g, " ")}</p>
              {order.tracker && (
                <>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold pt-3">Tracking</p>
                  <p className="text-[13px] font-mono">{order.tracker}</p>
                </>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="py-6">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-neutral-300">
                  <th className="text-left py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Item</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-100">
                  <td className="py-3">{order.product}</td>
                  <td className="py-3 text-right tabular-nums">{money(productTotal)}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-3 text-neutral-600">Delivery</td>
                  <td className="py-3 text-right tabular-nums text-neutral-600">
                    {order.deliveryFee > 0 ? money(order.deliveryFee) : "Free"}
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-black uppercase tracking-wide">Total</td>
                  <td className="py-4 text-right text-xl font-black tabular-nums">{money(order.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signature strip — the reason this is a delivery receipt rather
              than an invoice: someone signs for the parcel. */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-black">
            <div>
              <div className="h-12 border-b border-neutral-400" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mt-2">
                Received By (Signature)
              </p>
            </div>
            <div>
              <div className="h-12 border-b border-neutral-400" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mt-2">
                Date
              </p>
            </div>
          </div>

          <p className="text-[10px] text-neutral-400 text-center pt-8 leading-relaxed">
            Thank you for your order. Quote reference {order.orderId} in any correspondence.
          </p>
        </div>
      </div>
    </div>
  );
}
