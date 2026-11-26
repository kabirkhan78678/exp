"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldCheck, ShieldAlert, 
  Lock, Unlock, Edit3, CheckCircle2 
} from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function AdminUsersPage() {
  const { showNotification } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const loadUsers = async () => {
    try {
      const res = await api.getAdminUsers(searchQuery);
      setUsers(res.users);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchQuery]);

  const handleFreezeToggle = async (user: any) => {
    const action = user.is_frozen ? 'unfreeze' : 'freeze';
    try {
      const res = await api.adminUserAction(user.id, action);
      showNotification(res.message, 'success');
      await loadUsers();
    } catch (err: any) {
      showNotification(err.message || 'Action failed', 'error');
    }
  };

  const handleUpdateVIP = async (userId: string, newVip: string) => {
    try {
      const res = await api.adminUserAction(userId, 'update_vip', { vip_tier: newVip });
      showNotification(res.message, 'success');
      await loadUsers();
    } catch (err: any) {
      showNotification(err.message || 'VIP update failed', 'error');
    }
  };

  const handleUpdateKYC = async (userId: string, newStatus: string) => {
    try {
      const res = await api.adminUserAction(userId, 'update_kyc', { kyc_status: newStatus });
      showNotification(res.message, 'success');
      await loadUsers();
    } catch (err: any) {
      showNotification(err.message || 'KYC update failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-aurora-text">User & Player Directory</h1>
          <p className="text-xs text-aurora-muted">Inspect player balances, audit KYC compliance, and control access states.</p>
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-aurora-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search username or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-aurora-surface border border-aurora-border text-xs text-aurora-text focus:outline-none focus:border-aurora-purple"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-aurora-surface border border-aurora-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-aurora-elevated/70 text-aurora-muted uppercase font-mono text-[10px] border-b border-aurora-border">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">VIP Tier</th>
                <th className="p-3.5">Demo Balance</th>
                <th className="p-3.5">Real Balance</th>
                <th className="p-3.5">KYC Status</th>
                <th className="p-3.5">Account State</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aurora-border/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-aurora-muted">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-aurora-muted">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-aurora-elevated/20 transition">
                    <td className="p-3.5">
                      <div className="font-semibold text-aurora-text">{u.username}</div>
                      <div className="text-[10px] text-aurora-muted font-mono">{u.email}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] uppercase text-aurora-muted">{u.role}</td>
                    <td className="p-3.5">
                      <select
                        value={u.vip_tier}
                        onChange={(e) => handleUpdateVIP(u.id, e.target.value)}
                        className="bg-aurora-elevated border border-aurora-border rounded px-2 py-1 text-[11px] font-mono text-aurora-gold focus:outline-none"
                      >
                        {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ELITE'].map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5 font-mono text-aurora-gold">₹{parseFloat(u.demo_balance).toFixed(0)}</td>
                    <td className="p-3.5 font-mono text-aurora-cyan">₹{parseFloat(u.main_balance).toFixed(2)}</td>
                    <td className="p-3.5">
                      <select
                        value={u.kyc_status}
                        onChange={(e) => handleUpdateKYC(u.id, e.target.value)}
                        className={`rounded px-2 py-1 text-[10px] font-mono font-bold border focus:outline-none ${
                          u.kyc_status === 'VERIFIED'
                            ? 'bg-aurora-success/15 text-aurora-success border-aurora-success/30'
                            : 'bg-aurora-elevated text-aurora-muted border-aurora-border'
                        }`}
                      >
                        {['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        u.is_frozen
                          ? 'bg-aurora-danger/20 text-aurora-danger border border-aurora-danger/40'
                          : 'bg-aurora-success/15 text-aurora-success border border-aurora-success/30'
                      }`}>
                        {u.is_frozen ? 'FROZEN' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleFreezeToggle(u)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          u.is_frozen
                            ? 'bg-aurora-success/20 text-aurora-success border border-aurora-success/30 hover:bg-aurora-success/30'
                            : 'bg-aurora-danger/20 text-aurora-danger border border-aurora-danger/30 hover:bg-aurora-danger/30'
                        }`}
                      >
                        {u.is_frozen ? 'Unfreeze' : 'Freeze'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
