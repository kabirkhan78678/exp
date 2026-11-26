"use client";

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy, Copy, Check, Volume2, VolumeX, RefreshCw,
  Clock, Users, Crown
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { playCasinoSfx } from '@/components/CasinoAssets';

type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

interface LudoToken {
  id: number;
  color: PlayerColor;
  steps: number; // -1 = Home Yard, 0..50 = outer track steps from color start, 51..56 = home stretch, 57 = Center Crown
}

// Official 52-cell clockwise outer circuit on a 15x15 Ludo board (row 0..14, col 0..14)
const OUTER_TRACK: [number, number][] = [
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0],
  [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7], [14, 6],
];

const START_OFFSET: Record<PlayerColor, number> = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39,
};

const SAFE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

const HOME_STRETCH: Record<PlayerColor, [number, number][]> = {
  RED: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
  GREEN: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  YELLOW: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  BLUE: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
};

const YARD_SLOTS: Record<PlayerColor, [number, number][]> = {
  RED: [[10.8, 1.8], [10.8, 3.6], [12.6, 1.8], [12.6, 3.6]],
  GREEN: [[1.8, 1.8], [1.8, 3.6], [3.6, 1.8], [3.6, 3.6]],
  YELLOW: [[1.8, 10.8], [1.8, 12.6], [3.6, 10.8], [3.6, 12.6]],
  BLUE: [[10.8, 10.8], [10.8, 12.6], [12.6, 10.8], [12.6, 12.6]],
};

const COLOR_HEX: Record<PlayerColor, { fill: string; light: string }> = {
  RED: { fill: '#EF4444', light: '#FCA5A5' },
  GREEN: { fill: '#10B981', light: '#6EE7B7' },
  YELLOW: { fill: '#F59E0B', light: '#FDE68A' },
  BLUE: { fill: '#3B82F6', light: '#93C5FD' },
};

function getTokenCoord(token: LudoToken): [number, number] {
  if (token.steps < 0) return YARD_SLOTS[token.color][token.id];
  if (token.steps === 57) {
    // Cluster neatly inside center crown
    const offsets: Record<PlayerColor, [number, number]> = {
      RED: [7.6, 7],
      GREEN: [7, 6.4],
      YELLOW: [6.4, 7],
      BLUE: [7, 7.6],
    };
    return offsets[token.color];
  }
  if (token.steps >= 51) {
    return HOME_STRETCH[token.color][token.steps - 51];
  }
  const idx = (START_OFFSET[token.color] + token.steps) % 52;
  return OUTER_TRACK[idx];
}

export default function LudoArenaPage() {
  const { isAuthenticated, activeBalanceType, balances, setBalances, fetchBalances, showNotification } = useStore();

  const [mode, setMode] = useState<'2P' | '4P'>('2P');
  const [stake, setStake] = useState<number>(50);
  const [roomCode] = useState<string>(() => `LD-${Math.floor(1000 + Math.random() * 8999)}`);
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const activeColors: PlayerColor[] = mode === '2P' ? ['RED', 'YELLOW'] : ['RED', 'GREEN', 'YELLOW', 'BLUE'];

  const createInitialTokens = (cols: PlayerColor[]): Record<PlayerColor, LudoToken[]> => {
    const map: Partial<Record<PlayerColor, LudoToken[]>> = {};
    cols.forEach((c) => {
      // Quick Mode starts with 1 token already deployed on start cell + 3 in yard for fast action!
      map[c] = [
        { id: 0, color: c, steps: 0 },
        { id: 1, color: c, steps: -1 },
        { id: 2, color: c, steps: -1 },
        { id: 3, color: c, steps: -1 },
      ];
    });
    return map as Record<PlayerColor, LudoToken[]>;
  };

  const [tokens, setTokens] = useState<Record<PlayerColor, LudoToken[]>>(() => createInitialTokens(['RED', 'YELLOW']));
  const [scores, setScores] = useState<Record<PlayerColor, number>>({ RED: 1, GREEN: 1, YELLOW: 1, BLUE: 1 });
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number>(6);
  const [diceRolled, setDiceRolled] = useState<boolean>(false);
  const [matchSeconds, setMatchSeconds] = useState<number>(300); // 5-min Quick Tournament
  const [matchFinished, setMatchFinished] = useState<boolean>(false);

  const currentTurnColor = activeColors[turnIndex % activeColors.length];

  const resetMatch = useCallback(
    (newMode: '2P' | '4P' = mode) => {
      const cols: PlayerColor[] = newMode === '2P' ? ['RED', 'YELLOW'] : ['RED', 'GREEN', 'YELLOW', 'BLUE'];
      setTokens(createInitialTokens(cols));
      setScores({ RED: 1, GREEN: 1, YELLOW: 1, BLUE: 1 });
      setTurnIndex(0);
      setDiceRolled(false);
      setMatchSeconds(300);
      setMatchFinished(false);
    },
    [mode]
  );

  // 5-Minute Quick Tournament Countdown
  useEffect(() => {
    if (matchFinished) return;
    const id = setInterval(() => {
      setMatchSeconds((s) => {
        if (s <= 1) {
          setMatchFinished(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [matchFinished]);

  const canTokenMove = (t: LudoToken, roll: number): boolean => {
    if (t.steps < 0) return roll === 6 || roll === 1; // Quick Mode allows exit on 6 or 1!
    return t.steps + roll <= 57;
  };

  const finishMatchAndSettle = useCallback(
    async (wonByPlayer: boolean, playerScore: number) => {
      setMatchFinished(true);
      const mult = mode === '4P' ? 3.4 : 1.85;
      const payout = wonByPlayer ? parseFloat((stake * mult).toFixed(2)) : 0;

      if (wonByPlayer) {
        if (soundEnabled) playCasinoSfx('win');
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        showNotification(`LUDO VICTORY (${playerScore} PTS)! Won ₹${payout}!`, 'success');
      } else {
        if (soundEnabled) playCasinoSfx('lose');
        showNotification(`Match Ended (${playerScore} PTS). Play again!`, 'info');
      }

      try {
        if (isAuthenticated) {
          await api.submitLudoMatch(stake, playerScore, wonByPlayer, mode, activeBalanceType);
          await fetchBalances();
        } else {
          const bal = parseFloat(activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN);
          setBalances({ ...balances, [activeBalanceType]: Math.max(0, bal - stake + payout).toFixed(4) });
        }
      } catch {}
    },
    [mode, stake, soundEnabled, isAuthenticated, activeBalanceType, fetchBalances, balances, setBalances, showNotification]
  );

  const executeMove = useCallback(
    (color: PlayerColor, tokenId: number, roll: number) => {
      let bonusPoints = 0;
      let capturedOpponent = false;
      let reachedHome = false;

      setTokens((prev) => {
        const clone: Record<PlayerColor, LudoToken[]> = JSON.parse(JSON.stringify(prev));
        const target = clone[color].find((tk) => tk.id === tokenId);
        if (!target) return prev;

        if (target.steps < 0) {
          target.steps = 0;
          bonusPoints = 2;
        } else {
          target.steps += roll;
          bonusPoints = roll;
          if (target.steps === 57) {
            bonusPoints += 50;
            reachedHome = true;
          } else if (target.steps <= 50) {
            const globalIdx = (START_OFFSET[color] + target.steps) % 52;
            if (!SAFE_INDICES.has(globalIdx)) {
              // Capture any opposing tokens on this square!
              activeColors.forEach((otherColor) => {
                if (otherColor === color) return;
                clone[otherColor]?.forEach((opp) => {
                  if (opp.steps >= 0 && opp.steps <= 50) {
                    const oppIdx = (START_OFFSET[otherColor] + opp.steps) % 52;
                    if (oppIdx === globalIdx) {
                      opp.steps = -1;
                      capturedOpponent = true;
                      bonusPoints += 25;
                    }
                  }
                });
              });
            }
          }
        }
        return clone;
      });

      setScores((prev) => {
        const updated = { ...prev, [color]: prev[color] + bonusPoints };
        if (reachedHome && updated[color] >= 200) {
          finishMatchAndSettle(color === 'RED', updated.RED);
        }
        return updated;
      });

      if (soundEnabled) playCasinoSfx(capturedOpponent || reachedHome ? 'win' : 'chip');

      setDiceRolled(false);
      // Extra turn on 6 or Capture!
      if (roll !== 6 && !capturedOpponent) {
        setTurnIndex((i) => (i + 1) % activeColors.length);
      }
    },
    [activeColors, soundEnabled, finishMatchAndSettle]
  );

  // Automatic Smart AI Turn Handler for Non-RED Players
  useEffect(() => {
    if (matchFinished || currentTurnColor === 'RED') return;
    const timer = setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(roll);
      const botTokens = tokens[currentTurnColor] || [];
      const movable = botTokens.filter((t) => canTokenMove(t, roll));
      if (movable.length > 0) {
        // Prioritize moving furthest token
        movable.sort((a, b) => b.steps - a.steps);
        executeMove(currentTurnColor, movable[0].id, roll);
      } else {
        setTurnIndex((i) => (i + 1) % activeColors.length);
      }
    }, 650);
    return () => clearTimeout(timer);
  }, [currentTurnColor, matchFinished, tokens, executeMove, activeColors.length]);

  const handlePlayerRoll = () => {
    if (matchFinished || currentTurnColor !== 'RED' || diceRolled) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);
    if (soundEnabled) playCasinoSfx('flip');

    const myTokens = tokens.RED || [];
    const movable = myTokens.filter((t) => canTokenMove(t, roll));
    if (movable.length === 0) {
      showNotification(`Rolled ${roll} — No movable token. Next player's turn.`, 'info');
      setTimeout(() => setTurnIndex((i) => (i + 1) % activeColors.length), 500);
      return;
    }
    if (movable.length === 1) {
      // Smooth auto-move if only 1 legal token can move!
      setTimeout(() => executeMove('RED', movable[0].id, roll), 260);
    } else {
      setDiceRolled(true);
    }
  };

  const mins = Math.floor(matchSeconds / 60).toString().padStart(2, '0');
  const secs = (matchSeconds % 60).toString().padStart(2, '0');

  return (
    <div className="space-y-4 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-5 max-w-7xl mx-auto pb-32 w-full overflow-x-hidden">
      {/* Header Bar */}
      <div className="lux-card rounded-2xl p-3.5 xs:p-4 flex flex-wrap items-center justify-between gap-3 border-[#F5B041]/25">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5B041]/15 border border-[#F5B041]/40 flex items-center justify-center text-[#F5B041] shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm xs:text-base sm:text-lg font-black text-white">Ludo Arena Quick</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#47EC84]/15 border border-[#47EC84]/35 text-[9px] font-mono font-black text-[#47EC84] flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> {mins}:{secs}
              </span>
            </div>
            <p className="text-[10px] xs:text-xs text-slate-400">
              2P / 4P Quick Points Tournament • +25 Capture • +50 Home Crown
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 2P / 4P Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-black/60 border border-white/10 text-xs font-black">
            {(['2P', '4P'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  resetMatch(m);
                }}
                className={`px-3 py-1 rounded-full transition flex items-center gap-1 ${
                  mode === m ? 'btn-emerald-3d' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>{m}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(roomCode);
              setCopiedRoom(true);
              setTimeout(() => setCopiedRoom(false), 1800);
            }}
            className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-[11px] font-mono text-[#F5B041] flex items-center gap-1.5"
          >
            <span>{roomCode}</span>
            {copiedRoom ? <Check className="w-3 h-3 text-[#47EC84]" /> : <Copy className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-black/50 border border-white/10 text-slate-300"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#47EC84]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Layout: 15x15 SVG Ludo Board + Points/Dice Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* 15x15 Interactive Royal Ludo Board (7 Cols) */}
        <div className="lg:col-span-7 lux-card rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-center">
          <div className="w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden border-4 border-[#3D2510] shadow-2xl bg-[#F8FAFC]">
            <svg viewBox="0 0 15 15" className="w-full h-full select-none">
              {/* Base Cream Grid */}
              <rect width="15" height="15" fill="#F8FAFC" />

              {/* Track Cell Borders */}
              {Array.from({ length: 15 }, (_, r) =>
                Array.from({ length: 15 }, (_, c) => (
                  <rect
                    key={`${r}-${c}`}
                    x={c}
                    y={r}
                    width={1}
                    height={1}
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="0.04"
                  />
                ))
              )}

              {/* Colored Home Stretches */}
              {HOME_STRETCH.GREEN.map(([r, c], i) => (
                <rect key={`hg-${i}`} x={c} y={r} width={1} height={1} fill="#10B981" fillOpacity="0.85" />
              ))}
              {HOME_STRETCH.YELLOW.map(([r, c], i) => (
                <rect key={`hy-${i}`} x={c} y={r} width={1} height={1} fill="#F59E0B" fillOpacity="0.85" />
              ))}
              {HOME_STRETCH.BLUE.map(([r, c], i) => (
                <rect key={`hb-${i}`} x={c} y={r} width={1} height={1} fill="#3B82F6" fillOpacity="0.85" />
              ))}
              {HOME_STRETCH.RED.map(([r, c], i) => (
                <rect key={`hr-${i}`} x={c} y={r} width={1} height={1} fill="#EF4444" fillOpacity="0.85" />
              ))}

              {/* Start Colored Squares */}
              <rect x={1} y={6} width={1} height={1} fill="#10B981" />
              <rect x={8} y={1} width={1} height={1} fill="#F59E0B" />
              <rect x={13} y={8} width={1} height={1} fill="#3B82F6" />
              <rect x={6} y={13} width={1} height={1} fill="#EF4444" />

              {/* Safe Star Markers */}
              {Array.from(SAFE_INDICES).map((idx) => {
                const [r, c] = OUTER_TRACK[idx];
                return (
                  <text
                    key={`star-${idx}`}
                    x={c + 0.5}
                    y={r + 0.72}
                    textAnchor="middle"
                    fontSize="0.65"
                    fill="#334155"
                    opacity="0.7"
                  >
                    ★
                  </text>
                );
              })}

              {/* 4 Corner Home Yards */}
              {/* Top-Left: GREEN */}
              <rect x={0} y={0} width={6} height={6} fill="#10B981" />
              <rect x={0.75} y={0.75} width={4.5} height={4.5} rx={0.4} fill="#FFFFFF" />
              {/* Top-Right: YELLOW */}
              <rect x={9} y={0} width={6} height={6} fill="#F59E0B" />
              <rect x={9.75} y={0.75} width={4.5} height={4.5} rx={0.4} fill="#FFFFFF" />
              {/* Bottom-Left: RED */}
              <rect x={0} y={9} width={6} height={6} fill="#EF4444" />
              <rect x={0.75} y={9.75} width={4.5} height={4.5} rx={0.4} fill="#FFFFFF" />
              {/* Bottom-Right: BLUE */}
              <rect x={9} y={9} width={6} height={6} fill="#3B82F6" />
              <rect x={9.75} y={9.75} width={4.5} height={4.5} rx={0.4} fill="#FFFFFF" />

              {/* Center Finish 4 Triangles */}
              <polygon points="6,6 9,6 7.5,7.5" fill="#F59E0B" stroke="#0F172A" strokeWidth="0.05" />
              <polygon points="9,6 9,9 7.5,7.5" fill="#3B82F6" stroke="#0F172A" strokeWidth="0.05" />
              <polygon points="6,9 9,9 7.5,7.5" fill="#EF4444" stroke="#0F172A" strokeWidth="0.05" />
              <polygon points="6,6 6,9 7.5,7.5" fill="#10B981" stroke="#0F172A" strokeWidth="0.05" />

              {/* Render All Tokens */}
              {activeColors.map((col) =>
                (tokens[col] || []).map((tk) => {
                  const [r, c] = getTokenCoord(tk);
                  const isPlayerMovable =
                    col === 'RED' && currentTurnColor === 'RED' && diceRolled && canTokenMove(tk, diceValue);
                  const cx = tk.steps < 0 ? c : c + 0.5;
                  const cy = tk.steps < 0 ? r : r + 0.5;

                  return (
                    <g
                      key={`${col}-${tk.id}`}
                      onClick={() => isPlayerMovable && executeMove('RED', tk.id, diceValue)}
                      style={{ cursor: isPlayerMovable ? 'pointer' : 'default' }}
                    >
                      {isPlayerMovable && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={0.48}
                          fill="none"
                          stroke="#F5B041"
                          strokeWidth="0.12"
                          className="animate-pulse"
                        />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={0.34}
                        fill={COLOR_HEX[col].fill}
                        stroke="#0F172A"
                        strokeWidth="0.09"
                      />
                      <circle cx={cx} cy={cy} r={0.14} fill={COLOR_HEX[col].light} />
                    </g>
                  );
                })
              )}
            </svg>
          </div>
        </div>

        {/* Dice Roller, Points Standings & Match Control Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Interactive Dice Roll Console */}
          <div className="lux-card rounded-3xl p-5 flex items-center justify-between gap-4 border-[#47EC84]/25">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Turn
              </div>
              <div
                className="font-display text-lg font-black mt-0.5 flex items-center gap-2"
                style={{ color: COLOR_HEX[currentTurnColor].fill }}
              >
                <span>{currentTurnColor === 'RED' ? 'YOUR TURN (RED)' : `${currentTurnColor} BOT THINKING...`}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {diceRolled
                  ? `Tap highlighted RED token on board to move ${diceValue} steps!`
                  : currentTurnColor === 'RED'
                  ? 'Tap Roll Dice (1 or 6 unlocks Yard tokens!)'
                  : 'Waiting for opponent move...'}
              </p>
            </div>

            <button
              type="button"
              disabled={matchFinished || currentTurnColor !== 'RED' || diceRolled}
              onClick={handlePlayerRoll}
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-2xl transition active:scale-90 shrink-0 ${
                currentTurnColor === 'RED' && !diceRolled
                  ? 'btn-gold-3d shadow-glowGold animate-pulse'
                  : 'bg-[#141A1D] border border-white/15 text-white opacity-70'
              }`}
            >
              <span>{diceValue}</span>
              <span className="text-[8px] font-sans uppercase tracking-wider font-extrabold">ROLL</span>
            </button>
          </div>

          {/* 5-Min Quick Points Leaderboard */}
          <div className="lux-card rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-display font-black text-sm text-white">
                <Trophy className="w-4 h-4 text-[#F5B041]" />
                <span>Points Standings</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">200 PTS Instant Win</span>
            </div>

            <div className="space-y-2">
              {activeColors.map((col) => {
                const isTurn = currentTurnColor === col;
                return (
                  <div
                    key={col}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                      isTurn ? 'bg-white/[0.06] border-[#F5B041]/60' : 'bg-black/40 border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full border border-white/40"
                        style={{ backgroundColor: COLOR_HEX[col].fill }}
                      />
                      <span className="text-xs font-black text-white">
                        {col === 'RED' ? 'YOU (RED)' : `${col} BOT`}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums font-black text-sm text-[#47EC84]">
                      {scores[col]} PTS
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stake & Claim / Reset Controls */}
          <div className="lux-card rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Entry Stake ({activeBalanceType})</span>
              <span className="font-mono text-[#F5B041] font-black">
                Win: ₹{(stake * (mode === '4P' ? 3.4 : 1.85)).toFixed(0)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[25, 50, 100, 500].map((v) => (
                <button
                  key={v}
                  onClick={() => setStake(v)}
                  className={`py-2 rounded-xl font-mono text-xs font-black border ${
                    stake === v ? 'btn-emerald-3d border-transparent' : 'bg-black/40 border-white/10 text-slate-300'
                  }`}
                >
                  ₹{v}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => finishMatchAndSettle(scores.RED >= Math.max(...activeColors.map((c) => scores[c])), scores.RED)}
                className="py-2.5 rounded-xl btn-emerald-3d font-black text-xs active:scale-95 transition"
              >
                Finish & Claim
              </button>
              <button
                onClick={() => resetMatch(mode)}
                className="py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Match</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
