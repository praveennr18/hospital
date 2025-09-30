from django.urls import path
from .views import simplified_patient_views
from appointments.views import booking_views

urlpatterns = [
    # Patient Dashboard (matches Overview tab in UI)
    path('my/dashboard/', simplified_patient_views.patient_dashboard, name='patient-dashboard'),
    
    # Medical History Management (matches Medical History tab)
    path('my/medical-history/', simplified_patient_views.medical_history_management, name='patient-medical-history'),
    path('my/medical-history/<uuid:history_id>/', simplified_patient_views.medical_history_detail, name='patient-medical-history-detail'),
    
    # Allergies Management (part of Medical History tab)
    path('my/allergies/', simplified_patient_views.allergies_management, name='patient-allergies'),
    path('my/allergies/<uuid:allergy_id>/', simplified_patient_views.allergy_detail, name='patient-allergy-detail'),
    
    # Medications Management (part of Medical History tab) 
    path('my/medications/', simplified_patient_views.medications_management, name='patient-medications'),
    path('my/medications/<uuid:medication_id>/', simplified_patient_views.medication_detail, name='patient-medication-detail'),
    
    # Appointments Management (matches Appointments tab)
    path('my/appointments/', simplified_patient_views.my_appointments, name='patient-appointments'),
]