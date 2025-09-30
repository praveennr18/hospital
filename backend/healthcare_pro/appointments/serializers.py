from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Appointment, AppointmentSlot, AppointmentReminder
from patients.serializers import PatientProfileListSerializer
from doctors.serializers import DoctorListSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for Appointment model."""
    
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    appointment_datetime = serializers.ReadOnlyField()
    end_time = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    can_be_cancelled = serializers.ReadOnlyField()
    patient = PatientProfileListSerializer(read_only=True)
    doctor = DoctorListSerializer(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'patient_name', 'doctor_name',
            'appointment_date', 'appointment_time', 'appointment_datetime',
            'end_time', 'duration', 'appointment_type', 'status',
            'chief_complaint', 'notes', 'doctor_notes', 
            'consultation_fee', 'is_paid', 'is_past', 'can_be_cancelled',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name()}"


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments."""
    
    class Meta:
        model = Appointment
        fields = [
            'patient', 'doctor', 'appointment_date', 'appointment_time',
            'duration', 'appointment_type', 'chief_complaint', 'notes'
        ]
    
    def validate(self, data):
        """Validate appointment data."""
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        doctor = data.get('doctor')
        
        # Check if appointment is in the future
        appointment_datetime = datetime.combine(appointment_date, appointment_time)
        if appointment_datetime <= timezone.now():
            raise serializers.ValidationError("Appointment must be scheduled for a future date and time.")
        
        # Check if doctor is available
        if doctor:
            day_of_week = appointment_date.weekday()
            from doctors.models import Availability
            doctor_schedule = Availability.objects.filter(
                doctor=doctor,
                day=day_of_week,
                start_time__lte=appointment_time,
                end_time__gte=appointment_time,
                is_available=True
            )
            if not doctor_schedule.exists():
                raise serializers.ValidationError("Doctor is not available at this time.")
            
            # Check for conflicting appointments
            conflicting_appointments = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                status__in=['scheduled', 'confirmed', 'in_progress']
            )
            if conflicting_appointments.exists():
                raise serializers.ValidationError("Doctor already has an appointment at this time.")
        
        return data


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating appointments."""
    
    class Meta:
        model = Appointment
        fields = [
            'appointment_date', 'appointment_time', 'duration',
            'appointment_type', 'status', 'chief_complaint',
            'notes', 'doctor_notes', 'is_paid'
        ]
    
    def validate_status(self, value):
        """Validate status transitions."""
        if self.instance:
            current_status = self.instance.status
            
            # Define allowed status transitions
            allowed_transitions = {
                'scheduled': ['confirmed', 'cancelled'],
                'confirmed': ['in_progress', 'cancelled', 'no_show'],
                'in_progress': ['completed'],
                'completed': [],  # No transitions from completed
                'cancelled': ['scheduled'],  # Allow rescheduling
                'no_show': [],  # No transitions from no_show
            }
            
            if value not in allowed_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot change status from {current_status} to {value}."
                )
        
        return value


class AppointmentSlotSerializer(serializers.ModelSerializer):
    """Serializer for AppointmentSlot model."""
    
    doctor_name = serializers.SerializerMethodField()
    current_appointments = serializers.ReadOnlyField()
    is_fully_booked = serializers.ReadOnlyField()
    
    class Meta:
        model = AppointmentSlot
        fields = [
            'id', 'doctor', 'doctor_name', 'date', 'start_time', 'end_time',
            'is_available', 'max_appointments', 'current_appointments',
            'is_fully_booked', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name()


class AppointmentListSerializer(serializers.ModelSerializer):
    """Serializer for listing appointments."""
    
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    appointment_datetime = serializers.ReadOnlyField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient_name', 'doctor_name', 'appointment_date',
            'appointment_time', 'appointment_datetime', 'duration',
            'appointment_type', 'status', 'chief_complaint',
            'consultation_fee', 'is_paid', 'created_at'
        ]
    
    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name()}"


class DoctorAppointmentSerializer(serializers.ModelSerializer):
    """Serializer for doctor's appointment view."""
    
    patient_name = serializers.SerializerMethodField()
    patient_phone = serializers.SerializerMethodField()
    patient_email = serializers.SerializerMethodField()
    appointment_datetime = serializers.ReadOnlyField()
    end_time = serializers.ReadOnlyField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient_name', 'patient_phone', 'patient_email',
            'appointment_date', 'appointment_time', 'appointment_datetime',
            'end_time', 'duration', 'appointment_type', 'status',
            'chief_complaint', 'notes', 'doctor_notes', 
            'consultation_fee', 'is_paid', 'created_at'
        ]
    
    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()
    
    def get_patient_phone(self, obj):
        return getattr(obj.patient, 'phone_number', '')
    
    def get_patient_email(self, obj):
        return obj.patient.user.email


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer for available time slots."""
    
    date = serializers.DateField()
    time = serializers.TimeField()
    is_available = serializers.BooleanField()


class AppointmentReminderSerializer(serializers.ModelSerializer):
    """Serializer for AppointmentReminder model."""
    
    appointment_info = serializers.SerializerMethodField()
    
    class Meta:
        model = AppointmentReminder
        fields = [
            'id', 'appointment', 'appointment_info', 'reminder_type',
            'reminder_time', 'is_sent', 'sent_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_sent', 'sent_at', 'created_at', 'updated_at']
    
    def get_appointment_info(self, obj):
        return f"{obj.appointment.patient.user.get_full_name()} - {obj.appointment.appointment_date}"


class AppointmentStatsSerializer(serializers.Serializer):
    """Serializer for appointment statistics."""
    
    total_appointments = serializers.IntegerField()
    scheduled = serializers.IntegerField()
    confirmed = serializers.IntegerField()
    completed = serializers.IntegerField()
    cancelled = serializers.IntegerField()
    upcoming_today = serializers.IntegerField()
    upcoming_week = serializers.IntegerField()