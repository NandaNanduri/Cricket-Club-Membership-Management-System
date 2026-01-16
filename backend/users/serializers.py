"""
Purpose of the serializer's is that it connects the backend code to the frontend code
"""
from rest_framework import serializers
from .models import User, PlayerProfile, ClubAdmin, UmpireProfile, MemberProfile, Receipt


"""
This is used as a base to validate and create the core User instance
"""
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'fname', 'sname', 'id_num', 'contact', 'dob', 'postal_add', 'residential_add', 'nationality']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


"""
Includes fields from both User and PlayerProfile
"""
class PlayerRegisterSerializer(UserSerializer):
    team_name = serializers.ChoiceField(choices=PlayerProfile.TEAM_CHOICES)
    group = serializers.ChoiceField(choices=PlayerProfile.GROUP_CHOICES)
    profile_photo = serializers.ImageField()

    class Meta(UserSerializer.Meta):  # Inherit User fields
        fields = UserSerializer.Meta.fields + ['team_name', 'group', 'profile_photo']

    def create(self, validated_data):
        team_name = validated_data.pop('team_name')
        group = validated_data.pop('group')
        profile_photo = validated_data.pop('profile_photo')

        user = super().create(validated_data)

        PlayerProfile.objects.create(
            user=user,
            team_name=team_name,
            group=group,
            profile_photo=profile_photo,
            is_team_admin=False
        )

        return user



"""
Same as player, but is_team_admin is true now
"""
class TeamAdminRegisterSerializer(PlayerRegisterSerializer):
    def create(self, validated_data):
        user = super().create(validated_data)
        player_profiles = user.player_profiles.first()
        player_profiles .is_team_admin = True
        player_profiles.save()
        return user


"""
This will only create a user + ClubAdmin profile
"""
class ClubAdminRegisterSerializer(UserSerializer):
    def create(self, validated_data):
        user = super().create(validated_data)
        ClubAdmin.objects.create(user=user)
        return user


"""
This one is simple it uses the UmpireProfile model
"""
class UmpireRegisterSerializer(UserSerializer):
    umpire_certification_id = serializers.CharField(required=False)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['umpire_certification_id']

    def create(self, validated_data):
        cert_id = validated_data.pop('umpire_certification_id', None)
        user = super().create(validated_data)
        UmpireProfile.objects.create(user=user, umpire_certification_id=cert_id)
        return user


"""
This registers a basic user and a MemberProfile
"""
class MemberRegisterSerializer(UserSerializer):
    def create(self, validated_data):
        user = super().create(validated_data)
        MemberProfile.objects.create(user=user)
        return user


"""
So I am adding a becomeplayerserializer, what this does is essentially allows either a club admin or
umpire to become a player or team admin. So basically u dont need to register again, this prevents
from entering email and id_num again
"""
class BecomePlayerSerializer(serializers.Serializer):
    team_name = serializers.CharField()
    group = serializers.ChoiceField(choices=PlayerProfile.GROUP_CHOICES)
    profile_photo = serializers.ImageField()
    is_team_admin = serializers.BooleanField(required=False)

    def validate(self, data):
        request = self.context.get('request')
        if not request:
            raise serializers.ValidationError("Serializer missing 'request' in context")
        user = request.user
        if PlayerProfile.objects.filter(user=user).exists():
            raise serializers.ValidationError("User already has a Player profile.")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        return PlayerProfile.objects.create(
            user=user,
            team_name=validated_data['team_name'],
            group=validated_data['group'],
            profile_photo=validated_data['profile_photo'],
            is_team_admin=validated_data.get('is_team_admin', False)
        )

"""
This serializer is now responsible for displaying all the users in the club
admin dashboard
"""
class UserListSerializer(serializers.Serializer):
    fname = serializers.CharField()
    sname = serializers.CharField()
    id_num = serializers.CharField()
    contact = serializers.CharField()
    dob = serializers.DateTimeField()
    postal_add = serializers.CharField()
    residential_add = serializers.CharField()
    nationality = serializers.CharField()
    role = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()

    def get_role(self, user):
        if hasattr(user, 'club_admin_profile')and user.club_admin_profile is not None:
            return 'club_admin'
        elif hasattr(user, 'umpire_profiles') and user.umpire_profiles is not None:
            return 'umpire'
        elif user.player_profiles.exists():
            first_profiles = user.player_profiles.first()
            return 'team_admin' if first_profiles.is_team_admin else 'player'
        elif hasattr(user, 'member_profile') and user.member_profile is not None:
            return 'member'
        return 'unknown'

    def get_team_name(self, user):
        if user.player_profiles.exists():
            return user.player_profiles.first().team_name
        return None


"""
Im adding a playerprofileserializer so that I can send this information to the frontend
to be able to display all the player(including the team admin) on the team admins dashboard.
"""
class PlayerProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id')
    fname = serializers.CharField(source='user.fname')
    sname = serializers.CharField(source='user.sname')
    id_num = serializers.CharField(source='user.id_num')
    contact = serializers.CharField(source='user.contact')
    dob = serializers.DateTimeField(source='user.dob')
    nationality = serializers.CharField(source='user.nationality')

    class Meta:
        model = PlayerProfile
        fields = [
            'id',
            'fname', 'sname', 'id_num', 'contact', 'dob', 
            'nationality', 'team_name', 'group', 'is_team_admin', 'profile_photo'
        ]


"""
This is responsible for handling the receipts information
"""
class ReceiptSerializer(serializers.ModelSerializer):
    player_name = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = Receipt
        fields = [
            'id', 'player', 'uploaded_by', 'file', 'note',
            'is_verified', 'uploaded_at', 'qr_code', 
            'player_name', 'uploaded_by_name',
            'team_name', 'group', 'qr_code_url'
        ]

    def get_player_name(self, obj):
        return f"{obj.player.fname} {obj.player.sname}"

    def get_uploaded_by_name(self, obj):
        return f"{obj.uploaded_by.fname} {obj.uploaded_by.sname}"

    def get_team_name(self, obj):
        profile = obj.player.player_profiles.first()
        return profile.team_name if profile else None

    def get_group(self, obj):
        profile = obj.player.player_profiles.first()
        return profile.group if profile else None
    
    def get_qr_code_url(self, obj):
        request = self.context.get('request')
        if obj.qr_code and hasattr(obj.qr_code, 'url'):
            if request:
                return request.build_absolute_uri(obj.qr_code.url)
            return obj.qr_code.url
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')

        if instance.file and hasattr(instance.file, 'url'):
            if request:
                representation['file'] = request.build_absolute_uri(instance.file.url)
            else:
                representation['file'] = instance.file.url
        else:
            representation['file'] = None

        return representation

