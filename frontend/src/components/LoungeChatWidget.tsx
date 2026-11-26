"use client";

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  MessageSquare, Send, CloudRain, Sparkles, Crown, CheckCircle2, Users
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { playCasinoSfx } from '@/components/CasinoAssets';

interface RainMeta {
  id: string;
  per_claim_amount: string;
  claimed_count: number;
  max_claims: number;
  is_active: boolean;
  already_claimed: boolean;
}

interface LoungeItem {
  id: string;
  sender_name: string;
  vip_tier: string;
  message: string;
  msg_type: 'CHAT' | 'WIN_ALERT' | 'RAIN' | string;
  rain_amount?: string;
  rain_info?: RainMeta | null;
  created_at: string;
}

export const LoungeChatWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { user, isAuthenticated, activeBalanceType, balances, setBalances, fetchBalances, showNotification, openModal } = useStore();

  const [messages, setMessages] = useState<LoungeItem[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [showRainMenu, setShowRainMenu] = useState(false);
  const [droppingRain, setDroppingRain] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadFeed = async () => {
    const res = await api.getLoungeMessages();
    if (res.messages?.length) {
      setMessages((prev) => {
        // Merge offline claimed status cleanly
        const claimedLocally = new Set<string>();
        prev.forEach((m) => {
          if (m.rain_info?.already_claimed) claimedLocally.add(m.rain_info.id);
        });
        return res.messages.map((m: LoungeItem) =>
          m.rain_info && claimedLocally.has(m.rain_info.id)
            ? { ...m, rain_info: { ...m.rain_info, already_claimed: true } }
            : m
        );
      });
    }
  };

  useEffect(() => {
    loadFeed();
    const id = setInterval(loadFeed, 12000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const text = (presetText || draft).trim();
    if (!text) return;

    setSending(true);
    try {
      if (isAuthenticated) {
        try {
          const res = await api.postLoungeMessage(text);
          if (res.message) {
            setMessages((prev) => [...prev.slice(-29), res.message]);
            if (!presetText) setDraft('');
            setSending(false);
            return;
          }
        } catch {}
      }

      // Demo local message append
      const localMsg: LoungeItem = {
        id: 'local_' + Date.now(),
        sender_name: user?.username || 'VIP_Guest',
        vip_tier: user?.profile?.vip_tier || 'GOLD',
        message: text,
        msg_type: 'CHAT',
        rain_info: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev.slice(-29), localMsg]);
      if (!presetText) setDraft('');
    } finally {
      setSending(false);
    }
  };

  const handleDropRain = async (amount: number) => {
    const bal = parseFloat(activeBalanceType === 'DEMO' ? balances.DEMO : balances.MAIN);
    if (bal < amount) {
      showNotification(`Insufficient ${activeBalanceType} balance to drop ₹${amount} Rain`, 'error');
      return;
    }

    setDroppingRain(true);
    try {
      if (isAuthenticated) {
        try {
          const res = await api.dropLoungeRain(amount, activeBalanceType);
          if (res.balances) setBalances(res.balances);
          else await fetchBalances();
          if (res.lounge_message) {
            setMessages((prev) => [...prev.slice(-29), res.lounge_message]);
          }
          playCasinoSfx('win');
          confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
          showNotification(res.message, 'success');
          setShowRainMenu(false);
          setDroppingRain(false);
          return;
        } catch {}
      }

      const perClaim = Math.round(amount / 5);
      setBalances({ ...balances, [activeBalanceType]: (bal - amount).toFixed(4) });
      const localRainMsg: LoungeItem = {
        id: 'rain_msg_' + Date.now(),
        sender_name: user?.username || 'VIP_Guest',
        vip_tier: user?.profile?.vip_tier || 'GOLD',
        message: `☔ Dropped ₹${amount} Bonus Rain! First 5 players grab ₹${perClaim} each!`,
        msg_type: 'RAIN',
        rain_amount: String(amount),
        rain_info: {
          id: 'rain_loc_' + Date.now(),
          per_claim_amount: perClaim.toFixed(2),
          claimed_count: 0,
          max_claims: 5,
          is_active: true,
          already_claimed: false,
        },
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev.slice(-29), localRainMsg]);
      playCasinoSfx('win');
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
      showNotification(`Dropped ₹${amount} Bonus Rain into Lounge!`, 'success');
      setShowRainMenu(false);
    } finally {
      setDroppingRain(false);
    }
  };

  const handleCatchRain = async (rain: RainMeta) => {
    if (!rain.is_active || rain.already_claimed) return;
    setClaimingId(rain.id);

    try {
      if (isAuthenticated && !rain.id.startsWith('rain_loc_') && !rain.id.startsWith('rain_seed_')) {
        try {
          const res = await api.claimLoungeRain(rain.id);
          if (res.balances) setBalances(res.balances);
          else await fetchBalances();
          setMessages((prev) =>
            prev.map((m) =>
              m.rain_info?.id === rain.id
                ? {
                    ...m,
                    rain_info: {
                      ...m.rain_info,
                      already_claimed: true,
                      claimed_count: m.rain_info.claimed_count + 1,
                    },
                  }
                : m
            )
          );
          playCasinoSfx('win');
          confetti({ particleCount: 55, spread: 50, origin: { y: 0.65 } });
          showNotification(res.message, 'success');
          setClaimingId(null);
          return;
        } catch (err: any) {
          if (err?.message && (err.message.includes('already') || err.message.includes('claimed'))) {
            showNotification(err.message, 'info');
            setClaimingId(null);
            return;
          }
        }
      }

      const amt = parseFloat(rain.per_claim_amount || '50');
      setBalances({
        ...balances,
        BONUS: (parseFloat(balances.BONUS || '0') + amt).toFixed(4),
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.rain_info?.id === rain.id
            ? {
                ...m,
                rain_info: {
                  ...m.rain_info,
                  already_claimed: true,
                  claimed_count: Math.min(m.rain_info.max_claims, m.rain_info.claimed_count + 1),
                },
              }
            : m
        )
      );
      playCasinoSfx('win');
      confetti({ particleCount: 55, spread: 50, origin: { y: 0.65 } });
      showNotification(`Caught Bonus Rain! +₹${amt.toFixed(0)} credited to Bonus Vault.`, 'success');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="lux-card rounded-3xl border-[#47EC84]/25 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-white/[0.08] bg-black/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#47EC84]/15 border border-[#47EC84]/35 flex items-center justify-center text-[#47EC84] shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-black text-xs sm:text-sm text-white flex items-center gap-1.5 truncate">
              <span>Live Lounge &amp; Rain</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#47EC84] animate-ping shrink-0" />
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-[#F5B041]" />
              <span>1,482 online now</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRainMenu(!showRainMenu)}
          className="px-3 py-1.5 rounded-xl btn-gold-3d text-[10px] sm:text-xs font-black flex items-center gap-1 active:scale-95 transition shrink-0"
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>Drop Rain</span>
        </button>
      </div>

      {/* Expandable Drop Rain Drawer */}
      {showRainMenu && (
        <div className="p-3 bg-[#151107] border-b border-[#F5B041]/30 space-y-2 animate-scale-up">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#F5B041]">
            <span>Sprinkle Bonus Rain (Split among first 5 clickers):</span>
            <span>Using {activeBalanceType}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[100, 250, 500].map((amt) => (
              <button
                key={amt}
                type="button"
                disabled={droppingRain}
                onClick={() => handleDropRain(amt)}
                className="py-2 rounded-xl bg-[#F5B041]/15 hover:bg-[#F5B041]/30 border border-[#F5B041]/45 text-xs font-mono font-black text-[#F5B041] active:scale-95 transition"
              >
                ☔ ₹{amt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div
        ref={scrollRef}
        className={`p-3 space-y-2.5 overflow-y-auto ${compact ? 'h-60' : 'h-72 sm:h-80'}`}
      >
        {messages.map((item) => {
          const isRain = item.msg_type === 'RAIN' && item.rain_info;
          const isAlert = item.msg_type === 'WIN_ALERT';

          if (isRain && item.rain_info) {
            const rain = item.rain_info;
            return (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-gradient-to-br from-[#0F2A1B] via-[#101816] to-[#1A1407] border border-[#47EC84]/45 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="font-mono font-black text-[#F5B041] flex items-center gap-1">
                    <Crown className="w-3 h-3" /> @{item.sender_name} ({item.vip_tier})
                  </span>
                  <span className="font-mono text-[#47EC84]">
                    {rain.claimed_count}/{rain.max_claims} grabbed
                  </span>
                </div>
                <p className="text-xs text-white font-semibold">{item.message}</p>
                {rain.already_claimed ? (
                  <div className="w-full py-1.5 rounded-xl bg-[#47EC84]/15 border border-[#47EC84]/35 text-[#47EC84] text-[11px] font-black flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Grabbed +₹{parseFloat(rain.per_claim_amount).toFixed(0)}</span>
                  </div>
                ) : rain.is_active ? (
                  <button
                    type="button"
                    disabled={claimingId === rain.id}
                    onClick={() => handleCatchRain(rain)}
                    className="w-full py-2 rounded-xl btn-emerald-3d text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {claimingId === rain.id
                        ? 'Grabbing...'
                        : `CATCH RAIN (+₹${parseFloat(rain.per_claim_amount).toFixed(0)})`}
                    </span>
                  </button>
                ) : (
                  <div className="text-center text-[10px] font-mono text-slate-400">Rain Fully Claimed</div>
                )}
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className={`px-3 py-2 rounded-2xl text-xs border ${
                isAlert
                  ? 'bg-[#F5B041]/10 border-[#F5B041]/30 text-amber-100'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-[8px] font-mono font-black text-[#F5B041]">
                  {item.vip_tier}
                </span>
                <span className="font-bold text-[#47EC84] text-[11px]">@{item.sender_name}</span>
              </div>
              <p className="text-[11px] leading-relaxed break-words">{item.message}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Reactions + Composer */}
      <div className="p-2.5 border-t border-white/[0.08] bg-black/50 space-y-2">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {['🚀 Fly!', '🔥 10x!', '💎 GG', '☔ Rain?'].map((react) => (
              <button
                key={react}
                type="button"
                onClick={() => handleSend(undefined, react)}
                className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[10px] font-bold text-slate-300 whitespace-nowrap"
              >
                {react}
              </button>
            ))}
          </div>
          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => openModal('login')}
              className="text-[10px] font-bold text-[#47EC84] shrink-0 hover:underline"
            >
              Sign in
            </button>
          )}
        </div>

        <form onSubmit={(e) => handleSend(e)} className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Say hi or cheer high rollers..."
            className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#0D1114] border border-white/10 focus:border-[#47EC84] focus:outline-none text-xs text-white placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="w-9 h-9 rounded-xl btn-emerald-3d flex items-center justify-center shrink-0 active:scale-95 transition disabled:opacity-45"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
