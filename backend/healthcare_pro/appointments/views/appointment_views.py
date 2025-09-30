from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from ..models import Appointment
from ..serializers import (
    AppointmentSerializer, AppointmentCreateSerializer, 
    AppointmentUpdateSerializer, AppointmentListSerializer,
    DoctorAppointmentSerializer
)


class AppointmentListCreateView(generics.ListCreateAPIView):
    """
    List all appointments or create a new appointment.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Appointment.objects.all().select_related('patient__user', 'doctor__user').order_by('-appointment_date', '-appointment_time')
        elif user.role == 'doctor':
            from doctors.models import Doctor
            try:
                doctor = Doctor.objects.get(user=user)
                return Appointment.objects.filter(doctor=doctor).select_related('patient__user').order_by('-appointment_date', '-appointment_time')
            except Doctor.DoesNotExist:
                return Appointment.objects.none()
        elif user.role == 'patient':
            from patients.models import PatientProfile
            try:
                patient = PatientProfile.objects.get(user=user)
                return Appointment.objects.filter(patient=patient).select_related('doctor__user').order_by('-appointment_date', '-appointment_time')
            except PatientProfile.DoesNotExist:
                return Appointment.objects.none()
        
        return Appointment.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AppointmentCreateSerializer
        return AppointmentListSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        
        if user.role == 'patient':
            # Patient creating appointment for themselves
            from patients.models import PatientProfile
            try:
                patient = PatientProfile.objects.get(user=user)
                serializer.save(patient=patient)
            except PatientProfile.DoesNotExist:
                raise ValidationError("Patient profile not found.")
        
        elif user.role == 'doctor':
            # Doctor creating appointment (requires patient to be specified)
            serializer.save()
        
        elif user.role == 'admin':
            # Admin can create appointments for any patient/doctor combination
            serializer.save()
        
        else:
            raise permissions.PermissionDenied("You don't have permission to create appointments.")


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an appointment.
    """
    queryset = Appointment.objects.all().select_related('patient__user', 'doctor__user')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AppointmentUpdateSerializer
        return AppointmentSerializer
    
    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        
        # Check permissions
        if user.role == 'admin':
            return obj
        elif user.role == 'doctor':
            from doctors.models import Doctor
            try:
                doctor = Doctor.objects.get(user=user)
                if obj.doctor != doctor:
                    raise permissions.PermissionDenied("You can only access your own appointments.")
            except Doctor.DoesNotExist:
                raise permissions.PermissionDenied("Doctor profile not found.")
        elif user.role == 'patient':
            from patients.models import PatientProfile
            try:
                patient = PatientProfile.objects.get(user=user)
                if obj.patient != patient:
                    raise permissions.PermissionDenied("You can only access your own appointments.")
            except PatientProfile.DoesNotExist:
                raise permissions.PermissionDenied("Patient profile not found.")
        else:
            raise permissions.PermissionDenied("You don't have permission to access this appointment.")
        
        return obj
    
    def perform_destroy(self, instance):
        # Only allow cancellation, not deletion
        if instance.can_be_cancelled:
            instance.status = 'cancelled'
            instance.save()
        else:
            raise permissions.PermissionDenied("This appointment cannot be cancelled.")


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_appointments(request):
    """
    Get current user's appointments.
    """
    user = request.user
    
    if user.role == 'patient':
        from patients.models import PatientProfile
        try:
            patient = PatientProfile.objects.get(user=user)
            appointments = Appointment.objects.filter(
                patient=patient
            ).select_related('doctor__user').order_by('-appointment_date', '-appointment_time')
            
            serializer = AppointmentListSerializer(appointments, many=True)
            return Response({
                'appointments': serializer.data,
                'user_type': 'patient'
            })
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
                doctor=doctor
            ).select_related('patient__user').order_by('-appointment_date', '-appointment_time')
            
            serializer = DoctorAppointmentSerializer(appointments, many=True)
            return Response({
                'appointments': serializer.data,
                'user_type': 'doctor'
            })
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