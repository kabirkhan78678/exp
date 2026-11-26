"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Layers, Users, Eye, EyeOff, ShieldCheck, 
  Plus, CheckCircle, Clock, ArrowRight, Trophy,
  Volume2, VolumeX, Sparkles, Coins
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { GoldRupeeCoin } from '@/components/GameArtwork';

export default function TeenPattiPage() {
  const { isAuthenticated, activeBalanceType, balances, fetchBalances, openModal, showNotification } = useStore();

  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isSeen, setIsSeen] = useState<boolean>(false);
  const [currentPot, setCurrentPot] = useState<number>(350);
  const [currentStake, setCurrentStake] = useState<number>(50);
  const [hasFolded, setHasFolded] = useState<boolean>(false);
  const [showdownWinner, setShowdownWinner] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Player hand
  const [myCards] = useState([
    { rank: 'A', suit: '♠', color: 'text-zinc-900', val: 14 },
    { rank: 'K', suit: '♠', color: 'text-zinc-900', val: 13 },
    { rank: 'Q', suit: '♠', color: 'text-zinc-900', val: 12 },
  ]);

  useEffect(() => {
    api.getTeenPattiRooms().then((res) => {
      setRooms(res.rooms);
      if (res.rooms?.length > 0) setSelectedRoom(res.rooms[0]);
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
    confetti({ particleCount: 85, spread: 65, origin: { y: 0.6 } });
    showNotification(`SHOWDOWN VICTORY! Won table pot of ₹${currentPot + 150}!`, 'success');
  };

  return (
    <div className="space-y-4 px-2.5 xs:px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-28 w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 xs:p-4 rounded-2xl bg-[#0D1214] border border-[#1E262A] shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#47EC84]/20 to-transparent border border-[#47EC84]/40 flex items-center justify-center text-[#47EC84] shadow-glowGreen shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm xs:text-base font-black text-white font-display">Teen Patti High-Stakes Club</h1>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F5B041]/15 text-[#F5B041] border border-[#F5B041]/30">
                VIP SALON
              </span>
            </div>
            <p className="text-[10px] xs:text-xs text-zinc-400">Authentic 3-Card Indian Flush • Certified Fair RNG Table</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-[#F5B041]/30 text-xs text-zinc-300">
            <GoldRupeeCoin className="w-4 h-4" />
            <span className="text-[11px] text-zinc-400">POT:</span>
            <strong className="text-[#F5B041] font-mono font-black text-sm">₹{currentPot}</strong>
          </div>

          <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-[#47EC84]/15 text-[#47EC84] border border-[#47EC84]/30 flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5" /> 15s Turn
          </span>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl bg-black/40 border border-[#1E262A] text-zinc-400 hover:text-white transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#47EC84]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Oval Poker Table */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0B1511] via-[#080E0B] to-[#040706] border-2 sm:border-4 border-[#1E3024] p-4 sm:p-10 shadow-2xl min-h-[420px] sm:min-h-[480px] flex flex-col justify-between overflow-hidden">
        {/* Table Felt Inscription Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <span className="text-7xl sm:text-9xl font-black text-[#47EC84] tracking-widest uppercase font-display">
            VELTRIX
          </span>
        </div>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-[#47EC84]/10 blur-3xl pointer-events-none" />

        {/* Top Opponent Seats */}
        <div className="flex justify-around items-center relative z-10">
          {/* Seat 1 */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-[#111517] border-2 border-[#1E262A] flex items-center justify-center text-xs font-bold text-zinc-300 shadow-lg relative">
              <span className="font-mono">P2</span>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#47EC84] border-2 border-black flex items-center justify-center text-[8px] font-black text-black">
                ✓
              </span>
            </div>
            <span className="text-[11px] text-zinc-300 font-bold">Rajesh_K</span>
            <span className="text-[10px] font-mono text-[#47EC84] font-bold">Chaal ₹100</span>
          </div>

          {/* Table Center Pot Display Vault */}
          <div className="text-center p-3.5 px-6 rounded-2xl bg-black/80 border border-[#F5B041]/40 shadow-glowGold backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#F5B041] uppercase tracking-wider font-bold">
              <Coins className="w-3.5 h-3.5 text-[#F5B041]" />
              <span>TOTAL POT</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#F5B041] font-mono mt-0.5">
              ₹{currentPot}
            </div>
            {showdownWinner ? (
              <div className="text-[11px] font-bold text-[#47EC84] mt-1 animate-pulse">
                Winner: {showdownWinner}
              </div>
            ) : (
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Stake: ₹{currentStake}
              </div>
            )}
          </div>

          {/* Seat 2 */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-[#111517] border-2 border-[#1E262A] flex items-center justify-center text-xs font-bold text-zinc-300 shadow-lg relative">
              <span className="font-mono">P3</span>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#F5B041] border-2 border-black flex items-center justify-center text-[8px] font-black text-black">
                ★
              </span>
            </div>
            <span className="text-[11px] text-zinc-300 font-bold">Vikas_99</span>
            <span className="text-[10px] font-mono text-[#F5B041] font-bold">Blind ₹50</span>
          </div>
        </div>

        {/* Player's Hand Center Stage */}
        <div className="relative z-10 flex flex-col items-center my-6">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setIsSeen(!isSeen)}
              className="px-3.5 py-1.5 bg-black/60 hover:bg-black/90 text-[#47EC84] border border-[#47EC84]/40 rounded-full text-xs font-bold flex items-center gap-1.5 transition shadow-glowGreen"
            >
              {isSeen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isSeen ? 'Hide Cards (Blind Mode)' : 'See Cards (Open Mode)'}</span>
            </button>
          </div>

          {/* 3-Card Fan */}
          <div className="flex items-center -space-x-5 py-2">
            {myCards.map((c, i) => (
              <div
                key={i}
                className={`w-20 h-30 sm:w-24 sm:h-36 rounded-2xl border-2 transition-all duration-300 shadow-2xl flex flex-col justify-between p-2.5 font-bold ${
                  isSeen
                    ? 'bg-gradient-to-b from-white via-zinc-50 to-zinc-200 text-slate-950 border-white -translate-y-3 rotate-[' + (i === 0 ? '-6deg' : i === 2 ? '6deg' : '0deg') + '] shadow-glow'
                    : 'bg-gradient-to-b from-[#18231E] to-[#0A120E] border-[#47EC84]/40 text-[#47EC84]'
                }`}
              >
                {isSeen ? (
                  <>
                    <span className="text-xs sm:text-sm self-start leading-none font-mono">{c.rank}</span>
                    <span className="text-3xl sm:text-4xl self-center leading-none text-black">{c.suit}</span>
                    <span className="text-xs sm:text-sm self-end leading-none font-mono">{c.rank}</span>
                  </>
                ) : (
                  <div className="w-full h-full rounded-xl border border-dashed border-[#47EC84]/30 flex flex-col items-center justify-center gap-1">
                    <span className="text-xl">🂠</span>
                    <span className="text-[10px] font-mono tracking-wider font-bold">VELTRIX</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {isSeen && (
            <div className="mt-3 px-3 py-1 rounded-full bg-[#47EC84]/15 border border-[#47EC84]/30 text-xs font-black text-[#47EC84] font-mono">
              Pure Sequence (Straight Flush • A-K-Q)
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 pt-3 border-t border-[#1E3024]">
          <button
            onClick={handlePack}
            disabled={hasFolded}
            className="px-5 py-2.5 bg-rose-950/30 hover:bg-rose-950/60 text-rose-400 border border-rose-500/40 rounded-xl text-xs font-bold transition disabled:opacity-40"
          >
            Pack (Fold)
          </button>

          <button
            onClick={handleChaal}
            disabled={hasFolded}
            className="px-7 py-3 btn-emerald-3d text-slate-950 font-black text-xs sm:text-sm rounded-xl transition disabled:opacity-40"
          >
            Chaal ₹{isSeen ? currentStake * 2 : currentStake}
          </button>

          <button
            onClick={handleShowdown}
            disabled={hasFolded}
            className="px-7 py-3 btn-gold-3d text-slate-950 font-black text-xs sm:text-sm rounded-xl transition disabled:opacity-40"
          >
            Showdown
          </button>
        </div>
      </div>
    </div>
  );
}
