@echo off
echo ========================================
echo Healthcare Pro - Patient Module Testing
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
echo Starting Patient Module Tests
echo ========================================
echo.
python test_patient_automation.py
echo.
pause
