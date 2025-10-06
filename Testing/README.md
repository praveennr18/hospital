# Healthcare Pro - Automation Testing

## Selenium Automation Testing Suite

This directory contains automated testing scripts for the Healthcare Pro application using Selenium WebDriver.

### Available Test Modules:
- **Patient Module** - Complete patient portal testing
- **Doctor Module** - Complete doctor portal testing
- **Admin Module** - Complete admin portal testing
- **Patient CRUD Operations** - Database operations testing (CREATE, READ, UPDATE, DELETE)

## Prerequisites

1. **Python 3.8+** installed
2. **Google Chrome** browser installed
3. **Backend server** running on `http://127.0.0.1:8000/`
4. **Frontend server** running on `http://localhost:5173/`
5. **Test Accounts:**
   - **Patient Account:**
     - Email: `skandaudemy@gmail.com`
     - Password: `skanda`
   - **Doctor Account:**
     - Email: `praveennr03@gmail.com`
     - Password: `praveen`
   - **Admin Account:**
     - Email: `praveennr6361@gmail.com`
     - Password: `praveen`

## Installation

1. Navigate to the Testing directory:
```bash
cd Testing
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

This will install:
- `selenium` - Web automation framework
- `webdriver-manager` - Automatic ChromeDriver management

## Running Tests

### Patient Module Tests

Run the patient automation test:

```bash
python test_patient_automation.py
```

### Doctor Module Tests

Run the doctor automation test:

```bash
python test_doctor_automation.py
```

### Admin Module Tests

Run the admin automation test:

```bash
python test_admin_automation.py
```

### Patient CRUD Operations Tests

Run the CRUD operations test:

```bash
python test_patient_crud_operations.py
```

## Test Coverage

### Patient Module (15 Tests)

The patient module test suite includes:

1. ✅ **Navigate to Login Page** - Verifies login page loads correctly
2. ✅ **Select Patient Role Tab** - Selects the patient role from tabs
3. ✅ **Login as Patient** - Authenticates with patient credentials
4. ✅ **Verify Dashboard Loaded** - Checks dashboard elements are present
5. ✅ **Check Patient Information** - Verifies patient data is displayed
6. ✅ **Navigate to Medical History** - Accesses medical history section
7. ✅ **View Medical History Records** - Views existing medical records
8. ✅ **Navigate to Allergies** - Accesses allergies section
9. ✅ **View Allergies List** - Views existing allergies
10. ✅ **Navigate to Medications** - Accesses medications section
11. ✅ **View Medications List** - Views current medications
12. ✅ **Navigate to Appointments** - Accesses appointments section
13. ✅ **View Appointments List** - Views scheduled appointments
14. ✅ **Check Schedule Appointment Button** - Verifies scheduling functionality
15. ✅ **Logout** - Successfully logs out from patient account

### Doctor Module (15 Tests)

The doctor module test suite includes:

1. ✅ **Navigate to Login Page** - Verifies login page loads correctly
2. ✅ **Select Doctor Role Tab** - Selects the doctor role from tabs
3. ✅ **Login as Doctor** - Authenticates with doctor credentials
4. ✅ **Verify Dashboard Loaded** - Checks dashboard elements are present
5. ✅ **Check Doctor Information** - Verifies doctor data is displayed
6. ✅ **View Today's Schedule** - Views today's appointments
7. ✅ **Navigate to Appointments** - Accesses appointments section
8. ✅ **View All Appointments** - Views all scheduled appointments
9. ✅ **Navigate to Patients** - Accesses patient list section
10. ✅ **View Patient List** - Views assigned patients
11. ✅ **Navigate to Availability** - Accesses availability settings
12. ✅ **View Availability Settings** - Views schedule/working hours
13. ✅ **Check Schedule Appointment Button** - Verifies scheduling functionality
14. ✅ **Navigate Back to Dashboard** - Returns to main dashboard
15. ✅ **Logout** - Successfully logs out from doctor account

### Admin Module (15 Tests)

The admin module test suite includes:

1. ✅ **Navigate to Login Page** - Verifies login page loads correctly
2. ✅ **Select Admin Role Tab** - Selects the admin role from tabs
3. ✅ **Login as Admin** - Authenticates with admin credentials
4. ✅ **Verify Dashboard Loaded** - Checks dashboard elements are present
5. ✅ **Check Dashboard Statistics** - Verifies statistics cards are displayed
6. ✅ **Navigate to Doctors Management** - Accesses doctors section
7. ✅ **View Doctors List** - Views all registered doctors
8. ✅ **Navigate to Patients Management** - Accesses patients section
9. ✅ **View Patients List** - Views all registered patients
10. ✅ **Navigate to Appointments Management** - Accesses appointments section
11. ✅ **View Appointments List** - Views all appointments
12. ✅ **Check Register Doctor Option** - Verifies doctor registration available
13. ✅ **Check Register Patient Option** - Verifies patient registration available
14. ✅ **Navigate Back to Dashboard** - Returns to main dashboard
15. ✅ **Logout** - Successfully logs out from admin account

### Patient CRUD Operations (10 Tests)

The CRUD operations test suite includes:

1. ✅ **Add Medical History** - CREATE operation with database insertion
2. ✅ **Verify Medical History** - READ operation from database
3. ✅ **Add Allergy** - CREATE operation with database insertion
4. ✅ **Verify Allergy** - READ operation from database
5. ✅ **Add Medication** - CREATE operation with database insertion
6. ✅ **Verify Medication** - READ operation from database
7. ✅ **Navigate to Appointments** - Access appointments page
8. ✅ **View Appointments List** - READ appointments from database
9. ✅ **Database Persistence Check** - Verify data persists after refresh
10. ✅ **Logout** - Successfully logs out

## Test Features

### ✨ Key Features:

- **Color-coded console output** for easy reading
- **Detailed test logs** with pass/fail status
- **Screenshot capture** on errors
- **Test execution summary** with statistics
- **Test results saved to file** - Detailed report in `.txt` format
- **Non-destructive testing** - Read-only for basic tests
- **CRUD testing** - Full database operations testing (CREATE, READ)
- **Real database verification** - Tests actual data from backend
- **Data persistence verification** - Confirms data survives page refresh

### 📊 Test Output:

The test script provides:
- Real-time test execution status
- Color-coded results (Green = Pass, Red = Fail)
- Total tests, passed, failed counts
- Success rate percentage
- Execution duration
- Screenshots on failures
- **Saved test results file** with detailed report

### 📄 Test Results Files:

After each test run, a detailed results file is automatically generated:
**Patient Tests:**
- Format: `test_results_patient_YYYYMMDD_HHMMSS.txt`
- Contains: Summary, detailed test results, timestamps

**Doctor Tests:**
- Format: `test_results_doctor_[timestamp].txt`
- Contains: Summary, detailed test results, timestamps

**Admin Tests:**
- Format: `test_results_admin_[timestamp].txt`
- Contains: Summary, detailed test results, timestamps

**CRUD Operations Tests:**
- Format: `test_results_patient_crud_[timestamp].txt`
- Contains: Summary, test data used, detailed results, timestamps

## Test Configuration

You can modify test parameters in the respective test files:
{{ ... }}
**Patient Module (`test_patient_automation.py`):**

```python
# Configuration
BASE_URL = "http://localhost:5173"
PATIENT_EMAIL = "skandaudemy@gmail.com"
PATIENT_PASSWORD = "skanda"
WAIT_TIMEOUT = 10
IMPLICIT_WAIT = 5
```

**Doctor Module (`test_doctor_automation.py`):**

```python
# Configuration
BASE_URL = "http://localhost:5173"
DOCTOR_EMAIL = "praveennr03@gmail.com"
DOCTOR_PASSWORD = "praveen"
WAIT_TIMEOUT = 10
IMPLICIT_WAIT = 5
```

**Admin Module (`test_admin_automation.py`):**

```python
# Configuration
BASE_URL = "http://localhost:5173"
ADMIN_EMAIL = "praveennr6361@gmail.com"
ADMIN_PASSWORD = "praveen"
WAIT_TIMEOUT = 10
IMPLICIT_WAIT = 5
```

## Troubleshooting

### Common Issues:

1. **ChromeDriver not found**
   - The script uses `webdriver-manager` which automatically downloads ChromeDriver
   - Ensure you have internet connection on first run

2. **Servers not running**
   - Make sure both backend (port 8000) and frontend (port 5173) are running
   - Check console for connection errors

3. **Login fails**
   - Verify patient account exists in database
   - Check credentials are correct
   - Ensure backend authentication is working

4. **Elements not found**
   - Frontend UI might have changed
   - Increase `WAIT_TIMEOUT` if elements load slowly
   - Check browser console for JavaScript errors

## Generated Files

### Screenshots
Screenshots are automatically saved when tests fail:
- **Patient tests**: `screenshot_patient_[test_name]_[timestamp].png`
- **Doctor tests**: `screenshot_doctor_[test_name]_[timestamp].png`
- **Admin tests**: `screenshot_admin_[test_name]_[timestamp].png`
- **CRUD tests**: `screenshot_patient_crud_[test_name]_[timestamp].png`
- Location: Same directory as test script

### Test Results
Detailed test reports are saved after each run:
- **Patient results**: `test_results_patient_[timestamp].txt`
- **Doctor results**: `test_results_doctor_[timestamp].txt`
- **Admin results**: `test_results_admin_[timestamp].txt`
- **CRUD results**: `test_results_patient_crud_[timestamp].txt`
- Contains: Summary, all test details, pass/fail status, messages

## Notes

- **Basic tests are non-destructive**: Read-only operations
- **CRUD tests modify database**: Adds test data (medical history, allergies, medications)
- **Database verification**: All data comes from and goes to actual database
- **Data persistence**: CRUD tests verify data survives page refresh
- **No forgot password testing**: As requested, forgot password flow is excluded
- **Comprehensive coverage**: Tests patient, doctor, admin modules + CRUD operations

## Future Enhancements

Potential additions:
- UPDATE and DELETE operation tests
- API response validation
- Performance testing
- Cross-browser testing (Firefox, Edge, Safari)

## Support

For issues or questions:
1. Check test logs for detailed error messages
2. Review screenshots for visual debugging
3. Verify all prerequisites are met
4. Ensure servers are running correctly
