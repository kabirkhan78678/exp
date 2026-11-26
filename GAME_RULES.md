# VELTRIX ARENA — Game Rules & Provable Fairness Specification

## 1. Ethical Gaming & Compliance Mandate

1. **Strictly Server-Authoritative**: Game outcomes are determined by verified cryptographic server routines. No client input can dictate wins, losses, or multipliers.
2. **No Secret Outcome Manipulation**: VELTRIX ARENA contains zero hidden win/loss toggles or player-specific manipulation features. Administrative controls are restricted to disclosed payout ratios, stake limits, and global house edge parameters.
3. **Commitment-and-Reveal Fairness**: For every round, a SHA-256 hash of the server seed is committed *before* betting opens. Upon round completion, the secret server seed is published in cleartext.

---

## 2. Game A — AeroCrash (Aviator Style)

### Mechanics
- Prior to takeoff, a 5-second countdown allows players to configure their stake and optional auto-cashout multiplier.
- The aircraft launches along an exponential trajectory:
  $$\text{Multiplier}(t) = 1.00 + 0.08 \times (2.2 \times t)^{1.85}$$
- Players can cash out manually at any instant during flight.
- If the multiplier reaches or exceeds the player's auto-cashout target, the bet is settled automatically.
- If the aircraft crashes before the player cashes out, the wager is lost.

### Mathematical Provable Fairness
- Server seed: $S_{server} \in \{0-9a-f\}^{64}$
- Seed Hash: $H = \text{SHA-256}(S_{server})$ published in advance.
- Client seed + Nonce: $M = S_{client} + ":" + Nonce$
- Compute $\text{HMAC} = \text{HMAC-SHA256}(S_{server}, M)$
- Extract the first 52 bits as integer $I$. If $I \pmod{100 / \text{HouseEdge}} == 0$, Crash Point = 1.00x.
- Otherwise:
  $$\text{Crash Point} = \max\left(1.00, \left\lfloor \frac{100 \times 2^{52}}{2^{52} - I} \right\rfloor \div 100\right)$$

---

## 3. Game B — Dragon Tiger Live

### Rules & Payouts
- Single card dealt to Dragon and single card dealt to Tiger from an 8-deck shoe.
- Ace is 1 (lowest), King is 13 (highest).
- **Dragon Bet**: Wins if Dragon card rank > Tiger card rank (Payout 1:1).
- **Tiger Bet**: Wins if Tiger card rank > Dragon card rank (Payout 1:1).
- **Tie Bet**: Wins if Dragon card rank == Tiger card rank (Payout 8:1).

---

## 4. Game C — Teen Patti Multiplayer

### Rules & Hand Rankings
Traditional 3-card Indian poker:
1. **Trail / Trio** (Three cards of same rank): AAA > KKK > ... > 222
2. **Pure Sequence** (Straight Flush): A-2-3 > A-K-Q > K-Q-J > ... > 4-3-2
3. **Sequence** (Straight): Run of 3 consecutive ranks of different suits.
4. **Color** (Flush): 3 cards of identical suit not in sequence.
5. **Pair**: Two cards of identical rank.
6. **High Card**: Highest card breaks ties.

Actions:
- **Blind**: Bet without seeing cards (1x stake).
- **Seen**: Card reveal toggle (2x stake).
- **Chaal**: Match current stake or raise.
- **Pack**: Fold hand and forfeit stake.
- **Showdown**: Compare hands when only 2 active players remain.

---

## 5. Game D — Carrom 2D Arena

### Rules
- 2D tabletop board with 4 corner pockets.
- White coins: 10 points each.
- Black coins: 5 points each.
- Red Queen: 25 points.
- **Queen Rule**: Sinking the Queen requires "covering" by sinking another coin on the subsequent shot.
- Striker sliding along baseline with angle & power vector control.
- Winner determined by point threshold (>= 35 points or Queen clearance).
