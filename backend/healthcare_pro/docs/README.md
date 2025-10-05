# Healthcare Pro Documentation

This directory contains all documentation for the Healthcare Pro application.

## 📂 Directory Structure

### 📋 API Documentation (`/api/`)
- **`overview.md`** – API overview and general information
- **`admin_api.md`** – Administrator endpoints (stats, rosters, appointment management)
- **`doctor_api.md`** – Doctor dashboards, appointments, patients, availability  
- **`patient_api.md`** – Patient dashboards, records, and appointments
- **`appointment_booking.md`** – Shared appointment scheduling and slot lookup

### 🛠️ Development Documentation (`/development/`)
- **`logging.md`** – Logging system documentation
- **`project_organization.md`** – Django app responsibilities and boundaries
- **`views_structure.md`** – Application views structure
- **`role_logging_complete.md`** – Role-based logging walkthrough

### ⚙️ Setup Documentation (`/setup/`)
- Environment bootstrapping and deployment notes (coming soon)

## 📖 Quick Links

- [Project Organization](development/project_organization.md) – High-level app map
- [Logging System](development/logging.md) – Learn about the structured logging
- [Views Structure](development/views_structure.md) – Understand the application architecture

### For API Users
- [API Overview](api/overview.md) – Start here for API basics
- [Doctor API](api/doctor_api.md) – Doctor dashboards, appointments, and availability
- [Patient API](api/patient_api.md) – Patient dashboards and medical records  
- [Admin API](api/admin_api.md) – Administrative endpoints and stats
- [Appointment Booking](api/appointment_booking.md) – Appointment management flows

## 🚀 Getting Started

1. Read the [API Overview](api/overview.md) for general API information.
2. Review your role’s API doc for endpoint specifics.
3. Consult [project_organization.md](development/project_organization.md) to understand where new code should live.
4. Use the integration guide in the repository root for frontend/backed wiring tips.

## 📝 Documentation Standards

- All API endpoints are documented with request/response examples.
- Environment variables and expected headers are captured alongside endpoints.
- Code snippets mirror the production integrations in `frontend2/react_app`.
- Error handling and standard response codes are listed for each route.

---

**Last Updated**: October 2025  
**Version**: Doctor & Admin dashboard refresh