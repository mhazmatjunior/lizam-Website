"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Truck, 
  PieChart, 
  RefreshCw, 
  Layers,
  ArrowUpRight,
  Sparkles,
  Award,
  Download,
  FileSpreadsheet
} from "lucide-react";

interface Order {
  orderId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  paymentSubMethod?: string;
  deliveryFee?: number;
  createdAt: string;
}

const BOTTLE_UNIT_COST = 2100; // Rs. 2,100 manufacturing cost per bottle

export default function AuditPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "online" | "cod" | "founder">("all");

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders for audit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter delivered/completed orders by payment method
  const filteredOrders = orders.filter((o) => {
    const isDelivered = o.status === "delivered" || o.status === "paid" || o.status === "cashondelivery" || o.status === "shipped";
    if (!isDelivered) return false;

    if (activeFilter === "online") {
      return o.paymentMethod === "safepay" || o.paymentMethod === "online_manual" || !o.paymentMethod?.startsWith("cod_");
    }
    if (activeFilter === "cod") {
      return o.paymentMethod === "cod_standard";
    }
    if (activeFilter === "founder") {
      return o.paymentMethod === "cod_founder";
    }
    return true;
  });

  // Calculate Financial Audit Metrics with Running Cumulative Totals
  let totalGrossRevenue = 0;
  let totalBottlesSold = 0;
  let totalBottleCost = 0;
  let totalDeliveryExpenses = 0;
  let runningCumulativeProfit = 0;

  const itemizedLedger = filteredOrders.map((o) => {
    // Parse quantity of bottles from product string (e.g. x1, x2, x3)
    let bottleQty = 1;
    const qtyMatch = o.product.match(/x(\d+)/i);
    if (qtyMatch) {
      bottleQty = parseInt(qtyMatch[1], 10);
    }

    const bottleCost = bottleQty * BOTTLE_UNIT_COST;
    const deliveryExpense = o.deliveryFee || (o.paymentMethod === "cod_standard" ? 250 : o.paymentMethod === "cod_founder" ? 5000 : 0);
    const orderExpense = bottleCost + deliveryExpense;
    const orderNetProfit = o.amount - orderExpense;

    totalGrossRevenue += o.amount;
    totalBottlesSold += bottleQty;
    totalBottleCost += bottleCost;
    totalDeliveryExpenses += deliveryExpense;
    runningCumulativeProfit += orderNetProfit;

    const profit50 = Math.round(orderNetProfit * 0.5);
    const profit30 = Math.round(orderNetProfit * 0.3);
    const profit20 = Math.round(orderNetProfit * 0.2);

    return {
      ...o,
      bottleQty,
      bottleCost,
      deliveryExpense,
      orderExpense,
      orderNetProfit,
      profit50,
      profit30,
      profit20,
      cumulativeProfitTillNow: runningCumulativeProfit,
    };
  });

  const totalExpense = totalBottleCost + totalDeliveryExpenses;
  const totalNetProfit = Math.max(0, totalGrossRevenue - totalExpense);

  // Percentage Profit Distributions
  const profit50Percent = Math.round(totalNetProfit * 0.5);
  const profit30Percent = Math.round(totalNetProfit * 0.3);
  const profit20Percent = Math.round(totalNetProfit * 0.2);

  const handleExportExcel = () => {
    if (itemizedLedger.length === 0) return;

    const headers = [
      "Order ID",
      "Date & Time",
      "Client Name",
      "Email Address",
      "Phone Number",
      "Shipping Address",
      "Products Ordered",
      "Bottles Sold",
      "Payment Method",
      "Order Status",
      "Gross Revenue (PKR)",
      "Bottle Cost (PKR)",
      "Delivery Cost (PKR)",
      "Net Profit (PKR)",
      "50% Share (Reinvestment)",
      "30% Share (Operations)",
      "20% Share (Founder Equity)"
    ];

    const rows = itemizedLedger.map((row) => {
      const formattedDate = new Date(row.createdAt).toLocaleString();
      const methodLabel = row.paymentMethod === "cod_founder" ? "Founder Delivery" : row.paymentMethod === "cod_standard" ? "Cash on Delivery" : "Online Payment";
      const escapeCSV = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

      return [
        escapeCSV(row.orderId),
        escapeCSV(formattedDate),
        escapeCSV(row.name),
        escapeCSV(row.email),
        escapeCSV(row.phone),
        escapeCSV(row.address),
        escapeCSV(row.product),
        row.bottleQty,
        escapeCSV(methodLabel),
        escapeCSV(row.status),
        row.amount,
        row.bottleCost,
        row.deliveryExpense,
        row.orderNetProfit,
        row.profit50,
        row.profit30,
        row.profit20
      ].join(",");
    });

    const summaryRow = [
      `"GRAND TOTALS"`,
      `""`,
      `""`,
      `""`,
      `""`,
      `""`,
      `""`,
      totalBottlesSold,
      `""`,
      `""`,
      totalGrossRevenue,
      totalBottleCost,
      totalDeliveryExpenses,
      totalNetProfit,
      profit50Percent,
      profit30Percent,
      profit20Percent
    ].join(",");

    const csvContent = "\uFEFF" + [headers.join(","), ...rows, summaryRow].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `RAANAE_Financial_Audit_Ledger_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Finance & Audit Dashboard</h1>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-2 ml-13">
            Real-time COGS, Logistics Cost, Net Profit & Cumulative Allocation Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportExcel}
            className="px-6 py-3 bg-[#e2bb61] hover:bg-gold-light text-black font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(226,187,97,0.2)] flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel Report
          </button>
          <button 
            onClick={fetchOrders}
            className="px-5 py-3 bg-white/[0.02] border border-white/10 hover:border-gold/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-gold transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Recalculate Audit
          </button>
        </div>
      </div>

      {/* Payment Method Filter Selector */}
      <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-3xl overflow-x-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Audit Scope:</span>
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "All Payment Methods" },
            { id: "online", label: "Online Payments" },
            { id: "cod", label: "Cash on Delivery (COD)" },
            { id: "founder", label: "Founder Delivery" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === filter.id ? 'bg-gold text-black shadow-[0_0_20px_rgba(226,187,97,0.2)]' : 'bg-white/5 text-white/40 hover:text-white'}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Executive Financial Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Gross Revenue */}
        <div className="bg-gradient-to-br from-gold/15 to-black border border-gold/30 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold">Gross Sales Revenue</span>
            <DollarSign className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">Rs {totalGrossRevenue.toLocaleString()}</p>
            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Total revenue collected</p>
          </div>
        </div>

        {/* Manufacturing COGS */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Bottle Costs (COGS)</span>
            <Package className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">Rs {totalBottleCost.toLocaleString()}</p>
            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">{totalBottlesSold} Bottles @ Rs 2,100 / ea</p>
          </div>
        </div>

        {/* Logistics Expenses */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Delivery & Logistics</span>
            <Truck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">Rs {totalDeliveryExpenses.toLocaleString()}</p>
            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Total shipping expenses</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-black border border-emerald-500/30 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Net Operating Profit</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-400">Rs {totalNetProfit.toLocaleString()}</p>
            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Sales minus COGS & Delivery</p>
          </div>
        </div>

      </div>

      {/* 50 / 30 / 20 PROFIT ALLOCATION BREAKDOWN */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-3">
          <PieChart className="w-5 h-5 text-gold" />
          <h2 className="text-2xl font-black uppercase tracking-tight">Net Profit Percentage Distribution</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 50% Share Card */}
          <div className="bg-[#0b0b0b] border border-gold/30 rounded-3xl p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                50% Share
              </span>
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-3xl font-black text-gold">Rs {profit50Percent.toLocaleString()}</p>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-gold h-full w-[50%]" />
            </div>
          </div>

          {/* 30% Share Card */}
          <div className="bg-[#0b0b0b] border border-blue-500/30 rounded-3xl p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                30% Share
              </span>
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-3xl font-black text-blue-400">Rs {profit30Percent.toLocaleString()}</p>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[30%]" />
            </div>
          </div>

          {/* 20% Share Card */}
          <div className="bg-[#0b0b0b] border border-purple-500/30 rounded-3xl p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                20% Share
              </span>
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-3xl font-black text-purple-400">Rs {profit20Percent.toLocaleString()}</p>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full w-[20%]" />
            </div>
          </div>

        </div>
      </section>

      {/* ITEMIZED AUDIT LEDGER TABLE WITH CUMULATIVE SUMS */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-2xl font-black uppercase tracking-tight">Itemized Transaction Audit & Cumulative Ledger</h2>
          <span className="text-[10px] font-black bg-white/5 text-white/40 px-3 py-1 rounded-full">
            {itemizedLedger.length} Audited Orders
          </span>
        </div>

        <div className="bg-white/[0.01] border border-white/5 rounded-[32px] overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-5 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Order ID</th>
                  <th className="px-5 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Client</th>
                  <th className="px-5 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Method</th>
                  <th className="px-5 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Qty</th>
                  <th className="px-5 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Gross Revenue</th>
                  <th className="px-5 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Bottle Cost</th>
                  <th className="px-5 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Delivery</th>
                  <th className="px-5 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Net Profit</th>
                  <th className="px-5 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gold">50% Share</th>
                  <th className="px-5 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">30% Share</th>
                  <th className="px-5 py-5 text-right text-[9px] font-black uppercase tracking-[0.2em] text-purple-400">20% Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {itemizedLedger.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-8 py-16 text-center text-[10px] font-black uppercase tracking-widest text-white/20">
                      No order records match the selected audit criteria.
                    </td>
                  </tr>
                ) : itemizedLedger.map((row) => (
                  <tr key={row.orderId} className="hover:bg-white/[0.01] transition-all">
                    <td className="px-5 py-5 font-mono text-[11px] text-gold font-bold">{row.orderId}</td>
                    <td className="px-5 py-5 text-[11px] font-bold text-white/90">{row.name}</td>
                    <td className="px-5 py-5">
                      <span className="text-[8px] font-black uppercase tracking-widest bg-white/5 text-white/60 px-2 py-0.5 rounded border border-white/10">
                        {row.paymentMethod === "cod_founder" ? "Founder Delivery" : row.paymentMethod === "cod_standard" ? "COD" : "Online"}
                      </span>
                    </td>
                    <td className="px-5 py-5 text-[11px] font-bold text-white/70">{row.bottleQty}</td>
                    <td className="px-5 py-5 text-[11px] font-black text-white">Rs {row.amount.toLocaleString()}</td>
                    <td className="px-5 py-5 text-[11px] font-bold text-rose-400">Rs {row.bottleCost.toLocaleString()}</td>
                    <td className="px-5 py-5 text-[11px] font-bold text-cyan-400">Rs {row.deliveryExpense.toLocaleString()}</td>
                    <td className="px-5 py-5 font-black text-emerald-400 text-xs">
                      + Rs {row.orderNetProfit.toLocaleString()}
                    </td>
                    <td className="px-5 py-5 text-[11px] font-bold text-gold">Rs {row.profit50.toLocaleString()}</td>
                    <td className="px-5 py-5 text-[11px] font-bold text-blue-400">Rs {row.profit30.toLocaleString()}</td>
                    <td className="px-5 py-5 text-right font-bold text-purple-400 text-[11px]">Rs {row.profit20.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>

              {/* Table Footer with Bold Summary Grand Totals */}
              {itemizedLedger.length > 0 && (
                <tfoot className="border-t-2 border-gold/50 bg-gradient-to-r from-gold/15 via-gold/5 to-gold/15 font-black">
                  <tr className="font-black text-xs uppercase tracking-widest text-white">
                    <td colSpan={3} className="px-5 py-5 text-gold font-black text-xs tracking-[0.2em]">★ GRAND TOTALS</td>
                    <td className="px-5 py-5 text-white font-black text-xs">{totalBottlesSold}</td>
                    <td className="px-5 py-5 text-white font-black text-xs">Rs {totalGrossRevenue.toLocaleString()}</td>
                    <td className="px-5 py-5 text-rose-400 font-black text-xs">Rs {totalBottleCost.toLocaleString()}</td>
                    <td className="px-5 py-5 text-cyan-400 font-black text-xs">Rs {totalDeliveryExpenses.toLocaleString()}</td>
                    <td className="px-5 py-5 text-emerald-400 font-black text-sm">Rs {totalNetProfit.toLocaleString()}</td>
                    <td className="px-5 py-5 text-gold font-black text-xs">Rs {profit50Percent.toLocaleString()}</td>
                    <td className="px-5 py-5 text-blue-400 font-black text-xs">Rs {profit30Percent.toLocaleString()}</td>
                    <td className="px-5 py-5 text-right text-purple-400 font-black text-xs">Rs {profit20Percent.toLocaleString()}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
