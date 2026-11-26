"use client";

import React from 'react';

/** Lightweight Web Audio Synthesizer for realistic table SFX */
export function playCasinoSfx(type: 'chip' | 'flip' | 'win' | 'lose') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'chip') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1450, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.055);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);
    } else if (type === 'flip') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.09);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const t = now + i * 0.07;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.26);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    }
  } catch {
    // Ignore blocked audio context silently
  }
}

/** 3D Animated Flippable Playing Card with Ornate Gold-Filigree Back */
export const PlayingCard3D: React.FC<{
  rank: string | number;
  suit: string;
  faceUp: boolean;
  highlight?: 'gold' | 'crimson' | 'emerald' | 'none';
  size?: 'sm' | 'md' | 'lg';
}> = ({ rank, suit, faceUp, highlight = 'none', size = 'md' }) => {
  const isRed = suit === '♥' || suit === '♦';

  const sizeClass =
    size === 'sm'
      ? 'w-12 h-16 sm:w-14 sm:h-20'
      : size === 'lg'
      ? 'w-20 h-28 xs:w-24 xs:h-32 sm:w-28 sm:h-40'
      : 'w-16 h-24 xs:w-20 xs:h-28 sm:w-24 sm:h-36';

  const borderGlow =
    highlight === 'gold'
      ? 'ring-2 ring-[#F5B041] shadow-[0_0_24px_rgba(245,176,65,0.65)]'
      : highlight === 'crimson'
      ? 'ring-2 ring-[#FF2E54] shadow-[0_0_24px_rgba(255,46,84,0.6)]'
      : highlight === 'emerald'
      ? 'ring-2 ring-[#47EC84] shadow-[0_0_24px_rgba(71,236,132,0.6)]'
      : 'border border-slate-300 shadow-[0_14px_28px_rgba(0,0,0,0.65)]';

  return (
    <div className={`perspective-1000 ${sizeClass} shrink-0 select-none`}>
      <div
        className={`relative w-full h-full preserve-3d transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          faceUp ? 'rotate-y-180' : ''
        }`}
      >
        {/* CARD BACK (Ornate Crimson & Champagne Gold Filigree) */}
        <div className="absolute inset-0 backface-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#6B1022] via-[#3B0813] to-[#1A0408] border-2 border-[#F5B041]/70 p-1.5 shadow-xl flex items-center justify-center">
          <div className="w-full h-full rounded-lg sm:rounded-xl border border-dashed border-[#F5B041]/55 bg-[radial-gradient(circle_at_center,rgba(245,176,65,0.18),transparent_70%)] flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#F5B041]/85" viewBox="0 0 32 32" fill="none">
              <path d="M16 3L27 16L16 29L5 16L16 3Z" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="16" cy="16" r="4.5" fill="currentColor" fillOpacity="0.85" />
            </svg>
          </div>
        </div>

        {/* CARD FRONT (Crisp Ivory Linen Face) */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#E2E8F0] p-1.5 sm:p-2.5 flex flex-col justify-between ${borderGlow}`}
        >
          <div className={`self-start flex flex-col items-center leading-none font-mono font-black ${isRed ? 'text-[#D91636]' : 'text-slate-900'}`}>
            <span className={size === 'sm' ? 'text-[10px]' : 'text-xs sm:text-base'}>{rank}</span>
            <span className={size === 'sm' ? 'text-[9px]' : 'text-[10px] sm:text-xs'}>{suit}</span>
          </div>

          <div className={`self-center leading-none ${isRed ? 'text-[#D91636]' : 'text-slate-900'} ${size === 'sm' ? 'text-xl' : 'text-3xl sm:text-5xl'}`}>
            {suit}
          </div>

          <div className={`self-end flex flex-col items-center leading-none font-mono font-black rotate-180 ${isRed ? 'text-[#D91636]' : 'text-slate-900'}`}>
            <span className={size === 'sm' ? 'text-[10px]' : 'text-xs sm:text-base'}>{rank}</span>
            <span className={size === 'sm' ? 'text-[9px]' : 'text-[10px] sm:text-xs'}>{suit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Authentic Striped Skeuomorphic Casino Chip */
export const CasinoChip: React.FC<{
  value: number;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}> = ({ value, selected = false, onClick, compact = false }) => {
  const palette: Record<number, { fill: string; rim: string; text: string }> = {
    10: { fill: '#B91C1C', rim: '#FCA5A5', text: '#FFF' },
    50: { fill: '#1D4ED8', rim: '#93C5FD', text: '#FFF' },
    100: { fill: '#047857', rim: '#6EE7B7', text: '#FFF' },
    500: { fill: '#6D28D9', rim: '#C4B5FD', text: '#FFF' },
    1000: { fill: '#18181B', rim: '#F5B041', text: '#FDE68A' },
    5000: { fill: '#D97706', rim: '#FEF08A', text: '#1A0F00' },
  };
  const c = palette[value] || palette[100];
  const label = value >= 1000 ? `${value / 1000}K` : `${value}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 rounded-full transition-all duration-200 active:scale-90 ${
        compact ? 'w-10 h-10' : 'w-11 h-11 xs:w-12 xs:h-12'
      } ${selected ? '-translate-y-1.5 scale-110 ring-2 ring-[#F5B041] shadow-[0_8px_20px_rgba(245,176,65,0.65)]' : 'opacity-85 hover:opacity-100 hover:-translate-y-0.5'}`}
      title={`Select ₹${value} Chip`}
    >
      <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-md">
        <circle cx="24" cy="24" r="22" fill={c.fill} stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Edge Striping */}
        <circle cx="24" cy="24" r="19" fill="none" stroke={c.rim} strokeWidth="4" strokeDasharray="5 5" />
        {/* Inner Crown Inlay */}
        <circle cx="24" cy="24" r="13.5" fill={c.fill} stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
        <text
          x="24"
          y="27"
          textAnchor="middle"
          fill={c.text}
          fontSize="10.5"
          fontWeight="900"
          fontFamily="monospace"
        >
          ₹{label}
        </text>
      </svg>
    </button>
  );
};

/** Imperial Dragon Seal Vector Crest */
export const DragonSealSVG: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="21" fill="#450A14" stroke="#F5B041" strokeWidth="2" />
    <circle cx="24" cy="24" r="17" stroke="#FF2E54" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="3 2" />
    <path
      d="M16 30C16 22 20 15 27 13C24 16 25 19 29 19C32 19 34 22 32 25C30 28 24 27 22 31C26 31 30 33 32 35H16V30Z"
      fill="#FF2E54"
      stroke="#F5B041"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="27" cy="16.5" r="1.4" fill="#FEF08A" />
  </svg>
);

/** Bengal Tiger Seal Vector Crest */
export const TigerSealSVG: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="21" fill="#0B1F3A" stroke="#F5B041" strokeWidth="2" />
    <circle cx="24" cy="24" r="17" stroke="#38BDF8" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="3 2" />
    <path
      d="M15 20L18 13L24 16L30 13L33 20C34 27 30 33 24 35C18 33 14 27 15 20Z"
      fill="#F59E0B"
      stroke="#FEF08A"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M18 22L21 24M30 22L27 24M24 26V31" stroke="#0B1F3A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
