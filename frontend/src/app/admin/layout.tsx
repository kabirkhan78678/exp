"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, LayoutDashboard, Users, Gamepad2, 
  ArrowUpRight, FileText, ArrowLeft, ShieldCheck 
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAdmin, openModal } = useStore();

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Game Risk & Margins', href: '/admin/games', icon: Gamepad2 },
    { label: 'Withdrawal Queue', href: '/admin/withdrawals', icon: ArrowUpRight },
    { label: 'Audit Logs', href: '/admin/audit', icon: FileText },
  ];

  if (!isAdmin) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <ShieldAlert className="w-14 h-14 text-aurora-danger mx-auto animate-pulse" />
        <h2 className="text-xl font-bold text-aurora-text">Admin Access Required</h2>
        <p className="text-xs text-aurora-muted leading-relaxed">
          The Super Admin Control Center is restricted to authorized personnel. Sign in with administrative credentials.
        </p>
        <button
          onClick={() => openModal('login')}
          className="px-6 py-2.5 bg-gradient-to-r from-aurora-purple to-indigo-600 text-white font-bold text-xs rounded-xl shadow-glowPurple"
        >
          Sign In with Admin Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Top Navigation Strip */}
      <div className="bg-aurora-surface border-b border-aurora-border px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-aurora-purple/20 border border-aurora-purple/40 flex items-center justify-center text-aurora-purple font-black text-xs">
              ADM
            </div>
            <div>
              <div className="text-sm font-black text-aurora-text flex items-center gap-2">
                <span>Super Admin Control Center</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono bg-aurora-purple/20 text-aurora-purple rounded border border-aurora-purple/40">
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-aurora-muted">Financial limits, risk controls & settlement monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 bg-aurora-elevated hover:bg-aurora-surface text-aurora-muted hover:text-aurora-text text-xs font-semibold rounded-xl border border-aurora-border flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Player App</span>
            </Link>
          </div>
        </div>

        {/* Subnav Pills */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-aurora-purple/20 text-aurora-purple border border-aurora-purple/40 shadow-glowPurple'
                    : 'text-aurora-muted hover:text-aurora-text hover:bg-aurora-elevated border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="px-4 lg:px-8 max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
