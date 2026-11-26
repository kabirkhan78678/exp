# VELTRIX ARENA — Full-Stack Gaming Platform & Fintech Ledger

[![Architecture: Django + Next.js](https://img.shields.io/badge/Architecture-Django%20%2B%20Next.js-cyan.svg)](ARCHITECTURE.md)
[![Design: Midnight Aurora](https://img.shields.io/badge/Theme-Midnight%20Aurora-gold.svg)](PROJECT_PLAN.md)
[![Fairness: SHA--256 Provable](https://img.shields.io/badge/Fairness-SHA--256%20HMAC-purple.svg)](GAME_RULES.md)

**VELTRIX ARENA** is an enterprise-grade, responsive multiplayer gaming ecosystem and fintech platform. Engineered with a custom **Midnight Aurora** dark-luxury design system, VELTRIX ARENA combines server-authoritative provably fair game engines with an ACID double-entry accounting ledger, dynamic QR payments, and a dedicated Super Admin Control Center.

---

## 1. Key Features

- **Midnight Aurora Aesthetic**: Luxury dark theme (#080C18 background, #D9B76E gold accents, #35D6C5 cyan interactive highlights, #8C73FF purple headers).
- **Dual Form Factor**:
  - Desktop: Collapsible sidebar navigation, live wallet tickers, analytics topbars.
  - Mobile: Dedicated bottom navigation bar (`Home`, `Games`, `Wallet`, `Rewards`, `Account`), touch-friendly viewports, responsive safe-area sheets.
- **Double-Entry Financial Ledger**:
  - Strict balance invariants ($\sum \text{Debit} - \sum \text{Credit} = 0$).
  - Four distinct balances: `DEMO` (free play), `MAIN` (withdrawable cash), `BONUS` (rollover credits), and `ESCROW` (in-play locks).
  - Row-level locking (`select_for_update`) and idempotency key enforcement.
- **Dynamic QR Code Payment Flow**:
  - NPCI-compliant dynamic UPI QR generation with 15-minute countdown.
  - Sandbox payment adapter for instant settlement simulation.
  - Idempotent webhook callbacks preventing double-crediting.
- **Certified Provably Fair Games**:
  - **Game A: AeroCrash**: Continuous exponential flight curve, live multiplier updates, auto & manual cash-out, SHA-256 server seed commitment and cleartext reveal.
  - **Game B: Dragon Tiger**: Speed casino table, animated card reveals, Dragon, Tiger, and 8:1 Tie bets, historical bead plate roadmap.
  - **Game C: Teen Patti**: 3-card poker room multiplayer, Blind vs Seen toggles, Chaal/Call, Pack/Fold, and showdown ranking evaluator.
  - **Game D: Carrom 2D Arena**: Interactive 2D vector physics canvas, striker positioning slider, aim & power control, white/black coins, Queen & cover detection.
- **Super Admin Control Center (`/admin`)**:
  - Operational KPIs: Gross Gaming Revenue (GGR), Net Gaming Revenue (NGR), total volume, active players.
  - User Directory: Search, freeze/unfreeze accounts, edit VIP ranks, KYC verification.
  - Game Risk & Exposure: Stake caps, house margins, maintenance toggles.
  - Withdrawal Queue: Dual approval workflow with automatic ledger refunds on rejection.
  - Immutable Audit Trails: Detailed chronological logs of all administrative actions.

---

## 2. Quick Start & Local Development

### Prerequisites
- Python 3.12+ (or 3.14)
- Node.js 18+ or 20+
- npm 9+

### Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed data
python manage.py migrate
python manage.py seed_platform

# Start development server
python manage.py runserver 0.0.0.0:8000
```

### Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Pre-configured Credentials

| Role | Username / Email | Password | Initial Balances |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` / `admin@veltrix.arena` | `Admin@123456` | 10,000 DEMO, 0 MAIN (Full Admin Privileges) |
| **Player 1** | `player1` / `player1@veltrix.arena` | `Player@123456` | 10,000 DEMO, 2,500 MAIN (Silver Tier) |
| **VIP Player** | `vip_king` / `vip_player@veltrix.arena` | `Player@123456` | 25,000 DEMO, 15,000 MAIN (Gold Tier) |

---

## 4. Running Backend Tests

```bash
cd backend
.\venv\Scripts\python manage.py test tests
```
The test suite validates:
- Wallet account auto-provisioning
- Double-entry ledger debit/credit balance invariants and idempotency
- Provably fair SHA-256 HMAC computation and Teen Patti hand ranking
- Dynamic QR payment intent creation and idempotent webhook settlement

---

## 5. Docker Deployment

```bash
docker-compose up --build
```
This launches:
- `db`: PostgreSQL 16 on port 5432
- `redis`: Redis 7 on port 6379
- `backend`: Daphne ASGI Django server on port 8000
- `frontend`: Next.js 14 production standalone on port 3000
- `nginx`: Reverse proxy on port 80 routing `/api/` and `/*`

---

## 6. Architecture Documentation
- [PROJECT_PLAN.md](file:///c:/Users/kabee/OneDrive/Desktop/expermtnal/PROJECT_PLAN.md)
- [ARCHITECTURE.md](file:///c:/Users/kabee/OneDrive/Desktop/expermtnal/ARCHITECTURE.md)
- [DATABASE_SCHEMA.md](file:///c:/Users/kabee/OneDrive/Desktop/expermtnal/DATABASE_SCHEMA.md)
- [TASKS.md](file:///c:/Users/kabee/OneDrive/Desktop/expermtnal/TASKS.md)
- [API_DOCUMENTATION.md](file:///c:/Users/kabee/OneDrive/Desktop/expermtnal/API_DOCUMENTATION.md)
- [GAME_RULES.md](file:///c:/Users/kabee/OneDrive/Desktop/expermtnal/GAME_RULES.md)
- [ADMIN_ROLE_MATRIX.md](file:///c:/Users/kabee/OneDrive/Desktop/expermtnal/ADMIN_ROLE_MATRIX.md)
- [PAYMENT_INTEGRATION.md](file:///c:/Users/kabee/OneDrive/Desktop/expermtnal/PAYMENT_INTEGRATION.md)
- [KNOWN_LIMITATIONS.md](file:///c:/Users/kabee/OneDrive/Desktop/expermtnal/KNOWN_LIMITATIONS.md)
