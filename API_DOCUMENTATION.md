# VELTRIX ARENA — API Specification

All protected endpoints require an `Authorization: Bearer <token>` header. Responses are JSON.

## 1. Authentication (`/api/auth/`)

### `POST /api/auth/register/`
Registers a new player account and automatically provisions 10,000 DEMO credits.
- **Request Body**:
  ```json
  {
    "email": "user@domain.com",
    "username": "gamer123",
    "password": "SecurePassword123!",
    "phone": "+919876543210",
    "referral_code": "OPTIONAL_CODE"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Registration successful. Welcome to Veltrix Arena!",
    "user": { "id": "...", "username": "gamer123", "role": "player", ... },
    "tokens": { "access": "...", "refresh": "..." }
  }
  ```

### `POST /api/auth/login/`
Authenticates with email or username and password.
- **Request Body**:
  ```json
  {
    "login": "gamer123",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Login successful.",
    "user": { ... },
    "tokens": { "access": "...", "refresh": "..." }
  }
  ```

### `GET /api/auth/profile/`
Returns authenticated user profile, VIP tier, loyalty points, and KYC status.

---

## 2. Wallet & Double-Entry Ledger (`/api/wallet/`)

### `GET /api/wallet/balance/`
Returns current balances across all 4 ledger account types.
- **Response (200 OK)**:
  ```json
  {
    "balances": {
      "DEMO": "10000.0000",
      "MAIN": "2500.0000",
      "BONUS": "0.0000",
      "ESCROW": "0.0000"
    },
    "currency": "INR",
    "total_wagered": "12500.0000",
    "total_won": "14200.0000",
    "vip_tier": "SILVER",
    "loyalty_points": "625.0000"
  }
  ```

### `POST /api/wallet/deposit/initiate/`
Generates a dynamic NPCI UPI payment QR code intent.
- **Request Body**:
  ```json
  { "amount": 500 }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "QR code generated successfully.",
    "intent": {
      "intent_reference": "VLTX-QR-A1B2C3D4E5",
      "amount": "500.0000",
      "currency": "INR",
      "qr_payload": "upi://pay?pa=veltrixarena@sandbox&pn=VeltrixArena&am=500.00&tr=VLTX-QR-A1B2C3D4E5&cu=INR",
      "expires_at": "2026-11-23T19:30:00Z",
      "status": "PENDING"
    }
  }
  ```

### `POST /api/wallet/deposit/sandbox-confirm/`
Simulates instant payment verification and executes atomic double-entry credit.
- **Request Body**:
  ```json
  { "intent_reference": "VLTX-QR-A1B2C3D4E5" }
  ```

### `POST /api/wallet/withdraw/request/`
Reserves funds from `MAIN` account and logs withdrawal request for admin review.
- **Request Body**:
  ```json
  {
    "amount": 500,
    "payout_channel": "UPI",
    "payout_details": { "upi_id": "player@bank" }
  }
  ```

---

## 3. Game Engines (`/api/games/`)

### `GET /api/games/aerocrash/round/`
Returns current active AeroCrash round, committed server seed hash, and past multipliers.

### `POST /api/games/aerocrash/bet/`
Places a bet on the upcoming round. Stake is atomically debited from wallet.
- **Request Body**:
  ```json
  {
    "round_id": "uuid-here",
    "stake": 50,
    "account_type": "DEMO",
    "auto_cashout": 2.00
  }
  ```

### `POST /api/games/aerocrash/cashout/`
Cashes out during flight before crash. Payout is atomically credited to wallet.
- **Request Body**:
  ```json
  {
    "bet_id": "uuid-here",
    "multiplier": 2.45
  }
  ```

### `POST /api/games/dragontiger/play/`
Deals Dragon Tiger round with provably fair server seed and settles win/loss.
- **Request Body**:
  ```json
  {
    "stake": 100,
    "bet_choice": "DRAGON",
    "account_type": "DEMO"
  }
  ```

### `POST /api/games/carrom/match/`
Submits score and awards match pot based on pocketed coins and victory condition.

---

## 4. Super Admin Control Center (`/api/admin/`)

- `GET /api/admin/overview/`: Financial KPIs (GGR, NGR, stakes, player counts).
- `GET /api/admin/users/`: Search and drill into all users.
- `POST /api/admin/users/{id}/action/`: Execute `freeze`, `unfreeze`, `update_vip`, or `update_kyc`.
- `PATCH /api/admin/games/{slug}/`: Modify min/max stakes, house edges, and maintenance toggles.
- `GET /api/admin/withdrawals/`: Queue of pending payouts.
- `POST /api/admin/withdrawals/{id}/action/`: Approve payout or reject with reason (triggers automatic refund).
- `GET /api/admin/audit-logs/`: Chronological audit log of all administrative actions.
