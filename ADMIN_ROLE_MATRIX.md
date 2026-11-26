# VELTRIX ARENA — Admin Role & Permission Matrix

VELTRIX ARENA implements strict Role-Based Access Control (RBAC). All privileged endpoints enforce backend authorization checks and generate immutable audit logs.

| Role | Role Code | Scope of Access | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `super_admin` | Global / System-Wide | Complete platform control: user freezes, financial approvals, game stake limits, CMS, audit logs, system risk settings. |
| **Operations Admin** | `operations_admin` | Platform Operations | Game enable/disable, maintenance modes, CMS banners, announcements, user monitoring. |
| **Finance Manager** | `finance_manager` | Treasury & Ledger | Review and approve/reject withdrawal requests, monitor GGR/NGR, balance reconciliation, payment gateway audits. |
| **Game Manager** | `game_manager` | Game Risk & Margins | Adjust published house margins, min/max permitted stakes, inspect round outcome commitments and seed generation. |
| **Compliance Officer** | `compliance` | Identity & KYC | Review player KYC documentation, verify identity status, apply administrative compliance notes. |
| **Support Agent** | `support` | Customer Service | Read and reply to player support tickets, inspect transaction reference status, unfreeze non-financial locks. |
| **Player** | `player` | Player-Facing Portal | Play games, deposit via QR, request withdrawals, claim VIP perks, share referral links. Zero access to `/admin`. |

---

## Audit Trail Invariant
Every administrative action (e.g. freezing an account, modifying game stake limits, approving/rejecting payouts) automatically creates an immutable record in `AuditLog` containing:
- `actor`: UUID of the performing admin
- `action`: Specific action code (e.g., `WITHDRAWAL_APPROVED`, `USER_FROZEN`)
- `resource_type`: Target entity (`USER`, `GAME`, `WITHDRAWAL`)
- `payload`: Exact diff or reason parameters
- `timestamp`: UTC ISO-8601 timestamp
