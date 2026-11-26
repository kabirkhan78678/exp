# VELTRIX ARENA — Known Limitations & Compliance Roadmap

## 1. Current Operational Status: Demo-Credit Mode

VELTRIX ARENA is configured in **Certified Demo-Credit Mode**:
- All newly registered player accounts receive 10,000 DEMO virtual credits immediately upon signup.
- Real-money payment gateway processing operates via an auditable Sandbox Payment Adapter with dynamic NPCI UPI QR generation and simulated 1-click gateway callbacks.
- Real payouts and live banking settlement remain gated behind statutory licensing, anti-money laundering (AML) certifications, and regional regulatory compliance approvals.

---

## 2. Pre-Requisites for Live Real-Money Activation

1. **Regulatory Licensing**: Valid gaming license from applicable jurisdiction authority (e.g. Curacao eGaming, Malta MGA, or designated state gaming commissions).
2. **Payment Gateway Merchant Onboarding**: Production API keys and production webhook secrets from an approved PSP (e.g., Razorpay, Cashfree, PayU, or authorized international merchant acquirer).
3. **Automated KYC / AML Pipeline**: Integration with an automated identity verification provider (e.g. HyperVerge, Sumsub, or Onfido) for government ID verification and sanctions screening.
4. **Responsible Gaming Limits**: Compulsory user-set daily/weekly deposit limits, reality checks, and national self-exclusion register synchronization.
5. **Hardware Security Module (HSM)**: Production deployment of HSM-backed key storage for provably fair seed generation and HMAC signing.

---

## 3. Feature Completion Checklist

- [x] Complete Next.js 14 App Router frontend with Midnight Aurora theme.
- [x] Dedicated mobile layout with fixed bottom navigation and touch-optimized viewports.
- [x] Double-entry accounting ledger with atomic debit/credit invariants and row locking.
- [x] Dynamic UPI QR payment flow with 15-minute expiration and idempotent settlement.
- [x] AeroCrash Aviator game with exponential canvas flight curve and provably fair seed reveal.
- [x] Dragon Tiger live card table with animated reveal and bead plate roadmap.
- [x] Teen Patti multiplayer rooms with Blind vs Seen toggles and showdown ranking.
- [x] Carrom 2D physics board with striker positioning, drag-to-aim power, and coin pocketing.
- [x] Super Admin Control Center with real-time financial KPIs, user directory, game risk controls, withdrawal approvals, and immutable audit logs.
- [x] Comprehensive automated test suite passing with 0 failures.
- [x] Production Docker Compose and Nginx reverse proxy configurations.
