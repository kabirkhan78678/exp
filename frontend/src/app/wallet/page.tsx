"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, ShieldCheck, 
  RefreshCw, Search, Clock, CheckCircle2, AlertTriangle, 
  Copy, Download, QrCode, Check, Sparkles, Building2, Smartphone, Lock
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { GoldRupeeCoin } from '@/components/GameArtwork';

function WalletCashierContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'withdraw' ? 'WITHDRAW' : 'DEPOSIT';

  const { 
    isAuthenticated, balances, fetchBalances, 
    openModal, showNotification 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>(initialTab);

  // Deposit state
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [activeIntent, setActiveIntent] = useState<any>(null);
  const [initiating, setInitiating] = useState<boolean>(false);
  const [confirming, setConfirming] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [withdrawChannel, setWithdrawChannel] = useState<'UPI' | 'BANK'>('UPI');
  const [withdrawUPI, setWithdrawUPI] = useState<string>('player@okhdfcbank');
  const [bankAccount, setBankAccount] = useState<string>('918239019283');
  const [bankIFSC, setBankIFSC] = useState<string>('HDFC0001234');
  const [withdrawing, setWithdrawing] = useState<boolean>(false);

  // Transactions & search
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(true);
  const [searchTx, setSearchTx] = useState<string>('');
  const [txFilter, setTxFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'WIN'>('ALL');

  const presetAmounts = [100, 500, 1000, 2500, 5000, 10000];

  const loadData = async () => {
    try {
      await fetchBalances();
      const res = await api.getTransactions();
      setTransactions(res.transactions || []);
    } catch {} finally {
      setLoadingTxs(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (searchParams.get('tab') === 'withdraw') {
      setActiveTab('WITHDRAW');
    } else if (searchParams.get('tab') === 'deposit') {
      setActiveTab('DEPOSIT');
    }
  }, [searchParams]);

  // Generate dynamic deposit intent
  const handleGenerateQR = async (amt = depositAmount) => {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    setInitiating(true);
    try {
      const res = await api.initiateDeposit(amt);
      setActiveIntent(res.intent);
      showNotification('Encrypted NPCI UPI Dynamic QR generated!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to initiate deposit', 'error');
    } finally {
      setInitiating(false);
    }
  };

  // Confirm sandbox deposit
  const handleConfirmDeposit = async () => {
    if (!activeIntent) return;
    setConfirming(true);
    try {
      const res = await api.sandboxConfirmDeposit(activeIntent.reference_no);
      await fetchBalances();
      await loadData();
      showNotification(res.message, 'success');
      setActiveIntent(null);
    } catch (err: any) {
      showNotification(err.message || 'Payment settlement failed', 'error');
    } finally {
      setConfirming(false);
    }
  };

  // Submit withdrawal
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    const mainBal = parseFloat(balances.MAIN || '0');
    if (withdrawAmount > mainBal) {
      showNotification(`Insufficient Withdrawable balance. Available: ₹${mainBal}`, 'error');
      return;
    }

    setWithdrawing(true);
    try {
      const details = withdrawChannel === 'UPI' 
        ? { upi_id: withdrawUPI } 
        : { account_number: bankAccount, ifsc: bankIFSC };

      const res = await api.requestWithdrawal(withdrawAmount, withdrawChannel, details);
      await fetchBalances();
      await loadData();
      showNotification(res.message, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Withdrawal request failed', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const filteredTxs = transactions.filter((t) => {
    const matchesSearch = 
      t.reference_no.toLowerCase().includes(searchTx.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTx.toLowerCase())) ||
      t.transaction_type.toLowerCase().includes(searchTx.toLowerCase());

    const matchesFilter = 
      txFilter === 'ALL' ||
      (txFilter === 'DEPOSIT' && t.transaction_type === 'DEPOSIT') ||
      (txFilter === 'WITHDRAWAL' && t.transaction_type === 'WITHDRAWAL') ||
      (txFilter === 'WIN' && t.transaction_type.includes('WIN'));

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 sm:space-y-8 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-6 w-full max-w-full overflow-x-clip">
      {/* 1. Header & Live Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="telemetry-badge text-[#47EC84] border-[#47EC84]/30 bg-[#47EC84]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#47EC84] animate-ping" />
              DOUBLE-ENTRY LEDGER
            </span>
            <span className="telemetry-badge text-[#F5B041] border-[#F5B041]/30 bg-[#F5B041]/10">
              <Lock className="w-2.5 h-2.5" />
              AES-256 ENCRYPTED
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Vault Cashier & Settlement
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Instant UPI Dynamic QR deposits and 60-second direct IMPS/VPA withdrawals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-slate-300 transition flex items-center gap-1.5 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#47EC84]" />
            <span>Refresh Balances</span>
          </button>
        </div>
      </div>

      {/* 2. 4-Card Luxury Balance Vault */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Main Withdrawable */}
        <div className="p-4 sm:p-5 rounded-3xl lux-card border-[#47EC84]/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#47EC84]/10 rounded-full blur-2xl group-hover:bg-[#47EC84]/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Main Withdrawable</span>
            <GoldRupeeCoin className="w-5 h-5 drop-shadow-sm" />
          </div>
          <div className="font-display text-xl sm:text-3xl font-black text-[#47EC84] tabular-nums truncate">
            ₹{parseFloat(balances.MAIN || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#47EC84]" />
            <span>Direct IMPS ready</span>
          </div>
        </div>

        {/* Demo Credits */}
        <div className="p-4 sm:p-5 rounded-3xl lux-card border-[#F5B041]/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5B041]/10 rounded-full blur-2xl group-hover:bg-[#F5B041]/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Demo Free Play</span>
            <Sparkles className="w-4 h-4 text-[#F5B041]" />
          </div>
          <div className="font-display text-xl sm:text-3xl font-black text-[#F5B041] tabular-nums truncate">
            ₹{parseFloat(balances.DEMO || '0').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">
            Unlimited test credits
          </div>
        </div>

        {/* Bonus Vault */}
        <div className="p-4 sm:p-5 rounded-3xl lux-card border-violet-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Promo Bonus</span>
            <span className="text-[9px] font-black text-violet-300 px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-500/30">1.2x</span>
          </div>
          <div className="font-display text-xl sm:text-3xl font-black text-violet-300 tabular-nums truncate">
            ₹{parseFloat(balances.BONUS || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">
            Wager unlockable
          </div>
        </div>

        {/* In-Play Escrow */}
        <div className="p-4 sm:p-5 rounded-3xl lux-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">In-Play Escrow</span>
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-display text-xl sm:text-3xl font-black text-white tabular-nums truncate">
            ₹{parseFloat(balances.ESCROW || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">
            Active game bets locked
          </div>
        </div>
      </div>

      {/* 3. High-Roller Unified Cashier Station */}
      <div className="rounded-3xl lux-card overflow-hidden">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-white/[0.08] bg-black/40 p-1.5 xs:p-2 gap-1.5 xs:gap-2">
          <button
            onClick={() => setActiveTab('DEPOSIT')}
            className={`py-3 xs:py-3.5 px-2 rounded-2xl font-display font-black text-[11px] xs:text-xs sm:text-sm flex items-center justify-center gap-1.5 xs:gap-2 transition-all duration-200 active:scale-98 ${
              activeTab === 'DEPOSIT'
                ? 'btn-emerald-3d shadow-glowGreen text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
            <span className="sm:hidden">UPI QR Deposit</span>
            <span className="hidden sm:inline">Instant UPI Dynamic QR</span>
          </button>

          <button
            onClick={() => setActiveTab('WITHDRAW')}
            className={`py-3 xs:py-3.5 px-2 rounded-2xl font-display font-black text-[11px] xs:text-xs sm:text-sm flex items-center justify-center gap-1.5 xs:gap-2 transition-all duration-200 active:scale-98 ${
              activeTab === 'WITHDRAW'
                ? 'btn-gold-3d shadow-glowGold text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
            <span className="sm:hidden">Withdraw Cash</span>
            <span className="hidden sm:inline">Instant Payout (UPI / Bank)</span>
          </button>
        </div>

        {/* Tab Panel Content */}
        <div className="p-4 sm:p-8">
          {activeTab === 'DEPOSIT' ? (
            /* DEPOSIT TAB */
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <span className="telemetry-badge text-[#47EC84] border-[#47EC84]/30 bg-[#47EC84]/10 mb-1">
                  NPCI ZERO-FEE GATEWAY
                </span>
                <h3 className="font-display text-lg sm:text-xl font-black text-white">
                  Instant UPI Dynamic QR Cash-In
                </h3>
                <p className="text-xs text-slate-400">
                  Scan with PhonePe, Google Pay, Paytm, BHIM, CRED or Any UPI App.
                </p>
              </div>

              {/* Amount Selection Chips */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Select Amount (₹)
                  </label>
                  <span className="text-[11px] text-[#47EC84] font-mono font-semibold">+100% Welcome Multiplier</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setDepositAmount(amt); handleGenerateQR(amt); }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-display font-black transition-all active:scale-95 truncate tabular-nums border ${
                        depositAmount === amt
                          ? 'bg-[#47EC84] text-slate-950 border-[#47EC84] shadow-glowGreen'
                          : 'bg-white/[0.03] text-slate-200 border-white/10 hover:border-[#47EC84]/40 hover:bg-white/[0.06]'
                      }`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic QR Presentation Area */}
              <div className="p-6 rounded-3xl bg-black/60 border border-white/10 flex flex-col items-center justify-center space-y-4 shadow-inner relative">
                {activeIntent ? (
                  <>
                    <div className="p-4 bg-white rounded-2xl shadow-2xl relative group">
                      {/* Luxury Vector QR SVG */}
                      <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none">
                        <rect width="100" height="100" fill="white" />
                        <rect x="8" y="8" width="28" height="28" fill="#07090A" rx="4" />
                        <rect x="12" y="12" width="20" height="20" fill="white" rx="2" />
                        <rect x="16" y="16" width="12" height="12" fill="#07090A" rx="1" />
                        <rect x="64" y="8" width="28" height="28" fill="#07090A" rx="4" />
                        <rect x="68" y="12" width="20" height="20" fill="white" rx="2" />
                        <rect x="72" y="16" width="12" height="12" fill="#07090A" rx="1" />
                        <rect x="8" y="64" width="28" height="28" fill="#07090A" rx="4" />
                        <rect x="12" y="68" width="20" height="20" fill="white" rx="2" />
                        <rect x="16" y="72" width="12" height="12" fill="#07090A" rx="1" />
                        <rect x="42" y="12" width="6" height="6" fill="#07090A" />
                        <rect x="52" y="22" width="6" height="6" fill="#07090A" />
                        <rect x="42" y="42" width="16" height="16" fill="#47EC84" rx="3" />
                        <rect x="64" y="50" width="6" height="6" fill="#07090A" />
                        <rect x="50" y="72" width="8" height="8" fill="#07090A" />
                        <rect x="74" y="66" width="8" height="8" fill="#07090A" />
                        <rect x="42" y="84" width="6" height="6" fill="#07090A" />
                        <rect x="70" y="84" width="10" height="6" fill="#07090A" />
                      </svg>
                    </div>

                    <div className="text-center space-y-1.5 w-full">
                      <div className="font-display text-base font-black text-[#F5B041] tabular-nums">
                        Amount to Pay: ₹{activeIntent.amount}
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 font-mono flex items-center justify-between gap-2 max-w-sm mx-auto">
                        <span className="truncate">VPA: {activeIntent.merchant_upi || 'veltrix.arena@icici'}</span>
                        <button
                          onClick={() => copyToClipboard(activeIntent.merchant_upi || 'veltrix.arena@icici')}
                          className="text-[#47EC84] hover:underline flex items-center gap-1 font-bold shrink-0"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Instant Sandbox Settlement Button */}
                    <button
                      onClick={handleConfirmDeposit}
                      disabled={confirming}
                      className="w-full py-3.5 btn-emerald-3d font-display font-black text-xs sm:text-sm rounded-xl shadow-glowGreen transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${confirming ? 'animate-spin' : ''}`} />
                      <span>{confirming ? 'Settling Payment Ledger...' : '1-Click Instant Credit (Demo Simulation)'}</span>
                    </button>
                  </>
                ) : (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#F5B041] mx-auto shadow-lux">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div className="text-xs text-slate-400 max-w-xs">
                      Tap below to generate an encrypted dynamic QR code for <strong className="text-white font-bold">₹{depositAmount}</strong>
                    </div>
                    <button
                      onClick={() => handleGenerateQR(depositAmount)}
                      disabled={initiating}
                      className="px-6 py-3 btn-emerald-3d font-display font-black text-xs rounded-xl shadow-glowGreen transition active:scale-95"
                    >
                      {initiating ? 'Generating Encrypted QR...' : 'Generate Dynamic QR'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* WITHDRAW TAB */
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <span className="telemetry-badge text-[#F5B041] border-[#F5B041]/30 bg-[#F5B041]/10 mb-1">
                  IMMEDIATE SETTLEMENT
                </span>
                <h3 className="font-display text-lg sm:text-xl font-black text-white">
                  Direct Cash-Out to Bank / UPI
                </h3>
                <p className="text-xs text-slate-400">
                  24/7 automated payouts directly to your verified Indian bank account or VPA.
                </p>
              </div>

              {/* Channel Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWithdrawChannel('UPI')}
                  className={`p-3.5 rounded-2xl border text-xs font-display font-bold flex items-center justify-center gap-2.5 transition active:scale-95 ${
                    withdrawChannel === 'UPI'
                      ? 'bg-[#47EC84]/15 border-[#47EC84] text-[#47EC84] shadow-glowGreen'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Instant UPI (PhonePe/GPay)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawChannel('BANK')}
                  className={`p-3.5 rounded-2xl border text-xs font-display font-bold flex items-center justify-center gap-2.5 transition active:scale-95 ${
                    withdrawChannel === 'BANK'
                      ? 'bg-[#F5B041]/15 border-[#F5B041] text-[#F5B041] shadow-glowGold'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Direct Bank IMPS</span>
                </button>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <label className="font-bold uppercase tracking-wider text-[11px]">Withdrawal Amount (₹)</label>
                    <span className="font-mono text-[#47EC84] font-semibold">
                      Available: ₹{parseFloat(balances.MAIN || '0').toFixed(0)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={100}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-[#F5B041] font-mono tabular-nums"
                    placeholder="Enter amount (Min ₹100)"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {[500, 1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setWithdrawAmount(amt)}
                        className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] font-bold text-slate-300 hover:text-[#F5B041] hover:border-[#F5B041]/40 active:scale-95 transition"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {withdrawChannel === 'UPI' ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-[11px]">
                      Your UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      required
                      value={withdrawUPI}
                      onChange={(e) => setWithdrawUPI(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-[#47EC84] font-mono"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-[11px]">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        required
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-[#F5B041] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-[11px]">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        required
                        value={bankIFSC}
                        onChange={(e) => setBankIFSC(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-[#F5B041] font-mono uppercase"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={withdrawing}
                  className="w-full py-4 btn-gold-3d font-display font-black text-xs sm:text-sm rounded-xl shadow-glowGold transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{withdrawing ? 'Processing Settlement...' : `Submit Payout Request (₹${withdrawAmount})`}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 4. Complete Double-Entry Financial Ledger Statement */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#47EC84]" />
              <span>Double-Entry Immutable Ledger History</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Real-time audit log of deposits, payouts, wagers, and tournament wins.
            </p>
          </div>

          {/* Search & Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'WIN'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTxFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap transition border ${
                  txFilter === filter
                    ? 'bg-[#47EC84] text-slate-950 border-[#47EC84] shadow-glowGreen'
                    : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-2xl lux-card overflow-hidden">
          {loadingTxs ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#47EC84]" />
              <span>Loading encrypted ledger entries...</span>
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No transactions matching your criteria yet.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {filteredTxs.map((tx) => {
                const isPositive = tx.transaction_type.includes('WIN') || tx.transaction_type === 'DEPOSIT';
                return (
                  <div key={tx.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-2.5 hover:bg-white/[0.03] transition">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono border shrink-0 ${
                        isPositive 
                          ? 'bg-[#47EC84]/15 text-[#47EC84] border-[#47EC84]/30' 
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}>
                        {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {tx.description || tx.transaction_type}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {tx.reference_no}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs sm:text-sm font-black font-mono tabular-nums ${isPositive ? 'text-[#47EC84]' : 'text-red-400'}`}>
                        {isPositive ? '+' : '-'}₹{parseFloat(tx.total_amount).toFixed(2)}
                      </div>
                      <div className="text-[9px] text-slate-400 uppercase font-mono">{tx.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WalletCashierPage() {
  return (
    <Suspense fallback={
      <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-[#47EC84] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono">Decrypting Vault Cashier...</span>
      </div>
    }>
      <WalletCashierContent />
    </Suspense>
  );
}
