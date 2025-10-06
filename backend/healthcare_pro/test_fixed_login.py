#!/usr/bin/env python
import requests
import json

# Test the login API endpoint
url = 'http://127.0.0.1:8000/api/accounts/login/'
data = {
    'email': 'patient@test.com',
    'password': 'patient123', 
    'role': 'patient'
}

print("🔍 Testing login API with fixed authentication backend...")
print(f"URL: {url}")
print(f"Data: {data}")

try:
    response = requests.post(url, json=data, headers={'Content-Type': 'application/json'})
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Login successful!")
        result = response.json()
        print(f"User: {result.get('user', {}).get('email')}")
        print(f"Access token received: {bool(result.get('access'))}")
        print(f"Refresh token received: {bool(result.get('refresh'))}")
    else:
        print("❌ Login failed!")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ Request failed: {e}")