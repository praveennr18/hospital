from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound

from ..models import Doctor, Availability
from ..serializers import (
    DoctorSerializer,
    DoctorUpdateSerializer,
    AvailabilitySerializer
)
from accounts.permissions import IsDoctor, IsDoctorOrAdmin
from django.shortcuts import get_object_or_404
from rest_framework import permissions


class MyDoctorProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user's doctor profile."""
    
    permission_classes = [IsDoctor]
    
    def get_object(self):
        try:
            return Doctor.objects.get(user=self.request.user)
        except Doctor.DoesNotExist:
            raise NotFound("Doctor profile not found.")
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DoctorUpdateSerializer
        return DoctorSerializer


@api_view(['GET'])
@permission_classes([IsDoctor])
def my_statistics(request):
    """Get statistics for the current doctor."""
    try:
        doctor = Doctor.objects.get(user=request.user)
        
        # Calculate various statistics
        total_appointments = 0  # Will be implemented with appointments app
        
        return Response({
            'doctor_id': doctor.doctor_id,
            'total_appointments': total_appointments,
            'years_of_experience': doctor.years_of_experience,
            'specialization': doctor.specialization,
            'consultation_fee': doctor.consultation_fee,
            'is_available': doctor.is_available,
        })
    except Doctor.DoesNotExist:
        return Response({
            'error': 'Doctor profile not found.'
        }, status=status.HTTP_404_NOT_FOUND)


class DoctorAvailabilityView(generics.ListCreateAPIView):
    """List or create doctor availability."""
    
    serializer_class = AvailabilitySerializer
    permission_classes = [IsDoctorOrAdmin]
    
    def get_queryset(self):
        doctor_id = self.kwargs.get('doctor_id')
        return Availability.objects.filter(doctor_id=doctor_id)
    
    def perform_create(self, serializer):
        doctor_id = self.kwargs.get('doctor_id')
        doctor = get_object_or_404(Doctor, id=doctor_id)
        
        # Check if current user is the doctor or admin
        if self.request.user.role != 'admin' and doctor.user != self.request.user:
            raise permissions.PermissionDenied("You can only manage your own availability.")
        
        serializer.save(doctor=doctor)


class AvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete availability."""
    
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [IsDoctorOrAdmin]
    
    def get_object(self):
        obj = super().get_object()
        
        # Check if current user is the doctor or admin
        if self.request.user.role != 'admin' and obj.doctor.user != self.request.user:
            raise permissions.PermissionDenied("You can only manage your own availability.")
        
        return obj