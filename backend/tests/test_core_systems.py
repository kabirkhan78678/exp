from decimal import Decimal
from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.accounts.models import User, UserProfile, UserRole
from apps.wallet.models import WalletAccount, AccountType, TransactionType, PaymentIntentStatus
from apps.wallet.services import LedgerService
from apps.wallet.gateways import QRPaymentGateway
from apps.games.fairness import ProvablyFairRNG
from apps.games.models import Game, GameRound, Bet, BetStatus

class CoreSystemsTestCase(TestCase):
    def setUp(self):
        # Setup test user
        self.user = User.objects.create_user(
            email='testplayer@veltrix.arena',
            username='testplayer',
            password='TestPassword123!'
        )
        UserProfile.objects.create(
            user=self.user,
            referral_code='TEST01'
        )
        self.admin = User.objects.create_superuser(
            email='testadmin@veltrix.arena',
            username='testadmin',
            password='AdminPassword123!'
        )
        LedgerService.ensure_wallet_accounts(self.user)
        LedgerService.ensure_wallet_accounts(self.admin)

    def test_wallet_initialization_demo_balance(self):
        """Verify that newly registered user gets 10,000 DEMO credits."""
        demo_acc = WalletAccount.objects.get(user=self.user, account_type=AccountType.DEMO)
        self.assertEqual(demo_acc.balance, Decimal('10000.0000'))
        
        main_acc = WalletAccount.objects.get(user=self.user, account_type=AccountType.MAIN)
        self.assertEqual(main_acc.balance, Decimal('0.0000'))

    def test_double_entry_debit_credit_invariants(self):
        """Test debit and credit balance consistency and ledger entries."""
        # Credit 500 to MAIN
        tx1 = LedgerService.process_credit(
            user=self.user,
            account_type=AccountType.MAIN,
            amount=Decimal('500.0000'),
            tx_type=TransactionType.DEPOSIT,
            idempotency_key='IDEMP-TEST-001'
        )
        self.assertIsNotNone(tx1)
        main_acc = WalletAccount.objects.get(user=self.user, account_type=AccountType.MAIN)
        self.assertEqual(main_acc.balance, Decimal('500.0000'))
        self.assertEqual(tx1.ledger_entries.count(), 1)
        self.assertEqual(tx1.ledger_entries.first().balance_after, Decimal('500.0000'))

        # Idempotency check: submitting same key does not double-credit
        tx1_repeat = LedgerService.process_credit(
            user=self.user,
            account_type=AccountType.MAIN,
            amount=Decimal('500.0000'),
            tx_type=TransactionType.DEPOSIT,
            idempotency_key='IDEMP-TEST-001'
        )
        self.assertEqual(tx1.id, tx1_repeat.id)
        main_acc.refresh_from_db()
        self.assertEqual(main_acc.balance, Decimal('500.0000'))

        # Debit 200 from MAIN
        tx2 = LedgerService.process_debit(
            user=self.user,
            account_type=AccountType.MAIN,
            amount=Decimal('200.0000'),
            tx_type=TransactionType.GAME_BET
        )
        main_acc.refresh_from_db()
        self.assertEqual(main_acc.balance, Decimal('300.0000'))

        # Over-debit should raise ValidationError (cannot become negative)
        with self.assertRaises(ValidationError):
            LedgerService.process_debit(
                user=self.user,
                account_type=AccountType.MAIN,
                amount=Decimal('9999.0000'),
                tx_type=TransactionType.WITHDRAWAL
            )

    def test_provably_fair_rng_mechanics(self):
        """Test SHA-256 HMAC fairness seed commitment and calculations."""
        server_seed = "f8a9b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2"
        server_hash = ProvablyFairRNG.hash_seed(server_seed)
        self.assertEqual(len(server_hash), 64)

        # Multiplier calculation must be deterministic for identical seeds
        mult1 = ProvablyFairRNG.calculate_crash_multiplier(server_seed, "client-seed-abc", nonce=1)
        mult2 = ProvablyFairRNG.calculate_crash_multiplier(server_seed, "client-seed-abc", nonce=1)
        self.assertEqual(mult1, mult2)
        self.assertGreaterEqual(mult1, 1.00)

        # Dragon Tiger dealing
        dt_res = ProvablyFairRNG.deal_dragon_tiger(server_seed, "client-seed-abc", nonce=1)
        self.assertIn(dt_res['winner'], ['DRAGON', 'TIGER', 'TIE'])
        self.assertTrue(1 <= dt_res['dragon']['rank'] <= 13)
        self.assertTrue(1 <= dt_res['tiger']['rank'] <= 13)

        # Teen Patti hand evaluation
        trail_hand = [{'rank': 14, 'suit': '♠'}, {'rank': 14, 'suit': '♥'}, {'rank': 14, 'suit': '♦'}]
        score, ranks, name = ProvablyFairRNG.evaluate_teen_patti_hand(trail_hand)
        self.assertEqual(score, 6) # Trail

        pure_seq = [{'rank': 14, 'suit': '♠'}, {'rank': 13, 'suit': '♠'}, {'rank': 12, 'suit': '♠'}]
        score_seq, _, name_seq = ProvablyFairRNG.evaluate_teen_patti_hand(pure_seq)
        self.assertEqual(score_seq, 5) # Pure sequence

    def test_qr_payment_sandbox_gateway_flow(self):
        """Test dynamic UPI QR generation and idempotent callback settlement."""
        intent = QRPaymentGateway.initiate_deposit(
            user=self.user,
            amount=Decimal('750.0000'),
            currency='INR'
        )
        self.assertEqual(intent.status, PaymentIntentStatus.PENDING)
        self.assertIn("upi://pay?pa=veltrixarena@sandbox", intent.qr_payload)
        self.assertIn("am=750.00", intent.qr_payload)

        # Webhook callback
        settled_intent, was_credited = QRPaymentGateway.process_webhook_callback(
            intent_reference=intent.intent_reference,
            gateway_reference='MOCK-GW-998877'
        )
        self.assertTrue(was_credited)
        self.assertEqual(settled_intent.status, PaymentIntentStatus.COMPLETED)

        main_acc = WalletAccount.objects.get(user=self.user, account_type=AccountType.MAIN)
        self.assertEqual(main_acc.balance, Decimal('750.0000'))

        # Duplicate webhook callback (re-settlement attempt) must be idempotent
        settled_intent_2, was_credited_2 = QRPaymentGateway.process_webhook_callback(
            intent_reference=intent.intent_reference,
            gateway_reference='MOCK-GW-998877'
        )
        self.assertFalse(was_credited_2) # Did not credit a second time
        main_acc.refresh_from_db()
        self.assertEqual(main_acc.balance, Decimal('750.0000')) # Balance strictly preserved
