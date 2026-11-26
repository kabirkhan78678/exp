# VELTRIX ARENA — Master Project Plan

## 1. Executive Summary & Product Vision

**VELTRIX ARENA** is an enterprise-grade, real-time multiplayer gaming ecosystem and fintech platform. Designed with an original **Midnight Aurora** dark-luxury aesthetic, VELTRIX ARENA delivers high-frequency, provably fair casino-style and skill-based games alongside a double-entry financial ledger, QR-code payment flow, and a Super Admin Control Center.

The platform is engineered with a strict **Demo-Credit First** policy: all live real-money deposits, withdrawals, and wagers operate strictly through certified sandbox and demo simulation mechanisms until statutory licensing, Anti-Money Laundering (AML) certifications, and regional regulatory compliance obligations are satisfied.

---

## 2. Platform Architecture Pillars

```
+-----------------------------------------------------------------------------------+
|                                  VELTRIX ARENA                                    |
|                             Next.js 14+ App Router                                |
|          (Midnight Aurora Theme, Tailwind CSS, Lucide, Framer Motion, Zustand)    |
|      +------------------------------+     +----------------------------------+    |
|      |    Player Experience Layer   |     |    Super Admin Control Center    |    |
|      |  - Game Lobby & 4 Engines    |     |  - Financial Analytics & KPIs    |    |
|      |  - Real-time Multi-game HUD  |     |  - Risk Management & Limits      |    |
|      |  - Double-Entry Wallet UI    |     |  - User Freeze & KYC Management  |    |
|      |  - QR Deposit & Payout Flow  |     |  - Game Rules & Engine Config    |    |
|      |  - VIP, Rewards, Referrals   |     |  - CMS & Promotions Engine       |    |
|      +--------------+---------------+     +----------------+-----------------+    |
+---------------------|--------------------------------------|----------------------+
                      | REST / JSON-RPC                      | WebSockets / WSS
                      v                                      v
+-----------------------------------------------------------------------------------+
|                          Django 5 + Django REST Framework                         |
|                             Django Channels & ASGI                                |
|  +------------------------+  +------------------------+  +---------------------+  |
|  |     Fintech Ledger     |  |  Provably Fair Engines |  |    Multiplayer Hub  |  |
|  |  - Double-Entry Engine |  |  - AeroCrash (Aviator) |  |  - Teen Patti Room  |  |
|  |  - Idempotent Webhooks |  |  - Dragon Tiger        |  |  - 2D Carrom Engine |  |
|  |  - QR Payment Gateway  |  |  - Cryptographic Seeds |  |  - Reconnect State  |  |
|  +------------------------+  +------------------------+  +---------------------+  |
+-----------------------------------------+-----------------------------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                        v                                   v
             +--------------------+              +--------------------+
             | PostgreSQL 16 DB   |              |  Redis 7 In-Memory |
             | - ACID Accounting  |              |  - Pub/Sub Channels|
             | - Immutable Ledger |              |  - Fast Room State |
             +--------------------+              +--------------------+
```

---

## 3. Technology Stack Breakdown

| Layer | Primary Technologies | Rationale |
| :--- | :--- | :--- |
| **Frontend Web & PWA** | Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Zustand, TanStack Query | Modern SSR/CSR hybrid, strict typing, responsive touch-first design, fluid state management. |
| **Game Canvases** | HTML5 Canvas / 2D Vector Physics Engine | High frame-rate 60 FPS rendering for AeroCrash curves and Carrom elastic collisions without bulky external runtime dependencies. |
| **Backend Core** | Python 3.12+ / 3.14, Django 5, Django REST Framework | Robust enterprise web framework, native ORM with strict constraint handling and migration engine. |
| **Real-time Networking** | Django Channels (ASGI), Daphne/Uvicorn, Redis Channel Layer | Server-authoritative state broadcast, high-concurrency pub/sub, sub-50ms latency. |
| **Database & Cache** | PostgreSQL 16 (production), SQLite (self-contained dev mode), Redis 7 | ACID transactions, `SELECT ... FOR UPDATE` row-locking, idempotency key enforcement. |
| **Asynchronous Worker**| Celery / Background Task Runner | Non-blocking settlement audits, transaction reconciliation, email notifications. |
| **Deployment & Ops** | Docker, Docker Compose, Nginx Reverse Proxy | Production containerization, reproducible builds across development and cloud environments. |

---

## 4. Phased Implementation Roadmap

### Phase 1: Planning, Schema & Core Foundation
- Establish `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, and `TASKS.md`.
- Set up Django backend project structure with dedicated modules (`accounts`, `wallet`, `games`, `admin_center`, `cms`).
- Set up Next.js frontend with Tailwind configuration containing the custom **Midnight Aurora** design tokens.

### Phase 2: Player Authentication, Profile & Double-Entry Ledger
- JWT Authentication (Access + Refresh tokens) with secure cookie / header handling.
- Double-entry ledger architecture (`LedgerEntry`, `WalletAccount`, `Transaction`).
- Demo credit automatic provisioning (e.g., 10,000 DEMO credits upon onboarding).
- Dynamic QR payment intent simulation with countdown, mock payment confirmation, and idempotent webhook crediting.

### Phase 3: Game Engines (Server-Authoritative & Provably Fair)
- **Game A: AeroCrash (Aviator style)**: Continuous flight curve, server-side trajectory calculation, provably fair seed commitment, multi-user simultaneous betting, auto and manual cash-out.
- **Game B: Dragon Tiger**: High-speed live card dealing, animated reveal, Dragon / Tiger / Tie bets with exact payout ratios (1:1, 1:1, 8:1).
- **Game C: Teen Patti**: Multiplayer room lobby, seat assignment, Blind vs Seen, Call/Chaal, Raise, Pack/Fold, Showdown ranking evaluation.
- **Game D: Carrom 2D Physics**: Board state, striker sliding/aiming, realistic 2D restitution and pocket detection, Queen & Cover validation.

### Phase 4: Super Admin Control Center (`/admin`)
- Distinct luxury operational interface with sticky topbar and collapsible navigation.
- Real-time financial KPI cards (GGR, NGR, Volume, Pending Withdrawals, Player Count).
- User Management: Profile drilldown, freeze/unfreeze, VIP level assignment, KYC notes.
- Game Risk & Exposure Control: Stake min/max, house edge configuration, maintenance mode toggles.
- Deposit & Withdrawal approval queue with two-step validation.
- CMS, Banners, Announcements, and Support Ticket processing.

### Phase 5: Player Engagement & Mobile Optimization
- VIP progression tiering (Bronze, Silver, Gold, Platinum, Diamond, Elite).
- Daily claimable reward streak.
- Referral link generation and commission tracking.
- Mobile bottom navigation bar, touch drawer sheets, and responsive game canvases.

### Phase 6: Verification, Testing & Deployment
- Comprehensive automated test suite: unit tests for ledger consistency, concurrency tests, provable fairness hashing, and game outcome settlements.
- Production Docker Compose configuration with Nginx reverse proxy.
- Documentation and deployment verification.

---

## 5. Security, Fairness & Regulatory Compliance Model

1. **Server-Authoritative Outcomes**: No client calculation or manipulation can dictate wins, losses, or multipliers.
2. **Provably Fair Hashing**: Crash points and card decks are generated using SHA-256 HMAC combinations of `server_seed`, `client_seed`, and `nonce`.
3. **Double-Entry Balance Integrity**: Every transaction consists of balanced debit and credit entries. Balances cannot become negative or be altered without an accompanying ledger line.
4. **Idempotency & Replay Protection**: All payment webhooks and settlement events require unique idempotency keys with uniqueness constraints.
5. **No Secret Admin Rigging**: Administration tools are strictly limited to configuring global game parameters, risk limits, and transparent house margins. No player-targeted outcome overrides exist.
