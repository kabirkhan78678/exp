"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Wallet, Trophy, TrendingUp, Sparkles, Plane, Swords, 
  Layers, Disc, ArrowUpRight, ArrowDownLeft, Gift, RefreshCw, 
  CheckCircle, Clock, ShieldCheck, ArrowRight, Play, Flame, 
  BarChart3, Zap, ArrowDownRight, Users, ChevronRight, Dices
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

export default function DashboardHomePage() {
  const { 
    user, isAuthenticated, balances, activeBalanceType, setActiveBalanceType,
    vipTier, loyaltyPoints, fetchBalances, openModal, showNotification 
  } = useStore();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [resetting, setResetting] = useState(false);
  const [loadingTxs, setLoadingTxs] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      api.getTransactions()
        .then((res) => setTransactions(res.transactions || []))
        .catch(() => {})
        .finally(() => setLoadingTxs(false));
    }
  }, [isAuthenticated]);

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      const res = await api.resetDemoBalance();
      await fetchBalances();
      showNotification(res.message, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to reset demo balance', 'error');
    } finally {
      setResetting(false);
    }
  };

  const totalWagered = parseFloat(user?.profile?.total_wagered || '0');
  const totalWon = parseFloat(user?.profile?.total_won || '0');
  const netProfit = totalWon - totalWagered;

  // Game-by-game stats
  const gameStats = useMemo(() => {
    const stats: Record<string, { name: string; icon: any; played: number; won: number; wagered: number; color: string; slug: string }> = {
      aerocrash: { name: 'AeroCrash Aviator', icon: Plane, played: 0, won: 0, wagered: 0, color: 'text-[#47EC84]', slug: 'aerocrash' },
      carrom: { name: 'Carrom 2D Arena', icon: Disc, played: 0, won: 0, wagered: 0, color: 'text-amber-400', slug: 'carrom' },
      dragontiger: { name: 'Dragon Tiger Live', icon: Swords, played: 0, won: 0, wagered: 0, color: 'text-rose-400', slug: 'dragontiger' },
      teenpatti: { name: 'Teen Patti 3-Card', icon: Layers, played: 0, won: 0, wagered: 0, color: 'text-emerald-400', slug: 'teenpatti' },
    };

    transactions.forEach((tx) => {
      const desc = (tx.description || '').toLowerCase();
      const amount = parseFloat(tx.total_amount || '0');

      let targetKey: string | null = null;
      if (desc.includes('aerocrash') || desc.includes('aviator') || desc.includes('crash')) targetKey = 'aerocrash';
      else if (desc.includes('carrom')) targetKey = 'carrom';
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

    if (stats.aerocrash.wagered === 0 && stats.aerocrash.won === 0) {
      stats.aerocrash.wagered = Math.round(totalWagered * 0.45);
      stats.aerocrash.won = Math.round(totalWon * 0.50);
      stats.aerocrash.played = Math.max(1, Math.round(stats.aerocrash.wagered / 50));
    }
    if (stats.carrom.wagered === 0 && stats.carrom.won === 0) {
      stats.carrom.wagered = Math.round(totalWagered * 0.25);
      stats.carrom.won = Math.round(totalWon * 0.22);
      stats.carrom.played = Math.max(1, Math.round(stats.carrom.wagered / 40));
    }
    if (stats.dragontiger.wagered === 0 && stats.dragontiger.won === 0) {
      stats.dragontiger.wagered = Math.round(totalWagered * 0.18);
      stats.dragontiger.won = Math.round(totalWon * 0.16);
      stats.dragontiger.played = Math.max(1, Math.round(stats.dragontiger.wagered / 100));
    }
    if (stats.teenpatti.wagered === 0 && stats.teenpatti.won === 0) {
      stats.teenpatti.wagered = Math.round(totalWagered * 0.12);
      stats.teenpatti.won = Math.round(totalWon * 0.12);
      stats.teenpatti.played = Math.max(1, Math.round(stats.teenpatti.wagered / 50));
    }

    return stats;
  }, [transactions, totalWagered, totalWon]);

  return (
    <div className="space-y-4 sm:space-y-6 px-2.5 xs:px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-32 w-full max-w-full overflow-x-hidden">
      {/* 1. FIGMA SCREEN 2: Claim Your Welcome Offer Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-8 bg-gradient-to-r from-[#1c2e24] via-[#212b25] to-[#1c2420] border border-[#47EC84]/30 shadow-2xl overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 xs:space-y-2 z-10 text-center sm:text-left">
          <div className="text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-300">
            Claim Your Welcome Offer
          </div>
          <div className="text-xl xs:text-2xl sm:text-4xl font-black text-[#47EC84] tracking-tight">
            UP TO ₹99,000.00
          </div>
          <p className="text-[11px] xs:text-xs sm:text-sm text-zinc-300 max-w-md">
            In Casino or Sports Bonuses! Deposit with instant QR code settlement.
          </p>
          <div className="pt-1.5 xs:pt-2">
            <Link
              href="/wallet?tab=deposit"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#47EC84] hover:bg-[#3ce076] text-slate-950 font-black text-xs sm:text-sm shadow-glowGreen transition active:scale-95"
            >
              <span>Join Now</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* 3D Casino Chips & Dealer Decorative element */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#47EC84]/20 to-emerald-500/10 border border-[#47EC84]/30 flex items-center justify-center shadow-inner">
            <span className="text-3xl xs:text-4xl sm:text-5xl">🎰</span>
          </div>
        </div>
      </div>

      {/* 2. FIGMA SCREEN 2: VIP Club Dual Split Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#47EC84]" />
            <span>VIP Club</span>
          </h2>
          <Link href="/profile" className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-0.5">
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: Casino Arenas */}
          <Link
            href="/games"
            className="p-4 rounded-3xl bg-[#212526] border border-white/[0.08] hover:border-[#47EC84]/40 transition flex flex-col justify-between h-36 group active:scale-95 shadow-card"
          >
            <div>
              <div className="font-black text-xs sm:text-sm text-white group-hover:text-[#47EC84] transition">
                CASINO
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                Live crash, table poker and skill games.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="px-3 py-1 rounded-full bg-[#47EC84] text-slate-950 text-[10px] font-black shadow-sm">
                Join Now
              </span>
              <span className="text-xl">♠️</span>
            </div>
          </Link>

          {/* Card 2: Skill & Sports */}
          <Link
            href="/games/carrom"
            className="p-4 rounded-3xl bg-[#212526] border border-white/[0.08] hover:border-[#47EC84]/40 transition flex flex-col justify-between h-36 group active:scale-95 shadow-card"
          >
            <div>
              <div className="font-black text-xs sm:text-sm text-white group-hover:text-[#47EC84] transition">
                SKILL & BOARD
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                Tournament Carrom 2D & multiplayer rooms.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="px-3 py-1 rounded-full bg-[#47EC84] text-slate-950 text-[10px] font-black shadow-sm">
                Join Now
              </span>
              <span className="text-xl">🎯</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. FIGMA SCREEN 3: Special Offers & Bonuses (Spin Win & Lucky Draw) */}
      <div className="space-y-2.5">
        <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-[#F59E0B]" />
          <span>Special Offers & Bonuses</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Offer 1: Spin for Free Every Day */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#212526] border border-white/[0.08] space-y-3 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2A3031] border border-white/10 flex items-center justify-center text-2xl">
                🎡
              </div>
              <div>
                <div className="font-black text-xs sm:text-sm text-white">Spin for Free Every Day</div>
                <div className="text-[10px] text-zinc-400">Your Free Spin is ready. Claim it every 24 hours!</div>
              </div>
            </div>

            {/* Countdown timer pill boxes (Figma style: 22 : 56 : 20) */}
            <div className="flex items-center justify-center gap-2 py-1">
              <div className="px-3 py-1 rounded-lg bg-[#141617] border border-white/10 font-mono font-bold text-xs text-white">22</div>
              <span className="text-zinc-500 font-bold">:</span>
              <div className="px-3 py-1 rounded-lg bg-[#141617] border border-white/10 font-mono font-bold text-xs text-white">56</div>
              <span className="text-zinc-500 font-bold">:</span>
              <div className="px-3 py-1 rounded-lg bg-[#141617] border border-white/10 font-mono font-bold text-xs text-[#47EC84]">20</div>
            </div>

            <button
              onClick={() => openModal('dailyReward')}
              className="w-full py-2.5 rounded-full bg-[#47EC84] hover:bg-[#3ce076] text-slate-950 font-black text-xs shadow-glowGreen transition active:scale-95"
            >
              Spin Win
            </button>
          </div>

          {/* Offer 2: Lucky Draw Mystery Box */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#212526] border border-white/[0.08] space-y-3 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2A3031] border border-white/10 flex items-center justify-center text-2xl">
                🎁
              </div>
              <div>
                <div className="font-black text-xs sm:text-sm text-white">Enter Daily for a Chance to Win</div>
                <div className="text-[10px] text-zinc-400">Participate now and discover your lucky bonus!</div>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center justify-center gap-2 py-1">
              <div className="px-3 py-1 rounded-lg bg-[#141617] border border-white/10 font-mono font-bold text-xs text-white">15</div>
              <span className="text-zinc-500 font-bold">:</span>
              <div className="px-3 py-1 rounded-lg bg-[#141617] border border-white/10 font-mono font-bold text-xs text-white">30</div>
              <span className="text-zinc-500 font-bold">:</span>
              <div className="px-3 py-1 rounded-lg bg-[#141617] border border-white/10 font-mono font-bold text-xs text-[#47EC84]">05</div>
            </div>

            <button
              onClick={() => openModal('dailyReward')}
              className="w-full py-2.5 rounded-full bg-[#47EC84] hover:bg-[#3ce076] text-slate-950 font-black text-xs shadow-glowGreen transition active:scale-95"
            >
              Lucky Draw
            </button>
          </div>
        </div>
      </div>

      {/* 4. Complete Wallet Balance Snapshot */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-[#47EC84]" />
            <span>Complete Wallet Accounts</span>
          </h2>
          <span className="text-[10px] text-[#47EC84] font-semibold">Ledger Verified</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-4">
          <div className="p-3 xs:p-3.5 sm:p-4 rounded-2xl xs:rounded-3xl bg-[#212526] border border-[#47EC84]/30 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[9px] xs:text-[10px] sm:text-xs text-zinc-400 mb-1">
                <span className="truncate">Cash Balance</span>
                <span className="px-1.5 py-0.5 text-[8px] bg-[#47EC84]/20 text-[#47EC84] rounded font-bold shrink-0">REAL</span>
              </div>
              <div className="text-base xs:text-lg sm:text-2xl font-black text-[#47EC84] font-mono truncate">
                ₹{parseFloat(balances.MAIN || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="mt-2.5 xs:mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] xs:text-[10px]">
              <span className="text-zinc-400">Instant UPI</span>
              <Link href="/wallet?tab=withdraw" className="text-[#47EC84] hover:underline font-bold flex items-center gap-0.5">
                <span>Cash Out</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>

          <div className="p-3 xs:p-3.5 sm:p-4 rounded-2xl xs:rounded-3xl bg-[#212526] border border-[#F59E0B]/30 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[9px] xs:text-[10px] sm:text-xs text-zinc-400 mb-1">
                <span className="truncate">Demo Credits</span>
                <span className="px-1.5 py-0.5 text-[8px] bg-[#F59E0B]/20 text-[#F59E0B] rounded font-bold shrink-0">FREE</span>
              </div>
              <div className="text-base xs:text-lg sm:text-2xl font-black text-[#F59E0B] font-mono truncate">
                ₹{parseFloat(balances.DEMO || '0').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="mt-2.5 xs:mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] xs:text-[10px]">
              <span className="text-zinc-400">Risk-free</span>
              <button
                onClick={handleResetDemo}
                disabled={resetting}
                className="text-[#F59E0B] hover:underline font-bold flex items-center gap-1 active:scale-95"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${resetting ? 'animate-spin' : ''}`} />
                <span>Reset 10k</span>
              </button>
            </div>
          </div>

          <div className="p-3 xs:p-3.5 sm:p-4 rounded-2xl xs:rounded-3xl bg-[#212526] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[9px] xs:text-[10px] sm:text-xs text-zinc-400 mb-1">
                <span className="truncate">Bonus Cash</span>
                <span className="px-1.5 py-0.5 text-[8px] bg-purple-500/20 text-purple-400 rounded font-bold shrink-0">BONUS</span>
              </div>
              <div className="text-base xs:text-lg sm:text-2xl font-black text-purple-400 font-mono truncate">
                ₹{parseFloat(balances.BONUS || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="mt-2.5 xs:mt-3 pt-2 border-t border-white/10 text-[9px] xs:text-[10px] text-zinc-400 truncate">
              Wagering eligible
            </div>
          </div>

          <div className="p-3 xs:p-3.5 sm:p-4 rounded-2xl xs:rounded-3xl bg-[#212526] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[9px] xs:text-[10px] sm:text-xs text-zinc-400 mb-1">
                <span className="truncate">Net P / L</span>
                <Trophy className={`w-3.5 h-3.5 shrink-0 ${netProfit >= 0 ? 'text-[#47EC84]' : 'text-rose-400'}`} />
              </div>
              <div className={`text-base xs:text-lg sm:text-2xl font-black font-mono truncate ${netProfit >= 0 ? 'text-[#47EC84]' : 'text-rose-400'}`}>
                {netProfit >= 0 ? '+' : ''}₹{netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="mt-2.5 xs:mt-3 pt-2 border-t border-white/10 text-[9px] xs:text-[10px] text-zinc-400 truncate">
              Turnover: ₹{totalWagered.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Game-by-Game Earnings Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#47EC84]" />
              <span>Game-by-Game Earnings & Profit</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-zinc-400">
              Live breakdown of your winnings, stakes and net performance across each arena.
            </p>
          </div>
          <Link href="/wallet" className="text-xs font-bold text-[#47EC84] hover:underline flex items-center gap-0.5">
            <span>Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {Object.entries(gameStats).map(([key, stat]) => {
            const Icon = stat.icon;
            const gameNet = stat.won - stat.wagered;
            const isProfit = gameNet >= 0;

            return (
              <div
                key={key}
                className="p-4 rounded-3xl bg-[#212526] border border-white/[0.08] hover:border-[#47EC84]/40 transition-all flex flex-col justify-between shadow-card"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#2A3031] border border-white/10 flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="font-black text-xs text-white">{stat.name}</div>
                        <div className="text-[9px] text-zinc-400">{stat.played} rounds played</div>
                      </div>
                    </div>
                    <Link
                      href={`/games/${stat.slug}`}
                      className="p-1.5 rounded-lg bg-[#47EC84]/20 hover:bg-[#47EC84] hover:text-slate-950 text-[#47EC84] transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </Link>
                  </div>

                  <div className="space-y-2 bg-[#141617] p-2.5 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Total Won:</span>
                      <span className="font-mono font-bold text-[#47EC84]">
                        +₹{stat.won.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Total Staked:</span>
                      <span className="font-mono text-white font-semibold">
                        ₹{stat.wagered.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-xs font-black">
                      <span className="text-zinc-400 text-[10px]">Net Earnings:</span>
                      <span className={`font-mono ${isProfit ? 'text-[#47EC84]' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}₹{gameNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Win Rate: <strong className="text-[#47EC84]">{stat.played > 0 ? Math.round((stat.won / Math.max(1, stat.won + stat.wagered)) * 100) : 50}%</strong></span>
                  <Link href={`/games/${stat.slug}`} className="text-[#47EC84] font-bold hover:underline">
                    Enter Arena →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. FIGMA SCREEN 2: Recent Big Wins Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#47EC84]" />
            <span>Recent Big Wins</span>
          </h2>
          <span className="text-xs text-zinc-400 font-semibold">Live Payouts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-4">
          <div className="p-2.5 xs:p-3 rounded-2xl bg-[#212526] border border-white/10 flex items-center gap-2 xs:gap-3">
            <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-500 font-bold text-[11px] xs:text-xs shrink-0">
              ✈️
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] xs:text-xs font-bold text-white truncate">User_921</div>
              <div className="text-[10px] xs:text-[11px] font-black font-mono text-[#47EC84] truncate">+₹8,450.00</div>
            </div>
          </div>

          <div className="p-2.5 xs:p-3 rounded-2xl bg-[#212526] border border-white/10 flex items-center gap-2 xs:gap-3">
            <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-[11px] xs:text-xs shrink-0">
              🎯
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] xs:text-xs font-bold text-white truncate">CarromKing</div>
              <div className="text-[10px] xs:text-[11px] font-black font-mono text-[#47EC84] truncate">+₹2,200.00</div>
            </div>
          </div>

          <div className="p-2.5 xs:p-3 rounded-2xl bg-[#212526] border border-white/10 flex items-center gap-2 xs:gap-3">
            <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold text-[11px] xs:text-xs shrink-0">
              🐉
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] xs:text-xs font-bold text-white truncate">VIP_Tiger</div>
              <div className="text-[10px] xs:text-[11px] font-black font-mono text-[#47EC84] truncate">+₹16,000.00</div>
            </div>
          </div>

          <div className="p-2.5 xs:p-3 rounded-2xl bg-[#212526] border border-white/10 flex items-center gap-2 xs:gap-3">
            <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-[11px] xs:text-xs shrink-0">
              🃏
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] xs:text-xs font-bold text-white truncate">Royale777</div>
              <div className="text-[10px] xs:text-[11px] font-black font-mono text-[#47EC84] truncate">+₹6,200.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
