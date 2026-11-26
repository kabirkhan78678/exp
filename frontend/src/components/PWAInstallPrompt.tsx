"use client";

import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Sparkles } from 'lucide-react';
import { VeltrixLogoMark } from '@/components/GameArtwork';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    const ua = window.navigator.userAgent;
    const iosDetected = /iPhone|iPad|iPod/i.test(ua) && !(window as any).MSStream;
    setIsIos(iosDetected);

    const dismissedAt = localStorage.getItem('veltrix_pwa_dismissed_at');
    const recentlyDismissed = dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000;

    if (iosDetected && !recentlyDismissed) {
      const t = setTimeout(() => setShowBanner(true), 2200);
      return () => clearTimeout(t);
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!recentlyDismissed) setShowBanner(true);
    };

    const onOpenManual = () => {
      setShowIosGuide(true);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('veltrix:open-pwa-install', onOpenManual);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('veltrix:open-pwa-install', onOpenManual);
    };
  }, []);

  if (isStandalone) return null;

  const dismiss = () => {
    setShowBanner(false);
    setShowIosGuide(false);
    try {
      localStorage.setItem('veltrix_pwa_dismissed_at', String(Date.now()));
    } catch {}
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const res = await deferredPrompt.userChoice;
      if (res?.outcome === 'accepted') {
        dismiss();
      }
      setDeferredPrompt(null);
      return;
    }
    setShowIosGuide(true);
  };

  return (
    <>
      {/* Sleek Top-Floating Install Strip below Navbar (never overlaps bottom dock) */}
      {showBanner && !showIosGuide && (
        <div className="fixed top-[calc(3.85rem+env(safe-area-inset-top,0px))] left-3 right-3 sm:left-auto sm:right-5 sm:w-[340px] z-30 animate-scale-up">
          <div className="lux-card rounded-2xl p-2.5 px-3 border-[#47EC84]/40 shadow-[0_14px_40px_rgba(0,0,0,0.85)] flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#0B0E10] border border-[#47EC84]/40 flex items-center justify-center shrink-0">
                <VeltrixLogoMark className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-black text-xs text-white truncate flex items-center gap-1">
                  <span>Install VELTRIX App</span>
                  <Sparkles className="w-3 h-3 text-[#F5B041] shrink-0" />
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {isIos ? 'Fullscreen iPhone Home Screen App' : 'Native 60fps Fullscreen Mode'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl btn-emerald-3d text-[10px] font-black uppercase tracking-wide flex items-center gap-1 active:scale-95 transition"
              >
                <Download className="w-3 h-3" />
                <span>Install</span>
              </button>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss install banner"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed iPhone Safari "Add to Home Screen" Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md lux-card border-[#47EC84]/35 rounded-3xl p-5 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#47EC84]/15 border border-[#47EC84]/35 flex items-center justify-center text-[#47EC84]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-white">Install VELTRIX on iPhone</h3>
                  <p className="text-[10px] text-slate-400">Run fullscreen without Safari address bar</p>
                </div>
              </div>
              <button onClick={dismiss} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.08] flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#47EC84]/20 text-[#47EC84] font-mono font-black flex items-center justify-center shrink-0">1</span>
                <div className="text-slate-200 flex-1">
                  Tap the <strong className="text-white inline-flex items-center gap-1 mx-0.5"><Share className="w-3.5 h-3.5 text-sky-400 inline" /> Share</strong> button in Safari&apos;s bottom toolbar.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.08] flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#F5B041]/20 text-[#F5B041] font-mono font-black flex items-center justify-center shrink-0">2</span>
                <div className="text-slate-200 flex-1">
                  Scroll down &amp; tap <strong className="text-white inline-flex items-center gap-1 mx-0.5"><PlusSquare className="w-3.5 h-3.5 text-[#47EC84] inline" /> Add to Home Screen</strong>.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.08] flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-300 font-mono font-black flex items-center justify-center shrink-0">3</span>
                <div className="text-slate-200 flex-1">
                  Tap <strong className="text-[#47EC84]">Add</strong> — VELTRIX launches as a crisp standalone iOS app!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="w-full py-3 btn-emerald-3d font-display font-black text-xs rounded-2xl active:scale-95 transition"
            >
              Got It — Ready to Play
            </button>
          </div>
        </div>
      )}
    </>
  );
};
