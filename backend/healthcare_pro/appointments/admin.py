from django.contrib import admin
from .models import Appointment, AppointmentSlot, AppointmentReminder


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """Admin configuration for Appointment model."""
    
    list_display = (
        'get_patient_name', 'get_doctor_name', 'appointment_date',
        'appointment_time', 'appointment_type', 'status', 'is_paid'
    )
    list_filter = ('status', 'appointment_type', 'is_paid', 'appointment_date', 'created_at')
    search_fields = (
        'patient__user__first_name', 'patient__user__last_name',
        'doctor__user__first_name', 'doctor__user__last_name',
        'chief_complaint'
    )
    date_hierarchy = 'appointment_date'
    readonly_fields = ('created_at', 'updated_at', 'end_time', 'is_past', 'can_be_cancelled')
    
    fieldsets = (
        ('Appointment Details', {
            'fields': ('patient', 'doctor', 'appointment_date', 'appointment_time', 'duration', 'appointment_type', 'status')
        }),
        ('Medical Information', {
            'fields': ('chief_complaint', 'notes', 'doctor_notes')
        }),
        ('Payment', {
            'fields': ('consultation_fee', 'is_paid')
        }),
        ('Calculated Fields', {
            'fields': ('end_time', 'is_past', 'can_be_cancelled'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()
    get_patient_name.short_description = 'Patient'
    
    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name()
    get_doctor_name.short_description = 'Doctor'


@admin.register(AppointmentSlot)
class AppointmentSlotAdmin(admin.ModelAdmin):
    """Admin configuration for AppointmentSlot model."""
    
    list_display = ('get_doctor_name', 'date', 'start_time', 'end_time', 'is_available', 'current_appointments', 'max_appointments')
    list_filter = ('is_available', 'date', 'created_at')
    search_fields = ('doctor__user__first_name', 'doctor__user__last_name')
    date_hierarchy = 'date'
    readonly_fields = ('current_appointments', 'is_fully_booked', 'created_at', 'updated_at')
    
    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name()
    get_doctor_name.short_description = 'Doctor'


@admin.register(AppointmentReminder)
class AppointmentReminderAdmin(admin.ModelAdmin):
    """Admin configuration for AppointmentReminder model."""
    
    list_display = ('get_appointment_info', 'reminder_type', 'reminder_time', 'is_sent', 'sent_at')
    list_filter = ('reminder_type', 'is_sent', 'reminder_time', 'created_at')
    search_fields = ('appointment__patient__user__first_name', 'appointment__patient__user__last_name')
    date_hierarchy = 'reminder_time'
    readonly_fields = ('sent_at', 'created_at', 'updated_at')
    
    def get_appointment_info(self, obj):
        return f"{obj.appointment.patient.user.get_full_name()} - {obj.appointment.appointment_date}"
    get_appointment_info.short_description = 'Appointment'