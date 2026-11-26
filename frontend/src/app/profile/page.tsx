"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, ShieldCheck, Trophy, Gift, Wallet, 
  Settings, LogOut, Copy, Check, Sparkles, 
  Volume2, VolumeX, Smartphone, ArrowRight, 
  Download, HelpCircle, Flame, ExternalLink, RefreshCw, Crown
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { GoldRupeeCoin } from '@/components/GameArtwork';

export default function PlayerProfilePage() {
  const { 
    user, isAuthenticated, isAdmin, vipTier, loyaltyPoints, 
    balances, logout, openModal, showNotification 
  } = useStore();

  const [copiedCode, setCopiedCode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const referralCode = user?.profile?.referral_code || 'VELTRIX001';
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/?ref=${referralCode}` 
    : `https://veltrix.arena/?ref=${referralCode}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(true);
    showNotification('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyId = () => {
    navigator.clipboard.writeText(user?.id || 'VX-90241');
    showNotification('Player ID copied!', 'info');
  };

  const totalWagered = parseFloat(user?.profile?.total_wagered || '0');
  const totalWon = parseFloat(user?.profile?.total_won || '0');

  return (
    <div className="space-y-6 sm:space-y-8 px-2.5 xs:px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-5xl mx-auto pb-32 w-full max-w-full overflow-x-hidden">
      {/* 1. High-Roller Player Profile Header */}
      <div className="p-5 sm:p-7 rounded-3xl lux-card border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#47EC84]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Avatar with VIP Ring */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#47EC84] via-[#F5B041] to-[#47EC84] p-1 shadow-glowGreen">
            <div className="w-full h-full bg-[#07090A] rounded-[20px] flex items-center justify-center font-display font-black text-3xl text-white">
              {user?.username?.substring(0, 2).toUpperCase() || 'VX'}
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#47EC84] border-2 border-[#07090A] flex items-center justify-center shadow">
            <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
              {user?.username || 'VIP High-Roller'}
            </h1>
            <span className="telemetry-badge text-[#F5B041] border-[#F5B041]/40 bg-[#F5B041]/15">
              <Crown className="w-3 h-3" />
              <span>{vipTier || 'GOLD'} STATUS</span>
            </span>
            <span className="telemetry-badge text-[#47EC84] border-[#47EC84]/40 bg-[#47EC84]/15">
              <ShieldCheck className="w-3 h-3" />
              <span>KYC VERIFIED</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono">{user?.email || 'player@veltrix.arena'}</p>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-400 font-mono">
            <span>PLAYER ID: <strong className="text-white">{user?.id?.substring(0, 10) || 'VX-90241001'}</strong></span>
            <button onClick={copyId} className="text-[#47EC84] hover:underline flex items-center gap-1 text-[11px] font-bold">
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Quick Cashier Shortcut */}
        <div className="shrink-0 pt-2 sm:pt-0">
          <Link
            href="/wallet?tab=deposit"
            className="px-5 py-3 btn-emerald-3d font-display font-black text-xs rounded-xl shadow-glowGreen transition flex items-center gap-2 active:scale-95"
          >
            <Wallet className="w-4 h-4" />
            <span>Vault Cashier</span>
          </Link>
        </div>
      </div>

      {/* 2. Lifetime Financial & Gaming Record */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl lux-card border-[#47EC84]/30">
          <div className="text-[10px] sm:text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Withdrawable Cash</div>
          <div className="font-display text-xl sm:text-2xl font-black text-[#47EC84] font-mono tabular-nums truncate">
            ₹{parseFloat(balances.MAIN || '0').toFixed(2)}
          </div>
          <div className="text-[9px] text-slate-400 mt-1 font-mono">Instant Payout Available</div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl lux-card border-[#F5B041]/30">
          <div className="text-[10px] sm:text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Demo Free Balance</div>
          <div className="font-display text-xl sm:text-2xl font-black text-[#F5B041] font-mono tabular-nums truncate">
            ₹{parseFloat(balances.DEMO || '0').toFixed(0)}
          </div>
          <div className="text-[9px] text-slate-400 mt-1 font-mono">No Risk Sandbox</div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl lux-card">
          <div className="text-[10px] sm:text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Total Lifetime Volume</div>
          <div className="font-display text-xl sm:text-2xl font-black text-white font-mono tabular-nums truncate">
            ₹{totalWagered.toFixed(0)}
          </div>
          <div className="text-[9px] text-slate-400 mt-1 font-mono">Across All 4 Arenas</div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl lux-card border-[#47EC84]/30">
          <div className="text-[10px] sm:text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Net Winnings</div>
          <div className="font-display text-xl sm:text-2xl font-black text-[#47EC84] font-mono tabular-nums truncate">
            +₹{totalWon.toFixed(0)}
          </div>
          <div className="text-[9px] text-slate-400 mt-1 font-mono">Provably Fair Audited</div>
        </div>
      </div>

      {/* 3. VIP Loyalty Tier Card */}
      <div className="p-5 sm:p-6 rounded-3xl lux-card border-[#F5B041]/40 shadow-lux space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5B041]/15 border border-[#F5B041]/40 flex items-center justify-center text-[#F5B041]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-black text-base text-white">VIP Imperial Loyalty Program</div>
              <div className="text-xs text-slate-400">Earn loyalty points on every single spin, strike, and flyaway</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display font-black text-lg text-[#F5B041] tabular-nums">{parseFloat(loyaltyPoints || '0').toFixed(0)} PTS</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">{vipTier || 'GOLD'} MEMBER</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 rounded-full bg-black/60 border border-white/10 overflow-hidden p-0.5">
            <div className="h-full bg-gradient-to-r from-[#47EC84] via-[#F5B041] to-[#47EC84] w-3/5 rounded-full shadow-glowGreen" />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Tier Status: <strong className="text-white">{vipTier || 'GOLD'}</strong></span>
            <span>Next Tier: 5,000 PTS (7.5% Rakeback)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#47EC84]" />
            <span>Active Perk: <strong className="text-[#47EC84] font-bold">5.0% Permanent Rakeback + Zero Fee IMPS</strong></span>
          </span>
          <button
            onClick={() => openModal('dailyReward')}
            className="text-[#F5B041] hover:underline font-bold text-xs flex items-center gap-1 shrink-0"
          >
            <span>Claim Daily Streak Bonus</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* 4. Referral & Affiliate Card */}
      <div className="p-5 sm:p-6 rounded-3xl lux-card space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-2xl bg-[#47EC84]/15 border border-[#47EC84]/40 flex items-center justify-center text-[#47EC84]">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-black text-base text-white">Affiliate Partner Network</div>
            <div className="text-xs text-slate-400">Earn ₹200 instant credits + 5% lifetime turnover rakeback per friend</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1 min-w-0 p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-[#47EC84] truncate">
            {referralLink}
          </div>
          <button
            onClick={copyReferral}
            className="px-6 py-3.5 rounded-xl btn-emerald-3d font-display font-black text-xs shadow-glowGreen transition active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Link Copied!' : 'Copy Partner Link'}</span>
          </button>
        </div>
      </div>

      {/* 5. App Experience & Settings */}
      <div className="p-5 sm:p-6 rounded-3xl lux-card space-y-4">
        <div className="flex items-center gap-2.5">
          <Settings className="w-4 h-4 text-[#47EC84]" />
          <h2 className="font-display font-black text-base text-white">Arena Experience Controls</h2>
        </div>

        <div className="divide-y divide-white/[0.06] text-xs">
          {/* Sound FX Toggle */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? <Volume2 className="w-5 h-5 text-[#47EC84]" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
              <div>
                <div className="font-bold text-white text-sm">Synthesized Audio Engine</div>
                <div className="text-[11px] text-slate-400">AeroCrash jet engine afterburners & Carrom acoustic coin strikes</div>
              </div>
            </div>
            <button
              onClick={() => { setSoundEnabled(!soundEnabled); showNotification(`Sound ${!soundEnabled ? 'Enabled' : 'Muted'}`, 'info'); }}
              className={`w-12 h-6 rounded-full transition-colors p-1 border ${
                soundEnabled ? 'bg-[#47EC84] border-[#47EC84]' : 'bg-black/60 border-white/20'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Haptics Toggle */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[#F5B041]" />
              <div>
                <div className="font-bold text-white text-sm">Haptic Vibration Telemetry</div>
                <div className="text-[11px] text-slate-400">Micro-vibrations on bet placements, cash-outs, and pocket strikes</div>
              </div>
            </div>
            <button
              onClick={() => { setHapticsEnabled(!hapticsEnabled); showNotification(`Haptics ${!hapticsEnabled ? 'Enabled' : 'Muted'}`, 'info'); }}
              className={`w-12 h-6 rounded-full transition-colors p-1 border ${
                hapticsEnabled ? 'bg-[#F5B041] border-[#F5B041]' : 'bg-black/60 border-white/20'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${hapticsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Admin Control Center shortcut if user is admin */}
      {isAdmin && (
        <Link
          href="/admin"
          className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between text-xs font-bold text-purple-300 hover:bg-purple-900/30 transition shadow-card"
        >
          <span className="flex items-center gap-2.5 font-display text-sm font-black">
            <Flame className="w-5 h-5 text-purple-400" />
            <span>Master Super Admin Command Console</span>
          </span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {/* 7. Logout Button */}
      {isAuthenticated && (
        <button
          onClick={logout}
          className="w-full py-4 bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-400 font-display font-black text-xs sm:text-sm rounded-2xl transition active:scale-95 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of VELTRIX ARENA</span>
        </button>
      )}
    </div>
  );
}
