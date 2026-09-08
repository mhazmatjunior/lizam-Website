"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Package, Truck, Wallet, RefreshCw, Calendar, XCircle
} from "lucide-react";

interface Order {
  orderId: string;
  name: string;
  product: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  deliveryFee?: number;
  createdAt: string;
}

/** Manufacturing cost per bottle. Matches the audit ledger. */
const BOTTLE_UNIT_COST = 2100;

/** Statuses that represent money actually earned. */
const EARNING = ["paid", "delivered", "shipped", "cashondelivery"];

/** Statuses that represent money lost rather than never made. */
const LOST = ["cancelled", "refunded", "returned"];

const PERIODS = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "90", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

const bottlesIn = (product: string) => {
  const m = product?.match(/x(\d+)/i);
  return m ? parseInt(m[1], 10) : 1;
};

const money = (n: number) => `Rs ${Math.round(n).toLocaleString()}`;

export default function ProfitLossPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const report = useMemo(() => {
    const cutoff = period === "all" ? 0 : Date.now() - Number(period) * 24 * 60 * 60 * 1000;
    const inPeriod = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);

    const earned = inPeriod.filter((o) => EARNING.includes(o.status));
    const lost = inPeriod.filter((o) => LOST.includes(o.status));

    let revenue = 0, bottleCost = 0, deliveryCost = 0, bottles = 0;
    for (const o of earned) {
      const qty = bottlesIn(o.product);
      revenue += Number(o.amount || 0);
      bottleCost += qty * BOTTLE_UNIT_COST;
      deliveryCost += Number(o.deliveryFee || 0);
      bottles += qty;
    }

    // A cancelled or returned order is a loss, not simply absent revenue: the
    // stock was committed and, once shipped, the delivery was already paid for.
    let lostRevenue = 0, lostCost = 0, lostBottles = 0;
    for (const o of lost) {
      const qty = bottlesIn(o.product);
      lostRevenue += Number(o.amount || 0);
      lostCost += Number(o.deliveryFee || 0);
      lostBottles += qty;
    }

    const expenses = bottleCost + deliveryCost;
    const grossProfit = revenue - bottleCost;
    const netProfit = revenue - expenses - lostCost;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      orderCount: earned.length,
      lostCount: lost.length,
      revenue, bottleCost, deliveryCost, expenses,
      grossProfit, netProfit, margin, bottles,
      lostRevenue, lostCost, lostBottles,
      avgOrder: earned.length ? revenue / earned.length : 0,
      split50: Math.round(netProfit * 0.5),
      split30: Math.round(netProfit * 0.3),
      split20: Math.round(netProfit * 0.2),
    };
  }, [orders, period]);

  const Stat = ({
    icon: Icon, label, value, sub, tone = "neutral",
  }: { icon: any; label: string; value: string; sub?: string; tone?: "good" | "bad" | "neutral" }) => {
    const colour =
      tone === "good" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.04]"
      : tone === "bad" ? "text-rose-400 border-rose-500/20 bg-rose-500/[0.04]"
      : "text-white border-white/5 bg-white/[0.02]";
    return (
      <div className={`rounded-3xl border p-6 space-y-3 ${colour}`}>
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
        <p className="text-3xl font-black tracking-tight tabular-nums">{value}</p>
        {sub && <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{sub}</p>}
      </div>
    );
  };

  const Line = ({ label, value, tone, bold }: { label: string; value: string; tone?: string; bold?: boolean }) => (
    <div className={`flex justify-between items-baseline py-3 border-b border-white/5 ${bold ? "border-t border-white/10 mt-2 pt-4" : ""}`}>
      <span className={`${bold ? "text-[11px] font-black uppercase tracking-widest text-white" : "text-[12px] text-white/50"}`}>{label}</span>
      <span className={`tabular-nums ${bold ? "text-xl font-black" : "text-[13px] font-bold"} ${tone || "text-white/80"}`}>{value}</span>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Profit &amp; Loss</h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
            Revenue, cost of goods, delivery and losses
          </p>
        </div>
        <button
          onClick={load}
          className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Period filter — the audit ledger has no date range, so this is where
          "how did last month go?" gets answered. */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
        <Calendar className="w-4 h-4 text-white/20 ml-2 mr-1" />
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${
              period === p.key
                ? "bg-gold/10 border-gold/40 text-gold"
                : "bg-transparent border-white/10 text-white/30 hover:text-white/60"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center text-[11px] uppercase tracking-widest text-white/25 font-bold">
          Loading…
        </div>
      ) : report.orderCount === 0 && report.lostCount === 0 ? (
        <div className="py-24 text-center space-y-3">
          <Wallet className="w-10 h-10 text-white/10 mx-auto" />
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/25 font-bold">
            No orders in this period
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Stat icon={TrendingUp} label="Revenue" value={money(report.revenue)} sub={`${report.orderCount} orders`} />
            <Stat icon={Package} label="Total Expenses" value={money(report.expenses)} sub={`${report.bottles} bottles`} tone="bad" />
            <Stat
              icon={report.netProfit >= 0 ? TrendingUp : TrendingDown}
              label="Net Profit"
              value={money(report.netProfit)}
              sub={`${report.margin.toFixed(1)}% margin`}
              tone={report.netProfit >= 0 ? "good" : "bad"}
            />
            <Stat icon={XCircle} label="Losses" value={money(report.lostRevenue)} sub={`${report.lostCount} cancelled / returned`} tone="bad" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* The statement */}
            <div className="rounded-[32px] border border-white/5 bg-white/[0.02] p-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 mb-4">Statement</h2>
              <Line label="Gross revenue" value={money(report.revenue)} tone="text-emerald-400" />
              <Line label={`Cost of goods (${report.bottles} × Rs ${BOTTLE_UNIT_COST.toLocaleString()})`} value={`− ${money(report.bottleCost)}`} tone="text-rose-400" />
              <Line label="Gross profit" value={money(report.grossProfit)} />
              <Line label="Delivery cost" value={`− ${money(report.deliveryCost)}`} tone="text-rose-400" />
              {report.lostCost > 0 && (
                <Line label="Loss on cancelled / returned" value={`− ${money(report.lostCost)}`} tone="text-rose-400" />
              )}
              <Line label="Net profit" value={money(report.netProfit)} tone={report.netProfit >= 0 ? "text-gold" : "text-rose-400"} bold />
            </div>

            {/* Allocation + averages */}
            <div className="space-y-6">
              <div className="rounded-[32px] border border-white/5 bg-white/[0.02] p-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 mb-4">Profit Allocation</h2>
                <Line label="50% — Reinvestment" value={money(report.split50)} tone="text-gold" />
                <Line label="30% — Operations" value={money(report.split30)} tone="text-blue-400" />
                <Line label="20% — Founder equity" value={money(report.split20)} tone="text-purple-400" />
              </div>

              <div className="rounded-[32px] border border-white/5 bg-white/[0.02] p-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 mb-4">Per Order</h2>
                <Line label="Average order value" value={money(report.avgOrder)} />
                <Line label="Average profit per order" value={money(report.orderCount ? report.netProfit / report.orderCount : 0)} />
                <Line label="Bottles sold" value={String(report.bottles)} />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-white/25 leading-relaxed">
            Counted as earned: {EARNING.join(", ")}. Counted as lost: {LOST.join(", ")}.
            Cost of goods is Rs {BOTTLE_UNIT_COST.toLocaleString()} per bottle — change{" "}
            <span className="font-mono">BOTTLE_UNIT_COST</span> if that figure moves.
          </p>
        </>
      )}
    </div>
  );
}
