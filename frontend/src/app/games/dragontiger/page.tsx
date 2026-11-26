"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Swords, ShieldCheck, RefreshCw, Trophy, 
  Sparkles, History, HelpCircle, CheckCircle2 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

export default function DragonTigerPage() {
  const { 
    isAuthenticated, activeBalanceType, balances, 
    fetchBalances, openModal, showNotification 
  } = useStore();

  const [selectedBet, setSelectedBet] = useState<'DRAGON' | 'TIGER' | 'TIE'>('DRAGON');
  const [chipAmount, setChipAmount] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [history, setHistory] = useState<string[]>(['DRAGON', 'TIGER', 'DRAGON', 'DRAGON', 'TIE', 'TIGER', 'DRAGON']);

  const chips = [10, 50, 100, 500, 1000];

  const handlePlay = async () => {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    setIsPlaying(true);
    setLastResult(null);

    try {
      const res = await api.playDragonTiger(chipAmount, selectedBet, activeBalanceType);
      
      // Simulate dealing suspension for 1.2s for card animation
      setTimeout(async () => {
        setLastResult(res);
        setHistory((prev) => [res.result.winner, ...prev.slice(0, 19)]);
        await fetchBalances();
        setIsPlaying(false);

        if (res.won) {
          confetti({ particleCount: 60, spread: 55, origin: { y: 0.65 } });
          showNotification(`You Won ₹${parseFloat(res.payout).toFixed(2)} on ${res.bet_choice}!`, 'success');
        } else {
          showNotification(`${res.result.winner} Won. Better luck next deal!`, 'info');
        }
      }, 1200);

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

  return (
    <div className="space-y-3 xs:space-y-4 sm:space-y-6 px-2.5 xs:px-3 sm:px-6 lg:px-8 py-2.5 xs:py-3 sm:py-6 max-w-7xl mx-auto pb-28 w-full max-w-full overflow-x-hidden">
      {/* Top Header & History Roadmap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 xs:p-4 rounded-2xl bg-aurora-surface border border-aurora-border">
        <div className="flex items-center gap-2.5 xs:gap-3">
          <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-xl bg-aurora-elevated border border-aurora-gold/30 flex items-center justify-center text-aurora-gold shrink-0">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm xs:text-base font-black text-aurora-text">Dragon Tiger Live</h1>
            <p className="text-[10px] xs:text-xs text-aurora-muted">Speed Table • Dragon 1:1 • Tiger 1:1 • Tie 8:1</p>
          </div>
        </div>

        {/* Road Map Beads */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[10px] text-aurora-muted uppercase font-bold mr-1 shrink-0">Roadmap:</span>
          {history.map((winner, idx) => (
            <span
              key={idx}
              className={`w-5 h-5 xs:w-6 xs:h-6 rounded-full flex items-center justify-center text-[9px] xs:text-[10px] font-bold font-mono border shrink-0 ${
                winner === 'DRAGON'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : winner === 'TIGER'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : 'bg-aurora-gold/20 text-aurora-gold border-aurora-gold/40'
              }`}
            >
              {winner[0]}
            </span>
          ))}
        </div>
      </div>

      {/* Casino Table Felt Surface */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0e1628] to-[#090e1c] border-2 border-aurora-border p-3.5 xs:p-6 sm:p-10 shadow-card overflow-hidden">
        {/* Decorative table felt markings */}
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-aurora-border/40 to-transparent pointer-events-none" />

        {/* Card Battle Center Stage */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-xl mx-auto my-3 xs:my-6">
          {/* Dragon Card Box */}
          <div className={`p-3 xs:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all flex flex-col items-center justify-center min-h-[160px] xs:min-h-[220px] ${
            lastResult?.result?.winner === 'DRAGON'
              ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
              : 'bg-aurora-surface/70 border-aurora-border/60'
          }`}>
            <span className="text-[10px] xs:text-xs font-black tracking-widest text-rose-400 uppercase mb-2 xs:mb-3">
              DRAGON
            </span>
            {lastResult ? (
              <div className="w-16 h-22 xs:w-20 xs:h-28 rounded-xl xs:rounded-2xl bg-white text-slate-950 flex flex-col items-center justify-between p-1.5 xs:p-2 shadow-2xl animate-scale-up font-bold">
                <span className="text-xs xs:text-sm self-start leading-none">{formatCardRank(lastResult.result.dragon.rank)}</span>
                <span className={`text-2xl xs:text-3xl ${['♥', '♦'].includes(lastResult.result.dragon.suit) ? 'text-red-600' : 'text-slate-950'}`}>
                  {lastResult.result.dragon.suit}
                </span>
                <span className="text-xs xs:text-sm self-end leading-none">{formatCardRank(lastResult.result.dragon.rank)}</span>
              </div>
            ) : isPlaying ? (
              <div className="w-16 h-22 xs:w-20 xs:h-28 rounded-xl xs:rounded-2xl bg-aurora-elevated border border-aurora-border animate-pulse flex items-center justify-center text-xs text-aurora-muted font-mono">
                Dealing...
              </div>
            ) : (
              <div className="w-16 h-22 xs:w-20 xs:h-28 rounded-xl xs:rounded-2xl border-2 border-dashed border-aurora-border/60 flex items-center justify-center text-xl xs:text-2xl text-aurora-muted/40 font-bold">
                🂠
              </div>
            )}
          </div>

          {/* Tiger Card Box */}
          <div className={`p-3 xs:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all flex flex-col items-center justify-center min-h-[160px] xs:min-h-[220px] ${
            lastResult?.result?.winner === 'TIGER'
              ? 'bg-blue-950/40 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
              : 'bg-aurora-surface/70 border-aurora-border/60'
          }`}>
            <span className="text-[10px] xs:text-xs font-black tracking-widest text-blue-400 uppercase mb-2 xs:mb-3">
              TIGER
            </span>
            {lastResult ? (
              <div className="w-16 h-22 xs:w-20 xs:h-28 rounded-xl xs:rounded-2xl bg-white text-slate-950 flex flex-col items-center justify-between p-1.5 xs:p-2 shadow-2xl animate-scale-up font-bold">
                <span className="text-xs xs:text-sm self-start leading-none">{formatCardRank(lastResult.result.tiger.rank)}</span>
                <span className={`text-2xl xs:text-3xl ${['♥', '♦'].includes(lastResult.result.tiger.suit) ? 'text-red-600' : 'text-slate-950'}`}>
                  {lastResult.result.tiger.suit}
                </span>
                <span className="text-xs xs:text-sm self-end leading-none">{formatCardRank(lastResult.result.tiger.rank)}</span>
              </div>
            ) : isPlaying ? (
              <div className="w-16 h-22 xs:w-20 xs:h-28 rounded-xl xs:rounded-2xl bg-aurora-elevated border border-aurora-border animate-pulse flex items-center justify-center text-xs text-aurora-muted font-mono">
                Dealing...
              </div>
            ) : (
              <div className="w-16 h-22 xs:w-20 xs:h-28 rounded-xl xs:rounded-2xl border-2 border-dashed border-aurora-border/60 flex items-center justify-center text-xl xs:text-2xl text-aurora-muted/40 font-bold">
                🂠
              </div>
            )}
          </div>
        </div>

        {/* Betting Spots */}
        <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto pt-4">
          <button
            type="button"
            onClick={() => setSelectedBet('DRAGON')}
            className={`p-4 rounded-2xl border-2 transition flex flex-col items-center justify-center ${
              selectedBet === 'DRAGON'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                : 'bg-aurora-surface/60 border-aurora-border text-aurora-muted hover:border-rose-500/50'
            }`}
          >
            <span className="text-xs font-black uppercase">DRAGON</span>
            <span className="text-[10px] opacity-75 mt-0.5">Pays 1:1</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedBet('TIE')}
            className={`p-4 rounded-2xl border-2 transition flex flex-col items-center justify-center ${
              selectedBet === 'TIE'
                ? 'bg-aurora-gold/20 border-aurora-gold text-aurora-gold shadow-glowGold'
                : 'bg-aurora-surface/60 border-aurora-border text-aurora-muted hover:border-aurora-gold/50'
            }`}
          >
            <span className="text-xs font-black uppercase">TIE</span>
            <span className="text-[10px] opacity-75 mt-0.5 font-bold text-aurora-gold">Pays 8:1</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedBet('TIGER')}
            className={`p-4 rounded-2xl border-2 transition flex flex-col items-center justify-center ${
              selectedBet === 'TIGER'
                ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                : 'bg-aurora-surface/60 border-aurora-border text-aurora-muted hover:border-blue-500/50'
            }`}
          >
            <span className="text-xs font-black uppercase">TIGER</span>
            <span className="text-[10px] opacity-75 mt-0.5">Pays 1:1</span>
          </button>
        </div>
      </div>

      {/* Chip Deck & Action Bar */}
      <div className="p-6 rounded-3xl bg-aurora-surface border border-aurora-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Chip Values */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-aurora-muted font-bold mr-1">CHIP:</span>
          {chips.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setChipAmount(val)}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold font-mono transition border-2 transform ${
                chipAmount === val
                  ? 'scale-110 border-aurora-gold bg-aurora-elevated text-aurora-gold shadow-glowGold'
                  : 'border-aurora-border bg-aurora-surface text-aurora-muted hover:border-aurora-cyan'
              }`}
            >
              ₹{val}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handlePlay}
          disabled={isPlaying}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-aurora-gold to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-glowGold hover:opacity-95 transition transform active:scale-95 disabled:opacity-50"
        >
          {isPlaying ? 'Dealing Hand...' : `Deal ${selectedBet} (₹${chipAmount})`}
        </button>
      </div>
    </div>
  );
}
