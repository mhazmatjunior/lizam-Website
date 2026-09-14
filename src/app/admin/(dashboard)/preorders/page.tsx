"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Clock,
  X,
  Check,
  Mail,
  Loader2,
  AlertCircle,
  ExternalLink,
  Truck,
  Ban,
  RefreshCw,
} from "lucide-react";
import { preorderStatusLabel, type PreorderStatus } from "@/lib/preorder";

interface Preorder {
  preorderId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  depositAmount: number;
  depositPaid: number;
  deliveryFee: number;
  balancePaid: number;
  balanceAmount: number;
  status: PreorderStatus;
  depositMethod: string;
  depositProofUrl: string;
  depositReference: string;
  depositVerifiedAt: string | null;
  hasBalanceLink: boolean;
  balanceEmailSentAt: string | null;
  balanceMethod: string;
  balanceProofUrl: string;
  balanceReference: string;
  balanceVerifiedAt: string | null;
  orderId: string;
  tracker: string;
  createdAt: string;
}

/** Chip colours per stage: amber = waiting on us, blue = waiting on them, green = settled. */
const STATUS_STYLES: Record<string, string> = {
  deposit_unverified: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  deposit_paid: "text-sky-400 bg-sky-400/10 border-sky-400/25",
  deposit_rejected: "text-rose-400 bg-rose-400/10 border-rose-400/25",
  balance_requested: "text-violet-400 bg-violet-400/10 border-violet-400/25",
  balance_unverified: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  balance_rejected: "text-rose-400 bg-rose-400/10 border-rose-400/25",
  fully_paid: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  cancelled: "text-white/30 bg-white/5 border-white/10",
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "deposit_unverified", label: "Verify Deposit" },
  { id: "deposit_paid", label: "Deposit Paid" },
  { id: "balance_requested", label: "Balance Requested" },
  { id: "balance_unverified", label: "Verify Balance" },
  { id: "fully_paid", label: "Fully Paid" },
];

const money = (n: number) => `Rs ${Number(n || 0).toLocaleString()}`;

export default function PreordersPage() {
  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Preorder | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [feeDraft, setFeeDraft] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/preorders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load pre-orders");
      setPreorders(data.preorders || []);
    } catch (err: any) {
      setToast({ kind: "err", text: err?.message || "Could not load pre-orders" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // Keep the open drawer in step with the list after an action refreshes it.
  useEffect(() => {
    if (!selected) return;
    const fresh = preorders.find((p) => p.preorderId === selected.preorderId);
    if (fresh && fresh !== selected) setSelected(fresh);
  }, [preorders]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return preorders.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.preorderId.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.productName.toLowerCase().includes(q)
      );
    });
  }, [preorders, search, filter]);

  const totals = useMemo(
    () => ({
      count: preorders.length,
      collected: preorders.reduce((s, p) => s + p.depositPaid + p.balancePaid, 0),
      outstanding: preorders
        .filter((p) => p.status !== "cancelled")
        .reduce((s, p) => s + p.balanceAmount, 0),
      awaiting: preorders.filter(
        (p) => p.status === "deposit_unverified" || p.status === "balance_unverified"
      ).length,
    }),
    [preorders]
  );

  const act = async (preorderId: string, body: any, okText: string) => {
    setBusy(preorderId);
    try {
      const res = await fetch(`/api/preorders/${preorderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      await load();
      setToast({ kind: "ok", text: okText });
    } catch (err: any) {
      setToast({ kind: "err", text: err?.message || "Action failed" });
    } finally {
      setBusy(null);
    }
  };

  const sendPaymentEmail = async (p: Preorder) => {
    setBusy(p.preorderId);
    try {
      const res = await fetch(`/api/preorders/${p.preorderId}/send-payment-email`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send the payment email");
      await load();
      setToast({
        kind: "ok",
        text: `Payment link for ${money(data.balanceAmount)} sent to ${data.sentTo}`,
      });
    } catch (err: any) {
      setToast({ kind: "err", text: err?.message || "Could not send the payment email" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Pre-Orders</h1>
          <p className="text-[10px] text-white/30 mt-2 tracking-wide">
            Deposits taken, balances owed, and the payment links you have sent.
          </p>
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            load();
          }}
          className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gold bg-gold/10 border border-gold/20 flex items-center gap-2 hover:bg-gold/15 transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Totals ------------------------------------------------------------ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pre-Orders", value: String(totals.count), accent: "text-white" },
          { label: "Collected", value: money(totals.collected), accent: "text-emerald-400" },
          { label: "Outstanding", value: money(totals.outstanding), accent: "text-gold" },
          { label: "Awaiting Your Check", value: String(totals.awaiting), accent: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25">{s.label}</p>
            <p className={`text-xl font-black mt-2 ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filters -------------------------------------------------- */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-white/20 absolute left-5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, customer, email, phone or product…"
            className="w-full bg-white/[0.02] border border-white/10 focus:border-gold/30 rounded-2xl pl-13 pr-5 py-4 text-xs text-white outline-none font-medium"
            style={{ paddingLeft: "3.25rem" }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                filter === f.id
                  ? "bg-gold/10 border-gold/40 text-gold"
                  : "bg-white/[0.02] border-white/10 text-white/40 hover:text-white/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List -------------------------------------------------------------- */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-gold animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-24 space-y-3">
          <Clock className="w-8 h-8 text-white/10 mx-auto" />
          <p className="text-xs text-white/30">
            {preorders.length === 0
              ? "No pre-orders yet. Enable pre-order on a product in Inventory."
              : "No pre-orders match this filter."}
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/5 text-[8px] font-black uppercase tracking-[0.3em] text-white/25">
                  <th className="px-6 py-5 text-left">Customer</th>
                  <th className="px-6 py-5 text-left">Product</th>
                  <th className="px-6 py-5 text-right">Paid</th>
                  <th className="px-6 py-5 text-right">Remaining</th>
                  <th className="px-6 py-5 text-left">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr
                    key={p.preorderId}
                    onClick={() => {
                      setSelected(p);
                      setFeeDraft(String(p.deliveryFee || ""));
                    }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-5">
                      <p className="text-[11px] font-black text-white/90">{p.name}</p>
                      <p className="text-[9px] text-white/30 mt-0.5">{p.email}</p>
                      <p className="text-[9px] text-gold/60 mt-0.5 font-black tracking-wider">
                        {p.preorderId}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[11px] font-bold text-white/70">
                        {p.productName} &times; {p.quantity}
                      </p>
                      <p className="text-[9px] text-white/25 mt-0.5">{money(p.totalAmount)} goods</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-[11px] font-black text-emerald-400">
                        {money(p.depositPaid + p.balancePaid)}
                      </p>
                      {p.depositPaid === 0 && (
                        <p className="text-[8px] text-amber-400/70 mt-0.5 uppercase tracking-wider">
                          {money(p.depositAmount)} unverified
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p
                        className={`text-[11px] font-black ${
                          p.balanceAmount > 0 ? "text-gold" : "text-white/25"
                        }`}
                      >
                        {money(p.balanceAmount)}
                      </p>
                      {p.deliveryFee > 0 && (
                        <p className="text-[8px] text-white/25 mt-0.5">
                          incl. {money(p.deliveryFee)} delivery
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          STATUS_STYLES[p.status] || STATUS_STYLES.cancelled
                        }`}
                      >
                        {preorderStatusLabel(p.status)}
                      </span>
                      {p.balanceEmailSentAt && p.status !== "fully_paid" && (
                        <p className="text-[8px] text-white/25 mt-1.5 flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" />
                          Link sent {new Date(p.balanceEmailSentAt).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {p.status === "deposit_unverified" && (
                          <button
                            onClick={() =>
                              act(p.preorderId, { action: "verify_deposit" }, "Deposit verified")
                            }
                            disabled={busy === p.preorderId}
                            className="px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
                          >
                            Verify Deposit
                          </button>
                        )}
                        {p.status === "balance_unverified" && (
                          <button
                            onClick={() =>
                              act(
                                p.preorderId,
                                { action: "verify_balance" },
                                "Balance verified — pre-order confirmed"
                              )
                            }
                            disabled={busy === p.preorderId}
                            className="px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
                          >
                            Verify Balance
                          </button>
                        )}
                        {p.status !== "fully_paid" && p.status !== "cancelled" && p.balanceAmount > 0 && (
                          <button
                            onClick={() => sendPaymentEmail(p)}
                            disabled={busy === p.preorderId}
                            className="px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                          >
                            {busy === p.preorderId ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Mail className="w-2.5 h-2.5" />
                            )}
                            {p.hasBalanceLink ? "Resend" : "Send"} Payment Email
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail drawer ------------------------------------------------------ */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 inset-y-0 w-full max-w-lg bg-[#080808] border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#080808]/95 backdrop-blur-xl border-b border-white/5 px-7 py-5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold">
                    {selected.preorderId}
                  </p>
                  <p className="text-[9px] text-white/25 mt-1">
                    Placed {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-7 space-y-8">
                {/* Customer */}
                <section className="space-y-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25">
                    Customer
                  </p>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2 text-[11px]">
                    <p className="font-black text-white">{selected.name}</p>
                    <p className="text-white/50">{selected.email}</p>
                    <p className="text-white/50">{selected.phone}</p>
                    <p className="text-white/40 leading-relaxed pt-2 border-t border-white/5">
                      {selected.address}
                      {selected.city && `, ${selected.city}`}
                    </p>
                  </div>
                </section>

                {/* Money */}
                <section className="space-y-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25">
                    Payment Breakdown
                  </p>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3 text-[11px]">
                    <div className="flex justify-between text-white/50">
                      <span>
                        {selected.productName} &times; {selected.quantity}
                      </span>
                      <span className="text-white/80 font-bold">{money(selected.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Delivery</span>
                      <span className="text-white/80 font-bold">{money(selected.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 pt-3 border-t border-white/5">
                      <span>Deposit Verified</span>
                      <span className="font-bold">{money(selected.depositPaid)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Balance Verified</span>
                      <span className="font-bold">{money(selected.balancePaid)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">
                        Remaining
                      </span>
                      <span className="text-lg font-black text-gold">
                        {money(selected.balanceAmount)}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Delivery fee, set before requesting the balance */}
                {selected.status !== "fully_paid" && (
                  <section className="space-y-3">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25">
                      Delivery Charge
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={feeDraft}
                        onChange={(e) => setFeeDraft(e.target.value)}
                        placeholder="0"
                        className="flex-grow bg-white/[0.02] border border-white/10 focus:border-gold/30 rounded-xl px-4 py-3 text-xs text-white outline-none font-medium"
                      />
                      <button
                        onClick={() =>
                          act(
                            selected.preorderId,
                            { action: "set_delivery_fee", deliveryFee: Number(feeDraft || 0) },
                            "Delivery charge updated"
                          )
                        }
                        disabled={busy === selected.preorderId}
                        className="px-5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
                      >
                        Save
                      </button>
                    </div>
                    <p className="text-[9px] text-white/25 leading-relaxed">
                      Set this before sending the payment email — it is added to the balance the
                      customer is asked for.
                    </p>
                  </section>
                )}

                {/* Proofs */}
                <section className="space-y-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25">
                    Payment Proof
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Deposit",
                        url: selected.depositProofUrl,
                        method: selected.depositMethod,
                        ref: selected.depositReference,
                        verified: selected.depositVerifiedAt,
                      },
                      {
                        title: "Balance",
                        url: selected.balanceProofUrl,
                        method: selected.balanceMethod,
                        ref: selected.balanceReference,
                        verified: selected.balanceVerifiedAt,
                      },
                    ].map((proof) => (
                      <div
                        key={proof.title}
                        className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                            {proof.title}
                          </p>
                          <p className="text-[9px] text-white/30 mt-0.5 capitalize">
                            {proof.url
                              ? `${proof.method || "—"}${proof.ref ? ` · ${proof.ref}` : ""}`
                              : "Not submitted yet"}
                          </p>
                          {proof.verified && (
                            <p className="text-[8px] text-emerald-400/70 mt-0.5 uppercase tracking-wider">
                              Verified {new Date(proof.verified).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {proof.url && (
                          <a
                            href={proof.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/60 hover:text-gold transition-colors flex items-center gap-1.5 flex-shrink-0"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Linked order, once confirmed */}
                {selected.orderId && (
                  <section className="space-y-3">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25">
                      Confirmed Order
                    </p>
                    <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-3">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-black text-emerald-400">{selected.orderId}</p>
                        <p className="text-[9px] text-white/40 mt-0.5">
                          Raised in Orders and ready to dispatch.
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Actions */}
                <section className="space-y-3 pt-2">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25">
                    Actions
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {selected.status !== "fully_paid" &&
                      selected.status !== "cancelled" &&
                      selected.balanceAmount > 0 && (
                        <button
                          onClick={() => sendPaymentEmail(selected)}
                          disabled={busy === selected.preorderId}
                          className="btn-premium-gold h-13 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                          {busy === selected.preorderId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Mail className="w-3.5 h-3.5" />
                          )}
                          {selected.hasBalanceLink ? "Resend" : "Send"} Payment Email
                        </button>
                      )}

                    {selected.depositPaid === 0 && selected.status !== "cancelled" && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() =>
                            act(selected.preorderId, { action: "verify_deposit" }, "Deposit verified")
                          }
                          disabled={busy === selected.preorderId}
                          className="py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                          <Check className="w-3 h-3" />
                          Verify Deposit
                        </button>
                        <button
                          onClick={() =>
                            act(selected.preorderId, { action: "reject_deposit" }, "Deposit rejected")
                          }
                          disabled={busy === selected.preorderId}
                          className="py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-40"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {selected.status === "balance_unverified" && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() =>
                            act(
                              selected.preorderId,
                              { action: "verify_balance" },
                              "Balance verified — order confirmed"
                            )
                          }
                          disabled={busy === selected.preorderId}
                          className="py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                          <Check className="w-3 h-3" />
                          Verify Balance
                        </button>
                        <button
                          onClick={() =>
                            act(selected.preorderId, { action: "reject_balance" }, "Balance rejected")
                          }
                          disabled={busy === selected.preorderId}
                          className="py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-40"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {selected.status === "fully_paid" && (
                      <div className="flex gap-3">
                        <input
                          type="text"
                          defaultValue={selected.tracker}
                          onBlur={(e) =>
                            e.target.value !== selected.tracker &&
                            act(
                              selected.preorderId,
                              { action: "set_tracker", tracker: e.target.value },
                              "Tracking updated"
                            )
                          }
                          placeholder="Tracking reference"
                          className="flex-grow bg-white/[0.02] border border-white/10 focus:border-gold/30 rounded-xl px-4 py-3 text-xs text-white outline-none font-medium"
                        />
                        <span className="px-4 flex items-center text-white/20">
                          <Truck className="w-4 h-4" />
                        </span>
                      </div>
                    )}

                    {selected.status !== "cancelled" && selected.status !== "fully_paid" && (
                      <button
                        onClick={() =>
                          act(
                            selected.preorderId,
                            { action: "set_status", status: "cancelled" },
                            "Pre-order cancelled"
                          )
                        }
                        disabled={busy === selected.preorderId}
                        className="py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/[0.02] border border-white/10 text-white/40 hover:text-rose-400 hover:border-rose-500/30 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                      >
                        <Ban className="w-3 h-3" />
                        Cancel Pre-Order
                      </button>
                    )}
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast -------------------------------------------------------------- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-6 py-4 rounded-2xl border backdrop-blur-xl flex items-center gap-3 max-w-md ${
              toast.kind === "ok"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {toast.kind === "ok" ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <p className="text-[11px] font-medium leading-relaxed">{toast.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
