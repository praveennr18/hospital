@echo off
echo ========================================
echo Healthcare Pro - Doctor Module Testing
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
echo Starting Doctor Module Tests
echo ========================================
echo.
python test_doctor_automation.py
echo.
pause
