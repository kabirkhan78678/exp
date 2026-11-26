import hmac
import hashlib
import secrets
import math
from decimal import Decimal

class ProvablyFairRNG:
    @staticmethod
    def generate_server_seed():
        return secrets.token_hex(32)

    @staticmethod
    def hash_seed(seed):
        return hashlib.sha256(seed.encode('utf-8')).hexdigest()

    @staticmethod
    def get_hmac_hex(server_seed, message):
        return hmac.new(
            server_seed.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    @classmethod
    def calculate_crash_multiplier(cls, server_seed, client_seed, nonce=1, house_edge=0.03):
        """
        Standard provably fair crash algorithm:
        Uses HMAC-SHA256, extracts first 52 bits.
        Returns a float >= 1.00.
        """
        message = f"{client_seed}:{nonce}"
        h_hex = cls.get_hmac_hex(server_seed, message)
        
        # 52 bits = 13 hex characters
        h_52 = int(h_hex[:13], 16)
        e = 2 ** 52

        # 3% house edge instant crash condition
        if h_52 % int(1.0 / house_edge) == 0:
            return 1.00

        multiplier = math.floor((100 * e - h_52) / (e - h_52)) / 100.0
        return max(1.00, round(multiplier, 2))

    @classmethod
    def deal_dragon_tiger(cls, server_seed, client_seed, nonce=1):
        """
        Deals one card to Dragon and one card to Tiger.
        Rank: 1 (Ace) to 13 (King).
        Suits: Spades, Hearts, Clubs, Diamonds.
        """
        suits = ['♠', '♥', '♣', '♦']
        message = f"dt:{client_seed}:{nonce}"
        h_hex = cls.get_hmac_hex(server_seed, message)
        
        val_dragon = (int(h_hex[0:4], 16) % 52)
        val_tiger = (int(h_hex[4:8], 16) % 52)
        if val_dragon == val_tiger:
            val_tiger = (val_tiger + 13) % 52

        dragon_rank = (val_dragon % 13) + 1
        dragon_suit = suits[val_dragon // 13]

        tiger_rank = (val_tiger % 13) + 1
        tiger_suit = suits[val_tiger // 13]

        if dragon_rank > tiger_rank:
            winner = 'DRAGON'
        elif tiger_rank > dragon_rank:
            winner = 'TIGER'
        else:
            winner = 'TIE'

        return {
            'dragon': {'rank': dragon_rank, 'suit': dragon_suit, 'val': val_dragon},
            'tiger': {'rank': tiger_rank, 'suit': tiger_suit, 'val': val_tiger},
            'winner': winner
        }

    @classmethod
    def evaluate_teen_patti_hand(cls, cards):
        """
        Evaluates a 3-card Teen Patti hand.
        cards format: [{'rank': 14, 'suit': '♠'}, ...] where rank 14 is Ace, 13 King, etc.
        Returns (hand_category_score, high_cards_tuple, hand_name).
        Categories:
        6: Trail (Three of a Kind)
        5: Pure Sequence (Straight Flush)
        4: Sequence (Straight)
        3: Color (Flush)
        2: Pair
        1: High Card
        """
        if len(cards) != 3:
            return (0, (), "Invalid Hand")

        ranks = sorted([c['rank'] for c in cards], reverse=True)
        suits = [c['suit'] for c in cards]
        is_flush = (len(set(suits)) == 1)

        # Check Trail (3 of a kind)
        if ranks[0] == ranks[1] == ranks[2]:
            return (6, (ranks[0],), f"Trail of {ranks[0]}")

        # Check Straight (Ace can be 14 or 1 in A-2-3)
        is_straight = False
        straight_ranks = ranks
        if ranks == [14, 3, 2]: # A-2-3 (highest straight in traditional Teen Patti)
            is_straight = True
            straight_ranks = [14, 3, 2]
        elif ranks[0] - ranks[1] == 1 and ranks[1] - ranks[2] == 1:
            is_straight = True

        # Pure Sequence vs Sequence
        if is_straight and is_flush:
            return (5, tuple(straight_ranks), "Pure Sequence")
        if is_straight:
            return (4, tuple(straight_ranks), "Sequence")
        if is_flush:
            return (3, tuple(ranks), "Color")

        # Check Pair
        if ranks[0] == ranks[1]:
            return (2, (ranks[0], ranks[2]), f"Pair of {ranks[0]}")
        elif ranks[1] == ranks[2]:
            return (2, (ranks[1], ranks[0]), f"Pair of {ranks[1]}")
        elif ranks[0] == ranks[2]:
            return (2, (ranks[0], ranks[1]), f"Pair of {ranks[0]}")

        # High Card
        return (1, tuple(ranks), f"High Card {ranks[0]}")

    @classmethod
    def generate_mines_board(cls, server_seed, client_seed, mines_count=3, nonce=1):
        """Deterministically places mines_count bombs onto a 25-tile 5x5 grid using HMAC-SHA256."""
        indices = list(range(25))
        for i in range(24, 0, -1):
            h = cls.get_hmac_hex(server_seed, f"mines:{client_seed}:{nonce}:{i}")
            j = int(h[:8], 16) % (i + 1)
            indices[i], indices[j] = indices[j], indices[i]
        return sorted(indices[:mines_count])

    @classmethod
    def roll_fair_dice(cls, server_seed, client_seed, nonce=1):
        """Rolls a cryptographically uniform number in [0.00, 99.99]."""
        h = cls.get_hmac_hex(server_seed, f"dice:{client_seed}:{nonce}")
        val = int(h[:8], 16) % 10000
        return round(val / 100.0, 2)

    @classmethod
    def draw_wingo_parity(cls, server_seed, client_seed, nonce=1):
        """Draws a deterministic Wingo digit 0-9 along with official Green/Red/Violet parity & Big/Small."""
        h = cls.get_hmac_hex(server_seed, f"wingo:{client_seed}:{nonce}")
        digit = int(h[:6], 16) % 10
        colors = []
        if digit in (1, 3, 7, 9):
            colors = ['GREEN']
        elif digit in (2, 4, 6, 8):
            colors = ['RED']
        elif digit == 5:
            colors = ['GREEN', 'VIOLET']
        else:  # 0
            colors = ['RED', 'VIOLET']
        size = 'BIG' if digit >= 5 else 'SMALL'
        return {'digit': digit, 'colors': colors, 'size': size}
