from rest_framework import serializers
from apps.games.models import Game, GameRound, Bet, MultiplayerRoom, RoomParticipant

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = [
            'slug', 'name', 'category', 'thumbnail_url', 'description',
            'min_stake', 'max_stake', 'house_edge', 'is_active', 'is_maintenance', 'config'
        ]

class GameRoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameRound
        fields = [
            'id', 'game', 'round_number', 'server_seed_hash', 'server_seed',
            'client_seed', 'nonce', 'final_outcome', 'outcome_payload',
            'status', 'started_at', 'ended_at', 'created_at'
        ]

class BetSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    round_number = serializers.CharField(source='round.round_number', read_only=True)

    class Meta:
        model = Bet
        fields = [
            'id', 'round', 'round_number', 'username', 'stake_amount',
            'bet_choice', 'auto_cashout', 'cashout_multiplier',
            'payout_amount', 'status', 'created_at'
        ]

class RoomParticipantSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    vip_tier = serializers.CharField(source='user.profile.vip_tier', read_only=True)

    class Meta:
        model = RoomParticipant
        fields = [
            'id', 'seat_number', 'username', 'vip_tier', 'is_ready',
            'is_folded', 'cards', 'current_stake', 'joined_at'
        ]

class MultiplayerRoomSerializer(serializers.ModelSerializer):
    participants = RoomParticipantSerializer(many=True, read_only=True)
    game_name = serializers.CharField(source='game.name', read_only=True)

    class Meta:
        model = MultiplayerRoom
        fields = [
            'id', 'game', 'game_name', 'room_code', 'room_type',
            'max_players', 'boot_amount', 'status', 'room_state',
            'participants', 'created_at'
        ]
