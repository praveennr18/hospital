#!/usr/bin/env python
"""
Test the API logging with authenticated users to verify role logging
"""
import requests
import json
import os
from decouple import config

# Base URL for the API
BASE_URL = config('API_BASE_URL', default='http://127.0.0.1:8000')

def test_authenticated_logging():
    """Test API logging with different user roles"""
    
    print("🔍 Testing API Logging with User Roles...")
    print("=" * 50)
    
    # Test login to see user role in logs
    print("1. Testing login...")
    
    login_data = {
        "email": "doctor1@hospital.com",
        "password": "doctor123"
    }
    
    try:
        # Login request
        response = requests.post(
            f"{BASE_URL}/api/accounts/login/",
            json=login_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"   Login Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access')
            
            if token:
                print("   ✅ Login successful, testing authenticated request...")
                
                # Make authenticated request
                auth_response = requests.get(
                    f"{BASE_URL}/api/accounts/profile/",
                    headers={
                        'Authorization': f'Bearer {token}',
                        'Content-Type': 'application/json'
                    },
                    timeout=10
                )
                
                print(f"   Profile Status: {auth_response.status_code}")
                
                if auth_response.status_code == 200:
                    profile_data = auth_response.json()
                    user_role = profile_data.get('role', 'unknown')
                    user_email = profile_data.get('email', 'unknown')
                    print(f"   ✅ Authenticated as: {user_email} ({user_role})")
                
        else:
            print("   ❌ Login failed, testing unauthenticated request...")
            
        # Test unauthenticated request
        unauth_response = requests.get(
            f"{BASE_URL}/api/doctors/dashboard/",
            timeout=10
        )
        print(f"   Unauthenticated Status: {unauth_response.status_code}")
        
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request Error: {e}")
    
    print(f"\n📄 Check the log file for entries showing user roles:")
    print("   logs/healthcare_app.log")
    print("\n🎯 Expected log format:")
    print("   2025-10-01 16:30:00 - INFO - GET /api/accounts/profile/ - Status: 200 - User: doctor1@hospital.com (doctor) - Duration: 45ms")
    print("   2025-10-01 16:30:01 - WARNING - GET /api/doctors/dashboard/ - Status: 401 - User: Anonymous - Duration: 12ms")

if __name__ == "__main__":
    test_authenticated_logging()