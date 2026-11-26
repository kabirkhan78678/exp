"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Disc, Sparkles, RefreshCw, Trophy, 
  HelpCircle, ShieldCheck, CheckCircle2, ArrowRight,
  Volume2, VolumeX, AlertTriangle, ChevronLeft, ChevronRight, RotateCcw
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

interface Coin {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  type: 'WHITE' | 'BLACK' | 'QUEEN';
  color: string;
  borderColor: string;
  innerRingColor: string;
  points: number;
  isPocketed: boolean;
}

export default function CarromPage() {
  const { isAuthenticated, activeBalanceType, fetchBalances, openModal, showNotification } = useStore();

  const [score, setScore] = useState<number>(0);
  const [pocketedWhite, setPocketedWhite] = useState<number>(0);
  const [pocketedBlack, setPocketedBlack] = useState<number>(0);
  const [hasQueen, setHasQueen] = useState<boolean>(false);
  const [queenCovered, setQueenCovered] = useState<boolean>(false);
  const [queenPendingCover, setQueenPendingCover] = useState<boolean>(false);
  const [foulCount, setFoulCount] = useState<number>(0);
  const [turns, setTurns] = useState<number>(1);
  const [strikerX, setStrikerX] = useState<number>(270);
  const [aimAngle, setAimAngle] = useState<number>(-Math.PI / 2);
  const [aimPower, setAimPower] = useState<number>(18);
  const [isStriking, setIsStriking] = useState<boolean>(false);
  const [isDraggingStriker, setIsDraggingStriker] = useState<boolean>(false);
  const [isSlingshotAiming, setIsSlingshotAiming] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [matchSubmitted, setMatchSubmitted] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const coinsRef = useRef<Coin[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const BOARD_SIZE = 540;
  const POCKET_RADIUS = 28;
  const BASELINE_Y = 460;
  const MIN_STRIKER_X = 110;
  const MAX_STRIKER_X = 430;

  const POCKETS = [
    { x: 38, y: 38 },
    { x: BOARD_SIZE - 38, y: 38 },
    { x: 38, y: BOARD_SIZE - 38 },
    { x: BOARD_SIZE - 38, y: BOARD_SIZE - 38 },
  ];

  const strikerRef = useRef({
    x: 270,
    y: BASELINE_Y,
    vx: 0,
    vy: 0,
    radius: 19.5,
    mass: 3.2,
    isResting: true,
  });

  // Sound Synthesizer via Web Audio API (Authentic Wooden Thuds and Pocket Chimes)
  const playSound = useCallback((type: 'clack' | 'cushion' | 'pocket' | 'foul') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'clack') {
        // High frequency solid wood impact
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.05);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'cushion') {
        // Muffled hardwood rebound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.07);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'pocket') {
        // Pocket net drop chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.22); // A5
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'foul') {
        // Penalty buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {}
  }, [soundEnabled]);

  // Full Official 19 Pieces Setup (Tournament ICF Standard: 9 White + 9 Black + 1 Red Queen)
  const initBoard = () => {
    const center = BOARD_SIZE / 2;
    const coins: Coin[] = [];
    let idCounter = 1;

    // 1. Red Queen at exact center (Scarlet Crimson Wood)
    coins.push({
      id: idCounter++,
      x: center,
      y: center,
      vx: 0,
      vy: 0,
      radius: 14,
      mass: 1.0,
      type: 'QUEEN',
      color: '#DC2626', // Deep scarlet
      borderColor: '#B91C1C',
      innerRingColor: '#FDE047', // Gold floral star
      points: 25,
      isPocketed: false,
    });

    // 2. Ring 1: 6 coins alternating White Boxwood & Black Ebony
    const r1 = 28;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const isWhite = i % 2 === 0;
      coins.push({
        id: idCounter++,
        x: center + r1 * Math.cos(angle),
        y: center + r1 * Math.sin(angle),
        vx: 0,
        vy: 0,
        radius: 13.5,
        mass: 1.0,
        type: isWhite ? 'WHITE' : 'BLACK',
        color: isWhite ? '#FFFDF7' : '#1A1815', // Creamy boxwood or ebony
        borderColor: isWhite ? '#D4B982' : '#332F2A',
        innerRingColor: isWhite ? '#A88D56' : '#524B43',
        points: isWhite ? 10 : 5,
        isPocketed: false,
      });
    }

    // 3. Ring 2: 12 coins alternating pattern
    const r2 = 56;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6 + Math.PI / 12;
      const isWhite = i % 2 === 1;
      coins.push({
        id: idCounter++,
        x: center + r2 * Math.cos(angle),
        y: center + r2 * Math.sin(angle),
        vx: 0,
        vy: 0,
        radius: 13.5,
        mass: 1.0,
        type: isWhite ? 'WHITE' : 'BLACK',
        color: isWhite ? '#FFFDF7' : '#1A1815',
        borderColor: isWhite ? '#D4B982' : '#332F2A',
        innerRingColor: isWhite ? '#A88D56' : '#524B43',
        points: isWhite ? 10 : 5,
        isPocketed: false,
      });
    }

    coinsRef.current = coins;
    setScore(0);
    setPocketedWhite(0);
    setPocketedBlack(0);
    setHasQueen(false);
    setQueenCovered(false);
    setQueenPendingCover(false);
    setFoulCount(0);
    setTurns(1);
    setMatchSubmitted(false);

    strikerRef.current.x = 270;
    strikerRef.current.y = BASELINE_Y;
    strikerRef.current.vx = 0;
    strikerRef.current.vy = 0;
    strikerRef.current.isResting = true;
    setStrikerX(270);
    setIsStriking(false);
  };

  useEffect(() => {
    initBoard();
  }, []);

  const updateStrikerPosition = (newX: number) => {
    if (!strikerRef.current.isResting) return;
    const clamped = Math.max(MIN_STRIKER_X, Math.min(MAX_STRIKER_X, newX));
    setStrikerX(clamped);
    strikerRef.current.x = clamped;
    strikerRef.current.y = BASELINE_Y;
  };

  // High-Precision Physics Animation Loop with Sub-stepping (Anti-Tunneling & Overlap Separation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const renderBoard = () => {
      // 1. Draw Authentic English Birch Tournament Board Surface
      ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // Outer Deep Rosewood / Teak Border Frame
      const borderWidth = 26;
      ctx.fillStyle = '#23120B'; // Dark rosewood
      ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // Frame Inner Dark Bevel
      ctx.fillStyle = '#170B06';
      ctx.fillRect(borderWidth - 4, borderWidth - 4, BOARD_SIZE - (borderWidth - 4) * 2, BOARD_SIZE - (borderWidth - 4) * 2);

      // Genuine English Birch Natural Plywood Satin Surface
      const birchGrad = ctx.createRadialGradient(BOARD_SIZE / 2, BOARD_SIZE / 2, 40, BOARD_SIZE / 2, BOARD_SIZE / 2, BOARD_SIZE * 0.7);
      birchGrad.addColorStop(0, '#F5E4C3'); // Warm natural birch center
      birchGrad.addColorStop(0.7, '#EAD1A6'); // Polished birch wood
      birchGrad.addColorStop(1, '#DEBF8E'); // Satin edge
      ctx.fillStyle = birchGrad;
      ctx.fillRect(borderWidth, borderWidth, BOARD_SIZE - borderWidth * 2, BOARD_SIZE - borderWidth * 2);

      // Inlaid Black Trim Pin-Stripe
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(borderWidth + 2, borderWidth + 2, BOARD_SIZE - borderWidth * 2 - 4, BOARD_SIZE - borderWidth * 2 - 4);

      // 4 Brass Corner Reinforcement Gussets in Frame
      const gusset = (x: number, y: number, ax: number, ay: number) => {
        ctx.fillStyle = '#B45309'; // Brass gold
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + ax, y);
        ctx.lineTo(x, y + ay);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FDE68A';
        ctx.lineWidth = 1;
        ctx.stroke();
      };
      gusset(0, 0, 24, 24);
      gusset(BOARD_SIZE, 0, -24, 24);
      gusset(0, BOARD_SIZE, 24, -24);
      gusset(BOARD_SIZE, BOARD_SIZE, -24, -24);

      // 2. Corner Pockets (Dark Net Hole with Brass Bezel Rim)
      POCKETS.forEach((p) => {
        // Brass metallic rim
        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS + 2, 0, Math.PI * 2);
        ctx.stroke();

        // Dark net void
        const netGrad = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, POCKET_RADIUS);
        netGrad.addColorStop(0, '#000000');
        netGrad.addColorStop(0.85, '#0C0A09');
        netGrad.addColorStop(1, '#1C1917');
        ctx.fillStyle = netGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Central Carrom Mandala (Official ICF Tournament Black & Red Markings)
      const cx = BOARD_SIZE / 2;
      const cy = BOARD_SIZE / 2;

      // Outer Black Circle (diameter ~76mm)
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 76, 0, Math.PI * 2);
      ctx.stroke();

      // Middle Red Ring
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.stroke();

      // Central Red Queen Spot
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      // Official Diagonal Foul Lines with Red Pocket Arrows
      POCKETS.forEach((p) => {
        // Diagonal black arrow shaft
        ctx.strokeStyle = '#18181B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + (p.x - cx) * 0.38, cy + (p.y - cy) * 0.38);
        ctx.lineTo(cx + (p.x - cx) * 0.74, cy + (p.y - cy) * 0.74);
        ctx.stroke();

        // Arrow circular tip in red
        const tipX = cx + (p.x - cx) * 0.74;
        const tipY = cy + (p.y - cy) * 0.74;
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Official Double Parallel Baselines with Terminal Red Circles
      const drawOfficialBaseline = (y: number, isPlayer: boolean) => {
        // Outer parallel line
        ctx.strokeStyle = isPlayer ? '#18181B' : 'rgba(24, 24, 27, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(MIN_STRIKER_X, y - 4);
        ctx.lineTo(MAX_STRIKER_X, y - 4);
        ctx.stroke();

        // Inner parallel line
        ctx.beginPath();
        ctx.moveTo(MIN_STRIKER_X, y + 4);
        ctx.lineTo(MAX_STRIKER_X, y + 4);
        ctx.stroke();

        // Terminal red base circles
        [MIN_STRIKER_X, MAX_STRIKER_X].forEach((bx) => {
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(bx, y, 10.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#18181B';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      };

      drawOfficialBaseline(80, false); // Opponent baseline
      drawOfficialBaseline(BASELINE_Y, true); // Player baseline

      // Smooth guide rail on baseline
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
      ctx.beginPath();
      ctx.moveTo(MIN_STRIKER_X, BASELINE_Y);
      ctx.lineTo(MAX_STRIKER_X, BASELINE_Y);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Physics Sub-stepping (Anti-Tunneling & Positional Overlap Separation)
      const SUB_STEPS = 5;
      const FRICTION = 0.992;
      const RESTITUTION = 0.88;
      const striker = strikerRef.current;
      const coins = coinsRef.current;

      for (let step = 0; step < SUB_STEPS; step++) {
        // --- A. Update Striker Movement ---
        if (!striker.isResting) {
          striker.x += striker.vx / SUB_STEPS;
          striker.y += striker.vy / SUB_STEPS;
          striker.vx *= Math.pow(FRICTION, 1 / SUB_STEPS);
          striker.vy *= Math.pow(FRICTION, 1 / SUB_STEPS);

          // Hardwood Cushion Wall Collision
          const minW = borderWidth + striker.radius;
          const maxW = BOARD_SIZE - borderWidth - striker.radius;
          if (striker.x < minW) { striker.x = minW; striker.vx *= -RESTITUTION; playSound('cushion'); }
          if (striker.x > maxW) { striker.x = maxW; striker.vx *= -RESTITUTION; playSound('cushion'); }
          if (striker.y < minW) { striker.y = minW; striker.vy *= -RESTITUTION; playSound('cushion'); }
          if (striker.y > maxW) { striker.y = maxW; striker.vy *= -RESTITUTION; playSound('cushion'); }

          // Striker Pocketing Check (FOUL)
          POCKETS.forEach((p) => {
            const dist = Math.hypot(striker.x - p.x, striker.y - p.y);
            if (dist < POCKET_RADIUS - 4) {
              striker.vx = 0;
              striker.vy = 0;
              striker.isResting = true;
              striker.x = strikerX;
              striker.y = BASELINE_Y;
              setIsStriking(false);
              setFoulCount((f) => f + 1);
              setScore((s) => Math.max(0, s - 5));
              playSound('foul');
              showNotification('FOUL! Striker pocketed (-5 pts penalty).', 'error');
            }
          });

          // Check if striker stopped
          if (Math.hypot(striker.vx, striker.vy) < 0.25) {
            striker.vx = 0;
            striker.vy = 0;
            striker.isResting = true;
            striker.x = strikerX;
            striker.y = BASELINE_Y;
            setIsStriking(false);
            setTurns((t) => t + 1);
          }
        }

        // --- B. Update Coins Movement & Pocketing ---
        coins.forEach((c) => {
          if (c.isPocketed) return;

          c.x += c.vx / SUB_STEPS;
          c.y += c.vy / SUB_STEPS;
          c.vx *= Math.pow(FRICTION, 1 / SUB_STEPS);
          c.vy *= Math.pow(FRICTION, 1 / SUB_STEPS);

          // Cushion bounce
          const minW = borderWidth + c.radius;
          const maxW = BOARD_SIZE - borderWidth - c.radius;
          if (c.x < minW) { c.x = minW; c.vx *= -RESTITUTION; playSound('cushion'); }
          if (c.x > maxW) { c.x = maxW; c.vx *= -RESTITUTION; playSound('cushion'); }
          if (c.y < minW) { c.y = minW; c.vy *= -RESTITUTION; playSound('cushion'); }
          if (c.y > maxW) { c.y = maxW; c.vy *= -RESTITUTION; playSound('cushion'); }

          if (Math.hypot(c.vx, c.vy) < 0.1) {
            c.vx = 0;
            c.vy = 0;
          }

          // Pocket Detection
          POCKETS.forEach((p) => {
            const dist = Math.hypot(c.x - p.x, c.y - p.y);
            if (dist < POCKET_RADIUS - 2) {
              c.isPocketed = true;
              c.vx = 0;
              c.vy = 0;
              playSound('pocket');
              setScore((s) => s + c.points);

              if (c.type === 'QUEEN') {
                setHasQueen(true);
                setQueenPendingCover(true);
                showNotification('QUEEN POCKETED! Sink a cover coin to lock +25 pts!', 'success');
              } else if (c.type === 'WHITE') {
                setPocketedWhite((w) => w + 1);
                if (queenPendingCover) {
                  setQueenCovered(true);
                  setQueenPendingCover(false);
                  showNotification('QUEEN COVERED! +25 bonus locked!', 'success');
                }
              } else {
                setPocketedBlack((b) => b + 1);
                if (queenPendingCover) {
                  setQueenCovered(true);
                  setQueenPendingCover(false);
                  showNotification('QUEEN COVERED! +25 bonus locked!', 'success');
                }
              }
            }
          });

          // --- C. Striker to Coin Collision (With Positional Overlap Separation) ---
          if (!striker.isResting) {
            const dx = c.x - striker.x;
            const dy = c.y - striker.y;
            const dist = Math.hypot(dx, dy);
            const minDist = striker.radius + c.radius;

            if (dist < minDist && dist > 0) {
              // Overlap separation
              const overlap = minDist - dist;
              const nx = dx / dist;
              const ny = dy / dist;
              c.x += nx * overlap * 0.7;
              c.y += ny * overlap * 0.7;
              striker.x -= nx * overlap * 0.3;
              striker.y -= ny * overlap * 0.3;

              // Elastic impulse
              const kx = striker.vx - c.vx;
              const ky = striker.vy - c.vy;
              const p = (2 * (nx * kx + ny * ky)) / (striker.mass + c.mass);

              striker.vx -= p * c.mass * nx * 0.95;
              striker.vy -= p * c.mass * ny * 0.95;
              c.vx += p * striker.mass * nx * 1.1;
              c.vy += p * striker.mass * ny * 1.1;

              playSound('clack');
            }
          }
        });

        // --- D. Coin to Coin Collision (Full Realistic Multi-body Pool Interaction) ---
        for (let i = 0; i < coins.length; i++) {
          const c1 = coins[i];
          if (c1.isPocketed) continue;

          for (let j = i + 1; j < coins.length; j++) {
            const c2 = coins[j];
            if (c2.isPocketed) continue;

            const dx = c2.x - c1.x;
            const dy = c2.y - c1.y;
            const dist = Math.hypot(dx, dy);
            const minDist = c1.radius + c2.radius;

            if (dist < minDist && dist > 0) {
              const overlap = minDist - dist;
              const nx = dx / dist;
              const ny = dy / dist;
              c1.x -= nx * (overlap * 0.5);
              c1.y -= ny * (overlap * 0.5);
              c2.x += nx * (overlap * 0.5);
              c2.y += ny * (overlap * 0.5);

              const kx = c1.vx - c2.vx;
              const ky = c1.vy - c2.vy;
              const p = (nx * kx + ny * ky) * 0.92;

              c1.vx -= p * nx;
              c1.vy -= p * ny;
              c2.vx += p * nx;
              c2.vy += p * ny;

              if (Math.hypot(c1.vx, c1.vy) > 0.8 || Math.hypot(c2.vx, c2.vy) > 0.8) {
                playSound('clack');
              }
            }
          }
        }
      }

      // 6. Draw Traditional Wooden Carrom Men (Authentic Concentric Wooden Carving)
      coins.forEach((c) => {
        if (c.isPocketed) return;

        ctx.save();
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);

        // 3D Wooden disc gradient
        const grad = ctx.createRadialGradient(c.x - 3, c.y - 3, 2, c.x, c.y, c.radius);
        grad.addColorStop(0, c.color);
        grad.addColorStop(0.7, c.color);
        grad.addColorStop(1, c.type === 'WHITE' ? '#DDD1B8' : '#0F0E0C');
        ctx.fillStyle = grad;
        ctx.fill();

        // Edge rim
        ctx.strokeStyle = c.borderColor;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Carved concentric circles (traditional carrom piece pattern)
        ctx.strokeStyle = c.innerRingColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
        ctx.stroke();

        // Queen Gold Star Inscription
        if (c.type === 'QUEEN') {
          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // 7. Draw Authentic Ivory / Marble Tournament Striker
      ctx.save();
      ctx.beginPath();
      ctx.arc(striker.x, striker.y, striker.radius, 0, Math.PI * 2);

      // Heavy Ivory White finish with concentric decorative rings
      const sGrad = ctx.createRadialGradient(striker.x - 6, striker.y - 6, 4, striker.x, striker.y, striker.radius);
      sGrad.addColorStop(0, '#FFFFFF');
      sGrad.addColorStop(0.4, '#FAF5E8');
      sGrad.addColorStop(0.85, '#E5D6B5');
      sGrad.addColorStop(1, '#BFA880');
      ctx.fillStyle = sGrad;
      ctx.fill();

      // Striker outer brass/gold edge
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Striker inner decorative rings (Red & Black tournament style)
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(striker.x, striker.y, 11, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(striker.x, striker.y, 5.5, 0, Math.PI * 2);
      ctx.stroke();

      // Center aim dot
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(striker.x, striker.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 8. Laser Aim Trajectory Guide & Power Gauge
      if (striker.isResting) {
        ctx.save();
        const laserDist = aimPower * 14;
        const targetX = striker.x + Math.cos(aimAngle) * laserDist;
        const targetY = striker.y + Math.sin(aimAngle) * laserDist;

        // Long laser dotted line
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(striker.x, striker.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ghost collision reticle at target point
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(targetX, targetY, striker.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(renderBoard);
    };

    animId = requestAnimationFrame(renderBoard);
    return () => cancelAnimationFrame(animId);
  }, [soundEnabled, strikerX, aimAngle, aimPower, playSound]);

  // Touch & Mouse Canvas Handlers for Smooth Sliding & Slingshot Aiming
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!strikerRef.current.isResting) return;
    const coords = getCanvasCoords(e);

    const distToStriker = Math.hypot(coords.x - strikerRef.current.x, coords.y - strikerRef.current.y);

    if (distToStriker < 35) {
      setIsSlingshotAiming(true);
    } else if (Math.abs(coords.y - BASELINE_Y) < 40) {
      setIsDraggingStriker(true);
      updateStrikerPosition(coords.x);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!strikerRef.current.isResting) return;
    const coords = getCanvasCoords(e);

    if (isDraggingStriker) {
      updateStrikerPosition(coords.x);
    } else if (isSlingshotAiming) {
      const dx = coords.x - strikerRef.current.x;
      const dy = coords.y - strikerRef.current.y;
      const pullDist = Math.hypot(dx, dy);

      if (pullDist > 10) {
        const angle = Math.atan2(-dy, -dx);
        setAimAngle(angle);

        const power = Math.min(26, Math.max(6, pullDist * 0.22));
        setAimPower(parseFloat(power.toFixed(1)));
      }
    }
  };

  const handlePointerUp = () => {
    if (isSlingshotAiming) {
      setIsSlingshotAiming(false);
      if (aimPower >= 7) {
        handleStrike();
      }
    }
    setIsDraggingStriker(false);
  };

  const handleStrike = () => {
    if (isStriking || !strikerRef.current.isResting) return;
    setIsStriking(true);
    strikerRef.current.isResting = false;
    strikerRef.current.vx = Math.cos(aimAngle) * aimPower;
    strikerRef.current.vy = Math.sin(aimAngle) * aimPower;
    playSound('clack');
  };

  const handleFinishMatch = async () => {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    try {
      const isVictory = score >= 35 || (hasQueen && queenCovered);
      const res = await api.submitCarromMatch(score, isVictory, activeBalanceType);
      setMatchSubmitted(true);
      await fetchBalances();
      if (isVictory) {
        confetti({ particleCount: 85, spread: 65, origin: { y: 0.65 } });
        showNotification(`Victory! Tournament match won and awarded ₹${res.payout}`, 'success');
      } else {
        showNotification(`Match concluded with score ${score}.`, 'info');
      }
    } catch (err: any) {
      showNotification(err.message || 'Submission failed', 'error');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 xs:px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto select-none bg-[#0c0906] min-h-[calc(100vh-5rem)] rounded-2xl sm:rounded-3xl border border-[#2a170e] pb-28 w-full max-w-full overflow-x-hidden">
      {/* Top Header & Match Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 xs:p-4 rounded-2xl bg-[#19110a] border border-[#3b2314]">
        <div className="flex items-center gap-2.5 xs:gap-3">
          <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-xl bg-[#2b180d] border border-amber-600/40 flex items-center justify-center text-amber-400 shadow-md shrink-0">
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm xs:text-base font-black text-amber-100 flex items-center gap-1.5 xs:gap-2">
              <span>English Birch Carrom</span>
              <span className="px-1.5 xs:px-2 py-0.5 rounded text-[9px] xs:text-[10px] font-mono bg-amber-600/20 text-amber-300 border border-amber-600/30">
                Turn #{turns}
              </span>
            </h1>
            <p className="text-[10px] xs:text-xs text-amber-200/60 line-clamp-1">
              Tournament ICF Standard • Natural Birch Plywood Surface
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 sm:gap-3 text-xs font-mono overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-xl bg-[#2b180d] border border-amber-900/50 shrink-0">
            <span className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full bg-[#FFFDF7] border border-[#D4B982] inline-block shadow-sm" />
            <span className="text-amber-100 font-bold text-[11px] xs:text-xs">{pocketedWhite} White (10p)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-xl bg-[#2b180d] border border-amber-900/50 shrink-0">
            <span className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full bg-[#1A1815] border border-[#524B43] inline-block shadow-sm" />
            <span className="text-amber-100 font-bold text-[11px] xs:text-xs">{pocketedBlack} Black (5p)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-xl bg-[#2b180d] border border-amber-900/50 shrink-0">
            <span className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full bg-[#DC2626] border border-amber-400 inline-block shadow-sm" />
            <span className={`text-[11px] xs:text-xs font-bold ${hasQueen ? 'text-amber-300' : 'text-amber-400/60'}`}>
              {hasQueen ? (queenCovered ? 'QUEEN COVERED!' : 'QUEEN (COVER REQ)') : 'QUEEN (25p)'}
            </span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 xs:p-2 rounded-xl bg-[#2b180d] border border-amber-900/50 text-amber-300 hover:text-white transition shrink-0"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
          </button>
        </div>
      </div>

      {/* Main Board Viewport and Tactical Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canvas Board (8 Cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-[#140d07] border-2 border-[#3b2314] p-3 sm:p-5 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={BOARD_SIZE}
            height={BOARD_SIZE}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className="rounded-2xl max-w-full aspect-square shadow-2xl cursor-crosshair touch-none border border-amber-950"
          />

          {/* Interactive Baseline Slider Track under canvas */}
          <div className="w-full max-w-[480px] mt-4 px-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-200/70">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <ChevronLeft className="w-3.5 h-3.5" /> Slide Striker
              </span>
              <span className="font-mono text-amber-300 font-bold">X: {strikerX}px</span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                Slide Striker <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateStrikerPosition(strikerX - 25)}
                disabled={isStriking}
                className="p-2 rounded-xl bg-[#2b180d] hover:bg-[#3d2314] text-amber-100 border border-amber-900/60 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <input
                type="range"
                min={MIN_STRIKER_X}
                max={MAX_STRIKER_X}
                value={strikerX}
                disabled={isStriking}
                onChange={(e) => updateStrikerPosition(Number(e.target.value))}
                className="flex-1 h-3 rounded-lg bg-[#2b180d] accent-amber-500 cursor-pointer"
              />

              <button
                type="button"
                onClick={() => updateStrikerPosition(strikerX + 25)}
                disabled={isStriking}
                className="p-2 rounded-xl bg-[#2b180d] hover:bg-[#3d2314] text-amber-100 border border-amber-900/60 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => updateStrikerPosition(270)}
                disabled={isStriking}
                className="px-3 py-2 rounded-xl bg-[#2b180d] hover:bg-[#3d2314] text-amber-300 border border-amber-900/60 text-xs font-bold font-mono"
              >
                Center
              </button>
            </div>
          </div>
        </div>

        {/* Tactical Controls & Score Deck (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#19110a] border border-[#3b2314] p-6 shadow-xl space-y-6">
          {/* Score Header */}
          <div className="p-4 rounded-2xl bg-[#2b180d] border border-amber-900/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-widest">Match Score</div>
              <div className="text-3xl font-black text-amber-100 font-mono">{score} PTS</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-amber-400/80">Fouls</div>
              <div className="text-lg font-bold text-red-500 font-mono">{foulCount}</div>
            </div>
          </div>

          {/* Aim Direction Fine-Tuning */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-amber-200/70 mb-1">
                <span>Aim Angle (Direction)</span>
                <span className="font-mono text-amber-300 font-bold">{Math.round((aimAngle * 180) / Math.PI)}°</span>
              </div>
              <input
                type="range"
                min={-Math.PI + 0.1}
                max={-0.1}
                step={0.02}
                value={aimAngle}
                disabled={isStriking}
                onChange={(e) => setAimAngle(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-amber-300/60 mt-1 font-mono">
                <span>◀ Left Corner</span>
                <span>Straight ▲</span>
                <span>Right Corner ▶</span>
              </div>
            </div>

            {/* Strike Power Force */}
            <div>
              <div className="flex items-center justify-between text-xs text-amber-200/70 mb-1">
                <span>Strike Power (Speed)</span>
                <span className="font-mono font-bold text-amber-300">{aimPower} px/f</span>
              </div>
              <input
                type="range"
                min={6}
                max={26}
                step={0.5}
                value={aimPower}
                disabled={isStriking}
                onChange={(e) => setAimPower(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="w-full h-2 rounded-full bg-[#120a05] overflow-hidden mt-1.5 flex">
                <div 
                  className={`h-full transition-all ${
                    aimPower < 13 ? 'bg-emerald-500' : aimPower < 20 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${((aimPower - 6) / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleStrike}
              disabled={isStriking}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Disc className={`w-4 h-4 ${isStriking ? 'animate-spin' : ''}`} />
              <span>{isStriking ? 'Striker in Motion...' : 'STRIKE NOW!'}</span>
            </button>

            <button
              onClick={handleFinishMatch}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Claim Match Victory (Pot ₹180)</span>
            </button>

            <button
              onClick={initBoard}
              className="w-full py-2.5 bg-[#2b180d] hover:bg-[#3d2314] text-amber-200 hover:text-white font-semibold text-xs rounded-xl border border-amber-900/60 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Re-rack Coins</span>
            </button>
          </div>

          {/* Traditional Carrom Rules */}
          <div className="p-3 bg-[#23140b] border border-amber-900/40 rounded-xl text-[11px] text-amber-200/70 space-y-1">
            <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tournament Rules:</span>
            </div>
            <p>• White Carrom Men: 10 Points</p>
            <p>• Black Carrom Men: 5 Points</p>
            <p>• Red Queen: 25 Points (Requires Cover on next shot)</p>
            <p>• Striker pocketed: Foul (-5 Points penalty)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
