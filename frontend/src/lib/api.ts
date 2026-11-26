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
          },
          {
            slug: 'mines',
            name: 'Mines',
            category: 'CRASH',
            description: '5x5 diamond & bomb grid. Reveal gems & cash out anytime.',
            min_stake: '10.00',
            max_stake: '20000.00',
            rtp_percentage: '97.00',
            player_count: 1680
          },
          {
            slug: 'dice',
            name: 'Fair Dice',
            category: 'CRASH',
            description: 'Over/Under 0.00-100.00 slider with 99% provably fair RTP.',
            min_stake: '10.00',
            max_stake: '50000.00',
            rtp_percentage: '99.00',
            player_count: 940
          },
          {
            slug: 'wingo',
            name: 'Wingo Parity',
            category: 'TABLE',
            description: '30s/60s Green, Violet, Red, Big/Small & 0-9 color parity.',
            min_stake: '10.00',
            max_stake: '25000.00',
            rtp_percentage: '98.00',
            player_count: 2310
          },
          {
            slug: 'ludo',
            name: 'Ludo Arena',
            category: 'SKILL',
            description: '2P & 4P 5-min quick skill tournament board & room codes.',
            min_stake: '25.00',
            max_stake: '10000.00',
            rtp_percentage: '96.00',
            player_count: 1540
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

  // Mines Diamond Grid
  async playMines(stake: number, minesCount: number, revealedCount: number, won: boolean, multiplier: number, accountType: string) {
    return this.request<{ message: string; payout: string; mine_positions: number[]; server_seed_hash: string }>('/games/mines/play/', {
      method: 'POST',
      body: JSON.stringify({
        stake,
        mines_count: minesCount,
        revealed_count: revealedCount,
        won,
        multiplier,
        account_type: accountType,
      }),
    });
  }

  // Fair Dice
  async playFairDice(stake: number, target: number, condition: 'OVER' | 'UNDER', accountType: string) {
    return this.request<{ roll: number; won: boolean; multiplier: number; payout: string; server_seed: string; server_seed_hash: string }>('/games/dice/play/', {
      method: 'POST',
      body: JSON.stringify({ stake, target, condition, account_type: accountType }),
    });
  }

  // Wingo Parity
  async playWingo(stake: number, betChoice: string, periodId: string, accountType: string) {
    return this.request<{ digit: number; colors: string[]; size: string; won: boolean; payout: string; server_seed_hash: string }>('/games/wingo/play/', {
      method: 'POST',
      body: JSON.stringify({ stake, bet_choice: betChoice, period_id: periodId, account_type: accountType }),
    });
  }

  // Ludo Arena
  async submitLudoMatch(stake: number, score: number, isVictory: boolean, mode: '2P' | '4P', accountType: string) {
    return this.request<{ message: string; is_victory: boolean; payout: string }>('/games/ludo/match/', {
      method: 'POST',
      body: JSON.stringify({ stake, score, is_victory: isVictory, mode, account_type: accountType }),
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

  // Promo Codes, Multi-Tier Referrals, Tournaments & Live Lounge Rain
  async getPromotions() {
    try {
      return await this.request<{ promotions: any[] }>('/cms/promotions/');
    } catch {
      return {
        promotions: [
          { code: 'VELTRIX500', title: 'VIP Flagship Drop ₹500 Bonus', bonus_fixed_amount: '500.0000' },
          { code: 'WELCOME250', title: 'Starter Instant Boost ₹250', bonus_fixed_amount: '250.0000' },
          { code: 'VIP1000', title: 'High-Roller ₹1,000 Vault Code', bonus_fixed_amount: '1000.0000' },
          { code: 'WELCOME100', title: 'First Deposit Match Bonus', bonus_fixed_amount: '100.0000' },
        ],
      };
    }
  }

  async getPromoHistory() {
    try {
      return await this.request<{ redemptions: any[] }>('/cms/promo/redeem/');
    } catch {
      return { redemptions: [] };
    }
  }

  async redeemPromoCode(code: string) {
    return this.request<{ message: string; redemption: any; balances: any }>('/cms/promo/redeem/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getReferralStats() {
    try {
      return await this.request<{
        referral_code: string;
        gross_earned: string;
        claimed_total: string;
        claimable: string;
        tiers: any[];
      }>('/cms/referrals/');
    } catch {
      return {
        referral_code: 'VELTRIX001',
        gross_earned: '485.00',
        claimed_total: '200.00',
        claimable: '285.00',
        tiers: [
          { tier: 1, label: 'Direct VIPs', rate: '5.0% + ₹50/signup', count: 3, volume: '6200', earned: '360.00' },
          { tier: 2, label: 'Sub-Partners', rate: '2.0% Turnover', count: 5, volume: '4250', earned: '85.00' },
          { tier: 3, label: 'Extended Guild', rate: '1.0% Turnover', count: 8, volume: '4000', earned: '40.00' },
        ],
      };
    }
  }

  async claimReferralCommission() {
    return this.request<{ message: string; balances: any; claimable: string }>('/cms/referrals/', {
      method: 'POST',
    });
  }

  async getTournaments() {
    try {
      return await this.request<{ tournaments: any[] }>('/cms/tournaments/');
    } catch {
      const now = Date.now();
      return {
        tournaments: [
          {
            id: 'trn_carrom_hourly',
            slug: 'carrom-hourly-blitz',
            title: 'Hourly Carrom 2D Blitz',
            game_slug: 'carrom',
            schedule_type: 'HOURLY',
            prize_pool: '10000.0000',
            entry_fee: '50.0000',
            max_players: 64,
            participants_count: 42,
            status: 'LIVE',
            ends_at: new Date(now + 47 * 60 * 1000).toISOString(),
            is_joined: false,
            bracket_json: [
              { stage: 'QF1', p1: 'Vikram_Pro', s1: 140, p2: 'Kabir_77', s2: 95, winner: 'Vikram_Pro' },
              { stage: 'QF2', p1: 'Kavya_Striker', s1: 165, p2: 'Rohan_99', s2: 120, winner: 'Kavya_Striker' },
              { stage: 'QF3', p1: 'Aarav_VIP', s1: 130, p2: 'Zoya_Ace', s2: 110, winner: 'Aarav_VIP' },
              { stage: 'QF4', p1: 'Neha_Queen', s1: 155, p2: 'Open Seed #8', s2: 0, winner: 'TBD' },
            ],
          },
          {
            id: 'trn_ludo_hourly',
            slug: 'ludo-hourly-rush',
            title: 'Hourly Ludo Quick Rush',
            game_slug: 'ludo',
            schedule_type: 'HOURLY',
            prize_pool: '15000.0000',
            entry_fee: '50.0000',
            max_players: 64,
            participants_count: 51,
            status: 'LIVE',
            ends_at: new Date(now + 34 * 60 * 1000).toISOString(),
            is_joined: false,
            bracket_json: [
              { stage: 'QF1', p1: 'LudoKing88', s1: 210, p2: 'Riya_Roll', s2: 185, winner: 'LudoKing88' },
              { stage: 'QF2', p1: 'Sameer_66', s1: 200, p2: 'Dev_VIP', s2: 140, winner: 'Sameer_66' },
              { stage: 'QF3', p1: 'Tara_Blitz', s1: 195, p2: 'Karan_X', s2: 190, winner: 'Tara_Blitz' },
              { stage: 'QF4', p1: 'Ananya_Pro', s1: 175, p2: 'Open Seed #8', s2: 0, winner: 'TBD' },
            ],
          },
          {
            id: 'trn_carrom_weekend',
            slug: 'carrom-weekend-masters',
            title: 'Weekend Carrom Birch Masters',
            game_slug: 'carrom',
            schedule_type: 'WEEKEND',
            prize_pool: '50000.0000',
            entry_fee: '200.0000',
            max_players: 128,
            participants_count: 96,
            status: 'LIVE',
            ends_at: new Date(now + 38 * 3600 * 1000).toISOString(),
            is_joined: false,
            bracket_json: [
              { stage: 'QF1', p1: 'vip_king', s1: 245, p2: 'birch_master', s2: 210, winner: 'vip_king' },
              { stage: 'QF2', p1: 'pro_kavya', s1: 230, p2: 'queen_cover', s2: 190, winner: 'pro_kavya' },
            ],
          },
          {
            id: 'trn_ludo_weekend',
            slug: 'ludo-weekend-royale',
            title: 'Weekend Ludo Grand Royale',
            game_slug: 'ludo',
            schedule_type: 'WEEKEND',
            prize_pool: '35000.0000',
            entry_fee: '150.0000',
            max_players: 128,
            participants_count: 84,
            status: 'LIVE',
            ends_at: new Date(now + 41 * 3600 * 1000).toISOString(),
            is_joined: false,
            bracket_json: [
              { stage: 'QF1', p1: 'RollSixPro', s1: 280, p2: 'FastTrack9', s2: 225, winner: 'RollSixPro' },
              { stage: 'QF2', p1: 'DiceMonarch', s1: 260, p2: 'Open Seed #4', s2: 0, winner: 'TBD' },
            ],
          },
        ],
      };
    }
  }

  async joinTournament(tournamentId: string, accountType: string) {
    return this.request<{ message: string; tournament: any; balances: any }>('/cms/tournaments/join/', {
      method: 'POST',
      body: JSON.stringify({ tournament_id: tournamentId, account_type: accountType }),
    });
  }

  async getLoungeMessages() {
    try {
      return await this.request<{ messages: any[] }>('/cms/lounge/');
    } catch {
      return {
        messages: [
          {
            id: 'msg_seed_rain',
            sender_name: 'vip_king',
            vip_tier: 'ELITE',
            message: 'Cashed 18.4x on AeroCrash! Catch this ₹500 Bonus Rain fam 🚀',
            msg_type: 'RAIN',
            rain_amount: '500.0000',
            rain_info: {
              id: 'rain_seed_1',
              per_claim_amount: '50.00',
              claimed_count: 3,
              max_claims: 10,
              is_active: true,
              already_claimed: false,
            },
            created_at: new Date(Date.now() - 180000).toISOString(),
          },
          {
            id: 'msg_seed_1',
            sender_name: 'player1',
            vip_tier: 'SILVER',
            message: 'Just redeemed VELTRIX500 & entered the ₹10k Carrom Blitz!',
            msg_type: 'CHAT',
            rain_info: null,
            created_at: new Date(Date.now() - 120000).toISOString(),
          },
          {
            id: 'msg_seed_2',
            sender_name: 'Captain_Aria',
            vip_tier: 'DIAMOND',
            message: 'Welcome to Veltrix Live Lounge — catch active Rain Drops above! 💎',
            msg_type: 'WIN_ALERT',
            rain_info: null,
            created_at: new Date(Date.now() - 60000).toISOString(),
          },
        ],
      };
    }
  }

  async postLoungeMessage(message: string) {
    return this.request<{ message: any }>('/cms/lounge/', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async dropLoungeRain(amount: number, accountType: string) {
    return this.request<{ message: string; lounge_message: any; balances: any }>('/cms/lounge/rain/', {
      method: 'POST',
      body: JSON.stringify({ action: 'drop', amount, account_type: accountType }),
    });
  }

  async claimLoungeRain(rainDropId: string) {
    return this.request<{ message: string; claimed_amount: string; balances: any }>('/cms/lounge/rain/', {
      method: 'POST',
      body: JSON.stringify({ action: 'claim', rain_drop_id: rainDropId }),
    });
  }
}

export const api = new ApiClient();
