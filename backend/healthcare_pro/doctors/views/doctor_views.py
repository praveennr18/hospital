from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from django.db.models import Q

from ..models import Doctor
from ..serializers import (
    DoctorSerializer,
    DoctorCreateSerializer,
    DoctorUpdateSerializer,
    DoctorListSerializer
)
from accounts.permissions import IsDoctor, IsDoctorOrAdmin
from accounts.models import User


class DoctorListCreateView(generics.ListCreateAPIView):
    """List all doctors or create a new doctor."""
    
    queryset = Doctor.objects.filter(is_available=True)
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['specialization', 'department', 'is_available', 'gender']
    search_fields = ['user__first_name', 'user__last_name', 'specialization', 'department']
    ordering_fields = ['years_of_experience', 'consultation_fee', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DoctorCreateSerializer
        return DoctorListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by specialization
        specialization = self.request.query_params.get('specialization', None)
        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)
        
        # Filter by city
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Filter by consultation fee range
        max_fee = self.request.query_params.get('max_fee', None)
        if max_fee:
            try:
                max_fee = float(max_fee)
                queryset = queryset.filter(consultation_fee__lte=max_fee)
            except ValueError:
                pass
        
        return queryset.distinct()
    
    def perform_create(self, serializer):
        # Only admin can create doctors
        if not self.request.user.role == 'admin':
            raise permissions.PermissionDenied("Only admin can create doctor profiles.")
        
        # User should already exist, get user by email
        email = serializer.validated_data.pop('email', None)
        if email:
            try:
                user = User.objects.get(email=email, role='doctor')
            except User.DoesNotExist:
                raise ValidationError("Doctor user not found. Please create user account first through admin panel.")
        else:
            # If no email provided, use current user (if they're a doctor)
            if self.request.user.role == 'doctor':
                user = self.request.user
            else:
                raise ValidationError("Email is required to create doctor profile.")
        
        # Remove user fields from serializer data
        serializer.validated_data.pop('first_name', None)
        serializer.validated_data.pop('last_name', None)
        
        # Create doctor profile
        serializer.save(user=user)


class DoctorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a doctor."""
    
    queryset = Doctor.objects.all()
    permission_classes = [IsDoctorOrAdmin]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DoctorUpdateSerializer
        return DoctorSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_doctors(request):
    """Search doctors by various criteria."""
    query = request.GET.get('q', '')
    specialization = request.GET.get('specialization', '')
    city = request.GET.get('city', '')
    
    doctors = Doctor.objects.filter(is_available=True)
    
    if query:
        doctors = doctors.filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(specialization__icontains=query) |
            Q(department__icontains=query)
        )
    
    if specialization:
        doctors = doctors.filter(specialization__icontains=specialization)
    
    if city:
        doctors = doctors.filter(city__icontains=city)
    
    doctors = doctors.distinct().order_by('-years_of_experience')[:20]  # Limit to 20 results
    
    serializer = DoctorListSerializer(doctors, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def specializations_list(request):
    """Get list of all specializations."""
    specializations = [choice[0] for choice in Doctor.SPECIALIZATION_CHOICES]
    return Response(specializations)