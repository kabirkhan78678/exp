"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, Wallet, TrendingUp, ShieldAlert, 
  ArrowUpRight, Gamepad2, Activity, ArrowRight, RefreshCw 
} from 'lucide-react';
import { api } from '@/lib/api';
import { GoldRupeeCoin } from '@/components/GameArtwork';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadOverview = async () => {
    try {
      const res = await api.getAdminOverview();
      setData(res);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-[#47EC84]" />
        <span>Loading administrative analytics telemetry...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const gamesStats = data?.games_stats || [];
  const recentTxs = data?.recent_transactions || [];

  return (
    <div className="space-y-8">
      {/* Top Financial KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D1214] border border-[#1E262A] shadow-card">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Gross Gaming Revenue (GGR)</span>
            <TrendingUp className="w-4 h-4 text-[#F5B041]" />
          </div>
          <div className="text-2xl font-black text-[#F5B041] font-mono">
            ₹{parseFloat(kpis.ggr || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-zinc-400 mt-2 font-mono">Total Turnover: ₹{parseFloat(kpis.total_stakes || '0').toFixed(0)}</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1214] border border-[#1E262A] shadow-card">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Total Verified Deposits</span>
            <Wallet className="w-4 h-4 text-[#47EC84]" />
          </div>
          <div className="text-2xl font-black text-[#47EC84] font-mono">
            ₹{parseFloat(kpis.total_deposits || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-zinc-400 mt-2">Sandbox & Gateway Volume</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1214] border border-[#1E262A] shadow-card">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Pending Withdrawals</span>
            <ArrowUpRight className="w-4 h-4 text-[#F5B041]" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {kpis.pending_withdrawals_count} Requests
          </div>
          <div className="text-[10px] text-zinc-400 mt-2 font-mono">₹{parseFloat(kpis.pending_withdrawals_amount || '0').toFixed(2)} awaiting payout</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1214] border border-[#1E262A] shadow-card">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Active Registered Players</span>
            <Users className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {kpis.total_players} Players
          </div>
          <div className="text-[10px] text-[#47EC84] mt-2 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#47EC84] animate-pulse" />
            <span>Health: {kpis.system_health || 'OPTIMAL'}</span>
          </div>
        </div>
      </div>

      {/* Game Performance & Revenue Margins Table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white font-display">Arena Performance & Gross Margins</h2>
        <div className="rounded-2xl bg-[#0D1214] border border-[#1E262A] overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-xs">
            <thead className="bg-[#141A1E] text-zinc-400 uppercase font-mono text-[10px] border-b border-[#1E262A]">
              <tr>
                <th className="p-3.5">Game Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Total Rounds</th>
                <th className="p-3.5">Turnover (Stakes)</th>
                <th className="p-3.5">Payouts Settled</th>
                <th className="p-3.5 text-right">Net House Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E262A]">
              {gamesStats.map((g: any) => (
                <tr key={g.slug} className="hover:bg-[#141A1E]/50 transition">
                  <td className="p-3.5 font-bold text-white flex items-center gap-2">
                    <span>{g.name}</span>
                    {g.is_maintenance && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-rose-500/20 text-rose-400 rounded">MAINT</span>
                    )}
                  </td>
                  <td className="p-3.5 text-zinc-400 font-mono">{g.category}</td>
                  <td className="p-3.5 font-mono text-zinc-300">{g.total_rounds}</td>
                  <td className="p-3.5 font-mono text-zinc-300">₹{parseFloat(g.total_stakes).toFixed(2)}</td>
                  <td className="p-3.5 font-mono text-zinc-300">₹{parseFloat(g.total_payouts).toFixed(2)}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-[#F5B041]">
                    ₹{parseFloat(g.margin).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Recent Ledger Audit Trail */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white font-display">Recent Global Transactions</h2>
        <div className="rounded-2xl bg-[#0D1214] border border-[#1E262A] overflow-hidden shadow-card">
          <div className="divide-y divide-[#1E262A]">
            {recentTxs.map((t: any, i: number) => (
              <div key={i} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#141A1E]/40 transition">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#F5B041] text-[11px] font-bold">{t.reference_no}</span>
                  <span className="font-semibold text-zinc-200">{t.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-white">₹{parseFloat(t.amount).toFixed(2)}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141A1E] text-zinc-400 border border-[#1E262A]">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
