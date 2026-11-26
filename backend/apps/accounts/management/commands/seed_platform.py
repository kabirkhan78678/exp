import uuid
import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User, UserProfile, UserRole, VIPTier, KYCStatus
from apps.wallet.models import WalletAccount, AccountType, TransactionType
from apps.wallet.services import LedgerService
from apps.games.models import Game, GameCategory, GameRound, Bet, BetStatus, RoundStatus, MultiplayerRoom, RoomParticipant
from apps.games.fairness import ProvablyFairRNG
from apps.cms.models import (
    Banner, Announcement, PromotionCampaign, SupportTicket,
    TicketMessage, Tournament, RainDrop, LoungeMessage
)
from apps.admin_center.models import AuditLog

class Command(BaseCommand):
    help = 'Seeds Veltrix Arena with development users, games, rounds, transactions, and CMS assets.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Veltrix Arena platform...")

        # 1. Super Admin
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@veltrix.arena',
                'role': UserRole.SUPER_ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True
            }
        )
        if created:
            admin_user.set_password('Admin@123456')
            admin_user.save()
            UserProfile.objects.create(
                user=admin_user,
                vip_tier=VIPTier.ELITE,
                referral_code='ADMIN01',
                kyc_status=KYCStatus.VERIFIED,
                preferences={"sound": True, "theme": "midnight_aurora"}
            )
            LedgerService.ensure_wallet_accounts(admin_user)
            self.stdout.write(self.style.SUCCESS("Created Super Admin: admin@veltrix.arena / Admin@123456"))

        # 2. Sample Player 1
        player1, created = User.objects.get_or_create(
            username='player1',
            defaults={
                'email': 'player1@veltrix.arena',
                'role': UserRole.PLAYER,
                'is_verified': True
            }
        )
        if created:
            player1.set_password('Player@123456')
            player1.save()
            p1_profile = UserProfile.objects.create(
                user=player1,
                vip_tier=VIPTier.SILVER,
                referral_code='PLAY001',
                kyc_status=KYCStatus.VERIFIED,
                total_wagered=Decimal('12500.0000'),
                total_won=Decimal('14200.0000'),
                loyalty_points=Decimal('625.0000')
            )
            LedgerService.ensure_wallet_accounts(player1)
            # Give player 1 some main balance
            LedgerService.process_credit(
                user=player1,
                account_type=AccountType.MAIN,
                amount=Decimal('2500.0000'),
                tx_type=TransactionType.DEPOSIT,
                description="Demo Sandbox Seed Deposit"
            )
            self.stdout.write(self.style.SUCCESS("Created Player 1: player1@veltrix.arena / Player@123456"))

        # 3. Sample VIP Player
        vip_player, created = User.objects.get_or_create(
            username='vip_king',
            defaults={
                'email': 'vip_player@veltrix.arena',
                'role': UserRole.PLAYER,
                'is_verified': True
            }
        )
        if created:
            vip_player.set_password('Player@123456')
            vip_player.save()
            UserProfile.objects.create(
                user=vip_player,
                vip_tier=VIPTier.GOLD,
                referral_code='VIPKING',
                kyc_status=KYCStatus.VERIFIED,
                total_wagered=Decimal('85000.0000'),
                total_won=Decimal('92000.0000'),
                loyalty_points=Decimal('4250.0000')
            )
            LedgerService.ensure_wallet_accounts(vip_player)
            LedgerService.process_credit(
                user=vip_player,
                account_type=AccountType.MAIN,
                amount=Decimal('15000.0000'),
                tx_type=TransactionType.DEPOSIT,
                description="High Roller Sandbox Deposit"
            )
            self.stdout.write(self.style.SUCCESS("Created VIP Player: vip_player@veltrix.arena / Player@123456"))

        # 4. Games Catalog
        games_data = [
            {
                'slug': 'aerocrash',
                'name': 'AeroCrash Aviator',
                'category': GameCategory.CRASH,
                'thumbnail_url': '/images/hosts/aerocrash.jpg',
                'description': 'High-velocity multiplier curve. Watch the aircraft climb and cash out before the supersonic crash.',
                'min_stake': Decimal('10.0000'),
                'max_stake': Decimal('25000.0000'),
                'house_edge': Decimal('0.0300'),
                'config': {'max_multiplier': 1000.0, 'tick_interval_ms': 100}
            },
            {
                'slug': 'dragontiger',
                'name': 'Dragon Tiger Live',
                'category': GameCategory.TABLE,
                'thumbnail_url': '/images/hosts/dragontiger.jpg',
                'description': 'Speed baccarat classic. Dragon vs Tiger two-card battle with transparent 1:1 and 8:1 tie odds.',
                'min_stake': Decimal('10.0000'),
                'max_stake': Decimal('50000.0000'),
                'house_edge': Decimal('0.0373'),
                'config': {'deck_count': 8, 'tie_payout': 8.0}
            },
            {
                'slug': 'teenpatti',
                'name': 'Teen Patti Multiplayer',
                'category': GameCategory.CARDS,
                'thumbnail_url': '/images/hosts/teenpatti.jpg',
                'description': 'The authentic 3-card Indian poker experience. Public & private tables with blind, chaal, and showdown.',
                'min_stake': Decimal('20.0000'),
                'max_stake': Decimal('10000.0000'),
                'house_edge': Decimal('0.0400'),
                'config': {'max_seats': 5, 'turn_seconds': 20}
            },
            {
                'slug': 'carrom',
                'name': 'Carrom 2D Arena',
                'category': GameCategory.SKILL,
                'thumbnail_url': '/images/hosts/carrom.jpg',
                'description': 'Realistic 2D physics tabletop multiplayer. Drag, aim, pocket coins and claim the Queen with cover.',
                'min_stake': Decimal('50.0000'),
                'max_stake': Decimal('5000.0000'),
                'house_edge': Decimal('0.0250'),
                'config': {'restitution': 0.88, 'friction': 0.985}
            },
            {
                'slug': 'mines',
                'name': 'Mines Diamond Grid',
                'category': GameCategory.CRASH,
                'thumbnail_url': '/images/hosts/mines.jpg',
                'description': '5x5 diamond & bomb grid. Reveal emerald gems, climb the multiplier ladder, and cash out anytime.',
                'min_stake': Decimal('10.0000'),
                'max_stake': Decimal('20000.0000'),
                'house_edge': Decimal('0.0300'),
                'config': {'grid_size': 25, 'min_mines': 1, 'max_mines': 24}
            },
            {
                'slug': 'dice',
                'name': 'Fair Dice',
                'category': GameCategory.CRASH,
                'thumbnail_url': '/images/hosts/dice.jpg',
                'description': 'Precision Over/Under 0.00-100.00 slider. Balance win probability against instant payout multipliers.',
                'min_stake': Decimal('10.0000'),
                'max_stake': Decimal('50000.0000'),
                'house_edge': Decimal('0.0100'),
                'config': {'rtp': 99.0}
            },
            {
                'slug': 'wingo',
                'name': 'Wingo Color Parity',
                'category': GameCategory.TABLE,
                'thumbnail_url': '/images/hosts/wingo.jpg',
                'description': '30s & 60s countdown parity arena. Predict Emerald Green, Crimson Red, Violet, Big/Small or 0-9.',
                'min_stake': Decimal('10.0000'),
                'max_stake': Decimal('25000.0000'),
                'house_edge': Decimal('0.0200'),
                'config': {'intervals': [30, 60]}
            },
            {
                'slug': 'ludo',
                'name': 'Ludo Arena Quick',
                'category': GameCategory.SKILL,
                'thumbnail_url': '/images/hosts/ludo.jpg',
                'description': '2P & 4P 5-minute points-based quick Ludo tournament board with private room codes and captures.',
                'min_stake': Decimal('25.0000'),
                'max_stake': Decimal('10000.0000'),
                'house_edge': Decimal('0.0400'),
                'config': {'duration_seconds': 300, 'modes': ['2P', '4P']}
            }
        ]

        for g_data in games_data:
            game, _ = Game.objects.update_or_create(
                slug=g_data['slug'],
                defaults=g_data
            )
            self.stdout.write(f"Configured game: {game.name}")

        # 5. AeroCrash Sample Rounds
        ac_game = Game.objects.get(slug='aerocrash')
        sample_multipliers = [1.45, 2.15, 1.12, 5.82, 3.40, 1.05, 12.60, 1.88, 2.95, 4.10]
        now = timezone.now()

        for idx, mult in enumerate(sample_multipliers):
            seed = ProvablyFairRNG.generate_server_seed()
            r_no = f"AC-DEMO-00{idx+1}"
            r_obj, _ = GameRound.objects.get_or_create(
                round_number=r_no,
                defaults={
                    'game': ac_game,
                    'server_seed': seed,
                    'server_seed_hash': ProvablyFairRNG.hash_seed(seed),
                    'client_seed': f"seed-{idx}",
                    'final_outcome': Decimal(str(mult)),
                    'status': RoundStatus.SETTLED,
                    'started_at': now - datetime.timedelta(minutes=30 - idx*2),
                    'ended_at': now - datetime.timedelta(minutes=29 - idx*2),
                    'outcome_payload': {'crash_point': mult}
                }
            )

        # 6. CMS Banners & Announcements
        Banner.objects.get_or_create(
            title='Supersonic Multipliers with AeroCrash',
            defaults={
                'subtitle': 'Experience authentic server-authoritative flight curve with 97% RTP and instant cashouts.',
                'image_url': '/banners/aerocrash-hero.jpg',
                'link_url': '/games/aerocrash',
                'badge_text': 'HOT TITLE',
                'order': 1
            }
        )
        Banner.objects.get_or_create(
            title='Weekend Tournament Arena — ₹1,00,000 Pool',
            defaults={
                'subtitle': 'Compete across Dragon Tiger and Carrom boards for leaderboard glory and exclusive VIP perks.',
                'image_url': '/banners/tournament-hero.jpg',
                'link_url': '/leaderboard',
                'badge_text': 'TOURNAMENT',
                'order': 2
            }
        )

        Announcement.objects.get_or_create(
            title='Demo-Credit Mode Active',
            defaults={
                'content': 'Welcome to Veltrix Arena! All games are initially provisioned with 10,000 demo credits for complete risk-free simulation.',
                'announcement_type': Announcement.Type.INFO
            }
        )
        Announcement.objects.get_or_create(
            title='Provably Fair Cryptographic Commitment',
            defaults={
                'content': 'Every round outcome is computed via SHA-256 HMAC before betting opens. Transparent seeds are revealed immediately upon round settlement.',
                'announcement_type': Announcement.Type.PROMO
            }
        )

        # 7. Promotions (Including Redeemable Promo Codes)
        promo_seeds = [
            {
                'code': 'WELCOME100',
                'title': '100% First Deposit Match',
                'bonus_percentage': Decimal('100.00'),
                'bonus_fixed_amount': Decimal('100.0000'),
                'min_deposit': Decimal('100.0000'),
                'max_bonus': Decimal('5000.0000'),
            },
            {
                'code': 'VELTRIX500',
                'title': 'VIP Flagship Drop ₹500 Bonus',
                'bonus_percentage': Decimal('0.00'),
                'bonus_fixed_amount': Decimal('500.0000'),
                'min_deposit': Decimal('0.0000'),
                'max_bonus': Decimal('500.0000'),
            },
            {
                'code': 'WELCOME250',
                'title': 'Starter Instant Boost ₹250',
                'bonus_percentage': Decimal('0.00'),
                'bonus_fixed_amount': Decimal('250.0000'),
                'min_deposit': Decimal('0.0000'),
                'max_bonus': Decimal('250.0000'),
            },
            {
                'code': 'VIP1000',
                'title': 'High-Roller ₹1,000 Vault Code',
                'bonus_percentage': Decimal('0.00'),
                'bonus_fixed_amount': Decimal('1000.0000'),
                'min_deposit': Decimal('0.0000'),
                'max_bonus': Decimal('1000.0000'),
            },
        ]
        for p in promo_seeds:
            PromotionCampaign.objects.update_or_create(code=p['code'], defaults=p)

        # 7b. Hourly & Weekend Tournaments (Carrom & Ludo ₹10k - ₹50k Prize Pools)
        tournament_seeds = [
            {
                'slug': 'carrom-hourly-blitz',
                'title': 'Hourly Carrom 2D Blitz',
                'game_slug': 'carrom',
                'schedule_type': 'HOURLY',
                'prize_pool': Decimal('10000.0000'),
                'entry_fee': Decimal('50.0000'),
                'max_players': 64,
                'base_joined_count': 42,
                'status': 'LIVE',
                'ends_at': now + datetime.timedelta(minutes=47),
                'bracket_json': [
                    {'stage': 'QF1', 'p1': 'Vikram_Pro', 's1': 140, 'p2': 'Kabir_77', 's2': 95, 'winner': 'Vikram_Pro'},
                    {'stage': 'QF2', 'p1': 'Kavya_Striker', 's1': 165, 'p2': 'Rohan_99', 's2': 120, 'winner': 'Kavya_Striker'},
                    {'stage': 'QF3', 'p1': 'Aarav_VIP', 's1': 130, 'p2': 'Zoya_Ace', 's2': 110, 'winner': 'Aarav_VIP'},
                    {'stage': 'QF4', 'p1': 'Neha_Queen', 's1': 155, 'p2': 'Open Seed #8', 's2': 0, 'winner': 'TBD'},
                ],
            },
            {
                'slug': 'ludo-hourly-rush',
                'title': 'Hourly Ludo Quick Rush',
                'game_slug': 'ludo',
                'schedule_type': 'HOURLY',
                'prize_pool': Decimal('15000.0000'),
                'entry_fee': Decimal('50.0000'),
                'max_players': 64,
                'base_joined_count': 51,
                'status': 'LIVE',
                'ends_at': now + datetime.timedelta(minutes=34),
                'bracket_json': [
                    {'stage': 'QF1', 'p1': 'LudoKing88', 's1': 210, 'p2': 'Riya_Roll', 's2': 185, 'winner': 'LudoKing88'},
                    {'stage': 'QF2', 'p1': 'Sameer_66', 's1': 200, 'p2': 'Dev_VIP', 's2': 140, 'winner': 'Sameer_66'},
                    {'stage': 'QF3', 'p1': 'Tara_Blitz', 's1': 195, 'p2': 'Karan_X', 's2': 190, 'winner': 'Tara_Blitz'},
                    {'stage': 'QF4', 'p1': 'Ananya_Pro', 's1': 175, 'p2': 'Open Seed #8', 's2': 0, 'winner': 'TBD'},
                ],
            },
            {
                'slug': 'carrom-weekend-masters',
                'title': 'Weekend Carrom Birch Masters',
                'game_slug': 'carrom',
                'schedule_type': 'WEEKEND',
                'prize_pool': Decimal('50000.0000'),
                'entry_fee': Decimal('200.0000'),
                'max_players': 128,
                'base_joined_count': 96,
                'status': 'LIVE',
                'ends_at': now + datetime.timedelta(hours=38),
                'bracket_json': [
                    {'stage': 'QF1', 'p1': 'vip_king', 's1': 245, 'p2': 'birch_master', 's2': 210, 'winner': 'vip_king'},
                    {'stage': 'QF2', 'p1': 'pro_kavya', 's1': 230, 'p2': 'queen_cover', 's2': 190, 'winner': 'pro_kavya'},
                ],
            },
            {
                'slug': 'ludo-weekend-royale',
                'title': 'Weekend Ludo Grand Royale',
                'game_slug': 'ludo',
                'schedule_type': 'WEEKEND',
                'prize_pool': Decimal('35000.0000'),
                'entry_fee': Decimal('150.0000'),
                'max_players': 128,
                'base_joined_count': 84,
                'status': 'LIVE',
                'ends_at': now + datetime.timedelta(hours=41),
                'bracket_json': [
                    {'stage': 'QF1', 'p1': 'RollSixPro', 's1': 280, 'p2': 'FastTrack9', 's2': 225, 'winner': 'RollSixPro'},
                    {'stage': 'QF2', 'p1': 'DiceMonarch', 's1': 260, 'p2': 'Open Seed #4', 's2': 0, 'winner': 'TBD'},
                ],
            },
        ]
        for t in tournament_seeds:
            Tournament.objects.update_or_create(slug=t['slug'], defaults=t)

        # 7c. Seed Initial Live Lounge Messages & 1 Active Rain Drop
        if not LoungeMessage.objects.exists():
            seed_rain = RainDrop.objects.create(
                creator=vip_player,
                creator_name='vip_king',
                total_amount=Decimal('500.0000'),
                per_claim_amount=Decimal('50.0000'),
                max_claims=10,
            )
            LoungeMessage.objects.create(
                sender=vip_player, sender_name='vip_king', vip_tier='ELITE',
                message='Cashed 18.4x on AeroCrash! Catch this ₹500 Bonus Rain fam 🚀',
                msg_type='RAIN', rain_amount=Decimal('500.0000'), rain_drop=seed_rain
            )
            LoungeMessage.objects.create(
                sender=player1, sender_name='player1', vip_tier='SILVER',
                message='Just used promo VELTRIX500 + joined the ₹10k Carrom Blitz!',
                msg_type='CHAT'
            )
            LoungeMessage.objects.create(
                sender=admin_user, sender_name='Captain_Aria', vip_tier='DIAMOND',
                message='Hourly Carrom & Ludo brackets closing soon — good luck at the tables! 💎',
                msg_type='WIN_ALERT'
            )

        # 8. Support Tickets
        SupportTicket.objects.get_or_create(
            ticket_number='TCK-DEMO-001',
            defaults={
                'user': player1,
                'category': SupportTicket.Category.TECHNICAL,
                'priority': SupportTicket.Priority.MEDIUM,
                'subject': 'Inquiry about Provably Fair Verification Seeds',
                'status': 'RESOLVED'
            }
        )

        # 9. Initial Audit Log
        AuditLog.objects.create(
            actor=admin_user,
            action='SYSTEM_SEEDED',
            resource_type='SYSTEM',
            resource_id='VELTRIX-ARENA',
            payload={'version': '1.0.0-production-ready', 'theme': 'Midnight Aurora'}
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Veltrix Arena platform!"))
