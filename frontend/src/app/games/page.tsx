"use client";

import React, { useState } from 'react';
import { Search, ShieldCheck, X } from 'lucide-react';
import { GAME_CATALOG } from '@/lib/gamesCatalog';
import { GamePosterCard } from '@/components/GamePosterCard';

export default function GameLobbyPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { label: 'All Arenas (8)', value: 'ALL' },
    { label: 'Crash & Arcade', value: 'CRASH' },
    { label: 'Tables & Parity', value: 'TABLE' },
    { label: 'PvP Cards', value: 'CARDS' },
    { label: 'Board & Skill', value: 'SKILL' },
  ];

  const filteredGames = GAME_CATALOG.filter((g) => {
    const matchesCategory = selectedCategory === 'ALL' || g.category === selectedCategory;
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.hostRole.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-6 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-6 w-full overflow-x-clip">
      <div className="flex items-center justify-between lux-card rounded-2xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#47EC84] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#47EC84]" />
          </span>
          <span className="text-xs font-bold text-white">10,520 Players Live Across 8 Salons</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#47EC84] font-mono font-bold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">SHA-256 FAIR</span>
        </div>
      </div>

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
            placeholder="Search games or hosts..."
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

      {filteredGames.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400 lux-card rounded-3xl">
          No arenas match &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3.5 sm:gap-5">
          {filteredGames.map((game) => (
            <GamePosterCard key={game.slug} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
