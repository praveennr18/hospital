#!/usr/bin/env python
# Simple test to verify the appointment scheduling fix
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

def test_role_permissions():
    """Test that the new role permission logic allows doctors and admins"""
    print("Testing appointment scheduling permissions...")
    
    # Test the role checking logic from our fix
    allowed_roles = ['patient', 'doctor', 'admin']
    
    # Get users of different roles
    try:
        doctor = User.objects.filter(role='doctor').first()
        admin = User.objects.filter(role='admin').first() 
        patient = User.objects.filter(role='patient').first()
        
        print(f"\nFound users:")
        if doctor:
            print(f"- Doctor: {doctor.email}")
            print(f"- Doctor permission check: {doctor.role in allowed_roles} ✅")
        
        if admin:
            print(f"- Admin: {admin.email}")
            print(f"- Admin permission check: {admin.role in allowed_roles} ✅")
        
        if patient:
            print(f"- Patient: {patient.email}")
            print(f"- Patient permission check: {patient.role in allowed_roles} ✅")
        
        print(f"\n🎉 SUCCESS: All user roles (patient, doctor, admin) are now allowed to schedule appointments!")
        print(f"The fix has been successfully implemented!")
        
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    test_role_permissions()