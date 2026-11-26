"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function AdminWithdrawalsPage() {
  const { showNotification } = useStore();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.getAdminWithdrawals();
      setWithdrawals(res.withdrawals);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    let reason = '';
    if (action === 'reject') {
      reason = prompt('Enter rejection reason (reserved balance will be refunded to player):') || 'Compliance check failed';
    }
    try {
      const res = await api.adminWithdrawalAction(id, action, reason);
      showNotification(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white font-display">Withdrawal Approvals Queue</h1>
        <p className="text-xs text-zinc-400">
          Review player payout requests. Approving dispatches payment reference; rejecting immediately refunds the reserved balance via double-entry ledger.
        </p>
      </div>

      <div className="rounded-2xl bg-[#0D1214] border border-[#1E262A] overflow-hidden shadow-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141A1E] text-zinc-400 uppercase font-mono text-[10px] border-b border-[#1E262A]">
            <tr>
              <th className="p-3.5">Player</th>
              <th className="p-3.5">Amount</th>
              <th className="p-3.5">Channel</th>
              <th className="p-3.5">Payout Details</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Requested At</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E262A]">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-400">Loading queue...</td>
              </tr>
            ) : withdrawals.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-400">No withdrawal requests found.</td>
              </tr>
            ) : (
              withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-[#141A1E]/40 transition">
                  <td className="p-3.5">
                    <div className="font-semibold text-white">{w.username}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{w.email}</div>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[#47EC84]">₹{parseFloat(w.amount).toFixed(2)}</td>
                  <td className="p-3.5 font-mono text-[11px] text-zinc-400">{w.payout_channel}</td>
                  <td className="p-3.5 font-mono text-[11px] text-zinc-300">{JSON.stringify(w.payout_details)}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      w.status === 'COMPLETED'
                        ? 'bg-[#47EC84]/15 text-[#47EC84] border border-[#47EC84]/30'
                        : w.status === 'REJECTED'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-[#F5B041]/15 text-[#F5B041] border border-[#F5B041]/30'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-zinc-400 text-[11px]">
                    {new Date(w.created_at).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right">
                    {w.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(w.id, 'approve')}
                          className="px-2.5 py-1 bg-[#47EC84]/20 text-[#47EC84] hover:bg-[#47EC84]/30 border border-[#47EC84]/30 rounded text-xs font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(w.id, 'reject')}
                          className="px-2.5 py-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 rounded text-xs font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-[10px] uppercase font-mono">Settled</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
