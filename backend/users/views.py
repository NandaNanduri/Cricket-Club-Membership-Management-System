"""
The main purpose of the views is for the processing of the incoming HTTP requests
and returning appropriate HTTP responses.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from pyzbar.pyzbar import decode
from PIL import Image
import json
from .serializers import *
from django.shortcuts import render
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import *
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import FileResponse, Http404
from django.conf import settings
import os



"""
This view is responsible for registering the player

"""
class RegisterPlayerView(APIView):
    def post(self, request):
        serializer = PlayerRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'Player registered successfully!'}, status=201)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=400)


"""
This view is responsible for registering the team admin
"""
class RegisterTeamAdminView(APIView):
    def post(self, request):
        serializer = TeamAdminRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'Team Admin registered successfully!'}, status=201)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=400)


"""
This view is responsible for registering the club admin
"""
class RegisterClubAdminView(APIView):
    def post(self, request):
        print("Received data:", request.data)
        serializer = ClubAdminRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'Club Admin registered successfully!'}, status=201)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=400)


"""
This view is responsible for registering the umpire
"""
class RegisterUmpireView(APIView):
    def post(self, request):
        serializer = UmpireRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'Umpire has registered successfully!'}, status=201)
        return Response(serializer.errors, status=400)
        

"""
This view is responsible for registering the member
"""
class RegisterMemberView(APIView):
    def post(self, request):
        serializer = MemberRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'Member registered successfully!'}, status=201)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=400)


"""
This view is responsible for allowing a club admin or umpire to become a player or team admin
"""
class BecomePlayerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if PlayerProfile.objects.filter(user=user).exists():
            return Response({'detail': 'You are already a player.'}, status=400)

        data = request.data
        serializer = BecomePlayerSerializer(data=data)
        if serializer.is_valid():
            PlayerProfile.objects.create(
                user=user,
                team_name=serializer.validated_data['team_name'],
                group=serializer.validated_data['group'],
                profile_photo=serializer.validated_data['profile_photo'],
                is_team_admin=serializer.validated_data.get('is_team_admin', False)
            )
            return Response({'message':'You are now a player.'}, status=201)
        return Response(serializer.errors, status=400)


"""
This is a single login for all users, which will take them to their respective dashboards!
"""
class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email=request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, email=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)

            #We are detecting the role here
            role = "member"  # default fallback

            if hasattr(user, 'club_admin_profile'):
                role = "club_admin"
            elif hasattr(user, 'umpire_profiles'):
                role = "umpire"
            elif user.player_profiles.exists():
                first_profile = user.player_profiles.first()
                if first_profile.is_team_admin:
                    role = "team_admin"
                else:
                    role = "player"


            return Response({
                'refresh': str(refresh),
                'access':str(refresh.access_token),
                'user':{
                    'email':user.email,
                    'fname':user.fname,
                    'sname':user.sname,
                    'role':role,
                }
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    

"""
This allows a user to become a player, note this will only be available to
umpires and club admins
"""
class BecomePlayerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        #This will prevent duplicate player profiles
        if PlayerProfile.objects.filter(user=user).exists():
            return Response({"detail": "You are already registered as a player."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = BecomePlayerSerializer(data=request.data, context={'request': request})
        print("Serializer context keys:", serializer.context.keys())  # <-- should include 'request'
        if serializer.is_valid():
            serializer.save(user=user)
            return Response({"detail": "Successfully registered as a player."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


"""
This view will allow club admins to be able to view all the users
"""
class AllUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not hasattr(user, 'club_admin_profile'):
            return Response({'detail': 'Access denied. You are not a club admin.'}, status=403)

        #This will collect all the users except the requesting club admin
        users = User.objects.exclude(id=user.id)
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data, status=200)


"""
This view is responsible for displaying all the players in the team admins
team!!
"""
class TeamPlayersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            player_profile = PlayerProfile.objects.get(user=user)

            if not player_profile.is_team_admin:
                return Response({"detail":"You are not a team admin."}, status=403)

            team_name = player_profile.team_name
            players = PlayerProfile.objects.filter(team_name=team_name)
            serializer = PlayerProfileSerializer(players, many=True)
            return Response(serializer.data, status=200)

        except PlayerProfile.DoesNotExist:
            return Response({"detail": "Player profile not found"}, status=404)


"""
This view is responsible for allowing the team admin to upload receipts
for each of the players in his team including himself
"""
class UploadReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        player_id = request.data.get('player')
        file = request.FILES.get('file')
        note = request.data.get('note', '')

        try:
            player = User.objects.get(id=player_id)
        except User.DoesNotExist:
            return Response({'error':'Player not found.'}, status=404)

        receipt = Receipt.objects.create(
            player=player,
            uploaded_by = request.user,
            file=file,
            note=note
        )

        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data, status=201)


"""
This view returns a list of unverified receipts to the club admin
"""
class ListUnverifiedReceipts(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if user is club admin
        if not hasattr(request.user, 'club_admin_profile') or request.user.club_admin_profile is None:
            return Response({'error': 'Unauthorized'}, status=403)

        receipts = Receipt.objects.filter(is_verified=False)
        serializer = ReceiptSerializer(receipts, many=True, context={'request': request})
        return Response(serializer.data)


"""
This view is for verifiying the receipts once downloaded
this will then generate a qr code
"""
class VerifyReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, receipt_id):
        try:
            receipt = Receipt.objects.get(id=receipt_id)
        except Receipt.DoesNotExist:
            return Response({'error':'Receipt not found'}, status=404)

        if not hasattr(request.user, 'club_admin_profile'):
            return Response({'error': 'Unauthorized'}, status=403)

        receipt.is_verified = True
        receipt.save()
        receipt.generate_qr_code(for_role='player')

        
        return Response({'message':'Receipt verified and QR code generated'})


"""
To be able to list all the receipts(verified and unverified) this view will'
allow me to do so
"""
class ListAllReceipts(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        receipts = Receipt.objects.all()
        serializer = ReceiptSerializer(receipts, many=True)
        return Response(serializer.data)


"""
This is now responsible for displaying the corresponding qr code for that player
"""
class PlayerQRCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            # Get the latest verified receipt for this player
            receipt = Receipt.objects.filter(
                player=user, 
                is_verified=True
            ).order_by('-uploaded_at').first()
            
            if receipt and receipt.qr_code:
                qr_url = request.build_absolute_uri(receipt.qr_code.url)
                return Response({"qr_code": qr_url})
            return Response({"qr_code": None})
        except Exception as e:
            print(f"Error in PlayerQRCodeView: {str(e)}")
            return Response({"qr_code": None})


"""
This will allow team admins to view their qr codes-----THIS DOESNT NEED TO EXIST!!!
"""
class TeamAdminQRCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            # Get the latest verified receipt uploaded by this team admin
            receipt = Receipt.objects.filter(
                uploaded_by=user, 
                is_verified=True
            ).order_by('-uploaded_at').first()
            
            if receipt and receipt.qr_code:
                qr_url = request.build_absolute_uri(receipt.qr_code.url)
                return Response({"qr_code": qr_url})
            return Response({"qr_code": None})
        except Exception as e:
            print(f"Error in TeamAdminQRCodeView: {str(e)}")
            return Response({"qr_code": None})


"""
This view allows umpires to be able to scan qr codes of the players on the day
"""
class ScanQRCodeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        qr_image = request.FILES.get('qr_code')
        if not qr_image:
            return Response({'error': 'QR code image required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            image = Image.open(qr_image)
            decoded = decode(image)
            if not decoded:
                return Response({'error': 'QR code could not be read'}, status=status.HTTP_400_BAD_REQUEST)

            raw_data = decoded[0].data.decode('utf-8')
            qr_data = json.loads(raw_data.replace("'", '"'))  # Fix malformed JSON

            user_id = qr_data.get('id')  # or use email if id isn't included
            if not user_id:
                return Response({'error': 'User ID not found in QR data'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.get(id=user_id)
            profile = user.player_profiles.first()
            if not profile:
                return Response({'error': 'Player profile not found'}, status=status.HTTP_404_NOT_FOUND)

            profile_photo_url = ''
            if profile.profile_photo and hasattr(profile.profile_photo, 'url'):
                profile_photo_url = request.build_absolute_uri(profile.profile_photo.url)

            return Response({
                'fname': user.fname,
                'sname': user.sname,
                'team_name': profile.team_name,
                'profile_photo_url': profile_photo_url,
                'payment_status': 'Verified'
            })

        except Exception as e:
            return Response({'error': f'Failed to scan QR: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
