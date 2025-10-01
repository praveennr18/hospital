# 🏥 Healthcare Pro - Enhanced Appointment Booking API Documentation

## Overview
This document provides comprehensive documentation for the enhanced appointment booking system that allows patients to schedule appointments with doctors across different departments.

## Base URL
```
http://127.0.0.1:8000/api/appointments/
```

## Authentication
All endpoints require JWT authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## 📅 **Enhanced Appointment Booking Endpoints**

### **1. Schedule New Appointment**
```
POST /api/appointments/schedule/
```

**Description:** Enhanced appointment booking with department selection, doctor preference, and automatic slot validation.

**Request Body:**
```json
{
    "department": "Cardiology",
    "preferred_doctor": "doctor_uuid_optional",
    "appointment_date": "2025-12-01",
    "preferred_time": "10:30",
    "appointment_type": "consultation",
    "reason_for_visit": "Follow-up for blood pressure management"
}
```

**Field Descriptions:**
- `department` (required): Department name (e.g., "Cardiology", "Neurology")
- `preferred_doctor` (optional): UUID of preferred doctor in the department
- `appointment_date` (required): Date in YYYY-MM-DD format
- `preferred_time` (required): Time in HH:MM format (24-hour)
- `appointment_type` (required): Type of appointment ("consultation", "follow_up", "check_up", "emergency")
- `reason_for_visit` (required): Reason for the appointment

**Success Response (201):**
```json
{
    "id": "appointment_uuid",
    "message": "Appointment scheduled successfully",
    "appointment": {
        "id": "appointment_uuid",
        "doctor": {
            "name": "Dr. Sarah Wilson",
            "specialization": "Cardiology",
            "department": "Cardiology"
        },
        "date": "2025-12-01",
        "time": "10:30:00",
        "status": "scheduled",
        "appointment_type": "consultation",
        "reason": "Follow-up for blood pressure management"
    },
    "confirmation_code": "APT-2025-001234"
}
```

**Error Responses:**
- `400`: Invalid data or time slot unavailable
- `403`: Only authenticated patients, doctors, and admins can schedule appointments
- `404`: Doctor not found or patient profile not found

---

### **2. Get Available Time Slots**
```
GET /api/appointments/available-slots/?doctor_id={uuid}&date={date}
```

**Description:** Get available time slots for a specific doctor on a specific date.

**Query Parameters:**
- `doctor_id` (required): Doctor's UUID
- `date` (required): Date in YYYY-MM-DD format

**Success Response (200):**
```json
{
    "doctor": {
        "id": "doctor_uuid",
        "name": "Dr. Sarah Wilson",
        "department": "Cardiology Department"
    },
    "date": "2025-12-01",
    "available_slots": [
        {
            "time": "09:00",
            "status": "available"
        },
        {
            "time": "09:30",
            "status": "available"
        },
        {
            "time": "10:00",
            "status": "available"
        },
        {
            "time": "10:30",
            "status": "available"
        },
        {
            "time": "11:00",
            "status": "booked"
        }
    ]
}
```

**Time Slot Information:**
- Time slots are generated from 9:00 AM to 5:00 PM
- 30-minute intervals
- Status: "available" or "booked"

---

### **3. Get Departments List**
```
GET /api/appointments/departments/
```

**Description:** Get list of all departments with active doctors.

**Success Response (200):**
```json
{
    "departments": [
        {
            "name": "Cardiology",
            "doctors_count": 5
        },
        {
            "name": "Neurology",
            "doctors_count": 3
        },
        {
            "name": "General Medicine",
            "doctors_count": 8
        },
        {
            "name": "Pediatrics",
            "doctors_count": 4
        }
    ]
}
```

---

### **4. Get Doctors by Department**
```
GET /api/appointments/doctors-by-department/?department={department_name}
```

**Description:** Get all active doctors in a specific department.

**Query Parameters:**
- `department` (required): Department name

**Success Response (200):**
```json
{
    "department": "Cardiology",
    "doctors": [
        {
            "id": "doctor_uuid",
            "name": "Dr. Sarah Wilson",
            "years_of_experience": 15,
            "consultation_fee": "250.00",
            "rating": 4.8
        },
        {
            "id": "doctor_uuid_2",
            "name": "Dr. John Smith",
            "years_of_experience": 12,
            "consultation_fee": "200.00",
            "rating": 4.6
        }
    ]
}
```

---

### **5. Cancel Appointment**
```
PATCH /api/appointments/{appointment_id}/cancel/
```

**Description:** Cancel an existing appointment.

**Request Body:**
```json
{
    "cancellation_reason": "Schedule conflict"
}
```

**Success Response (200):**
```json
{
    "message": "Appointment cancelled successfully",
    "appointment": {
        "id": "appointment_uuid",
        "status": "cancelled",
        "cancellation_reason": "Schedule conflict",
        "cancelled_at": "2025-11-14T10:00:00Z"
    }
}
```

**Permission Rules:**
- Patients can cancel their own appointments
- Doctors can cancel appointments assigned to them
- Admins can cancel any appointment
- Cannot cancel appointments that are already "cancelled" or "completed"

---

### **6. Reschedule Appointment**
```
PATCH /api/appointments/{appointment_id}/reschedule/
```

**Description:** Reschedule an existing appointment to a new date and time.

**Request Body:**
```json
{
    "new_date": "2025-12-02",
    "new_time": "14:00",
    "reschedule_reason": "Emergency conflict"
}
```

**Success Response (200):**
```json
{
    "message": "Appointment rescheduled successfully",
    "appointment": {
        "id": "appointment_uuid",
        "date": "2025-12-02",
        "time": "14:00:00",
        "status": "rescheduled",
        "reschedule_reason": "Emergency conflict",
        "rescheduled_at": "2025-11-14T10:00:00Z"
    }
}
```

**Validation:**
- New time slot must be available
- Cannot reschedule cancelled or completed appointments
- Automatic validation against doctor's schedule

---

## 🔄 **Appointment Status Flow**

1. **scheduled** → Initial status when appointment is created
2. **confirmed** → Doctor or staff confirms the appointment
3. **in_progress** → Appointment is currently happening
4. **completed** → Appointment finished successfully
5. **cancelled** → Appointment was cancelled
6. **no_show** → Patient didn't show up
7. **rescheduled** → Appointment was moved to different time

---

## 🚨 **Error Handling**

### Common Error Responses:

**400 Bad Request:**
```json
{
    "error": "The selected time slot is not available"
}
```

**403 Forbidden:**
```json
{
    "error": "Only patients, doctors, and admins can schedule appointments"
}
```

**404 Not Found:**
```json
{
    "error": "Doctor not found in the specified department"
}
```

**500 Internal Server Error:**
```json
{
    "error": "An unexpected error occurred"
}
```

---

## 📋 **Field Validation Rules**

### Appointment Types:
- `consultation` - Regular consultation
- `follow_up` - Follow-up appointment
- `check_up` - Health check-up
- `emergency` - Emergency consultation
- `procedure` - Medical procedure
- `therapy` - Therapy session

### Date/Time Validation:
- Appointments must be scheduled for future dates
- Time slots are 30-minute intervals
- Working hours: 9:00 AM to 5:00 PM
- No appointments on weekends (configurable)

### Department Names:
- Cardiology
- Neurology
- General Medicine
- Pediatrics
- Orthopedics
- Dermatology
- Emergency Medicine
- Oncology
- Psychiatry
- Radiology

---

## 🔐 **Security & Permissions**

### Patient Access:
- Can schedule appointments for themselves
- Can view their own appointments
- Can cancel their own appointments
- Can reschedule their own appointments (with restrictions)

### Doctor Access:
- Can view appointments assigned to them
- Can cancel appointments assigned to them
- Cannot schedule appointments for patients

### Admin Access:
- Full access to all appointment operations
- Can schedule appointments for any patient-doctor combination
- Can manage all appointments across the system

---

## 🧪 **Testing Examples**

### Example 1: Schedule Appointment
```bash
curl -X POST http://127.0.0.1:8000/api/appointments/schedule/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Cardiology",
    "appointment_date": "2025-12-01",
    "preferred_time": "10:30",
    "appointment_type": "consultation",
    "reason_for_visit": "Regular check-up"
  }'
```

### Example 2: Check Available Slots
```bash
curl -X GET "http://127.0.0.1:8000/api/appointments/available-slots/?doctor_id=DOCTOR_UUID&date=2025-12-01" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 3: Get Departments
```bash
curl -X GET http://127.0.0.1:8000/api/appointments/departments/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 **Integration Notes**

### Frontend Integration:
1. First, fetch departments list
2. Allow user to select department
3. Fetch doctors in selected department
4. Allow user to select preferred doctor (optional)
5. Fetch available slots for selected doctor and date
6. Allow user to select time slot
7. Submit appointment booking request

### Mobile App Integration:
- All endpoints support JSON requests/responses
- Proper HTTP status codes for error handling
- Pagination support where applicable
- Real-time slot availability checking

---

## 🔄 **Changelog**

### Version 2.0 (Current)
- Added enhanced appointment booking with department selection
- Implemented real-time slot availability checking
- Added appointment cancellation and rescheduling
- Improved error handling and validation
- Added confirmation codes
- Enhanced security and permissions

### Version 1.0 (Legacy)
- Basic appointment CRUD operations
- Simple doctor-patient appointment booking
- Basic status tracking