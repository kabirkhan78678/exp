"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, Users, Play, X } from 'lucide-react';
import { api } from '@/lib/api';
import {
  AeroCrashArt,
  CarromBoardArt,
  DragonTigerArt,
  TeenPattiArt,
} from '@/components/GameArtwork';

export default function GameLobbyPage() {
  const [games, setGames] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGames()
      .then((res) => setGames(res.games || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { label: 'All Arenas', value: 'ALL' },
    { label: 'Crash Multiplier', value: 'CRASH' },
    { label: 'Skill & Board', value: 'SKILL' },
    { label: 'Speed Table', value: 'TABLE' },
    { label: 'PvP Cards', value: 'CARDS' },
  ];

  const filteredGames = games.filter((g) => {
    const matchesCategory = selectedCategory === 'ALL' || g.category === selectedCategory;
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getGameMeta = (slug: string) => {
    switch (slug) {
      case 'aerocrash':
        return {
          art: <AeroCrashArt />,
          badgeText: 'HOT 100x',
          badgeClass: 'bg-[#FF2E54] text-white',
          borderClass: 'hover:border-[#FF2E54]/60 hover:shadow-[0_14px_34px_-10px_rgba(255,46,84,0.4)]',
          players: '1,420 online',
          ctaClass: 'text-[#FF2E54] bg-[#FF2E54]/15 border-[#FF2E54]/30',
        };
      case 'carrom':
        return {
          art: <CarromBoardArt />,
          badgeText: 'PHYSICS 2D',
          badgeClass: 'bg-[#F5B041] text-slate-950',
          borderClass: 'hover:border-[#F5B041]/60 hover:shadow-[0_14px_34px_-10px_rgba(245,176,65,0.35)]',
          players: '890 online',
          ctaClass: 'text-[#F5B041] bg-[#F5B041]/15 border-[#F5B041]/30',
        };
      case 'dragontiger':
        return {
          art: <DragonTigerArt />,
          badgeText: 'SPEED 8:1',
          badgeClass: 'bg-sky-400 text-slate-950',
          borderClass: 'hover:border-sky-400/60 hover:shadow-[0_14px_34px_-10px_rgba(56,189,248,0.35)]',
          players: '640 online',
          ctaClass: 'text-sky-400 bg-sky-400/15 border-sky-400/30',
        };
      case 'teenpatti':
      default:
        return {
          art: <TeenPattiArt />,
          badgeText: 'ROYAL 3-CARD',
          badgeClass: 'bg-[#47EC84] text-slate-950',
          borderClass: 'hover:border-[#47EC84]/60 hover:shadow-[0_14px_34px_-10px_rgba(71,236,132,0.4)]',
          players: '1,120 online',
          ctaClass: 'text-[#47EC84] bg-[#47EC84]/15 border-[#47EC84]/30',
        };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-32 w-full">
      {/* Live Presence Telemetry Strip */}
      <div className="flex items-center justify-between lux-card rounded-2xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#47EC84] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#47EC84]" />
          </span>
          <span className="text-xs font-bold text-white">3,842 Players In Arena</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#47EC84] font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SHA-256 FAIR</span>
        </div>
      </div>

      {/* Category Filter Pills & Instant Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-2.5 px-2.5 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                selectedCategory === cat.value
                  ? 'btn-emerald-3d'
                  : 'lux-card text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter arenas..."
            className="w-full pl-9 pr-8 py-2 rounded-full bg-[#121619] border border-white/[0.1] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#47EC84] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Certified Game Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
          <div className="w-7 h-7 border-2 border-[#47EC84] border-t-transparent rounded-full animate-spin" />
          <span>Loading game arenas...</span>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400 lux-card rounded-3xl">
          No arenas match &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3.5 sm:gap-5">
          {filteredGames.map((game) => {
            const meta = getGameMeta(game.slug);

            return (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className={`group relative rounded-2xl sm:rounded-3xl lux-card transition-all duration-300 ${meta.borderClass} flex flex-col justify-between overflow-hidden active:scale-[0.98]`}
              >
                <div className="relative h-32 xs:h-36 sm:h-44 w-full border-b border-white/[0.08] overflow-hidden">
                  {meta.art}

                  <span className="absolute top-2.5 left-2.5 text-[8px] sm:text-[9px] font-bold text-slate-300 bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 uppercase">
                    {game.category}
                  </span>

                  <span className={`absolute top-2.5 right-2.5 text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase ${meta.badgeClass}`}>
                    {meta.badgeText}
                  </span>

                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full btn-emerald-3d flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-2.5">
                  <div>
                    <h3 className="font-display font-black text-xs xs:text-sm sm:text-base text-white group-hover:text-[#47EC84] transition truncate">
                      {game.name}
                    </h3>
                    <div className="text-[10px] sm:text-xs text-slate-400 flex items-center justify-between gap-1 mt-1">
                      <span className="flex items-center gap-1 truncate">
                        <Users className="w-3 h-3 text-[#47EC84] shrink-0" />
                        {meta.players}
                      </span>
                      <span className="font-mono text-slate-300 shrink-0">RTP {game.rtp_percentage}%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.07] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">Min ₹{parseFloat(game.min_stake).toFixed(0)}</span>
                    <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black ${meta.ctaClass}`}>
                      PLAY →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
