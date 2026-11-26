import { create } from 'zustand';
import { api } from '@/lib/api';

export type BalanceType = 'DEMO' | 'MAIN';

interface UserState {
  user: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  activeBalanceType: BalanceType;
  balances: {
    DEMO: string;
    MAIN: string;
    BONUS: string;
    ESCROW: string;
  };
  loyaltyPoints: string;
  vipTier: string;
  activeModal: 'login' | 'register' | 'deposit' | 'withdraw' | 'dailyReward' | null;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;

  // Actions
  setUser: (user: any | null) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  setActiveBalanceType: (type: BalanceType) => void;
  setBalances: (balances: any) => void;
  fetchBalances: () => Promise<void>;
  fetchUser: () => Promise<void>;
  openModal: (modal: 'login' | 'register' | 'deposit' | 'withdraw' | 'dailyReward') => void;
  closeModal: () => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

export const useStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  activeBalanceType: 'DEMO',
  balances: {
    DEMO: '10000.0000',
    MAIN: '0.0000',
    BONUS: '0.0000',
    ESCROW: '0.0000',
  },
  loyaltyPoints: '0.0000',
  vipTier: 'BRONZE',
  activeModal: null,
  notification: null,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.is_admin || user?.role === 'super_admin',
      vipTier: user?.profile?.vip_tier || 'BRONZE',
      loyaltyPoints: user?.profile?.loyalty_points || '0.0000',
    });
  },

  setTokens: (access, refresh) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('veltrix_access_token', access);
      localStorage.setItem('veltrix_refresh_token', refresh);
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('veltrix_access_token');
      localStorage.removeItem('veltrix_refresh_token');
    }
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      balances: { DEMO: '10000.0000', MAIN: '0.0000', BONUS: '0.0000', ESCROW: '0.0000' },
    });
  },

  setActiveBalanceType: (type) => set({ activeBalanceType: type }),

  setBalances: (balances) => set({ balances }),

  fetchBalances: async () => {
    try {
      if (!get().isAuthenticated) return;
      const res = await api.getBalances();
      set({
        balances: res.balances,
        loyaltyPoints: res.loyalty_points,
        vipTier: res.vip_tier,
      });
    } catch {
      // Ignore unauthenticated or network failures gracefully
    }
  },

  fetchUser: async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('veltrix_access_token') : null;
      if (!token) return;
      const res = await api.getProfile();
      get().setUser(res.user);
      await get().fetchBalances();
    } catch {
      get().logout();
    }
  },

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),

  showNotification: (message, type = 'info') => {
    set({ notification: { message, type } });
    setTimeout(() => {
      if (get().notification?.message === message) {
        set({ notification: null });
      }
    }, 4500);
  },

  clearNotification: () => set({ notification: null }),
}));
