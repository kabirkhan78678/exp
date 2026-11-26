"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet, Bell, User as UserIcon, LogOut,
  ChevronDown, Flame, Gift, Sparkles, ArrowRight,
  Plus, Search, Crown, Trophy, Check, ArrowUpRight, Plane, Disc, Swords, Layers,
  Bomb, Dices, Zap
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { VeltrixLogoMark, GoldRupeeCoin } from '@/components/GameArtwork';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const {
    user, isAuthenticated, isAdmin, activeBalanceType, balances,
    setActiveBalanceType, openModal, logout, vipTier
  } = useStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const balanceRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const quickGames = [
    { name: 'AeroCrash Aviator', tag: 'CRASH • 100x', href: '/games/aerocrash', icon: Plane, color: 'text-[#FF2E54]' },
    { name: 'Mines Diamond Grid', tag: '5x5 VAULT', href: '/games/mines', icon: Bomb, color: 'text-[#47EC84]' },
    { name: 'Fair Dice Slider', tag: '0–100 • 99% RTP', href: '/games/dice', icon: Dices, color: 'text-sky-400' },
    { name: 'Wingo Color Parity', tag: '30s/60s • 9x', href: '/games/wingo', icon: Zap, color: 'text-violet-400' },
    { name: 'Dragon Tiger Live', tag: 'TABLE • 8:1', href: '/games/dragontiger', icon: Swords, color: 'text-rose-400' },
    { name: 'Teen Patti 3-Card', tag: 'CARDS • 5-SEAT', href: '/games/teenpatti', icon: Layers, color: 'text-[#47EC84]' },
    { name: 'Carrom 2D Arena', tag: 'SKILL • PHYSICS', href: '/games/carrom', icon: Disc, color: 'text-[#F5B041]' },
    { name: 'Ludo Arena Quick', tag: '2P / 4P • 5M', href: '/games/ludo', icon: Crown, color: 'text-sky-400' },
  ];

  const matchingGames = quickGames.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (balanceRef.current && !balanceRef.current.contains(e.target as Node)) setBalanceOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotificationsOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeAmount = activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN;
  const formattedBalance = parseFloat(activeAmount || '0').toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  const notificationsList = [
    { id: 1, title: 'Daily Streak Ready', desc: 'Claim up to ₹500 free bonus credits now.', time: '2m ago' },
    { id: 2, title: 'Instant UPI Vault Online', desc: 'Zero-fee NPCI QR deposits settle in <10s.', time: '1h ago' },
    { id: 3, title: 'High Roller Alert: 48.2x', desc: '@Vikram99 cashed ₹24,100 on AeroCrash.', time: '3h ago' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-14 xs:h-[60px] sm:h-16 bg-[#0B0E10]/90 backdrop-blur-2xl border-b border-white/[0.08] px-2.5 xs:px-3.5 sm:px-6 lg:px-8 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.65)] select-none max-w-full">
      {/* 1. Left: Hexagonal Crest & Wordmark */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
          <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <VeltrixLogoMark className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-[0_0_12px_rgba(71,236,132,0.35)]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#47EC84] shadow-[0_0_8px_#47EC84] animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="hidden xs:flex items-center gap-1.5">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.22em] font-extrabold text-[#F5B041]">
                IMPERIAL HOUSE
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-[#47EC84]/10 border border-[#47EC84]/25 text-[8px] font-mono text-[#47EC84]">
                <span className="w-1 h-1 rounded-full bg-[#47EC84] animate-ping" />
                LIVE
              </span>
            </div>
            <div className="font-display text-sm xs:text-base sm:text-lg font-extrabold tracking-tight text-white leading-none flex items-center gap-1">
              <span>VELTRIX</span>
              <span className="text-[#47EC84] drop-shadow-[0_0_10px_rgba(71,236,132,0.4)]">ARENA</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 2. Center: Interactive Command Game Finder (Desktop) */}
      <div className="hidden lg:flex items-center flex-1 max-w-sm mx-6 relative" ref={searchRef}>
        <div className="relative w-full group">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#47EC84] absolute left-3.5 top-1/2 -translate-y-1/2 transition" />
          <input
            type="text"
            value={searchTerm}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchFocused(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && matchingGames[0]) {
                router.push(matchingGames[0].href);
                setSearchFocused(false);
              }
            }}
            placeholder="Jump to arena (Aviator, Carrom...)"
            className="w-full pl-9 pr-14 py-2 rounded-full bg-[#13181B]/95 border border-white/[0.08] hover:border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#47EC84]/70 focus:ring-2 focus:ring-[#47EC84]/20 transition shadow-inner"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-[9px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </div>
        </div>

        {searchFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 lux-card rounded-2xl p-2 z-50 animate-scale-up">
            <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Certified Arenas
            </div>
            {matchingGames.length === 0 ? (
              <div className="px-3 py-3 text-xs text-slate-400">No matching arenas found.</div>
            ) : (
              matchingGames.map((game) => {
                const Icon = game.icon;
                return (
                  <Link
                    key={game.href}
                    href={game.href}
                    onClick={() => setSearchFocused(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.06] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${game.color}`} />
                      <span className="text-xs font-bold text-white">{game.name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">{game.tag}</span>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 3. Right: Sculpted Vault Capsule & VIP Utilities */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {isAuthenticated ? (
          <>
            {/* Signature Vault Balance Capsule */}
            <div className="relative" ref={balanceRef}>
              <div className="flex items-center bg-[#121619] border border-white/[0.12] hover:border-[#47EC84]/40 rounded-full p-0.5 xs:p-1 pl-1.5 xs:pl-2 sm:pl-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition">
                <button
                  onClick={() => setBalanceOpen(!balanceOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 pr-1.5 sm:pr-2 group active:scale-95 transition"
                  title="Switch Demo / Real Cash Wallet"
                >
                  <GoldRupeeCoin className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 group-hover:rotate-12 transition-transform duration-300" />

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[7.5px] xs:text-[8px] font-black uppercase tracking-widest leading-none ${
                          activeBalanceType === 'DEMO' ? 'text-[#F5B041]' : 'text-[#47EC84]'
                        }`}
                      >
                        {activeBalanceType}
                      </span>
                      <ChevronDown className="w-2.5 h-2.5 text-slate-400 group-hover:text-white transition" />
                    </div>
                    <span className="font-mono tabular-nums text-[11px] xs:text-xs sm:text-sm font-black text-white leading-tight mt-0.5">
                      ₹{formattedBalance}
                    </span>
                  </div>
                </button>

                <div className="w-px h-4 xs:h-5 bg-white/10 mx-0.5 sm:mx-1" />

                <button
                  onClick={() => openModal('deposit')}
                  className="relative overflow-hidden h-7 xs:h-[30px] sm:h-8 px-2.5 xs:px-3 sm:px-3.5 rounded-full btn-emerald-3d flex items-center gap-1 font-black text-xs active:scale-95 transition shrink-0"
                  title="Instant QR Deposit"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="text-[10px] xs:text-[11px] sm:text-xs font-extrabold uppercase tracking-wide hidden xs:inline">
                    Deposit
                  </span>
                </button>
              </div>

              {/* Balance Vault Popover */}
              {balanceOpen && (
                <div className="fixed sm:absolute top-16 sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:mt-2.5 sm:w-80 max-w-sm mx-auto sm:mx-0 lux-card rounded-2xl p-4 z-50 animate-scale-up">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-[#47EC84]" />
                      Vault Accounts
                    </span>
                    <Link
                      href="/wallet"
                      onClick={() => setBalanceOpen(false)}
                      className="text-[10px] font-bold text-[#47EC84] hover:underline flex items-center gap-0.5"
                    >
                      Open Cashier <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Mode Switcher */}
                  <div className="grid grid-cols-2 gap-1.5 mt-3 p-1 rounded-xl bg-black/50 border border-white/[0.06]">
                    <button
                      onClick={() => {
                        setActiveBalanceType('DEMO');
                        setBalanceOpen(false);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                        activeBalanceType === 'DEMO'
                          ? 'btn-gold-3d shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>DEMO</span>
                      {activeBalanceType === 'DEMO' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <button
                      onClick={() => {
                        setActiveBalanceType('MAIN');
                        setBalanceOpen(false);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                        activeBalanceType === 'MAIN'
                          ? 'btn-emerald-3d shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>REAL CASH</span>
                      {activeBalanceType === 'MAIN' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </div>

                  {/* Detailed Balances */}
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Demo Credits</div>
                        <div className="text-xs font-semibold text-slate-200">Practice & Fun Play</div>
                      </div>
                      <span className="font-mono tabular-nums text-sm font-black text-[#F5B041]">
                        ₹{parseFloat(balances.DEMO || '0').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Real Cash</div>
                        <div className="text-xs font-semibold text-slate-200">Withdrawable Balance</div>
                      </div>
                      <span className="font-mono tabular-nums text-sm font-black text-[#47EC84]">
                        ₹{parseFloat(balances.MAIN || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Bonus Cash</div>
                        <div className="text-xs font-semibold text-slate-200">VIP & Streak Rewards</div>
                      </div>
                      <span className="font-mono tabular-nums text-sm font-black text-amber-300">
                        ₹{parseFloat(balances.BONUS || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-white/[0.08]">
                    <button
                      onClick={() => {
                        setBalanceOpen(false);
                        openModal('deposit');
                      }}
                      className="w-full py-2 rounded-xl btn-emerald-3d font-black text-xs transition active:scale-95"
                    >
                      + Deposit
                    </button>
                    <Link
                      href="/wallet?tab=withdraw"
                      onClick={() => setBalanceOpen(false)}
                      className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 font-bold text-xs text-center transition flex items-center justify-center"
                    >
                      Withdraw
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Gift Chest (Desktop / Tablet) */}
            <button
              onClick={() => openModal('dailyReward')}
              title="Claim Daily Streak Bonus"
              className="hidden sm:flex relative p-2 rounded-full bg-[#121619] hover:bg-[#191F23] border border-white/[0.08] hover:border-[#F5B041]/50 text-[#F5B041] transition active:scale-95 shrink-0"
            >
              <Gift className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#47EC84] shadow-[0_0_6px_#47EC84]" />
            </button>

            {/* Notifications Bell */}
            <div className="hidden xs:block relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setHasUnreadNotifs(false);
                }}
                title="Activity Alerts"
                className="relative p-1.5 sm:p-2 rounded-full bg-[#121619] hover:bg-[#191F23] border border-white/[0.08] hover:border-white/20 text-slate-300 transition active:scale-95 shrink-0"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {hasUnreadNotifs && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#FF2E54] shadow-[0_0_8px_#FF2E54] animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="fixed sm:absolute top-16 sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:mt-2.5 sm:w-80 max-w-sm mx-auto sm:mx-0 lux-card rounded-2xl p-3 z-50 animate-scale-up">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] px-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#47EC84]" />
                      Arena Telemetry
                    </span>
                    <span className="text-[10px] text-[#47EC84] font-mono">LIVE</span>
                  </div>
                  <div className="divide-y divide-white/[0.06] mt-1 max-h-64 overflow-y-auto">
                    {notificationsList.map((item) => (
                      <div key={item.id} className="py-2.5 px-2 hover:bg-white/[0.03] rounded-xl transition">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-white">{item.title}</p>
                          <span className="text-[9px] text-slate-400 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* VIP Profile Avatar Ring */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#47EC84] via-emerald-300 to-[#F5B041] shadow-[0_0_14px_rgba(71,236,132,0.3)] active:scale-95 transition shrink-0"
                title="VIP Account Menu"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0B0E10] flex items-center justify-center font-display font-black text-[10px] xs:text-xs text-[#47EC84]">
                  {user?.username?.substring(0, 2).toUpperCase() || 'VX'}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#47EC84] border-2 border-[#0B0E10]" />
              </button>

              {profileOpen && (
                <div
                  className="fixed sm:absolute top-16 sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:mt-2.5 sm:w-64 max-w-sm mx-auto sm:mx-0 lux-card rounded-2xl p-2 z-50 animate-scale-up"
                  onClick={() => setProfileOpen(false)}
                >
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] mb-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">{user?.username || 'VIP Player'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#F5B041]/20 text-[#F5B041] border border-[#F5B041]/30 flex items-center gap-1 shrink-0">
                        <Crown className="w-2.5 h-2.5" />
                        {vipTier || 'BRONZE'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition font-medium">
                      <UserIcon className="w-4 h-4 text-[#47EC84]" />
                      <span>My Profile & VIP</span>
                    </Link>

                    <Link href="/wallet" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition font-medium">
                      <Wallet className="w-4 h-4 text-[#F5B041]" />
                      <span>Deposit & Withdraw</span>
                    </Link>

                    <Link href="/rewards" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition font-medium">
                      <Trophy className="w-4 h-4 text-[#47EC84]" />
                      <span>VIP Rewards</span>
                    </Link>

                    {isAdmin && (
                      <Link href="/admin" className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-violet-300 font-semibold hover:bg-violet-950/30 transition border border-violet-500/20 my-1">
                        <span className="flex items-center gap-2">
                          <Flame className="w-4 h-4" />
                          Admin Center
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}

                    <div className="pt-1 border-t border-white/[0.08] mt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#FF2E54] hover:bg-rose-950/30 transition font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5 xs:gap-2">
            <button
              onClick={() => openModal('login')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-slate-200 hover:text-[#47EC84] rounded-full hover:bg-white/[0.05] transition"
            >
              Sign In
            </button>
            <button
              onClick={() => openModal('register')}
              className="px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs font-black btn-emerald-3d rounded-full transition active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Play Now</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
