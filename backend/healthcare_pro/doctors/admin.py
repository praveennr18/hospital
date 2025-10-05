from django.contrib import admin
from .models import Doctor, Availability


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    """Admin configuration for Doctor model."""
    
    list_display = ('doctor_id', 'get_full_name', 'get_email', 'specialization', 'years_of_experience', 'is_available', 'created_at')
    list_filter = ('specialization', 'is_available', 'gender', 'department', 'created_at')
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'doctor_id', 'license_number')
    readonly_fields = ('id', 'doctor_id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Professional Information', {
            'fields': ('doctor_id', 'specialization', 'license_number', 'years_of_experience', 'qualifications', 'department')
        }),
        ('Personal Information', {
            'fields': ('date_of_birth', 'gender', 'phone', 'address', 'city', 'state', 'zip_code')
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')
        }),
        ('Practice Information', {
            'fields': ('consultation_fee', 'is_available')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_full_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"
    get_full_name.short_description = 'Full Name'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    """Admin configuration for Availability model."""
    
    list_display = ('get_doctor_name', 'get_doctor_id', 'day_of_week', 'start_time', 'end_time', 'is_available')
    list_filter = ('day_of_week', 'is_available', 'created_at')
    search_fields = ('doctor__user__first_name', 'doctor__user__last_name', 'doctor__doctor_id')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name()}"
    get_doctor_name.short_description = 'Doctor Name'
    
    def get_doctor_id(self, obj):
        return obj.doctor.doctor_id
    get_doctor_id.short_description = 'Doctor ID'