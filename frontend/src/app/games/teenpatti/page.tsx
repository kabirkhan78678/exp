"use client";

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Eye, Volume2, VolumeX,
  Coins, Crown, RefreshCw, Sparkles, Info
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { PlayingCard3D, playCasinoSfx } from '@/components/CasinoAssets';
import { GoldRupeeCoin } from '@/components/GameArtwork';

interface CardObj {
  rank: number; // 2..14 (14 = Ace)
  suit: string;
}

interface OpponentSeat {
  id: string;
  name: string;
  avatar: string;
  isSeen: boolean;
  packed: boolean;
  lastAction: string;
  cards: CardObj[];
}

const SUITS = ['♠', '♥', '♣', '♦'];
const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

function formatRank(r: number): string {
  if (r === 14) return 'A';
  if (r === 13) return 'K';
  if (r === 12) return 'Q';
  if (r === 11) return 'J';
  return r.toString();
}

/** True Teen Patti Hand Evaluator (Trail > Pure Seq > Seq > Color > Pair > High Card) */
function evaluateHand(cards: CardObj[]): { tier: number; tiebreak: number[]; label: string } {
  const sorted = [...cards].map((c) => c.rank).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);
  const isFlush = suits[0] === suits[1] && suits[1] === suits[2];

  // 1. Trail (Three of a kind)
  if (sorted[0] === sorted[1] && sorted[1] === sorted[2]) {
    return { tier: 6, tiebreak: sorted, label: `Trail of ${formatRank(sorted[0])}s` };
  }

  // 2. Sequence (A-K-Q, A-2-3, or consecutive)
  const isA23 = sorted[0] === 14 && sorted[1] === 3 && sorted[2] === 2;
  const isSeq = isA23 || (sorted[0] - sorted[1] === 1 && sorted[1] - sorted[2] === 1);

  if (isSeq && isFlush) return { tier: 5, tiebreak: sorted, label: 'Pure Sequence' };
  if (isSeq) return { tier: 4, tiebreak: sorted, label: 'Sequence' };
  if (isFlush) return { tier: 3, tiebreak: sorted, label: 'Color (Flush)' };

  // 3. Pair
  if (sorted[0] === sorted[1]) return { tier: 2, tiebreak: [sorted[0], sorted[2]], label: `Pair of ${formatRank(sorted[0])}s` };
  if (sorted[1] === sorted[2]) return { tier: 2, tiebreak: [sorted[1], sorted[0]], label: `Pair of ${formatRank(sorted[1])}s` };

  return { tier: 1, tiebreak: sorted, label: `High Card ${formatRank(sorted[0])}` };
}

function compareHands(a: CardObj[], b: CardObj[]): number {
  const ea = evaluateHand(a);
  const eb = evaluateHand(b);
  if (ea.tier !== eb.tier) return ea.tier - eb.tier;
  for (let i = 0; i < Math.min(ea.tiebreak.length, eb.tiebreak.length); i++) {
    if (ea.tiebreak[i] !== eb.tiebreak[i]) return ea.tiebreak[i] - eb.tiebreak[i];
  }
  return 0;
}

function dealDeckHands(count: number): CardObj[][] {
  const deck: CardObj[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) deck.push({ rank, suit });
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const hands: CardObj[][] = [];
  for (let p = 0; p < count; p++) {
    hands.push(deck.slice(p * 3, p * 3 + 3));
  }
  return hands;
}

export default function TeenPattiPage() {
  const { user, activeBalanceType, balances, setBalances, showNotification } = useStore();

  const bootOptions = [10, 50, 100, 500];
  const [bootAmount, setBootAmount] = useState<number>(50);
  const [currentStake, setCurrentStake] = useState<number>(50);
  const [currentPot, setCurrentPot] = useState<number>(250);
  const [handNumber, setHandNumber] = useState<number>(1);

  const [myCards, setMyCards] = useState<CardObj[]>([
    { rank: 14, suit: '♠' },
    { rank: 13, suit: '♠' },
    { rank: 12, suit: '♠' },
  ]);
  const [isSeen, setIsSeen] = useState<boolean>(false);
  const [hasFolded, setHasFolded] = useState<boolean>(false);
  const [isShowdown, setIsShowdown] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [winnerBanner, setWinnerBanner] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showRanksGuide, setShowRanksGuide] = useState<boolean>(false);

  const [opponents, setOpponents] = useState<OpponentSeat[]>([
    { id: 'p2', name: 'Arjun_VIP', avatar: 'AV', isSeen: false, packed: false, lastAction: 'Boot ₹50', cards: [] },
    { id: 'p3', name: 'Neha_Royal', avatar: 'NR', isSeen: true, packed: false, lastAction: 'Boot ₹50', cards: [] },
    { id: 'p4', name: 'Kabir_77', avatar: 'K7', isSeen: false, packed: false, lastAction: 'Boot ₹50', cards: [] },
    { id: 'p5', name: 'Vikram_Pro', avatar: 'VP', isSeen: false, packed: false, lastAction: 'Boot ₹50', cards: [] },
  ]);

  const startNewHand = useCallback((customBoot = bootAmount) => {
    const hands = dealDeckHands(5);
    if (soundEnabled) playCasinoSfx('flip');

    setMyCards(hands[0]);
    setIsSeen(false);
    setHasFolded(false);
    setIsShowdown(false);
    setWinnerBanner(null);
    setCurrentStake(customBoot);
    setCurrentPot(customBoot * 5);
    setHandNumber((h) => h + 1);

    setOpponents([
      { id: 'p2', name: 'Arjun_VIP', avatar: 'AV', isSeen: false, packed: false, lastAction: `Boot ₹${customBoot}`, cards: hands[1] },
      { id: 'p3', name: 'Neha_Royal', avatar: 'NR', isSeen: true, packed: false, lastAction: `Boot ₹${customBoot}`, cards: hands[2] },
      { id: 'p4', name: 'Kabir_77', avatar: 'K7', isSeen: false, packed: false, lastAction: `Boot ₹${customBoot}`, cards: hands[3] },
      { id: 'p5', name: 'Vikram_Pro', avatar: 'VP', isSeen: false, packed: false, lastAction: `Boot ₹${customBoot}`, cards: hands[4] },
    ]);

    // Deduct boot stake from active balance
    const bal = parseFloat(activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN);
    if (bal >= customBoot) {
      setBalances({
        ...balances,
        [activeBalanceType]: (bal - customBoot).toFixed(4),
      });
    }
  }, [bootAmount, soundEnabled, activeBalanceType, balances, setBalances]);

  useEffect(() => {
    api.getTeenPattiRooms().catch(() => {});
    const hands = dealDeckHands(5);
    setMyCards(hands[0]);
    setOpponents((prev) => prev.map((op, i) => ({ ...op, cards: hands[i + 1] })));
  }, []);

  const handleToggleSee = () => {
    if (hasFolded || isShowdown) return;
    if (soundEnabled) playCasinoSfx('flip');
    setIsSeen(true);
  };

  const simulateOpponentsTurn = (stakeUsed: number, potAfterMe: number) => {
    setIsAiThinking(true);
    setTimeout(() => {
      let addedPot = 0;
      setOpponents((prev) =>
        prev.map((op) => {
          if (op.packed) return op;
          const strength = evaluateHand(op.cards).tier;
          const roll = Math.random();
          // Weak hands sometimes pack when pot grows
          if (strength === 1 && roll < 0.25 && potAfterMe > bootAmount * 6) {
            return { ...op, packed: true, lastAction: 'Packed' };
          }
          const sawNow = op.isSeen || roll > 0.55;
          const callAmt = sawNow ? stakeUsed * 2 : stakeUsed;
          addedPot += callAmt;
          return {
            ...op,
            isSeen: sawNow,
            lastAction: sawNow ? `Chaal ₹${callAmt}` : `Blind ₹${callAmt}`,
          };
        })
      );
      setCurrentPot((p) => p + addedPot);
      if (soundEnabled) playCasinoSfx('chip');
      setIsAiThinking(false);
    }, 650);
  };

  const handleAction = (type: 'PLAY' | 'RAISE') => {
    if (hasFolded || isShowdown || isAiThinking) return;
    const nextStake = type === 'RAISE' ? currentStake * 2 : currentStake;
    const betCost = isSeen ? nextStake * 2 : nextStake;

    const bal = parseFloat(activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN);
    if (bal < betCost) {
      showNotification(`Insufficient ${activeBalanceType} balance for ₹${betCost}`, 'error');
      return;
    }

    if (soundEnabled) playCasinoSfx('chip');
    setBalances({ ...balances, [activeBalanceType]: (bal - betCost).toFixed(4) });
    setCurrentStake(nextStake);
    const updatedPot = currentPot + betCost;
    setCurrentPot(updatedPot);

    simulateOpponentsTurn(nextStake, updatedPot);
  };

  const handlePack = () => {
    if (hasFolded || isShowdown) return;
    if (soundEnabled) playCasinoSfx('lose');
    setHasFolded(true);
    setIsSeen(true);
    showNotification('You Packed. Tap "Deal Next Hand" when ready.', 'info');
  };

  const handleShowdown = () => {
    if (hasFolded || isShowdown || isAiThinking) return;
    const showCost = isSeen ? currentStake * 2 : currentStake;
    const finalPot = currentPot + showCost;
    setCurrentPot(finalPot);

    setIsSeen(true);
    setIsShowdown(true);
    if (soundEnabled) playCasinoSfx('flip');

    const activeOps = opponents.filter((o) => !o.packed);
    let bestName = user?.username || 'You';
    let bestCards = myCards;

    activeOps.forEach((op) => {
      if (compareHands(op.cards, bestCards) > 0) {
        bestCards = op.cards;
        bestName = op.name;
      }
    });

    const evalWinner = evaluateHand(bestCards);
    const youWon = bestName === (user?.username || 'You');

    setWinnerBanner(`${bestName} Wins ₹${finalPot} (${evalWinner.label})`);

    if (youWon) {
      const bal = parseFloat(activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN);
      setBalances({ ...balances, [activeBalanceType]: (bal + finalPot).toFixed(4) });
      if (soundEnabled) playCasinoSfx('win');
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.62 } });
      showNotification(`SHOWDOWN VICTORY! You won ₹${finalPot} with ${evalWinner.label}!`, 'success');
    } else {
      if (soundEnabled) playCasinoSfx('lose');
      showNotification(`${bestName} took ₹${finalPot} with ${evalWinner.label}`, 'info');
    }
  };

  const myHandEval = evaluateHand(myCards);
  const nextCallAmount = isSeen ? currentStake * 2 : currentStake;

  return (
    <div className="space-y-4 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-5 max-w-7xl mx-auto pb-32 w-full overflow-x-hidden">
      {/* 1. SALON HEADER & BOOT SELECTOR */}
      <div className="lux-card rounded-2xl p-3 xs:p-4 flex flex-wrap items-center justify-between gap-3 border-[#F5B041]/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-sm xs:text-base sm:text-lg font-black text-white">
              Teen Patti Royal Salon
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#F5B041]/15 border border-[#F5B041]/35 text-[9px] font-mono font-bold text-[#F5B041]">
              HAND #{handNumber}
            </span>
          </div>
          <p className="text-[10px] xs:text-xs text-slate-400">
            5-Player Classic Velvet Table • Blind, Chaal & Showdown
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Boot Stakes Selector */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-black/60 border border-white/10">
            <span className="text-[9px] font-bold text-slate-400 pl-2 pr-1">BOOT</span>
            {bootOptions.map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setBootAmount(amt);
                  startNewHand(amt);
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black transition ${
                  bootAmount === amt ? 'btn-gold-3d' : 'text-slate-400 hover:text-white'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRanksGuide(!showRanksGuide)}
            className="p-2 rounded-xl bg-black/50 border border-white/10 text-[#F5B041] hover:bg-black/80 transition"
            title="Hand Rankings Guide"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-black/50 border border-white/10 text-slate-300 hover:text-white transition"
            title="Toggle Audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#47EC84]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Teen Patti Hand Hierarchy Strip */}
      {showRanksGuide && (
        <div className="lux-card rounded-2xl p-3.5 text-[11px] grid grid-cols-2 sm:grid-cols-6 gap-2 border-[#F5B041]/30 animate-scale-up">
          {[
            { rank: '1. Trail', ex: 'A-A-A' },
            { rank: '2. Pure Seq', ex: 'A♠-K♠-Q♠' },
            { rank: '3. Sequence', ex: 'A-K-Q Mix' },
            { rank: '4. Color', ex: 'All Hearts ♥' },
            { rank: '5. Pair', ex: 'K-K-7' },
            { rank: '6. High Card', ex: 'A-9-4' },
          ].map((r) => (
            <div key={r.rank} className="p-2 rounded-xl bg-black/45 border border-white/[0.06] text-center">
              <div className="font-black text-[#F5B041]">{r.rank}</div>
              <div className="font-mono text-[10px] text-slate-400">{r.ex}</div>
            </div>
          ))}
        </div>
      )}

      {/* 2. AUTHENTIC MAHOGANY-RAIL & EMERALD VELVET 5-SEAT TABLE */}
      <div className="relative rounded-[36px] sm:rounded-[110px] p-2 sm:p-3 bg-gradient-to-b from-[#6C3F19] via-[#3F210A] to-[#1B0D03] shadow-[0_28px_70px_rgba(0,0,0,0.92)]">
        {/* Inner Velvet Felt Oval */}
        <div className="casino-velvet-green rounded-[30px] sm:rounded-[98px] border-2 border-[#F5B041]/45 shadow-[inset_0_0_50px_rgba(0,0,0,0.75)] p-3.5 xs:p-5 sm:p-8 min-h-[480px] sm:min-h-[540px] flex flex-col justify-between relative overflow-hidden">
          {/* Inner Golden Felt Trim Line */}
          <div className="pointer-events-none absolute inset-3 sm:inset-5 rounded-[24px] sm:rounded-[84px] border border-[#F5B041]/20" />

          {/* Top Dealer Booth */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="px-4 py-1 rounded-full bg-black/70 border border-[#F5B041]/50 shadow-lg flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-[#F5B041]" />
              <span className="font-display text-[10px] sm:text-xs font-black tracking-widest text-[#F5B041] uppercase">
                DEALER • BOOT ₹{bootAmount}
              </span>
            </div>
          </div>

          {/* 4 OPPONENT SEATS IN CURVED ARCH + CENTER POT */}
          <div className="relative z-10 my-3 sm:my-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Left Opponents Column (2 Seats on Desktop, 2-col row on Mobile) */}
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-2.5 sm:gap-4">
              {opponents.slice(0, 2).map((op) => (
                <div
                  key={op.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition ${
                    op.packed
                      ? 'bg-black/40 border-white/5 opacity-45'
                      : 'bg-black/60 border-[#F5B041]/30 shadow-md'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#0E1E16] border-2 border-[#F5B041] flex items-center justify-center font-mono font-black text-xs text-white shrink-0">
                    {op.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-white truncate">{op.name}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                          op.packed
                            ? 'bg-rose-500/20 text-rose-400'
                            : op.isSeen
                            ? 'bg-[#47EC84]/20 text-[#47EC84]'
                            : 'bg-[#F5B041]/20 text-[#F5B041]'
                        }`}
                      >
                        {op.packed ? 'PACK' : op.isSeen ? 'SEEN' : 'BLIND'}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-300 mt-0.5">{op.lastAction}</div>

                    {/* Opponent Mini Cards (Flip Open on Showdown!) */}
                    {isShowdown && !op.packed && op.cards.length === 3 ? (
                      <div className="flex items-center gap-1 mt-1.5">
                        {op.cards.map((c, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 rounded bg-white text-[10px] font-mono font-black ${
                              ['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-slate-900'
                            }`}
                          >
                            {formatRank(c.rank)}{c.suit}
                          </span>
                        ))}
                      </div>
                    ) : (
                      !op.packed && (
                        <div className="flex items-center -space-x-1.5 mt-1.5">
                          {[0, 1, 2].map((k) => (
                            <span
                              key={k}
                              className="w-4 h-5 rounded-sm bg-gradient-to-b from-[#6B1022] to-[#26040B] border border-[#F5B041]/60"
                            />
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CENTER TABLE FELT POT PILE (4 Cols) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center">
              <div className="relative p-4 px-7 rounded-3xl bg-black/75 border-2 border-[#F5B041]/55 shadow-glowGold text-center backdrop-blur-md">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-black tracking-widest text-[#F5B041] uppercase">
                  <GoldRupeeCoin className="w-4 h-4" />
                  <span>TABLE POT</span>
                </div>
                <div className="font-mono tabular-nums text-2xl sm:text-3xl font-black text-[#F5B041] mt-1">
                  ₹{currentPot.toLocaleString('en-IN')}
                </div>
                {winnerBanner ? (
                  <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-[#47EC84] text-slate-950 text-[10px] font-black animate-pulse">
                    {winnerBanner}
                  </div>
                ) : (
                  <div className="text-[10px] font-mono text-slate-300 mt-1 flex items-center justify-center gap-2">
                    <span>Chaal: ₹{currentStake * 2}</span>
                    <span>•</span>
                    <span>Blind: ₹{currentStake}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Opponents Column (2 Seats on Desktop, 2-col row on Mobile) */}
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-2.5 sm:gap-4">
              {opponents.slice(2, 4).map((op) => (
                <div
                  key={op.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition ${
                    op.packed
                      ? 'bg-black/40 border-white/5 opacity-45'
                      : 'bg-black/60 border-[#F5B041]/30 shadow-md'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#0E1E16] border-2 border-[#F5B041] flex items-center justify-center font-mono font-black text-xs text-white shrink-0">
                    {op.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-white truncate">{op.name}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                          op.packed
                            ? 'bg-rose-500/20 text-rose-400'
                            : op.isSeen
                            ? 'bg-[#47EC84]/20 text-[#47EC84]'
                            : 'bg-[#F5B041]/20 text-[#F5B041]'
                        }`}
                      >
                        {op.packed ? 'PACK' : op.isSeen ? 'SEEN' : 'BLIND'}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-300 mt-0.5">{op.lastAction}</div>

                    {isShowdown && !op.packed && op.cards.length === 3 ? (
                      <div className="flex items-center gap-1 mt-1.5">
                        {op.cards.map((c, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 rounded bg-white text-[10px] font-mono font-black ${
                              ['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-slate-900'
                            }`}
                          >
                            {formatRank(c.rank)}{c.suit}
                          </span>
                        ))}
                      </div>
                    ) : (
                      !op.packed && (
                        <div className="flex items-center -space-x-1.5 mt-1.5">
                          {[0, 1, 2].map((k) => (
                            <span
                              key={k}
                              className="w-4 h-5 rounded-sm bg-gradient-to-b from-[#6B1022] to-[#26040B] border border-[#F5B041]/60"
                            />
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM HERO SEAT: YOUR 3D FLIPPABLE HAND */}
          <div className="relative z-10 flex flex-col items-center mt-2">
            {/* See / Hand Rank Pill */}
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
              {!isSeen && !hasFolded ? (
                <button
                  onClick={handleToggleSee}
                  className="px-4 py-1.5 rounded-full btn-gold-3d font-black text-xs flex items-center gap-1.5 active:scale-95 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Tap to SEE Cards</span>
                </button>
              ) : (
                <span className="px-4 py-1 rounded-full bg-black/75 border border-[#47EC84]/50 text-xs font-black text-[#47EC84] font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F5B041]" />
                  {hasFolded ? 'PACKED' : myHandEval.label}
                </span>
              )}
            </div>

            {/* 3-Card 3D Interactive Fan */}
            <div className="flex items-center justify-center -space-x-3 xs:-space-x-2 sm:space-x-1 py-1">
              {myCards.map((c, idx) => (
                <div
                  key={idx}
                  className={`transition-transform duration-300 ${
                    idx === 0 ? '-rotate-6 translate-y-1' : idx === 2 ? 'rotate-6 translate-y-1' : '-translate-y-1 z-10'
                  }`}
                >
                  <PlayingCard3D
                    rank={formatRank(c.rank)}
                    suit={c.suit}
                    faceUp={isSeen}
                    highlight={isShowdown && !hasFolded ? 'emerald' : 'none'}
                    size="md"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM PLAYER ACTION DOCK */}
      <div className="lux-card rounded-3xl p-3.5 sm:p-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 border-[#47EC84]/25">
        {isShowdown || hasFolded ? (
          <button
            onClick={() => startNewHand(bootAmount)}
            className="w-full sm:w-auto min-w-[220px] px-8 py-3.5 btn-emerald-3d font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Deal Next Hand (Boot ₹{bootAmount})</span>
          </button>
        ) : (
          <>
            <button
              onClick={handlePack}
              disabled={isAiThinking}
              className="px-5 py-3 bg-[#FF2E54]/15 hover:bg-[#FF2E54]/30 text-[#FF5C7A] border border-[#FF2E54]/40 rounded-2xl text-xs sm:text-sm font-black transition active:scale-95 disabled:opacity-40"
            >
              Pack (Fold)
            </button>

            <button
              onClick={() => handleAction('PLAY')}
              disabled={isAiThinking}
              className="px-6 py-3 btn-emerald-3d font-black text-xs sm:text-sm rounded-2xl transition active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
            >
              <span>{isAiThinking ? 'Waiting...' : `${isSeen ? 'Chaal' : 'Blind'} ₹${nextCallAmount}`}</span>
            </button>

            <button
              onClick={() => handleAction('RAISE')}
              disabled={isAiThinking}
              className="px-5 py-3 bg-white/[0.06] hover:bg-white/[0.12] border border-[#47EC84]/40 text-[#47EC84] font-black text-xs sm:text-sm rounded-2xl transition active:scale-95 disabled:opacity-40"
            >
              Raise 2x (₹{nextCallAmount * 2})
            </button>

            <button
              onClick={handleShowdown}
              disabled={isAiThinking}
              className="px-6 py-3 btn-gold-3d font-black text-xs sm:text-sm rounded-2xl transition active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
            >
              <Coins className="w-4 h-4" />
              <span>Showdown</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
