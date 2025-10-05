#!/usr/bin/env python
import os
import django
import requests
import json

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_login_and_api():
    base_url = 'http://127.0.0.1:8000'
    
    print("🧪 Testing Login and API Access...")
    
    # Test 1: Admin Login
    print("\n1️⃣ Testing Admin Login:")
    admin_data = {
        'email': 'admin@healthcare.com',
        'password': 'admin123',
        'role': 'admin'
    }
    
    try:
        response = requests.post(f'{base_url}/api/accounts/login/', json=admin_data)
        if response.status_code == 200:
            admin_result = response.json()
            admin_token = admin_result['access']
            print(f"✅ Admin login successful")
            print(f"   User: {admin_result['user']['email']}")
            print(f"   Role: {admin_result['user']['role']}")
            
            # Test admin dashboard stats
            print("\n2️⃣ Testing Admin Dashboard Stats:")
            headers = {'Authorization': f'Bearer {admin_token}'}
            stats_response = requests.get(f'{base_url}/api/accounts/admin/dashboard/stats/', headers=headers)
            if stats_response.status_code == 200:
                stats = stats_response.json()
                print(f"✅ Dashboard stats retrieved")
                print(f"   Total patients: {stats.get('total_patients', 'N/A')}")
                print(f"   Total doctors: {stats.get('total_doctors', 'N/A')}")
            else:
                print(f"❌ Dashboard stats failed: {stats_response.status_code}")
                print(f"   Response: {stats_response.text}")
                
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Admin test error: {e}")
    
    # Test 2: Doctor Login
    print("\n3️⃣ Testing Doctor Login:")
    doctor_data = {
        'email': 'doctor@test.com',
        'password': 'doctor123',
        'role': 'doctor'
    }
    
    try:
        response = requests.post(f'{base_url}/api/accounts/login/', json=doctor_data)
        if response.status_code == 200:
            doctor_result = response.json()
            doctor_token = doctor_result['access']
            print(f"✅ Doctor login successful")
            print(f"   User: {doctor_result['user']['email']}")
            print(f"   Role: {doctor_result['user']['role']}")
            
            # Test doctor appointments
            print("\n4️⃣ Testing Doctor Appointments:")
            headers = {'Authorization': f'Bearer {doctor_token}'}
            appt_response = requests.get(f'{base_url}/api/appointments/', headers=headers)
            if appt_response.status_code == 200:
                appointments = appt_response.json()
                print(f"✅ Doctor appointments retrieved")
                print(f"   Appointments count: {len(appointments.get('results', appointments)) if isinstance(appointments, dict) else len(appointments)}")
            else:
                print(f"❌ Doctor appointments failed: {appt_response.status_code}")
                print(f"   Response: {appt_response.text}")
                
        else:
            print(f"❌ Doctor login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Doctor test error: {e}")
    
    print("\n🎯 Test Summary:")
    print("If all tests pass, the API is working correctly.")
    print("If any fail, check Django server logs for detailed errors.")

if __name__ == '__main__':
    test_login_and_api()