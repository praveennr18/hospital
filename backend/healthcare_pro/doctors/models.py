from django.db import models
from django.conf import settings
import uuid

class Doctor(models.Model):
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    )
    
    SPECIALIZATION_CHOICES = (
        ('cardiology', 'Cardiology'),
        ('neurology', 'Neurology'),
        ('pediatrics', 'Pediatrics'),
        ('orthopedics', 'Orthopedics'),
        ('dermatology', 'Dermatology'),
        ('general_medicine', 'General Medicine'),
        ('emergency_medicine', 'Emergency Medicine'),
        ('oncology', 'Oncology'),
        ('psychiatry', 'Psychiatry'),
        ('radiology', 'Radiology'),
    )
    
    WORKING_DAYS_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    doctor_id = models.CharField(max_length=20, unique=True, editable=False)
    
    # Professional Information
    specialization = models.CharField(max_length=100, choices=SPECIALIZATION_CHOICES)
    department = models.CharField(max_length=100, blank=True)
    license_number = models.CharField(max_length=100, unique=True)
    years_of_experience = models.IntegerField()
    qualification = models.TextField()
    
    # Personal Information
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    
    # Address Information
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=10, blank=True, null=True)
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=200, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True, null=True)
    relationship = models.CharField(max_length=50, blank=True, null=True)
    
    # Professional Details
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Schedule Settings
    working_days = models.JSONField(default=list, blank=True)  # Store array of working days
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    
    # Status
    is_available = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'doctors'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.doctor_id:
            # Generate doctor ID like "DOC001", "DOC002", etc.
            last_doctor = Doctor.objects.all().order_by('created_at').last()
            if last_doctor and last_doctor.doctor_id:
                last_id = int(last_doctor.doctor_id[3:])
                self.doctor_id = f"DOC{str(last_id + 1).zfill(3)}"
            else:
                self.doctor_id = "DOC001"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialization}"

class Availability(models.Model):
    DAY_CHOICES = (
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'doctor_availabilities'
        verbose_name_plural = 'Availabilities'
        unique_together = ['doctor', 'day_of_week', 'start_time']
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.doctor.doctor_id} - {self.day_of_week} {self.start_time}-{self.end_time}"