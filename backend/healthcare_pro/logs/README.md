# Logs Directory

This directory contains the simplified logging for the Healthcare Pro application.

## Log File:

- **healthcare_app.log**: Contains all application logs in simple, readable format including:
  - API requests (method, path, status, user, duration)
  - Django framework warnings and errors
  - Application errors and important events

## Log Format:

Simple, clean format for easy reading:
```
2025-10-01 15:30:45 - INFO - GET /api/appointments/ - Status: 200 - User: doctor@hospital.com - Duration: 45ms
2025-10-01 15:31:02 - WARNING - POST /api/login/ - Status: 401 - User: Anonymous - Duration: 12ms
2025-10-01 15:31:15 - ERROR - GET /api/patients/999/ - Status: 500 - User: admin@hospital.com - Duration: 156ms
```

## Log Rotation:

- Log files are automatically rotated when they reach 10MB
- Up to 3 backup files are kept
- Configuration can be adjusted in the .env file:
  - LOG_MAX_BYTES: Maximum size before rotation (default: 10485760 = 10MB)
  - LOG_BACKUP_COUNT: Number of backup files to keep (default: 3)

## Log Levels:

- INFO: Successful API requests and general information
- WARNING: Client errors (4xx status codes) 
- ERROR: Server errors (5xx status codes) and application errors

Configure log levels in .env:
- LOG_LEVEL: Controls file logging level (default: INFO)
- CONSOLE_LOG_LEVEL: Controls console logging level (default: DEBUG)