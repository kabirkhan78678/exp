"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Gamepad2, Plane, Swords, Layers, 
  Disc, Wallet, Gift, Trophy, HelpCircle, ShieldAlert,
  Sparkles, ExternalLink, User
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isAdmin } = useStore();

  const links = [
    { name: 'Dashboard Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Game Lobby', href: '/games', icon: Gamepad2 },
    { name: 'AeroCrash', href: '/games/aerocrash', icon: Plane, highlight: true },
    { name: 'Carrom 2D', href: '/games/carrom', icon: Disc },
    { name: 'Dragon Tiger', href: '/games/dragontiger', icon: Swords },
    { name: 'Teen Patti', href: '/games/teenpatti', icon: Layers },
    { name: 'Deposit & Withdraw', href: '/wallet', icon: Wallet },
    { name: 'Player Profile', href: '/profile', icon: User },
    { name: 'VIP & Rewards', href: '/rewards', icon: Gift },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Support', href: '/support', icon: HelpCircle },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#141617]/95 border-r border-white/[0.08] min-h-[calc(100vh-4rem)] p-4 justify-between shrink-0">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#47EC84]/80">
            Casino Arenas & Cashier
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href + '/'));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#47EC84]/15 text-[#47EC84] border border-[#47EC84]/40 shadow-glowGreen'
                    : 'text-zinc-400 hover:text-white hover:bg-[#212526]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#47EC84]' : link.highlight ? 'text-[#47EC84]' : 'text-zinc-400'}`} />
                  <span>{link.name}</span>
                </div>
                {link.highlight && (
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-[#47EC84] text-slate-950 animate-pulse">
                    HOT
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Super Admin Quick Link */}
        {isAdmin && (
          <div className="pt-4 border-t border-white/10">
            <Link
              href="/admin"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-purple-950/40 text-purple-300 border border-purple-500/30 hover:bg-purple-900/30 transition shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>Super Admin Hub</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3.5 rounded-2xl bg-[#212526] border border-white/10 text-[11px] space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-[#47EC84]">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Provably Fair RNG</span>
        </div>
        <p className="text-[10px] text-zinc-400">
          SHA-256 verifiable random seeds on every round.
        </p>
      </div>
    </aside>
  );
};
