from rest_framework import generics, status, permissions
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model

from ..models import PatientProfile
from ..serializers import (
    PatientProfileSerializer, PatientProfileCreateSerializer, 
    PatientProfileUpdateSerializer, PatientProfileListSerializer
)

User = get_user_model()


class PatientListCreateView(generics.ListCreateAPIView):
    """
    List all patients or create a new patient.
    Admin and doctors can view all patients.
    Only admin can create new patients.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return PatientProfile.objects.all().select_related('user').order_by('-created_at')
        elif user.role == 'doctor':
            return PatientProfile.objects.all().select_related('user').order_by('-created_at')
        else:
            # Patients can only see their own profile
            try:
                return PatientProfile.objects.filter(user=user).select_related('user')
            except PatientProfile.DoesNotExist:
                return PatientProfile.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PatientProfileCreateSerializer
        return PatientProfileListSerializer
    
    def perform_create(self, serializer):
        # Only admin can create new patients
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Only admin users can create new patients.")
        
        # User should already exist, get user by email
        email = serializer.validated_data.pop('email', None)
        if email:
            try:
                user = User.objects.get(email=email, role='patient')
            except User.DoesNotExist:
                raise ValidationError("Patient user not found. Please create user account first through admin panel.")
        else:
            # If no email provided, use current user (if they're a patient)
            if self.request.user.role == 'patient':
                user = self.request.user
            else:
                raise ValidationError("Email is required to create patient profile.")
        
        # Remove user fields from serializer data
        serializer.validated_data.pop('first_name', None)
        serializer.validated_data.pop('last_name', None)
        
        # Create patient profile
        serializer.save(user=user)


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a patient.
    Patients can only access their own profile.
    Doctors and admin can access any patient profile.
    """
    queryset = PatientProfile.objects.all().select_related('user')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PatientProfileUpdateSerializer
        return PatientProfileSerializer
    
    def get_object(self):
        """
        Override to ensure patients can only access their own profile.
        """
        obj = super().get_object()
        user = self.request.user
        
        if user.role == 'patient' and obj.user != user:
            raise permissions.PermissionDenied("You can only access your own profile.")
        elif user.role in ['admin', 'doctor']:
            return obj
        else:
            raise permissions.PermissionDenied("You don't have permission to access this resource.")
        
        return obj
    
    def perform_destroy(self, instance):
        # Only admin can delete patients
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Only admin users can delete patients.")
        
        # Delete the associated user as well
        user = instance.user
        instance.delete()
        user.delete()