from django.urls import path
from .views import simplified_views

urlpatterns = [
    # Doctor Dashboard (matches Dashboard UI)
    path('my/dashboard/', simplified_views.doctor_dashboard, name='doctor-dashboard'),
    
    # Appointments Management (matches Appointments UI)
    path('my/appointments/', simplified_views.doctor_appointments, name='doctor-appointments'),
    path('my/appointments/<uuid:appointment_id>/', simplified_views.update_appointment_status, name='update-appointment-status'),
    
    # Patient Management (matches My Patients UI)
    path('my/patients/', simplified_views.doctor_patients, name='doctor-patients'),
    path('my/patients/<int:patient_id>/', simplified_views.patient_details, name='patient-details'),
    
    # Availability Management (matches Availability Management UI)
    path('my/availability/', simplified_views.combined_availability, name='doctor-availability'),
    path('my/availability/add-slot/', simplified_views.add_time_slot, name='add-time-slot'),
    path('my/availability/slots/<uuid:slot_id>/', simplified_views.remove_time_slot, name='remove-time-slot'),
]