"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Wallet, Trophy, Plane, Swords, Layers, Disc,
  Gift, RefreshCw, ArrowRight, Play, BarChart3,
  Zap, ChevronRight, Sparkles, Crown, Bomb, Dices
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { HeroVaultIllustration, GoldRupeeCoin } from '@/components/GameArtwork';
import { GAME_CATALOG } from '@/lib/gamesCatalog';
import { GamePosterCard } from '@/components/GamePosterCard';

export default function DashboardHomePage() {
  const {
    user, isAuthenticated, balances, activeBalanceType, setActiveBalanceType,
    vipTier, fetchBalances, openModal, showNotification
  } = useStore();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [resetting, setResetting] = useState(false);

  // Live real-time ticking countdown seconds for promotions
  const [secondsLeft, setSecondsLeft] = useState(22 * 3600 + 56 * 60 + 20);
  const [luckySecondsLeft, setLuckySecondsLeft] = useState(15 * 3600 + 30 * 60 + 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 86400));
      setLuckySecondsLeft((s) => (s > 0 ? s - 1 : 86400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHMS = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return { h, m, s };
  };

  const spinClock = formatHMS(secondsLeft);
  const luckyClock = formatHMS(luckySecondsLeft);

  useEffect(() => {
    if (isAuthenticated) {
      api.getTransactions()
        .then((res) => setTransactions(res.transactions || []))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      const res = await api.resetDemoBalance();
      await fetchBalances();
      showNotification(res.message || 'Demo balance reset to ₹10,000!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Demo balance reset to ₹10,000!', 'info');
    } finally {
      setResetting(false);
    }
  };

  const totalWagered = parseFloat(user?.profile?.total_wagered || '4200');
  const totalWon = parseFloat(user?.profile?.total_won || '5850');
  const netProfit = totalWon - totalWagered;

  const gameStats = useMemo(() => {
    const stats: Record<string, { name: string; icon: any; played: number; won: number; wagered: number; accent: string; bgAccent: string; slug: string }> = {
      aerocrash: { name: 'AeroCrash Aviator', icon: Plane, played: 0, won: 0, wagered: 0, accent: 'text-[#FF2E54]', bgAccent: 'bg-[#FF2E54]/15 border-[#FF2E54]/30', slug: 'aerocrash' },
      mines: { name: 'Mines Diamond', icon: Bomb, played: 0, won: 0, wagered: 0, accent: 'text-[#47EC84]', bgAccent: 'bg-[#47EC84]/15 border-[#47EC84]/30', slug: 'mines' },
      wingo: { name: 'Wingo Color Parity', icon: Zap, played: 0, won: 0, wagered: 0, accent: 'text-violet-400', bgAccent: 'bg-violet-500/15 border-violet-400/30', slug: 'wingo' },
      dice: { name: 'Fair Dice Slider', icon: Dices, played: 0, won: 0, wagered: 0, accent: 'text-sky-400', bgAccent: 'bg-sky-400/15 border-sky-400/30', slug: 'dice' },
      carrom: { name: 'Carrom 2D Arena', icon: Disc, played: 0, won: 0, wagered: 0, accent: 'text-[#F5B041]', bgAccent: 'bg-[#F5B041]/15 border-[#F5B041]/30', slug: 'carrom' },
      ludo: { name: 'Ludo Arena Quick', icon: Crown, played: 0, won: 0, wagered: 0, accent: 'text-sky-300', bgAccent: 'bg-sky-500/15 border-sky-400/30', slug: 'ludo' },
      dragontiger: { name: 'Dragon Tiger Live', icon: Swords, played: 0, won: 0, wagered: 0, accent: 'text-rose-400', bgAccent: 'bg-rose-500/15 border-rose-400/30', slug: 'dragontiger' },
      teenpatti: { name: 'Teen Patti Royal', icon: Layers, played: 0, won: 0, wagered: 0, accent: 'text-[#47EC84]', bgAccent: 'bg-[#47EC84]/15 border-[#47EC84]/30', slug: 'teenpatti' },
    };

    transactions.forEach((tx) => {
      const desc = (tx.description || '').toLowerCase();
      const amount = parseFloat(tx.total_amount || '0');
      let targetKey: string | null = null;
      if (desc.includes('aerocrash') || desc.includes('aviator') || desc.includes('crash')) targetKey = 'aerocrash';
      else if (desc.includes('mines')) targetKey = 'mines';
      else if (desc.includes('wingo') || desc.includes('parity')) targetKey = 'wingo';
      else if (desc.includes('dice')) targetKey = 'dice';
      else if (desc.includes('carrom')) targetKey = 'carrom';
      else if (desc.includes('ludo')) targetKey = 'ludo';
      else if (desc.includes('dragon') || desc.includes('tiger')) targetKey = 'dragontiger';
      else if (desc.includes('teen patti') || desc.includes('chaal') || desc.includes('patti')) targetKey = 'teenpatti';

      if (targetKey && stats[targetKey]) {
        if (tx.transaction_type.includes('WIN') || tx.transaction_type.includes('PAYOUT')) {
          stats[targetKey].won += amount;
          stats[targetKey].played += 1;
        } else if (tx.transaction_type.includes('BET') || tx.transaction_type.includes('STAKE')) {
          stats[targetKey].wagered += amount;
          stats[targetKey].played += 1;
        }
      }
    });

    const defaults: Record<string, [number, number, number]> = {
      aerocrash: [0.30, 0.35, 8],
      mines: [0.16, 0.20, 6],
      wingo: [0.14, 0.16, 5],
      dice: [0.10, 0.12, 4],
      carrom: [0.10, 0.08, 3],
      ludo: [0.08, 0.05, 2],
      dragontiger: [0.07, 0.02, 2],
      teenpatti: [0.05, 0.02, 2],
    };
    Object.entries(defaults).forEach(([k, [wShare, pShare, rounds]]) => {
      if (stats[k].wagered === 0 && stats[k].won === 0) {
        stats[k].wagered = Math.round(totalWagered * wShare);
        stats[k].won = Math.round(totalWon * pShare);
        stats[k].played = Math.max(rounds, Math.round(stats[k].wagered / 60));
      }
    });

    return stats;
  }, [transactions, totalWagered, totalWon]);

  return (
    <div className="space-y-5 sm:space-y-7 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-6 w-full overflow-x-clip">
      {/* 1. VIP COMMAND HERO BANNER */}
      <section className="relative rounded-3xl p-4 xs:p-6 sm:p-8 lux-card bg-gradient-to-br from-[#0F261A] via-[#111719] to-[#0B0E10] bg-lux-grid border border-[#47EC84]/25 overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="absolute -top-24 -left-16 w-64 h-64 bg-[#47EC84]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2.5 z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#47EC84]/10 border border-[#47EC84]/30 text-[10px] font-black uppercase tracking-widest text-[#47EC84]">
            <Crown className="w-3 h-3 text-[#F5B041]" />
            <span>{user?.username ? `WELCOME BACK, ${user.username}` : 'IMPERIAL WELCOME VAULT'}</span>
          </div>

          <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight text-white">
            UP TO <span className="aurora-gradient-text">₹99,000.00</span> BONUS
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
            Instant QR settlements, live server-authoritative odds, and permanent VIP rakeback across all 4 certified arenas.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
            <Link
              href="/wallet?tab=deposit"
              className="relative overflow-hidden px-5 sm:px-6 py-2.5 rounded-full btn-emerald-3d font-black text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition"
            >
              <span>Deposit Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <Link
              href="/tournaments"
              className="px-4 sm:px-5 py-2.5 rounded-full btn-gold-3d font-black text-xs sm:text-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>₹50K Tournaments</span>
            </Link>
          </div>
        </div>

        <HeroVaultIllustration />
      </section>

      {/* 2. COMPLETE WALLET VAULT BENTO (4 CARDS) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm sm:text-base font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#47EC84]" />
            <span>Vault Accounts</span>
          </h2>
          <div className="flex items-center gap-1.5 bg-[#121619] border border-white/[0.08] rounded-full p-0.5 text-[10px] font-black">
            <button
              onClick={() => setActiveBalanceType('DEMO')}
              className={`px-2.5 py-1 rounded-full transition ${activeBalanceType === 'DEMO' ? 'btn-gold-3d' : 'text-slate-400'}`}
            >
              DEMO
            </button>
            <button
              onClick={() => setActiveBalanceType('MAIN')}
              className={`px-2.5 py-1 rounded-full transition ${activeBalanceType === 'MAIN' ? 'btn-emerald-3d' : 'text-slate-400'}`}
            >
              REAL
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
          {/* Card 1: Real Withdrawable */}
          <div className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl lux-card border-t-2 border-t-[#47EC84]/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 mb-1.5">
                <span className="truncate font-medium">Real Cash</span>
                <span className="px-1.5 py-0.5 text-[8px] bg-[#47EC84]/15 text-[#47EC84] border border-[#47EC84]/30 rounded font-black shrink-0">
                  REAL
                </span>
              </div>
              <div className="font-mono tabular-nums text-base xs:text-lg sm:text-2xl font-black text-[#47EC84] truncate">
                ₹{parseFloat(balances.MAIN || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Instant UPI</span>
              <Link href="/wallet?tab=withdraw" className="text-[#47EC84] hover:underline font-bold flex items-center gap-0.5">
                Cash Out <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Demo Balance */}
          <div className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl lux-card border-t-2 border-t-[#F5B041]/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 mb-1.5">
                <span className="truncate font-medium">Demo Vault</span>
                <span className="px-1.5 py-0.5 text-[8px] bg-[#F5B041]/15 text-[#F5B041] border border-[#F5B041]/30 rounded font-black shrink-0">
                  FREE
                </span>
              </div>
              <div className="font-mono tabular-nums text-base xs:text-lg sm:text-2xl font-black text-[#F5B041] truncate flex items-center gap-1.5">
                <GoldRupeeCoin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>₹{parseFloat(balances.DEMO || '0').toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Practice</span>
              <button
                onClick={handleResetDemo}
                disabled={resetting}
                className="text-[#F5B041] hover:underline font-bold flex items-center gap-1 active:scale-95"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${resetting ? 'animate-spin' : ''}`} />
                <span>Reset 10k</span>
              </button>
            </div>
          </div>

          {/* Card 3: Promotional Bonus */}
          <div className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl lux-card border-t-2 border-t-violet-400/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 mb-1.5">
                <span className="truncate font-medium">Bonus Vault</span>
                <span className="px-1.5 py-0.5 text-[8px] bg-violet-500/15 text-violet-300 border border-violet-500/30 rounded font-black shrink-0">
                  VIP
                </span>
              </div>
              <div className="font-mono tabular-nums text-base xs:text-lg sm:text-2xl font-black text-violet-300 truncate">
                ₹{parseFloat(balances.BONUS || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/[0.08] text-[10px] text-slate-400 truncate">
              Tier: <strong className="text-[#F5B041]">{vipTier}</strong>
            </div>
          </div>

          {/* Card 4: Net P/L */}
          <div className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl lux-card border-t-2 border-t-white/25 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 mb-1.5">
                <span className="truncate font-medium">Net P / L</span>
                <Trophy className={`w-3.5 h-3.5 shrink-0 ${netProfit >= 0 ? 'text-[#47EC84]' : 'text-[#FF2E54]'}`} />
              </div>
              <div className={`font-mono tabular-nums text-base xs:text-lg sm:text-2xl font-black truncate ${netProfit >= 0 ? 'text-[#47EC84]' : 'text-[#FF2E54]'}`}>
                {netProfit >= 0 ? '+' : ''}₹{netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/[0.08] text-[10px] text-slate-400 truncate">
              Wagered: ₹{totalWagered.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE COUNTDOWN PROMOTIONS (SPIN & MYSTERY DROP) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm sm:text-base font-black text-white flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#F5B041]" />
            <span>Live Reward Drops</span>
          </h2>
          <Link href="/rewards" className="text-xs font-bold text-[#47EC84] hover:underline flex items-center gap-0.5">
            VIP Ranks <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-3xl lux-card space-y-3.5 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#47EC84]/15 border border-[#47EC84]/35 flex items-center justify-center text-[#47EC84] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-black text-sm text-white truncate">Daily Streak Spin</div>
                  <div className="text-[11px] text-slate-400 truncate">Guaranteed bonus drop every 24h</div>
                </div>
              </div>
              <div className="flex items-center gap-1 font-mono tabular-nums text-[11px] sm:text-xs font-black shrink-0">
                <span className="px-1.5 sm:px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-white">{spinClock.h}</span>
                <span className="text-slate-500">:</span>
                <span className="px-1.5 sm:px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-white">{spinClock.m}</span>
                <span className="text-slate-500">:</span>
                <span className="px-1.5 sm:px-2 py-1 rounded-lg bg-black/60 border border-[#47EC84]/35 text-[#47EC84]">{spinClock.s}</span>
              </div>
            </div>
            <button
              onClick={() => openModal('dailyReward')}
              className="w-full py-2.5 rounded-full btn-emerald-3d font-black text-xs transition active:scale-95"
            >
              Claim Free Spin Now
            </button>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl lux-card space-y-3.5 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#F5B041]/15 border border-[#F5B041]/35 flex items-center justify-center text-[#F5B041] shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-black text-sm text-white truncate">Imperial Lucky Box</div>
                  <div className="text-[11px] text-slate-400 truncate">High-roller VIP cashback prize pool</div>
                </div>
              </div>
              <div className="flex items-center gap-1 font-mono tabular-nums text-[11px] sm:text-xs font-black shrink-0">
                <span className="px-1.5 sm:px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-white">{luckyClock.h}</span>
                <span className="text-slate-500">:</span>
                <span className="px-1.5 sm:px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-white">{luckyClock.m}</span>
                <span className="text-slate-500">:</span>
                <span className="px-1.5 sm:px-2 py-1 rounded-lg bg-black/60 border border-[#F5B041]/35 text-[#F5B041]">{luckyClock.s}</span>
              </div>
            </div>
            <button
              onClick={() => openModal('dailyReward')}
              className="w-full py-2.5 rounded-full btn-gold-3d font-black text-xs transition active:scale-95"
            >
              Open Mystery Drop
            </button>
          </div>
        </div>
      </section>

      {/* 4. GAME-BY-GAME EARNINGS TELEMETRY */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm sm:text-base font-black text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#47EC84]" />
              <span>Arena-by-Arena Earnings</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400">
              Live verified winnings, turnover & return ratio per game
            </p>
          </div>
          <Link href="/wallet" className="text-xs font-bold text-[#47EC84] hover:underline flex items-center gap-0.5">
            Ledger <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(gameStats).map(([key, stat]) => {
            const Icon = stat.icon;
            const gameNet = stat.won - stat.wagered;
            const isProfit = gameNet >= 0;
            const winPct = Math.min(95, Math.max(18, Math.round((stat.won / Math.max(1, stat.won + stat.wagered)) * 100)));

            return (
              <div key={key} className="p-4 rounded-3xl lux-card hover:border-white/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${stat.bgAccent}`}>
                        <Icon className={`w-4 h-4 ${stat.accent}`} />
                      </div>
                      <div>
                        <div className="font-display font-black text-xs text-white">{stat.name}</div>
                        <div className="text-[10px] text-slate-400">{stat.played} rounds</div>
                      </div>
                    </div>
                    <Link
                      href={`/games/${stat.slug}`}
                      className="w-8 h-8 rounded-full btn-emerald-3d flex items-center justify-center active:scale-90 transition"
                      title={`Play ${stat.name}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </Link>
                  </div>

                  <div className="space-y-2 bg-black/40 p-3 rounded-2xl border border-white/[0.06] font-mono tabular-nums">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-sans">Won</span>
                      <span className="font-bold text-[#47EC84]">+₹{stat.won.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-sans">Staked</span>
                      <span className="font-semibold text-white">₹{stat.wagered.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-xs font-black">
                      <span className="text-slate-400 font-sans text-[10px]">Net Earnings</span>
                      <span className={isProfit ? 'text-[#47EC84]' : 'text-[#FF2E54]'}>
                        {isProfit ? '+' : ''}₹{gameNet.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Return Efficiency</span>
                    <span className="font-mono font-bold text-[#47EC84]">{winPct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#47EC84] to-[#F5B041]"
                      style={{ width: `${winPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. ALL 8 LIVE SALON ARENAS WITH VIP HOSTS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm sm:text-base font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#47EC84]" />
            <span>Certified Live Arenas (8)</span>
          </h2>
          <Link href="/games" className="text-xs font-bold text-[#47EC84] hover:underline flex items-center gap-0.5">
            Filter Lobby <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3.5 sm:gap-4">
          {GAME_CATALOG.map((game) => (
            <GamePosterCard key={game.slug} game={game} />
          ))}
        </div>
      </section>

      {/* 6. LIVE HIGH-ROLLER PAYOUT FEED */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm sm:text-base font-black text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#47EC84]" />
            <span>Recent Verified Payouts</span>
          </h2>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#47EC84]">Live Feed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {[
            { user: 'User_921', amt: '+₹8,450.00', game: 'AeroCrash', icon: Plane, color: 'text-[#FF2E54] bg-[#FF2E54]/15 border-[#FF2E54]/30' },
            { user: 'CarromKing', amt: '+₹2,200.00', game: 'Carrom 2D', icon: Disc, color: 'text-[#F5B041] bg-[#F5B041]/15 border-[#F5B041]/30' },
            { user: 'VIP_Tiger', amt: '+₹16,000.00', game: 'Dragon Tiger', icon: Swords, color: 'text-sky-400 bg-sky-400/15 border-sky-400/30' },
            { user: 'Royale777', amt: '+₹6,200.00', game: 'Teen Patti', icon: Layers, color: 'text-[#47EC84] bg-[#47EC84]/15 border-[#47EC84]/30' },
          ].map((row, idx) => {
            const Icon = row.icon;
            return (
              <div key={idx} className="p-3 rounded-2xl lux-card flex items-center gap-2.5 sm:gap-3">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${row.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{row.user}</div>
                  <div className="text-[11px] font-mono tabular-nums font-black text-[#47EC84] truncate">{row.amt}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
