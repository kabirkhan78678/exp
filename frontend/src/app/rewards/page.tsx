"use client";

import React, { useState } from 'react';
import { Gift, Trophy, Users, Copy, Crown, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function RewardsPage() {
  const { user, vipTier, loyaltyPoints, openModal, showNotification } = useStore();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.profile?.referral_code || 'PLAY001';
  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${referralCode}`
      : `https://veltrix.arena/?ref=${referralCode}`;

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
          VIP Tiers & Imperial Rewards
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Earn loyalty points on every wager across AeroCrash, Carrom, Dragon Tiger, and Teen Patti to unlock permanent cashback.
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

      {/* Referral Hub */}
      <div className="p-5 sm:p-7 rounded-3xl lux-card space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-[#47EC84]/15 border border-[#47EC84]/35 flex items-center justify-center text-[#47EC84]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white">Affiliate & Referral Program</h3>
            <p className="text-xs text-slate-400">Earn 10% loyalty boost on referred gameplay</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
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
            <span>{copied ? 'Copied!' : 'Copy Invite Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
