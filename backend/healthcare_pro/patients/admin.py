from django.contrib import admin
from django import forms
from .models import PatientProfile, MedicalHistory


class PatientProfileAdminForm(forms.ModelForm):
    """Custom admin form to provide dropdowns for key fields."""

    class Meta:
        model = PatientProfile
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        gender_choices = [('', 'Select Gender')] + list(PatientProfile.GENDER_CHOICES)
        blood_group_choices = [('', 'Select Blood Group')] + list(PatientProfile.BLOOD_TYPE_CHOICES)
        relationship_choices = [('', 'Select Relationship')] + list(PatientProfile.RELATIONSHIP_CHOICES)

        self.fields['gender'].choices = gender_choices
        self.fields['gender'].widget = forms.Select(choices=gender_choices)

        self.fields['blood_group'].choices = blood_group_choices
        self.fields['blood_group'].widget = forms.Select(choices=blood_group_choices)

        self.fields['relationship'].choices = relationship_choices
        self.fields['relationship'].widget = forms.Select(choices=relationship_choices)


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    """Admin configuration for PatientProfile model."""
    
    form = PatientProfileAdminForm
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