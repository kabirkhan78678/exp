"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Wallet, Bell, User as UserIcon, LogOut, 
  ChevronDown, Flame, Gift, Sparkles, ShieldCheck, ArrowRight, 
  Plus, Search, Dices, Crown, Trophy, Coins, Check, ArrowUpRight
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { 
    user, isAuthenticated, isAdmin, activeBalanceType, balances, 
    setActiveBalanceType, openModal, logout, vipTier 
  } = useStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);

  const profileRef = useRef<HTMLDivElement>(null);
  const balanceRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (balanceRef.current && !balanceRef.current.contains(e.target as Node)) {
        setBalanceOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeAmount = activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN;
  const formattedBalance = parseFloat(activeAmount || '0').toLocaleString('en-IN', {
    maximumFractionDigits: 0
  });

  const notificationsList = [
    { id: 1, title: '🎁 Daily Login Streak Ready', desc: 'Claim your day streak bonus of ₹50.00 demo cash.', time: '2m ago', unread: true },
    { id: 2, title: '⚡ Instant UPI Cashier Active', desc: 'Zero fee QR deposits credited within 10 seconds.', time: '1h ago', unread: true },
    { id: 3, title: '🚀 AeroCrash Multiplier 48.2x', desc: 'Player @Vikram99 cashed out ₹24,100 on AeroCrash.', time: '3h ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-14 xs:h-15 sm:h-16 bg-[#121516]/95 backdrop-blur-2xl border-b border-white/[0.07] px-2 xs:px-3 sm:px-6 lg:px-8 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.7)] select-none max-w-full overflow-x-hidden">
      
      {/* 1. Left: Luxury Casino Branding */}
      <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 shrink-0">
        <Link href="/" className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 group">
          {/* Glowing 3D Casino Crest */}
          <div className="relative w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1d4328] via-[#13281a] to-[#0a140d] border border-[#47EC84]/60 flex items-center justify-center shadow-[0_0_15px_rgba(71,236,132,0.3)] group-hover:scale-105 group-hover:border-[#47EC84] transition-all duration-300 shrink-0">
            <Dices className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-[#47EC84] drop-shadow-[0_0_8px_rgba(71,236,132,0.8)] stroke-[2.2]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-[#47EC84] shadow-[0_0_6px_#47EC84] animate-pulse" />
          </div>

          {/* Typography */}
          <div className="flex flex-col">
            <div className="hidden xs:flex items-center gap-1">
              <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-black text-[#F59E0B]">
                ROYAL SPIN
              </span>
              <span className="w-1 h-1 rounded-full bg-[#47EC84] animate-ping opacity-80" />
            </div>
            <div className="text-xs xs:text-sm sm:text-base font-black tracking-tight text-white leading-tight -mt-0.5 sm:-mt-1 flex items-center gap-1">
              <span>VELTRIX</span>
              <span className="text-[#47EC84] drop-shadow-[0_0_12px_rgba(71,236,132,0.5)]">ARENA</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 2. Center: Sleek Quick Game Search (Desktop only) */}
      <div className="hidden lg:flex items-center flex-1 max-w-sm mx-6">
        <div className="relative w-full group">
          <Search className="w-4 h-4 text-zinc-400 group-hover:text-[#47EC84] absolute left-3.5 top-1/2 -translate-y-1/2 transition" />
          <input
            type="text"
            placeholder="Search games, live tables, crash..."
            className="w-full pl-9 pr-14 py-2 rounded-full bg-[#1b1f20]/90 border border-white/[0.08] hover:border-white/20 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#47EC84] focus:ring-2 focus:ring-[#47EC84]/25 transition shadow-inner"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] font-mono text-zinc-400">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* 3. Right: High-Roller Wallet & Utilities */}
      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-3 shrink-0">
        {isAuthenticated ? (
          <>
            {/* Centerpiece: The Luxury Casino Balance & Quick Deposit Pill */}
            <div className="relative" ref={balanceRef}>
              <div className="flex items-center bg-gradient-to-r from-[#1a1f20] via-[#1d2224] to-[#1a1f20] border border-white/[0.12] hover:border-[#47EC84]/40 rounded-full p-0.5 xs:p-1 pl-1.5 xs:pl-2 sm:pl-3 shadow-[0_2px_12px_rgba(0,0,0,0.5)] transition duration-200">
                {/* Balance display & modal trigger */}
                <button
                  onClick={() => setBalanceOpen(!balanceOpen)}
                  className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 pr-1 xs:pr-1.5 sm:pr-2 group active:scale-95 transition"
                  title="Click to view balance breakdown & switch Demo/Real mode"
                >
                  {/* Glowing Coin Icon */}
                  <div className="relative w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-[#F59E0B] via-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center text-[9px] xs:text-[10px] sm:text-xs font-black shadow-[0_0_8px_rgba(245,158,11,0.5)] shrink-0 group-hover:rotate-12 transition duration-300">
                    🪙
                  </div>

                  {/* Mode + Balance */}
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-0.5 xs:gap-1">
                      <span className={`text-[7px] xs:text-[8px] sm:text-[9px] font-black uppercase tracking-wider leading-none ${
                        activeBalanceType === 'DEMO' ? 'text-[#F59E0B]' : 'text-[#47EC84]'
                      }`}>
                        {activeBalanceType}
                      </span>
                      <ChevronDown className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-zinc-400 group-hover:text-white transition" />
                    </div>
                    <span className="font-mono text-[11px] xs:text-xs sm:text-sm font-black text-white leading-tight mt-0.5 tracking-tight">
                      ₹{formattedBalance}
                    </span>
                  </div>
                </button>

                {/* Vertical Divider */}
                <div className="w-px h-4 xs:h-5 sm:h-6 bg-white/[0.12] mx-0.5 xs:mx-1" />

                {/* Neon Emerald Deposit Button */}
                <button
                  onClick={() => openModal('deposit')}
                  className="h-6 xs:h-7 sm:h-8 px-2 xs:px-2.5 sm:px-3.5 rounded-full bg-[#47EC84] hover:bg-[#5cf295] text-slate-950 flex items-center gap-0.5 xs:gap-1 font-black text-xs shadow-glowGreen active:scale-95 transition duration-200 shrink-0"
                  title="Instant Deposit via UPI / QR Code"
                >
                  <Plus className="w-3 h-3 xs:w-3.5 xs:h-3.5 stroke-[3]" />
                  <span className="text-[10px] xs:text-[11px] sm:text-xs font-black uppercase tracking-wide">
                    <span className="hidden sm:inline">Deposit</span>
                    <span className="sm:hidden hidden xs:inline">Add</span>
                  </span>
                </button>
              </div>

              {/* Mobile-Safe Centered Popover Modal */}
              {balanceOpen && (
                <div className="fixed sm:absolute top-16 sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:mt-2 sm:w-80 max-w-sm mx-auto sm:mx-0 bg-[#171b1c] border border-white/[0.12] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.95)] p-4 z-50 backdrop-blur-2xl animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-[#47EC84]" />
                      Wallet Balances
                    </span>
                    <Link 
                      href="/wallet" 
                      onClick={() => setBalanceOpen(false)}
                      className="text-[10px] font-bold text-[#47EC84] hover:underline flex items-center gap-0.5"
                    >
                      Cashier Hub <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="grid grid-cols-2 gap-1.5 mt-3 p-1 rounded-xl bg-black/40 border border-white/[0.06]">
                    <button
                      onClick={() => {
                        setActiveBalanceType('DEMO');
                        setBalanceOpen(false);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                        activeBalanceType === 'DEMO'
                          ? 'bg-[#F59E0B] text-slate-950 shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🎮 DEMO</span>
                      {activeBalanceType === 'DEMO' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <button
                      onClick={() => {
                        setActiveBalanceType('MAIN');
                        setBalanceOpen(false);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                        activeBalanceType === 'MAIN'
                          ? 'bg-[#47EC84] text-slate-950 shadow-glowGreen'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>⚡ REAL CASH</span>
                      {activeBalanceType === 'MAIN' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </div>

                  {/* Detailed Balances */}
                  <div className="space-y-2 mt-3 pt-1">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#202526] border border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🪙</span>
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] uppercase font-bold text-zinc-400">Demo Credits</span>
                          <span className="text-xs font-bold text-zinc-200">Practice & Fun Play</span>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-black text-[#F59E0B]">
                        ₹{parseFloat(balances.DEMO || '0').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#202526] border border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">⚡</span>
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] uppercase font-bold text-zinc-400">Real Cash</span>
                          <span className="text-xs font-bold text-zinc-200">Withdrawable Balance</span>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-black text-[#47EC84]">
                        ₹{parseFloat(balances.MAIN || '0').toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#202526] border border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🎁</span>
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] uppercase font-bold text-zinc-400">Bonus Cash</span>
                          <span className="text-xs font-bold text-zinc-200">Wager Rewards</span>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-black text-amber-300">
                        ₹{parseFloat(balances.BONUS || '0').toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Cashier CTA */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-white/[0.08]">
                    <button
                      onClick={() => {
                        setBalanceOpen(false);
                        openModal('deposit');
                      }}
                      className="w-full py-2 rounded-xl bg-[#47EC84] hover:bg-[#5cf295] text-slate-950 font-black text-xs shadow-glowGreen transition"
                    >
                      + Quick Deposit
                    </button>
                    <Link
                      href="/wallet"
                      onClick={() => setBalanceOpen(false)}
                      className="w-full py-2 rounded-xl bg-[#222829] hover:bg-[#2b3334] text-white border border-white/10 font-bold text-xs text-center transition flex items-center justify-center gap-1"
                    >
                      Withdraw
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Streak Gift Icon Button (Shown on sm+ screens to keep mobile clean) */}
            <button
              onClick={() => openModal('dailyReward')}
              title="Claim Free Daily Streak Bonus"
              className="hidden sm:flex relative p-2 rounded-full bg-[#1b1f20] hover:bg-[#23292a] border border-white/[0.08] hover:border-[#F59E0B]/50 text-[#F59E0B] transition active:scale-95 shadow-sm shrink-0"
            >
              <Gift className="w-4 h-4 text-[#F59E0B] animate-bounce" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#47EC84] shadow-[0_0_6px_#47EC84]" />
            </button>

            {/* Notification Bell (Shown on xs+ screens) */}
            <div className="hidden xs:block relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setHasUnreadNotifs(false);
                }}
                title="Notifications"
                className="relative p-1.5 sm:p-2 rounded-full bg-[#1b1f20] hover:bg-[#23292a] border border-white/[0.08] hover:border-white/20 text-zinc-300 transition active:scale-95 shadow-sm shrink-0"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {hasUnreadNotifs && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="fixed sm:absolute top-16 sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:mt-2 sm:w-80 max-w-sm mx-auto sm:mx-0 bg-[#171b1c] border border-white/[0.12] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.95)] p-3 z-50 backdrop-blur-2xl animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] px-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#47EC84]" />
                      Activity Alerts
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">Real-time</span>
                  </div>

                  <div className="divide-y divide-white/[0.05] mt-1 max-h-64 overflow-y-auto">
                    {notificationsList.map((item) => (
                      <div key={item.id} className="py-2.5 px-2 hover:bg-white/[0.03] rounded-xl transition">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-bold text-white leading-tight">{item.title}</p>
                          <span className="text-[9px] text-zinc-400 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar with VIP Level Ring & High-Roller Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#47EC84] via-emerald-400 to-[#F59E0B] shadow-[0_0_12px_rgba(71,236,132,0.25)] hover:shadow-[0_0_16px_rgba(71,236,132,0.4)] active:scale-95 transition duration-200 shrink-0"
                title="Player Profile Menu"
              >
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full bg-[#141617] flex items-center justify-center font-black text-[10px] xs:text-xs text-[#47EC84]">
                  {user?.username?.substring(0, 2).toUpperCase() || 'VX'}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 xs:w-2.5 xs:h-2.5 rounded-full bg-[#47EC84] border-2 border-[#141617] shadow-[0_0_4px_#47EC84]" />
              </button>

              {profileOpen && (
                <div 
                  className="fixed sm:absolute top-16 sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:mt-2 sm:w-64 max-w-sm mx-auto sm:mx-0 bg-[#171b1c] border border-white/[0.12] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.95)] p-2 z-50 backdrop-blur-2xl animate-in fade-in duration-150"
                  onClick={() => setProfileOpen(false)}
                >
                  {/* VIP Profile Banner */}
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#202526] to-[#141718] border border-white/[0.08] mb-1">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-xs font-black text-white">{user?.username || 'VIP Player'}</p>
                        <p className="text-[10px] text-zinc-400 truncate max-w-[130px]">{user?.email}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center gap-1 shadow-sm shrink-0">
                        <Crown className="w-2.5 h-2.5" />
                        {vipTier || 'BRONZE'}
                      </span>
                    </div>

                    {/* VIP Progress Bar */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400 mb-1">
                        <span>VIP Status</span>
                        <span className="text-[#47EC84]">Tier 1</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#47EC84] to-[#F59E0B] w-2/5 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5">
                    <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-white/[0.06] transition font-medium">
                      <UserIcon className="w-4 h-4 text-[#47EC84]" />
                      <span>My Profile & VIP Perks</span>
                    </Link>

                    <Link href="/wallet" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-white/[0.06] transition font-medium">
                      <Wallet className="w-4 h-4 text-[#F59E0B]" />
                      <span>Deposit & Withdraw Hub</span>
                    </Link>

                    <Link href="/rewards" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-white/[0.06] transition font-medium">
                      <Trophy className="w-4 h-4 text-[#47EC84]" />
                      <span>Tournaments & Bonuses</span>
                    </Link>

                    {isAdmin && (
                      <Link href="/admin" className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-purple-400 font-semibold hover:bg-purple-950/30 transition border border-purple-500/20 my-1">
                        <span className="flex items-center gap-2">
                          <Flame className="w-4 h-4" />
                          Admin Command Center
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}

                    <div className="pt-1 border-t border-white/[0.08] mt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 transition font-bold"
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
              className="px-2.5 py-1 xs:px-3 xs:py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white hover:text-[#47EC84] transition"
            >
              Sign In
            </button>
            <button
              onClick={() => openModal('register')}
              className="px-3 py-1 xs:px-3.5 xs:py-1.5 sm:px-5 sm:py-2 text-xs font-black bg-[#47EC84] hover:bg-[#5cf295] text-slate-950 rounded-full shadow-glowGreen transition transform active:scale-95 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
              <span>Start</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
