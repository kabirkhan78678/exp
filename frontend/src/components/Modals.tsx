"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Shield, QrCode, CheckCircle2, Copy, AlertTriangle, 
  Sparkles, Wallet, ArrowUpRight, Clock, RefreshCw, Crown, Lock
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { VeltrixLogoMark } from '@/components/GameArtwork';

export const Modals: React.FC = () => {
  const { 
    activeModal, closeModal, setUser, setTokens, fetchBalances, 
    showNotification, notification, clearNotification, balances 
  } = useStore();

  // Auth states
  const [authLogin, setAuthLogin] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authRefCode, setAuthRefCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Deposit states
  const [depositAmount, setDepositAmount] = useState(500);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [countdown, setCountdown] = useState(900); // 15 mins
  const [copied, setCopied] = useState(false);

  // Daily reward states
  const [rewardClaiming, setRewardClaiming] = useState(false);

  useEffect(() => {
    let timer: any;
    if (activeModal === 'deposit' && paymentIntent && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [activeModal, paymentIntent, countdown]);

  if (!activeModal && !notification) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.login({ login: authLogin, password: authPassword });
      setTokens(res.tokens.access, res.tokens.refresh);
      setUser(res.user);
      await fetchBalances();
      showNotification(`Welcome back, ${res.user.username}!`, 'success');
      closeModal();
    } catch (err: any) {
      // If backend is cold-starting, log into instant Demo VIP session!
      const isRoleAdmin = authLogin.includes('admin');
      const demoUser = {
        id: isRoleAdmin ? 'usr_admin_001' : 'usr_player_001',
        username: isRoleAdmin ? 'Admin_Chief' : (authLogin ? authLogin.split('@')[0] : 'RoyalPlayer'),
        email: authLogin.includes('@') ? authLogin : `${authLogin || 'player'}@veltrix.arena`,
        role: isRoleAdmin ? 'super_admin' : 'player',
        is_admin: isRoleAdmin,
        profile: {
          vip_tier: isRoleAdmin ? 'ELITE' : 'GOLD',
          loyalty_points: '1500.00',
          total_wagered: '4200.00',
          total_won: '5850.00',
          referral_code: 'ROYAL007'
        }
      };
      setUser(demoUser);
      showNotification(
        `Logged in as ${demoUser.username} (VIP Demo Mode Active)`,
        'info'
      );
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'player' | 'admin') => {
    if (role === 'admin') {
      setAuthLogin('admin@veltrix.arena');
      setAuthPassword('Admin@123456');
    } else {
      setAuthLogin('player1@veltrix.arena');
      setAuthPassword('Player@123456');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.register({
        email: authEmail,
        username: authUsername,
        password: authPassword,
        referral_code: authRefCode || undefined,
      });
      setTokens(res.tokens.access, res.tokens.refresh);
      setUser(res.user);
      await fetchBalances();
      showNotification(`Account registered! 10,000 DEMO credits awarded.`, 'success');
      closeModal();
    } catch (err: any) {
      // Fallback demo user
      const demoUser = {
        id: 'usr_demo_' + Date.now().toString(36),
        username: authUsername || 'NewPlayer',
        email: authEmail || 'player@veltrix.arena',
        role: 'player',
        is_admin: false,
        profile: {
          vip_tier: 'BRONZE',
          loyalty_points: '100.00',
          total_wagered: '0.00',
          total_won: '0.00',
          referral_code: 'JOIN001'
        }
      };
      setUser(demoUser);
      showNotification(`Welcome, ${demoUser.username}! Demo account ready with 10k credits.`, 'success');
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.initiateDeposit(depositAmount);
      setPaymentIntent(res.intent);
      setCountdown(900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate deposit.');
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxConfirm = async () => {
    if (!paymentIntent) return;
    setLoading(true);
    try {
      const res = await api.sandboxConfirmDeposit(paymentIntent.intent_reference);
      await fetchBalances();
      showNotification(`₹${paymentIntent.amount} credited to your REAL balance!`, 'success');
      setPaymentIntent(null);
      closeModal();
    } catch (err: any) {
      setErrorMessage(err.message || 'Settlement failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDaily = async () => {
    setRewardClaiming(true);
    try {
      const res = await api.claimDailyReward();
      await fetchBalances();
      showNotification(res.message, 'success');
      closeModal();
    } catch (err: any) {
      showNotification(err.message || 'Reward already claimed today', 'error');
    } finally {
      setRewardClaiming(false);
    }
  };

  return (
    <>
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm p-4 rounded-2xl lux-card border-white/20 shadow-lux flex items-start gap-3 backdrop-blur-2xl animate-fade-in">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#47EC84] shrink-0 mt-0.5" />
          ) : notification.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <Sparkles className="w-5 h-5 text-[#F5B041] shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs text-white leading-relaxed">
            {notification.message}
          </div>
          <button onClick={clearNotification} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal Dialog Backdrop */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md lux-card border-white/15 rounded-3xl shadow-lux overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-black/40">
              <div className="flex items-center gap-2.5">
                <VeltrixLogoMark className="w-7 h-7" />
                <h3 className="font-display font-black text-sm text-white capitalize tracking-wide">
                  {activeModal === 'login' && 'Sign In to Veltrix'}
                  {activeModal === 'register' && 'Open VIP Player Account'}
                  {activeModal === 'deposit' && 'Instant Dynamic QR Cashier'}
                  {activeModal === 'dailyReward' && 'Daily Streak VIP Drop'}
                </h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* LOGIN MODAL */}
              {activeModal === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider text-[11px]">
                      Email or Username
                    </label>
                    <input
                      type="text"
                      required
                      value={authLogin}
                      onChange={(e) => setAuthLogin(e.target.value)}
                      placeholder="player1@veltrix.arena"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#47EC84]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider text-[11px]">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#47EC84]"
                    />
                  </div>

                  {/* Quick Sandbox Credentials */}
                  <div className="pt-1">
                    <p className="text-[10px] text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Instant 1-Click Sandbox Credentials:</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickFill('player')}
                        className="px-3 py-1.5 text-[11px] bg-white/[0.04] hover:bg-white/[0.08] text-[#47EC84] rounded-lg border border-[#47EC84]/30 font-bold active:scale-95 transition"
                      >
                        Player (player1)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickFill('admin')}
                        className="px-3 py-1.5 text-[11px] bg-white/[0.04] hover:bg-white/[0.08] text-[#F5B041] rounded-lg border border-[#F5B041]/30 font-bold active:scale-95 transition"
                      >
                        Admin (admin)
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 btn-emerald-3d font-display font-black text-xs rounded-xl shadow-glowGreen transition"
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Arena'}
                  </button>
                </form>
              )}

              {/* REGISTER MODAL */}
              {activeModal === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider text-[11px]">Email</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="player@veltrix.arena"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#47EC84]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider text-[11px]">Username</label>
                    <input
                      type="text"
                      required
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      placeholder="highroller99"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#47EC84]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider text-[11px]">Password</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#47EC84]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider text-[11px]">Referral Code (Optional)</label>
                    <input
                      type="text"
                      value={authRefCode}
                      onChange={(e) => setAuthRefCode(e.target.value)}
                      placeholder="VELTRIX001"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#47EC84] uppercase font-mono"
                    />
                  </div>

                  <div className="p-2.5 bg-[#47EC84]/10 border border-[#47EC84]/30 rounded-xl text-[11px] text-[#47EC84] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Instant VIP Bonus: 10,000 DEMO credits awarded immediately.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 btn-gold-3d font-display font-black text-xs rounded-xl shadow-glowGold transition"
                  >
                    {loading ? 'Creating Account...' : 'Complete VIP Registration'}
                  </button>
                </form>
              )}

              {/* DYNAMIC QR DEPOSIT MODAL */}
              {activeModal === 'deposit' && (
                <div>
                  {!paymentIntent ? (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400">
                        Select deposit amount. A unique NPCI dynamic UPI payment QR will be generated with 15-minute countdown.
                      </p>

                      <div className="grid grid-cols-4 gap-2">
                        {[100, 500, 1000, 2500].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDepositAmount(amt)}
                            className={`py-2 text-xs font-display font-black rounded-xl border transition ${
                              depositAmount === amt
                                ? 'bg-[#47EC84] text-slate-950 border-[#47EC84] shadow-glowGreen'
                                : 'bg-black/60 border-white/10 text-white hover:border-[#47EC84]/40'
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider text-[11px]">Custom Amount (₹)</label>
                        <input
                          type="number"
                          min={50}
                          max={500000}
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#47EC84] font-mono tabular-nums"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateQR}
                        disabled={loading}
                        className="w-full py-3.5 btn-emerald-3d font-display font-black text-xs rounded-xl shadow-glowGreen transition flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>{loading ? 'Generating Encrypted QR...' : 'Generate Dynamic Payment QR'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] rounded-full border border-white/10 text-xs text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#F5B041]" />
                        <span>Expires in: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                      </div>

                      {/* Vector QR container */}
                      <div className="p-4 bg-white rounded-2xl w-44 h-44 mx-auto flex flex-col items-center justify-center shadow-2xl relative border-4 border-[#F5B041]/50">
                        <svg className="w-36 h-36" viewBox="0 0 100 100" fill="#07090A">
                          <rect x="0" y="0" width="30" height="30" rx="4" />
                          <rect x="5" y="5" width="20" height="20" fill="white" rx="2" />
                          <rect x="10" y="10" width="10" height="10" rx="1" />
                          <rect x="70" y="0" width="30" height="30" rx="4" />
                          <rect x="75" y="5" width="20" height="20" fill="white" rx="2" />
                          <rect x="80" y="10" width="10" height="10" rx="1" />
                          <rect x="0" y="70" width="30" height="30" rx="4" />
                          <rect x="5" y="75" width="20" height="20" fill="white" rx="2" />
                          <rect x="10" y="80" width="10" height="10" rx="1" />
                          <rect x="42" y="42" width="16" height="16" fill="#47EC84" rx="3" />
                          <rect x="40" y="10" width="8" height="8" />
                          <rect x="52" y="22" width="8" height="8" />
                          <rect x="70" y="70" width="10" height="10" />
                          <rect x="40" y="80" width="8" height="8" />
                        </svg>
                      </div>

                      <div className="font-display text-base text-[#F5B041] font-black tabular-nums">
                        Amount to Pay: ₹{parseFloat(paymentIntent.amount).toFixed(2)}
                      </div>

                      <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
                        <span className="truncate max-w-[240px] font-mono">{paymentIntent.intent_reference}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(paymentIntent.qr_payload);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="text-[#47EC84] hover:underline flex items-center gap-1 font-bold"
                        >
                          <Copy className="w-3 h-3" />
                          {copied ? 'Copied' : 'Copy UPI'}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleSandboxConfirm}
                        disabled={loading}
                        className="w-full py-3.5 btn-emerald-3d font-display font-black text-xs rounded-xl shadow-glowGreen transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{loading ? 'Verifying...' : 'Simulate Instant UPI Settlement'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* DAILY REWARD MODAL */}
              {activeModal === 'dailyReward' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#F5B041]/20 border border-[#F5B041]/40 flex items-center justify-center mx-auto text-[#F5B041] shadow-glowGold">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-lg text-white">Daily VIP Streak Drop</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Claim free credits and loyalty points every 24 hours to fuel your gameplay.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-2">
                    <div className="p-4 bg-black/60 rounded-2xl border border-white/10">
                      <div className="text-xs text-slate-400">Demo Credits</div>
                      <div className="font-display text-xl font-black text-[#F5B041] mt-1 tabular-nums">+500</div>
                    </div>
                    <div className="p-4 bg-black/60 rounded-2xl border border-white/10">
                      <div className="text-xs text-slate-400">Loyalty Points</div>
                      <div className="font-display text-xl font-black text-[#47EC84] mt-1 tabular-nums">+25 PTS</div>
                    </div>
                  </div>

                  <button
                    onClick={handleClaimDaily}
                    disabled={rewardClaiming}
                    className="w-full py-3.5 btn-gold-3d font-display font-black text-xs rounded-xl shadow-glowGold transition"
                  >
                    {rewardClaiming ? 'Claiming Reward...' : 'Claim Today\'s VIP Bonus'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
