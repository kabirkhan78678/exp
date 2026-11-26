"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, ArrowLeftRight, User as UserIcon } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { 
      label: 'Home', 
      href: '/dashboard', 
      icon: Home,
    },
    { 
      label: 'Games', 
      href: '/games', 
      icon: Gamepad2,
    },
    { 
      label: 'Cashier', 
      href: '/wallet', 
      icon: ArrowLeftRight,
    },
    { 
      label: 'Profile', 
      href: '/profile', 
      icon: UserIcon,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-[calc(0.6rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-50 pointer-events-none flex justify-center">
      {/* Figma Floating Pill Dock Island - Perfectly sized for all phone screens */}
      <nav className="pointer-events-auto bg-[#212526]/95 backdrop-blur-2xl border border-white/[0.12] rounded-full px-2.5 xs:px-3 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex items-center justify-around gap-1.5 xs:gap-2 max-w-[340px] xs:max-w-sm w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex items-center justify-center transition-all duration-300 active:scale-90 ${
                isActive
                  ? 'w-10 h-10 xs:w-11 xs:h-11 rounded-full bg-[#47EC84] text-slate-950 shadow-glowGreen font-black'
                  : 'w-9 h-9 xs:w-10 xs:h-10 rounded-full text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title={item.label}
            >
              <Icon className={`${isActive ? 'w-4 h-4 xs:w-5 xs:h-5 stroke-[2.5]' : 'w-4 h-4 xs:w-5 xs:h-5'}`} />

              {/* Glowing dot for active state */}
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-[#47EC84] rounded-full shadow-[0_0_8px_#47EC84]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
