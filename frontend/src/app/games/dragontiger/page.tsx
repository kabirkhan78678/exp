"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Swords, ShieldCheck, RefreshCw, Trophy, 
  Sparkles, History, HelpCircle, CheckCircle2,
  Volume2, VolumeX, Flame, Zap
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { GoldRupeeCoin } from '@/components/GameArtwork';

export default function DragonTigerPage() {
  const { 
    isAuthenticated, activeBalanceType, balances, 
    fetchBalances, openModal, showNotification 
  } = useStore();

  const [selectedBet, setSelectedBet] = useState<'DRAGON' | 'TIGER' | 'TIE'>('DRAGON');
  const [chipAmount, setChipAmount] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [history, setHistory] = useState<string[]>(['DRAGON', 'TIGER', 'DRAGON', 'DRAGON', 'TIE', 'TIGER', 'DRAGON', 'DRAGON', 'TIGER', 'TIE']);

  const chips = [
    { value: 10, color: 'from-amber-600 to-amber-800', border: 'border-amber-400' },
    { value: 50, color: 'from-blue-600 to-blue-800', border: 'border-blue-400' },
    { value: 100, color: 'from-emerald-600 to-emerald-800', border: 'border-emerald-400' },
    { value: 500, color: 'from-purple-600 to-purple-800', border: 'border-purple-400' },
    { value: 1000, color: 'from-rose-600 to-rose-800', border: 'border-rose-400' },
    { value: 5000, color: 'from-amber-400 to-yellow-600', border: 'border-yellow-200' },
  ];

  const handlePlay = async () => {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    setIsPlaying(true);
    setLastResult(null);

    try {
      const res = await api.playDragonTiger(chipAmount, selectedBet, activeBalanceType);
      
      // Dramatic reveal suspension for 1.1s
      setTimeout(async () => {
        setLastResult(res);
        setHistory((prev) => [res.result.winner, ...prev.slice(0, 19)]);
        await fetchBalances();
        setIsPlaying(false);

        if (res.won) {
          confetti({ particleCount: 75, spread: 65, origin: { y: 0.62 } });
          showNotification(`VICTORY! Won ₹${parseFloat(res.payout).toFixed(2)} on ${res.bet_choice}!`, 'success');
        } else {
          showNotification(`${res.result.winner} won this round. Better luck next deal!`, 'info');
        }
      }, 1100);

    } catch (err: any) {
      setIsPlaying(false);
      showNotification(err.message || 'Deal failed', 'error');
    }
  };

  const formatCardRank = (rank: number) => {
    switch (rank) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return rank.toString();
    }
  };

  // Calculate live roadmap win ratios
  const dragonWins = history.filter(h => h === 'DRAGON').length;
  const tigerWins = history.filter(h => h === 'TIGER').length;
  const tieWins = history.filter(h => h === 'TIE').length;
  const dragonPct = Math.round((dragonWins / history.length) * 100) || 50;
  const tigerPct = 100 - dragonPct;

  return (
    <div className="space-y-4 px-2.5 xs:px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-28 w-full max-w-full overflow-x-hidden">
      {/* Top Header & VIP Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 xs:p-4 rounded-2xl bg-[#0D1214] border border-[#1E262A] shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5B041]/20 to-transparent border border-[#F5B041]/40 flex items-center justify-center text-[#F5B041] shadow-glowGold shrink-0">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm xs:text-base font-black text-white font-display">Dragon Tiger Live Salon</h1>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#47EC84]/15 text-[#47EC84] border border-[#47EC84]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#47EC84] animate-ping" />
                TABLE #DT-01
              </span>
            </div>
            <p className="text-[10px] xs:text-xs text-zinc-400">High Stakes VIP • Dragon 1:1 • Tiger 1:1 • Tie 8:1</p>
          </div>
        </div>

        {/* Live History Roadmap (Macau Bead Plate) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase shrink-0 mr-1">
            <History className="w-3.5 h-3.5 text-[#F5B041]" />
            <span>BEADS:</span>
          </div>
          {history.map((winner, idx) => {
            const isDragon = winner === 'DRAGON';
            const isTiger = winner === 'TIGER';
            const isTie = winner === 'TIE';
            return (
              <span
                key={idx}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-black border shrink-0 transition-transform hover:scale-110 ${
                  isDragon
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                    : isTiger
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                    : 'bg-[#F5B041]/20 text-[#F5B041] border-[#F5B041]/50 shadow-[0_0_8px_rgba(245,176,65,0.4)]'
                }`}
              >
                {winner[0]}
              </span>
            );
          })}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl bg-black/40 border border-[#1E262A] text-zinc-400 hover:text-white transition shrink-0 ml-1"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#47EC84]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Casino Table Felt Surface */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#09100D] via-[#070D0B] to-[#040607] border-2 border-[#1E3024] p-4 xs:p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Felt gold trim radial ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-[#47EC84]/8 blur-3xl pointer-events-none" />
        <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#F5B041]/25 to-transparent pointer-events-none" />

        {/* Center Table Crest */}
        <div className="flex items-center justify-center gap-3 text-center mb-6">
          <div className="h-[1px] w-16 sm:w-28 bg-gradient-to-r from-transparent to-[#F5B041]/40" />
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[#F5B041]/30">
            <Zap className="w-3.5 h-3.5 text-[#F5B041]" />
            <span className="text-[11px] font-black text-[#F5B041] tracking-wider uppercase">DEALER TABLE</span>
          </div>
          <div className="h-[1px] w-16 sm:w-28 bg-gradient-to-l from-transparent to-[#F5B041]/40" />
        </div>

        {/* Card Battle Center Stage */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 max-w-xl mx-auto my-3 xs:my-6 relative">
          {/* Dragon Card Box */}
          <div className={`p-4 sm:p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[190px] sm:min-h-[240px] relative ${
            lastResult?.result?.winner === 'DRAGON'
              ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.4)] scale-102'
              : 'bg-black/50 border-rose-900/40'
          }`}>
            <div className="flex items-center gap-1.5 text-rose-400 font-display font-black text-xs sm:text-sm tracking-widest uppercase mb-3">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>DRAGON</span>
            </div>

            {lastResult ? (
              <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-2xl bg-gradient-to-b from-white via-zinc-50 to-zinc-200 text-slate-950 flex flex-col items-center justify-between p-2.5 shadow-2xl animate-scale-up font-bold border border-zinc-300">
                <span className="text-sm sm:text-base self-start leading-none font-mono">{formatCardRank(lastResult.result.dragon.rank)}</span>
                <span className={`text-3xl sm:text-5xl ${['♥', '♦'].includes(lastResult.result.dragon.suit) ? 'text-red-600' : 'text-slate-950'}`}>
                  {lastResult.result.dragon.suit}
                </span>
                <span className="text-sm sm:text-base self-end leading-none font-mono">{formatCardRank(lastResult.result.dragon.rank)}</span>
              </div>
            ) : isPlaying ? (
              <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-2xl bg-zinc-900/80 border border-rose-500/40 animate-pulse flex flex-col items-center justify-center gap-2 text-xs text-rose-300 font-mono shadow-inner">
                <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
                <span className="text-[10px]">Dealing...</span>
              </div>
            ) : (
              <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-2xl border-2 border-dashed border-rose-900/50 bg-rose-950/10 flex flex-col items-center justify-center gap-1 text-rose-400/40 font-bold">
                <span className="text-3xl">🂠</span>
                <span className="text-[9px] font-mono tracking-widest">DRAGON</span>
              </div>
            )}
          </div>

          {/* VS Spark in Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black border border-[#F5B041]/60 flex items-center justify-center text-[11px] font-black text-[#F5B041] shadow-glowGold pointer-events-none">
            VS
          </div>

          {/* Tiger Card Box */}
          <div className={`p-4 sm:p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[190px] sm:min-h-[240px] relative ${
            lastResult?.result?.winner === 'TIGER'
              ? 'bg-sky-950/40 border-sky-500 shadow-[0_0_35px_rgba(56,189,248,0.4)] scale-102'
              : 'bg-black/50 border-sky-900/40'
          }`}>
            <div className="flex items-center gap-1.5 text-sky-400 font-display font-black text-xs sm:text-sm tracking-widest uppercase mb-3">
              <Zap className="w-4 h-4 text-sky-400" />
              <span>TIGER</span>
            </div>

            {lastResult ? (
              <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-2xl bg-gradient-to-b from-white via-zinc-50 to-zinc-200 text-slate-950 flex flex-col items-center justify-between p-2.5 shadow-2xl animate-scale-up font-bold border border-zinc-300">
                <span className="text-sm sm:text-base self-start leading-none font-mono">{formatCardRank(lastResult.result.tiger.rank)}</span>
                <span className={`text-3xl sm:text-5xl ${['♥', '♦'].includes(lastResult.result.tiger.suit) ? 'text-red-600' : 'text-slate-950'}`}>
                  {lastResult.result.tiger.suit}
                </span>
                <span className="text-sm sm:text-base self-end leading-none font-mono">{formatCardRank(lastResult.result.tiger.rank)}</span>
              </div>
            ) : isPlaying ? (
              <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-2xl bg-zinc-900/80 border border-sky-500/40 animate-pulse flex flex-col items-center justify-center gap-2 text-xs text-sky-300 font-mono shadow-inner">
                <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
                <span className="text-[10px]">Dealing...</span>
              </div>
            ) : (
              <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-2xl border-2 border-dashed border-sky-900/50 bg-sky-950/10 flex flex-col items-center justify-center gap-1 text-sky-400/40 font-bold">
                <span className="text-3xl">🂠</span>
                <span className="text-[9px] font-mono tracking-widest">TIGER</span>
              </div>
            )}
          </div>
        </div>

        {/* 3 Betting Sectors (Dragon, Tie, Tiger) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-xl mx-auto pt-4">
          <button
            type="button"
            onClick={() => setSelectedBet('DRAGON')}
            className={`p-3 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative overflow-hidden group ${
              selectedBet === 'DRAGON'
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.35)] scale-102'
                : 'bg-black/40 border-rose-900/40 text-zinc-400 hover:border-rose-500/60'
            }`}
          >
            <span className="text-xs sm:text-sm font-black font-display uppercase tracking-wider text-rose-400">DRAGON</span>
            <span className="text-[10px] font-mono font-bold text-rose-300/80 mt-0.5">PAYS 1:1</span>
            {selectedBet === 'DRAGON' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedBet('TIE')}
            className={`p-3 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative overflow-hidden group ${
              selectedBet === 'TIE'
                ? 'bg-[#F5B041]/20 border-[#F5B041] text-[#F5B041] shadow-glowGold scale-102'
                : 'bg-black/40 border-[#F5B041]/30 text-zinc-400 hover:border-[#F5B041]/60'
            }`}
          >
            <span className="text-xs sm:text-sm font-black font-display uppercase tracking-wider text-[#F5B041]">TIE</span>
            <span className="text-[10px] font-mono font-bold text-[#F5B041] mt-0.5">PAYS 8:1</span>
            {selectedBet === 'TIE' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#F5B041] rounded-full animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedBet('TIGER')}
            className={`p-3 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative overflow-hidden group ${
              selectedBet === 'TIGER'
                ? 'bg-sky-950/60 border-sky-500 text-sky-300 shadow-[0_0_25px_rgba(56,189,248,0.35)] scale-102'
                : 'bg-black/40 border-sky-900/40 text-zinc-400 hover:border-sky-500/60'
            }`}
          >
            <span className="text-xs sm:text-sm font-black font-display uppercase tracking-wider text-sky-400">TIGER</span>
            <span className="text-[10px] font-mono font-bold text-sky-300/80 mt-0.5">PAYS 1:1</span>
            {selectedBet === 'TIGER' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-sky-500 rounded-full animate-ping" />
            )}
          </button>
        </div>

        {/* Win Ratio Bar */}
        <div className="max-w-xl mx-auto mt-6 pt-4 border-t border-[#1E3024] flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <span>Dragon: {dragonPct}%</span>
          </div>
          <div className="flex-1 mx-4 h-1.5 bg-black/60 rounded-full overflow-hidden flex border border-[#1E3024]">
            <div className="bg-rose-500 h-full" style={{ width: `${dragonPct}%` }} />
            <div className="bg-sky-500 h-full" style={{ width: `${tigerPct}%` }} />
          </div>
          <div className="flex items-center gap-1.5 text-sky-400 font-bold">
            <span>Tiger: {tigerPct}%</span>
          </div>
        </div>
      </div>

      {/* Tactile 3D Chip Selector & Deal Action Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#0D1214] border border-[#1E262A] shadow-card flex flex-col lg:flex-row items-center justify-between gap-5">
        {/* Chips Deck */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full lg:w-auto scrollbar-none justify-start sm:justify-center">
          <span className="text-xs text-zinc-400 font-bold font-display uppercase tracking-wider mr-2 shrink-0">CHIP:</span>
          {chips.map((chip) => {
            const isSelected = chipAmount === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => setChipAmount(chip.value)}
                className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-mono font-black transition-all shrink-0 relative ${chip.border} border-2 ${
                  isSelected
                    ? 'scale-115 shadow-[0_0_18px_rgba(245,176,65,0.6)] ring-2 ring-[#F5B041] -translate-y-1'
                    : 'opacity-75 hover:opacity-100 hover:scale-105'
                } bg-gradient-to-b ${chip.color} text-white shadow-lg`}
              >
                <span className="text-[10px] leading-none">₹{chip.value}</span>
              </button>
            );
          })}
        </div>

        {/* Action Deal Button */}
        <div className="w-full lg:w-auto flex items-center gap-3">
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className="w-full sm:w-auto min-w-[220px] px-8 py-3.5 btn-gold-3d text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 transition active:scale-95 disabled:opacity-50"
          >
            {isPlaying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Dealing Hand...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>BET {selectedBet} (₹{chipAmount})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
