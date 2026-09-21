"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  ArrowRight, 
  Loader2, 
  Lock,
  Upload,
  CheckCircle,
  Copy,
  AlertCircle,
  Clock,
  Sparkles,
  Wallet,
  Building
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import { newOrderId } from "@/lib/order-id";
import { type PreorderStage } from "@/lib/preorder";
import { BANK_ACCOUNTS, type PayMethod } from "@/data/bank-details";

/**
 * What /api/preorders/pay/[token] returns for a scanned pre-order pass.
 *
 * The contact fields are present only at the "pay" stage, because that is the
 * only one with a form to prefill — everywhere else the API withholds them.
 */
interface PreorderPass {
  preorderId: string;
  stage: PreorderStage;
  productName: string;
  quantity: number;
  totalAmount: number;
  depositPaid: number;
  deliveryFee: number;
  balanceAmount: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
}

/**
 * How each stage reads to the customer who just scanned their code.
 *
 * "pay" is absent on purpose: that stage renders the checkout form below
 * rather than a progress note, so a missing entry here is a real bug and a
 * lookup failure is better than a plausible-looking wrong message.
 */
const STAGE_COPY: Record<Exclude<PreorderStage, "pay">, {
  tone: "good" | "waiting" | "bad";
  title: string;
  body: string;
}> = {
  deposit_pending: {
    tone: "waiting",
    title: "Deposit Received",
    body: "We are verifying your transfer. Your reservation is confirmed as soon as it clears, and we will email you then.",
  },
  reserved: {
    tone: "good",
    title: "Reserved",
    body: "Your deposit is confirmed and your piece is set aside. When it is ready to dispatch we will email you — and this same code becomes your payment page.",
  },
  deposit_rejected: {
    tone: "bad",
    title: "Deposit Needs Attention",
    body: "We could not verify your deposit transfer. Please get in touch and we will sort it out with you.",
  },
  verifying: {
    tone: "waiting",
    title: "Payment Received",
    body: "We have your balance payment and are verifying it. Your order is confirmed as soon as it clears — nothing further is needed from you.",
  },
  paid: {
    tone: "good",
    title: "Paid In Full",
    body: "Your pre-order is confirmed and being prepared for dispatch. You will get tracking details as soon as it leaves us.",
  },
  expired: {
    tone: "bad",
    title: "Payment Request Expired",
    body: "This balance request has lapsed. Please contact us and we will send a fresh one — your reservation is not affected.",
  },
  cancelled: {
    tone: "bad",
    title: "Pre-Order Cancelled",
    body: "This pre-order was cancelled. If that is unexpected, please get in touch.",
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { decrementStock } = useProducts();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Payment Options State
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  // Safepay card checkout is hidden on the checkout page, so manual transfer is
  // the only reachable option and has to be the default: left on 'safepay' the
  // form would still redirect to the Safepay portal with nothing on screen
  // saying so. Re-showing the card option below is enough to undo this.
  const [subMethod, setSubMethod] = useState<'safepay' | 'manual'>('manual');
  // Seeded from the account list rather than hard-coded to 'bank', so the
  // default stays valid whichever accounts are configured.
  const [manualAccountType, setManualAccountType] = useState<PayMethod>(
    BANK_ACCOUNTS[0]?.method ?? 'bank'
  );
  
  // Screenshot Upload State
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Pakistan",
    phone: "",
  });

  const [standardDeliveryFee, setStandardDeliveryFee] = useState<number>(200);

  // --- Pre-order pass ------------------------------------------------------
  // Reached by scanning the QR issued when the pre-order was placed. The cart
  // is irrelevant here: the order already exists.
  //
  // The same code is scanned throughout the pre-order's life, so landing here
  // does not mean there is anything to pay. The server says which stage it is
  // at; only "pay" puts the checkout form on screen, and every other stage
  // renders a progress note instead. Treating a scan as a payment attempt was
  // the old behaviour and would now greet a customer with an error the day
  // after they ordered -- exactly when they are most likely to try the code.
  //
  // The token is read from window.location rather than useSearchParams so this
  // page keeps prerendering without needing a Suspense boundary.
  const [preorder, setPreorder] = useState<PreorderPass | null>(null);
  const [passStage, setPassStage] = useState<PreorderPass | null>(null);
  const [preorderToken, setPreorderToken] = useState<string | null>(null);
  const [preorderError, setPreorderError] = useState<string | null>(null);
  const [balanceDone, setBalanceDone] = useState<{ ref: string; isCod: boolean } | null>(null);
  const isPreorder = Boolean(preorder);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = new URLSearchParams(window.location.search).get("preorder");
    if (!token) return;
    setPreorderToken(token);

    fetch(`/api/preorders/pay/${token}`)
      .then(async (res) => {
        const data = await res.json();
        // A non-OK response now means the code itself is unknown. Anything the
        // server recognises comes back 200 with a stage, however far along.
        if (!res.ok) throw new Error(data.error || "This pre-order code is not valid");

        const pass: PreorderPass = data.preorder;
        if (pass.stage !== "pay") {
          setPassStage(pass);
          return;
        }

        setPreorder(pass);
        // Their details came with the pre-order. Re-typing them invites a
        // mismatch between where the deposit was taken and where it ships.
        setFormData((prev) => ({
          ...prev,
          email: pass.email || prev.email,
          fullName: pass.name || prev.fullName,
          phone: pass.phone || prev.phone,
          address: pass.address || prev.address,
          city: pass.city || prev.city,
        }));
      })
      .catch((err) => setPreorderError(err.message));
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.deliveryFee !== undefined) {
          setStandardDeliveryFee(data.settings.deliveryFee);
        }
      })
      .catch((err) => console.error("Failed to load delivery fee:", err));
  }, []);

  // The account whose details are on screen. Falls back to the first
  // configured one so the box is never blank.
  const manualAccount =
    BANK_ACCOUNTS.find((a) => a.method === manualAccountType) ?? BANK_ACCOUNTS[0];

  // Calculation Logic
  const codDeliveryFee = paymentMethod === 'cod' ? standardDeliveryFee : 0;
  const totalAmount = subtotal + codDeliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        if (!file.type.startsWith('image/')) {
          return resolve(rawUrl);
        }
        const img = typeof window !== 'undefined' ? new window.Image() : document.createElement('img');
        img.src = rawUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.75));
          } else {
            resolve(rawUrl);
          }
        };
        img.onerror = () => resolve(rawUrl);
      };
      reader.onerror = () => resolve('');
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScreenshotFile(file);
    setIsUploading(true);

    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();

      if (result.success && result.url) {
        setScreenshotUrl(result.url);
      } else {
        alert(result.error || "Failed to upload image screenshot");
      }
    } catch (err: any) {
      console.error("Upload Error:", err);
      alert("Failed to upload payment screenshot");
    } finally {
      setIsUploading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP/Postal code is required";

    // Manual payment screenshot validation
    if (subMethod === 'manual' && !screenshotUrl) {
      newErrors.screenshot = "Please upload proof of payment screenshot to proceed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Settle the balance on an existing pre-order.
   *
   * Separate from handlePlaceOrder because no new order is raised here: the
   * pre-order already exists, and verifying this payment is what turns it into
   * one. Paying by cash on delivery needs no screenshot.
   */
  const handleCompletePreorder = async () => {
    const payingCash = paymentMethod === 'cod';
    if (!payingCash && !screenshotUrl) {
      setErrors({ screenshot: "Please upload proof of payment screenshot to proceed." });
      document.querySelector('[data-payment-proof]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/preorders/pay/${preorderToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          balanceMethod: payingCash ? 'cod' : manualAccountType,
          balanceProofUrl: payingCash ? null : screenshotUrl,
          balanceReference: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // The pass stopped being payable between loading this page and
        // pressing the button -- almost always their own double submission.
        // Fall through to that stage's note rather than an alert: the payment
        // is recorded either way, and "we have it" is the honest answer.
        if (data.stage && preorder) {
          setPassStage({ ...preorder, stage: data.stage });
          setPreorder(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        throw new Error(data.error || 'Could not complete your order');
      }

      setBalanceDone({ ref: data.preorderId, isCod: Boolean(data.isCod) });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('❌ Pre-order completion failed:', err.message);
      alert(`Could not complete your order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (isPreorder) return handleCompletePreorder();

    if (!validate()) {
      if (subMethod === 'manual' && !screenshotUrl) {
        document.querySelector('[data-payment-proof]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setIsSubmitting(true);

    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`;
      const productSummary = cart.map(item => `${item.name} x${item.quantity}`).join(', ');

      const calculatedStatus = subMethod === 'manual' ? 'unverified' : (paymentMethod === 'cod' ? 'cashondelivery' : 'pending');
      const backendPaymentMethod = paymentMethod === 'cod' ? 'cod_standard' : 'safepay';

      const tempOrderId = newOrderId();

      const orderPayload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        product: productSummary,
        amount: totalAmount,
        currency: 'PKR',
        payment_method: backendPaymentMethod,
        payment_sub_method: subMethod === 'manual' ? manualAccountType : subMethod,
        payment_screenshot: screenshotUrl || null,
        delivery_fee: codDeliveryFee,
        status: calculatedStatus
      };

      // If choosing Safepay online payment, store pending order details locally and redirect to Safepay portal.
      // Order will ONLY be inserted into DB upon successful payment return.
      if (paymentMethod === 'online' && subMethod === 'safepay') {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`pending_safepay_order_${tempOrderId}`, JSON.stringify(orderPayload));
        }

        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount,
            currency: 'PKR',
            orderId: tempOrderId,
          }),
        });

        const checkoutData = await checkoutRes.json();
        if (!checkoutData.url) throw new Error(checkoutData.error || 'Failed to initialize payment');

        clearCart();
        window.location.href = checkoutData.url;
        return;
      }

      // For Manual Bank Transfer, EasyPaisa, JazzCash, and COD:
      // Create order in Database (Supabase) now that user has explicitly submitted proof/confirmation
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error || 'Failed to save order');

      const orderId = orderData.orderId;

      // Decrement stock in database
      cart.forEach(item => {
        decrementStock(item.id, item.quantity);
      });

      clearCart();
      router.push(`/checkout/success/${orderId}`);
    } catch (err: any) {
      console.error('❌ Checkout placement failed:', err.message);
      alert(`Checkout failed: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  // Three things land here: a payment just submitted, a scanned pass that is
  // not at the paying stage, and a code we do not recognise. None of them has
  // anything to check out, so each replaces the form rather than rendering an
  // order the customer cannot place.
  if (balanceDone || preorderError || passStage) {
    const copy = passStage && passStage.stage !== "pay" ? STAGE_COPY[passStage.stage] : null;

    const tone = balanceDone ? "good" : copy ? copy.tone : "bad";
    const title = balanceDone ? "Order Complete" : copy ? copy.title : "Code Not Valid";
    const reference = balanceDone?.ref || passStage?.preorderId || "";
    const body = balanceDone
      ? balanceDone.isCod
        ? "Thank you. Your order is confirmed — pay the remaining balance in cash when it arrives."
        : "Thank you. We have your payment and will confirm your order as soon as it is verified."
      : copy
        ? copy.body
        : preorderError || "We could not find a pre-order for this code.";

    const TONES = {
      good: { ring: "bg-emerald-50 border-emerald-200", icon: <CheckCircle className="w-7 h-7 text-emerald-600" /> },
      waiting: { ring: "bg-amber-50 border-amber-200", icon: <Clock className="w-7 h-7 text-amber-600" /> },
      bad: { ring: "bg-rose-50 border-rose-200", icon: <AlertCircle className="w-7 h-7 text-rose-500" /> },
    } as const;
    const { ring, icon } = TONES[tone];

    // Their own figures, so they can see the pass is showing the right
    // pre-order. Withheld on a cancelled one, where a balance still "due"
    // would read as a bill.
    const showSummary = Boolean(passStage) && passStage!.stage !== "cancelled";

    return (
      <main className="checkout-light min-h-screen bg-white text-slate-900 font-sans flex items-center justify-center px-8 py-20">
        <div className="max-w-md w-full text-center space-y-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${ring}`}>
            {icon}
          </div>

          <h1 className="text-3xl font-black uppercase tracking-tight">{title}</h1>

          <div className="space-y-3">
            {reference && (
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gold">{reference}</p>
            )}
            <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
          </div>

          {showSummary && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-2.5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[11px] font-bold text-slate-700">
                  {passStage!.productName} &times; {passStage!.quantity}
                </span>
                <span className="text-[11px] font-black text-slate-900">
                  Rs {passStage!.totalAmount.toLocaleString()}
                </span>
              </div>
              {passStage!.deliveryFee > 0 && (
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[11px] text-slate-500">Delivery</span>
                  <span className="text-[11px] text-slate-700">
                    Rs {passStage!.deliveryFee.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[11px] text-slate-500">Deposit paid</span>
                <span className="text-[11px] text-emerald-600 font-bold">
                  &minus; Rs {passStage!.depositPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4 pt-2.5 border-t border-slate-200">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  {passStage!.balanceAmount > 0 ? "Remaining" : "Paid in full"}
                </span>
                <span className="text-sm font-black text-slate-900">
                  Rs {passStage!.balanceAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <Link
            href="/products"
            className="inline-block btn-premium-gold px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Continue Browsing
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-light min-h-screen bg-white text-slate-900 font-sans selection:bg-gold/30 pb-20">
      {/* Header */}
      <header className="px-8 md:px-24 py-10 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/products"
            className="group flex items-center gap-2 text-white/60 hover:text-gold transition-colors text-[10px] uppercase tracking-[0.3em] font-bold"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Shop
          </Link>
          <div className="text-xl font-bold tracking-tighter">RAANAE</div>
          <div className="w-24 md:w-32 flex justify-end">
             <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold hidden md:block">Secure Checkout</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 md:px-24 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left: Checkout Form */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Pre-order: say plainly that the deposit is already paid and what
                is left to do. Without it the customer sees a total smaller than
                the product costs and cannot tell why. */}
            {isPreorder && preorder && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex gap-4">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h2 className="text-sm font-black uppercase tracking-tight text-emerald-900">
                    You have already paid your pre-order
                  </h2>
                  <p className="text-xs text-emerald-800/80 leading-relaxed">
                    Rs {preorder.depositPaid.toLocaleString()} received for{" "}
                    <strong>{preorder.preorderId}</strong> ({preorder.productName} &times;{" "}
                    {preorder.quantity}). Please complete your order by paying the remaining{" "}
                    <strong>Rs {preorder.balanceAmount.toLocaleString()}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Contact Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">1</div>
                <h2 className="text-xl font-black uppercase tracking-tight">Contact Information</h2>
              </div>
              <div className="space-y-4">
                <div className="relative group">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ENTER YOUR EMAIL..."
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all placeholder:text-white/20 ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
                    required
                  />
                  {errors.email && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.email}</span>}
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">2</div>
                <h2 className="text-xl font-black uppercase tracking-tight">Shipping Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block ml-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="RECEIVER NAME..."
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all ${errors.fullName ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {errors.fullName && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.fullName}</span>}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block ml-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="HOUSE NO, STREET..."
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all ${errors.address ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {errors.address && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.address}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block ml-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. LAHORE..."
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all ${errors.city ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {errors.city && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.city}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block ml-1">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="STATE..."
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all ${errors.state ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {errors.state && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.state}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block ml-1">ZIP / Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="POSTCODE..."
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all ${errors.zipCode ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {errors.zipCode && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.zipCode}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block ml-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92 300 1234567"
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all ${errors.phone ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {errors.phone && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.phone}</span>}
                </div>
              </div>
            </section>

            {/* Payment Method Selector.
                A pre-order balance gets its own pair of choices: the standard
                options quote delivery fees that are already fixed on the
                pre-order, so showing them here would misstate the amount. */}
            {isPreorder ? (
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">3</div>
                  <h2 className="text-xl font-black uppercase tracking-tight">How Will You Pay The Balance?</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setPaymentMethod('online')}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all flex items-center gap-3 ${paymentMethod === 'online' ? 'bg-gold/10 border-gold' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
                  >
                    <Building className="w-5 h-5 text-gold shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest">Bank / Wallet Transfer</h4>
                      <p className="text-[9px] uppercase tracking-wider opacity-50 mt-0.5">Send now, upload the receipt</p>
                    </div>
                  </div>
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all flex items-center gap-3 ${paymentMethod === 'cod' ? 'bg-gold/10 border-gold' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
                  >
                    <Truck className="w-5 h-5 text-gold shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest">Cash On Delivery</h4>
                      <p className="text-[9px] uppercase tracking-wider opacity-50 mt-0.5">
                        Pay Rs {preorder ? preorder.balanceAmount.toLocaleString() : ''} at the door
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">3</div>
                <h2 className="text-xl font-black uppercase tracking-tight">Payment Method</h2>
              </div>
              <div className="space-y-4">

                {/* Option 1: Online Payment */}
                <div 
                  onClick={() => setPaymentMethod('online')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex items-center justify-between relative ${paymentMethod === 'online' ? 'bg-[#e2bb61]/5 border-[#e2bb61] shadow-[0_0_20px_rgba(226,187,97,0.05)]' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'online' ? 'border-[#e2bb61] bg-[#e2bb61]' : 'border-white/20'}`}>
                      {paymentMethod === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                        Online Payment (Full Amount)
                        <span className="text-[7px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Free Shipping</span>
                      </h4>
                      <p className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">Manual Bank / Wallet Transfer</p>
                    </div>
                  </div>
                </div>

                {/* Option 2: Cash on Delivery (COD) */}
                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex items-center justify-between relative ${paymentMethod === 'cod' ? 'bg-[#e2bb61]/5 border-[#e2bb61] shadow-[0_0_20px_rgba(226,187,97,0.05)]' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'border-[#e2bb61] bg-[#e2bb61]' : 'border-white/20'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Cash on Delivery</h4>
                      <p className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">Pay Rs {standardDeliveryFee} advance payment for delivery charges. Pay product amount on doorstep.</p>
                    </div>
                  </div>
                  <span className="text-[7px] font-black uppercase tracking-widest bg-white/10 text-white/60 px-2 py-0.5 rounded border border-white/10">+ Rs {standardDeliveryFee} Delivery</span>
                </div>

              </div>

              {/* COD Alert Banner */}
              {paymentMethod === 'cod' && (
                <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 flex items-center gap-3 text-[10px] text-gold font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>💡 Tip: Select <strong>Online Payment</strong> to get 100% FREE delivery!</span>
                </div>
              )}
            </section>
            )}

            {/* Sub-Payment Method Details (Safepay Card vs Manual Bank Transfer).
                Hidden when settling a pre-order balance in cash -- there is
                nothing to transfer and no receipt to upload. */}
            {!(isPreorder && paymentMethod === 'cod') && (
            <section className="space-y-6 pt-4 border-t border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Choose How To Complete Payment</h3>
              
              {/* Single column while the card option is hidden, so the one
                  remaining choice is not left sitting in half a row. */}
              <div className="grid grid-cols-1 gap-4">
                {/* Credit / Debit Card (Safepay) — hidden. The submit handler and
                    the button label still branch on subMethod === 'safepay', so
                    restoring this block and flipping the useState default above
                    back to 'safepay' is all that is needed to bring it back.

                <div
                  onClick={() => setSubMethod('safepay')}
                  className={`cursor-pointer rounded-xl p-4 border transition-all flex items-center gap-3 ${subMethod === 'safepay' ? 'bg-gold/10 border-gold' : 'bg-white/[0.02] border-white/10'}`}
                >
                  <CreditCard className="w-5 h-5 text-gold" />
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-white">Credit / Debit Card (Safepay)</h5>
                    <p className="text-[8px] text-white/40 uppercase">Instant Card Checkout</p>
                  </div>
                </div>
                */}

                <div 
                  onClick={() => setSubMethod('manual')}
                  className={`cursor-pointer rounded-xl p-4 border transition-all flex items-center gap-3 ${subMethod === 'manual' ? 'bg-gold/10 border-gold' : 'bg-white/[0.02] border-white/10'}`}
                >
                  <Building className="w-5 h-5 text-gold" />
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-white">Manual Bank / Wallet Transfer</h5>
                    <p className="text-[8px] text-white/40 uppercase">{BANK_ACCOUNTS.map((a) => a.provider).join(' or ')}</p>
                  </div>
                </div>
              </div>

              {/* Manual Payment Accounts Box */}
              {subMethod === 'manual' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-[#0c0c0c] border border-gold/20 rounded-2xl p-6 space-y-6"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <Wallet className="w-5 h-5 text-gold" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-gold">Manual Account Transfer Details</h4>
                      <p className="text-[9px] uppercase text-white/40">
                        {BANK_ACCOUNTS.length > 1
                          ? 'Send payment to one of the accounts below'
                          : 'Send payment to the account below'}{' '}
                        &amp; upload receipt screenshot
                      </p>
                    </div>
                  </div>

                  {/* Account Selector Tabs. Only what we hold an account for --
                      an option with no account behind it sends the customer
                      hunting for details that are not on the page. */}
                  {BANK_ACCOUNTS.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {BANK_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.method}
                          type="button"
                          onClick={() => setManualAccountType(acc.method)}
                          className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${manualAccountType === acc.method ? 'bg-gold text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        >
                          {acc.provider}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Account Details Box, rendered from the configured account
                      so the numbers here and on the pre-order page cannot drift. */}
                  <div className="bg-black/60 border border-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-white/40">
                        {manualAccount.method === 'bank' ? 'Bank Name' : 'Wallet'}
                      </span>
                      <span className="text-gold font-black">{manualAccount.provider}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-white/40">Account Title</span>
                      <span className="text-gold font-black">{manualAccount.accountTitle}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase pt-2 border-t border-white/5">
                      <span className="text-white/40">
                        {manualAccount.method === 'bank' ? 'Account Number' : 'Mobile #'}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-gold">
                        <span className="break-all text-right">{manualAccount.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(manualAccount.accountNumber, 'account')}
                          className="p-1 hover:text-white shrink-0"
                        >
                          {copiedText === 'account' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    {manualAccount.iban && (
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase pt-2 border-t border-white/5">
                        <span className="text-white/40">IBAN</span>
                        <div className="flex items-center gap-2 font-mono text-gold">
                          <span className="break-all text-right">{manualAccount.iban}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(manualAccount.iban!, 'iban')}
                            className="p-1 hover:text-white shrink-0"
                          >
                            {copiedText === 'iban' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Screenshot File Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gold uppercase tracking-widest font-black block">Upload Payment Screenshot / Receipt</label>
                    <div data-payment-proof className="relative border-2 border-dashed border-white/20 hover:border-gold/50 rounded-xl p-6 text-center transition-all bg-black/40">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        {isUploading ? (
                          <>
                            <Loader2 className="w-6 h-6 text-gold animate-spin" />
                            <span className="text-[10px] text-gold font-bold uppercase">Processing Image...</span>
                          </>
                        ) : screenshotUrl ? (
                          <div className="flex items-center gap-3 text-emerald-400 text-[11px] font-bold uppercase">
                            <CheckCircle className="w-5 h-5" />
                            Screenshot Uploaded & Verified!
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-white/40" />
                            <span className="text-[10px] text-white/60 font-bold uppercase">Click or Drag Screenshot Here</span>
                            <span className="text-[8px] text-white/30 uppercase">JPG, PNG, WebP Supported</span>
                          </>
                        )}
                      </div>
                    </div>
                    {errors.screenshot && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.screenshot}</span>}
                  </div>

                  <p className="text-[9px] text-white/40 uppercase tracking-wider italic">
                    ℹ️ Note: Your order will be placed with status <strong className="text-gold">UNVERIFIED</strong>. You will receive an email once our admin verifies your payment screenshot.
                  </p>
                </motion.div>
              )}
            </section>
            )}

          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 pr-1">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sticky top-[120px] h-fit self-start shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase tracking-tight">Your Order</h2>
                <ShoppingBag className="w-5 h-5 text-gold" />
              </div>

              {/* Product List */}
              <div className="space-y-6 mb-8 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {/* A pre-order balance has no cart behind it — the item lives on
                    the pre-order record. */}
                {isPreorder && preorder && (
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gold/5 border border-gold/20 rounded-xl flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-[10px] font-black uppercase tracking-tight">{preorder.productName}</h3>
                      <p className="text-[9px] uppercase tracking-[0.1em] opacity-50">
                        Pre-Order x {preorder.quantity}
                      </p>
                    </div>
                    <p className="text-[10px] font-black text-gold">
                      Rs {preorder.totalAmount.toLocaleString()}
                    </p>
                  </div>
                )}
                {!isPreorder && cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center p-2 relative shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-[10px] font-black uppercase tracking-tight text-white">{item.name}</h3>
                      <p className="text-[9px] text-white/30 uppercase tracking-[0.1em]">{item.category} x {item.quantity}</p>
                    </div>
                    <p className="text-[10px] font-black text-gold">Rs {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Calculation */}
              <div className="space-y-4 border-t border-white/5 pt-8">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  <span>Subtotal</span>
                  <span>Rs {(isPreorder && preorder ? preorder.totalAmount : subtotal).toLocaleString()}</span>
                </div>

                {isPreorder && preorder && (
                  <>
                    {preorder.deliveryFee > 0 && (
                      <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold">
                        <span>Delivery</span>
                        <span>Rs {preorder.deliveryFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-emerald-600">
                      <span>Pre-Order Deposit Paid</span>
                      <span>&minus; Rs {preorder.depositPaid.toLocaleString()}</span>
                    </div>
                  </>
                )}

                {!isPreorder && paymentMethod === 'cod' && (
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/60 font-bold">
                    <span>COD Delivery Fee (Upfront)</span>
                    <span className="text-gold">Rs 200</span>
                  </div>
                )}

                {!isPreorder && (
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold">
                    <span>Shipping</span>
                    <span className="text-gold">{paymentMethod === 'online' ? 'FREE (ONLINE PROMO)' : 'STANDARD'}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-white/5 pt-4">
                  <span className="text-sm font-black uppercase tracking-widest">
                    {isPreorder ? 'Remaining To Pay' : 'Total Amount'}
                  </span>
                  <span className="text-xl font-black text-gold underline underline-offset-8 decoration-gold/30">
                    Rs {(isPreorder && preorder ? preorder.balanceAmount : totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest font-bold text-white/30">
                  <ShieldCheck className="w-4 h-4 text-green-500/50" />
                  100% Encrypted & Authenticated Order
                </div>
                <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest font-bold text-white/30">
                  <Truck className="w-4 h-4 text-gold/50" />
                  Priority Dispatch Guarantee
                </div>
              </div>

              <button 
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || isUploading || (!isPreorder && cart.length === 0)}
                className="w-full btn-premium-gold py-5 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] mt-10 group shadow-[0_20px_40px_rgba(200,164,77,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    Processing Payment...
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  </>
                ) : (
                  <>
                    {isUploading
                      ? 'Uploading Receipt...'
                      : isPreorder
                        ? 'Complete My Order'
                        : subMethod === 'safepay'
                          ? 'Proceed to Safepay'
                          : 'Submit Manual Order'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Policy acknowledgement. The terms a customer is agreeing to have
                  to be readable at the moment of payment, not just findable from
                  the homepage footer. */}
              <p className="mt-5 text-[10px] leading-relaxed text-white/35 text-center">
                By placing this order you agree to our{' '}
                <Link href="/terms" className="text-gold/70 hover:text-gold underline underline-offset-2">Terms &amp; Conditions</Link>,{' '}
                <Link href="/shipping-returns" className="text-gold/70 hover:text-gold underline underline-offset-2">Shipping, Returns &amp; Refunds Policy</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-gold/70 hover:text-gold underline underline-offset-2">Privacy Policy</Link>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
