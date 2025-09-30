from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta, date
from django.db.models import Q, Count

from doctors.models import Doctor, Availability
from patients.models import PatientProfile, MedicalHistory, Allergy, Medication
from appointments.models import Appointment


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_dashboard(request):
    """
    Doctor Dashboard - Shows today's patient count and schedule
    Matches the Dashboard UI screen
    """
    if request.user.role != 'doctor':
        return Response(
            {"error": "Access denied. Doctor role required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response(
            {"error": "Doctor profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    today = timezone.now().date()
    
    # Get today's appointments
    today_appointments = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=today
    ).select_related('patient__user').order_by('appointment_time')
    
    # Count different statuses
    scheduled_count = today_appointments.filter(status='scheduled').count()
    completed_count = today_appointments.filter(status='completed').count()
    pending_count = today_appointments.filter(status__in=['scheduled', 'confirmed']).count()
    
    # Serialize today's schedule
    schedule_data = []
    for appointment in today_appointments:
        schedule_data.append({
            'id': str(appointment.id),
            'time': appointment.appointment_time.strftime('%I:%M %p'),
            'patient': {
                'id': str(appointment.patient.id),
                'name': appointment.patient.user.get_full_name()
            },
            'type': appointment.get_appointment_type_display() or 'Consultation',
            'status': appointment.status
        })
    
    return Response({
        'doctor_info': {
            'id': str(doctor.id),
            'name': f"Dr. {doctor.user.get_full_name()}",
            'specialization': doctor.get_specialization_display(),
            'department': doctor.department or f"{doctor.get_specialization_display()} Department"
        },
        'today_stats': {
            'scheduled_appointments': scheduled_count,
            'completed_appointments': completed_count,
            'pending_appointments': pending_count
        },
        'today_schedule': schedule_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_appointments(request):
    """
    Doctor Appointments - View and filter all appointments
    Matches the Appointments UI screen with filtering
    """
    if request.user.role != 'doctor':
        return Response(
            {"error": "Access denied. Doctor role required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response(
            {"error": "Doctor profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get filter parameters
    status_filter = request.GET.get('status', 'all')  # all, scheduled, completed, cancelled, no-show
    type_filter = request.GET.get('type', 'all')  # all, consultation, follow-up, procedure
    date_filter = request.GET.get('date')  # specific date YYYY-MM-DD
    period_filter = request.GET.get('period', 'all')  # all, today, week, upcoming
    
    # Base queryset
    appointments = Appointment.objects.filter(
        doctor=doctor
    ).select_related('patient__user').order_by('-appointment_date', '-appointment_time')
    
    # Apply filters
    if status_filter != 'all':
        appointments = appointments.filter(status=status_filter)
    
    if type_filter != 'all':
        appointments = appointments.filter(appointment_type=type_filter)
    
    if date_filter:
        try:
            filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
            appointments = appointments.filter(appointment_date=filter_date)
        except ValueError:
            pass
    
    # Period filtering
    today = timezone.now().date()
    if period_filter == 'today':
        appointments = appointments.filter(appointment_date=today)
    elif period_filter == 'week':
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        appointments = appointments.filter(
            appointment_date__range=[week_start, week_end]
        )
    elif period_filter == 'upcoming':
        appointments = appointments.filter(appointment_date__gte=today)
    
    # Serialize appointments
    appointments_data = []
    for appointment in appointments:
        appointments_data.append({
            'id': str(appointment.id),
            'date': appointment.appointment_date.strftime('%b %d, %Y'),
            'time': appointment.appointment_time.strftime('%H:%M'),
            'patient': {
                'id': str(appointment.patient.id),
                'name': appointment.patient.user.get_full_name(),
                'email': appointment.patient.user.email,
                'phone': appointment.patient.phone_number or 'Not provided'
            },
            'type': appointment.get_appointment_type_display() or 'consultation',
            'department': doctor.department or f"{doctor.get_specialization_display()} Department",
            'status': appointment.status,
            'reason': appointment.reason or appointment.chief_complaint or 'General consultation',
            'notes': appointment.notes or ''
        })
    
    return Response({
        'appointments': appointments_data,
        'total': len(appointments_data),
        'filters': {
            'available_statuses': ['scheduled', 'completed', 'cancelled', 'no-show'],
            'available_types': ['consultation', 'follow-up', 'procedure']
        }
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_appointment_status(request, appointment_id):
    """
    Update appointment status (Complete, No Show, Cancel actions)
    """
    if request.user.role != 'doctor':
        return Response(
            {"error": "Access denied. Doctor role required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doctor = Doctor.objects.get(user=request.user)
        appointment = Appointment.objects.get(id=appointment_id, doctor=doctor)
    except (Doctor.DoesNotExist, Appointment.DoesNotExist):
        return Response(
            {"error": "Appointment not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    new_status = request.data.get('status')
    doctor_notes = request.data.get('doctor_notes', '')
    
    # Validate status transitions
    valid_statuses = ['scheduled', 'completed', 'cancelled', 'no-show']
    if new_status not in valid_statuses:
        return Response(
            {"error": "Invalid status. Must be one of: scheduled, completed, cancelled, no-show"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update appointment
    appointment.status = new_status
    if doctor_notes:
        appointment.doctor_notes = doctor_notes
    appointment.save()
    
    return Response({
        'message': 'Appointment status updated successfully',
        'appointment': {
            'id': str(appointment.id),
            'status': appointment.status,
            'doctor_notes': appointment.doctor_notes
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_patients(request):
    """
    My Patients - List of all patients assigned to doctor
    Matches the My Patients UI screen
    """
    if request.user.role != 'doctor':
        return Response(
            {"error": "Access denied. Doctor role required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response(
            {"error": "Doctor profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get search parameters
    search = request.GET.get('search', '')
    blood_group = request.GET.get('blood_group', '')
    page = int(request.GET.get('page', 1))
    per_page = 10
    
    # Get patients who have appointments with this doctor
    patients_query = PatientProfile.objects.filter(
        appointments__doctor=doctor
    ).select_related('user').distinct()
    
    # Apply search filter
    if search:
        patients_query = patients_query.filter(
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search) |
            Q(user__email__icontains=search) |
            Q(phone_number__icontains=search)
        )
    
    # Apply blood group filter
    if blood_group:
        patients_query = patients_query.filter(blood_group=blood_group)
    
    # Pagination
    total_patients = patients_query.count()
    start_index = (page - 1) * per_page
    end_index = start_index + per_page
    patients = patients_query[start_index:end_index]
    
    # Serialize patients
    patients_data = []
    for patient in patients:
        # Get last visit
        last_appointment = Appointment.objects.filter(
            patient=patient, 
            doctor=doctor,
            status='completed'
        ).order_by('-appointment_date', '-appointment_time').first()
        
        patients_data.append({
            'id': str(patient.id),
            'name': patient.user.get_full_name(),
            'age': f"{patient.age} years" if patient.age else 'Unknown',
            'gender': patient.get_gender_display() if patient.gender else 'Not specified',
            'blood_group': patient.blood_group or 'Unknown',
            'contact': {
                'phone': patient.phone_number or 'Not provided',
                'email': patient.user.email
            },
            'last_visit': last_appointment.appointment_date.strftime('%m/%d/%Y') if last_appointment else 'No visits'
        })
    
    total_pages = (total_patients + per_page - 1) // per_page
    
    return Response({
        'patients': patients_data,
        'total': total_patients,
        'page': page,
        'total_pages': total_pages
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_details(request, patient_id):
    """
    Patient Details - Overview and Medical History tabs
    Matches the Patient Details UI screen
    """
    if request.user.role != 'doctor':
        return Response(
            {"error": "Access denied. Doctor role required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doctor = Doctor.objects.get(user=request.user)
        patient = PatientProfile.objects.select_related('user').get(id=patient_id)
        
        # Verify doctor has access to this patient
        has_access = Appointment.objects.filter(
            doctor=doctor, 
            patient=patient
        ).exists()
        
        if not has_access:
            return Response(
                {"error": "You don't have access to this patient's information."},
                status=status.HTTP_403_FORBIDDEN
            )
            
    except (Doctor.DoesNotExist, PatientProfile.DoesNotExist):
        return Response(
            {"error": "Patient not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get patient's medical information
    medical_history = MedicalHistory.objects.filter(patient=patient).order_by('-created_at')
    allergies = Allergy.objects.filter(patient=patient).order_by('-created_at')
    medications = Medication.objects.filter(patient=patient, is_active=True).order_by('-created_at')
    
    # Serialize patient details
    patient_data = {
        'id': str(patient.id),
        'name': patient.user.get_full_name(),
        'patient_id': str(patient.id)[:8],  # Short ID for display
        'age': f"{patient.age} years" if patient.age else 'Unknown',
        'gender': patient.get_gender_display() if patient.gender else 'Not specified',
        'personal_info': {
            'full_name': patient.user.get_full_name(),
            'date_of_birth': patient.date_of_birth.strftime('%m/%d/%Y') if patient.date_of_birth else 'Not provided',
            'blood_type': patient.blood_group or 'Unknown',
            'email': patient.user.email,
            'phone': patient.phone_number or 'Not provided',
            'insurance_info': f"{patient.insurance_provider} - Policy #{patient.policy_number}" if patient.insurance_provider else 'Not provided',
            'address': f"{patient.address}, {patient.city}, {patient.state} {patient.zip_code}" if patient.address else 'Not provided',
            'emergency_contact': {
                'name': patient.emergency_contact_name or 'Not provided',
                'phone': patient.emergency_contact_phone or 'Not provided'
            }
        },
        'health_summary': {
            'known_allergies': allergies.count(),
            'current_medications': medications.count(),
            'medical_history': medical_history.count()
        }
    }
    
    # Serialize medical history
    history_data = []
    for history in medical_history:
        history_data.append({
            'id': str(history.id),
            'condition': history.condition,
            'diagnosed_date': history.date.strftime('%b %d, %Y'),
            'status': 'Ongoing',  # Could be derived from data
            'notes': history.description or 'No additional notes'
        })
    
    # Serialize allergies
    allergies_data = []
    for allergy in allergies:
        allergies_data.append({
            'id': str(allergy.id),
            'allergen': allergy.allergen,
            'severity': allergy.severity,
            'reaction': allergy.reaction
        })
    
    # Serialize medications
    medications_data = []
    for medication in medications:
        medications_data.append({
            'id': str(medication.id),
            'medication_name': medication.medication_name,
            'dosage': medication.dosage,
            'frequency': medication.frequency,
            'prescribed_date': medication.prescribed_date.strftime('%b %d, %Y')
        })
    
    return Response({
        'patient': patient_data,
        'medical_history': history_data,
        'allergies': allergies_data,
        'current_medications': medications_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_availability(request):
    """
    Availability Management - Weekly schedule configuration
    Matches the Availability Management UI screen
    """
    if request.user.role != 'doctor':
        return Response(
            {"error": "Access denied. Doctor role required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response(
            {"error": "Doctor profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get week parameter (defaults to current week)
    week_param = request.GET.get('week')
    if week_param:
        try:
            week_start = datetime.strptime(week_param, '%Y-%m-%d').date()
        except ValueError:
            week_start = timezone.now().date() - timedelta(days=timezone.now().date().weekday())
    else:
        week_start = timezone.now().date() - timedelta(days=timezone.now().date().weekday())
    
    # Get availability records for the doctor
    availabilities = Availability.objects.filter(doctor=doctor)
    
    # Build weekly schedule
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    weekly_schedule = {}
    
    for day in days:
        day_availabilities = availabilities.filter(day_of_week=day.capitalize())
        
        time_slots = []
        for availability in day_availabilities:
            time_slots.append({
                'id': str(availability.id),
                'start_time': availability.start_time.strftime('%H:%M'),
                'end_time': availability.end_time.strftime('%H:%M'),
                'available': availability.is_available
            })
        
        weekly_schedule[day] = {
            'active': len(time_slots) > 0,
            'time_slots': time_slots
        }
    
    return Response({
        'weekly_schedule': weekly_schedule
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_availability(request):
    """
    Update weekly schedule configuration
    """
    if request.user.role != 'doctor':
        return Response(
            {"error": "Access denied. Doctor role required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response(
            {"error": "Doctor profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    weekly_schedule = request.data.get('weekly_schedule', {})
    
    # Clear existing availability
    Availability.objects.filter(doctor=doctor).delete()
    
    # Create new availability records
    for day, schedule_data in weekly_schedule.items():
        if schedule_data.get('active', False):
            time_slots = schedule_data.get('time_slots', [])
            for slot in time_slots:
                Availability.objects.create(
                    doctor=doctor,
                    day_of_week=day.capitalize(),
                    start_time=slot['start_time'],
                    end_time=slot['end_time'],
                    is_available=slot.get('available', True)
                )
    
    return Response({
        'message': 'Schedule updated successfully'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_time_slot(request):
    """
    Add a new time slot to a specific day
    """
    if request.user.role != 'doctor':
        return Response(
            {"error": "Access denied. Doctor role required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response(
            {"error": "Doctor profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    day = request.data.get('day')
    start_time = request.data.get('start_time')
    end_time = request.data.get('end_time')
    available = request.data.get('available', True)
    
    if not all([day, start_time, end_time]):
        return Response(
            {"error": "Day, start_time, and end_time are required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create new availability slot
    availability = Availability.objects.create(
        doctor=doctor,
        day_of_week=day.capitalize(),
        start_time=start_time,
        end_time=end_time,
        is_available=available
    )
    
    return Response({
        'message': 'Time slot added successfully',
        'slot': {
            'id': str(availability.id),
            'day': day,
            'start_time': start_time,
            'end_time': end_time,
            'available': available
        }
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_time_slot(request, slot_id):
    """
    Remove a specific time slot
    """
    if request.user.role != 'doctor':
        return Response(
            {"error": "Access denied. Doctor role required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doctor = Doctor.objects.get(user=request.user)
        availability = Availability.objects.get(id=slot_id, doctor=doctor)
    except (Doctor.DoesNotExist, Availability.DoesNotExist):
        return Response(
            {"error": "Time slot not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    availability.delete()
    
    return Response({
        'message': 'Time slot removed successfully'
    })