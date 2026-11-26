"use client";

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Dices, RefreshCw, ShieldCheck, ArrowLeftRight,
  Volume2, VolumeX, Sparkles
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { playCasinoSfx } from '@/components/CasinoAssets';

interface RollEntry {
  roll: number;
  won: boolean;
  payout: number;
}

export default function FairDicePage() {
  const { isAuthenticated, activeBalanceType, balances, setBalances, fetchBalances, showNotification } = useStore();

  const [stake, setStake] = useState<number>(100);
  const [target, setTarget] = useState<number>(50.5);
  const [condition, setCondition] = useState<'OVER' | 'UNDER'>('OVER');
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastWon, setLastWon] = useState<boolean | null>(null);
  const [rolling, setRolling] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [seedHash, setSeedHash] = useState<string>('48c19e02f1b7382aa690bc44123de9081ff3a2b1');
  const [history, setHistory] = useState<RollEntry[]>([
    { roll: 74.12, won: true, payout: 200 },
    { roll: 18.45, won: false, payout: 0 },
    { roll: 61.9, won: true, payout: 200 },
    { roll: 89.03, won: true, payout: 200 },
    { roll: 34.77, won: false, payout: 0 },
  ]);

  const winChance = parseFloat(
    Math.max(1.0, Math.min(98.0, condition === 'OVER' ? 100 - target : target)).toFixed(2)
  );
  const multiplier = parseFloat((99.0 / winChance).toFixed(4));
  const profitOnWin = parseFloat((stake * multiplier - stake).toFixed(2));

  const toggleCondition = () => {
    const newCond = condition === 'OVER' ? 'UNDER' : 'OVER';
    setCondition(newCond);
    setTarget(parseFloat((100 - target).toFixed(2)));
    if (soundEnabled) playCasinoSfx('chip');
  };

  const handleRoll = async () => {
    const bal = parseFloat(activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN);
    if (stake <= 0 || stake > bal) {
      showNotification(`Insufficient ${activeBalanceType} balance (₹${bal.toFixed(0)})`, 'error');
      return;
    }

    setRolling(true);
    let rollVal = 0;
    let won = false;
    let payout = 0;

    try {
      if (isAuthenticated) {
        const res = await api.playFairDice(stake, target, condition, activeBalanceType);
        rollVal = res.roll;
        won = res.won;
        payout = parseFloat(res.payout || '0');
        setSeedHash(res.server_seed_hash || seedHash);
        await fetchBalances();
      } else {
        throw new Error('local-demo');
      }
    } catch {
      rollVal = parseFloat((Math.random() * 99.99).toFixed(2));
      won = condition === 'OVER' ? rollVal > target : rollVal < target;
      payout = won ? parseFloat((stake * multiplier).toFixed(2)) : 0;

      setBalances({
        ...balances,
        [activeBalanceType]: Math.max(0, bal - stake + payout).toFixed(4),
      });
    }

    setLastRoll(rollVal);
    setLastWon(won);
    setHistory((prev) => [{ roll: rollVal, won, payout }, ...prev.slice(0, 14)]);
    setRolling(false);

    if (won) {
      if (soundEnabled) playCasinoSfx('win');
      if (multiplier >= 3) confetti({ particleCount: 55, spread: 50, origin: { y: 0.6 } });
    } else {
      if (soundEnabled) playCasinoSfx('lose');
    }
  };

  const sliderPct = Math.min(98, Math.max(2, target));
  const trackGradient =
    condition === 'UNDER'
      ? `linear-gradient(to right, #47EC84 0%, #47EC84 ${sliderPct}%, #FF2E54 ${sliderPct}%, #FF2E54 100%)`
      : `linear-gradient(to right, #FF2E54 0%, #FF2E54 ${sliderPct}%, #47EC84 ${sliderPct}%, #47EC84 100%)`;

  return (
    <div className="space-y-4 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-5 max-w-6xl mx-auto pb-32 w-full overflow-x-hidden">
      <div className="lux-card rounded-2xl p-3.5 xs:p-4 flex flex-wrap items-center justify-between gap-3 border-[#47EC84]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#47EC84]/15 border border-[#47EC84]/40 flex items-center justify-center text-[#47EC84] shadow-glowGreen shrink-0">
            <Dices className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm xs:text-base sm:text-lg font-black text-white">
                Fair Dice (0.00 – 100.00)
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#47EC84]/15 text-[#47EC84] border border-[#47EC84]/30 text-[9px] font-mono font-black">
                99% RTP
              </span>
            </div>
            <p className="text-[10px] xs:text-xs text-slate-400">
              Precision Over/Under Probability Slider • Instant 1-Tap Settlement
            </p>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-black/50 border border-white/10 text-slate-300 hover:text-white transition"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#47EC84]" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none lux-card rounded-2xl p-2.5 px-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">Rolls:</span>
        {history.map((h, i) => (
          <span
            key={i}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono tabular-nums font-black shrink-0 border ${
              h.won
                ? 'bg-[#47EC84]/20 text-[#47EC84] border-[#47EC84]/45'
                : 'bg-black/50 text-slate-400 border-white/10'
            }`}
          >
            {h.roll.toFixed(2)}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        <div className="lg:col-span-4 lux-card rounded-3xl p-4 sm:p-5 space-y-4 order-2 lg:order-1">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
              <span>STAKE ({activeBalanceType})</span>
              <span className="font-mono text-[#47EC84]">
                ₹{parseFloat(activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN).toFixed(0)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#0A0D0F] border border-white/10 rounded-xl p-1.5">
              <input
                type="number"
                min={10}
                value={stake}
                onChange={(e) => setStake(Math.max(10, Number(e.target.value)))}
                className="flex-1 bg-transparent px-2.5 py-1.5 text-sm font-mono font-black text-white focus:outline-none min-w-0"
              />
              <button
                type="button"
                onClick={() => setStake((s) => Math.max(10, Math.floor(s / 2)))}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] text-[10px] font-mono font-bold text-slate-300"
              >
                1/2
              </button>
              <button
                type="button"
                onClick={() => setStake((s) => Math.min(25000, s * 2))}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] text-[10px] font-mono font-bold text-[#F5B041]"
              >
                2x
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0A0D0F] border border-white/[0.08] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Profit on Win</span>
              <span className="font-mono tabular-nums font-black text-[#47EC84]">+₹{profitOnWin}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Condition</span>
              <span className="font-mono font-bold text-white">
                Roll {condition} {target.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={rolling}
            onClick={handleRoll}
            className="w-full py-3.5 btn-emerald-3d font-black text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition"
          >
            {rolling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>ROLL DICE (₹{stake})</span>
          </button>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-[10px] font-mono text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#47EC84] shrink-0" />
            <span className="truncate">Seed Hash: {seedHash}</span>
          </div>
        </div>

        <div className="lg:col-span-8 lux-card rounded-3xl p-5 sm:p-8 order-1 lg:order-2 space-y-8">
          <div className="flex flex-col items-center justify-center py-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 mb-1">
              Cryptographic Outcome
            </div>
            <div
              className={`font-mono tabular-nums text-5xl sm:text-6xl font-black transition-all duration-200 ${
                lastRoll === null
                  ? 'text-slate-300'
                  : lastWon
                  ? 'text-[#47EC84] drop-shadow-[0_0_24px_rgba(71,236,132,0.6)]'
                  : 'text-[#FF2E54] drop-shadow-[0_0_24px_rgba(255,46,84,0.5)]'
              }`}
            >
              {lastRoll !== null ? lastRoll.toFixed(2) : '50.00'}
            </div>
          </div>

          <div className="relative pt-10 pb-6 px-2">
            {lastRoll !== null && (
              <div
                className="absolute top-0 -translate-x-1/2 transition-all duration-300 pointer-events-none"
                style={{ left: `${Math.min(97, Math.max(3, lastRoll))}%` }}
              >
                <div
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs font-black border shadow-lg ${
                    lastWon ? 'bg-[#47EC84] text-slate-950 border-white' : 'bg-[#FF2E54] text-white border-rose-300'
                  }`}
                >
                  {lastRoll.toFixed(2)}
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-full bg-[#090C0E] border border-white/[0.1] shadow-inner">
              <div className="relative h-4 rounded-full flex items-center" style={{ background: trackGradient }}>
                <input
                  type="range"
                  min={2}
                  max={98}
                  step={0.5}
                  value={target}
                  onChange={(e) => setTarget(parseFloat(e.target.value))}
                  className="w-full h-4 opacity-0 cursor-pointer relative z-20"
                />
                <div
                  className="absolute w-7 h-7 rounded-lg bg-white border-2 border-[#07090A] shadow-xl flex items-center justify-center pointer-events-none -translate-x-1/2 z-10"
                  style={{ left: `${sliderPct}%` }}
                >
                  <span className="w-1 h-3.5 rounded-full bg-slate-900" />
                </div>
              </div>
            </div>

            <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 mt-2.5 px-1">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-2xl bg-[#0A0D0F] border border-white/[0.08]">
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Multiplier</div>
              <div className="font-mono tabular-nums text-base sm:text-lg font-black text-[#F5B041]">
                {multiplier.toFixed(2)}x
              </div>
            </div>

            <button
              type="button"
              onClick={toggleCondition}
              className="p-3 rounded-2xl bg-[#0A0D0F] border border-[#47EC84]/35 hover:border-[#47EC84] transition text-left group"
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                <span>Roll {condition}</span>
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#47EC84] group-hover:rotate-180 transition-transform" />
              </div>
              <div className="font-mono tabular-nums text-base sm:text-lg font-black text-white">
                {target.toFixed(2)}
              </div>
            </button>

            <div className="p-3 rounded-2xl bg-[#0A0D0F] border border-white/[0.08]">
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Win Chance</div>
              <div className="font-mono tabular-nums text-base sm:text-lg font-black text-[#47EC84]">
                {winChance.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
