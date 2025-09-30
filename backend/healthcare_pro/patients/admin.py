from django.contrib import admin
from .models import PatientProfile, MedicalHistory


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    """Admin configuration for PatientProfile model."""
    
    list_display = ('get_full_name', 'get_email', 'blood_group', 'age', 'created_at')
    list_filter = ('blood_group', 'created_at')
    search_fields = ('user__first_name', 'user__last_name', 'user__email')
    readonly_fields = ('created_at', 'updated_at', 'age', 'bmi')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Medical Information', {
            'fields': ('blood_group', 'height', 'weight', 'allergies', 'chronic_conditions', 'current_medications')
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'relationship')
        }),
        ('Insurance Information', {
            'fields': ('insurance_provider', 'policy_number')
        }),
        ('Calculated Fields', {
            'fields': ('age', 'bmi'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Full Name'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'


@admin.register(MedicalHistory)
class MedicalHistoryAdmin(admin.ModelAdmin):
    """Admin configuration for MedicalHistory model."""
    
    list_display = ('get_patient_name', 'condition', 'date', 'get_doctor_name', 'created_at')
    list_filter = ('date', 'created_at')
    search_fields = ('patient__user__first_name', 'patient__user__last_name', 'condition')
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at')
    
    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()
    get_patient_name.short_description = 'Patient'
    
    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name() if obj.doctor else 'N/A'
    get_doctor_name.short_description = 'Doctor'