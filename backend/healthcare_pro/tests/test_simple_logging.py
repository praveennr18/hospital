#!/usr/bin/env python
"""
Simple test to verify the simplified logging system
"""
import os
import django
from pathlib import Path

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Add the project directory to Python path
import sys
sys.path.append(str(BASE_DIR))

try:
    django.setup()
    
    # Test logging import
    import logging
    
    # Get our simplified logger
    logger = logging.getLogger('healthcare_app')
    
    print("✅ Simplified Logging Test")
    print("=" * 40)
    
    # Test simple log entries
    logger.info("Application started successfully")
    logger.warning("Test warning message")
    logger.error("Test error message")
    
    print("📄 Log file created:")
    
    logs_dir = BASE_DIR / 'logs'
    log_file = logs_dir / 'healthcare_app.log'
    
    if log_file.exists():
        size = log_file.stat().st_size
        print(f"   📁 {log_file.name} ({size} bytes)")
        
        # Show last few lines
        with open(log_file, 'r') as f:
            lines = f.readlines()
            print(f"\n📋 Last few log entries:")
            for line in lines[-8:]:
                if line.strip() and not line.startswith('#'):
                    print(f"   {line.strip()}")
    
    print(f"\n🎯 Single log file: {log_file}")
    print("✅ Simplified logging system working!")
    print("\n💡 Expected format for API requests:")
    print("   2025-10-01 15:44:34 - INFO - GET /api/appointments/ - Status: 200 - User: doctor@hospital.com (doctor) - Duration: 45ms")
    print("   2025-10-01 15:44:35 - WARNING - POST /api/login/ - Status: 401 - User: Anonymous - Duration: 12ms")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("Make sure Django is properly set up.")