from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

"""
@Author: Nanda Nanduri
ADD YOUR NAMES AND SURNAMES HERE

Description: Custom authentication backend that allows users to log in with their email address
instead of username
"""

#Get the custom User model defined in models.py
User = get_user_model()

class EmailBackend(ModelBackend):
    """
    Custom authentication backend that authenticates users using their email address
    instead of the default username authentication.
    
    Inherits from Django's ModelBackend which provides the basic authentication logic.
    """
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None
