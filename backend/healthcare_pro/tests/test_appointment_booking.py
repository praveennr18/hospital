"""
Test script for the new appointment booking system
Run this with: python manage.py shell < test_appointment_booking.py
"""

from django.contrib.auth import get_user_model
from doctors.models import Doctor
from patients.models import PatientProfile
from appointments.models import Appointment
from datetime import date, time

User = get_user_model()

print("=== Testing Appointment Booking System ===")

# Check if we have any doctors
doctors = Doctor.objects.all()
print(f"Number of doctors in system: {doctors.count()}")

if doctors.exists():
    for doctor in doctors[:3]:
        print(f"- Dr. {doctor.user.first_name} {doctor.user.last_name} ({doctor.specialization})")
        print(f"  Department: {doctor.department}")

print()

# Check if we have any patients
patients = PatientProfile.objects.all()
print(f"Number of patients in system: {patients.count()}")

if patients.exists():
    for patient in patients[:3]:
        print(f"- {patient.user.first_name} {patient.user.last_name}")

print()

# Check appointments
appointments = Appointment.objects.all()
print(f"Number of appointments in system: {appointments.count()}")

if appointments.exists():
    for appointment in appointments[:3]:
        print(f"- {appointment.patient.user.first_name} with Dr. {appointment.doctor.user.first_name}")
        print(f"  Date: {appointment.appointment_date}, Time: {appointment.appointment_time}")
        print(f"  Status: {appointment.status}")

print()

# Test departments
departments = Doctor.objects.values_list('department', flat=True).distinct()
print(f"Available departments: {list(departments)}")

print("=== Test Complete ===")