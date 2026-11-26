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
        <h1 className="text-xl font-bold text-aurora-text">Withdrawal Approvals Queue</h1>
        <p className="text-xs text-aurora-muted">
          Review player payout requests. Approving dispatches payment reference; rejecting immediately refunds the reserved balance via double-entry ledger.
        </p>
      </div>

      <div className="rounded-2xl bg-aurora-surface border border-aurora-border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-aurora-elevated/70 text-aurora-muted uppercase font-mono text-[10px] border-b border-aurora-border">
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
          <tbody className="divide-y divide-aurora-border/40">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-aurora-muted">Loading queue...</td>
              </tr>
            ) : withdrawals.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-aurora-muted">No withdrawal requests found.</td>
              </tr>
            ) : (
              withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-aurora-elevated/20 transition">
                  <td className="p-3.5">
                    <div className="font-semibold text-aurora-text">{w.username}</div>
                    <div className="text-[10px] text-aurora-muted font-mono">{w.email}</div>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-aurora-cyan">₹{parseFloat(w.amount).toFixed(2)}</td>
                  <td className="p-3.5 font-mono text-[11px] text-aurora-muted">{w.payout_channel}</td>
                  <td className="p-3.5 font-mono text-[11px] text-aurora-text">{JSON.stringify(w.payout_details)}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      w.status === 'COMPLETED'
                        ? 'bg-aurora-success/15 text-aurora-success border border-aurora-success/30'
                        : w.status === 'REJECTED'
                        ? 'bg-aurora-danger/15 text-aurora-danger border border-aurora-danger/30'
                        : 'bg-aurora-gold/15 text-aurora-gold border border-aurora-gold/30'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-aurora-muted text-[11px]">
                    {new Date(w.created_at).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right">
                    {w.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(w.id, 'approve')}
                          className="px-2.5 py-1 bg-aurora-success/20 text-aurora-success hover:bg-aurora-success/30 border border-aurora-success/30 rounded text-xs font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(w.id, 'reject')}
                          className="px-2.5 py-1 bg-aurora-danger/20 text-aurora-danger hover:bg-aurora-danger/30 border border-aurora-danger/30 rounded text-xs font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-aurora-muted text-[10px] uppercase font-mono">Settled</span>
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
