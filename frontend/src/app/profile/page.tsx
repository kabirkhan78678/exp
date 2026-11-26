"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, ShieldCheck, Trophy, Gift, Wallet, 
  Settings, LogOut, Copy, Check, Sparkles, 
  Volume2, VolumeX, Smartphone, ArrowRight, 
  Download, HelpCircle, Flame, ExternalLink, RefreshCw 
} from 'lucide-react';
import { useStore } from '@/store/useStore';

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
    <div className="space-y-4 sm:space-y-6 px-2.5 xs:px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-4xl mx-auto pb-32 w-full max-w-full overflow-x-hidden">
      {/* 1. Player Header Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#212526] border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#47EC84] via-emerald-400 to-[#F59E0B] p-0.5 shadow-glowGreen">
            <div className="w-full h-full bg-[#141617] rounded-[14px] flex items-center justify-center font-black text-2xl text-[#47EC84]">
              {user?.username?.substring(0, 2).toUpperCase() || 'VX'}
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#47EC84] border-2 border-slate-950 flex items-center justify-center shadow">
            <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {user?.username || 'Player'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 uppercase tracking-wider">
              {vipTier} VIP CLUB
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#47EC84]/15 text-[#47EC84] border border-[#47EC84]/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>KYC Verified</span>
            </span>
          </div>

          <p className="text-xs text-zinc-400">{user?.email || 'player@veltrix.arena'}</p>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-zinc-400 font-mono">
            <span>ID: <strong className="text-white">{user?.id?.substring(0, 8) || 'VX-90241'}</strong></span>
            <button onClick={copyId} className="text-[#47EC84] hover:underline flex items-center gap-0.5 text-[11px]">
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Quick Deposit shortcut */}
        <div className="shrink-0 pt-2 sm:pt-0">
          <Link
            href="/wallet?tab=deposit"
            className="px-4 py-2 bg-[#47EC84] hover:bg-[#3ce076] text-slate-950 font-black text-xs rounded-xl shadow-glowGreen transition flex items-center gap-1.5 active:scale-95"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Cashier Hub</span>
          </Link>
        </div>
      </div>

      {/* 2. Lifetime Gaming & Financial Record */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 rounded-3xl bg-[#212526] border border-white/[0.08]">
          <div className="text-[10px] sm:text-xs text-zinc-400 mb-1">Withdrawable Cash</div>
          <div className="text-lg sm:text-xl font-black text-[#47EC84] font-mono truncate">
            ₹{parseFloat(balances.MAIN || '0').toFixed(2)}
          </div>
        </div>

        <div className="p-3.5 rounded-3xl bg-[#212526] border border-white/[0.08]">
          <div className="text-[10px] sm:text-xs text-zinc-400 mb-1">Demo Balance</div>
          <div className="text-lg sm:text-xl font-black text-[#F59E0B] font-mono truncate">
            ₹{parseFloat(balances.DEMO || '0').toFixed(0)}
          </div>
        </div>

        <div className="p-3.5 rounded-3xl bg-[#212526] border border-white/[0.08]">
          <div className="text-[10px] sm:text-xs text-zinc-400 mb-1">Total Turnover</div>
          <div className="text-lg sm:text-xl font-black text-white font-mono truncate">
            ₹{totalWagered.toFixed(0)}
          </div>
        </div>

        <div className="p-3.5 rounded-3xl bg-[#212526] border border-white/[0.08]">
          <div className="text-[10px] sm:text-xs text-zinc-400 mb-1">Total Winnings</div>
          <div className="text-lg sm:text-xl font-black text-[#47EC84] font-mono truncate">
            +₹{totalWon.toFixed(0)}
          </div>
        </div>
      </div>

      {/* 3. VIP Loyalty Tier Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#212526] border border-[#F59E0B]/30 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F59E0B]" />
            <div>
              <div className="font-black text-sm text-white">VIP Loyalty Program</div>
              <div className="text-[10px] text-zinc-400">Level up by playing any certified arena game</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-black text-sm text-[#F59E0B]">{parseFloat(loyaltyPoints).toFixed(0)} PTS</div>
            <div className="text-[9px] text-zinc-400 uppercase">{vipTier} STATUS</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-[#141617] border border-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#47EC84] via-emerald-400 to-[#F59E0B] w-2/5 rounded-full" />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>{vipTier}</span>
            <span>Next Tier: 2,500 PTS</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#141617] border border-white/5 text-xs text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#47EC84]" />
            <span>Active Perk: <strong className="text-[#47EC84]">5.0% Permanent Rakeback</strong></span>
          </span>
          <button
            onClick={() => openModal('dailyReward')}
            className="text-[#F59E0B] hover:underline font-bold text-[11px]"
          >
            Claim Daily Streak →
          </button>
        </div>
      </div>

      {/* 4. Referral & Affiliate Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#212526] border border-white/[0.08] shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-[#F59E0B]" />
          <div>
            <div className="font-black text-sm text-white">Invite Friends & Earn Commission</div>
            <div className="text-[10px] text-zinc-400">Earn ₹200 free demo credits + 5% lifetime rakeback per referral</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 p-2.5 rounded-xl bg-[#141617] border border-white/10 font-mono text-xs text-[#47EC84] truncate">
            {referralLink}
          </div>
          <button
            onClick={copyReferral}
            className="px-4 py-2.5 rounded-xl bg-[#47EC84] hover:bg-[#3ce076] text-slate-950 font-black text-xs shadow-glowGreen transition active:scale-95 flex items-center gap-1 shrink-0"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Share Link'}</span>
          </button>
        </div>
      </div>

      {/* 5. App Preferences & Audio Controls */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#212526] border border-white/[0.08] shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#47EC84]" />
          <h2 className="font-black text-sm text-white">App Experience & Settings</h2>
        </div>

        <div className="divide-y divide-white/5 text-xs">
          {/* Sound FX Toggle */}
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#47EC84]" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
              <div>
                <div className="font-bold text-white">In-Game Audio Effects</div>
                <div className="text-[10px] text-zinc-400">Real-time synthesized audio in Aviator & Carrom</div>
              </div>
            </div>
            <button
              onClick={() => { setSoundEnabled(!soundEnabled); showNotification(`Sound ${!soundEnabled ? 'Enabled' : 'Muted'}`, 'info'); }}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${soundEnabled ? 'bg-[#47EC84]' : 'bg-zinc-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Haptics Toggle */}
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#F59E0B]" />
              <div>
                <div className="font-bold text-white">Haptic Feedback</div>
                <div className="text-[10px] text-zinc-400">Tactile touch vibration on bets and pocketing</div>
              </div>
            </div>
            <button
              onClick={() => { setHapticsEnabled(!hapticsEnabled); showNotification(`Haptics ${!hapticsEnabled ? 'Enabled' : 'Muted'}`, 'info'); }}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${hapticsEnabled ? 'bg-[#F59E0B]' : 'bg-zinc-800'}`}
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
          className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between text-xs font-bold text-purple-300 hover:bg-purple-900/30 transition shadow-card"
        >
          <span className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-400" />
            <span>Super Admin Control Center</span>
          </span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {/* 7. Logout Button */}
      {isAuthenticated && (
        <button
          onClick={logout}
          className="w-full py-3.5 bg-red-950/30 hover:bg-red-900/40 border border-red-500/40 text-red-400 font-bold text-xs sm:text-sm rounded-2xl transition active:scale-95 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of VELTRIX ARENA</span>
        </button>
      )}
    </div>
  );
}
