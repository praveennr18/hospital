from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound

from ..models import AppointmentReminder, Appointment
from ..serializers import AppointmentReminderSerializer
from accounts.permissions import IsAdminOrDoctor


class AppointmentReminderListCreateView(generics.ListCreateAPIView):
    """
    List or create appointment reminders.
    """
    serializer_class = AppointmentReminderSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrDoctor]
    
    def get_queryset(self):
        appointment_id = self.kwargs.get('appointment_id')
        return AppointmentReminder.objects.filter(appointment_id=appointment_id).order_by('-created_at')
    
    def perform_create(self, serializer):
        appointment_id = self.kwargs.get('appointment_id')
        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            raise NotFound("Appointment not found.")
        
        # Check if user has permission to create reminders for this appointment
        user = self.request.user
        if user.role == 'doctor':
            from doctors.models import Doctor
            try:
                doctor = Doctor.objects.get(user=user)
                if appointment.doctor != doctor:
                    raise permissions.PermissionDenied("You can only create reminders for your own appointments.")
            except Doctor.DoesNotExist:
                raise permissions.PermissionDenied("Doctor profile not found.")
        
        serializer.save(appointment=appointment)


class AppointmentReminderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an appointment reminder.
    """
    queryset = AppointmentReminder.objects.all()
    serializer_class = AppointmentReminderSerializer
    permission_classes = [IsAdminOrDoctor]