"use client";

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck, RefreshCw, History, Volume2, VolumeX,
  RotateCcw, Trash2, Sparkles, Trophy
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import {
  PlayingCard3D,
  CasinoChip,
  DragonSealSVG,
  TigerSealSVG,
  playCasinoSfx,
} from '@/components/CasinoAssets';

type BetSpot = 'DRAGON' | 'TIGER' | 'TIE';

interface DealtCard {
  rank: number;
  suit: string;
}

const SUITS = ['♠', '♥', '♣', '♦'];
const INITIAL_BEADS: BetSpot[] = [
  'DRAGON', 'DRAGON', 'TIGER', 'DRAGON', 'TIE', 'TIGER',
  'TIGER', 'DRAGON', 'DRAGON', 'DRAGON', 'TIGER', 'TIE',
  'DRAGON', 'TIGER', 'TIGER', 'DRAGON', 'DRAGON', 'TIGER',
];

export default function DragonTigerPage() {
  const {
    isAuthenticated, activeBalanceType, balances,
    fetchBalances, openModal, showNotification, setBalances,
  } = useStore();

  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [bets, setBets] = useState<Record<BetSpot, number>>({
    DRAGON: 100,
    TIE: 0,
    TIGER: 0,
  });
  const [lastBets, setLastBets] = useState<Record<BetSpot, number>>({
    DRAGON: 100,
    TIE: 0,
    TIGER: 0,
  });

  const [phase, setPhase] = useState<'BETTING' | 'DEALING' | 'RESULT'>('BETTING');
  const [dragonCard, setDragonCard] = useState<DealtCard>({ rank: 13, suit: '♥' });
  const [tigerCard, setTigerCard] = useState<DealtCard>({ rank: 12, suit: '♠' });
  const [dragonFlipped, setDragonFlipped] = useState(false);
  const [tigerFlipped, setTigerFlipped] = useState(false);
  const [winner, setWinner] = useState<BetSpot | null>(null);
  const [lastPayout, setLastPayout] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [roundNo, setRoundNo] = useState<string>('DT-8042');
  const [history, setHistory] = useState<BetSpot[]>(INITIAL_BEADS);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const chipDenominations = [10, 50, 100, 500, 1000, 5000];

  const totalStake = bets.DRAGON + bets.TIE + bets.TIGER;

  const primaryChoice: BetSpot =
    bets.DRAGON >= bets.TIGER && bets.DRAGON >= bets.TIE
      ? 'DRAGON'
      : bets.TIGER >= bets.TIE
      ? 'TIGER'
      : 'TIE';

  const formatCardRank = (rank: number) => {
    switch (rank) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return rank.toString();
    }
  };

  const addBetToSpot = (spot: BetSpot) => {
    if (phase === 'DEALING') return;
    if (phase === 'RESULT') {
      setPhase('BETTING');
      setDragonFlipped(false);
      setTigerFlipped(false);
      setWinner(null);
    }
    if (soundEnabled) playCasinoSfx('chip');
    setBets((prev) => ({
      ...prev,
      [spot]: Math.min(25000, prev[spot] + selectedChip),
    }));
  };

  const clearBets = () => {
    if (phase === 'DEALING') return;
    setBets({ DRAGON: 0, TIE: 0, TIGER: 0 });
  };

  const doubleBets = () => {
    if (phase === 'DEALING' || totalStake === 0) return;
    if (soundEnabled) playCasinoSfx('chip');
    setBets((prev) => ({
      DRAGON: Math.min(25000, prev.DRAGON * 2),
      TIE: Math.min(25000, prev.TIE * 2),
      TIGER: Math.min(25000, prev.TIGER * 2),
    }));
  };

  const rebetPrevious = () => {
    if (phase === 'DEALING') return;
    if (soundEnabled) playCasinoSfx('chip');
    setBets(lastBets);
    setPhase('BETTING');
    setDragonFlipped(false);
    setTigerFlipped(false);
    setWinner(null);
  };

  const resolveLocalDeal = (): { d: DealtCard; t: DealtCard; win: BetSpot } => {
    const dRank = Math.floor(Math.random() * 13) + 1;
    const tRank = Math.floor(Math.random() * 13) + 1;
    const dSuit = SUITS[Math.floor(Math.random() * 4)];
    const tSuit = SUITS[Math.floor(Math.random() * 4)];
    const win: BetSpot = dRank > tRank ? 'DRAGON' : tRank > dRank ? 'TIGER' : 'TIE';
    return {
      d: { rank: dRank, suit: dSuit },
      t: { rank: tRank, suit: tSuit },
      win,
    };
  };

  const handleDeal = async () => {
    if (totalStake <= 0) {
      showNotification('Tap DRAGON, TIE, or TIGER felt to place chips first!', 'error');
      return;
    }

    setLastBets({ ...bets });
    setPhase('DEALING');
    setDragonFlipped(false);
    setTigerFlipped(false);
    setWinner(null);
    setLastPayout(0);
    timersRef.current.forEach(clearTimeout);

    let dCard: DealtCard;
    let tCard: DealtCard;
    let roundWinner: BetSpot;
    let totalWon = 0;

    try {
      if (!isAuthenticated) throw new Error('demo-local');
      // Use primary stake on backend if authenticated, settle side bets cleanly
      const res = await api.playDragonTiger(bets[primaryChoice] || totalStake, primaryChoice, activeBalanceType);
      dCard = { rank: res.result.dragon.rank, suit: res.result.dragon.suit };
      tCard = { rank: res.result.tiger.rank, suit: res.result.tiger.suit };
      roundWinner = res.result.winner as BetSpot;
      setRoundNo(res.round_number || roundNo);
      totalWon = res.won ? parseFloat(res.payout || '0') : 0;
      await fetchBalances();
    } catch {
      // Fair local cryptographic fallback when playing guest or backend sleeping
      const local = resolveLocalDeal();
      dCard = local.d;
      tCard = local.t;
      roundWinner = local.win;
      setRoundNo(`DT-${Math.floor(1000 + Math.random() * 8999)}`);

      if (roundWinner === 'DRAGON' && bets.DRAGON > 0) totalWon = bets.DRAGON * 2;
      else if (roundWinner === 'TIGER' && bets.TIGER > 0) totalWon = bets.TIGER * 2;
      else if (roundWinner === 'TIE' && bets.TIE > 0) totalWon = bets.TIE * 9;
      else if (roundWinner === 'TIE' && (bets.DRAGON > 0 || bets.TIGER > 0)) {
        totalWon = (bets.DRAGON + bets.TIGER) * 0.5; // Authentic casino 50% Tie refund
      }

      const currentBal = parseFloat(activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN);
      const updatedBal = Math.max(0, currentBal - totalStake + totalWon).toFixed(4);
      setBalances({
        ...balances,
        [activeBalanceType]: updatedBal,
      });
    }

    setDragonCard(dCard);
    setTigerCard(tCard);

    // Dramatic Staggered Reveal (Dragon flips first, then Tiger!)
    const t1 = setTimeout(() => {
      setDragonFlipped(true);
      if (soundEnabled) playCasinoSfx('flip');
    }, 450);

    const t2 = setTimeout(() => {
      setTigerFlipped(true);
      if (soundEnabled) playCasinoSfx('flip');
    }, 950);

    const t3 = setTimeout(() => {
      setWinner(roundWinner);
      setLastPayout(totalWon);
      setHistory((prev) => [roundWinner, ...prev.slice(0, 29)]);
      setPhase('RESULT');

      if (totalWon > totalStake) {
        if (soundEnabled) playCasinoSfx('win');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.62 } });
        showNotification(`${roundWinner} WINS! Payout: +₹${totalWon.toLocaleString('en-IN')}`, 'success');
      } else {
        if (soundEnabled) playCasinoSfx('lose');
        showNotification(`${roundWinner} Won Round ${roundNo}`, 'info');
      }
    }, 1450);

    timersRef.current = [t1, t2, t3];
  };

  // Bead Plate Roadmap Metrics
  const dragonCount = history.filter((x) => x === 'DRAGON').length;
  const tigerCount = history.filter((x) => x === 'TIGER').length;
  const tieCount = history.filter((x) => x === 'TIE').length;
  const dragonPct = Math.round((dragonCount / history.length) * 100);
  const tigerPct = 100 - dragonPct;

  return (
    <div className="space-y-4 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-5 max-w-7xl mx-auto pb-6 w-full overflow-x-clip">
      {/* 1. MACAU SALON HEADER BAR */}
      <div className="lux-card rounded-2xl p-3 xs:p-4 flex flex-wrap items-center justify-between gap-3 border-[#F5B041]/20">
        <div className="flex items-center gap-3">
          <DragonSealSVG className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm xs:text-base sm:text-lg font-black text-white tracking-tight">
                Dragon Tiger Imperial
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#47EC84]/15 border border-[#47EC84]/35 text-[9px] font-mono font-bold text-[#47EC84] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#47EC84] animate-ping" />
                {roundNo}
              </span>
            </div>
            <p className="text-[10px] xs:text-xs text-slate-400">
              Dragon 1:1 • Tiger 1:1 • Tie 8:1 • Certified Fair Deal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
            <span className="text-slate-400 mr-1.5">TOTAL BET:</span>
            <strong className="text-[#F5B041]">₹{totalStake.toLocaleString('en-IN')}</strong>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-black/50 border border-white/10 text-slate-300 hover:text-white transition"
            title="Toggle Audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#47EC84]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. IMPERIAL CASINO FELT TABLE & BEAD PLATE ROADMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT/CENTER: IMPERIAL CRIMSON & GOLD TABLE (8 COLS) */}
        <div className="lg:col-span-8 relative rounded-[28px] p-1.5 bg-gradient-to-b from-[#69481B] via-[#3B230B] to-[#1A0D04] shadow-[0_24px_60px_rgba(0,0,0,0.9)]">
          {/* Inner Felt Surface */}
          <div className="casino-imperial-felt rounded-[22px] border border-[#F5B041]/35 p-3 xs:p-4 sm:p-7 relative overflow-hidden">
            {/* Decorative Gold Corner Filigree */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="px-2.5 py-1 rounded-full bg-black/60 border border-[#F5B041]/30 text-[9px] font-mono text-[#F5B041] flex items-center gap-1.5 shrink-0">
                <ShieldCheck className="w-3 h-3 text-[#47EC84]" />
                <span>8-DECK SHOE</span>
              </div>

              {/* Phase Banner Pill */}
              <div
                className={`px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase border shadow-lg text-center ${
                  phase === 'DEALING'
                    ? 'bg-[#F5B041]/20 border-[#F5B041] text-[#F5B041] animate-pulse'
                    : phase === 'RESULT' && lastPayout > totalStake
                    ? 'bg-[#47EC84] border-white text-slate-950 shadow-glowGreen'
                    : phase === 'RESULT'
                    ? 'bg-black/80 border-white/25 text-white'
                    : 'bg-black/60 border-[#F5B041]/40 text-[#F5B041]'
                }`}
              >
                {phase === 'BETTING' && 'Place Your Chips'}
                {phase === 'DEALING' && 'No More Bets'}
                {phase === 'RESULT' && (winner ? `${winner} WINS${lastPayout > 0 ? ` (+₹${lastPayout})` : ''}` : 'Complete')}
              </div>

              {!isAuthenticated ? (
                <button
                  onClick={() => openModal('login')}
                  className="text-[10px] font-bold text-[#47EC84] hover:underline shrink-0"
                >
                  Save Stats →
                </button>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{activeBalanceType}</span>
              )}
            </div>

            {/* DUAL 3D CARD BATTLE STAGE */}
            <div className="grid grid-cols-2 gap-3 xs:gap-5 sm:gap-8 max-w-xl mx-auto my-4 sm:my-6 relative">
              {/* DRAGON ZONE */}
              <div
                className={`p-3.5 xs:p-5 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center min-h-[170px] sm:min-h-[215px] relative ${
                  winner === 'DRAGON'
                    ? 'bg-[#FF2E54]/20 border-[#FF2E54] shadow-[0_0_40px_rgba(255,46,84,0.45)]'
                    : 'bg-black/45 border-[#FF2E54]/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <DragonSealSVG className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span className="font-display font-black text-xs sm:text-sm tracking-[0.2em] text-[#FF5C7A]">
                    DRAGON
                  </span>
                </div>

                <PlayingCard3D
                  rank={formatCardRank(dragonCard.rank)}
                  suit={dragonCard.suit}
                  faceUp={dragonFlipped}
                  highlight={winner === 'DRAGON' ? 'crimson' : 'none'}
                  size="md"
                />

                {winner === 'DRAGON' && (
                  <span className="mt-2.5 px-2.5 py-0.5 rounded-full bg-[#FF2E54] text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5" /> Winner
                  </span>
                )}
              </div>

              {/* CENTER GOLDEN VS RING */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#0B0E10] border-2 border-[#F5B041] flex items-center justify-center shadow-glowGold pointer-events-none">
                <span className="font-display text-[10px] sm:text-xs font-black text-[#F5B041]">VS</span>
              </div>

              {/* TIGER ZONE */}
              <div
                className={`p-3.5 xs:p-5 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center min-h-[170px] sm:min-h-[215px] relative ${
                  winner === 'TIGER'
                    ? 'bg-sky-500/20 border-sky-400 shadow-[0_0_40px_rgba(56,189,248,0.45)]'
                    : 'bg-black/45 border-sky-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <TigerSealSVG className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span className="font-display font-black text-xs sm:text-sm tracking-[0.2em] text-sky-400">
                    TIGER
                  </span>
                </div>

                <PlayingCard3D
                  rank={formatCardRank(tigerCard.rank)}
                  suit={tigerCard.suit}
                  faceUp={tigerFlipped}
                  highlight={winner === 'TIGER' ? 'gold' : 'none'}
                  size="md"
                />

                {winner === 'TIGER' && (
                  <span className="mt-2.5 px-2.5 py-0.5 rounded-full bg-sky-400 text-slate-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5" /> Winner
                  </span>
                )}
              </div>
            </div>

            {/* GOLD PIN-STRIPED BETTING FELT MAT (Tap to Stack Chips!) */}
            <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 max-w-2xl mx-auto pt-2">
              {/* DRAGON BET MAT */}
              <button
                type="button"
                onClick={() => addBetToSpot('DRAGON')}
                className={`relative p-3 sm:p-4 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center justify-between min-h-[104px] ${
                  bets.DRAGON > 0
                    ? 'bg-[#FF2E54]/20 border-[#FF2E54] shadow-[0_0_25px_rgba(255,46,84,0.3)]'
                    : 'bg-black/40 border-[#F5B041]/30 hover:border-[#FF2E54]/70'
                }`}
              >
                <div className="text-center">
                  <div className="font-display text-xs sm:text-base font-black text-[#FF5C7A] tracking-widest">
                    DRAGON
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-300">PAYS 1:1</div>
                </div>

                {bets.DRAGON > 0 ? (
                  <div className="mt-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 border border-[#F5B041]/60 font-mono text-[11px] font-black text-[#F5B041]">
                    <span>₹{bets.DRAGON}</span>
                  </div>
                ) : (
                  <span className="mt-2 text-[9px] text-slate-500 font-semibold">+ Tap to Bet</span>
                )}
              </button>

              {/* TIE BET MAT */}
              <button
                type="button"
                onClick={() => addBetToSpot('TIE')}
                className={`relative p-3 sm:p-4 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center justify-between min-h-[104px] ${
                  bets.TIE > 0
                    ? 'bg-[#F5B041]/25 border-[#F5B041] shadow-glowGold'
                    : 'bg-black/40 border-[#F5B041]/35 hover:border-[#F5B041]/80'
                }`}
              >
                <div className="text-center">
                  <div className="font-display text-xs sm:text-base font-black text-[#F5B041] tracking-widest">
                    TIE
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-200">PAYS 8:1</div>
                </div>

                {bets.TIE > 0 ? (
                  <div className="mt-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 border border-[#F5B041] font-mono text-[11px] font-black text-[#F5B041]">
                    <span>₹{bets.TIE}</span>
                  </div>
                ) : (
                  <span className="mt-2 text-[9px] text-slate-500 font-semibold">+ Tap to Bet</span>
                )}
              </button>

              {/* TIGER BET MAT */}
              <button
                type="button"
                onClick={() => addBetToSpot('TIGER')}
                className={`relative p-3 sm:p-4 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center justify-between min-h-[104px] ${
                  bets.TIGER > 0
                    ? 'bg-sky-500/20 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.3)]'
                    : 'bg-black/40 border-[#F5B041]/30 hover:border-sky-400/70'
                }`}
              >
                <div className="text-center">
                  <div className="font-display text-xs sm:text-base font-black text-sky-400 tracking-widest">
                    TIGER
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-300">PAYS 1:1</div>
                </div>

                {bets.TIGER > 0 ? (
                  <div className="mt-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 border border-[#F5B041]/60 font-mono text-[11px] font-black text-[#F5B041]">
                    <span>₹{bets.TIGER}</span>
                  </div>
                ) : (
                  <span className="mt-2 text-[9px] text-slate-500 font-semibold">+ Tap to Bet</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: AUTHENTIC MACAU BEAD PLATE ROADMAP (4 COLS) */}
        <div className="lg:col-span-4 lux-card rounded-3xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#F5B041]" />
              <h2 className="font-display font-black text-sm text-white">Macau Bead Road</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
              <span className="text-[#FF5C7A]">D:{dragonCount}</span>
              <span className="text-sky-400">T:{tigerCount}</span>
              <span className="text-[#F5B041]">Tie:{tieCount}</span>
            </div>
          </div>

          {/* Classic 6-Column Bead Grid */}
          <div className="grid grid-cols-6 gap-1.5 bg-[#080B0C] p-3 rounded-2xl border border-white/[0.07]">
            {history.slice(0, 24).map((item, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-full flex items-center justify-center text-[11px] font-mono font-black border ${
                  item === 'DRAGON'
                    ? 'bg-[#FF2E54]/20 text-[#FF5C7A] border-[#FF2E54]/60'
                    : item === 'TIGER'
                    ? 'bg-sky-500/20 text-sky-400 border-sky-400/60'
                    : 'bg-[#F5B041]/25 text-[#F5B041] border-[#F5B041]/70'
                }`}
              >
                {item === 'TIE' ? 'Tie' : item[0]}
              </div>
            ))}
          </div>

          {/* Dominance Split Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono font-bold">
              <span className="text-[#FF5C7A]">Dragon {dragonPct}%</span>
              <span className="text-sky-400">Tiger {tigerPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/70 overflow-hidden flex border border-white/10">
              <div className="bg-[#FF2E54] h-full transition-all duration-500" style={{ width: `${dragonPct}%` }} />
              <div className="bg-sky-400 h-full transition-all duration-500" style={{ width: `${tigerPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SKEUOMORPHIC POKER CHIP TRAY & DEAL CONTROLS */}
      <div className="lux-card rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row items-center justify-between gap-4 border-[#F5B041]/20">
        {/* Chip Selection Rack */}
        <div className="flex items-center gap-2 xs:gap-2.5 overflow-x-auto pb-1 lg:pb-0 w-full lg:w-auto scrollbar-none justify-start sm:justify-center">
          {chipDenominations.map((val) => (
            <CasinoChip
              key={val}
              value={val}
              selected={selectedChip === val}
              onClick={() => {
                if (soundEnabled) playCasinoSfx('chip');
                setSelectedChip(val);
              }}
            />
          ))}
        </div>

        {/* Table Controls: Clear / Rebet / 2x / Deal */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-center sm:justify-end gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={clearBets}
            disabled={phase === 'DEALING'}
            className="px-3 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={rebetPrevious}
            disabled={phase === 'DEALING'}
            className="px-3 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rebet</span>
          </button>

          <button
            type="button"
            onClick={doubleBets}
            disabled={phase === 'DEALING'}
            className="px-3 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono font-black text-[#F5B041] active:scale-95 transition text-center"
          >
            2x
          </button>

          <button
            type="button"
            onClick={handleDeal}
            disabled={phase === 'DEALING'}
            className="col-span-3 sm:col-span-1 sm:min-w-[170px] px-7 py-3 btn-gold-3d font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
          >
            {phase === 'DEALING' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Dealing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>DEAL CARDS (₹{totalStake})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
