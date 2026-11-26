import uuid
from decimal import Decimal
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.games.models import Game, GameRound, Bet, MultiplayerRoom, RoomParticipant, RoundStatus, BetStatus
from apps.games.serializers import GameSerializer, GameRoundSerializer, BetSerializer, MultiplayerRoomSerializer
from apps.games.fairness import ProvablyFairRNG
from apps.wallet.models import AccountType, TransactionType
from apps.wallet.services import LedgerService

class GameListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        games = Game.objects.filter(is_active=True)
        return Response({'games': GameSerializer(games, many=True).data})

class GameDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        try:
            game = Game.objects.get(slug=slug)
            return Response({'game': GameSerializer(game).data})
        except Game.DoesNotExist:
            return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)

class AeroCrashCurrentRoundView(APIView):
    def get(self, request):
        game = Game.objects.get(slug='aerocrash')
        # Find active or create new round
        round_obj = GameRound.objects.filter(
            game=game,
            status__in=[RoundStatus.BETTING_OPEN, RoundStatus.IN_PROGRESS]
        ).first()

        if not round_obj:
            server_seed = ProvablyFairRNG.generate_server_seed()
            server_hash = ProvablyFairRNG.hash_seed(server_seed)
            round_no = f"AC-{uuid.uuid4().hex[:8].upper()}"
            client_seed = f"seed-{uuid.uuid4().hex[:6]}"
            crash_point = ProvablyFairRNG.calculate_crash_multiplier(
                server_seed, client_seed, nonce=1, house_edge=float(game.house_edge)
            )

            round_obj = GameRound.objects.create(
                game=game,
                round_number=round_no,
                server_seed=server_seed,
                server_seed_hash=server_hash,
                client_seed=client_seed,
                final_outcome=Decimal(str(crash_point)),
                status=RoundStatus.BETTING_OPEN,
                outcome_payload={'crash_point': crash_point}
            )

        # Recent history
        history = GameRound.objects.filter(
            game=game, status=RoundStatus.SETTLED
        ).order_by('-ended_at')[:15]

        # Active bets for current round
        bets = Bet.objects.filter(round=round_obj)
        my_bet = bets.filter(user=request.user).first() if request.user.is_authenticated else None

        return Response({
            'round': {
                'id': round_obj.id,
                'round_number': round_obj.round_number,
                'server_seed_hash': round_obj.server_seed_hash,
                'client_seed': round_obj.client_seed,
                'status': round_obj.status,
                'started_at': round_obj.started_at,
                # In real round, crash point is only revealed when SETTLED
                'crash_point': float(round_obj.final_outcome) if round_obj.status == RoundStatus.SETTLED else None
            },
            'recent_history': [
                {'round': r.round_number, 'multiplier': float(r.final_outcome), 'seed_hash': r.server_seed_hash, 'revealed_seed': r.server_seed}
                for r in history
            ],
            'active_bets': BetSerializer(bets, many=True).data,
            'my_bet': BetSerializer(my_bet).data if my_bet else None
        })

class AeroCrashPlaceBetView(APIView):
    def post(self, request):
        round_id = request.data.get('round_id')
        stake_val = request.data.get('stake')
        account_type = request.data.get('account_type', AccountType.DEMO)
        auto_cashout_val = request.data.get('auto_cashout')

        if not round_id or not stake_val:
            return Response({'error': 'round_id and stake are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stake = Decimal(str(stake_val))
            game = Game.objects.get(slug='aerocrash')

            if stake < game.min_stake or stake > game.max_stake:
                return Response(
                    {'error': f"Stake must be between {game.min_stake} and {game.max_stake}."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            round_obj = GameRound.objects.get(id=round_id, game=game)
            if round_obj.status != RoundStatus.BETTING_OPEN:
                return Response({'error': 'Betting is closed for this round.'}, status=status.HTTP_400_BAD_REQUEST)

            if Bet.objects.filter(round=round_obj, user=request.user).exists():
                return Response({'error': 'You already placed a bet in this round.'}, status=status.HTTP_400_BAD_REQUEST)

            # Atomic debit of stake
            accounts = LedgerService.ensure_wallet_accounts(request.user)
            user_acc = accounts.get(account_type)

            idempotency_key = f"BET_AC_{round_obj.round_number}_{request.user.id}"
            LedgerService.process_debit(
                user=request.user,
                account_type=account_type,
                amount=stake,
                tx_type=TransactionType.GAME_BET,
                idempotency_key=idempotency_key,
                description=f"AeroCrash Bet on Round {round_obj.round_number}",
                metadata={'game': 'aerocrash', 'round': round_obj.round_number}
            )

            # Update wagered in profile
            profile = request.user.profile
            profile.total_wagered += stake
            profile.loyalty_points += stake * Decimal('0.05') # 5% loyalty cashback
            profile.save(update_fields=['total_wagered', 'loyalty_points'])

            auto_cashout = Decimal(str(auto_cashout_val)) if auto_cashout_val else None

            bet = Bet.objects.create(
                round=round_obj,
                user=request.user,
                account=user_acc,
                stake_amount=stake,
                bet_choice='CRASH',
                auto_cashout=auto_cashout,
                status=BetStatus.PLACED
            )

            return Response({
                'message': 'Bet placed successfully!',
                'bet': BetSerializer(bet).data
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AeroCrashCashoutView(APIView):
    def post(self, request):
        bet_id = request.data.get('bet_id')
        current_multiplier_val = request.data.get('multiplier')

        if not bet_id or not current_multiplier_val:
            return Response({'error': 'bet_id and multiplier are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            multiplier = Decimal(str(current_multiplier_val))
            bet = Bet.objects.select_for_update().get(id=bet_id, user=request.user)

            if bet.status != BetStatus.PLACED:
                return Response({'error': f"Bet is already {bet.status}."}, status=status.HTTP_400_BAD_REQUEST)

            crash_limit = bet.round.final_outcome
            if multiplier > crash_limit:
                bet.status = BetStatus.LOST
                bet.save(update_fields=['status'])
                return Response({'error': 'Plane crashed before cashout!', 'status': 'LOST'}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate win payout
            payout = (bet.stake_amount * multiplier).quantize(Decimal('0.0001'))
            bet.status = BetStatus.CASHED_OUT
            bet.cashout_multiplier = multiplier
            bet.payout_amount = payout
            bet.save(update_fields=['status', 'cashout_multiplier', 'payout_amount'])

            # Atomic credit to wallet
            idempotency_key = f"WIN_AC_{bet.round.round_number}_{request.user.id}_{bet.id}"
            LedgerService.settle_game_bet(
                user=request.user,
                account_type=bet.account.account_type,
                stake_amount=bet.stake_amount,
                payout_amount=payout,
                game_slug='aerocrash',
                round_number=bet.round.round_number,
                idempotency_key=idempotency_key
            )

            return Response({
                'message': f"Successfully cashed out at {multiplier}x! Won ₹{payout:.2f}",
                'bet': BetSerializer(bet).data,
                'payout': str(payout)
            })

        except Bet.DoesNotExist:
            return Response({'error': 'Bet not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AeroCrashFinishRoundView(APIView):
    """Marks round settled, reveals server seed, settles remaining bets as lost."""
    def post(self, request):
        round_id = request.data.get('round_id')
        try:
            round_obj = GameRound.objects.get(id=round_id)
            round_obj.status = RoundStatus.SETTLED
            round_obj.ended_at = timezone.now()
            round_obj.save(update_fields=['status', 'ended_at'])

            # Any uncashed bets become LOST
            Bet.objects.filter(round=round_obj, status=BetStatus.PLACED).update(status=BetStatus.LOST)

            return Response({
                'message': 'Round settled',
                'crash_point': float(round_obj.final_outcome),
                'server_seed': round_obj.server_seed,
                'server_seed_hash': round_obj.server_seed_hash
            })
        except GameRound.DoesNotExist:
            return Response({'error': 'Round not found'}, status=status.HTTP_404_NOT_FOUND)

class DragonTigerPlayView(APIView):
    """
    Plays a complete, provably fair Dragon Tiger round.
    Bet choices: 'DRAGON', 'TIGER', 'TIE'
    Payouts: DRAGON (1:1), TIGER (1:1), TIE (8:1)
    """
    def post(self, request):
        stake_val = request.data.get('stake')
        bet_choice = request.data.get('bet_choice', 'DRAGON').upper()
        account_type = request.data.get('account_type', AccountType.DEMO)

        if bet_choice not in ['DRAGON', 'TIGER', 'TIE']:
            return Response({'error': "bet_choice must be DRAGON, TIGER, or TIE."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stake = Decimal(str(stake_val))
            game = Game.objects.get(slug='dragontiger')

            if stake < game.min_stake or stake > game.max_stake:
                return Response({'error': f"Stake must be between {game.min_stake} and {game.max_stake}."}, status=status.HTTP_400_BAD_REQUEST)

            # Generate provably fair outcome
            server_seed = ProvablyFairRNG.generate_server_seed()
            server_hash = ProvablyFairRNG.hash_seed(server_seed)
            client_seed = f"dt-{uuid.uuid4().hex[:6]}"
            result = ProvablyFairRNG.deal_dragon_tiger(server_seed, client_seed)

            winner = result['winner']
            won = (bet_choice == winner)

            payout_multiplier = Decimal('1.0') # 1:1 payout
            if winner == 'TIE':
                payout_multiplier = Decimal('8.0')

            round_no = f"DT-{uuid.uuid4().hex[:8].upper()}"
            round_obj = GameRound.objects.create(
                game=game,
                round_number=round_no,
                server_seed=server_seed,
                server_seed_hash=server_hash,
                client_seed=client_seed,
                final_outcome=Decimal('1') if winner == 'DRAGON' else Decimal('2') if winner == 'TIGER' else Decimal('0'),
                outcome_payload=result,
                status=RoundStatus.SETTLED,
                ended_at=timezone.now()
            )

            # Atomic debit of stake
            accounts = LedgerService.ensure_wallet_accounts(request.user)
            idempotency_bet = f"BET_DT_{round_no}_{request.user.id}"
            LedgerService.process_debit(
                user=request.user,
                account_type=account_type,
                amount=stake,
                tx_type=TransactionType.GAME_BET,
                idempotency_key=idempotency_bet,
                description=f"Dragon Tiger Bet ({bet_choice}) on Round {round_no}",
                metadata={'game': 'dragontiger', 'bet_choice': bet_choice}
            )

            # Update wagered in profile
            profile = request.user.profile
            profile.total_wagered += stake
            profile.loyalty_points += stake * Decimal('0.05')
            profile.save(update_fields=['total_wagered', 'loyalty_points'])

            payout_amount = Decimal('0.0000')
            if won:
                # Returns stake + winnings (stake * (1 + multiplier))
                payout_amount = stake + (stake * payout_multiplier)
                idempotency_win = f"WIN_DT_{round_no}_{request.user.id}"
                LedgerService.settle_game_bet(
                    user=request.user,
                    account_type=account_type,
                    stake_amount=stake,
                    payout_amount=payout_amount,
                    game_slug='dragontiger',
                    round_number=round_no,
                    idempotency_key=idempotency_win
                )

            bet = Bet.objects.create(
                round=round_obj,
                user=request.user,
                account=accounts[account_type],
                stake_amount=stake,
                bet_choice=bet_choice,
                payout_amount=payout_amount,
                status=BetStatus.WON if won else BetStatus.LOST
            )

            return Response({
                'round_number': round_no,
                'result': result,
                'bet_choice': bet_choice,
                'won': won,
                'payout': str(payout_amount),
                'server_seed': server_seed,
                'server_seed_hash': server_hash,
                'bet': BetSerializer(bet).data
            })

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TeenPattiRoomsView(APIView):
    def get(self, request):
        game = Game.objects.get(slug='teenpatti')
        rooms = MultiplayerRoom.objects.filter(game=game).order_by('-created_at')[:20]
        return Response({'rooms': MultiplayerRoomSerializer(rooms, many=True).data})

    def post(self, request):
        game = Game.objects.get(slug='teenpatti')
        room_code = f"TP{secrets.token_hex(3).upper()}" if 'secrets' in globals() else f"TP{uuid.uuid4().hex[:6].upper()}"
        boot_amount = Decimal(str(request.data.get('boot_amount', '50.0000')))

        room = MultiplayerRoom.objects.create(
            game=game,
            room_code=room_code,
            max_players=5,
            boot_amount=boot_amount,
            created_by=request.user,
            status='WAITING',
            room_state={'pot': float(boot_amount), 'current_turn': 1, 'turn_deadline': 20}
        )

        # Creator automatically takes seat 1
        RoomParticipant.objects.create(
            room=room,
            user=request.user,
            seat_number=1,
            is_ready=True,
            current_stake=boot_amount
        )

        return Response({
            'message': 'Room created successfully.',
            'room': MultiplayerRoomSerializer(room).data
        }, status=status.HTTP_201_CREATED)

class CarromMatchView(APIView):
    """
    Submits completed 2D Carrom match score and awards winner pot.
    """
    def post(self, request):
        score = request.data.get('score', 0)
        pockets = request.data.get('pockets', {})
        account_type = request.data.get('account_type', AccountType.DEMO)
        is_victory = request.data.get('is_victory', False)

        game = Game.objects.get(slug='carrom')
        stake = Decimal('100.0000')

        # Debit match entry fee
        idempotency_fee = f"CARROM_FEE_{request.user.id}_{uuid.uuid4().hex[:6]}"
        LedgerService.process_debit(
            user=request.user,
            account_type=account_type,
            amount=stake,
            tx_type=TransactionType.GAME_BET,
            idempotency_key=idempotency_fee,
            description="Carrom Arena Match Entry Stake",
            metadata={'game': 'carrom', 'score': score}
        )

        payout = Decimal('0.0000')
        if is_victory:
            payout = Decimal('180.0000') # 1.8x win on 1v1 match
            idempotency_win = f"CARROM_WIN_{request.user.id}_{uuid.uuid4().hex[:6]}"
            LedgerService.settle_game_bet(
                user=request.user,
                account_type=account_type,
                stake_amount=stake,
                payout_amount=payout,
                game_slug='carrom',
                round_number=f"CR-{uuid.uuid4().hex[:6].upper()}",
                idempotency_key=idempotency_win
            )

        return Response({
            'message': 'Match submitted and settled.',
            'is_victory': is_victory,
            'payout': str(payout)
        })
