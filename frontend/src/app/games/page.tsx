"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Gamepad2, Plane, Swords, Layers, Disc, 
  Search, Sparkles, ArrowRight, ShieldCheck, Flame, 
  Trophy, Users, Zap, Play
} from 'lucide-react';
import { api } from '@/lib/api';

export default function GameLobbyPage() {
  const [games, setGames] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGames()
      .then((res) => setGames(res.games))
      .catch(() => {
        // Fallback default games if backend is initializing
        setGames([
          {
            slug: 'aerocrash',
            name: 'AeroCrash',
            category: 'CRASH',
            description: 'Original Red Aviator edition. Flight multiplier curve up to 100x.',
            min_stake: '10.00',
            max_stake: '10000.00',
            rtp_percentage: '97.00',
            player_count: 1420
          },
          {
            slug: 'carrom',
            name: 'Carrom 2D',
            category: 'SKILL',
            description: 'English Birch tournament board, baseline drag striker & realistic physics.',
            min_stake: '20.00',
            max_stake: '5000.00',
            rtp_percentage: '96.50',
            player_count: 890
          },
          {
            slug: 'dragontiger',
            name: 'Dragon Tiger',
            category: 'TABLE',
            description: 'Fast 2-card casino table battle with 8:1 Tie payout.',
            min_stake: '10.00',
            max_stake: '25000.00',
            rtp_percentage: '96.27',
            player_count: 640
          },
          {
            slug: 'teenpatti',
            name: 'Teen Patti',
            category: 'CARDS',
            description: '3-Card multiplayer Indian poker with Blind, Seen, Showdown rules.',
            min_stake: '50.00',
            max_stake: '10000.00',
            rtp_percentage: '95.50',
            player_count: 1120
          }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { label: '🔥 All Games', value: 'ALL' },
    { label: '🚀 Aviator / Crash', value: 'CRASH' },
    { label: '🎯 Carrom & Skill', value: 'SKILL' },
    { label: '🐉 Dragon Tiger', value: 'TABLE' },
    { label: '🃏 Teen Patti', value: 'CARDS' },
  ];

  const filteredGames = games.filter((g) => {
    const matchesCategory = selectedCategory === 'ALL' || g.category === selectedCategory;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getGameArtwork = (slug: string) => {
    switch (slug) {
      case 'aerocrash':
        return {
          gradient: 'from-[#2b080c] via-[#4d0c13] to-[#0c1222]',
          accentBorder: 'border-red-600/40 group-hover:border-red-500',
          badgeText: 'HOT 100x',
          badgeBg: 'bg-red-600 text-white',
          glow: 'group-hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]',
          iconColor: 'text-red-400',
          players: '1,420 playing',
          tag: 'CRASH MULTIPLIER',
          illustration: (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.25),transparent_70%)]" />
              {/* Aviator Plane Graphic */}
              <div className="relative z-10 transform -rotate-12 group-hover:scale-110 group-hover:translate-x-1 transition-transform duration-300">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
                {/* Afterburner trail */}
                <div className="absolute -left-6 top-8 w-8 h-1.5 bg-gradient-to-l from-red-500 via-amber-400 to-transparent rounded-full animate-pulse blur-[1px]" />
              </div>
            </div>
          )
        };
      case 'carrom':
        return {
          gradient: 'from-[#2a1708] via-[#3d240c] to-[#0c1222]',
          accentBorder: 'border-amber-600/40 group-hover:border-amber-400',
          badgeText: 'PHYSICS 2D',
          badgeBg: 'bg-amber-500 text-slate-950 font-black',
          glow: 'group-hover:shadow-[0_0_25px_rgba(217,183,110,0.35)]',
          iconColor: 'text-amber-400',
          players: '890 playing',
          tag: 'TOURNAMENT BOARD',
          illustration: (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,183,110,0.2),transparent_70%)]" />
              {/* Carrom board circular graphic */}
              <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-500/50 bg-[#cbb28d]/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 rounded-full border border-red-500/40 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-red-600 shadow-[0_0_6px_#dc2626]" />
                </div>
                {/* Coins */}
                <span className="absolute -top-1 left-2 w-3.5 h-3.5 rounded-full bg-amber-100 border border-slate-700 shadow" />
                <span className="absolute bottom-1 right-2 w-3.5 h-3.5 rounded-full bg-stone-900 border border-amber-500/40 shadow" />
                <span className="absolute top-2 right-1 w-4 h-4 rounded-full bg-amber-400 border border-amber-200 shadow-md" />
              </div>
            </div>
          )
        };
      case 'dragontiger':
        return {
          gradient: 'from-[#1e1338] via-[#2d1222] to-[#0c1222]',
          accentBorder: 'border-purple-600/40 group-hover:border-purple-400',
          badgeText: 'SPEED 8:1',
          badgeBg: 'bg-gradient-to-r from-aurora-gold to-amber-500 text-slate-950 font-black',
          glow: 'group-hover:shadow-[0_0_25px_rgba(140,115,255,0.35)]',
          iconColor: 'text-purple-400',
          players: '640 playing',
          tag: 'LIVE TABLE',
          illustration: (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(140,115,255,0.2),transparent_70%)]" />
              <div className="relative z-10 flex items-center gap-1.5 group-hover:scale-105 transition-transform duration-300">
                {/* Dragon card */}
                <div className="w-9 h-13 sm:w-11 sm:h-16 rounded-md bg-gradient-to-b from-red-600 to-red-950 border border-red-400 shadow-lg flex flex-col items-center justify-center transform -rotate-6">
                  <span className="text-[10px] sm:text-xs font-black text-amber-300">🐉</span>
                  <span className="text-[9px] font-black text-white mt-1">D</span>
                </div>
                {/* Tiger card */}
                <div className="w-9 h-13 sm:w-11 sm:h-16 rounded-md bg-gradient-to-b from-amber-500 to-amber-950 border border-amber-300 shadow-lg flex flex-col items-center justify-center transform rotate-6">
                  <span className="text-[10px] sm:text-xs font-black text-amber-100">🐯</span>
                  <span className="text-[9px] font-black text-slate-950 mt-1">T</span>
                </div>
              </div>
            </div>
          )
        };
      case 'teenpatti':
      default:
        return {
          gradient: 'from-[#08241b] via-[#0d3627] to-[#0c1222]',
          accentBorder: 'border-emerald-600/40 group-hover:border-emerald-400',
          badgeText: 'ROYAL 3-CARD',
          badgeBg: 'bg-emerald-500 text-slate-950 font-black',
          glow: 'group-hover:shadow-[0_0_25px_rgba(49,197,139,0.35)]',
          iconColor: 'text-emerald-400',
          players: '1,120 playing',
          tag: 'PVP MULTIPLAYER',
          illustration: (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(49,197,139,0.2),transparent_70%)]" />
              <div className="relative z-10 flex items-center -space-x-4 group-hover:scale-105 transition-transform duration-300">
                <div className="w-8 h-12 sm:w-10 sm:h-15 rounded bg-slate-100 border border-slate-300 shadow transform -rotate-12 flex items-center justify-center text-red-600 font-black text-xs">
                  A♥
                </div>
                <div className="w-8 h-12 sm:w-10 sm:h-15 rounded bg-slate-100 border border-slate-300 shadow transform z-10 flex items-center justify-center text-slate-950 font-black text-xs">
                  K♠
                </div>
                <div className="w-8 h-12 sm:w-10 sm:h-15 rounded bg-slate-100 border border-slate-300 shadow transform rotate-12 flex items-center justify-center text-red-600 font-black text-xs">
                  Q♦
                </div>
              </div>
            </div>
          )
        };
    }
  };

  return (
    <div className="space-y-3 xs:space-y-4 sm:space-y-6 px-2.5 xs:px-3 sm:px-6 lg:px-8 py-2.5 xs:py-3 sm:py-6 max-w-7xl mx-auto pb-28 w-full max-w-full overflow-x-hidden">
      {/* Mobile Live Presence Bar */}
      <div className="flex items-center justify-between bg-aurora-surface/70 border border-aurora-border/60 rounded-2xl px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-aurora-text">
            3,842 Players Live
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-aurora-muted font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-aurora-cyan" />
          <span>Provably Fair RNG</span>
        </div>
      </div>

      {/* Horizontal Category Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 shrink-0 ${
              selectedCategory === cat.value
                ? 'bg-gradient-to-r from-aurora-cyan/20 to-aurora-purple/20 text-aurora-cyan border border-aurora-cyan/50 shadow-[0_0_12px_rgba(53,214,197,0.3)]'
                : 'bg-aurora-surface text-aurora-muted hover:text-aurora-text border border-aurora-border/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Touch-Friendly Search & Quick Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-aurora-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search games (Aviator, Carrom, Teen Patti...)"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-aurora-surface/90 border border-aurora-border/70 text-xs sm:text-sm text-aurora-text placeholder-aurora-muted focus:outline-none focus:border-aurora-cyan transition shadow-inner"
        />
      </div>

      {/* High-Converting 2-Column Mobile Game Poster Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-aurora-muted flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-aurora-cyan border-t-transparent rounded-full animate-spin" />
          <span>Loading verified games catalog...</span>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="p-10 text-center text-xs text-aurora-muted bg-aurora-surface rounded-2xl border border-aurora-border">
          No games match your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
          {filteredGames.map((game) => {
            const art = getGameArtwork(game.slug);

            return (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className={`group relative rounded-2xl sm:rounded-3xl bg-aurora-surface border ${art.accentBorder} transition-all duration-300 ${art.glow} flex flex-col justify-between overflow-hidden active:scale-95 shadow-md`}
              >
                {/* Top Poster Visual Area */}
                <div className={`relative h-28 sm:h-36 md:h-40 w-full bg-gradient-to-br ${art.gradient} border-b border-aurora-border/40 flex items-center justify-center p-3`}>
                  {art.illustration}

                  {/* Top-Right Badge */}
                  <span className={`absolute top-2 right-2 text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wide ${art.badgeBg}`}>
                    {art.badgeText}
                  </span>

                  {/* Top-Left Category Tag */}
                  <span className="absolute top-2 left-2 text-[8px] sm:text-[9px] font-bold text-aurora-muted bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10 uppercase">
                    {game.category}
                  </span>

                  {/* Play Button Overlay on Hover/Focus */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-aurora-cyan text-slate-950 flex items-center justify-center shadow-glow transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Meta & Details */}
                <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-black text-xs sm:text-base text-aurora-text group-hover:text-aurora-cyan transition truncate">
                        {game.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                    </div>

                    <div className="text-[10px] sm:text-xs text-aurora-muted flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-aurora-cyan shrink-0" />
                      <span className="truncate">{art.players}</span>
                    </div>
                  </div>

                  {/* Stake & Action Button */}
                  <div className="pt-2 border-t border-aurora-border/40 flex items-center justify-between gap-1">
                    <div className="text-[9px] sm:text-[10px] text-aurora-muted font-mono">
                      Min <span className="text-aurora-gold font-bold">₹{parseInt(game.min_stake || '10')}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-aurora-gold/20 to-aurora-cyan/20 border border-aurora-cyan/30 text-[10px] sm:text-xs font-black text-aurora-cyan group-hover:bg-aurora-cyan group-hover:text-slate-950 transition">
                      PLAY
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Mobile Quick VIP / Bonus Banner */}
      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-aurora-surface via-[#181d30] to-aurora-surface border border-aurora-border/80 flex items-center justify-between gap-3 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-aurora-gold/20 border border-aurora-gold/40 flex items-center justify-center text-aurora-gold shrink-0">
            <Trophy className="w-5 h-5 text-aurora-gold" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-aurora-text">
              Daily Leaderboard Pool
            </div>
            <div className="text-[10px] sm:text-xs text-aurora-muted">
              Win up to <strong className="text-aurora-gold">₹50,000</strong> in cash rewards daily
            </div>
          </div>
        </div>
        <Link
          href="/rewards"
          className="px-3 py-1.5 rounded-xl bg-aurora-elevated hover:bg-aurora-gold hover:text-slate-950 text-aurora-gold text-xs font-bold border border-aurora-gold/40 transition shrink-0"
        >
          View VIP
        </Link>
      </div>
    </div>
  );
}
