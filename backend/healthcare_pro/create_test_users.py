#!/usr/bin/env python
"""
Script to create test users for the Healthcare Pro application.
Run this script from the Django project root directory.
"""

import os
import sys
import django
from django.core.management.base import BaseCommand

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import User
from patients.models import PatientProfile
from doctors.models import Doctor

User = get_user_model()

def create_test_users():
    """Create test users for the application."""
    
    print("Creating test users...")
    
    # Create admin user (if not exists)
    admin_email = "admin@healthcare.com"
    if not User.objects.filter(email=admin_email).exists():
        admin_user = User.objects.create_user(
            email=admin_email,
            password="admin123",
            first_name="Healthcare",
            last_name="Admin",
            role="admin",
            is_staff=True,
            is_superuser=True
        )
        print(f"✅ Created admin user: {admin_email}")
    else:
        print(f"ℹ️  Admin user already exists: {admin_email}")

    # Create test patient
    patient_email = "patient@test.com"
    if not User.objects.filter(email=patient_email).exists():
        patient_user = User.objects.create_user(
            email=patient_email,
            password="patient123",
            first_name="John",
            last_name="Doe",
            role="patient"
        )
        
        # Create patient profile
        patient_profile = PatientProfile.objects.create(
            user=patient_user,
            phone_number="(555) 123-4567",
            date_of_birth="1985-05-15",
            gender="M",
            blood_group="O+",
            address="123 Main St",
            city="Anytown",
            state="CA",
            zip_code="12345",
            allergies="Penicillin, Peanuts",
            chronic_conditions="Hypertension, Diabetes Type 2",
            current_medications="Metformin 500mg, Lisinopril 10mg",
            emergency_contact_name="Jane Doe",
            emergency_contact_phone="(555) 987-6543",
            relationship="Spouse"
        )
        print(f"✅ Created patient user: {patient_email}")
    else:
        print(f"ℹ️  Patient user already exists: {patient_email}")

    # Create test doctor
    doctor_email = "doctor@test.com"
    if not User.objects.filter(email=doctor_email).exists():
        doctor_user = User.objects.create_user(
            email=doctor_email,
            password="doctor123",
            first_name="Sarah",
            last_name="Wilson",
            role="doctor"
        )
        
        # Create doctor profile
        doctor_profile = Doctor.objects.create(
            user=doctor_user,
            specialization="cardiology",
            department="Cardiology Department",
            license_number="MD789012",  # Changed to unique number
            years_of_experience=15,
            qualification="MD, FACC - Cardiology Specialist",
            phone="(555) 234-5678",
            date_of_birth="1975-08-20",
            gender="F",
            consultation_fee=200.00,
            address="456 Medical Plaza",
            city="Anytown",
            state="CA",
            zip_code="12345"
        )
        print(f"✅ Created doctor user: {doctor_email}")
    else:
        print(f"ℹ️  Doctor user already exists: {doctor_email}")

    print("\n🎉 Test users creation completed!")
    print("\nTest credentials:")
    print(f"Admin: {admin_email} / admin123")
    print(f"Patient: {patient_email} / patient123")
    print(f"Doctor: {doctor_email} / doctor123")

if __name__ == "__main__":
    create_test_users()