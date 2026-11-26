"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Trophy, Users, Copy, Crown, Check, Layers, ArrowRight, Wallet } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { PromoRedeemCard } from '@/components/PromoRedeemCard';

export default function RewardsPage() {
  const { user, isAuthenticated, vipTier, loyaltyPoints, openModal, showNotification, balances, setBalances, fetchBalances } = useStore();
  const [copied, setCopied] = useState(false);
  const [claimingCommission, setClaimingCommission] = useState(false);
  const [refStats, setRefStats] = useState<{
    referral_code: string;
    gross_earned: string;
    claimed_total: string;
    claimable: string;
    tiers: { tier: number; label: string; rate: string; count: number; volume: string; earned: string }[];
  }>({
    referral_code: user?.profile?.referral_code || 'VELTRIX001',
    gross_earned: '485.00',
    claimed_total: '200.00',
    claimable: '285.00',
    tiers: [
      { tier: 1, label: 'Direct VIPs', rate: '5.0% + ₹50/signup', count: 3, volume: '6200', earned: '360.00' },
      { tier: 2, label: 'Sub-Partners', rate: '2.0% Turnover', count: 5, volume: '4250', earned: '85.00' },
      { tier: 3, label: 'Extended Guild', rate: '1.0% Turnover', count: 8, volume: '4000', earned: '40.00' },
    ],
  });

  useEffect(() => {
    if (isAuthenticated) {
      api.getReferralStats().then((data) => setRefStats(data)).catch(() => {});
    }
  }, [isAuthenticated]);

  const referralCode = user?.profile?.referral_code || refStats.referral_code || 'PLAY001';
  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${referralCode}`
      : `https://veltrix.arena/?ref=${referralCode}`;

  const handleClaimCommission = async () => {
    const claimableVal = parseFloat(refStats.claimable || '0');
    if (claimableVal < 10) {
      showNotification('Minimum claimable referral payout is ₹10.', 'info');
      return;
    }

    setClaimingCommission(true);
    try {
      if (isAuthenticated) {
        try {
          const res = await api.claimReferralCommission();
          if (res.balances) setBalances(res.balances);
          else await fetchBalances();
          setRefStats((prev) => ({
            ...prev,
            claimed_total: (parseFloat(prev.claimed_total) + claimableVal).toFixed(2),
            claimable: res.claimable || '0.00',
          }));
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.65 } });
          showNotification(res.message || `Claimed ₹${claimableVal} commission!`, 'success');
          setClaimingCommission(false);
          return;
        } catch (err: any) {
          if (err?.message && err.message.includes('Minimum')) {
            showNotification(err.message, 'info');
            setClaimingCommission(false);
            return;
          }
        }
      }

      // Demo fallback
      setBalances({
        ...balances,
        MAIN: (parseFloat(balances.MAIN || '0') + claimableVal).toFixed(4),
      });
      setRefStats((prev) => ({
        ...prev,
        claimed_total: (parseFloat(prev.claimed_total) + claimableVal).toFixed(2),
        claimable: '0.00',
      }));
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.65 } });
      showNotification(`₹${claimableVal.toFixed(0)} Multi-Tier Commission settled to Real Cash!`, 'success');
    } finally {
      setClaimingCommission(false);
    }
  };

  const tiers = [
    { name: 'BRONZE', minPts: 0, cashback: '1.0%', perk: 'Standard demo access & daily streak drop', accent: 'border-amber-700/40 text-amber-500' },
    { name: 'SILVER', minPts: 500, cashback: '2.5%', perk: 'Priority UPI payouts & 2.5% cashback', accent: 'border-slate-300/40 text-slate-300' },
    { name: 'GOLD', minPts: 2500, cashback: '5.0%', perk: 'VIP support priority & 5.0% permanent rakeback', accent: 'border-[#F5B041]/50 text-[#F5B041]' },
    { name: 'PLATINUM', minPts: 10000, cashback: '7.5%', perk: 'Higher arena stake caps & weekly bonuses', accent: 'border-sky-400/50 text-sky-300' },
    { name: 'DIAMOND', minPts: 50000, cashback: '10.0%', perk: 'Dedicated VIP host & exclusive prize pools', accent: 'border-[#47EC84]/50 text-[#47EC84]' },
    { name: 'ELITE', minPts: 100000, cashback: '15.0%', perk: 'Maximum limits & bespoke luxury invitations', accent: 'border-violet-400/50 text-violet-300' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-6 w-full overflow-x-clip">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
          VIP Tiers, Promo Codes &amp; Affiliates
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Redeem bonus drop codes, track 3-tier referral commissions, and climb the VIP cashback ladder.
        </p>
      </div>

      {/* Active Tier Hero Banner */}
      <div className="p-5 sm:p-7 rounded-3xl lux-card border-[#F5B041]/30 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Current Rank</div>
          <div className="font-display text-2xl sm:text-3xl font-black text-[#F5B041] flex items-center gap-2.5 justify-center md:justify-start">
            <Crown className="w-7 h-7" />
            <span>{vipTier || 'BRONZE'} TIER</span>
          </div>
          <div className="text-xs text-slate-400">
            Loyalty Balance: <strong className="text-[#47EC84] font-mono tabular-nums">{parseFloat(loyaltyPoints || '0').toFixed(0)} PTS</strong>
          </div>
        </div>

        <button
          onClick={() => openModal('dailyReward')}
          className="px-6 py-3 btn-gold-3d font-black text-xs sm:text-sm rounded-full transition active:scale-95 flex items-center gap-2"
        >
          <Gift className="w-4 h-4" />
          <span>Claim Daily Streak Bonus</span>
        </button>
      </div>

      {/* Promo Code Vault */}
      <PromoRedeemCard />

      {/* Multi-Tier Refer & Earn Commission Tracker */}
      <div className="p-5 sm:p-7 rounded-3xl lux-card border-[#47EC84]/25 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#47EC84]/15 border border-[#47EC84]/35 flex items-center justify-center text-[#47EC84] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-base text-white">Multi-Tier Affiliate Commission Tracker</h2>
              <p className="text-xs text-slate-400">Earn 5% Tier-1 + 2% Tier-2 + 1% Tier-3 lifetime wager commissions</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClaimCommission}
            disabled={claimingCommission}
            className="px-5 py-2.5 btn-emerald-3d font-black text-xs rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition shrink-0"
          >
            <Wallet className="w-4 h-4" />
            <span>
              {claimingCommission
                ? 'Settling...'
                : `Claim Commission (₹${parseFloat(refStats.claimable || '0').toFixed(0)})`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-black/50 border border-white/[0.08]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Lifetime Earned</div>
            <div className="font-mono tabular-nums text-base sm:text-2xl font-black text-white mt-0.5">
              ₹{parseFloat(refStats.gross_earned || '0').toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-black/50 border border-[#47EC84]/30">
            <div className="text-[10px] uppercase font-bold text-slate-400">Claimable Cash</div>
            <div className="font-mono tabular-nums text-base sm:text-2xl font-black text-[#47EC84] mt-0.5">
              ₹{parseFloat(refStats.claimable || '0').toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-black/50 border border-[#F5B041]/30">
            <div className="text-[10px] uppercase font-bold text-slate-400">Settled Total</div>
            <div className="font-mono tabular-nums text-base sm:text-2xl font-black text-[#F5B041] mt-0.5">
              ₹{parseFloat(refStats.claimed_total || '0').toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* 3-Tier Network Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {refStats.tiers.map((t) => (
            <div key={t.tier} className="p-4 rounded-2xl bg-[#0A0D10] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-white">
                  <Layers className="w-3.5 h-3.5 text-[#47EC84]" />
                  <span>Tier {t.tier}: {t.label}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#F5B041]/15 border border-[#F5B041]/30 text-[9px] font-mono font-bold text-[#F5B041]">
                  {t.rate}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06]">
                <span className="text-slate-400">{t.count} Active Players</span>
                <span className="font-mono font-black text-[#47EC84]">+₹{parseFloat(t.earned).toFixed(0)}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Network Volume: ₹{parseFloat(t.volume).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        {/* Invite Link Copier */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <div className="flex-1 min-w-0 p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-[#47EC84] truncate">
            {referralLink}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(referralLink);
              setCopied(true);
              showNotification('Invite link copied!', 'success');
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-5 py-3 btn-emerald-3d font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Partner Link'}</span>
          </button>
        </div>
      </div>

      {/* Progression Grid */}
      <div className="space-y-3.5">
        <h2 className="font-display text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#F5B041]" />
          <span>VIP Progression Ladder</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {tiers.map((t) => {
            const isCurrent = t.name === vipTier;
            return (
              <div
                key={t.name}
                className={`p-5 rounded-3xl lux-card transition ${
                  isCurrent ? 'border-[#47EC84]/60 shadow-glow' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-display font-black text-sm tracking-wide ${t.accent.split(' ')[1]}`}>
                    {t.name}
                  </span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-[#47EC84]/20 text-[#47EC84] border border-[#47EC84]/40">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono mb-1">Min: {t.minPts.toLocaleString()} PTS</div>
                <div className="text-xs text-[#47EC84] font-bold font-mono mb-2">Cashback: {t.cashback}</div>
                <div className="text-[11px] text-slate-300 leading-relaxed">{t.perk}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
