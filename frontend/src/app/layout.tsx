"use client";

import React, { useEffect } from 'react';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Modals } from '@/components/Modals';
import { useStore } from '@/store/useStore';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchUser } = useStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <html lang="en" className="dark">
      <head>
        <title>VELTRIX ARENA — Midnight Aurora Premium Gaming Ecosystem</title>
        <meta name="description" content="Next-generation server-authoritative multiplayer gaming platform and fintech ledger." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
      </head>
      <body className="bg-aurora-bg text-aurora-text font-sans antialiased selection:bg-aurora-cyan selection:text-slate-950 overflow-x-hidden">
        <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
          <Navbar />
          <div className="flex flex-1 w-full max-w-full overflow-x-hidden">
            <Sidebar />
            <main className="flex-1 pb-28 lg:pb-8 overflow-x-hidden min-h-[calc(100vh-4rem)] w-full max-w-full">
              {children}
            </main>
          </div>
          <MobileBottomNav />
          <Modals />
        </div>
      </body>
    </html>
  );
}
