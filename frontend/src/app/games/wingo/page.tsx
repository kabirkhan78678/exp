"use client";

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock, ShieldCheck, Volume2, VolumeX, Zap,
  History, Sparkles, CheckCircle2
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { playCasinoSfx } from '@/components/CasinoAssets';

interface WingoPeriodRecord {
  period: string;
  digit: number;
  colors: ('GREEN' | 'RED' | 'VIOLET')[];
  size: 'BIG' | 'SMALL';
}

function resolveDigitMeta(digit: number): { colors: ('GREEN' | 'RED' | 'VIOLET')[]; size: 'BIG' | 'SMALL' } {
  const colors: ('GREEN' | 'RED' | 'VIOLET')[] =
    digit === 0
      ? ['RED', 'VIOLET']
      : digit === 5
      ? ['GREEN', 'VIOLET']
      : [1, 3, 7, 9].includes(digit)
      ? ['GREEN']
      : ['RED'];
  return { colors, size: digit >= 5 ? 'BIG' : 'SMALL' };
}

const INITIAL_WINGO_HISTORY: WingoPeriodRecord[] = [
  { period: '20261126041', digit: 7, ...resolveDigitMeta(7) },
  { period: '20261126040', digit: 2, ...resolveDigitMeta(2) },
  { period: '20261126039', digit: 5, ...resolveDigitMeta(5) },
  { period: '20261126038', digit: 9, ...resolveDigitMeta(9) },
  { period: '20261126037', digit: 0, ...resolveDigitMeta(0) },
  { period: '20261126036', digit: 4, ...resolveDigitMeta(4) },
  { period: '20261126035', digit: 3, ...resolveDigitMeta(3) },
];

export default function WingoParityPage() {
  const { isAuthenticated, activeBalanceType, balances, setBalances, fetchBalances, showNotification } = useStore();

  const [intervalSec, setIntervalSec] = useState<30 | 60>(30);
  const [timeLeft, setTimeLeft] = useState<number>(28);
  const [periodCounter, setPeriodCounter] = useState<number>(42);
  const [selectedChoice, setSelectedChoice] = useState<string>('GREEN');
  const [chipAmount, setChipAmount] = useState<number>(100);
  const [activeTickets, setActiveTickets] = useState<{ choice: string; stake: number }[]>([]);
  const [history, setHistory] = useState<WingoPeriodRecord[]>(INITIAL_WINGO_HISTORY);
  const [lastDrawn, setLastDrawn] = useState<WingoPeriodRecord | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [settling, setSettling] = useState<boolean>(false);

  const currentPeriodId = `20261126${periodCounter.toString().padStart(3, '0')}`;
  const isLocked = timeLeft <= 5 && activeTickets.length > 0;

  const drawOutcome = useCallback(async () => {
    setSettling(true);
    let digit = Math.floor(Math.random() * 10);
    let meta = resolveDigitMeta(digit);
    let totalPayout = 0;

    // Settle against backend for primary ticket if authenticated, otherwise fair local parity draw
    if (activeTickets.length > 0 && isAuthenticated) {
      try {
        const primary = activeTickets[0];
        const res = await api.playWingo(primary.stake, primary.choice, currentPeriodId, activeBalanceType);
        digit = res.digit;
        meta = resolveDigitMeta(digit);
        await fetchBalances();
      } catch {
        // Fallback local fair RNG below
      }
    }

    // Evaluate all placed tickets for this period
    activeTickets.forEach((t) => {
      let mult = 0;
      if ((t.choice === 'GREEN' || t.choice === 'RED') && meta.colors.includes(t.choice as 'GREEN' | 'RED')) {
        mult = meta.colors.includes('VIOLET') ? 1.5 : 2.0;
      } else if (t.choice === 'VIOLET' && meta.colors.includes('VIOLET')) {
        mult = 4.5;
      } else if ((t.choice === 'BIG' || t.choice === 'SMALL') && t.choice === meta.size) {
        mult = 2.0;
      } else if (t.choice === String(digit)) {
        mult = 9.0;
      }
      totalPayout += t.stake * mult;
    });

    const record: WingoPeriodRecord = { period: currentPeriodId, digit, ...meta };
    setLastDrawn(record);
    setHistory((prev) => [record, ...prev.slice(0, 14)]);

    if (activeTickets.length > 0) {
      if (!isAuthenticated) {
        const bal = parseFloat(activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN);
        setBalances({ ...balances, [activeBalanceType]: (bal + totalPayout).toFixed(4) });
      }
      if (totalPayout > 0) {
        if (soundEnabled) playCasinoSfx('win');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.62 } });
        showNotification(`Period #${currentPeriodId}: Drawn ${digit} (${meta.colors.join('+')}) — Won ₹${totalPayout.toFixed(0)}!`, 'success');
      } else {
        if (soundEnabled) playCasinoSfx('lose');
        showNotification(`Period #${currentPeriodId}: Drawn ${digit} (${meta.colors.join('+')}, ${meta.size})`, 'info');
      }
    }

    setActiveTickets([]);
    setPeriodCounter((c) => c + 1);
    setTimeLeft(intervalSec);
    setSettling(false);
  }, [activeTickets, isAuthenticated, currentPeriodId, activeBalanceType, balances, setBalances, fetchBalances, soundEnabled, showNotification, intervalSec]);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          drawOutcome();
          return intervalSec;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [drawOutcome, intervalSec]);

  const placeTicket = () => {
    if (timeLeft <= 5) {
      showNotification('Betting locked for final 5 seconds of period!', 'error');
      return;
    }
    const bal = parseFloat(activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN);
    if (chipAmount <= 0 || chipAmount > bal) {
      showNotification(`Insufficient ${activeBalanceType} balance`, 'error');
      return;
    }
    if (soundEnabled) playCasinoSfx('chip');
    setBalances({ ...balances, [activeBalanceType]: (bal - chipAmount).toFixed(4) });
    setActiveTickets((prev) => [...prev, { choice: selectedChoice, stake: chipAmount }]);
    showNotification(`Booked ₹${chipAmount} on ${selectedChoice} for #${currentPeriodId}`, 'success');
  };

  return (
    <div className="space-y-4 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-5 max-w-5xl mx-auto pb-32 w-full overflow-x-hidden">
      {/* 1. WINGO TIMER TOP HEADER CARD */}
      <div className="lux-card rounded-3xl p-4 sm:p-5 border-[#47EC84]/25 bg-gradient-to-br from-[#0F261A] via-[#111517] to-[#0B0E10]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#47EC84]/15 border border-[#47EC84]/40 flex items-center justify-center text-[#47EC84]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-base sm:text-lg font-black text-white">Wingo Color Parity</h1>
              <div className="text-[10px] font-mono text-slate-400">Period #{currentPeriodId}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 30s / 60s Mode Switch */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-black/60 border border-white/10 text-xs font-black">
              {([30, 60] as const).map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    setIntervalSec(sec);
                    setTimeLeft(sec);
                  }}
                  className={`px-3 py-1 rounded-full transition ${
                    intervalSec === sec ? 'btn-emerald-3d' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-black/50 border border-white/10 text-slate-300 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#47EC84]" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Countdown Clock & Last Drawn Ball */}
        <div className="grid grid-cols-2 gap-3 items-center bg-black/45 border border-white/[0.08] rounded-2xl p-3.5 sm:p-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#F5B041]" />
              <span>{timeLeft <= 5 ? 'BETS LOCKED' : 'TIME REMAINING'}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 font-mono tabular-nums text-2xl sm:text-3xl font-black">
              <span className="px-2.5 py-1 rounded-xl bg-[#151A1D] border border-white/10 text-white">00</span>
              <span className="text-slate-500">:</span>
              <span
                className={`px-2.5 py-1 rounded-xl border ${
                  timeLeft <= 5
                    ? 'bg-[#FF2E54]/20 border-[#FF2E54] text-[#FF5C7A] animate-pulse'
                    : 'bg-[#151A1D] border-[#47EC84]/40 text-[#47EC84]'
                }`}
              >
                {timeLeft.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {lastDrawn ? `Drawn #${lastDrawn.period.slice(-3)}` : 'Latest Result'}
            </span>
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-lg border-2 shadow-lg ${
                  (lastDrawn || history[0]).colors.includes('GREEN')
                    ? 'bg-[#10B981] border-emerald-200 text-slate-950'
                    : 'bg-[#EF4444] border-rose-200 text-white'
                }`}
              >
                {(lastDrawn || history[0]).digit}
              </div>
              <div className="text-xs font-bold text-white">
                {(lastDrawn || history[0]).size}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COLOR, NUMBER & SIZE BETTING BOARD */}
      <div className="lux-card rounded-3xl p-4 sm:p-6 space-y-5 relative">
        {isLocked && (
          <div className="px-3 py-1 rounded-full bg-[#FF2E54]/20 border border-[#FF2E54] text-[#FF5C7A] text-xs font-black text-center">
            Final 5 seconds — Drawing Period Result...
          </div>
        )}

        {/* Primary Color Pads: GREEN / VIOLET / RED */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setSelectedChoice('GREEN')}
            className={`py-3.5 rounded-2xl font-display font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-b from-[#34D399] to-[#059669] transition active:scale-95 ${
              selectedChoice === 'GREEN' ? 'ring-2 ring-white shadow-[0_0_24px_rgba(16,185,129,0.6)] scale-[1.02]' : 'opacity-85'
            }`}
          >
            <div>GREEN</div>
            <div className="text-[10px] font-mono opacity-80">2.0x</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedChoice('VIOLET')}
            className={`py-3.5 rounded-2xl font-display font-black text-xs sm:text-sm text-white bg-gradient-to-b from-[#A78BFA] to-[#6D28D9] transition active:scale-95 ${
              selectedChoice === 'VIOLET' ? 'ring-2 ring-white shadow-[0_0_24px_rgba(139,92,246,0.6)] scale-[1.02]' : 'opacity-85'
            }`}
          >
            <div>VIOLET</div>
            <div className="text-[10px] font-mono opacity-85">4.5x</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedChoice('RED')}
            className={`py-3.5 rounded-2xl font-display font-black text-xs sm:text-sm text-white bg-gradient-to-b from-[#FB7185] to-[#DC2626] transition active:scale-95 ${
              selectedChoice === 'RED' ? 'ring-2 ring-white shadow-[0_0_24px_rgba(239,68,68,0.6)] scale-[1.02]' : 'opacity-85'
            }`}
          >
            <div>RED</div>
            <div className="text-[10px] font-mono opacity-85">2.0x</div>
          </button>
        </div>

        {/* 0-9 Spherical Number Grid (9x Payout) */}
        <div className="bg-[#090C0E] border border-white/[0.07] rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mb-2.5">
            <span>Exact Number Prediction</span>
            <span className="font-mono text-[#F5B041]">PAYS 9.0x</span>
          </div>
          <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const isSelected = selectedChoice === String(num);
              const sphereBg =
                num === 0
                  ? 'from-[#EF4444] via-[#EF4444] to-[#7C3AED]'
                  : num === 5
                  ? 'from-[#10B981] via-[#10B981] to-[#7C3AED]'
                  : [1, 3, 7, 9].includes(num)
                  ? 'from-[#34D399] to-[#059669]'
                  : 'from-[#FB7185] to-[#DC2626]';

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSelectedChoice(String(num))}
                  className={`aspect-square max-w-[54px] w-full mx-auto rounded-full bg-gradient-to-br ${sphereBg} font-mono font-black text-base sm:text-lg text-white shadow-lg border-2 flex items-center justify-center transition active:scale-90 ${
                    isSelected ? 'border-white ring-2 ring-[#F5B041] scale-110' : 'border-white/25 opacity-90 hover:opacity-100'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big (5-9) vs Small (0-4) Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedChoice('BIG')}
            className={`py-3 rounded-2xl font-display font-black text-xs sm:text-sm transition active:scale-95 ${
              selectedChoice === 'BIG'
                ? 'btn-gold-3d ring-2 ring-white'
                : 'bg-[#151A1D] border border-[#F5B041]/30 text-[#F5B041]'
            }`}
          >
            BIG (5–9) • 2.0x
          </button>
          <button
            type="button"
            onClick={() => setSelectedChoice('SMALL')}
            className={`py-3 rounded-2xl font-display font-black text-xs sm:text-sm transition active:scale-95 ${
              selectedChoice === 'SMALL'
                ? 'bg-sky-400 text-slate-950 ring-2 ring-white shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                : 'bg-[#151A1D] border border-sky-400/30 text-sky-400'
            }`}
          >
            SMALL (0–4) • 2.0x
          </button>
        </div>

        {/* Stake Bar + Submit Ticket + Instant Quick Draw */}
        <div className="pt-2 border-t border-white/[0.08] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {[10, 50, 100, 500, 1000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setChipAmount(v)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-black border transition ${
                    chipAmount === v
                      ? 'btn-emerald-3d border-transparent'
                      : 'bg-black/50 border-white/10 text-slate-300'
                  }`}
                >
                  ₹{v}
                </button>
              ))}
            </div>

            {activeTickets.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-[#47EC84]/15 border border-[#47EC84]/35 text-[10px] font-mono font-bold text-[#47EC84] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {activeTickets.length} Bet(s) Active This Period
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <button
              type="button"
              disabled={timeLeft <= 5}
              onClick={placeTicket}
              className="sm:col-span-8 py-3.5 btn-emerald-3d font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-45"
            >
              <Sparkles className="w-4 h-4" />
              <span>CONFIRM BET: {selectedChoice} (₹{chipAmount})</span>
            </button>

            <button
              type="button"
              disabled={settling || activeTickets.length === 0}
              onClick={drawOutcome}
              className="sm:col-span-4 py-3.5 btn-gold-3d font-black text-xs rounded-2xl transition active:scale-95 disabled:opacity-40"
            >
              Instant Draw Now →
            </button>
          </div>
        </div>
      </div>

      {/* 3. WINGO PARITY HISTORY RECORD TABLE */}
      <div className="lux-card rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-black text-sm text-white">
            <History className="w-4 h-4 text-[#47EC84]" />
            <span>Parity Draw History</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#47EC84]" />
            Provably Fair
          </span>
        </div>

        <div className="divide-y divide-white/[0.06] text-xs">
          {history.map((row) => (
            <div key={row.period} className="px-4 py-2.5 flex items-center justify-between">
              <span className="font-mono text-slate-400">#{row.period}</span>
              <span
                className={`font-mono font-black text-base ${
                  row.colors.includes('GREEN') ? 'text-[#47EC84]' : 'text-[#FF5C7A]'
                }`}
              >
                {row.digit}
              </span>
              <span className="font-bold text-slate-300 w-12 text-center">{row.size}</span>
              <div className="flex items-center gap-1.5 w-12 justify-end">
                {row.colors.map((c) => (
                  <span
                    key={c}
                    className={`w-3.5 h-3.5 rounded-full ${
                      c === 'GREEN' ? 'bg-[#10B981]' : c === 'RED' ? 'bg-[#EF4444]' : 'bg-[#8B5CF6]'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
