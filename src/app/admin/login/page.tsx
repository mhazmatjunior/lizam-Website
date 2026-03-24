"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Access denied.");
        setIsLoading(false);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-gold/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/[0.02] blur-[100px] rounded-full -ml-24 -mb-24 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-black tracking-tighter"
          >
            RAANAI
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Command Center</h1>
            <p className="text-[9px] font-medium text-white/20 uppercase tracking-widest">Authorized Access Only</p>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Email Identity</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
                <input 
                  required
                  type="email"
                  placeholder="admin@raanai.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-[11px] font-medium outline-none focus:border-gold/30 transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
                <input 
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-[11px] font-medium outline-none focus:border-gold/30 transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] font-bold text-rose-500 text-center"
              >
                {error}
              </motion.p>
            )}

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full btn-premium-gold h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative overflow-hidden group disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Authenticate Access
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center text-white/10">
          <p className="text-[8px] font-medium uppercase tracking-[0.3em]">© 2026 Raanai Artisanal Perfumery • Secure Vault</p>
        </div>
      </motion.div>
    </main>
  );
}
