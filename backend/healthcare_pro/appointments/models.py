from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
import uuid


class Appointment(models.Model):
    """Appointment model for patient-doctor bookings."""
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
        ('rescheduled', 'Rescheduled'),
    ]
    
    APPOINTMENT_TYPE_CHOICES = [
        ('consultation', 'Consultation'),
        ('follow_up', 'Follow-up'),
        ('check_up', 'Check-up'),
        ('emergency', 'Emergency'),
        ('procedure', 'Procedure'),
        ('therapy', 'Therapy'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey('patients.PatientProfile', on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey('doctors.Doctor', on_delete=models.CASCADE, related_name='appointments')
    
    # Appointment details
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    duration = models.PositiveIntegerField(default=30, help_text="Duration in minutes")
    appointment_type = models.CharField(max_length=20, choices=APPOINTMENT_TYPE_CHOICES, default='consultation')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Additional information
    chief_complaint = models.TextField(help_text="Primary reason for visit")
    reason = models.TextField(blank=True, null=True, help_text="Reason for visit (patient provided)")
    notes = models.TextField(blank=True, null=True, help_text="Additional notes from patient")
    doctor_notes = models.TextField(blank=True, null=True, help_text="Doctor's notes after appointment")
    
    # Booking details
    confirmation_code = models.CharField(max_length=20, blank=True, null=True, unique=True)
    
    # Cancellation/Rescheduling
    cancellation_reason = models.TextField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    reschedule_reason = models.TextField(blank=True, null=True)
    rescheduled_at = models.DateTimeField(blank=True, null=True)
    
    # Fees
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_paid = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'appointments'
        verbose_name = 'Appointment'
        verbose_name_plural = 'Appointments'
        ordering = ['appointment_date', 'appointment_time']
        unique_together = ['doctor', 'appointment_date', 'appointment_time']
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - Dr. {self.doctor.user.get_full_name()} ({self.appointment_date} {self.appointment_time})"
    
    def clean(self):
        """Validate appointment data."""
        # Check if appointment is in the future
        appointment_datetime = datetime.combine(self.appointment_date, self.appointment_time)
        if appointment_datetime <= timezone.now():
            raise ValidationError("Appointment must be scheduled for a future date and time.")
        
        # Check if doctor is available at this time
        if hasattr(self, 'doctor') and self.doctor:
            day_of_week = self.appointment_date.weekday()
            from doctors.models import Availability
            doctor_schedule = Availability.objects.filter(
                doctor=self.doctor,
                day=day_of_week,
                start_time__lte=self.appointment_time,
                end_time__gte=self.appointment_time,
                is_available=True
            )
            if not doctor_schedule.exists():
                raise ValidationError("Doctor is not available at this time.")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        
        # Set consultation fee from doctor's profile if not set
        if not self.consultation_fee and hasattr(self, 'doctor'):
            self.consultation_fee = self.doctor.consultation_fee
        
        super().save(*args, **kwargs)
    
    @property
    def appointment_datetime(self):
        """Return combined datetime for the appointment."""
        return datetime.combine(self.appointment_date, self.appointment_time)
    
    @property
    def end_time(self):
        """Calculate end time based on duration."""
        start_datetime = self.appointment_datetime
        end_datetime = start_datetime + timedelta(minutes=self.duration)
        return end_datetime.time()
    
    @property
    def is_past(self):
        """Check if appointment is in the past."""
        return self.appointment_datetime <= timezone.now()
    
    @property
    def can_be_cancelled(self):
        """Check if appointment can be cancelled (at least 24 hours before)."""
        if self.status in ['completed', 'cancelled', 'no_show']:
            return False
        
        time_until_appointment = self.appointment_datetime - timezone.now()
        return time_until_appointment > timedelta(hours=24)


class AppointmentSlot(models.Model):
    """Available time slots for appointments."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey('doctors.Doctor', on_delete=models.CASCADE, related_name='available_slots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    max_appointments = models.PositiveIntegerField(default=1, help_text="Maximum appointments for this slot")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'appointment_slots'
        verbose_name = 'Appointment Slot'
        verbose_name_plural = 'Appointment Slots'
        unique_together = ['doctor', 'date', 'start_time']
        ordering = ['date', 'start_time']
    
    def __str__(self):
        return f"Dr. {self.doctor.user.get_full_name()} - {self.date} {self.start_time}-{self.end_time}"
    
    @property
    def current_appointments(self):
        """Get count of current appointments for this slot."""
        return Appointment.objects.filter(
            doctor=self.doctor,
            appointment_date=self.date,
            appointment_time=self.start_time,
            status__in=['scheduled', 'confirmed', 'in_progress']
        ).count()
    
    @property
    def is_fully_booked(self):
        """Check if slot is fully booked."""
        return self.current_appointments >= self.max_appointments


class AppointmentReminder(models.Model):
    """Reminders for appointments."""
    
    REMINDER_TYPE_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='reminders')
    reminder_type = models.CharField(max_length=10, choices=REMINDER_TYPE_CHOICES)
    reminder_time = models.DateTimeField(help_text="When to send the reminder")
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'appointment_reminders'
        verbose_name = 'Appointment Reminder'
        verbose_name_plural = 'Appointment Reminders'
        ordering = ['reminder_time']
    
    def __str__(self):
        return f"Reminder for {self.appointment} - {self.get_reminder_type_display()}"