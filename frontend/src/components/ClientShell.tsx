"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Modals } from '@/components/Modals';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { LoungeChatWidget } from '@/components/LoungeChatWidget';
import { useStore } from '@/store/useStore';

export const ClientShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchUser } = useStore();
  const pathname = usePathname();
  const [loungeOpen, setLoungeOpen] = useState(false);

  const isAeroCrash = pathname?.startsWith('/games/aerocrash');

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-full overflow-x-clip lux-ambient-bg relative">
      {/* Subtle top ambient specular line */}
      <div className="pointer-events-none fixed top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#47EC84]/35 to-transparent z-50" />
      <Navbar />
      <div className="flex flex-1 w-full max-w-full overflow-x-clip">
        <Sidebar />
        <main className="flex-1 pb-[calc(6.75rem+env(safe-area-inset-bottom,0px))] lg:pb-10 overflow-x-clip min-h-[calc(100dvh-4rem)] w-full max-w-full min-w-0">
          {children}
        </main>
      </div>

      {/* Global Live Lounge & Rain Drawer Trigger (hidden inside AeroCrash where Lounge is inline) */}
      {!isAeroCrash && (
        <div className="fixed bottom-[calc(4.65rem+env(safe-area-inset-bottom,0px))] lg:bottom-5 right-3 sm:right-5 z-30">
          {!loungeOpen ? (
            <button
              type="button"
              onClick={() => setLoungeOpen(true)}
              className="px-3.5 py-2 rounded-full bg-[#111517]/95 backdrop-blur-xl border border-[#47EC84]/45 shadow-[0_10px_30px_rgba(0,0,0,0.85)] text-xs font-black text-white flex items-center gap-1.5 hover:border-[#47EC84] active:scale-95 transition"
            >
              <span className="w-2 h-2 rounded-full bg-[#47EC84] animate-ping" />
              <MessageSquare className="w-3.5 h-3.5 text-[#47EC84]" />
              <span>Lounge • Rain</span>
            </button>
          ) : (
            <div className="w-[calc(100vw-1.5rem)] max-w-sm shadow-2xl animate-scale-up relative">
              <button
                type="button"
                onClick={() => setLoungeOpen(false)}
                aria-label="Close Lounge"
                className="absolute -top-2.5 -right-2.5 z-20 w-7 h-7 rounded-full bg-[#181D20] border border-white/20 text-white flex items-center justify-center shadow-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <LoungeChatWidget compact />
            </div>
          )}
        </div>
      )}

      <PWAInstallPrompt />
      <MobileBottomNav />
      <Modals />
    </div>
  );
};
