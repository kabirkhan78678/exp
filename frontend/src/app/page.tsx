"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Sparkles, Plane, Swords, Layers, 
  Disc, ArrowRight, Trophy, Users, Zap, CheckCircle, 
  Flame, Play, Gift, Wallet, ChevronRight
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function LandingPage() {
  const { isAuthenticated, openModal, balances } = useStore();
  const [activeBanner, setActiveBanner] = useState(0);

  const promoBanners = [
    {
      title: 'AeroCrash Red Edition',
      subtitle: 'Original Spribe flight engine. Fly & cash out up to 100x.',
      tag: '🔥 HOT CRASH',
      tagColor: 'bg-red-600 text-white',
      cta: 'Play Aviator',
      href: '/games/aerocrash',
      gradient: 'from-[#450a0a] via-[#200507] to-[#0c1222]',
      accent: 'border-red-600/40'
    },
    {
      title: 'Carrom 2D Tournament',
      subtitle: 'English Birch tournament board, baseline drag & realistic physics.',
      tag: '🎯 REAL PHYSICS',
      tagColor: 'bg-amber-500 text-slate-950 font-black',
      cta: 'Play Carrom',
      href: '/games/carrom',
      gradient: 'from-[#381c05] via-[#1f1003] to-[#0c1222]',
      accent: 'border-amber-600/40'
    },
    {
      title: '10,000 Demo Credits',
      subtitle: 'Play any certified game risk-free with infinite demo reload.',
      tag: '🎁 FREE RELOAD',
      tagColor: 'bg-red-600 text-white font-black',
      cta: 'Claim Credits',
      href: '/games',
      gradient: 'from-[#2e0910] via-[#1a070a] to-[#080507]',
      accent: 'border-red-600/40'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-8 px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-28">
      {/* Mobile Top Promo Banner Carousel */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-aurora-border/80 shadow-2xl">
        <div className={`p-4 sm:p-8 bg-gradient-to-r ${promoBanners[activeBanner].gradient} transition-all duration-500 relative flex flex-col justify-between min-h-[170px] sm:min-h-[220px]`}>
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-aurora-cyan/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Tag & Indicators */}
          <div className="flex items-center justify-between z-10">
            <span className={`text-[9px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wide ${promoBanners[activeBanner].tagColor}`}>
              {promoBanners[activeBanner].tag}
            </span>
            <div className="flex items-center gap-1.5">
              {promoBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBanner(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeBanner === idx ? 'w-5 bg-aurora-cyan' : 'w-1.5 bg-white/30'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="z-10 my-2 sm:my-3">
            <h1 className="text-lg sm:text-3xl font-black text-aurora-text tracking-tight">
              {promoBanners[activeBanner].title}
            </h1>
            <p className="text-xs sm:text-sm text-aurora-muted mt-1 max-w-lg line-clamp-2">
              {promoBanners[activeBanner].subtitle}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2.5 z-10 pt-1">
            <Link
              href={promoBanners[activeBanner].href}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-aurora-gold to-amber-500 hover:from-amber-400 hover:to-aurora-gold text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-glowGold transition flex items-center gap-1.5 active:scale-95"
            >
              <span>{promoBanners[activeBanner].cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {!isAuthenticated && (
              <button
                onClick={() => openModal('register')}
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-aurora-elevated/90 hover:bg-aurora-surface text-aurora-text font-bold text-xs rounded-xl border border-aurora-border transition active:scale-95"
              >
                Sign Up
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Winners Marquee Ticker */}
      <div className="overflow-hidden bg-aurora-surface/60 border border-aurora-border/50 rounded-xl px-3 py-2 flex items-center gap-2">
        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-aurora-gold shrink-0">
          <Zap className="w-3.5 h-3.5 text-aurora-gold fill-aurora-gold" />
          <span>Live Payouts</span>
        </div>
        <div className="h-3 w-px bg-aurora-border shrink-0" />
        <div className="overflow-x-auto scrollbar-none whitespace-nowrap text-[11px] text-aurora-muted flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="text-aurora-text font-semibold">User_921</span> won <strong className="text-aurora-success">₹8,450</strong> on AeroCrash 14.2x
          </span>
          <span className="text-aurora-border">•</span>
          <span className="flex items-center gap-1">
            <span className="text-aurora-text font-semibold">CarromAce</span> won <strong className="text-aurora-cyan">₹2,000</strong> in Carrom 2D
          </span>
          <span className="text-aurora-border">•</span>
          <span className="flex items-center gap-1">
            <span className="text-aurora-text font-semibold">VIP_Tiger</span> won <strong className="text-aurora-gold">₹16,000</strong> in Dragon Tiger Tie
          </span>
          <span className="text-aurora-border">•</span>
          <span className="flex items-center gap-1">
            <span className="text-aurora-text font-semibold">Royale777</span> won <strong className="text-aurora-purple">₹6,200</strong> in Teen Patti
          </span>
        </div>
      </div>

      {/* Core Game Arenas Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-base sm:text-xl font-black text-aurora-text">
              Popular Games
            </h2>
          </div>
          <Link href="/games" className="text-xs font-bold text-aurora-cyan hover:underline flex items-center gap-1">
            <span>View All (4)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Mobile Game Poster Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
          {/* 1. AeroCrash Aviator */}
          <Link
            href="/games/aerocrash"
            className="group relative rounded-2xl sm:rounded-3xl bg-aurora-surface border border-red-600/40 hover:border-red-500 transition-all duration-300 hover:shadow-[0_0_25px_rgba(239,68,68,0.35)] flex flex-col justify-between overflow-hidden active:scale-95 shadow-md"
          >
            <div className="relative h-28 sm:h-36 md:h-40 w-full bg-gradient-to-br from-[#2b080c] via-[#4d0c13] to-[#0c1222] border-b border-aurora-border/40 flex items-center justify-center p-3">
              <span className="absolute top-2 right-2 text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white shadow-md">
                HOT 100x
              </span>
              <span className="absolute top-2 left-2 text-[8px] sm:text-[9px] font-bold text-aurora-muted bg-black/50 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                CRASH
              </span>
              <div className="transform -rotate-12 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 gap-2">
              <div>
                <h3 className="font-black text-xs sm:text-base text-aurora-text group-hover:text-red-400 transition truncate">
                  AeroCrash Aviator
                </h3>
                <div className="text-[10px] text-aurora-muted flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>1,420 playing</span>
                </div>
              </div>
              <div className="pt-2 border-t border-aurora-border/40 flex items-center justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] text-aurora-muted font-mono">Min ₹10</span>
                <span className="px-2 py-0.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-black">
                  PLAY
                </span>
              </div>
            </div>
          </Link>

          {/* 2. Carrom 2D Arena */}
          <Link
            href="/games/carrom"
            className="group relative rounded-2xl sm:rounded-3xl bg-aurora-surface border border-amber-600/40 hover:border-amber-400 transition-all duration-300 hover:shadow-[0_0_25px_rgba(217,183,110,0.35)] flex flex-col justify-between overflow-hidden active:scale-95 shadow-md"
          >
            <div className="relative h-28 sm:h-36 md:h-40 w-full bg-gradient-to-br from-[#2a1708] via-[#3d240c] to-[#0c1222] border-b border-aurora-border/40 flex items-center justify-center p-3">
              <span className="absolute top-2 right-2 text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-md">
                PHYSICS 2D
              </span>
              <span className="absolute top-2 left-2 text-[8px] sm:text-[9px] font-bold text-aurora-muted bg-black/50 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                SKILL
              </span>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-500/50 bg-[#cbb28d]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-10 h-10 rounded-full border border-red-500/40 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-red-600 shadow" />
                </div>
                <span className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-amber-100 border border-slate-700 shadow" />
                <span className="absolute bottom-2 left-3 w-3.5 h-3.5 rounded-full bg-stone-900 border border-amber-500 shadow" />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </div>
              </div>
            </div>

            <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 gap-2">
              <div>
                <h3 className="font-black text-xs sm:text-base text-aurora-text group-hover:text-amber-400 transition truncate">
                  Carrom 2D Arena
                </h3>
                <div className="text-[10px] text-aurora-muted flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>890 playing</span>
                </div>
              </div>
              <div className="pt-2 border-t border-aurora-border/40 flex items-center justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] text-aurora-muted font-mono">Min ₹20</span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black">
                  PLAY
                </span>
              </div>
            </div>
          </Link>

          {/* 3. Dragon Tiger Live */}
          <Link
            href="/games/dragontiger"
            className="group relative rounded-2xl sm:rounded-3xl bg-aurora-surface border border-purple-600/40 hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_25px_rgba(140,115,255,0.35)] flex flex-col justify-between overflow-hidden active:scale-95 shadow-md"
          >
            <div className="relative h-28 sm:h-36 md:h-40 w-full bg-gradient-to-br from-[#1e1338] via-[#2d1222] to-[#0c1222] border-b border-aurora-border/40 flex items-center justify-center p-3">
              <span className="absolute top-2 right-2 text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full bg-aurora-gold text-slate-950 shadow-md">
                SPEED 8:1
              </span>
              <span className="absolute top-2 left-2 text-[8px] sm:text-[9px] font-bold text-aurora-muted bg-black/50 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                TABLE
              </span>
              <div className="flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                <div className="w-9 h-13 rounded bg-red-800 border border-red-400 flex flex-col items-center justify-center text-xs font-black text-amber-300 transform -rotate-6 shadow">
                  🐉
                </div>
                <div className="w-9 h-13 rounded bg-amber-700 border border-amber-300 flex flex-col items-center justify-center text-xs font-black text-amber-100 transform rotate-6 shadow">
                  🐯
                </div>
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 gap-2">
              <div>
                <h3 className="font-black text-xs sm:text-base text-aurora-text group-hover:text-purple-400 transition truncate">
                  Dragon Tiger Live
                </h3>
                <div className="text-[10px] text-aurora-muted flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>640 playing</span>
                </div>
              </div>
              <div className="pt-2 border-t border-aurora-border/40 flex items-center justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] text-aurora-muted font-mono">Min ₹10</span>
                <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-black">
                  PLAY
                </span>
              </div>
            </div>
          </Link>

          {/* 4. Teen Patti Multiplayer */}
          <Link
            href="/games/teenpatti"
            className="group relative rounded-2xl sm:rounded-3xl bg-aurora-surface border border-emerald-600/40 hover:border-emerald-400 transition-all duration-300 hover:shadow-[0_0_25px_rgba(49,197,139,0.35)] flex flex-col justify-between overflow-hidden active:scale-95 shadow-md"
          >
            <div className="relative h-28 sm:h-36 md:h-40 w-full bg-gradient-to-br from-[#08241b] via-[#0d3627] to-[#0c1222] border-b border-aurora-border/40 flex items-center justify-center p-3">
              <span className="absolute top-2 right-2 text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-md">
                ROYAL 3-CARD
              </span>
              <span className="absolute top-2 left-2 text-[8px] sm:text-[9px] font-bold text-aurora-muted bg-black/50 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                CARDS
              </span>
              <div className="flex items-center -space-x-3 group-hover:scale-105 transition-transform">
                <div className="w-8 h-12 rounded bg-slate-100 flex items-center justify-center text-red-600 font-black text-xs shadow transform -rotate-12">
                  A♥
                </div>
                <div className="w-8 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-950 font-black text-xs shadow transform z-10">
                  K♠
                </div>
                <div className="w-8 h-12 rounded bg-slate-100 flex items-center justify-center text-red-600 font-black text-xs shadow transform rotate-12">
                  Q♦
                </div>
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </div>
              </div>
            </div>

            <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 gap-2">
              <div>
                <h3 className="font-black text-xs sm:text-base text-aurora-text group-hover:text-emerald-400 transition truncate">
                  Teen Patti 3-Card
                </h3>
                <div className="text-[10px] text-aurora-muted flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>1,120 playing</span>
                </div>
              </div>
              <div className="pt-2 border-t border-aurora-border/40 flex items-center justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] text-aurora-muted font-mono">Min ₹50</span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">
                  PLAY
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Provably Fair Security Card */}
      <section className="p-4 sm:p-6 rounded-2xl bg-aurora-surface border border-aurora-border/80">
        <div className="flex items-center gap-2 text-xs font-bold text-aurora-cyan uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-aurora-cyan" />
          <span>Provably Fair RNG Architecture</span>
        </div>
        <p className="text-xs text-aurora-muted leading-relaxed">
          Every game outcome is determined server-authoritatively using SHA-256 cryptographic commitments before bets are locked. No client manipulation or outcome alteration is possible.
        </p>
      </section>
    </div>
  );
}
