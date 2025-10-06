@echo off
echo ========================================
echo Healthcare Pro - Complete Test Suite
echo ========================================
echo.
echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)
echo.
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo ========================================
echo Running Patient Module Tests
echo ========================================
echo.
python test_patient_automation.py
echo.
echo ========================================
echo Running Doctor Module Tests
echo ========================================
echo.
python test_doctor_automation.py
echo.
echo ========================================
echo Running Admin Module Tests
echo ========================================
echo.
python test_admin_automation.py
echo.
echo ========================================
echo All Tests Completed!
echo ========================================
echo.
pause
