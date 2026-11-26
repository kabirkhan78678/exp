"use client";

import React from 'react';

/** Bespoke Hexagonal Diamond Crest Logo */
export const VeltrixLogoMark: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vxHexGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1B3B28" />
        <stop offset="55%" stopColor="#0D1913" />
        <stop offset="100%" stopColor="#070C09" />
      </linearGradient>
      <linearGradient id="vxStrokeGrad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#47EC84" />
        <stop offset="50%" stopColor="#F5B041" />
        <stop offset="100%" stopColor="#47EC84" />
      </linearGradient>
      <linearGradient id="vxVGrad" x1="15" y1="14" x2="33" y2="35" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6BFF9F" />
        <stop offset="100%" stopColor="#26D468" />
      </linearGradient>
    </defs>
    {/* Outer Hexagon Shield */}
    <path
      d="M24 3L42 13.5V34.5L24 45L6 34.5V13.5L24 3Z"
      fill="url(#vxHexGrad)"
      stroke="url(#vxStrokeGrad)"
      strokeWidth="2"
    />
    {/* Inner Architectural Facet */}
    <path
      d="M24 8L37.5 16V32L24 40L10.5 32V16L24 8Z"
      stroke="rgba(255,255,255,0.09)"
      strokeWidth="1"
    />
    {/* Dynamic Precision V + Crown Apex */}
    <path
      d="M15.5 17.5L24 33.5L32.5 17.5"
      stroke="url(#vxVGrad)"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M24 11.5L26.5 15.5L24 19L21.5 15.5L24 11.5Z" fill="#F5B041" />
  </svg>
);

/** 3D Brushed Metallic Gold Coin with Rupee Emblem */
export const GoldRupeeCoin: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="coinRim" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <radialGradient id="coinFace" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="60%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </radialGradient>
    </defs>
    <circle cx="16" cy="16" r="14.5" fill="url(#coinRim)" />
    <circle cx="16" cy="16" r="11.5" fill="url(#coinFace)" stroke="#78350F" strokeOpacity="0.35" strokeWidth="1" />
    <path
      d="M12.5 10.5H19.5M12.5 14H19.5M16 10.5C17.8 10.5 18.8 11.8 18.8 13.5C18.8 15.4 17.3 16.7 15 16.7H12.5L18.5 22.5"
      stroke="#451A03"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** AeroCrash Aviator Supersonic Trajectory Vector Poster */
export const AeroCrashArt: React.FC = () => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#2B070F] via-[#170408] to-[#080A0D]">
    {/* Telemetry Radar Grid */}
    <div
      className="absolute inset-0 opacity-25"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(255,46,84,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,46,84,0.22) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    />
    <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-[#FF2E54]/20 blur-2xl pointer-events-none" />

    <svg className="relative z-10 w-full h-full max-w-[230px] max-h-[150px]" viewBox="0 0 240 150" fill="none">
      <defs>
        <linearGradient id="crashArea" x1="15" y1="130" x2="185" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF2E54" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#FF2E54" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="crashLine" x1="10" y1="135" x2="195" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#FF2E54" />
        </linearGradient>
      </defs>

      {/* Flight Curve Fill & Stroke */}
      <path d="M12 136 Q 115 128 190 36 L 190 136 Z" fill="url(#crashArea)" />
      <path
        d="M12 136 Q 115 128 190 36"
        stroke="url(#crashLine)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Glowing Horizon Dot */}
      <circle cx="190" cy="36" r="5" fill="#FF2E54" />
      <circle cx="190" cy="36" r="10" fill="#FF2E54" fillOpacity="0.28" />

      {/* Sleek Delta Interceptor Jet */}
      <g transform="translate(168, 12) rotate(-26)">
        {/* Afterburner Flame */}
        <path d="M-12 22 L4 18 L4 26 Z" fill="#F5B041" opacity="0.9" />
        <path d="M-6 22 L4 20 L4 24 Z" fill="#FFFFFF" />
        {/* Fuselage */}
        <path
          d="M4 17 L28 19 L46 22 L28 25 L4 27 L9 22 Z"
          fill="#FF2E54"
          stroke="#FFE4E6"
          strokeWidth="1"
        />
        {/* Swept Wings */}
        <path d="M16 19 L10 5 L28 19 Z" fill="#E11D48" />
        <path d="M16 25 L10 39 L28 25 Z" fill="#BE123C" />
        {/* Cockpit Canopy */}
        <ellipse cx="30" cy="22" rx="6" ry="2.2" fill="#FFFFFF" fillOpacity="0.85" />
      </g>

      {/* Floating Multiplier Pill */}
      <g transform="translate(26, 22)">
        <rect width="74" height="26" rx="13" fill="rgba(10,12,14,0.82)" stroke="rgba(255,46,84,0.55)" strokeWidth="1" />
        <text x="37" y="17" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900" fontFamily="monospace">
          18.42x
        </text>
      </g>
    </svg>
  </div>
);

/** Carrom 2D Tournament Rosewood & Birch Vector Board Poster */
export const CarromBoardArt: React.FC = () => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#291709] via-[#180E06] to-[#080A0D]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,176,65,0.18),transparent_70%)]" />
    <svg className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 drop-shadow-[0_12px_20px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-300" viewBox="0 0 160 160" fill="none">
      {/* Rosewood Frame */}
      <rect x="10" y="10" width="140" height="140" rx="18" fill="#3B1F0E" stroke="#F5B041" strokeOpacity="0.45" strokeWidth="2" />
      {/* Birch Playing Surface */}
      <rect x="22" y="22" width="116" height="116" rx="10" fill="#DFC39D" stroke="#6B3A1E" strokeWidth="1.5" />
      {/* Pockets */}
      <circle cx="31" cy="31" r="7.5" fill="#14110F" stroke="#8C5328" strokeWidth="1.5" />
      <circle cx="129" cy="31" r="7.5" fill="#14110F" stroke="#8C5328" strokeWidth="1.5" />
      <circle cx="31" cy="129" r="7.5" fill="#14110F" stroke="#8C5328" strokeWidth="1.5" />
      <circle cx="129" cy="129" r="7.5" fill="#14110F" stroke="#8C5328" strokeWidth="1.5" />
      {/* Baseline Tracks */}
      <line x1="42" y1="36" x2="118" y2="36" stroke="#78350F" strokeOpacity="0.45" strokeWidth="1.2" />
      <line x1="42" y1="124" x2="118" y2="124" stroke="#78350F" strokeOpacity="0.45" strokeWidth="1.2" />
      {/* Center Mandala Ring */}
      <circle cx="80" cy="80" r="24" stroke="#9A3412" strokeWidth="1.4" strokeOpacity="0.65" />
      <circle cx="80" cy="80" r="14" stroke="#B45309" strokeWidth="1" strokeDasharray="3 2" />
      {/* Pieces Cluster */}
      <circle cx="80" cy="80" r="6" fill="#DC2626" stroke="#FEF08A" strokeWidth="1.2" />
      <circle cx="69" cy="74" r="5" fill="#FFFDF7" stroke="#A16207" strokeWidth="1" />
      <circle cx="91" cy="74" r="5" fill="#1E1B18" stroke="#D97706" strokeWidth="0.9" />
      <circle cx="69" cy="86" r="5" fill="#1E1B18" stroke="#D97706" strokeWidth="0.9" />
      <circle cx="91" cy="86" r="5" fill="#FFFDF7" stroke="#A16207" strokeWidth="1" />
      {/* Active Golden Striker & Aim Vector */}
      <line x1="80" y1="124" x2="80" y2="90" stroke="#47EC84" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="80" cy="124" r="7.5" fill="#F5B041" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  </div>
);

/** Dragon Tiger Foil Crest VS Vector Poster */
export const DragonTigerArt: React.FC = () => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#23102E] via-[#1C0B16] to-[#080A0D]">
    <div className="absolute -left-6 top-0 w-32 h-32 bg-[#FF2E54]/20 rounded-full blur-2xl" />
    <div className="absolute -right-6 bottom-0 w-32 h-32 bg-[#38BDF8]/20 rounded-full blur-2xl" />

    <div className="relative z-10 flex items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-300">
      {/* Dragon Crimson Foil Card */}
      <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-xl bg-gradient-to-b from-[#991B1B] to-[#3B0712] border border-rose-400/70 shadow-[0_8px_20px_rgba(255,46,84,0.35)] flex flex-col items-center justify-between p-1.5 -rotate-6">
        <span className="self-start text-[9px] font-black text-rose-200 leading-none">K</span>
        <svg className="w-6 h-6 text-[#F5B041]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15 8L22 9L17 14L18 21L12 17.5L6 21L7 14L2 9L9 8L12 2Z" />
        </svg>
        <span className="text-[7px] font-black tracking-widest text-amber-200">DRAGON</span>
      </div>

      {/* Central VS Spark Ring */}
      <div className="w-7 h-7 rounded-full bg-[#0B0E10] border border-[#F5B041] flex items-center justify-center shadow-glowGold z-20 -mx-3">
        <span className="text-[9px] font-black text-[#F5B041]">VS</span>
      </div>

      {/* Tiger Cobalt Gold Foil Card */}
      <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-xl bg-gradient-to-b from-[#1E3A8A] to-[#0B1739] border border-sky-400/70 shadow-[0_8px_20px_rgba(56,189,248,0.3)] flex flex-col items-center justify-between p-1.5 rotate-6">
        <span className="self-start text-[9px] font-black text-sky-200 leading-none">Q</span>
        <svg className="w-6 h-6 text-sky-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L20 12L12 21L4 12L12 3Z" />
        </svg>
        <span className="text-[7px] font-black tracking-widest text-sky-200">TIGER</span>
      </div>
    </div>
  </div>
);

/** Teen Patti Royal Obsidian 3-Card Fan Poster */
export const TeenPattiArt: React.FC = () => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#07261A] via-[#0B1C16] to-[#080A0D]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(71,236,132,0.18),transparent_70%)]" />

    <div className="relative z-10 flex items-center -space-x-4 group-hover:scale-105 transition-transform duration-300">
      {/* Left Card: Queen Hearts */}
      <div className="w-11 h-16 sm:w-12 sm:h-18 rounded-xl bg-gradient-to-b from-[#1A2024] to-[#0D1113] border border-white/25 shadow-xl -rotate-12 flex flex-col justify-between p-1.5">
        <span className="text-[9px] font-black text-[#FF2E54] leading-none">Q♥</span>
        <span className="self-center text-base text-[#FF2E54] leading-none">♥</span>
        <span className="self-end text-[8px] font-black text-[#FF2E54] leading-none rotate-180">Q</span>
      </div>

      {/* Center Card: Ace Spades Emerald Foil */}
      <div className="w-12 h-17 sm:w-14 sm:h-20 rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#E2E8F0] border-2 border-[#47EC84] shadow-[0_10px_24px_rgba(71,236,132,0.35)] z-20 -translate-y-1 flex flex-col justify-between p-1.5">
        <span className="text-[10px] font-black text-slate-950 leading-none">A♠</span>
        <span className="self-center text-xl text-slate-950 leading-none">♠</span>
        <span className="self-end text-[9px] font-black text-slate-950 leading-none rotate-180">A</span>
      </div>

      {/* Right Card: King Diamonds */}
      <div className="w-11 h-16 sm:w-12 sm:h-18 rounded-xl bg-gradient-to-b from-[#1A2024] to-[#0D1113] border border-[#F5B041]/50 shadow-xl rotate-12 flex flex-col justify-between p-1.5">
        <span className="text-[9px] font-black text-[#F5B041] leading-none">K♦</span>
        <span className="self-center text-base text-[#F5B041] leading-none">♦</span>
        <span className="self-end text-[8px] font-black text-[#F5B041] leading-none rotate-180">K</span>
      </div>
    </div>
  </div>
);

/** Hero Floating VIP Vault Prism Graphic */
export const HeroVaultIllustration: React.FC = () => (
  <div className="relative w-28 h-28 sm:w-40 sm:h-40 flex items-center justify-center shrink-0">
    <div className="absolute inset-0 rounded-full bg-[#47EC84]/20 blur-2xl animate-pulse" />
    <svg className="w-full h-full animate-floatSlow drop-shadow-[0_14px_28px_rgba(71,236,132,0.35)]" viewBox="0 0 160 160" fill="none">
      <defs>
        <linearGradient id="prismTop" x1="80" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6BFF9F" />
          <stop offset="100%" stopColor="#199B4D" />
        </linearGradient>
        <linearGradient id="prismLeft" x1="25" y1="55" x2="80" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14532D" />
          <stop offset="100%" stopColor="#052E16" />
        </linearGradient>
        <linearGradient id="prismRight" x1="135" y1="55" x2="80" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#47EC84" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
      </defs>
      {/* Orbital Ring */}
      <ellipse cx="80" cy="84" rx="68" ry="22" stroke="#F5B041" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="5 5" transform="rotate(-14 80 84)" />
      {/* Diamond Cut Facets */}
      <polygon points="80,16 132,58 80,82 28,58" fill="url(#prismTop)" stroke="#A7F3D0" strokeWidth="1.2" />
      <polygon points="28,58 80,82 80,144" fill="url(#prismLeft)" stroke="#47EC84" strokeOpacity="0.4" strokeWidth="1" />
      <polygon points="132,58 80,82 80,144" fill="url(#prismRight)" stroke="#6EE7B7" strokeOpacity="0.5" strokeWidth="1" />
      {/* Center Gold Crown Core */}
      <polygon points="80,52 96,68 80,84 64,68" fill="#F5B041" stroke="#FEF08A" strokeWidth="1.2" />
      {/* Sparkles */}
      <circle cx="24" cy="40" r="3" fill="#F5B041" />
      <circle cx="138" cy="112" r="2.5" fill="#47EC84" />
    </svg>
  </div>
);
