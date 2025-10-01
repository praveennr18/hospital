from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
from decouple import config

from ..models import AppointmentSlot, Appointment
from ..serializers import (
    AppointmentSlotSerializer, AppointmentListSerializer,
    DoctorAppointmentSerializer
)
from accounts.permissions import IsAdminOrDoctor


class AppointmentSlotListCreateView(generics.ListCreateAPIView):
    """
    List available slots or create new slots.
    """
    serializer_class = AppointmentSlotSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrDoctor]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return AppointmentSlot.objects.all().select_related('doctor__user').order_by('date', 'start_time')
        elif user.role == 'doctor':
            from doctors.models import Doctor
            try:
                doctor = Doctor.objects.get(user=user)
                return AppointmentSlot.objects.filter(doctor=doctor).order_by('date', 'start_time')
            except Doctor.DoesNotExist:
                return AppointmentSlot.objects.none()
        
        return AppointmentSlot.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'doctor':
            from doctors.models import Doctor
            try:
                doctor = Doctor.objects.get(user=self.request.user)
                serializer.save(doctor=doctor)
            except Doctor.DoesNotExist:
                raise ValidationError("Doctor profile not found.")
        else:
            # Admin can create slots for any doctor
            serializer.save()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upcoming_appointments(request):
    """
    Get upcoming appointments for the current user.
    """
    user = request.user
    today = timezone.now().date()
    
    if user.role == 'patient':
        from patients.models import PatientProfile
        try:
            patient = PatientProfile.objects.get(user=user)
            appointments = Appointment.objects.filter(
                patient=patient,
                appointment_date__gte=today,
                status__in=['scheduled', 'confirmed']
            ).select_related('doctor__user').order_by('appointment_date', 'appointment_time')
            
            serializer = AppointmentListSerializer(appointments, many=True)
            return Response(serializer.data)
        except PatientProfile.DoesNotExist:
            return Response(
                {"error": "Patient profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    elif user.role == 'doctor':
        from doctors.models import Doctor
        try:
            doctor = Doctor.objects.get(user=user)
            appointments = Appointment.objects.filter(
                doctor=doctor,
                appointment_date__gte=today,
                status__in=['scheduled', 'confirmed']
            ).select_related('patient__user').order_by('appointment_date', 'appointment_time')
            
            serializer = DoctorAppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    else:
        return Response(
            {"error": "Invalid user role for this endpoint."},
            status=status.HTTP_403_FORBIDDEN
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_slots(request):
    """
    Get available appointment slots for a specific doctor and date range.
    """
    doctor_id = request.GET.get('doctor_id')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    if not doctor_id:
        return Response(
            {"error": "doctor_id parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from doctors.models import Doctor
        doctor = Doctor.objects.get(id=doctor_id)
    except Doctor.DoesNotExist:
        return Response(
            {"error": "Doctor not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Parse dates
    try:
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        else:
            start_date = timezone.now().date()
        
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        else:
            default_schedule_days = config('DEFAULT_SCHEDULE_DAYS', default=7, cast=int)
            end_date = start_date + timedelta(days=default_schedule_days)  # Default configurable period
    except ValueError:
        return Response(
            {"error": "Invalid date format. Use YYYY-MM-DD."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get available slots
    slots = AppointmentSlot.objects.filter(
        doctor=doctor,
        date__range=[start_date, end_date],
        is_available=True
    ).exclude(
        is_fully_booked=True
    ).order_by('date', 'start_time')
    
    serializer = AppointmentSlotSerializer(slots, many=True)
    return Response({
        'doctor': f"Dr. {doctor.user.get_full_name()}",
        'date_range': {
            'start': start_date.strftime('%Y-%m-%d'),
            'end': end_date.strftime('%Y-%m-%d')
        },
        'available_slots': serializer.data
    })