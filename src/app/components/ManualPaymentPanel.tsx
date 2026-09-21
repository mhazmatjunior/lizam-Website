"use client";

import React, { useState } from "react";
import { Building, Wallet, Copy, Check, Upload, FileText, Loader2 } from "lucide-react";
import {
  BANK_ACCOUNTS,
  VERIFICATION_WINDOW,
  PROOF_MAX_BYTES,
  PROOF_ACCEPTED_LABEL,
  type PayMethod,
} from "@/data/bank-details";

export type ManualMethod = PayMethod;

const METHOD_META: Record<PayMethod, { label: string; icon: typeof Building }> = {
  bank: { label: "Bank Transfer", icon: Building },
  easypaisa: { label: "EasyPaisa", icon: Wallet },
  jazzcash: { label: "JazzCash", icon: Wallet },
};

/**
 * Only the methods we actually hold an account for.
 *
 * Offering EasyPaisa with no EasyPaisa number anywhere on the page sends the
 * customer hunting for an account that is not there, and the likeliest way
 * that ends is money transferred somewhere we will never see it. Adding a
 * wallet to BANK_ACCOUNTS is all it takes to bring the option back.
 */
const METHODS = (Object.keys(METHOD_META) as PayMethod[])
  .filter((m) => BANK_ACCOUNTS.some((a) => a.method === m))
  .map((m) => ({ id: m, ...METHOD_META[m] }));

const METHOD_COLS =
  METHODS.length >= 3 ? "grid-cols-3" : METHODS.length === 2 ? "grid-cols-2" : "grid-cols-1";

interface Props {
  /** What the customer is being asked to transfer right now. */
  amount: number;
  method: ManualMethod;
  onMethodChange: (m: ManualMethod) => void;
  /** Public URL of the uploaded screenshot, or "" while none is held. */
  proofUrl: string;
  onProofChange: (url: string) => void;
  reference: string;
  onReferenceChange: (r: string) => void;
  /** Shown above the accounts, e.g. "Pre-Order Deposit". */
  label?: string;
}

/**
 * The manual bank/wallet transfer step, shared by the pre-order deposit page
 * and the balance payment page.
 *
 * Both collect the same three things — which account the customer used, proof
 * they sent it, and an optional reference — so this exists once rather than
 * being copied into each page and drifting apart.
 */
export default function ManualPaymentPanel({
  amount,
  method,
  onMethodChange,
  proofUrl,
  onProofChange,
  reference,
  onReferenceChange,
  label = "Amount To Transfer",
}: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const copy = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopied(text);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Checked here as well as on the server so an oversized file fails
    // immediately rather than after a long upload.
    if (file.size > PROOF_MAX_BYTES) {
      setUploadError(`That file is too large. ${PROOF_ACCEPTED_LABEL}.`);
      return;
    }

    setUploading(true);
    setFileName(file.name);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      onProofChange(data.url);
    } catch (err: any) {
      setUploadError(err?.message || "Could not upload that file. Please try again.");
      setFileName("");
      onProofChange("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Amount ------------------------------------------------------------ */}
      <div className="bg-gold/[0.07] border border-gold/25 rounded-2xl p-5 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/50">{label}</span>
        <span className="text-2xl font-black text-gold">Rs {amount.toLocaleString()}</span>
      </div>

      {/* Which account did you use? ---------------------------------------- */}
      <div className="space-y-3">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
          How Did You Send It?
        </p>
        <div className={`grid ${METHOD_COLS} gap-3`}>
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onMethodChange(m.id)}
              className={`rounded-xl p-3 border transition-all flex flex-col items-center gap-2 ${
                method === m.id
                  ? "bg-gold/10 border-gold text-gold"
                  : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20"
              }`}
            >
              <m.icon className="w-4 h-4" />
              <span className="text-[8px] font-black uppercase tracking-widest">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accounts ---------------------------------------------------------- */}
      <div className="bg-[#0c0c0c] border border-gold/20 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <Wallet className="w-5 h-5 text-gold" />
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-white">
              {BANK_ACCOUNTS.length > 1 ? "Transfer To Any Account Below" : "Transfer To This Account"}
            </h4>
            <p className="text-[9px] text-white/40 mt-0.5">
              Then upload your receipt. We verify within {VERIFICATION_WINDOW}.
            </p>
          </div>
        </div>

        {BANK_ACCOUNTS.map((acct) => (
          <div key={acct.provider} className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gold">{acct.provider}</p>
            <div className="space-y-1.5 text-[11px] text-white/60">
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/35">Title</span>
                <span className="text-white/80 font-medium">{acct.accountTitle}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/35">Number</span>
                <button
                  type="button"
                  onClick={() => copy(acct.accountNumber)}
                  className="flex items-center gap-2 text-white/80 font-medium hover:text-gold transition-colors"
                >
                  {acct.accountNumber}
                  {copied === acct.accountNumber ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-40" />
                  )}
                </button>
              </div>
              {acct.iban && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/35">IBAN</span>
                  <button
                    type="button"
                    onClick={() => copy(acct.iban!)}
                    className="flex items-center gap-2 text-white/80 font-medium hover:text-gold transition-colors break-all text-right"
                  >
                    {acct.iban}
                    {copied === acct.iban ? (
                      <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-40 flex-shrink-0" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Proof ------------------------------------------------------------- */}
      <div className="space-y-3" data-payment-proof>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
          Upload Proof Of Transfer <span className="text-rose-400">*</span>
        </p>

        <label
          className={`flex items-center gap-4 rounded-2xl border border-dashed p-5 cursor-pointer transition-all ${
            proofUrl
              ? "border-emerald-500/40 bg-emerald-500/[0.05]"
              : "border-white/15 bg-white/[0.02] hover:border-gold/40"
          }`}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={handleFile}
            className="sr-only"
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 className="w-5 h-5 text-gold animate-spin flex-shrink-0" />
          ) : proofUrl ? (
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <Upload className="w-5 h-5 text-white/40 flex-shrink-0" />
          )}
          <span className="min-w-0">
            <span className="block text-[11px] font-black uppercase tracking-wider text-white">
              {uploading ? "Uploading…" : proofUrl ? "Receipt Attached" : "Choose Screenshot Or Receipt"}
            </span>
            <span className="block text-[9px] text-white/40 mt-0.5 truncate">
              {fileName || PROOF_ACCEPTED_LABEL}
            </span>
          </span>
        </label>

        {uploadError && <p className="text-[10px] text-rose-400 font-medium">{uploadError}</p>}

        <div>
          <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block mb-2">
            Transaction Reference (Optional)
          </label>
          <div className="relative">
            <FileText className="w-3.5 h-3.5 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={reference}
              onChange={(e) => onReferenceChange(e.target.value)}
              placeholder="TRX123456789"
              className="w-full bg-white/[0.02] border border-white/10 focus:border-gold/30 rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none font-medium tracking-wide"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
