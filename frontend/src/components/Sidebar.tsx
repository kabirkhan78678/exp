"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Gamepad2, Plane, Swords, Layers,
  Disc, Wallet, Gift, Trophy, HelpCircle, ShieldAlert,
  Sparkles, ExternalLink, User, ShieldCheck
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isAdmin, vipTier, openModal } = useStore();

  const arenaLinks = [
    { name: 'Home Command', href: '/dashboard', icon: LayoutDashboard },
    { name: 'All Game Arenas', href: '/games', icon: Gamepad2 },
    { name: 'AeroCrash', href: '/games/aerocrash', icon: Plane, badge: '100x', badgeStyle: 'bg-[#FF2E54]/20 text-[#FF2E54] border-[#FF2E54]/40' },
    { name: 'Carrom 2D', href: '/games/carrom', icon: Disc, badge: 'PRO', badgeStyle: 'bg-[#F5B041]/20 text-[#F5B041] border-[#F5B041]/40' },
    { name: 'Dragon Tiger', href: '/games/dragontiger', icon: Swords },
    { name: 'Teen Patti', href: '/games/teenpatti', icon: Layers },
  ];

  const vaultLinks = [
    { name: 'Deposit & Withdraw', href: '/wallet', icon: Wallet },
    { name: 'Player Profile', href: '/profile', icon: User },
    { name: 'VIP Club & Ranks', href: '/rewards', icon: Gift },
    { name: 'Leaderboards', href: '/leaderboard', icon: Trophy },
    { name: '24/7 Support', href: '/support', icon: HelpCircle },
  ];

  const renderLink = (item: any) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
          isActive
            ? 'bg-gradient-to-r from-[#47EC84]/15 via-[#47EC84]/5 to-transparent text-white border border-[#47EC84]/35 shadow-[0_4px_20px_-6px_rgba(71,236,132,0.4)]'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#47EC84] shadow-[0_0_8px_#47EC84]" />
        )}
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#47EC84]' : 'text-slate-400 group-hover:text-slate-200'}`} />
          <span>{item.name}</span>
        </div>
        {item.badge && (
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${item.badgeStyle}`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0B0E10]/95 border-r border-white/[0.07] min-h-[calc(100vh-4rem)] p-4 justify-between shrink-0">
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
            Gaming Arenas
          </div>
          {arenaLinks.map(renderLink)}
        </div>

        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
            Vault & Rewards
          </div>
          {vaultLinks.map(renderLink)}
        </div>

        {isAdmin && (
          <div className="pt-3 border-t border-white/[0.08]">
            <Link
              href="/admin"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-violet-950/40 text-violet-300 border border-violet-500/30 hover:bg-violet-900/30 transition"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-violet-400" />
                <span>Super Admin Hub</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Docked VIP Vault & Security Card */}
      <div className="space-y-2.5">
        <button
          onClick={() => openModal('dailyReward')}
          className="w-full p-3.5 rounded-2xl lux-card border-[#F5B041]/25 hover:border-[#F5B041]/50 text-left transition group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#F5B041] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {vipTier || 'BRONZE'} CLUB
            </span>
            <span className="text-[9px] font-bold text-[#47EC84] group-hover:translate-x-0.5 transition-transform">
              Claim →
            </span>
          </div>
          <p className="text-[11px] font-bold text-white">Daily Streak Spin Ready</p>
        </button>

        <div className="px-3 py-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#47EC84] shrink-0" />
          <div className="text-[10px] leading-tight text-slate-400">
            <span className="font-bold text-slate-200 block">SHA-256 Provably Fair</span>
            Cryptographic round seeds
          </div>
        </div>
      </div>
    </aside>
  );
};
