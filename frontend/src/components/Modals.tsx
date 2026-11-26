"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Shield, QrCode, CheckCircle2, Copy, AlertTriangle, 
  Sparkles, Wallet, ArrowUpRight, Clock, RefreshCw 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

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
      setErrorMessage(err.message || 'Login failed.');
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
      setErrorMessage(err.message || 'Registration failed.');
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
      showNotification(err.message, 'error');
    } finally {
      setRewardClaiming(false);
    }
  };

  return (
    <>
      {/* Toast Notification banner */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm p-4 rounded-2xl bg-aurora-surface border border-aurora-border shadow-card flex items-start gap-3 backdrop-blur-xl animate-fade-in">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-aurora-success shrink-0 mt-0.5" />
          ) : notification.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-aurora-danger shrink-0 mt-0.5" />
          ) : (
            <Sparkles className="w-5 h-5 text-aurora-cyan shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs text-aurora-text leading-relaxed">
            {notification.message}
          </div>
          <button onClick={clearNotification} className="text-aurora-muted hover:text-aurora-text">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal Dialog Backdrop */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-aurora-surface border border-aurora-border rounded-3xl shadow-card overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-aurora-border/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-aurora-elevated flex items-center justify-center text-aurora-gold font-bold text-sm">
                  VX
                </div>
                <h3 className="font-bold text-sm text-aurora-text capitalize">
                  {activeModal === 'login' && 'Sign In to Veltrix'}
                  {activeModal === 'register' && 'Create Player Account'}
                  {activeModal === 'deposit' && 'Instant Dynamic QR Deposit'}
                  {activeModal === 'dailyReward' && 'Claim Daily Reward'}
                </h3>
              </div>
              <button onClick={closeModal} className="text-aurora-muted hover:text-aurora-text p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {errorMessage && (
                <div className="mb-4 p-3 bg-aurora-danger/10 border border-aurora-danger/30 rounded-xl text-xs text-aurora-danger flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* LOGIN MODAL */}
              {activeModal === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-aurora-muted mb-1">
                      Email or Username
                    </label>
                    <input
                      type="text"
                      required
                      value={authLogin}
                      onChange={(e) => setAuthLogin(e.target.value)}
                      placeholder="player1@veltrix.arena"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-aurora-elevated border border-aurora-border text-xs text-aurora-text focus:outline-none focus:border-aurora-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-aurora-muted mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-aurora-elevated border border-aurora-border text-xs text-aurora-text focus:outline-none focus:border-aurora-cyan"
                    />
                  </div>

                  {/* 1-Click Demo Fill buttons */}
                  <div className="pt-1">
                    <p className="text-[10px] text-aurora-muted mb-1.5 uppercase font-semibold">1-Click Sandbox Credentials:</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickFill('player')}
                        className="px-2.5 py-1 text-[11px] bg-aurora-elevated hover:bg-aurora-surface text-aurora-cyan rounded-lg border border-aurora-cyan/30"
                      >
                        Fill Player (player1)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickFill('admin')}
                        className="px-2.5 py-1 text-[11px] bg-aurora-elevated hover:bg-aurora-surface text-aurora-purple rounded-lg border border-aurora-purple/30"
                      >
                        Fill Admin (admin)
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-aurora-cyan to-aurora-purple text-slate-950 font-bold text-xs rounded-xl shadow-glow transition hover:opacity-95"
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </button>
                </form>
              )}

              {/* REGISTER MODAL */}
              {activeModal === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-aurora-muted mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="player@veltrix.arena"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-aurora-elevated border border-aurora-border text-xs text-aurora-text focus:outline-none focus:border-aurora-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-aurora-muted mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      placeholder="auroraking"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-aurora-elevated border border-aurora-border text-xs text-aurora-text focus:outline-none focus:border-aurora-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-aurora-muted mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-aurora-elevated border border-aurora-border text-xs text-aurora-text focus:outline-none focus:border-aurora-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-aurora-muted mb-1">Referral Code (Optional)</label>
                    <input
                      type="text"
                      value={authRefCode}
                      onChange={(e) => setAuthRefCode(e.target.value)}
                      placeholder="PLAY001"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-aurora-elevated border border-aurora-border text-xs text-aurora-text focus:outline-none focus:border-aurora-cyan uppercase"
                    />
                  </div>

                  <div className="p-2.5 bg-aurora-gold/10 border border-aurora-gold/20 rounded-xl text-[11px] text-aurora-gold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Instant bonus: 10,000 DEMO credits credited immediately upon registration.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-aurora-gold to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-glowGold transition hover:opacity-95"
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                  </button>
                </form>
              )}

              {/* DYNAMIC QR DEPOSIT MODAL */}
              {activeModal === 'deposit' && (
                <div>
                  {!paymentIntent ? (
                    <div className="space-y-4">
                      <p className="text-xs text-aurora-muted">
                        Select or enter deposit amount. A unique, dynamic UPI payment QR will be generated with a 15-minute countdown.
                      </p>

                      <div className="grid grid-cols-4 gap-2">
                        {[100, 500, 1000, 2500].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDepositAmount(amt)}
                            className={`py-2 text-xs font-semibold rounded-xl border transition ${
                              depositAmount === amt
                                ? 'bg-aurora-cyan/20 border-aurora-cyan text-aurora-cyan shadow-glow'
                                : 'bg-aurora-elevated border-aurora-border text-aurora-text hover:border-aurora-muted'
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-aurora-muted mb-1">Custom Amount (₹)</label>
                        <input
                          type="number"
                          min={50}
                          max={500000}
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-aurora-elevated border border-aurora-border text-xs text-aurora-text focus:outline-none focus:border-aurora-cyan font-mono"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateQR}
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-aurora-gold to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-glowGold transition hover:opacity-95 flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>{loading ? 'Generating Dynamic QR...' : 'Generate Payment QR'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-aurora-elevated rounded-full border border-aurora-border text-xs text-aurora-muted">
                        <Clock className="w-3.5 h-3.5 text-aurora-gold" />
                        <span>Expires in: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                      </div>

                      {/* Animated QR Canvas representation */}
                      <div className="p-4 bg-white rounded-2xl w-48 h-48 mx-auto flex flex-col items-center justify-center shadow-lg relative border-4 border-aurora-gold/40">
                        {/* QR graphic mockup using SVG */}
                        <svg className="w-36 h-36" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="0" y="0" width="30" height="30" />
                          <rect x="5" y="5" width="20" height="20" fill="white" />
                          <rect x="10" y="10" width="10" height="10" />
                          <rect x="70" y="0" width="30" height="30" />
                          <rect x="75" y="5" width="20" height="20" fill="white" />
                          <rect x="80" y="10" width="10" height="10" />
                          <rect x="0" y="70" width="30" height="30" />
                          <rect x="5" y="75" width="20" height="20" fill="white" />
                          <rect x="10" y="80" width="10" height="10" />
                          <rect x="40" y="40" width="20" height="20" fill="#080C18" />
                          <circle cx="50" cy="50" r="5" fill="#D9B76E" />
                        </svg>
                      </div>

                      <div className="text-xs text-aurora-text font-mono font-bold">
                        Amount: ₹{parseFloat(paymentIntent.amount).toFixed(2)}
                      </div>

                      <div className="p-2.5 bg-aurora-elevated rounded-xl border border-aurora-border text-[11px] text-aurora-muted flex items-center justify-between">
                        <span className="truncate max-w-[240px] font-mono">{paymentIntent.intent_reference}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(paymentIntent.qr_payload);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="text-aurora-cyan hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Copy className="w-3 h-3" />
                          {copied ? 'Copied' : 'Copy UPI'}
                        </button>
                      </div>

                      {/* 1-Click Sandbox Payment Confirmation */}
                      <button
                        type="button"
                        onClick={handleSandboxConfirm}
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-aurora-success to-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-glow transition hover:opacity-95 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{loading ? 'Verifying...' : 'Simulate UPI App Payment Success'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* DAILY REWARD MODAL */}
              {activeModal === 'dailyReward' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-aurora-gold/20 border border-aurora-gold/40 flex items-center justify-center mx-auto text-aurora-gold shadow-glowGold">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-aurora-text">Daily Login Streak</h4>
                    <p className="text-xs text-aurora-muted mt-1">
                      Claim free credits and loyalty points every 24 hours to fuel your gameplay.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-2">
                    <div className="p-3 bg-aurora-elevated rounded-xl border border-aurora-border">
                      <div className="text-xs text-aurora-muted">Demo Credits</div>
                      <div className="text-lg font-bold text-aurora-gold mt-1">+500</div>
                    </div>
                    <div className="p-3 bg-aurora-elevated rounded-xl border border-aurora-border">
                      <div className="text-xs text-aurora-muted">Loyalty Points</div>
                      <div className="text-lg font-bold text-aurora-cyan mt-1">+25</div>
                    </div>
                  </div>

                  <button
                    onClick={handleClaimDaily}
                    disabled={rewardClaiming}
                    className="w-full py-3 bg-gradient-to-r from-aurora-gold to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-glowGold transition hover:opacity-95"
                  >
                    {rewardClaiming ? 'Claiming Reward...' : 'Claim Today\'s Bonus'}
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
