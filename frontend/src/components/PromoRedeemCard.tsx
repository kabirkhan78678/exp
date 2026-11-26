"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Ticket, Sparkles, CheckCircle2, ArrowRight, Gift } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

const BUILTIN_LOCAL_CODES: Record<string, { amount: number; title: string }> = {
  VELTRIX500: { amount: 500, title: 'VIP Flagship Drop ₹500 Bonus' },
  WELCOME250: { amount: 250, title: 'Starter Instant Boost ₹250' },
  VIP1000: { amount: 1000, title: 'High-Roller ₹1,000 Vault Code' },
  WELCOME100: { amount: 100, title: 'Welcome Bonus Credit ₹100' },
};

export const PromoRedeemCard: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isAuthenticated, balances, setBalances, fetchBalances, showNotification, openModal } = useStore();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<{ code: string; reward_amount: string; redeemed_at: string }[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      api.getPromoHistory()
        .then((res) => {
          if (res.redemptions?.length) setHistory(res.redemptions);
        })
        .catch(() => {});
    }
    try {
      const saved = JSON.parse(localStorage.getItem('veltrix_demo_promos') || '[]');
      if (Array.isArray(saved) && saved.length && history.length === 0) {
        setHistory(saved);
      }
    } catch {}
  }, [isAuthenticated]);

  const handleRedeem = async (e?: React.FormEvent, overrideCode?: string) => {
    if (e) e.preventDefault();
    const target = (overrideCode || code).trim().toUpperCase();
    if (!target) {
      showNotification('Enter a promo code like VELTRIX500', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isAuthenticated) {
        try {
          const res = await api.redeemPromoCode(target);
          if (res.balances) setBalances(res.balances);
          else await fetchBalances();
          setHistory((prev) => [res.redemption, ...prev.filter((x) => x.code !== target)]);
          setCode('');
          confetti({ particleCount: 65, spread: 60, origin: { y: 0.65 } });
          showNotification(res.message, 'success');
          setSubmitting(false);
          return;
        } catch (err: any) {
          // If backend returned a genuine business validation error (e.g. already redeemed / invalid), surface it!
          if (err?.message && (err.message.includes('already') || err.message.includes('invalid'))) {
            showNotification(err.message, 'error');
            setSubmitting(false);
            return;
          }
          // Otherwise fallback smoothly if server offline/cold-starting
        }
      }

      // Demo / Offline-Resilient Deterministic Validation
      const preset = BUILTIN_LOCAL_CODES[target];
      if (!preset) {
        showNotification(`Invalid promo code "${target}". Try VELTRIX500 or WELCOME250!`, 'error');
        setSubmitting(false);
        return;
      }

      const alreadyLocal = history.some((h) => h.code.toUpperCase() === target);
      if (alreadyLocal) {
        showNotification(`Promo code ${target} already redeemed in this session.`, 'error');
        setSubmitting(false);
        return;
      }

      const currentBonus = parseFloat(balances.BONUS || '0');
      setBalances({
        ...balances,
        BONUS: (currentBonus + preset.amount).toFixed(4),
      });
      const entry = {
        code: target,
        reward_amount: preset.amount.toFixed(2),
        redeemed_at: new Date().toISOString(),
      };
      const nextHist = [entry, ...history];
      setHistory(nextHist);
      try {
        localStorage.setItem('veltrix_demo_promos', JSON.stringify(nextHist));
      } catch {}
      setCode('');
      confetti({ particleCount: 65, spread: 60, origin: { y: 0.65 } });
      showNotification(`Code ${target} redeemed! +₹${preset.amount} credited to Bonus Vault.`, 'success');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`rounded-3xl lux-card border-[#47EC84]/30 ${compact ? 'p-4 sm:p-5 space-y-3' : 'p-5 sm:p-7 space-y-4'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F5B041]/15 border border-[#F5B041]/35 flex items-center justify-center text-[#F5B041] shrink-0">
            <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm sm:text-base text-white flex items-center gap-1.5">
              <span>Promo &amp; Bonus Code Vault</span>
            </h3>
            <p className="text-[11px] text-slate-400">Redeem drop codes for instant Bonus Cash credits</p>
          </div>
        </div>
        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => openModal('login')}
            className="text-[10px] font-bold text-[#47EC84] hover:underline"
          >
            Sign in to sync →
          </button>
        )}
      </div>

      <form onSubmit={(e) => handleRedeem(e)} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Gift className="w-4 h-4 text-[#F5B041] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code (e.g. VELTRIX500)"
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/60 border border-white/15 focus:border-[#47EC84] focus:outline-none text-xs sm:text-sm font-mono uppercase tracking-wider text-white placeholder-slate-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 btn-emerald-3d font-display font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{submitting ? 'Applying...' : 'Redeem Code'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Quick Tap Featured Drop Codes */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Active Drops:</span>
        {Object.entries(BUILTIN_LOCAL_CODES).map(([cKey, meta]) => {
          const isClaimed = history.some((h) => h.code.toUpperCase() === cKey);
          return (
            <button
              key={cKey}
              type="button"
              disabled={isClaimed}
              onClick={() => setCode(cKey)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition flex items-center gap-1 ${
                isClaimed
                  ? 'bg-[#47EC84]/10 border-[#47EC84]/30 text-[#47EC84] opacity-75 cursor-default'
                  : 'bg-white/[0.04] hover:bg-white/[0.1] border-[#F5B041]/35 text-[#F5B041] active:scale-95'
              }`}
            >
              {isClaimed && <CheckCircle2 className="w-3 h-3" />}
              <span>{cKey}</span>
              <span className="text-slate-400">₹{meta.amount}</span>
            </button>
          );
        })}
      </div>

      {history.length > 0 && !compact && (
        <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-2">
          {history.slice(0, 4).map((h, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-xl bg-black/50 border border-[#47EC84]/30 text-[10px] font-mono text-[#47EC84] flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{h.code} (+₹{parseFloat(h.reward_amount).toFixed(0)})</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
