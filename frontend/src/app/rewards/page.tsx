"use client";

import React, { useState } from 'react';
import { 
  Gift, Trophy, Users, Sparkles, Copy, 
  CheckCircle2, ArrowRight, ShieldCheck, Star 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

export default function RewardsPage() {
  const { user, vipTier, loyaltyPoints, fetchBalances, showNotification, openModal } = useStore();
  const [copied, setCopied] = useState<boolean>(false);

  const referralCode = user?.profile?.referral_code || 'PLAY001';
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralCode}` : `https://veltrix.arena/?ref=${referralCode}`;

  const tiers = [
    { name: 'BRONZE', minPts: 0, cashback: '1.0%', perk: 'Standard demo access & daily reward' },
    { name: 'SILVER', minPts: 500, cashback: '2.5%', perk: 'Priority withdrawals & 2.5% cashback' },
    { name: 'GOLD', minPts: 2500, cashback: '5.0%', perk: 'VIP support agent & 5.0% rakeback' },
    { name: 'PLATINUM', minPts: 10000, cashback: '7.5%', perk: 'Higher table stake caps & bonuses' },
    { name: 'DIAMOND', minPts: 50000, cashback: '10.0%', perk: 'Dedicated VIP manager & luxury gifts' },
    { name: 'ELITE', minPts: 100000, cashback: '15.0%', perk: 'Zero-limit payouts & bespoke events' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-28">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-aurora-text">
          VIP Tiers & Player Rewards
        </h1>
        <p className="text-xs sm:text-sm text-aurora-muted max-w-2xl">
          Climb the ranks through active gameplay turnover. Unlock permanent cashback, higher limits, and daily loyalty boosts.
        </p>
      </div>

      {/* User Progress Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-aurora-surface via-aurora-elevated to-aurora-surface border border-aurora-border shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-xs text-aurora-muted">Current Status</div>
          <div className="text-3xl font-black text-aurora-gold tracking-wide font-mono flex items-center gap-2 justify-center md:justify-start">
            <Trophy className="w-7 h-7 text-aurora-gold" />
            <span>{vipTier} TIER</span>
          </div>
          <div className="text-xs text-aurora-muted">
            Loyalty Balance: <strong className="text-aurora-cyan font-mono">{parseFloat(loyaltyPoints).toFixed(0)} PTS</strong>
          </div>
        </div>

        <button
          onClick={() => openModal('dailyReward')}
          className="px-6 py-3.5 bg-gradient-to-r from-aurora-gold to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-glowGold hover:opacity-95 transition flex items-center gap-2"
        >
          <Gift className="w-4 h-4" />
          <span>Claim Today's Streak Bonus</span>
        </button>
      </div>

      {/* VIP Tiers Table / Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-aurora-text">VIP Progression Ranks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiers.map((t) => {
            const isCurrent = t.name === vipTier;
            return (
              <div
                key={t.name}
                className={`p-5 rounded-2xl border transition ${
                  isCurrent
                    ? 'bg-aurora-elevated border-aurora-gold/50 shadow-glowGold'
                    : 'bg-aurora-surface border-aurora-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-sm text-aurora-text font-mono">{t.name}</span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-aurora-gold/20 text-aurora-gold border border-aurora-gold/40">
                      CURRENT
                    </span>
                  )}
                </div>
                <div className="text-xs text-aurora-muted mb-1">Req: {t.minPts.toLocaleString()} Points</div>
                <div className="text-xs text-aurora-cyan font-bold font-mono mb-2">Cashback: {t.cashback}</div>
                <div className="text-[11px] text-aurora-muted leading-relaxed">{t.perk}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral Hub */}
      <div className="p-6 sm:p-8 rounded-3xl bg-aurora-surface border border-aurora-border shadow-card space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-aurora-border">
          <div className="w-10 h-10 rounded-xl bg-aurora-elevated flex items-center justify-center text-aurora-cyan">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-aurora-text">Affiliate & Referral Hub</h3>
            <p className="text-xs text-aurora-muted">Earn passive loyalty points on referred player gameplay</p>
          </div>
        </div>

        <p className="text-xs text-aurora-muted leading-relaxed max-w-xl">
          Share your referral code or direct invite link with friends. Whenever a referred player completes a game round, you automatically earn 10% bonus loyalty points.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="w-full sm:flex-1 p-3 rounded-xl bg-aurora-elevated border border-aurora-border font-mono text-xs text-aurora-text truncate">
            {referralLink}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(referralLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="w-full sm:w-auto px-5 py-3 bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/40 hover:bg-aurora-cyan/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Copied Link!' : 'Copy Invite Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
