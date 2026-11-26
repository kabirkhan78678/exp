"use client";

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import type { GameCatalogMeta } from '@/lib/gamesCatalog';
import { GamePosterMiniScene } from '@/components/GameArtwork';

/** Creative AAA Game Cover Poster Card: Stylized Background + Masked Host Portrait Right + Unmistakable Game Graphics Left */
export const GamePosterCard: React.FC<{ game: GameCatalogMeta }> = ({ game }) => {
  const themeGradients: Record<string, string> = {
    aerocrash: 'from-[#3B0612] via-[#1C040A] to-[#080A0C]',
    mines: 'from-[#06291A] via-[#0B1713] to-[#080A0C]',
    wingo: 'from-[#220B38] via-[#120A1E] to-[#080A0C]',
    dice: 'from-[#082638] via-[#0A141C] to-[#080A0C]',
    dragontiger: 'from-[#330A14] via-[#120F24] to-[#080A0C]',
    teenpatti: 'from-[#072B1A] via-[#0B1B14] to-[#080A0C]',
    carrom: 'from-[#331B07] via-[#1B1006] to-[#080A0C]',
    ludo: 'from-[#0B1E38] via-[#1B1328] to-[#080A0C]',
  };

  const bgGradient = themeGradients[game.slug] || 'from-[#14191D] to-[#080A0C]';

  return (
    <Link
      href={`/games/${game.slug}`}
      className={`group relative rounded-2xl sm:rounded-3xl lux-card transition-all duration-300 ${game.borderHover} flex flex-col justify-between overflow-hidden active:scale-[0.98]`}
    >
      {/* Split Poster Canvas Header */}
      <div className={`relative h-36 xs:h-40 sm:h-48 w-full border-b border-white/[0.08] overflow-hidden bg-gradient-to-br ${bgGradient}`}>
        {/* Full-bleed action art for AeroCrash; Right-aligned Host Portrait for tabletop/arcade games */}
        <div className={`absolute inset-y-0 right-0 overflow-hidden ${game.slug === 'aerocrash' ? 'w-full' : 'w-[76%] sm:w-[72%]'}`}>
          <img
            src={game.hostImage}
            alt={`${game.name} — ${game.hostRole}`}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {game.slug !== 'aerocrash' && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D10] via-[#0A0D10]/45 to-transparent pointer-events-none" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090C0E] via-transparent to-black/35 pointer-events-none" />
        </div>

        {game.slug !== 'aerocrash' && (
          <div className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-[#090C0E]/90 to-transparent pointer-events-none" />
        )}

        {/* Top Badges */}
        <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/15 text-[8px] sm:text-[9px] font-bold text-slate-200 uppercase tracking-wider">
          {game.tag}
        </span>

        <span className={`absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black shadow-lg ${game.badgeClass}`}>
          {game.badge}
        </span>

        {/* FOREGROUND LEFT: Unmistakable Creative Game Art (compact pill on AeroCrash so the full jet art stays visible) */}
        <div className="absolute bottom-2 left-2.5 z-20 transform group-hover:scale-105 transition-transform duration-300">
          {game.slug === 'aerocrash' ? (
            <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#FF2E54]/70 text-[10px] font-mono font-black text-white shadow-[0_0_12px_rgba(255,46,84,0.5)]">
              24.8x FLY
            </span>
          ) : (
            <GamePosterMiniScene slug={game.slug} />
          )}
        </div>

        {/* Bottom-Right Host Pill */}
        <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#47EC84] animate-pulse" />
          <span className="text-[8px] sm:text-[9px] font-bold text-slate-200">{game.hostRole}</span>
        </div>

        {/* Center Hover Play Launch Reveal */}
        <div className="absolute inset-0 z-30 bg-black/45 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full btn-emerald-3d flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Meta Footer */}
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
