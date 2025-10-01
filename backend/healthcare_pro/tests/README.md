# Healthcare Pro Tests

This directory contains all test files for the Healthcare Pro application.

## 📂 Test Files

### 🧪 API Tests
- **`test_appointment.py`** - Tests appointment scheduling and management
- **`test_appointment_booking.py`** - Tests appointment booking functionality
- **`test_permissions.py`** - Tests role-based permissions

### 📊 System Tests  
- **`test_simple_logging.py`** - Tests the simplified logging system

## 🚀 Running Tests

### Individual Tests
```bash
# Test appointment functionality
python tests/test_appointment.py

# Test appointment booking
python tests/test_appointment_booking.py

# Test permissions
python tests/test_permissions.py

# Test logging system
python tests/test_simple_logging.py
```

### Django Tests (Future)
```bash
# When Django unit tests are added
python manage.py test
```

## 📋 Test Requirements

### Environment Setup
- Make sure `.env` file is properly configured
- Django server should be running for API tests
- Database should be populated with test data

### Dependencies
- All tests use the same environment variables as the main application
- Tests require valid authentication tokens for API testing

## 🔧 Test Configuration

Tests use environment variables from `.env` file:
- `API_BASE_URL` - Base URL for API testing
- `LOG_LEVEL` - Logging level for test output
- Authentication credentials for various user roles

## 📊 Test Coverage

Current test coverage includes:
- ✅ Appointment scheduling (multiple user roles)
- ✅ Permission validation (role-based access)
- ✅ Logging system verification
- ✅ API endpoint validation

## 🔮 Future Tests

Planned test additions:
- Unit tests for models
- Integration tests for complex workflows
- Performance tests for API endpoints
- Security tests for authentication

---

**Note**: These are functional tests that interact with the actual API. For unit testing, consider using Django's built-in testing framework.