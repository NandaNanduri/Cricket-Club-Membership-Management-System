"""
urls.py defines URL patterns and maps them to views.  
When a request comes in, Django matches the URL against these patterns  
and routes it to the corresponding view function or class.  
This file acts as the "table of contents" for your web application's URLs. 
"""

from django.urls import path
from .views import *

urlpatterns = [
    path('register/player/', RegisterPlayerView.as_view(), name='register_player'),
    path('register/team-admin/', RegisterTeamAdminView.as_view(), name='register_team_admin'),
    path('register/club-admin/', RegisterClubAdminView.as_view(), name='register_club_admin'),
    path('register/umpire/', RegisterUmpireView.as_view(), name='register_umpire'),
    path('register/member/', RegisterMemberView.as_view(), name='register_member'),
    path('become-player/', BecomePlayerView.as_view(), name='become_player'),
    path('login/', LoginView.as_view(), name='login'),
    path('all-users/', AllUsersView.as_view(), name='all-users'),
    path('team-players/', TeamPlayersView.as_view(), name='team-players'),
    path('receipts/upload/', UploadReceiptView.as_view(), name='receipts-upload' ),
    path('receipts/unverified/', ListUnverifiedReceipts.as_view(), name='receipts-unverified'),
    path('receipts/verify/<int:receipt_id>/', VerifyReceiptView.as_view(), name='receipts-verify'),
    path('receipts/all/', ListAllReceipts.as_view(), name='receipts-all'),
    path('player/qr-code/', PlayerQRCodeView.as_view(), name='player-qr-code'),
    path('team-admin/qr-code/', TeamAdminQRCodeView.as_view(), name='team-admin-qr-code'),#THIS CAN BE REMOVED
    path('scan-qr/', ScanQRCodeView.as_view(), name='scan-qr'),
]