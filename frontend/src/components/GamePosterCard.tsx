"use client";

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import type { GameCatalogMeta } from '@/lib/gamesCatalog';

/** Premium Game Poster Card featuring studio VIP Host Portrait + Telemetry */
export const GamePosterCard: React.FC<{ game: GameCatalogMeta }> = ({ game }) => {
  return (
    <Link
      href={`/games/${game.slug}`}
      className={`group relative rounded-2xl sm:rounded-3xl lux-card transition-all duration-300 ${game.borderHover} flex flex-col justify-between overflow-hidden active:scale-[0.98]`}
    >
      <div className="relative h-36 xs:h-40 sm:h-48 w-full border-b border-white/[0.08] overflow-hidden bg-[#0A0D0F]">
        <img
          src={game.hostImage}
          alt={`${game.name} — ${game.hostRole}`}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E10] via-transparent to-black/45 pointer-events-none" />

        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[8px] sm:text-[9px] font-bold text-slate-200 uppercase tracking-wider">
          {game.tag}
        </span>

        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black shadow-lg ${game.badgeClass}`}>
          {game.badge}
        </span>

        <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#47EC84] animate-pulse" />
          <span className="text-[9px] font-bold text-slate-200">{game.hostRole}</span>
        </div>

        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full btn-emerald-3d flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-2">
        <div>
          <h3 className="font-display font-black text-xs xs:text-sm sm:text-base text-white group-hover:text-[#47EC84] transition truncate">
            {game.name}
          </h3>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span className="flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#47EC84]" />
              {game.players}
            </span>
            <span className="font-mono text-slate-300 shrink-0">RTP {game.rtp}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/[0.07] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">Min {game.minStake}</span>
          <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black tracking-wide ${game.ctaStyle}`}>
            PLAY →
          </span>
        </div>
      </div>
    </Link>
  );
};
