"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, LayoutDashboard, Users, Gamepad2, 
  ArrowUpRight, FileText, ArrowLeft, ShieldCheck 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { VeltrixLogoMark } from '@/components/GameArtwork';

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
      <div className="p-12 text-center max-w-md mx-auto space-y-4 my-16">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white font-display">Administrative Clearance Required</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          The Veltrix Super Admin Command Suite is restricted to authorized financial officers. Sign in with administrative credentials.
        </p>
        <button
          onClick={() => openModal('login')}
          className="px-6 py-2.5 btn-gold-3d text-slate-950 font-black text-xs rounded-xl shadow-glowGold"
        >
          Sign In with Admin Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Top Navigation Strip */}
      <div className="bg-[#0D1214] border-b border-[#1E262A] px-4 lg:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <VeltrixLogoMark className="w-8 h-8" />
            <div>
              <div className="text-sm font-black text-white flex items-center gap-2 font-display">
                <span>Super Admin Control Suite</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#F5B041]/15 text-[#F5B041] rounded border border-[#F5B041]/30">
                  {user?.role?.toUpperCase() || 'SUPERADMIN'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Ledger audit, risk exposure limits & settlement approvals</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 bg-[#141A1E] hover:bg-[#1E262A] text-zinc-300 hover:text-white text-xs font-semibold rounded-xl border border-[#1E262A] flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Player App</span>
            </Link>
          </div>
        </div>

        {/* Subnav Pills */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-3.5 overflow-x-auto pb-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-[#47EC84]/15 text-[#47EC84] border border-[#47EC84]/40 shadow-glowGreen'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141A1E] border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto pb-8 overflow-x-clip">
        {children}
      </div>
    </div>
  );
}
