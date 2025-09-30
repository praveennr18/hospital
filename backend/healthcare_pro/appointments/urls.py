from django.urls import path
from .views import appointment_views, schedule_views, reminder_views, booking_views

urlpatterns = [
    # Appointment management
    path('', appointment_views.AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('<uuid:pk>/', appointment_views.AppointmentDetailView.as_view(), name='appointment-detail'),
    
    # New appointment booking system
    path('schedule/', booking_views.schedule_appointment, name='schedule-appointment'),
    path('available-slots/', booking_views.get_available_slots, name='get-available-slots'),
    path('departments/', booking_views.get_departments, name='get-departments'),
    path('doctors-by-department/', booking_views.get_doctors_by_department, name='get-doctors-by-department'),
    path('<uuid:appointment_id>/cancel/', booking_views.cancel_appointment, name='cancel-appointment'),
    path('<uuid:appointment_id>/reschedule/', booking_views.reschedule_appointment, name='reschedule-appointment'),
    
    # Appointment slots and scheduling (legacy)
    path('slots/', schedule_views.AppointmentSlotListCreateView.as_view(), name='appointment-slots'),
    path('legacy-available-slots/', schedule_views.available_slots, name='legacy-available-slots'),
    
    # User-specific endpoints
    path('my/', appointment_views.my_appointments, name='my-appointments'),
    path('upcoming/', schedule_views.upcoming_appointments, name='upcoming-appointments'),
    
    # Appointment reminders
    path('<uuid:appointment_id>/reminders/', reminder_views.AppointmentReminderListCreateView.as_view(), name='appointment-reminders'),
    path('reminders/<uuid:pk>/', reminder_views.AppointmentReminderDetailView.as_view(), name='appointment-reminder-detail'),
]