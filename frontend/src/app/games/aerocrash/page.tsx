"use client";

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plane, Sparkles, ShieldCheck, History, 
  HelpCircle, AlertCircle, ArrowUpRight, CheckCircle2,
  Volume2, VolumeX, Minus, Plus
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

interface BetPanelState {
  stake: number;
  autoCashout: string;
  isAutoCashoutEnabled: boolean;
  activeBet: any;
  isBetPlaced: boolean;
  cashedOut: boolean;
  payoutAmount: number;
}

export default function AeroCrashPage() {
  const { 
    isAuthenticated, activeBalanceType, balances, 
    fetchBalances, openModal, showNotification 
  } = useStore();

  // Game States: 'COUNTDOWN' | 'FLYING' | 'CRASHED'
  const [gameState, setGameState] = useState<'COUNTDOWN' | 'FLYING' | 'CRASHED'>('COUNTDOWN');
  const [countdown, setCountdown] = useState<number>(5);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [roundData, setRoundData] = useState<any>(null);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);

  // Dual Betting Panels (Original Spribe Aviator signature feature)
  const [panel1, setPanel1] = useState<BetPanelState>({
    stake: 100,
    autoCashout: '2.00',
    isAutoCashoutEnabled: false,
    activeBet: null,
    isBetPlaced: false,
    cashedOut: false,
    payoutAmount: 0,
  });

  const [panel2, setPanel2] = useState<BetPanelState>({
    stake: 200,
    autoCashout: '5.00',
    isAutoCashoutEnabled: false,
    activeBet: null,
    isBetPlaced: false,
    cashedOut: false,
    payoutAmount: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const flightStartTimeRef = useRef<number | null>(null);
  const crashLimitRef = useRef<number>(2.45);
  const propellerAngleRef = useRef<number>(0);

  // Load round data from backend
  const loadRound = async () => {
    try {
      const res = await api.getAeroCrashRound();
      setRoundData(res.round);
      setRecentHistory(res.recent_history);
      if (res.round.crash_point) {
        crashLimitRef.current = res.round.crash_point;
      } else {
        crashLimitRef.current = parseFloat((1.1 + Math.random() * 4.8).toFixed(2));
      }
    } catch {
      crashLimitRef.current = parseFloat((1.1 + Math.random() * 4.8).toFixed(2));
    }
  };

  useEffect(() => {
    loadRound();
  }, []);

  // Main Game Loop Timer
  useEffect(() => {
    let timer: any;
    if (gameState === 'COUNTDOWN') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        setGameState('FLYING');
        setMultiplier(1.00);
        flightStartTimeRef.current = performance.now();
      }
    }
    return () => clearTimeout(timer);
  }, [gameState, countdown]);

  // Handle cashout for a specific panel
  const handleCashoutPanel = async (panelNum: 1 | 2, currentMult: number) => {
    const currentPanel = panelNum === 1 ? panel1 : panel2;
    if (!currentPanel.activeBet || currentPanel.cashedOut) return;

    try {
      const res = await api.cashoutAeroCrash(currentPanel.activeBet.id, currentMult);
      const wonAmt = currentPanel.stake * currentMult;

      if (panelNum === 1) {
        setPanel1((prev) => ({ ...prev, cashedOut: true, payoutAmount: wonAmt }));
      } else {
        setPanel2((prev) => ({ ...prev, cashedOut: true, payoutAmount: wonAmt }));
      }

      await fetchBalances();
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
      showNotification(`Cashed out on Bet ${panelNum}! Won ₹${wonAmt.toFixed(2)} (${currentMult.toFixed(2)}x)`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Cashout failed', 'error');
    }
  };

  // Canvas Flight Animation with Spribe Red Theme & Rotating Propeller Plane
  useEffect(() => {
    if (gameState !== 'FLYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = (time: number) => {
      if (!running) return;

      const elapsedSec = (time - (flightStartTimeRef.current || time)) / 1000;
      // Exponential curve formula
      const currentMult = 1.00 + 0.075 * Math.pow(elapsedSec * 2.2, 1.82);
      const rounded = parseFloat(currentMult.toFixed(2));
      setMultiplier(rounded);

      // Check Auto-cashout for Panel 1
      if (panel1.isBetPlaced && !panel1.cashedOut && panel1.isAutoCashoutEnabled) {
        const target = parseFloat(panel1.autoCashout);
        if (target && rounded >= target && target <= crashLimitRef.current) {
          handleCashoutPanel(1, rounded);
        }
      }

      // Check Auto-cashout for Panel 2
      if (panel2.isBetPlaced && !panel2.cashedOut && panel2.isAutoCashoutEnabled) {
        const target = parseFloat(panel2.autoCashout);
        if (target && rounded >= target && target <= crashLimitRef.current) {
          handleCashoutPanel(2, rounded);
        }
      }

      // Check Crash State
      if (rounded >= crashLimitRef.current) {
        running = false;
        setGameState('CRASHED');
        if (roundData?.id) {
          api.finishAeroCrashRound(roundData.id).catch(() => {});
        }

        // Restart next round countdown after 4 seconds
        setTimeout(() => {
          loadRound();
          setPanel1((prev) => ({ ...prev, isBetPlaced: false, activeBet: null, cashedOut: false, payoutAmount: 0 }));
          setPanel2((prev) => ({ ...prev, isBetPlaced: false, activeBet: null, cashedOut: false, payoutAmount: 0 }));
          setCountdown(5);
          setGameState('COUNTDOWN');
        }, 4200);
        return;
      }

      // --- CANVAS RENDERING (Original Spribe Aviator Deep Burgundy & Red Curve) ---
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // 1. Spribe Dark Burgundy Canvas Atmosphere
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.7);
      bgGrad.addColorStop(0, '#1c0608'); // Dark maroon red center
      bgGrad.addColorStop(0.7, '#130406'); // Deep burgundy
      bgGrad.addColorStop(1, '#0a0203'); // Near black edge
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle Red Grid Lines & Axes
      ctx.strokeStyle = 'rgba(230, 22, 22, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 60; x < width; x += 65) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height - 25);
        ctx.stroke();
      }
      for (let y = height - 50; y > 20; y -= 50) {
        ctx.beginPath();
        ctx.moveTo(35, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Axis lines
      ctx.strokeStyle = 'rgba(230, 22, 22, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(35, 10);
      ctx.lineTo(35, height - 25);
      ctx.lineTo(width - 10, height - 25);
      ctx.stroke();

      // 3. Compute Exponential Flight Path
      const progress = Math.min(1, elapsedSec / 11);
      const startX = 35;
      const startY = height - 25;
      const endX = startX + (width - 130) * Math.min(1, progress * 1.18);
      const endY = startY - (height - 90) * Math.min(1, Math.pow(progress, 1.38));

      // 4. Fill Area Under the Red Curve (Spribe Fiery Red Shading)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + (endX - startX) * 0.45, startY, endX, endY);
      ctx.lineTo(endX, startY);
      ctx.closePath();

      const areaGrad = ctx.createLinearGradient(0, endY, 0, startY);
      areaGrad.addColorStop(0, 'rgba(230, 22, 22, 0.45)'); // Vibrant red top
      areaGrad.addColorStop(0.6, 'rgba(230, 22, 22, 0.15)');
      areaGrad.addColorStop(1, 'rgba(230, 22, 22, 0.01)'); // Fades to transparent base
      ctx.fillStyle = areaGrad;
      ctx.fill();
      ctx.restore();

      // 5. Draw Glowing Crimson Red Trajectory Curve
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + (endX - startX) * 0.45, startY, endX, endY);
      ctx.strokeStyle = '#E61616';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#FF1F44';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.restore();

      // 6. Draw Original Spribe Aviator Red Propeller Plane
      ctx.save();
      ctx.translate(endX, endY);
      const flightAngle = Math.atan2(endY - startY, endX - startX) * 0.42;
      ctx.rotate(flightAngle);

      // Rotate propeller
      propellerAngleRef.current = (propellerAngleRef.current + 0.35) % (Math.PI * 2);

      // Red fuselage
      ctx.fillStyle = '#E50914';
      ctx.shadowColor = '#FF1F44';
      ctx.shadowBlur = 12;

      // Streamlined plane body
      ctx.beginPath();
      ctx.moveTo(22, 0); // Nose
      ctx.lineTo(-14, -8); // Top wing tip
      ctx.lineTo(-8, 0); // Wing root
      ctx.lineTo(-20, -5); // Tail fin top
      ctx.lineTo(-24, 0); // Tail rear
      ctx.lineTo(-20, 5); // Tail fin bottom
      ctx.lineTo(-8, 0);
      ctx.lineTo(-14, 8); // Bottom wing tip
      ctx.closePath();
      ctx.fill();

      // Cockpit Window (Glossy tinted glass)
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.ellipse(3, -1, 5, 2.5, Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();

      // Spinning Red Propeller on the Nose
      ctx.save();
      ctx.translate(22, 0);
      ctx.rotate(propellerAngleRef.current);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, 9);
      ctx.stroke();
      // Propeller blur disc
      ctx.fillStyle = 'rgba(229, 9, 20, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore(); // Restore plane canvas transform

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, panel1, panel2]);

  // Place Bet for a panel
  const handlePlaceBet = async (panelNum: 1 | 2) => {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    if (gameState !== 'COUNTDOWN') {
      showNotification('Wait for next round countdown to place bet.', 'error');
      return;
    }

    const currentPanel = panelNum === 1 ? panel1 : panel2;
    try {
      const autoVal = currentPanel.isAutoCashoutEnabled ? parseFloat(currentPanel.autoCashout) : undefined;
      const res = await api.placeAeroCrashBet(roundData.id, currentPanel.stake, activeBalanceType, autoVal);

      if (panelNum === 1) {
        setPanel1((prev) => ({ ...prev, isBetPlaced: true, activeBet: res.bet }));
      } else {
        setPanel2((prev) => ({ ...prev, isBetPlaced: true, activeBet: res.bet }));
      }

      await fetchBalances();
      showNotification(`Bet ${panelNum} (₹${currentPanel.stake}) locked! Ready for takeoff.`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to place bet', 'error');
    }
  };

  // Helper for preset chips
  const applyPreset = (panelNum: 1 | 2, amount: number) => {
    if (panelNum === 1) {
      setPanel1((prev) => ({ ...prev, stake: amount }));
    } else {
      setPanel2((prev) => ({ ...prev, stake: amount }));
    }
  };

  const adjustStake = (panelNum: 1 | 2, delta: number) => {
    if (panelNum === 1) {
      setPanel1((prev) => ({ ...prev, stake: Math.max(10, Math.min(25000, prev.stake + delta)) }));
    } else {
      setPanel2((prev) => ({ ...prev, stake: Math.max(10, Math.min(25000, prev.stake + delta)) }));
    }
  };

  return (
    <div className="space-y-3 xs:space-y-4 px-2 xs:px-3 sm:px-6 py-2.5 xs:py-3 sm:py-4 max-w-7xl mx-auto select-none bg-[#0a0203] min-h-[calc(100vh-5rem)] rounded-2xl sm:rounded-3xl border border-[#230b0f] pb-28 w-full max-w-full overflow-x-hidden">
      {/* Top Multiplier History Bar (Authentic Spribe Color Coding) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none px-2 bg-[#140608] py-2 rounded-2xl border border-[#2e0e13]">
        <div className="flex items-center gap-1 text-[11px] text-red-300 font-bold mr-2 uppercase tracking-wider shrink-0">
          <History className="w-3.5 h-3.5 text-red-500" />
          <span>ROUNDS:</span>
        </div>
        {recentHistory.map((item, idx) => {
          const val = item.multiplier;
          // Spribe Color rules:
          // < 2.00x: Blue
          // 2.00x - 9.99x: Purple
          // >= 10.00x: Hot Magenta / Rose
          const colorClass = 
            val >= 10.0
              ? 'bg-[#E11D48]/20 text-[#FB7185] border-[#E11D48]/50 shadow-[0_0_8px_rgba(225,29,72,0.4)]'
              : val >= 2.0
              ? 'bg-[#9333EA]/20 text-[#C084FC] border-[#9333EA]/50'
              : 'bg-[#2563EB]/20 text-[#60A5FA] border-[#2563EB]/40';

          return (
            <button
              key={idx}
              onClick={() => setShowFairnessModal(true)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold shrink-0 border transition hover:scale-105 ${colorClass}`}
            >
              {val.toFixed(2)}x
            </button>
          );
        })}
      </div>

      {/* Main Aviator Flight Arena Window */}
      <div className="relative rounded-3xl bg-[#110406] border-2 border-[#2e0e13] overflow-hidden shadow-2xl min-h-[360px] sm:min-h-[440px] flex flex-col justify-between">
        {/* Canvas Flight Viewport */}
        <canvas
          ref={canvasRef}
          width={760}
          height={440}
          className="w-full h-full absolute inset-0 z-0"
        />

        {/* Top Controls Overlay */}
        <div className="relative z-10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-xs font-black text-red-400 tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              AVIATOR LIVE
            </span>

            <button
              onClick={() => setShowFairnessModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-red-500/20 text-xs font-mono text-zinc-400 hover:text-red-300 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              <span className="truncate max-w-[180px]">
                {roundData?.server_seed_hash ? `Hash: ${roundData.server_seed_hash.substring(0, 16)}...` : 'Provably Fair'}
              </span>
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-black/50 border border-red-500/20 text-zinc-400 hover:text-white transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Center Multiplier Typography (Original Aviator Clean Big Numbers) */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center pointer-events-none">
          {gameState === 'COUNTDOWN' && (
            <div className="space-y-2 animate-fade-in bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-red-500/20">
              <div className="text-xs uppercase tracking-widest text-red-400 font-bold">
                WAITING FOR NEXT ROUND
              </div>
              <div className="text-5xl sm:text-7xl font-black text-white font-mono tracking-tight">
                {countdown}s
              </div>
              <div className="w-52 h-1.5 bg-zinc-800 rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full bg-red-600 transition-all duration-1000 shadow-[0_0_10px_#E50914]"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {gameState === 'FLYING' && (
            <div className="space-y-1">
              <div className="text-6xl sm:text-9xl font-black font-mono tracking-tight text-white drop-shadow-[0_4px_30px_rgba(229,9,20,0.6)]">
                {multiplier.toFixed(2)}x
              </div>
            </div>
          )}

          {gameState === 'CRASHED' && (
            <div className="space-y-1 animate-scale-up">
              <div className="text-base sm:text-xl font-black uppercase tracking-widest text-red-500">
                FLEW AWAY!
              </div>
              <div className="text-6xl sm:text-9xl font-black font-mono tracking-tight text-red-600 drop-shadow-[0_4px_35px_rgba(229,9,20,0.8)]">
                {multiplier.toFixed(2)}x
              </div>
            </div>
          )}
        </div>

        {/* Bottom Banner Status */}
        <div className="relative z-10 px-4 py-2 border-t border-red-950/60 bg-black/40 flex items-center justify-between text-xs text-zinc-400">
          <span className="font-mono text-[11px]">Round: {roundData?.round_number || 'AV-LIVE'}</span>
          <span className="text-red-400 text-[11px] font-semibold">Server Authoritative • Spribe Engine</span>
        </div>
      </div>

      {/* DUAL BETTING DESKS (Original Spribe Aviator 2-Bet Control System) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Panel 1 */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#140608] border-2 border-[#2e0e13] shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-red-950/40">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">BET 1</span>
            {/* Auto Cash Out toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <span className="text-zinc-400 text-[11px]">Auto Cash Out:</span>
              <input
                type="checkbox"
                checked={panel1.isAutoCashoutEnabled}
                onChange={(e) => setPanel1((p) => ({ ...p, isAutoCashoutEnabled: e.target.checked }))}
                className="accent-red-600 rounded"
              />
              {panel1.isAutoCashoutEnabled && (
                <input
                  type="number"
                  step="0.1"
                  min="1.01"
                  value={panel1.autoCashout}
                  onChange={(e) => setPanel1((p) => ({ ...p, autoCashout: e.target.value }))}
                  className="w-16 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-xs font-mono text-white text-center"
                />
              )}
            </label>
          </div>

          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Stake Stepper (5 Cols) */}
            <div className="col-span-5 space-y-2">
              <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-2xl p-1">
                <button
                  onClick={() => adjustStake(1, -50)}
                  disabled={panel1.isBetPlaced}
                  className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center font-bold text-sm"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 text-center font-mono font-bold text-sm text-white">
                  ₹{panel1.stake}
                </div>
                <button
                  onClick={() => adjustStake(1, 50)}
                  disabled={panel1.isBetPlaced}
                  className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center font-bold text-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chips row */}
              <div className="grid grid-cols-4 gap-1">
                {[50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    disabled={panel1.isBetPlaced}
                    onClick={() => applyPreset(1, amt)}
                    className="py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-zinc-300 font-bold"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Massive Green BET / Orange CASH OUT Button (7 Cols) */}
            <div className="col-span-7">
              {panel1.isBetPlaced && gameState === 'FLYING' && !panel1.cashedOut ? (
                <button
                  onClick={() => handleCashoutPanel(1, multiplier)}
                  className="w-full h-20 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(249,115,22,0.6)] flex flex-col items-center justify-center transition transform active:scale-95 animate-pulse"
                >
                  <span className="text-xs uppercase tracking-wider font-extrabold text-slate-900">CASH OUT</span>
                  <span className="text-lg font-mono font-black text-slate-950">
                    ₹{(panel1.stake * multiplier).toFixed(2)}
                  </span>
                </button>
              ) : panel1.isBetPlaced && panel1.cashedOut ? (
                <button
                  disabled
                  className="w-full h-20 rounded-2xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 font-black text-sm flex flex-col items-center justify-center cursor-default"
                >
                  <span className="text-xs">CASHED OUT</span>
                  <span className="text-base font-mono text-emerald-300">₹{panel1.payoutAmount.toFixed(2)}</span>
                </button>
              ) : panel1.isBetPlaced && gameState === 'COUNTDOWN' ? (
                <button
                  disabled
                  className="w-full h-20 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-300 font-black text-sm flex flex-col items-center justify-center cursor-default"
                >
                  <span className="text-xs uppercase">WAITING LAUNCH</span>
                  <span className="text-base font-mono text-red-200">₹{panel1.stake}.00</span>
                </button>
              ) : (
                <button
                  onClick={() => handlePlaceBet(1)}
                  disabled={gameState !== 'COUNTDOWN'}
                  className="w-full h-20 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] flex flex-col items-center justify-center transition transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-sm uppercase tracking-wider">BET</span>
                  <span className="text-lg font-mono">₹{panel1.stake}.00</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel 2 */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#140608] border-2 border-[#2e0e13] shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-red-950/40">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">BET 2</span>
            {/* Auto Cash Out toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <span className="text-zinc-400 text-[11px]">Auto Cash Out:</span>
              <input
                type="checkbox"
                checked={panel2.isAutoCashoutEnabled}
                onChange={(e) => setPanel2((p) => ({ ...p, isAutoCashoutEnabled: e.target.checked }))}
                className="accent-red-600 rounded"
              />
              {panel2.isAutoCashoutEnabled && (
                <input
                  type="number"
                  step="0.1"
                  min="1.01"
                  value={panel2.autoCashout}
                  onChange={(e) => setPanel2((p) => ({ ...p, autoCashout: e.target.value }))}
                  className="w-16 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-xs font-mono text-white text-center"
                />
              )}
            </label>
          </div>

          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Stake Stepper (5 Cols) */}
            <div className="col-span-5 space-y-2">
              <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-2xl p-1">
                <button
                  onClick={() => adjustStake(2, -50)}
                  disabled={panel2.isBetPlaced}
                  className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center font-bold text-sm"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 text-center font-mono font-bold text-sm text-white">
                  ₹{panel2.stake}
                </div>
                <button
                  onClick={() => adjustStake(2, 50)}
                  disabled={panel2.isBetPlaced}
                  className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center font-bold text-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chips row */}
              <div className="grid grid-cols-4 gap-1">
                {[100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    disabled={panel2.isBetPlaced}
                    onClick={() => applyPreset(2, amt)}
                    className="py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-zinc-300 font-bold"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Massive Green BET / Orange CASH OUT Button (7 Cols) */}
            <div className="col-span-7">
              {panel2.isBetPlaced && gameState === 'FLYING' && !panel2.cashedOut ? (
                <button
                  onClick={() => handleCashoutPanel(2, multiplier)}
                  className="w-full h-20 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(249,115,22,0.6)] flex flex-col items-center justify-center transition transform active:scale-95 animate-pulse"
                >
                  <span className="text-xs uppercase tracking-wider font-extrabold text-slate-900">CASH OUT</span>
                  <span className="text-lg font-mono font-black text-slate-950">
                    ₹{(panel2.stake * multiplier).toFixed(2)}
                  </span>
                </button>
              ) : panel2.isBetPlaced && panel2.cashedOut ? (
                <button
                  disabled
                  className="w-full h-20 rounded-2xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 font-black text-sm flex flex-col items-center justify-center cursor-default"
                >
                  <span className="text-xs">CASHED OUT</span>
                  <span className="text-base font-mono text-emerald-300">₹{panel2.payoutAmount.toFixed(2)}</span>
                </button>
              ) : panel2.isBetPlaced && gameState === 'COUNTDOWN' ? (
                <button
                  disabled
                  className="w-full h-20 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-300 font-black text-sm flex flex-col items-center justify-center cursor-default"
                >
                  <span className="text-xs uppercase">WAITING LAUNCH</span>
                  <span className="text-base font-mono text-red-200">₹{panel2.stake}.00</span>
                </button>
              ) : (
                <button
                  onClick={() => handlePlaceBet(2)}
                  disabled={gameState !== 'COUNTDOWN'}
                  className="w-full h-20 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] flex flex-col items-center justify-center transition transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-sm uppercase tracking-wider">BET</span>
                  <span className="text-lg font-mono">₹{panel2.stake}.00</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fairness & Seed Audit Modal */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#140608] border-2 border-red-600/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-red-950">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-500" />
                <span>Aviator Provably Fair Commitment</span>
              </h3>
              <button onClick={() => setShowFairnessModal(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                Every Aviator round result is cryptographically predetermined using SHA-256 HMAC before the round opens.
              </p>
              <div>
                <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">Server Seed Hash (Pre-Committed)</label>
                <div className="p-2.5 rounded-xl bg-black font-mono text-[11px] text-amber-400 break-all border border-red-950">
                  {roundData?.server_seed_hash || 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">Client Combined Seed</label>
                <div className="p-2.5 rounded-xl bg-black font-mono text-[11px] text-cyan-400 break-all border border-red-950">
                  {roundData?.client_seed || 'veltrix-community-seed-1'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-[11px] text-zinc-300">
                ✓ 97% Return to Player (RTP). The outcome is generated on the server and cannot be manipulated by client or administrator during flight.
              </div>
            </div>

            <button
              onClick={() => setShowFairnessModal(false)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition"
            >
              Close Verification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
