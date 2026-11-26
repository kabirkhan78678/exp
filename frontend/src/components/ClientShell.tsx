"use client";

import React, { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Modals } from '@/components/Modals';
import { useStore } from '@/store/useStore';

export const ClientShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchUser } = useStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden lux-ambient-bg relative">
      {/* Subtle top ambient specular line */}
      <div className="pointer-events-none fixed top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#47EC84]/35 to-transparent z-50" />
      <Navbar />
      <div className="flex flex-1 w-full max-w-full overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 pb-28 lg:pb-10 overflow-x-hidden min-h-[calc(100vh-4rem)] w-full max-w-full">
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <Modals />
    </div>
  );
};
