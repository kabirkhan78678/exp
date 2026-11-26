from django.urls import path
from apps.games.views import (
    GameListView, GameDetailView,
    AeroCrashCurrentRoundView, AeroCrashPlaceBetView,
    AeroCrashCashoutView, AeroCrashFinishRoundView,
    DragonTigerPlayView, TeenPattiRoomsView, CarromMatchView,
    MinesPlayView, FairDicePlayView, WingoPlayView, LudoMatchView,
)

urlpatterns = [
    path('list/', GameListView.as_view(), name='game_list'),
    path('detail/<slug:slug>/', GameDetailView.as_view(), name='game_detail'),
    # AeroCrash
    path('aerocrash/round/', AeroCrashCurrentRoundView.as_view(), name='aerocrash_round'),
    path('aerocrash/bet/', AeroCrashPlaceBetView.as_view(), name='aerocrash_bet'),
    path('aerocrash/cashout/', AeroCrashCashoutView.as_view(), name='aerocrash_cashout'),
    path('aerocrash/finish-round/', AeroCrashFinishRoundView.as_view(), name='aerocrash_finish'),
    # Dragon Tiger
    path('dragontiger/play/', DragonTigerPlayView.as_view(), name='dragontiger_play'),
    # Teen Patti
    path('teenpatti/rooms/', TeenPattiRoomsView.as_view(), name='teenpatti_rooms'),
    # Carrom
    path('carrom/match/', CarromMatchView.as_view(), name='carrom_match'),
    # Mines, Fair Dice, Wingo Parity, Ludo Arena
    path('mines/play/', MinesPlayView.as_view(), name='mines_play'),
    path('dice/play/', FairDicePlayView.as_view(), name='dice_play'),
    path('wingo/play/', WingoPlayView.as_view(), name='wingo_play'),
    path('ludo/match/', LudoMatchView.as_view(), name='ludo_match'),
]
