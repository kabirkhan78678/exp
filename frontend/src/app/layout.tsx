import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { ClientShell } from '@/components/ClientShell';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VELTRIX ARENA — Flagship Provably Fair Gaming Ecosystem',
  description:
    'Elite real-time multiplayer gaming platform featuring AeroCrash, Tournament Carrom 2D, Dragon Tiger, Teen Patti, and instant QR fintech vault.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#07090A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${jakarta.variable} ${geistMono.variable}`}>
      <body className="bg-[#07090A] text-[#F1F5F9] font-sans antialiased selection:bg-[#47EC84] selection:text-slate-950 overflow-x-hidden">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
