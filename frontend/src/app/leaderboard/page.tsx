"use client";

import React, { useState } from 'react';
import { Trophy, Crown, Flame, Sparkles, Medal, Award, ArrowUpRight } from 'lucide-react';
import { GoldRupeeCoin } from '@/components/GameArtwork';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<'DAILY' | 'WEEKLY' | 'ALL_TIME'>('WEEKLY');

  const leaders = [
    { rank: 1, username: 'vip_king', vip: 'ELITE', totalWon: '₹92,450.00', gamesPlayed: 248, winRate: '68%' },
    { rank: 2, username: 'aurora_apex', vip: 'PLATINUM', totalWon: '₹74,800.00', gamesPlayed: 189, winRate: '64%' },
    { rank: 3, username: 'supersonic_88', vip: 'GOLD', totalWon: '₹48,200.00', gamesPlayed: 134, winRate: '61%' },
    { rank: 4, username: 'royal_striker', vip: 'GOLD', totalWon: '₹31,400.00', gamesPlayed: 92, winRate: '58%' },
    { rank: 5, username: 'player1', vip: 'SILVER', totalWon: '₹14,200.00', gamesPlayed: 62, winRate: '54%' },
    { rank: 6, username: 'carrom_master', vip: 'BRONZE', totalWon: '₹9,800.00', gamesPlayed: 45, winRate: '51%' },
    { rank: 7, username: 'tiger_strike', vip: 'BRONZE', totalWon: '₹7,450.00', gamesPlayed: 38, winRate: '49%' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-6 w-full max-w-full overflow-x-clip">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="telemetry-badge text-[#F5B041] border-[#F5B041]/40 bg-[#F5B041]/10">
              <Trophy className="w-3 h-3 text-[#F5B041]" />
              PROVABLY FAIR AUDITED
            </span>
            <span className="telemetry-badge text-[#47EC84] border-[#47EC84]/40 bg-[#47EC84]/10">
              <Sparkles className="w-3 h-3 text-[#47EC84]" />
              ₹5,00,000 PRIZE POOL
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Arena High-Roller Hall of Fame
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Top winners ranked by verified cumulative cash winnings across all four arenas.
          </p>
        </div>

        {/* Timeframe Pills */}
        <div className="flex items-center gap-1.5 p-1.5 bg-black/60 rounded-2xl border border-white/10 self-start sm:self-auto">
          {(['DAILY', 'WEEKLY', 'ALL_TIME'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-xl text-xs font-display font-black transition active:scale-95 ${
                timeframe === tf
                  ? 'bg-[#F5B041] text-slate-950 shadow-glowGold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Top 3 Stage */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 items-end">
        {/* Rank 2 (Silver) */}
        <div className="order-2 sm:order-1 p-6 rounded-3xl lux-card border-slate-400/40 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <div className="w-14 h-14 rounded-2xl bg-slate-300/15 text-slate-200 flex items-center justify-center font-display font-black text-xl mb-3 border border-slate-300/40 shadow-sm">
            #2
          </div>
          <div className="font-display font-black text-base text-white">{leaders[1].username}</div>
          <span className="telemetry-badge text-sky-300 border-sky-400/30 bg-sky-400/10 mt-1">
            {leaders[1].vip} TIER
          </span>
          <div className="text-xl font-display font-black text-white font-mono tabular-nums mt-3">
            {leaders[1].totalWon}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {leaders[1].gamesPlayed} rounds • {leaders[1].winRate} win rate
          </div>
        </div>

        {/* Rank 1 (Gold Crown Champion) */}
        <div className="order-1 sm:order-2 p-8 rounded-3xl lux-card border-2 border-[#F5B041] shadow-glowGold flex flex-col items-center justify-center text-center sm:-translate-y-4 relative overflow-hidden bg-gradient-to-b from-[#181510] via-[#0E0F11] to-[#07090A]">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#F5B041] via-amber-300 to-[#F5B041] animate-pulse" />
          <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-3xl bg-[#F5B041]/20 text-[#F5B041] flex items-center justify-center font-black text-3xl mb-3 border-2 border-[#F5B041]/60 shadow-glowGold">
            👑
          </div>
          <div className="font-display font-black text-lg sm:text-xl text-white flex items-center gap-1.5">
            <span>{leaders[0].username}</span>
            <Sparkles className="w-4 h-4 text-[#F5B041]" />
          </div>
          <span className="telemetry-badge text-[#F5B041] border-[#F5B041]/50 bg-[#F5B041]/20 mt-1.5 font-bold">
            {leaders[0].vip} SUPREME
          </span>
          <div className="text-2xl sm:text-3xl font-display font-black text-[#F5B041] font-mono tabular-nums mt-3">
            {leaders[0].totalWon}
          </div>
          <span className="px-3 py-1 mt-3 rounded-full bg-[#F5B041]/20 text-[#F5B041] border border-[#F5B041]/40 text-[10px] font-black uppercase tracking-wider font-display">
            ★ REIGNING CHAMPION ★
          </span>
        </div>

        {/* Rank 3 (Bronze) */}
        <div className="order-3 p-6 rounded-3xl lux-card border-amber-700/40 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
          <div className="w-14 h-14 rounded-2xl bg-amber-700/15 text-amber-500 flex items-center justify-center font-display font-black text-xl mb-3 border border-amber-700/40 shadow-sm">
            #3
          </div>
          <div className="font-display font-black text-base text-white">{leaders[2].username}</div>
          <span className="telemetry-badge text-[#F5B041] border-[#F5B041]/30 bg-[#F5B041]/10 mt-1">
            {leaders[2].vip} TIER
          </span>
          <div className="text-xl font-display font-black text-white font-mono tabular-nums mt-3">
            {leaders[2].totalWon}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {leaders[2].gamesPlayed} rounds • {leaders[2].winRate} win rate
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl lux-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/60 text-slate-400 uppercase font-mono text-[10px] border-b border-white/[0.08]">
              <tr>
                <th className="p-3.5 sm:p-5">Rank</th>
                <th className="p-3.5 sm:p-5">Player Handle</th>
                <th className="p-3.5 sm:p-5 hidden sm:table-cell">VIP Tier</th>
                <th className="p-3.5 sm:p-5 hidden sm:table-cell">Rounds</th>
                <th className="p-3.5 sm:p-5 hidden md:table-cell">Win Rate</th>
                <th className="p-3.5 sm:p-5 text-right">Verified Cash Won</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {leaders.map((lead) => (
                <tr key={lead.rank} className="hover:bg-white/[0.03] transition">
                  <td className="p-3.5 sm:p-5 font-display font-black text-sm text-[#F5B041] tabular-nums">
                    #{lead.rank}
                  </td>
                  <td className="p-3.5 sm:p-5 font-display font-bold text-white text-sm">
                    {lead.username}
                  </td>
                  <td className="p-3.5 sm:p-5 hidden sm:table-cell font-mono text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300">
                      {lead.vip}
                    </span>
                  </td>
                  <td className="p-3.5 sm:p-5 hidden sm:table-cell font-mono text-slate-400">{lead.gamesPlayed}</td>
                  <td className="p-3.5 sm:p-5 hidden md:table-cell font-mono text-[#47EC84]">{lead.winRate}</td>
                  <td className="p-3.5 sm:p-5 text-right font-display font-black text-sm text-[#47EC84] font-mono tabular-nums">
                    {lead.totalWon}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
