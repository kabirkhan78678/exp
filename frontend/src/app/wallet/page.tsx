"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, ShieldCheck, 
  RefreshCw, Search, Clock, CheckCircle2, AlertTriangle, 
  Copy, Download, QrCode, Check, Sparkles, Building2, Smartphone
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

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

  const presetAmounts = [100, 500, 1000, 2500, 5000];

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
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-28">
      {/* 1. Header & Quick Balance Overview */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/30 text-[10px] font-black uppercase">
            Double-Entry Financial Hub
          </span>
          <span className="text-[10px] text-aurora-muted flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-aurora-cyan" />
            <span>Encrypted Ledger Payouts</span>
          </span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-aurora-text">
          Deposit & Withdraw Cashier
        </h1>
      </div>

      {/* 2. Compact 4-Card Balance Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 rounded-3xl bg-[#212526] border border-[#47EC84]/30 shadow-sm">
          <div className="text-[10px] sm:text-xs text-zinc-400 mb-1 truncate">Main Withdrawable Cash</div>
          <div className="text-lg sm:text-2xl font-black text-[#47EC84] font-mono truncate">
            ₹{parseFloat(balances.MAIN || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[9px] text-zinc-400 mt-1">Ready to Cash Out</div>
        </div>

        <div className="p-3.5 rounded-3xl bg-[#212526] border border-[#F59E0B]/30 shadow-sm">
          <div className="text-[10px] sm:text-xs text-zinc-400 mb-1 truncate">Demo Play Balance</div>
          <div className="text-lg sm:text-2xl font-black text-[#F59E0B] font-mono truncate">
            ₹{parseFloat(balances.DEMO || '0').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[9px] text-zinc-400 mt-1">Unlimited Free Play</div>
        </div>

        <div className="p-3.5 rounded-3xl bg-[#212526] border border-white/[0.08]">
          <div className="text-[10px] sm:text-xs text-zinc-400 mb-1 truncate">Promotional Bonus</div>
          <div className="text-lg sm:text-2xl font-black text-purple-400 font-mono truncate">
            ₹{parseFloat(balances.BONUS || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[9px] text-zinc-400 mt-1">Wagering Eligible</div>
        </div>

        <div className="p-3.5 rounded-3xl bg-[#212526] border border-white/[0.08]">
          <div className="text-[10px] sm:text-xs text-zinc-400 mb-1 truncate">In-Play Reserved</div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono truncate">
            ₹{parseFloat(balances.ESCROW || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[9px] text-zinc-400 mt-1">Escrow in active bets</div>
        </div>
      </div>

      {/* 3. Smart Unified Cashier: Tab Switcher (Deposit QR vs Withdraw UPI) */}
      <div className="rounded-3xl bg-[#212526] border border-white/[0.08] overflow-hidden shadow-2xl">
        {/* Tab Buttons */}
        <div className="grid grid-cols-2 border-b border-white/[0.08] bg-[#1a1d1e] p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('DEPOSIT')}
            className={`py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
              activeTab === 'DEPOSIT'
                ? 'bg-[#47EC84] text-slate-950 shadow-glowGreen'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Deposit via QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('WITHDRAW')}
            className={`py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
              activeTab === 'WITHDRAW'
                ? 'bg-[#47EC84] text-slate-950 shadow-glowGreen'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>Withdraw to UPI / Bank</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'DEPOSIT' ? (
            /* DEPOSIT PANEL */
            <div className="space-y-5 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Instant UPI Dynamic QR Deposit
                </h3>
                <p className="text-xs text-zinc-400">
                  Supports PhonePe, Google Pay, Paytm, BHIM, CRED & Net Banking.
                </p>
              </div>

              {/* Amount Selection Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Select Deposit Amount (₹)
                </label>
                <div className="grid grid-cols-5 gap-1 xs:gap-1.5">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setDepositAmount(amt); handleGenerateQR(amt); }}
                      className={`py-2 px-1 rounded-xl text-[11px] xs:text-xs font-black transition-all active:scale-95 truncate ${
                        depositAmount === amt
                          ? 'bg-[#47EC84] text-slate-950 shadow-glowGreen'
                          : 'bg-[#2A3031] text-zinc-300 border border-white/10 hover:border-[#47EC84]/50'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code Container */}
              <div className="p-5 rounded-2xl bg-[#141617] border border-white/10 flex flex-col items-center justify-center space-y-3 shadow-inner">
                {activeIntent ? (
                  <>
                    <div className="p-3 bg-white rounded-2xl shadow-xl">
                      {/* Dynamic NPCI SVG QR Code Simulation */}
                      <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
                        <rect width="100" height="100" fill="white" />
                        <rect x="10" y="10" width="26" height="26" fill="black" />
                        <rect x="13" y="13" width="20" height="20" fill="white" />
                        <rect x="17" y="17" width="12" height="12" fill="black" />
                        <rect x="64" y="10" width="26" height="26" fill="black" />
                        <rect x="67" y="13" width="20" height="20" fill="white" />
                        <rect x="71" y="17" width="12" height="12" fill="black" />
                        <rect x="10" y="64" width="26" height="26" fill="black" />
                        <rect x="13" y="67" width="20" height="20" fill="white" />
                        <rect x="17" y="71" width="12" height="12" fill="black" />
                        <rect x="42" y="15" width="6" height="6" fill="black" />
                        <rect x="52" y="25" width="6" height="6" fill="black" />
                        <rect x="42" y="42" width="16" height="16" fill="#47EC84" rx="2" />
                        <rect x="64" y="52" width="6" height="6" fill="black" />
                        <rect x="52" y="72" width="6" height="6" fill="black" />
                        <rect x="72" y="68" width="8" height="8" fill="black" />
                        <rect x="42" y="72" width="6" height="6" fill="black" />
                      </svg>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="text-xs font-mono text-[#F59E0B] font-bold">
                        Amount to Pay: ₹{activeIntent.amount}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-center gap-1.5">
                        <span>UPI: {activeIntent.merchant_upi || 'veltrix.arena@icici'}</span>
                        <button
                          onClick={() => copyToClipboard(activeIntent.merchant_upi || 'veltrix.arena@icici')}
                          className="text-[#47EC84] hover:underline"
                        >
                          {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Instant Sandbox Settlement Button */}
                    <button
                      onClick={handleConfirmDeposit}
                      disabled={confirming}
                      className="w-full py-3 bg-[#47EC84] hover:bg-[#3ce076] text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-glowGreen transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${confirming ? 'animate-spin' : ''}`} />
                      <span>{confirming ? 'Settling Payment...' : '1-Click Sandbox Instant Credit'}</span>
                    </button>
                  </>
                ) : (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-aurora-elevated flex items-center justify-center text-aurora-gold mx-auto">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div className="text-xs text-aurora-muted max-w-xs">
                      Tap below to generate an encrypted QR code for <strong className="text-aurora-text font-bold">₹{depositAmount}</strong>
                    </div>
                    <button
                      onClick={() => handleGenerateQR(depositAmount)}
                      disabled={initiating}
                      className="px-6 py-2.5 bg-gradient-to-r from-aurora-gold to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-glowGold transition active:scale-95"
                    >
                      {initiating ? 'Generating...' : 'Generate Dynamic QR'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* WITHDRAW PANEL */
            <div className="space-y-5 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-lg font-black text-aurora-text">
                  Instant Payout & Cash Out
                </h3>
                <p className="text-xs text-aurora-muted">
                  Funds will be credited to your verified UPI ID or Bank account.
                </p>
              </div>

              {/* Channel Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawChannel('UPI')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    withdrawChannel === 'UPI'
                      ? 'bg-aurora-elevated border-aurora-cyan text-aurora-cyan shadow-sm'
                      : 'bg-aurora-surface border-aurora-border text-aurora-muted'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI VPA (Instant)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawChannel('BANK')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    withdrawChannel === 'BANK'
                      ? 'bg-aurora-elevated border-aurora-cyan text-aurora-cyan shadow-sm'
                      : 'bg-aurora-surface border-aurora-border text-aurora-muted'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Bank IMPS</span>
                </button>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-aurora-muted mb-1">
                    <label className="font-bold uppercase tracking-wider">Withdrawal Amount (₹)</label>
                    <span className="font-mono text-aurora-cyan font-semibold">
                      Max: ₹{parseFloat(balances.MAIN || '0').toFixed(0)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={100}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-aurora-elevated border border-aurora-border text-sm text-aurora-text focus:outline-none focus:border-aurora-cyan font-mono"
                    placeholder="Enter amount (Min ₹100)"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {[500, 1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setWithdrawAmount(amt)}
                        className="px-2.5 py-1 rounded-lg bg-aurora-surface border border-aurora-border text-[10px] font-bold text-aurora-muted hover:text-aurora-cyan active:scale-95 transition"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {withdrawChannel === 'UPI' ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-aurora-muted mb-1">
                      Your UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      required
                      value={withdrawUPI}
                      onChange={(e) => setWithdrawUPI(e.target.value)}
                      placeholder="e.g. mobile@okhdfcbank"
                      className="w-full px-4 py-3 rounded-xl bg-aurora-elevated border border-aurora-border text-sm text-aurora-text focus:outline-none focus:border-aurora-cyan font-mono"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-aurora-muted mb-1">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        required
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-aurora-elevated border border-aurora-border text-sm text-aurora-text focus:outline-none focus:border-aurora-cyan font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-aurora-muted mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        required
                        value={bankIFSC}
                        onChange={(e) => setBankIFSC(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-aurora-elevated border border-aurora-border text-sm text-aurora-text focus:outline-none focus:border-aurora-cyan font-mono uppercase"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={withdrawing}
                  className="w-full py-3.5 bg-gradient-to-r from-aurora-cyan to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-glow transition hover:opacity-95 active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{withdrawing ? 'Processing Request...' : `Submit Withdrawal (₹${withdrawAmount})`}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 4. Complete Double-Entry Financial Ledger Statement */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-black text-aurora-text flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-aurora-cyan" />
              <span>Double-Entry Ledger History</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-aurora-muted">
              Immutable debit and credit transactions with cryptographic reference numbers.
            </p>
          </div>

          {/* Search & Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'WIN'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTxFilter(filter)}
                className={`px-3 py-1 rounded-xl text-[10px] font-black whitespace-nowrap transition ${
                  txFilter === filter
                    ? 'bg-red-600 text-white shadow-glowRed'
                    : 'bg-[#12080B] text-zinc-400 border border-red-950/80'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-2xl bg-[#12080B] border border-red-950/80 overflow-hidden shadow-2xl">
          {loadingTxs ? (
            <div className="p-8 text-center text-xs text-aurora-muted">Loading ledger entries...</div>
          ) : filteredTxs.length === 0 ? (
            <div className="p-8 text-center text-xs text-aurora-muted">No transactions matching your criteria.</div>
          ) : (
            <div className="divide-y divide-aurora-border/50">
              {filteredTxs.map((tx) => {
                const isPositive = tx.transaction_type.includes('WIN') || tx.transaction_type === 'DEPOSIT';
                return (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-aurora-elevated/40 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                        isPositive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}>
                        {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-aurora-text truncate max-w-[120px] xs:max-w-[170px] sm:max-w-xs">
                          {tx.description || tx.transaction_type}
                        </div>
                        <div className="text-[10px] font-mono text-aurora-muted truncate max-w-[120px] xs:max-w-[170px]">{tx.reference_no}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-black font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : '-'}₹{parseFloat(tx.total_amount).toFixed(2)}
                      </div>
                      <div className="text-[9px] text-aurora-muted uppercase font-mono">{tx.status}</div>
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
    <Suspense fallback={<div className="p-12 text-center text-xs text-aurora-muted flex flex-col items-center gap-2">
      <div className="w-6 h-6 border-2 border-aurora-cyan border-t-transparent rounded-full animate-spin" />
      <span>Loading Cashier...</span>
    </div>}>
      <WalletCashierContent />
    </Suspense>
  );
}
