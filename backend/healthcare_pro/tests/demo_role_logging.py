#!/usr/bin/env python
"""
Demo script to show what the role logging will look like
"""
import os
import django
from pathlib import Path
import sys

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.append(str(BASE_DIR))

try:
    django.setup()
    
    import logging
    
    # Get our logger
    logger = logging.getLogger('healthcare_app')
    
    print("🔍 Role Logging Demo")
    print("=" * 50)
    
    # Simulate different types of API requests with roles
    print("Simulating various API requests with different user roles...")
    
    # Simulate authenticated requests (this is what the middleware will log)
    sample_logs = [
        "GET /api/doctors/dashboard/ - Status: 200 - User: john.smith@hospital.com (doctor) - Duration: 45ms",
        "POST /api/appointments/schedule/ - Status: 201 - User: sarah.wilson@hospital.com (doctor) - Duration: 123ms",
        "GET /api/patients/my/dashboard/ - Status: 200 - User: patient1@email.com (patient) - Duration: 67ms",
        "PUT /api/patients/my/profile/ - Status: 200 - User: patient1@email.com (patient) - Duration: 89ms",
        "GET /api/accounts/admin/users/ - Status: 200 - User: admin@hospital.com (admin) - Duration: 234ms",
        "POST /api/accounts/admin/register/doctor/ - Status: 201 - User: admin@hospital.com (admin) - Duration: 456ms",
        "GET /api/accounts/profile/ - Status: 401 - User: Anonymous - Duration: 12ms",
        "POST /api/accounts/login/ - Status: 200 - User: Anonymous - Duration: 178ms"
    ]
    
    print("\n📊 Sample log entries that will be generated:")
    for i, log_entry in enumerate(sample_logs, 1):
        # Log them as demo entries
        if "Status: 401" in log_entry:
            logger.warning(f"DEMO - {log_entry}")
            print(f"   {i}. WARNING - {log_entry}")
        elif "Status: 5" in log_entry:
            logger.error(f"DEMO - {log_entry}")
            print(f"   {i}. ERROR - {log_entry}")
        else:
            logger.info(f"DEMO - {log_entry}")
            print(f"   {i}. INFO - {log_entry}")
    
    print(f"\n🎯 Enhanced logging now includes:")
    print("   ✅ User email address")
    print("   ✅ User role (doctor, patient, admin)")
    print("   ✅ Clear status codes")
    print("   ✅ Request timing")
    
    print(f"\n📄 Check the log file:")
    print("   logs/healthcare_app.log")
    
    # Show current log file size
    logs_dir = BASE_DIR / 'logs'
    log_file = logs_dir / 'healthcare_app.log'
    
    if log_file.exists():
        size = log_file.stat().st_size
        print(f"   Current size: {size} bytes")
    
    print("\n✅ Role logging system is ready!")
    print("   Make authenticated API requests to see user roles in logs")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("Make sure Django is properly set up.")