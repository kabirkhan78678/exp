"use client";

import React, { useState, useEffect } from 'react';
import { Gamepad2, ShieldAlert, Save, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function AdminGamesPage() {
  const { showNotification } = useStore();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);

  const loadGames = async () => {
    try {
      const res = await api.getGames();
      setGames(res.games);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleUpdate = async (game: any) => {
    setSavingSlug(game.slug);
    try {
      const res = await api.updateGameConfig(game.slug, {
        min_stake: game.min_stake,
        max_stake: game.max_stake,
        house_edge: game.house_edge,
        is_active: game.is_active,
        is_maintenance: game.is_maintenance,
      });
      showNotification(res.message, 'success');
      await loadGames();
    } catch (err: any) {
      showNotification(err.message || 'Update failed', 'error');
    } finally {
      setSavingSlug(null);
    }
  };

  const handleChange = (slug: string, field: string, value: any) => {
    setGames((prev) =>
      prev.map((g) => (g.slug === slug ? { ...g, [field]: value } : g))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-aurora-text">Game Risk & Exposure Controls</h1>
        <p className="text-xs text-aurora-muted">
          Configure permitted stake limits, published house edges, and maintenance toggles. Note: Outcomes remain strictly dictated by documented game rules and provably fair seeds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((g) => (
          <div key={g.slug} className="p-6 rounded-3xl bg-aurora-surface border border-aurora-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-aurora-border">
              <div>
                <h3 className="font-bold text-sm text-aurora-text">{g.name}</h3>
                <span className="text-[10px] text-aurora-muted font-mono">{g.slug} • {g.category}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                g.is_active ? 'bg-aurora-success/15 text-aurora-success border border-aurora-success/30' : 'bg-aurora-danger/15 text-aurora-danger border border-aurora-danger/30'
              }`}>
                {g.is_active ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-aurora-muted mb-1">Min Stake (₹)</label>
                <input
                  type="number"
                  value={g.min_stake}
                  onChange={(e) => handleChange(g.slug, 'min_stake', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-aurora-elevated border border-aurora-border text-aurora-text font-mono focus:outline-none focus:border-aurora-purple"
                />
              </div>

              <div>
                <label className="block text-aurora-muted mb-1">Max Stake (₹)</label>
                <input
                  type="number"
                  value={g.max_stake}
                  onChange={(e) => handleChange(g.slug, 'max_stake', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-aurora-elevated border border-aurora-border text-aurora-text font-mono focus:outline-none focus:border-aurora-purple"
                />
              </div>

              <div>
                <label className="block text-aurora-muted mb-1">House Edge Ratio (e.g. 0.03 = 3%)</label>
                <input
                  type="number"
                  step="0.005"
                  value={g.house_edge}
                  onChange={(e) => handleChange(g.slug, 'house_edge', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-aurora-elevated border border-aurora-border text-aurora-text font-mono focus:outline-none focus:border-aurora-purple"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={g.is_maintenance}
                    onChange={(e) => handleChange(g.slug, 'is_maintenance', e.target.checked)}
                    className="accent-aurora-danger"
                  />
                  <span className="text-xs text-aurora-text">Maintenance Mode</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => handleUpdate(g)}
              disabled={savingSlug === g.slug}
              className="w-full py-2.5 bg-aurora-elevated hover:bg-aurora-surface text-aurora-purple border border-aurora-purple/40 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSlug === g.slug ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
