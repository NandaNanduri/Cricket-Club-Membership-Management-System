from django.db import models
from django.core.files.base import ContentFile
import qrcode
from io import BytesIO
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

"""
@Author:Nanda Nanduri
This is a CustomUserManager to handle user creation
"""
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required!")
        email=self.normalize_email(email)
        user=self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def get_by_natural_key(self, email):  # 👈 ADD THIS
        return self.get(email=email.lower())


"""
Read this 
Base User model for authentication
These are the common fields for all the users, that is
Umpire, Player, Member, Club admin, Team captain will all have these when
registering!

"""
class User(AbstractBaseUser):
    #Required fields for user authentication
    email=models.EmailField(unique=True)
    password=models.CharField(max_length=128)

    #Personal Information fields
    fname=models.CharField(max_length=50)
    sname=models.CharField(max_length=50)
    id_num = models.CharField(max_length=50, unique=True)

    #Optional peronal details
    contact=models.CharField(max_length=20, blank=True)
    dob = models.DateTimeField(null=True, blank=True)
    postal_add = models.CharField(max_length=100, blank=True)
    residential_add = models.CharField(max_length=100, blank=True)
    nationality = models.CharField(max_length=50, blank=True, null=True)

    USERNAME_FIELD = 'email'#Field used for authentication
    REQUIRED_FIELDS = ['fname', 'sname', 'role', 'id_num']#Additional required fields

    objects = CustomUserManager()


"""
This is now for the club admin who is essentially the admin responsible
for managing everyone.
The Club admin is responsible for sending links, downloading receipts, approving
This will be given to about 3 users, so that if one user leaves another user can
be able to login.
Need to make sure that this properly organised
"""
class ClubAdmin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='club_admin_profile')
    admin_level = models.CharField(max_length=50, blank=True, null=True)


"""
This can be a regualr player or a team captain
Remember player play games. Team captains also play, they are players who
upload receipts for each player in their team
"""
class PlayerProfile(models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_profiles')

    TEAM_CHOICES = (
        ('Thunder Cats', 'Thunder Cats'),
        ('Black Mambas 1', 'Black Mambas 1'),
        ('Forvis Mazars A', 'Forvis Mazars A'),
        ('Motozone', 'Motozone'),
        ('Lobatse Cricket Club', 'Lobatse Cricket Club'),
        ('Pioneers', 'Pioneers'),
        ('United Gymkhana', 'United Gymkhana'),
        ('All Stars', 'All Stars'),
        ('SH Tyre City', 'SH Tyre City'),
        ('Gujarat Strikers B', 'Gujarat Strikers B'),
        ('Phoenix', 'Phoenix'),
        ('Ceylon Cricket Club', 'Ceylon Cricket Club'),
        ('DJ Devils', 'DJ Devils'),
        ('BD Cricket Club', 'BD Cricket Club'),
        ('SKY XI', 'SKY XI'),
        ('Cubs XI', 'Cubs XI'),
        ('Nawabz Boys', 'Nawabz Boys'),
        ('Auto World', 'Auto World'),
        ('FD Titans', 'FD Titans'),
        ('Pulse Cricket Stallion', 'Pulse Cricket Stallion'),
        ('Elite Sports', 'Elite Sports'),
        ('Excel Strikers', 'Excel Strikers'),
        ('PWC', 'PWC'),
        ('Black Mambas 2', 'Black Mambas 2'),
        ('Moremi Kings (Chennai)', 'Moremi Kings (Chennai)'),
        ('Forvis Mazars Juniors', 'Forvis Mazars Juniors'),
        ('Sefalana', 'Sefalana'),
        ('Friends', 'Friends'),
        ('A-One', 'A-One'),
        ('Cheetas', 'Cheetas'),
    )

    team_name = models.CharField(max_length=100, choices=TEAM_CHOICES, blank=True)

    is_team_admin = models.BooleanField(default=False)##This will differentiate team admin from a player
    profile_photo= models.ImageField(upload_to='profile_photos/', null=True, blank=False)
    GROUP_CHOICES = (
        ('A', 'GROUP A'),
        ('B', 'GROUP B'),
        ('C', 'GROUP C'),
        ('D', 'GROUP D'),
    )
    group = models.CharField(max_length=1, choices=GROUP_CHOICES, blank=True, null=True)


"""
This is for a member, a member is someone who uses the facilities of GCC
But doesn't play any games! IDK why they do that, why not just play cricket?
This will only be available to members
"""
class MemberProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='member_profile')
    #Feel free to add more


"""
This is the Umpire, essentially the person who supervises the games, and ensures
play if fair. An umpire can also be a player or a team admin
"""
class UmpireProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='umpire_profiles')
    umpire_certification_id = models.CharField(max_length=50, blank=True, null=True)
    #Additional umpire-specific fields


"""
This is a receipt model, remmeber that team captains upload receipts for each player
Therefore we will need a receipt model
"""
class Receipt(models.Model):
    player=models.ForeignKey(User, on_delete=models.CASCADE, related_name='receipts')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_receipts')
    file = models.FileField(upload_to='receipts/')
    note = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    qr_code = models.ImageField(upload_to='qr_codes/', null=True, blank=True)

    def generate_qr_code(self, for_role='player'):
        if for_role == 'player':
            user = self.player
        elif for_role == 'team_admin':
            user = self.uploaded_by
        else:
            raise ValueError("Invalid role. Choose player or team admin")

        profile = user.player_profiles.first()
        data = {
            'id': user.id,
            'name': f"{user.fname} {user.sname}",
            'team_name': getattr(profile, 'team_name', 'N/A'),
            'profile_photo_url': profile.profile_photo.url if profile and profile.profile_photo else 'N/A',
        }
        qr = qrcode.make(str(data))
        buffer = BytesIO()
        qr.save(buffer, format='PNG')
        filename = f"qr_{user.id}_{self.id}.png"
        self.qr_code.save(filename, ContentFile(buffer.getvalue()), save=False)
        self.save()


    def __str__(self):
        return f"Receipt for {self.player.fname} {self.player.sname} uploaded_by {self.uploaded_by.fname}"
