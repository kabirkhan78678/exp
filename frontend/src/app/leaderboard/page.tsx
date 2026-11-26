"use client";

import React, { useState } from 'react';
import { Trophy, Medal, Award, Flame, Sparkles } from 'lucide-react';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<'DAILY' | 'WEEKLY' | 'ALL_TIME'>('WEEKLY');

  const leaders = [
    { rank: 1, username: 'vip_king', vip: 'GOLD', totalWon: '₹92,000.00', gamesPlayed: 240 },
    { rank: 2, username: 'aurora_apex', vip: 'PLATINUM', totalWon: '₹74,500.00', gamesPlayed: 185 },
    { rank: 3, username: 'supersonic_88', vip: 'SILVER', totalWon: '₹48,200.00', gamesPlayed: 130 },
    { rank: 4, username: 'player1', vip: 'SILVER', totalWon: '₹14,200.00', gamesPlayed: 62 },
    { rank: 5, username: 'carrom_master', vip: 'BRONZE', totalWon: '₹9,800.00', gamesPlayed: 45 },
    { rank: 6, username: 'tiger_strike', vip: 'BRONZE', totalWon: '₹7,450.00', gamesPlayed: 38 },
  ];

  return (
    <div className="space-y-8 px-4 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-aurora-text flex items-center gap-2">
            <Trophy className="w-7 h-7 text-aurora-gold" />
            <span>Arena Leaderboards</span>
          </h1>
          <p className="text-xs sm:text-sm text-aurora-muted mt-1">
            Top winners ranked by cumulative verified game winnings across all four arenas.
          </p>
        </div>

        {/* Timeframe Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-aurora-surface rounded-xl border border-aurora-border">
          {(['DAILY', 'WEEKLY', 'ALL_TIME'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeframe === tf
                  ? 'bg-aurora-elevated text-aurora-cyan border border-aurora-cyan/30 shadow-sm'
                  : 'text-aurora-muted hover:text-aurora-text'
              }`}
            >
              {tf.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {/* Rank 2 */}
        <div className="order-2 sm:order-1 p-6 rounded-3xl bg-aurora-surface border border-aurora-border flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-slate-400/20 text-slate-300 flex items-center justify-center font-bold text-lg mb-2 border border-slate-400/40">
            2
          </div>
          <div className="font-bold text-sm text-aurora-text">{leaders[1].username}</div>
          <span className="text-[10px] text-aurora-purple font-mono font-bold uppercase">{leaders[1].vip}</span>
          <div className="text-lg font-black text-aurora-text font-mono mt-2">{leaders[1].totalWon}</div>
        </div>

        {/* Rank 1 */}
        <div className="order-1 sm:order-2 p-8 rounded-3xl bg-gradient-to-b from-aurora-surface via-aurora-elevated to-aurora-surface border-2 border-aurora-gold/50 shadow-glowGold flex flex-col items-center justify-center text-center sm:-translate-y-2">
          <div className="w-16 h-16 rounded-full bg-aurora-gold/20 text-aurora-gold flex items-center justify-center font-black text-2xl mb-2 border-2 border-aurora-gold/60">
            👑
          </div>
          <div className="font-bold text-base text-aurora-text">{leaders[0].username}</div>
          <span className="text-[10px] text-aurora-gold font-mono font-bold uppercase">{leaders[0].vip}</span>
          <div className="text-2xl font-black text-aurora-gold font-mono mt-2">{leaders[0].totalWon}</div>
          <span className="px-2 py-0.5 mt-2 rounded bg-aurora-gold/20 text-aurora-gold text-[10px] font-bold">
            CHAMPION
          </span>
        </div>

        {/* Rank 3 */}
        <div className="order-3 p-6 rounded-3xl bg-aurora-surface border border-aurora-border flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-amber-700/20 text-amber-500 flex items-center justify-center font-bold text-lg mb-2 border border-amber-700/40">
            3
          </div>
          <div className="font-bold text-sm text-aurora-text">{leaders[2].username}</div>
          <span className="text-[10px] text-aurora-cyan font-mono font-bold uppercase">{leaders[2].vip}</span>
          <div className="text-lg font-black text-aurora-text font-mono mt-2">{leaders[2].totalWon}</div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl bg-aurora-surface border border-aurora-border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-aurora-elevated/70 text-aurora-muted uppercase font-mono text-[10px] border-b border-aurora-border">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">Player</th>
              <th className="p-4">VIP Level</th>
              <th className="p-4">Rounds Played</th>
              <th className="p-4 text-right">Total Winnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-aurora-border/40">
            {leaders.map((lead) => (
              <tr key={lead.rank} className="hover:bg-aurora-elevated/30 transition">
                <td className="p-4 font-mono font-bold text-aurora-gold">#{lead.rank}</td>
                <td className="p-4 font-semibold text-aurora-text">{lead.username}</td>
                <td className="p-4 font-mono text-[11px] text-aurora-muted uppercase">{lead.vip}</td>
                <td className="p-4 font-mono text-aurora-muted">{lead.gamesPlayed}</td>
                <td className="p-4 text-right font-mono font-bold text-aurora-success">{lead.totalWon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
