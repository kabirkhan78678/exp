"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, ArrowRight, Zap, ChevronRight,
  QrCode, RefreshCw, Crown
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  AeroCrashArt,
  CarromBoardArt,
  HeroVaultIllustration,
} from '@/components/GameArtwork';
import { GAME_CATALOG } from '@/lib/gamesCatalog';
import { GamePosterCard } from '@/components/GamePosterCard';

export default function LandingPage() {
  const { isAuthenticated, openModal } = useStore();
  const [activeBanner, setActiveBanner] = useState(0);

  const promoBanners = [
    {
      title: 'AeroCrash Velocity 100x',
      subtitle: 'Server-authoritative flight curve with dual-bet auto cashout and live cockpit host.',
      tag: 'FLAGSHIP CRASH',
      tagStyle: 'bg-[#FF2E54]/20 text-[#FF2E54] border-[#FF2E54]/40',
      cta: 'Launch Aviator',
      href: '/games/aerocrash',
      glow: 'from-[#FF2E54]/20 via-[#16070B] to-[#0B0E10]',
      preview: <AeroCrashArt />,
    },
    {
      title: 'Tournament Carrom 2D',
      subtitle: 'English birch surface, rigid-body collision physics, baseline striker drag & Queen cover rules.',
      tag: 'SKILL ARENA',
      tagStyle: 'bg-[#F5B041]/20 text-[#F5B041] border-[#F5B041]/40',
      cta: 'Play Carrom 2D',
      href: '/games/carrom',
      glow: 'from-[#F5B041]/20 via-[#191107] to-[#0B0E10]',
      preview: <CarromBoardArt />,
    },
    {
      title: '8 Live VIP Games Ready',
      subtitle: 'Mines, Fair Dice, Wingo Color Parity, Ludo Arena, Dragon Tiger & Teen Patti in 1 vault.',
      tag: 'ALL ARENAS LIVE',
      tagStyle: 'bg-[#47EC84]/20 text-[#47EC84] border-[#47EC84]/40',
      cta: 'Open Game Lobby',
      href: '/games',
      glow: 'from-[#47EC84]/20 via-[#091A12] to-[#0B0E10]',
      preview: (
        <div className="w-full h-full flex items-center justify-center bg-[#09120E]">
          <HeroVaultIllustration />
        </div>
      ),
    },
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % promoBanners.length);
    }, 6000);
    return () => clearInterval(id);
  }, [promoBanners.length]);

  const payoutItems = [
    { user: 'Vikram_99', amount: '₹24,100', game: 'AeroCrash 18.4x', accent: 'text-[#FF2E54]' },
    { user: 'Aarav_Pro', amount: '₹9,850', game: 'Mines 14.1x', accent: 'text-[#47EC84]' },
    { user: 'VIP_Tiger', amount: '₹16,000', game: 'Dragon Tiger Tie', accent: 'text-sky-400' },
    { user: 'Royale777', amount: '₹11,250', game: 'Teen Patti Trail', accent: 'text-[#47EC84]' },
    { user: 'LudoChamp', amount: '₹4,250', game: 'Ludo 4P Match', accent: 'text-[#F5B041]' },
    { user: 'ColorKing', amount: '₹9,000', game: 'Wingo #5 Violet', accent: 'text-violet-400' },
  ];

  const current = promoBanners[activeBanner];

  return (
    <div className="space-y-5 sm:space-y-8 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-32 w-full">
      <section className="relative rounded-3xl overflow-hidden lux-card border border-white/[0.1]">
        <div className={`bg-gradient-to-br ${current.glow} bg-lux-grid p-4 xs:p-6 sm:p-8 transition-all duration-500 grid grid-cols-1 md:grid-cols-12 gap-5 items-center`}>
          <div className="md:col-span-7 space-y-3 sm:space-y-4 z-10">
            <div className="flex items-center justify-between md:justify-start gap-3">
              <span className={`px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] border ${current.tagStyle}`}>
                {current.tag}
              </span>
              <div className="flex items-center gap-1.5">
                {promoBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBanner(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeBanner === idx ? 'w-6 bg-[#47EC84] shadow-[0_0_8px_#47EC84]' : 'w-1.5 bg-white/25 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-white leading-[1.1]">
              {current.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {current.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Link
                href={current.href}
                className="relative overflow-hidden px-5 sm:px-6 py-2.5 sm:py-3 rounded-full btn-emerald-3d font-black text-xs sm:text-sm flex items-center gap-2 active:scale-95 transition group"
              >
                <span className="absolute inset-0 w-1/2 bg-white/30 blur-md -translate-x-full animate-shimmer pointer-events-none" />
                <span>{current.cta}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {!isAuthenticated ? (
                <button
                  onClick={() => openModal('register')}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white font-bold text-xs sm:text-sm transition active:scale-95"
                >
                  Claim 10k Free
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white font-bold text-xs sm:text-sm transition active:scale-95"
                >
                  My Command Center
                </Link>
              )}
            </div>
          </div>

          <div className="md:col-span-5 h-36 xs:h-44 sm:h-52 rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl relative group">
            {current.preview}
            <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono text-[#47EC84] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#47EC84] animate-pulse" />
              RNG VERIFIED
            </div>
          </div>
        </div>
      </section>

      <div className="lux-card rounded-2xl px-3 py-2 flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#F5B041] shrink-0 bg-[#F5B041]/10 border border-[#F5B041]/25 px-2.5 py-1 rounded-full">
          <Zap className="w-3 h-3 fill-current" />
          <span>Live Wins</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-6 whitespace-nowrap animate-marquee text-[11px] w-max">
            {[...payoutItems, ...payoutItems].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-slate-200 font-bold">{item.user}</span>
                <span className="text-slate-500">won</span>
                <span className="font-mono tabular-nums font-black text-[#47EC84]">{item.amount}</span>
                <span className={`text-[10px] font-semibold ${item.accent}`}>({item.game})</span>
                <span className="text-white/15 pl-3">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-[#47EC84] shadow-[0_0_10px_#47EC84]" />
              <span>All Certified Arenas (8)</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 pl-4">
              Live dealer salons, arcade multipliers & tournament skill boards
            </p>
          </div>
          <Link
            href="/games"
            className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] sm:text-xs font-bold text-[#47EC84] flex items-center gap-1 transition shrink-0"
          >
            <span>Filter Lobby</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3.5 sm:gap-5">
          {GAME_CATALOG.map((game) => (
            <GamePosterCard key={game.slug} game={game} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl lux-card space-y-1.5">
          <ShieldCheck className="w-5 h-5 text-[#47EC84]" />
          <div className="font-display font-bold text-xs sm:text-sm text-white">Provably Fair SHA-256</div>
          <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed">
            Cryptographic server commitments locked before every round.
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl lux-card space-y-1.5">
          <QrCode className="w-5 h-5 text-[#F5B041]" />
          <div className="font-display font-bold text-xs sm:text-sm text-white">Instant QR Vault</div>
          <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed">
            Double-entry fintech ledger with UPI QR & IMPS support.
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl lux-card space-y-1.5">
          <RefreshCw className="w-5 h-5 text-sky-400" />
          <div className="font-display font-bold text-xs sm:text-sm text-white">10K Demo Reload</div>
          <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed">
            Play all 8 arenas zero-risk with instant demo refills.
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl lux-card space-y-1.5">
          <Crown className="w-5 h-5 text-violet-400" />
          <div className="font-display font-bold text-xs sm:text-sm text-white">Up to 15% Rakeback</div>
          <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed">
            Climb Bronze to Elite VIP ranks with daily streak drops.
          </p>
        </div>
      </section>
    </div>
  );
}
