"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Layers, Users, Eye, EyeOff, ShieldCheck, 
  Plus, CheckCircle, Clock, ArrowRight, Trophy 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

export default function TeenPattiPage() {
  const { isAuthenticated, activeBalanceType, balances, fetchBalances, openModal, showNotification } = useStore();

  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isSeen, setIsSeen] = useState<boolean>(false);
  const [currentPot, setCurrentPot] = useState<number>(250);
  const [currentStake, setCurrentStake] = useState<number>(50);
  const [hasFolded, setHasFolded] = useState<boolean>(false);
  const [showdownWinner, setShowdownWinner] = useState<string | null>(null);

  // Sample player 3-card hand
  const [myCards] = useState([
    { rank: 'A', suit: '♠', color: 'text-slate-950', val: 14 },
    { rank: 'K', suit: '♠', color: 'text-slate-950', val: 13 },
    { rank: 'Q', suit: '♠', color: 'text-slate-950', val: 12 },
  ]);

  useEffect(() => {
    api.getTeenPattiRooms().then((res) => {
      setRooms(res.rooms);
      if (res.rooms.length > 0) setSelectedRoom(res.rooms[0]);
    }).catch(() => {});
  }, []);

  const handleChaal = () => {
    if (hasFolded) return;
    const amount = isSeen ? currentStake * 2 : currentStake;
    setCurrentPot((p) => p + amount);
    showNotification(`Chaal placed: ₹${amount}`, 'info');
  };

  const handlePack = () => {
    setHasFolded(true);
    showNotification('You folded (Pack). You are out of this hand.', 'error');
  };

  const handleShowdown = () => {
    if (hasFolded) return;
    setShowdownWinner('You (Pure Sequence A-K-Q ♠)');
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    showNotification(`Showdown Won! You took the pot of ₹${currentPot + 100}`, 'success');
  };

  return (
    <div className="space-y-3 xs:space-y-4 sm:space-y-6 px-2.5 xs:px-3 sm:px-6 lg:px-8 py-2.5 xs:py-3 sm:py-6 max-w-7xl mx-auto pb-28 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 xs:p-4 rounded-2xl bg-aurora-surface border border-aurora-border">
        <div className="flex items-center gap-2.5 xs:gap-3">
          <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-xl bg-aurora-elevated border border-aurora-purple/30 flex items-center justify-center text-aurora-purple shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm xs:text-base font-black text-aurora-text">Teen Patti Multiplayer</h1>
            <p className="text-[10px] xs:text-xs text-aurora-muted">Authentic 3-Card Indian Poker • Public & Private Tables</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 xs:gap-3">
          <div className="text-[11px] xs:text-xs text-aurora-muted">
            Table Pot: <strong className="text-aurora-gold font-mono font-bold text-xs xs:text-sm">₹{currentPot}</strong>
          </div>
          <span className="px-2 xs:px-2.5 py-0.5 xs:py-1 text-[10px] xs:text-[11px] font-bold rounded-full bg-aurora-purple/20 text-aurora-purple border border-aurora-purple/30 flex items-center gap-1.5 shrink-0">
            <Clock className="w-3 h-3" /> Turn: 15s
          </span>
        </div>
      </div>

      {/* Main Oval Poker Table */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#131b31] via-[#0c1222] to-[#080d1a] border-2 sm:border-4 border-[#1e2a47] p-4 sm:p-12 shadow-card min-h-[380px] sm:min-h-[420px] flex flex-col justify-between overflow-hidden">
        {/* Table Felt Inscription */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <span className="text-6xl sm:text-8xl font-black text-aurora-purple tracking-widest uppercase">
            VELTRIX
          </span>
        </div>

        {/* Top Opponent Seats */}
        <div className="flex justify-around items-center relative z-10">
          <div className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-aurora-elevated border border-aurora-border flex items-center justify-center text-xs font-bold text-aurora-text shadow-sm">
              P2
            </div>
            <span className="text-[10px] text-aurora-muted font-medium">Rajesh_K</span>
            <span className="text-[9px] font-mono text-aurora-cyan">Chaal ₹100</span>
          </div>

          {/* Table Center Pot Display */}
          <div className="text-center p-3 px-6 rounded-2xl bg-aurora-surface/90 border border-aurora-border shadow-glowGold backdrop-blur-md">
            <div className="text-[10px] text-aurora-gold uppercase tracking-wider font-bold">Total Pot</div>
            <div className="text-xl sm:text-2xl font-black text-aurora-gold font-mono">₹{currentPot}</div>
            {showdownWinner && (
              <div className="text-[11px] font-bold text-aurora-success mt-1">
                Winner: {showdownWinner}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-aurora-elevated border border-aurora-border flex items-center justify-center text-xs font-bold text-aurora-text shadow-sm">
              P3
            </div>
            <span className="text-[10px] text-aurora-muted font-medium">Vikas_99</span>
            <span className="text-[9px] font-mono text-aurora-gold">Blind ₹50</span>
          </div>
        </div>

        {/* Player's Own Cards Center Stage */}
        <div className="relative z-10 flex flex-col items-center my-6">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setIsSeen(!isSeen)}
              className="px-3 py-1 bg-aurora-elevated hover:bg-aurora-surface text-aurora-cyan border border-aurora-cyan/30 rounded-full text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {isSeen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isSeen ? 'Hide Cards' : 'See Cards (Open)'}</span>
            </button>
          </div>

          <div className="flex items-center -space-x-4">
            {myCards.map((c, i) => (
              <div
                key={i}
                className={`w-16 h-24 xs:w-20 xs:h-28 sm:w-24 sm:h-32 rounded-xl xs:rounded-2xl border transition-all duration-300 shadow-2xl flex flex-col justify-between p-2 xs:p-2.5 font-bold ${
                  isSeen
                    ? 'bg-white text-slate-950 border-white -translate-y-2'
                    : 'bg-gradient-to-tr from-purple-900 to-indigo-950 border-purple-500/40 text-purple-300'
                }`}
              >
                {isSeen ? (
                  <>
                    <span className="text-xs sm:text-sm self-start leading-none">{c.rank}</span>
                    <span className="text-2xl sm:text-4xl self-center leading-none">{c.suit}</span>
                    <span className="text-xs sm:text-sm self-end leading-none">{c.rank}</span>
                  </>
                ) : (
                  <div className="w-full h-full rounded-xl border border-dashed border-purple-400/30 flex items-center justify-center text-xs font-mono">
                    VX
                  </div>
                )}
              </div>
            ))}
          </div>

          {isSeen && (
            <div className="mt-3 text-xs font-bold text-aurora-gold font-mono">
              Pure Sequence (Straight Flush)
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 pt-2 border-t border-aurora-border/40">
          <button
            onClick={handlePack}
            disabled={hasFolded}
            className="px-5 py-2.5 bg-aurora-danger/20 hover:bg-aurora-danger/30 text-aurora-danger border border-aurora-danger/40 rounded-xl text-xs font-bold transition disabled:opacity-40"
          >
            Pack (Fold)
          </button>

          <button
            onClick={handleChaal}
            disabled={hasFolded}
            className="px-6 py-2.5 bg-gradient-to-r from-aurora-cyan to-aurora-purple text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-glow transition disabled:opacity-40"
          >
            Chaal ₹{isSeen ? currentStake * 2 : currentStake}
          </button>

          <button
            onClick={handleShowdown}
            disabled={hasFolded}
            className="px-5 py-2.5 bg-gradient-to-r from-aurora-gold to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-glowGold transition disabled:opacity-40"
          >
            Showdown
          </button>
        </div>
      </div>
    </div>
  );
}
