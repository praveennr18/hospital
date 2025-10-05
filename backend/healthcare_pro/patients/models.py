from django.db import models
from django.conf import settings
import uuid


class PatientProfile(models.Model):
    """Patient profile with extended medical information."""
    
    BLOOD_TYPE_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    RELATIONSHIP_CHOICES = [
        ('parent', 'Parent'),
        ('spouse', 'Spouse'),
        ('sibling', 'Sibling'),
        ('child', 'Child'),
        ('guardian', 'Guardian'),
        ('friend', 'Friend'),
        ('other', 'Other'),
    ]
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_profile')
    
    # Personal Information
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    
    # Address Information
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=10, blank=True, null=True)
    
    # Medical Information
    blood_group = models.CharField(max_length=3, choices=BLOOD_TYPE_CHOICES, blank=True, null=True)
    height = models.FloatField(help_text="Height in cm", blank=True, null=True)
    weight = models.FloatField(help_text="Weight in kg", blank=True, null=True)
    allergies = models.TextField(blank=True, null=True, help_text="List of known allergies")
    chronic_conditions = models.TextField(blank=True, null=True, help_text="Chronic medical conditions")
    current_medications = models.TextField(blank=True, null=True, help_text="Current medications")
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True, null=True)
    relationship = models.CharField(max_length=50, choices=RELATIONSHIP_CHOICES, blank=True, null=True)
    
    # Insurance Information
    insurance_provider = models.CharField(max_length=100, blank=True, null=True)
    policy_number = models.CharField(max_length=50, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'patient_profiles'
        verbose_name = 'Patient Profile'
        verbose_name_plural = 'Patient Profiles'
    
    def __str__(self):
        return f"Patient: {self.user.get_full_name()}"
    
    @property
    def age(self):
        """Calculate age from date of birth."""
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None
    
    @property
    def bmi(self):
        """Calculate BMI if height and weight are available."""
        if self.height and self.weight:
            height_m = self.height / 100  # Convert cm to meters
            return round(self.weight / (height_m ** 2), 2)
        return None


class MedicalHistory(models.Model):
    """Medical history records for patients."""
    
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='medical_history')
    date = models.DateField()
    condition = models.CharField(max_length=200)
    description = models.TextField()
    treatment = models.TextField(blank=True, null=True)
    doctor = models.ForeignKey('doctors.Doctor', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'medical_history'
        verbose_name = 'Medical History'
        verbose_name_plural = 'Medical Histories'
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.condition} ({self.date})"


class Allergy(models.Model):
    """Patient allergies and their severity."""
    
    SEVERITY_CHOICES = [
        ('Mild', 'Mild'),
        ('Moderate', 'Moderate'),
        ('Severe', 'Severe'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='patient_allergies')
    allergen = models.CharField(max_length=200)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    reaction = models.TextField(help_text="Description of allergic reaction")
    notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'patient_allergies'
        verbose_name = 'Allergy'
        verbose_name_plural = 'Allergies'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.allergen} ({self.severity})"


class Medication(models.Model):
    """Patient medications and their details."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='patient_medications')
    medication_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    prescribed_date = models.DateField()
    condition = models.CharField(max_length=200, help_text="Condition being treated")
    prescribing_doctor = models.CharField(max_length=200, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'patient_medications'
        verbose_name = 'Medication'
        verbose_name_plural = 'Medications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.medication_name} ({self.dosage})"