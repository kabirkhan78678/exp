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
          <h1 className="text-xl font-bold text-white font-display">User & Player Directory</h1>
          <p className="text-xs text-zinc-400">Inspect player balances, audit KYC compliance, and control access states.</p>
        </div>

        <div className="relative w-full sm:w-auto sm:min-w-[280px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search username or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0D1214] border border-[#1E262A] text-xs text-white focus:outline-none focus:border-[#47EC84]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-[#0D1214] border border-[#1E262A] overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141A1E] text-zinc-400 uppercase font-mono text-[10px] border-b border-[#1E262A]">
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
            <tbody className="divide-y divide-[#1E262A]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#141A1E]/40 transition">
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{u.username}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{u.email}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] uppercase text-zinc-400">{u.role}</td>
                    <td className="p-3.5">
                      <select
                        value={u.vip_tier}
                        onChange={(e) => handleUpdateVIP(u.id, e.target.value)}
                        className="bg-[#141A1E] border border-[#1E262A] rounded px-2 py-1 text-[11px] font-mono text-[#F5B041] focus:outline-none"
                      >
                        {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ELITE'].map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5 font-mono text-[#F5B041]">₹{parseFloat(u.demo_balance).toFixed(0)}</td>
                    <td className="p-3.5 font-mono text-[#47EC84]">₹{parseFloat(u.main_balance).toFixed(2)}</td>
                    <td className="p-3.5">
                      <select
                        value={u.kyc_status}
                        onChange={(e) => handleUpdateKYC(u.id, e.target.value)}
                        className={`rounded px-2 py-1 text-[10px] font-mono font-bold border focus:outline-none ${
                          u.kyc_status === 'VERIFIED'
                            ? 'bg-[#47EC84]/15 text-[#47EC84] border-[#47EC84]/30'
                            : 'bg-[#141A1E] text-zinc-400 border-[#1E262A]'
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
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-[#47EC84]/15 text-[#47EC84] border border-[#47EC84]/30'
                      }`}>
                        {u.is_frozen ? 'FROZEN' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleFreezeToggle(u)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          u.is_frozen
                            ? 'bg-[#47EC84]/20 text-[#47EC84] border border-[#47EC84]/30 hover:bg-[#47EC84]/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
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
