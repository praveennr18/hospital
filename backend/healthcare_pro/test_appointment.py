#!/usr/bin/env python
import requests
import json
import os
from decouple import config

# Test appointment scheduling with doctor authentication
BASE_URL = config('API_BASE_URL', default='http://127.0.0.1:8000')

# Login as doctor to get token
login_data = {
    "email": "john.smith@hospital.com",
    "password": "smith123",
    "role": "doctor"
}

try:
    # Login
    print("Attempting to login as doctor...")
    login_response = requests.post(f"{BASE_URL}/api/accounts/login/", json=login_data)
    print(f"Login status: {login_response.status_code}")
    print(f"Login response: {login_response.text}")
    
    if login_response.status_code == 200:
        login_result = login_response.json()
        access_token = login_result['access']
        print(f"Login successful! Got token.")
        
        # Test appointment scheduling
        appointment_data = {
            "patient_id": 1,
            "department": "cardiology",
            "appointment_date": "2024-10-15",
            "preferred_time": "09:00",
            "appointment_type": "consultation",
            "reason": "Regular checkup"
        }
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        print("\nAttempting to schedule appointment...")
        schedule_response = requests.post(f"{BASE_URL}/api/appointments/schedule/", 
                                        json=appointment_data, headers=headers)
        print(f"Schedule status: {schedule_response.status_code}")
        print(f"Schedule response: {schedule_response.text}")
    
except Exception as e:
    print(f"Error: {e}")