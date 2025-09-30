from rest_framework import generics, permissions

from ..models import User
from ..serializers import UserSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    """User profile view - get and update user profile."""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user