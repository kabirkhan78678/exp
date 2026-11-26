"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, ArrowLeftRight, User as UserIcon } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Games', href: '/games', icon: Gamepad2 },
    { label: 'Cashier', href: '/wallet', icon: ArrowLeftRight },
    { label: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <div className="lg:hidden fixed bottom-[calc(0.6rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-40 pointer-events-none flex justify-center">
      {/* Dynamic Floating Obsidian Capsule Dock */}
      <nav className="pointer-events-auto bg-[#0F1315]/95 backdrop-blur-2xl border border-white/[0.14] rounded-full p-1.5 shadow-[0_16px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-between gap-1 max-w-[368px] sm:max-w-sm w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/dashboard' && pathname === '/') ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex items-center justify-center gap-1.5 h-11 transition-all duration-300 active:scale-95 rounded-full ${
                isActive
                  ? 'flex-1 px-3.5 btn-emerald-3d font-extrabold'
                  : 'w-12 text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
              title={item.label}
            >
              <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              {isActive && (
                <span className="text-[11px] font-black tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
