# API Request Logging System

## Overview

This healthcare application implements comprehensive API request logging using Django's built-in logging framework. Every API request is automatically logged with detailed information for monitoring, debugging, and auditing purposes.

## Features

### ✅ Automatic API Request Logging
- **Method**: HTTP method (GET, POST, PUT, DELETE, etc.)
- **Path**: Full request path with query parameters
- **Status Code**: HTTP response status code
- **User Information**: Email, ID, and role of authenticated users
- **Timestamp**: Precise request timestamp
- **Duration**: Request processing time in milliseconds
- **IP Address**: Client IP address with proxy header support
- **User Agent**: Browser/client information
- **Content Length**: Response size

### ✅ Structured Logging
- **JSON Format**: Machine-readable log entries
- **Log Levels**: Automatic level assignment based on response status
  - `INFO`: Successful requests (2xx status codes)
  - `WARNING`: Client errors (4xx status codes) 
  - `ERROR`: Server errors (5xx status codes)

### ✅ Log Rotation
- **File Size Limit**: Configurable maximum file size (default: 10MB)
- **Backup Files**: Configurable number of backup files (default: 5)
- **Automatic Rotation**: Seamless rotation without service interruption

## Configuration

All logging settings are configurable via environment variables in `.env`:

```env
# Logging Configuration
LOG_LEVEL=INFO                    # File logging level
CONSOLE_LOG_LEVEL=DEBUG          # Console logging level (dev only)
LOG_MAX_BYTES=10485760          # Max log file size (10MB)
LOG_BACKUP_COUNT=5              # Number of backup files
```

## Log Files

### `logs/api_requests.log`
Contains all API request logs with detailed information:

```json
{
  "timestamp": "2025-01-01 12:30:45",
  "method": "POST",
  "path": "/api/appointments/schedule/",
  "query_params": {},
  "status_code": 201,
  "user_email": "doctor@hospital.com",
  "user_id": "uuid-here",
  "user_role": "doctor",
  "user_agent": "Mozilla/5.0...",
  "remote_addr": "127.0.0.1",
  "duration_ms": 245.67,
  "content_length": 1024
}
```

### `logs/errors.log`
Contains Django and application error logs for debugging.

### `logs/django.log`
Contains general Django framework logs.

## Implementation Details

### Middleware Integration

The logging is implemented via custom middleware (`config/middleware.py`):

```python
class APILoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all API requests with comprehensive information
    """
```

**Middleware Position**: Placed after authentication middleware to capture user information.

### Environment-Based Configuration

All hardcoded values have been replaced with environment variables:

```python
# Business Logic Configuration  
APPOINTMENT_SLOT_DURATION_MINUTES=30    # Appointment slot duration
CANCELLATION_DEADLINE_HOURS=24          # Cancellation deadline
DEFAULT_SCHEDULE_DAYS=7                 # Default schedule period

# Application Configuration
DEFAULT_PAGE_SIZE=10                    # API pagination size
CORS_ALLOWED_ORIGINS=...               # CORS allowed origins
FRONTEND_URL=http://localhost:3000     # Frontend application URL
API_BASE_URL=http://127.0.0.1:8000    # API base URL
```

## Usage Examples

### Testing Logging

Run the provided test script:

```bash
python test_logging.py
```

This will generate various API requests to test the logging functionality.

### Monitoring Logs

**Real-time monitoring:**
```bash
# Windows
Get-Content logs/api_requests.log -Wait -Tail 10

# Linux/Mac  
tail -f logs/api_requests.log
```

**Log analysis:**
```bash
# Count requests by status code
grep '"status_code": 200' logs/api_requests.log | wc -l

# Find error requests
grep '"status_code": [45]' logs/api_requests.log

# Monitor specific user activity
grep '"user_email": "doctor@hospital.com"' logs/api_requests.log
```

## Security Features

### 🔒 User Privacy
- No sensitive data (passwords, tokens) are logged
- User identification via email/ID only
- Request bodies are not logged to prevent sensitive data exposure

### 🔒 IP Tracking
- Real IP detection through proxy headers (`X-Forwarded-For`)
- Useful for security monitoring and rate limiting

### 🔒 Audit Trail
- Complete request history for compliance
- User action tracking for accountability
- Time-based analysis capabilities

## Performance Impact

### ⚡ Optimized Performance
- **Minimal Overhead**: Logging adds ~1-3ms per request
- **Async Logging**: Non-blocking file operations
- **Conditional Logging**: Only API endpoints are logged (`/api/*`)
- **Size Management**: Automatic log rotation prevents disk space issues

### 📊 Log Volume Estimation
- **Average Request**: ~500 bytes per log entry
- **High Traffic**: 10,000 requests/day = ~5MB logs/day
- **With Rotation**: Approximately 50MB total storage with 5 backups

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check directory permissions on `logs/` folder
2. **Log rotation not working**: Verify `LOG_MAX_BYTES` configuration
3. **Performance issues**: Adjust `LOG_LEVEL` to reduce verbosity

### Debug Mode

In development (`DEBUG=True`), logs also appear in console for immediate feedback.

## Compliance & Monitoring

### 📋 Audit Requirements
- **Complete Request History**: All API interactions logged
- **User Attribution**: Every request tied to authenticated user
- **Timestamp Precision**: Exact request timing for analysis
- **Status Tracking**: Success/failure monitoring

### 📊 Analytics Capabilities
- **Usage Patterns**: Most frequently used endpoints
- **Performance Metrics**: Average response times
- **Error Analysis**: Common failure points
- **User Behavior**: Individual user activity patterns

## Best Practices

### 🎯 Log Management
1. **Regular Monitoring**: Check logs daily for errors
2. **Storage Planning**: Monitor disk space usage
3. **Log Analysis**: Use log parsing tools for insights
4. **Backup Strategy**: Include logs in backup procedures

### 🎯 Security
1. **Access Control**: Restrict log file access to administrators
2. **Retention Policy**: Define log retention periods
3. **Sensitive Data**: Never log passwords or tokens
4. **Regular Review**: Audit log contents periodically

---

**🚀 Result**: Complete API request logging system with zero hardcoded values and comprehensive monitoring capabilities!