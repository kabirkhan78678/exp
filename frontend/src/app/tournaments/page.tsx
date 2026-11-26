"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Trophy, Clock, Disc, Crown, Users, ArrowRight,
  CheckCircle2, Sparkles, Swords, ShieldCheck
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

interface BracketMatch {
  stage: string;
  p1: string;
  s1: number;
  p2: string;
  s2: number;
  winner: string;
}

interface TournamentItem {
  id: string;
  slug: string;
  title: string;
  game_slug: string;
  schedule_type: 'HOURLY' | 'WEEKEND';
  prize_pool: string;
  entry_fee: string;
  max_players: number;
  participants_count: number;
  status: string;
  ends_at: string;
  is_joined: boolean;
  bracket_json: BracketMatch[];
}

function formatCountdown(targetIso: string, nowMs: number) {
  const diffSec = Math.max(0, Math.floor((new Date(targetIso).getTime() - nowMs) / 1000));
  const h = Math.floor(diffSec / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  const s = diffSec % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

export default function TournamentsPage() {
  const { user, isAuthenticated, activeBalanceType, balances, setBalances, fetchBalances, showNotification } = useStore();
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [filterGame, setFilterGame] = useState<'ALL' | 'carrom' | 'ludo'>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'HOURLY' | 'WEEKEND'>('ALL');
  const [selectedSlug, setSelectedSlug] = useState<string>('carrom-hourly-blitz');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    api.getTournaments().then((res) => {
      if (res.tournaments?.length) {
        setTournaments(res.tournaments);
        setSelectedSlug(res.tournaments[0].slug);
      }
    });
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleJoin = async (trn: TournamentItem) => {
    if (trn.is_joined) return;
    const fee = parseFloat(trn.entry_fee || '0');
    const bal = parseFloat(activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN);

    if (bal < fee) {
      showNotification(`Insufficient ${activeBalanceType} balance (Need ₹${fee})`, 'error');
      return;
    }

    setJoiningId(trn.id);
    try {
      if (isAuthenticated) {
        try {
          const res = await api.joinTournament(trn.id, activeBalanceType);
          if (res.balances) setBalances(res.balances);
          else await fetchBalances();
          setTournaments((prev) =>
            prev.map((item) => (item.id === trn.id ? { ...res.tournament, is_joined: true } : item))
          );
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
          showNotification(res.message, 'success');
          setJoiningId(null);
          return;
        } catch (err: any) {
          if (err?.message && err.message.includes('already registered')) {
            showNotification(err.message, 'info');
            setJoiningId(null);
            return;
          }
        }
      }

      // Demo fallback
      setBalances({
        ...balances,
        [activeBalanceType]: Math.max(0, bal - fee).toFixed(4),
      });
      const playerHandle = user?.username || 'You (Seed #8)';
      setTournaments((prev) =>
        prev.map((item) => {
          if (item.id !== trn.id) return item;
          const updatedBracket = (item.bracket_json || []).map((m) =>
            m.p2.startsWith('Open') ? { ...m, p2: playerHandle } : m
          );
          return {
            ...item,
            is_joined: true,
            participants_count: Math.min(item.max_players, item.participants_count + 1),
            bracket_json: updatedBracket,
          };
        })
      );
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      showNotification(`Seat confirmed in ${trn.title}! Play now to post points.`, 'success');
    } finally {
      setJoiningId(null);
    }
  };

  const filtered = tournaments.filter((t) => {
    const okGame = filterGame === 'ALL' || t.game_slug === filterGame;
    const okType = filterType === 'ALL' || t.schedule_type === filterType;
    return okGame && okType;
  });

  const activeBracketTourney = tournaments.find((t) => t.slug === selectedSlug) || filtered[0] || tournaments[0];

  return (
    <div className="space-y-5 sm:space-y-7 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-6 w-full overflow-x-clip">
      {/* Hero Banner */}
      <section className="lux-card rounded-3xl p-4 xs:p-6 sm:p-8 bg-gradient-to-br from-[#1B1206] via-[#111517] to-[#0A1710] border-[#F5B041]/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="telemetry-badge text-[#F5B041] border-[#F5B041]/40 bg-[#F5B041]/15">
                <Trophy className="w-3 h-3" />
                ₹1,10,000 LIVE PRIZE POOLS
              </span>
              <span className="telemetry-badge text-[#47EC84] border-[#47EC84]/35 bg-[#47EC84]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#47EC84] animate-ping" />
                HOURLY &amp; WEEKEND
              </span>
            </div>
            <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl font-black text-white tracking-tight">
              Carrom &amp; Ludo Skill Tournaments
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Join scheduled ₹10,000 Hourly Blitz or ₹50,000 Weekend Masters brackets. Post high match scores in Carrom 2D or Ludo Arena to claim top leaderboard prizes!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/games/carrom" className="px-4 py-2.5 rounded-xl btn-gold-3d text-xs font-black flex items-center gap-1.5">
              <Disc className="w-4 h-4" />
              <span>Play Carrom</span>
            </Link>
            <Link href="/games/ludo" className="px-4 py-2.5 rounded-xl btn-emerald-3d text-xs font-black flex items-center gap-1.5">
              <Crown className="w-4 h-4" />
              <span>Play Ludo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {([
            { v: 'ALL', l: 'All Boards' },
            { v: 'carrom', l: 'Carrom 2D' },
            { v: 'ludo', l: 'Ludo Arena' },
          ] as const).map((item) => (
            <button
              key={item.v}
              onClick={() => setFilterGame(item.v)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                filterGame === item.v ? 'btn-emerald-3d' : 'lux-card text-slate-300 hover:text-white'
              }`}
            >
              {item.l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-full bg-[#111517] border border-white/10 text-xs font-black">
          {(['ALL', 'HOURLY', 'WEEKEND'] as const).map((tp) => (
            <button
              key={tp}
              onClick={() => setFilterType(tp)}
              className={`px-3 py-1 rounded-full transition ${
                filterType === tp ? 'btn-gold-3d' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Tournament Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((trn) => {
          const prize = parseFloat(trn.prize_pool || '0');
          const fee = parseFloat(trn.entry_fee || '0');
          const pct = Math.min(100, Math.round((trn.participants_count / Math.max(1, trn.max_players)) * 100));
          const isCarrom = trn.game_slug === 'carrom';

          return (
            <div
              key={trn.id}
              onClick={() => setSelectedSlug(trn.slug)}
              className={`p-4 sm:p-5 rounded-3xl lux-card transition cursor-pointer flex flex-col justify-between space-y-4 ${
                selectedSlug === trn.slug ? 'border-[#47EC84]/55 shadow-glow' : 'hover:border-white/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                        isCarrom
                          ? 'bg-[#F5B041]/15 border-[#F5B041]/40 text-[#F5B041]'
                          : 'bg-sky-400/15 border-sky-400/40 text-sky-400'
                      }`}
                    >
                      {isCarrom ? <Disc className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            trn.schedule_type === 'WEEKEND'
                              ? 'bg-[#F5B041]/20 border-[#F5B041]/45 text-[#F5B041]'
                              : 'bg-[#47EC84]/15 border-[#47EC84]/35 text-[#47EC84]'
                          }`}
                        >
                          {trn.schedule_type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#FF5C7A]" />
                          <span>{formatCountdown(trn.ends_at, nowMs)}</span>
                        </span>
                      </div>
                      <h2 className="font-display font-black text-sm sm:text-base text-white mt-0.5">{trn.title}</h2>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[9px] uppercase font-bold text-slate-400">Prize Pool</div>
                    <div className="font-mono tabular-nums text-lg sm:text-xl font-black text-[#F5B041]">
                      ₹{prize.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Prize Distribution Strip */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-black/45 border border-white/[0.06] text-center font-mono text-[10px]">
                  <div>
                    <div className="text-slate-400">1st Place</div>
                    <div className="font-black text-[#F5B041]">₹{Math.round(prize * 0.45).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">2nd Place</div>
                    <div className="font-black text-slate-200">₹{Math.round(prize * 0.25).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">3rd + Top 10</div>
                    <div className="font-black text-[#47EC84]">₹{Math.round(prize * 0.30).toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Player Slots Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#47EC84]" />
                      {trn.participants_count} / {trn.max_players} Enrolled
                    </span>
                    <span>Entry: ₹{fee} ({activeBalanceType})</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#47EC84] to-[#F5B041] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {trn.is_joined ? (
                  <Link
                    href={`/games/${trn.game_slug}`}
                    className="flex-1 py-2.5 rounded-2xl btn-emerald-3d font-black text-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enrolled — Play Match Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={joiningId === trn.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoin(trn);
                    }}
                    className="flex-1 py-2.5 rounded-2xl btn-gold-3d font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{joiningId === trn.id ? 'Registering...' : `Join Bracket (₹${fee})`}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Live Knockout Bracket Viewer */}
      {activeBracketTourney && (
        <section className="lux-card rounded-3xl p-4 sm:p-6 space-y-4 border-[#F5B041]/25">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2 font-display font-black text-base text-white">
                <Swords className="w-4 h-4 text-[#F5B041]" />
                <span>Live Knockout Bracket — {activeBracketTourney.title}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Top 8 seeded duel matchups advancing to Semi-Finals &amp; Grand Final
              </p>
            </div>
            <span className="telemetry-badge text-[#47EC84] border-[#47EC84]/35 bg-[#47EC84]/10">
              <ShieldCheck className="w-3 h-3" />
              FAIR SCORE SEEDED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(activeBracketTourney.bracket_json || []).map((match, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#0A0D10] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="font-bold text-[#F5B041]">{match.stage} MATCHUP</span>
                  <span>{match.winner === 'TBD' ? 'OPEN SLOT' : 'SETTLED'}</span>
                </div>

                <div
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-mono ${
                    match.winner === match.p1 ? 'bg-[#47EC84]/15 border border-[#47EC84]/40 text-[#47EC84] font-black' : 'bg-white/[0.03] text-slate-300'
                  }`}
                >
                  <span className="truncate">{match.p1}</span>
                  <span>{match.s1} pts</span>
                </div>

                <div
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-mono ${
                    match.winner === match.p2 ? 'bg-[#47EC84]/15 border border-[#47EC84]/40 text-[#47EC84] font-black' : 'bg-white/[0.03] text-slate-300'
                  }`}
                >
                  <span className="truncate">{match.p2}</span>
                  <span>{match.s2} pts</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
