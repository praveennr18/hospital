# 🏥 HealthCare Pro - Patient API Documentation

## 👨‍⚕️ Patient Portal APIs

This documentation covers the essential patient endpoints that match the UI requirements: Dashboard, Medical History Management, and Appointment Booking.

---

## 🔐 **Authentication**

All patient endpoints require JWT authentication with patient role:

```
Authorization: Bearer <patient_access_token>
```

---

## 🏠 **1. Patient Dashboard**

### **Get Patient Dashboard Overview**
```
GET http://127.0.0.1:8000/api/patients/my/dashboard/
Authorization: Bearer patient_access_token
```

**Response:**
```json
{
    "patient_info": {
        "id": "patient_uuid",
        "name": "Sarah Johnson",
        "email": "sarah.johnson@email.com",
        "phone": "(555) 123-4567",
        "date_of_birth": "3/15/1985",
        "gender": "Female",
        "blood_group": "A+",
        "insurance_info": "Blue Cross Blue Shield - Policy #BC12345789",
        "address": "123 Main St, Springfield, IL 62701",
        "note": "To update personal information, please contact the administration office."
    },
    "health_summary": {
        "known_allergies": 2,
        "current_medications": 2,
        "medical_history": 2
    }
}
```

---

## 📋 **2. Medical History Management**

### **Get My Medical History**
```
GET http://127.0.0.1:8000/api/patients/my/medical-history/
Authorization: Bearer patient_access_token
```

**Response:**
```json
{
    "medical_history": [
        {
            "condition": "Hypertension"
        },
        {
            "condition": "Diabetes Type 2"
        }
    ],
    "total_count": 2
}
```

### **Add Medical History Entry**
```
POST http://127.0.0.1:8000/api/patients/my/medical-history/
Authorization: Bearer patient_access_token
Content-Type: application/json
```

**Request Body:**
```json
{
    "condition": "Diabetes Type 2"
}
```

### **Update Medical History Entry**
```
PUT http://127.0.0.1:8000/api/patients/my/medical-history/{history_id}/
Authorization: Bearer patient_access_token
Content-Type: application/json
```

### **Delete Medical History Entry**
```
DELETE http://127.0.0.1:8000/api/patients/my/medical-history/{history_id}/
Authorization: Bearer patient_access_token
```

---

## 🚨 **3. Allergies Management**

### **Get My Allergies**
```
GET http://127.0.0.1:8000/api/patients/my/allergies/
Authorization: Bearer patient_access_token
```

**Response:**
```json
{
    "allergies": [
        {
            "allergen": "Penicillin"
        },
        {
            "allergen": "Peanuts"
        }
    ],
    "total_count": 2
}
```

### **Add New Allergy**
```
POST http://127.0.0.1:8000/api/patients/my/allergies/
Authorization: Bearer patient_access_token
Content-Type: application/json
```

**Request Body:**
```json
{
    "allergen": "Shellfish"
}
```

### **Update Allergy**
```
PUT http://127.0.0.1:8000/api/patients/my/allergies/{allergy_id}/
Authorization: Bearer patient_access_token
Content-Type: application/json
```

### **Delete Allergy**
```
DELETE http://127.0.0.1:8000/api/patients/my/allergies/{allergy_id}/
Authorization: Bearer patient_access_token
```

---

## 💊 **4. Current Medications Management**

### **Get My Current Medications**
```
GET http://127.0.0.1:8000/api/patients/my/medications/
Authorization: Bearer patient_access_token
```

**Response:**
```json
{
    "medications": [
        {
            "medication_name": "Metformin 500mg",
            "dosage": "500mg"
        },
        {
            "medication_name": "Lisinopril 10mg",
            "dosage": "10mg"
        }
    ],
    "total_count": 2
}
```

### **Add New Medication**
```
POST http://127.0.0.1:8000/api/patients/my/medications/
Authorization: Bearer patient_access_token
Content-Type: application/json
```

**Request Body:**
```json
{
    "medication_name": "Vitamin D3",
    "dosage": "1000 IU"
}
```

### **Update Medication**
```
PUT http://127.0.0.1:8000/api/patients/my/medications/{medication_id}/
Authorization: Bearer patient_access_token
Content-Type: application/json
```

### **Delete/Stop Medication**
```
DELETE http://127.0.0.1:8000/api/patients/my/medications/{medication_id}/
Authorization: Bearer patient_access_token
```

---

## 📅 **5. Appointments Management**

### **Get My Appointments**
```
GET http://127.0.0.1:8000/api/patients/my/appointments/
Authorization: Bearer patient_access_token
```

**Response:**
```json
{
    "appointments": [
        {
            "id": "appointment_uuid",
            "doctor": {
                "name": "Dr. Sarah Wilson",
                "specialization": "Cardiology",
                "department": "Cardiology Department"
            },
            "date": "Nov 19, 2024",
            "time": "10:30 AM",
            "type": "Follow-up",
            "status": "scheduled",
            "reason": "Regular checkup"
        },
        {
            "id": "appointment_uuid_2",
            "doctor": {
                "name": "Dr. Michael Johnson", 
                "specialization": "Neurology",
                "department": "Neurology Department"
            },
            "date": "Nov 29, 2024",
            "time": "2:00 PM",
            "type": "Consultation",
            "status": "scheduled",
            "reason": "Consultation"
        }
    ],
    "total_count": 2
}
```

### **Schedule New Appointment**
```
POST http://127.0.0.1:8000/api/appointments/schedule/
Authorization: Bearer patient_access_token
Content-Type: application/json
```

**Request Body:**
```json
{
    "department": "cardiology",
    "doctor_id": "doctor_uuid",
    "appointment_date": "2025-11-19",
    "preferred_time": "10:30",
    "appointment_type": "follow-up",
    "reason": "Regular checkup for blood pressure monitoring"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Appointment scheduled successfully",
    "appointment": {
        "id": "appointment_uuid",
        "confirmation_code": "APT123456",
        "doctor": "Dr. Sarah Wilson",
        "department": "Cardiology Department",
        "date": "Nov 19, 2025",
        "time": "10:30 AM",
        "type": "Follow-up",
        "status": "scheduled"
    }
}
```

---

## 🏥 **6. Appointment Booking Helpers**

### **Get Departments List**
```
GET http://127.0.0.1:8000/api/appointments/departments/
Authorization: Bearer patient_access_token
```

**Response:**
```json
{
    "departments": [
        {
            "id": "cardiology",
            "name": "Cardiology Department",
            "specialization": "cardiology"
        },
        {
            "id": "neurology", 
            "name": "Neurology Department",
            "specialization": "neurology"
        },
        {
            "id": "general_medicine",
            "name": "General Medicine Department", 
            "specialization": "general_medicine"
        }
    ]
}
```

### **Get Doctors by Department**
```
GET http://127.0.0.1:8000/api/appointments/doctors-by-department/
Authorization: Bearer patient_access_token
```

**Query Parameters:**
- `department` (required): Department ID

**Response:**
```json
{
    "doctors": [
        {
            "id": "doctor_uuid",
            "name": "Dr. Sarah Wilson",
            "specialization": "Cardiology",
            "department": "Cardiology Department",
            "years_of_experience": 15,
            "is_available": true
        }
    ]
}
```

### **Get Available Time Slots**
```
GET http://127.0.0.1:8000/api/appointments/available-slots/
Authorization: Bearer patient_access_token
```

**Query Parameters:**
- `doctor_id` (required): Doctor UUID
- `date` (required): Date in YYYY-MM-DD format

**Response:**
```json
{
    "available_slots": [
        {
            "time": "09:00:00",
            "display_time": "9:00 AM",
            "available": true
        },
        {
            "time": "10:30:00", 
            "display_time": "10:30 AM",
            "available": true
        },
        {
            "time": "14:00:00",
            "display_time": "2:00 PM", 
            "available": true
        }
    ],
    "date": "2025-11-19"
}
```

---

## ✅ **Key Features**

✅ **Patient Dashboard**: Personal info and health summary with counts  
✅ **Self-Management**: Add/edit medical history, allergies, and medications  
✅ **Appointment Booking**: Department-based booking with doctor selection  
✅ **Appointment Management**: View upcoming and past appointments  
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
    "detail": "Medical history entry not found."
}
```

**400 Bad Request:**
```json
{
    "field_name": ["This field is required."],
    "diagnosed_date": ["Date must be in YYYY-MM-DD format."]
}
```

---

## 📚 **Usage Examples**

**Example curl command:**
```bash
curl -X GET "http://127.0.0.1:8000/api/patients/my/dashboard/" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -H "Content-Type: application/json"
```

This streamlined API documentation focuses only on the features visible in the UI, providing a clean patient portal experience focused on self-management and appointment booking. 🏥👨‍⚕️