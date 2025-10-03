from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

UserModel = get_user_model()

class UsernameOrEmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in with either their username or email.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
        users = UserModel.objects.filter(username=username)
        if not users.exists() and "@" not in username:
            # Try to find by email if username does not contain '@'
            users = UserModel.objects.filter(email=username)
        for user in users:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        return None
