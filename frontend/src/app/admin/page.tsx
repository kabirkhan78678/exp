"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, Wallet, TrendingUp, ShieldAlert, 
  ArrowUpRight, Gamepad2, Activity, ArrowRight, RefreshCw 
} from 'lucide-react';
import { api } from '@/lib/api';

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
    return <div className="p-12 text-center text-xs text-aurora-muted">Loading administrative analytics...</div>;
  }

  const kpis = data?.kpis || {};
  const gamesStats = data?.games_stats || [];
  const recentTxs = data?.recent_transactions || [];

  return (
    <div className="space-y-8">
      {/* Top Financial KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-aurora-surface border border-aurora-border">
          <div className="flex items-center justify-between text-xs text-aurora-muted mb-2">
            <span>Gross Gaming Revenue (GGR)</span>
            <TrendingUp className="w-4 h-4 text-aurora-gold" />
          </div>
          <div className="text-2xl font-black text-aurora-gold font-mono">
            ₹{parseFloat(kpis.ggr || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-aurora-muted mt-2">Total Stakes: ₹{parseFloat(kpis.total_stakes || '0').toFixed(0)}</div>
        </div>

        <div className="p-5 rounded-2xl bg-aurora-surface border border-aurora-border">
          <div className="flex items-center justify-between text-xs text-aurora-muted mb-2">
            <span>Total Verified Deposits</span>
            <Wallet className="w-4 h-4 text-aurora-cyan" />
          </div>
          <div className="text-2xl font-black text-aurora-cyan font-mono">
            ₹{parseFloat(kpis.total_deposits || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-aurora-muted mt-2">Sandbox & Gateway Volume</div>
        </div>

        <div className="p-5 rounded-2xl bg-aurora-surface border border-aurora-border">
          <div className="flex items-center justify-between text-xs text-aurora-muted mb-2">
            <span>Pending Withdrawals</span>
            <ArrowUpRight className="w-4 h-4 text-aurora-purple" />
          </div>
          <div className="text-2xl font-black text-aurora-purple font-mono">
            {kpis.pending_withdrawals_count} Requests
          </div>
          <div className="text-[10px] text-aurora-muted mt-2">₹{parseFloat(kpis.pending_withdrawals_amount || '0').toFixed(2)} awaiting review</div>
        </div>

        <div className="p-5 rounded-2xl bg-aurora-surface border border-aurora-border">
          <div className="flex items-center justify-between text-xs text-aurora-muted mb-2">
            <span>Active Registered Players</span>
            <Users className="w-4 h-4 text-aurora-text" />
          </div>
          <div className="text-2xl font-black text-aurora-text font-mono">
            {kpis.total_players} Players
          </div>
          <div className="text-[10px] text-aurora-success mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora-success animate-pulse" />
            <span>System Health: {kpis.system_health}</span>
          </div>
        </div>
      </div>

      {/* Game Performance & Revenue Margins Table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-aurora-text">Arena Performance & Gross Margins</h2>
        <div className="rounded-2xl bg-aurora-surface border border-aurora-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-aurora-elevated/70 text-aurora-muted uppercase font-mono text-[10px] border-b border-aurora-border">
              <tr>
                <th className="p-3.5">Game Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Total Rounds</th>
                <th className="p-3.5">Turnover (Stakes)</th>
                <th className="p-3.5">Payouts Settled</th>
                <th className="p-3.5 text-right">Net House Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aurora-border/40">
              {gamesStats.map((g: any) => (
                <tr key={g.slug} className="hover:bg-aurora-elevated/30 transition">
                  <td className="p-3.5 font-bold text-aurora-text flex items-center gap-2">
                    <span>{g.name}</span>
                    {g.is_maintenance && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-aurora-danger/20 text-aurora-danger rounded">MAINT</span>
                    )}
                  </td>
                  <td className="p-3.5 text-aurora-muted font-mono">{g.category}</td>
                  <td className="p-3.5 font-mono">{g.total_rounds}</td>
                  <td className="p-3.5 font-mono">₹{parseFloat(g.total_stakes).toFixed(2)}</td>
                  <td className="p-3.5 font-mono">₹{parseFloat(g.total_payouts).toFixed(2)}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-aurora-gold">
                    ₹{parseFloat(g.margin).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Ledger Audit Trail */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-aurora-text">Recent Global Transactions</h2>
        <div className="rounded-2xl bg-aurora-surface border border-aurora-border overflow-hidden">
          <div className="divide-y divide-aurora-border/40">
            {recentTxs.map((t: any, i: number) => (
              <div key={i} className="p-3.5 flex items-center justify-between text-xs hover:bg-aurora-elevated/20 transition">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-aurora-gold text-[11px]">{t.reference_no}</span>
                  <span className="font-semibold text-aurora-text">{t.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-aurora-text">₹{parseFloat(t.amount).toFixed(2)}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-aurora-elevated text-aurora-muted">
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
