const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

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
    
    // 8-second timeout controller so requests never hang infinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

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
    return this.request<{
      balances: { DEMO: string; MAIN: string; BONUS: string; ESCROW: string };
      currency: string;
      total_wagered: string;
      total_won: string;
      vip_tier: string;
      loyalty_points: string;
    }>('/wallet/balance/');
  }

  async getTransactions() {
    return this.request<{ transactions: any[] }>('/wallet/transactions/');
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
    return this.request<{ games: any[] }>('/games/list/');
  }

  async getGameDetail(slug: string) {
    return this.request<{ game: any }>(`/games/detail/${slug}/`);
  }

  // AeroCrash
  async getAeroCrashRound() {
    return this.request<{
      round: any;
      recent_history: any[];
      active_bets: any[];
      my_bet: any;
    }>('/games/aerocrash/round/');
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
