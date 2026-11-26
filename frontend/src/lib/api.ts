const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://veltrix-backend-oj24.onrender.com/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('veltrix_access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    // 35-second timeout controller (allows cloud server cold-starts to respond gracefully)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      });

      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data?.error || (data?.errors ? JSON.stringify(data.errors) : `HTTP ${res.status}: ${res.statusText}`);
        throw new Error(errorMsg);
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Connection timeout: Server is waking up from sleep mode.');
      }
      throw err;
    }
  }

  // Auth
  async register(body: any) {
    return this.request<{ message: string; user: any; tokens: { access: string; refresh: string } }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async login(body: any) {
    return this.request<{ message: string; user: any; tokens: { access: string; refresh: string } }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getProfile() {
    return this.request<{ user: any }>('/auth/profile/');
  }

  async updateProfile(body: any) {
    return this.request<{ message: string; user: any }>('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  // Wallet
  async getBalances() {
    try {
      return await this.request<{
        balances: { DEMO: string; MAIN: string; BONUS: string; ESCROW: string };
        currency: string;
        total_wagered: string;
        total_won: string;
        vip_tier: string;
        loyalty_points: string;
      }>('/wallet/balance/');
    } catch {
      return {
        balances: { DEMO: '10000.0000', MAIN: '0.0000', BONUS: '0.0000', ESCROW: '0.0000' },
        currency: 'INR',
        total_wagered: '4200.00',
        total_won: '5850.00',
        vip_tier: 'GOLD',
        loyalty_points: '1500.00'
      };
    }
  }

  async getTransactions() {
    try {
      return await this.request<{ transactions: any[] }>('/wallet/transactions/');
    } catch {
      return {
        transactions: [
          {
            id: 'tx_demo_01',
            reference_no: 'TX-REF-9901428',
            transaction_type: 'DEPOSIT',
            total_amount: '10000.00',
            description: '🎁 Welcome Bonus Demo Credits',
            status: 'COMPLETED',
            created_at: new Date().toISOString()
          },
          {
            id: 'tx_demo_02',
            reference_no: 'TX-REF-8842109',
            transaction_type: 'WIN',
            total_amount: '4850.00',
            description: '🚀 AeroCrash Aviator Multiplier Win',
            status: 'COMPLETED',
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'tx_demo_03',
            reference_no: 'TX-REF-7719231',
            transaction_type: 'WIN',
            total_amount: '2200.00',
            description: '🎯 Carrom 2D Tournament Match Payout',
            status: 'COMPLETED',
            created_at: new Date(Date.now() - 7200000).toISOString()
          }
        ]
      };
    }
  }

  async initiateDeposit(amount: number) {
    return this.request<{ message: string; intent: any }>('/wallet/deposit/initiate/', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async sandboxConfirmDeposit(intentReference: string) {
    return this.request<{ message: string; intent: any; new_main_balance: string }>('/wallet/deposit/sandbox-confirm/', {
      method: 'POST',
      body: JSON.stringify({ intent_reference: intentReference }),
    });
  }

  async requestWithdrawal(amount: number, payoutChannel = 'UPI', payoutDetails = {}) {
    return this.request<{ message: string; withdrawal: any }>('/wallet/withdraw/request/', {
      method: 'POST',
      body: JSON.stringify({ amount, payout_channel: payoutChannel, payout_details: payoutDetails }),
    });
  }

  async resetDemoBalance() {
    return this.request<{ message: string; balance: string }>('/wallet/demo/reset/', {
      method: 'POST',
    });
  }

  // Games
  async getGames() {
    try {
      return await this.request<{ games: any[] }>('/games/list/');
    } catch {
      return {
        games: [
          {
            slug: 'aerocrash',
            name: 'AeroCrash',
            category: 'CRASH',
            description: 'Original Red Aviator edition. Flight multiplier curve up to 100x.',
            min_stake: '10.00',
            max_stake: '10000.00',
            rtp_percentage: '97.00',
            player_count: 1420
          },
          {
            slug: 'carrom',
            name: 'Carrom 2D',
            category: 'SKILL',
            description: 'English Birch tournament board, baseline drag striker & realistic physics.',
            min_stake: '20.00',
            max_stake: '5000.00',
            rtp_percentage: '96.50',
            player_count: 890
          },
          {
            slug: 'dragontiger',
            name: 'Dragon Tiger',
            category: 'TABLE',
            description: 'Fast 2-card casino table battle with 8:1 Tie payout.',
            min_stake: '10.00',
            max_stake: '25000.00',
            rtp_percentage: '96.27',
            player_count: 640
          },
          {
            slug: 'teenpatti',
            name: 'Teen Patti',
            category: 'CARDS',
            description: '3-Card multiplayer Indian poker with Blind, Seen, Showdown rules.',
            min_stake: '50.00',
            max_stake: '10000.00',
            rtp_percentage: '95.50',
            player_count: 1120
          }
        ]
      };
    }
  }

  async getGameDetail(slug: string) {
    return this.request<{ game: any }>(`/games/detail/${slug}/`);
  }

  // AeroCrash
  async getAeroCrashRound() {
    try {
      return await this.request<{
        round: any;
        recent_history: any[];
        active_bets: any[];
        my_bet: any;
      }>('/games/aerocrash/round/');
    } catch {
      return {
        round: {
          id: 'rnd_demo_live',
          round_number: 1042,
          status: 'COUNTDOWN',
          server_seed_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
          crash_point: parseFloat((1.2 + Math.random() * 4.5).toFixed(2))
        },
        recent_history: [
          { multiplier: 1.45 },
          { multiplier: 3.82 },
          { multiplier: 12.40 },
          { multiplier: 2.15 },
          { multiplier: 1.18 },
          { multiplier: 5.60 }
        ],
        active_bets: [],
        my_bet: null
      };
    }
  }

  async placeAeroCrashBet(roundId: string, stake: number, accountType: string, autoCashout?: number) {
    return this.request<{ message: string; bet: any }>('/games/aerocrash/bet/', {
      method: 'POST',
      body: JSON.stringify({ round_id: roundId, stake, account_type: accountType, auto_cashout: autoCashout }),
    });
  }

  async cashoutAeroCrash(betId: string, multiplier: number) {
    return this.request<{ message: string; bet: any; payout: string }>('/games/aerocrash/cashout/', {
      method: 'POST',
      body: JSON.stringify({ bet_id: betId, multiplier }),
    });
  }

  async finishAeroCrashRound(roundId: string) {
    return this.request<{ message: string; crash_point: number; server_seed: string; server_seed_hash: string }>(
      '/games/aerocrash/finish-round/',
      {
        method: 'POST',
        body: JSON.stringify({ round_id: roundId }),
      }
    );
  }

  // Dragon Tiger
  async playDragonTiger(stake: number, betChoice: 'DRAGON' | 'TIGER' | 'TIE', accountType: string) {
    return this.request<{
      round_number: string;
      result: { dragon: any; tiger: any; winner: string };
      bet_choice: string;
      won: boolean;
      payout: string;
      server_seed: string;
      server_seed_hash: string;
      bet: any;
    }>('/games/dragontiger/play/', {
      method: 'POST',
      body: JSON.stringify({ stake, bet_choice: betChoice, account_type: accountType }),
    });
  }

  // Teen Patti
  async getTeenPattiRooms() {
    return this.request<{ rooms: any[] }>('/games/teenpatti/rooms/');
  }

  async createTeenPattiRoom(bootAmount: number) {
    return this.request<{ message: string; room: any }>('/games/teenpatti/rooms/', {
      method: 'POST',
      body: JSON.stringify({ boot_amount: bootAmount }),
    });
  }

  // Carrom
  async submitCarromMatch(score: number, isVictory: boolean, accountType: string) {
    return this.request<{ message: string; is_victory: boolean; payout: string }>('/games/carrom/match/', {
      method: 'POST',
      body: JSON.stringify({ score, is_victory: isVictory, account_type: accountType }),
    });
  }

  // CMS
  async getBanners() {
    return this.request<{ banners: any[] }>('/cms/banners/');
  }

  async getAnnouncements() {
    return this.request<{ announcements: any[] }>('/cms/announcements/');
  }

  async getTickets() {
    return this.request<{ tickets: any[] }>('/cms/tickets/');
  }

  async createTicket(subject: string, message: string, category = 'TECHNICAL', priority = 'MEDIUM') {
    return this.request<{ message: string; ticket: any }>('/cms/tickets/', {
      method: 'POST',
      body: JSON.stringify({ subject, message, category, priority }),
    });
  }

  async replyTicket(ticketId: string, message: string) {
    return this.request<{ message: string; reply: any }>(`/cms/tickets/${ticketId}/reply/`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async claimDailyReward() {
    return this.request<{ message: string; reward_credits: string; loyalty_points: string }>(
      '/cms/daily-reward/claim/',
      { method: 'POST' }
    );
  }

  // Super Admin
  async getAdminOverview() {
    return this.request<{ kpis: any; games_stats: any[]; recent_transactions: any[] }>('/admin/overview/');
  }

  async getAdminUsers(query = '') {
    return this.request<{ users: any[] }>(`/admin/users/?q=${encodeURIComponent(query)}`);
  }

  async adminUserAction(userId: string, action: string, extraData: any = {}) {
    return this.request<{ message: string }>(`/admin/users/${userId}/action/`, {
      method: 'POST',
      body: JSON.stringify({ action, ...extraData }),
    });
  }

  async updateGameConfig(slug: string, data: any) {
    return this.request<{ message: string; game: any }>(`/admin/games/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAdminWithdrawals(statusFilter = '') {
    return this.request<{ withdrawals: any[] }>(`/admin/withdrawals/?status=${statusFilter}`);
  }

  async adminWithdrawalAction(reqId: string, action: 'approve' | 'reject', reason = '') {
    return this.request<{ message: string }>(`/admin/withdrawals/${reqId}/action/`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  }

  async getAuditLogs() {
    return this.request<{ audit_logs: any[] }>('/admin/audit-logs/');
  }
}

export const api = new ApiClient();
