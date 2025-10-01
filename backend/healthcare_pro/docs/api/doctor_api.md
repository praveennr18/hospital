# 👨‍⚕️ HealthCare Pro - Doctor API Documentation

## 🩺 Doctor Portal APIs

This documentation covers the essential doctor endpoints that match the UI requirements: Dashboard, Appointments, Patient Management, and Availability Management.

---

## 🔐 **Authentication**

All doctor endpoints require JWT authentication with doctor role:

```
Authorization: Bearer <doctor_access_token>
```

---

## 📊 **1. Doctor Dashboard**

### **Get Dashboard Overview**
```
GET http://127.0.0.1:8000/api/doctors/my/dashboard/
Authorization: Bearer doctor_access_token
```

**Response:**
```json
{
    "doctor_info": {
        "id": "doctor_uuid",
        "name": "Dr. Sarah Wilson",
        "specialization": "Cardiology",
        "department": "Cardiology Department"
    },
    "today_stats": {
        "scheduled_appointments": 8,
        "completed_appointments": 3,
        "pending_appointments": 5
    },
    "today_schedule": [
        {
            "id": "appointment_uuid",
            "time": "09:00 AM",
            "patient": {
                "id": "patient_uuid",
                "name": "John Smith"
            },
            "type": "Consultation",
            "status": "scheduled"
        },
        {
            "id": "appointment_uuid_2", 
            "time": "10:30 AM",
            "patient": {
                "id": "patient_uuid_2",
                "name": "Mary Johnson"
            },
            "type": "Follow-up",
            "status": "completed"
        }
    ]
}
```

---

## 📅 **2. Appointment Management**

### **Get All My Appointments**
```
GET http://127.0.0.1:8000/api/doctors/my/appointments/
Authorization: Bearer doctor_access_token
```

**Query Parameters:**
- `status` (optional): Filter by status (scheduled, completed, cancelled, no-show)
- `type` (optional): Filter by type (consultation, follow-up, procedure)
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `period` (optional): Filter by period (all, today, week, upcoming)

**Response:**
```json
{
    "appointments": [
        {
            "id": "appointment_uuid",
            "date": "Mar 25, 2024",
            "time": "09:00",
            "patient": {
                "id": "patient_uuid",
                "name": "Sarah Johnson",
                "email": "sarah.johnson@email.com",
                "phone": "(555) 123-4567"
            },
            "type": "follow-up",
            "department": "General Medicine",
            "status": "scheduled",
            "reason": "Regular checkup",
            "notes": "Patient requested follow-up for blood pressure monitoring"
        }
    ],
    "total": 25,
    "filters": {
        "available_statuses": ["scheduled", "completed", "cancelled", "no-show"],
        "available_types": ["consultation", "follow-up", "procedure"]
    }
}
```

### **Schedule New Appointment for Patient**
```
POST http://127.0.0.1:8000/api/appointments/schedule/
Authorization: Bearer doctor_access_token
Content-Type: application/json
```

**Request Body:**
```json
{
    "patient_id": 1,
    "department": "Cardiology",
    "doctor_id": "6f118b76-0dfb-44d9-be40-5be389f337d5",
    "appointment_date": "2024-03-25",
    "appointment_time": "09:00",
    "appointment_type": "consultation",
    "reason": "Regular checkup for heart condition",
    "notes": "Patient requested follow-up appointment"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Appointment scheduled successfully",
    "appointment": {
        "id": "appointment_uuid",
        "patient_name": "Sarah Johnson",
        "doctor_name": "Dr. John Smith",
        "date": "Mar 25, 2024",
        "time": "09:00",
        "type": "consultation",
        "status": "scheduled"
    }
}
```

### **Update Appointment Status**
```
PATCH http://127.0.0.1:8000/api/doctors/my/appointments/{appointment_id}/
Authorization: Bearer doctor_access_token
Content-Type: application/json
```

**Request Body:**
```json
{
    "status": "completed",
    "doctor_notes": "Patient examined, blood pressure normal, prescribed medication"
}
```

**Available Status Updates:**
- `scheduled` → `completed`, `no-show`, `cancelled`
- `completed` → Cannot be changed
- `cancelled` → Cannot be changed
- `no-show` → Cannot be changed

### **Cancel Appointment**
```
PATCH http://127.0.0.1:8000/api/doctors/my/appointments/{appointment_id}/cancel/
Authorization: Bearer doctor_access_token
Content-Type: application/json
```

**Request Body:**
```json
{
    "cancellation_reason": "Doctor emergency - rescheduling required",
    "cancelled_by": "doctor"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Appointment cancelled successfully",
    "appointment": {
        "id": "appointment_uuid",
        "status": "cancelled",
        "cancellation_reason": "Doctor emergency - rescheduling required",
        "cancelled_by": "doctor",
        "cancelled_at": "2024-03-20T10:30:00Z"
    }
}

---

## 👥 **3. Patient Management**

### **Get My Patients List**
```
GET http://127.0.0.1:8000/api/doctors/my/patients/
Authorization: Bearer doctor_access_token
```

**Query Parameters:**
- `search` (optional): Search by name, email, or phone
- `blood_group` (optional): Filter by blood group
- `page` (optional): Page number for pagination

**Response:**
```json
{
    "patients": [
        {
            "id": "1",
            "name": "Sarah Johnson",
            "age": "40 years",
            "gender": "Female",
            "blood_group": "A+",
            "contact": {
                "phone": "(555) 123-4567",
                "email": "sarah.johnson@email.com"
            },
            "last_visit": "3/15/2024"
        },
        {
            "id": "2",
            "name": "Michael Chen",
            "age": "53 years", 
            "gender": "Male",
            "blood_group": "O-",
            "contact": {
                "phone": "(555) 234-5678",
                "email": "michael.chen@email.com"
            },
            "last_visit": "3/10/2024"
        }
    ],
    "total": 156,
    "page": 1,
    "total_pages": 16
}
```

### **Get Patient Details**
```
GET http://127.0.0.1:8000/api/doctors/my/patients/{patient_id}/
Authorization: Bearer doctor_access_token
```

**Note:** `patient_id` should be an integer (e.g., `1`, `2`, `3`), not a UUID.

**Response:**
```json
{
    "patient": {
        "id": "1",
        "name": "Sarah Johnson",
        "patient_id": "1",
        "age": "40 years",
        "gender": "female",
        "personal_info": {
            "full_name": "Sarah Johnson",
            "date_of_birth": "3/15/1985",
            "blood_type": "A+",
            "email": "sarah.johnson@email.com",
            "phone": "(555) 123-4567",
            "insurance_info": "Blue Cross Blue Shield - Policy #BC12345789",
            "address": "123 Main St, Springfield, IL 62701",
            "emergency_contact": {
                "name": "John Johnson",
                "phone": "(555) 123-4568"
            }
        },
        "health_summary": {
            "known_allergies": 2,
            "current_medications": 2,
            "medical_history": 2
        }
    },
    "medical_history": [
        {
            "id": "history_uuid",
            "condition": "Hypertension"
        },
        {
            "id": "history_uuid_2",
            "condition": "Diabetes Type 2"
        }
    ],
    "allergies": [
        {
            "id": "allergy_uuid",
            "allergen": "Penicillin"
        },
        {
            "id": "allergy_uuid_2",
            "allergen": "Peanuts"
        }
    ],
    "current_medications": [
        {
            "id": "medication_uuid",
            "medication_name": "Metformin 500mg",
            "dosage": "500mg"
        },
        {
            "id": "medication_uuid_2",
            "medication_name": "Lisinopril 10mg",
            "dosage": "10mg"
        }
    ]
}
```

---

## 🗓️ **4. Availability Management**

### **Get My Weekly Schedule**
```
GET http://127.0.0.1:8000/api/doctors/my/availability/
Authorization: Bearer doctor_access_token
```

**Query Parameters:**
- `week` (optional): Week start date (YYYY-MM-DD), defaults to current week

**Response:**
```json
{
    "weekly_schedule": {
        "monday": {
            "active": true,
            "time_slots": [
                {
                    "id": "slot_uuid",
                    "start_time": "09:00",
                    "end_time": "12:00",
                    "available": true
                },
                {
                    "id": "slot_uuid_2",
                    "start_time": "14:00", 
                    "end_time": "17:00",
                    "available": true
                }
            ]
        },
        "tuesday": {
            "active": true,
            "time_slots": [
                {
                    "id": "slot_uuid_3",
                    "start_time": "09:00",
                    "end_time": "12:00", 
                    "available": true
                }
            ]
        },
        "wednesday": {
            "active": true,
            "time_slots": [
                {
                    "id": "slot_uuid_4",
                    "start_time": "09:00",
                    "end_time": "12:00",
                    "available": true
                },
                {
                    "id": "slot_uuid_5",
                    "start_time": "14:00",
                    "end_time": "17:00",
                    "available": true
                }
            ]
        },
        "thursday": {
            "active": false,
            "time_slots": []
        },
        "friday": {
            "active": false,
            "time_slots": []
        },
        "saturday": {
            "active": false, 
            "time_slots": []
        },
        "sunday": {
            "active": false,
            "time_slots": []
        }
    }
}
```

### **Update Weekly Schedule**
```
PUT http://127.0.0.1:8000/api/doctors/my/availability/
POST http://127.0.0.1:8000/api/doctors/my/availability/
Authorization: Bearer doctor_access_token
Content-Type: application/json
```

**Request Body:**
```json
{
    "weekly_schedule": {
        "monday": {
            "active": true,
            "time_slots": [
                {
                    "start_time": "09:00",
                    "end_time": "12:00",
                    "available": true
                },
                {
                    "start_time": "14:00",
                    "end_time": "17:00", 
                    "available": true
                }
            ]
        },
        "tuesday": {
            "active": true,
            "time_slots": [
                {
                    "start_time": "09:00",
                    "end_time": "12:00",
                    "available": true
                }
            ]
        }
    }
}
```

### **Add Time Slot**
```
POST http://127.0.0.1:8000/api/doctors/my/availability/add-slot/
Authorization: Bearer doctor_access_token
Content-Type: application/json
```

**Request Body:**
```json
{
    "day": "monday",
    "start_time": "18:00",
    "end_time": "20:00",
    "available": true
}
```

### **Remove Time Slot**
```
DELETE http://127.0.0.1:8000/api/doctors/my/availability/slots/{slot_id}/
Authorization: Bearer doctor_access_token
```

---

## ✅ **Key Features**

✅ **Simplified Dashboard**: Today's schedule and patient count  
✅ **Appointment Management**: View, filter, and update appointment status  
✅ **Appointment Scheduling**: Schedule new appointments for patients  
✅ **Appointment Cancellation**: Cancel appointments with valid reasons  
✅ **Patient Directory**: Access to patient list and detailed information  
✅ **Availability Control**: Weekly schedule management with time slots  
✅ **Clean UI-focused APIs**: Only endpoints that match the actual UI requirements  

---

## 📱 **Error Handling**

### **Common Error Responses:**

**401 Unauthorized:**
```json
{
    "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden:**
```json
{
    "detail": "You do not have permission to perform this action."
}
```

**404 Not Found:**
```json
{
    "detail": "Patient not found."
}
```

**400 Bad Request:**
```json
{
    "field_name": ["This field is required."],
    "time_slot": ["Start time must be before end time."]
}
```

---

## 📚 **Usage Examples**

**Example curl command:**
```bash
curl -X GET "http://127.0.0.1:8000/api/doctors/my/dashboard/" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -H "Content-Type: application/json"
```

This streamlined API documentation focuses only on the features visible in the UI, removing unnecessary complexity while maintaining full functionality for the doctor portal. 🩺👨‍⚕️