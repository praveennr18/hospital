from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta, date, time as dt_time
from django.db.models import Q, Count
from decouple import config

from doctors.models import Doctor, Availability
from patients.models import PatientProfile, MedicalHistory, Allergy, Medication
from appointments.models import Appointment


DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']


def _normalize_day(value):
    if value is None:
        return None
    if isinstance(value, (list, tuple)) and value:
        value = value[0]
    text = str(value).strip().lower()
    return text or None


def _parse_time_value(value):
    if value is None:
        return None
    if isinstance(value, dt_time):
        return value
    if isinstance(value, str):
        cleaned = value.strip()
        if not cleaned:
            return None
        for fmt in ('%H:%M', '%H:%M:%S', '%I:%M %p', '%I %p'):
            try:
                return datetime.strptime(cleaned, fmt).time()
            except ValueError:
                continue
    return None


def _format_time_value(value):
    parsed = _parse_time_value(value)
    return parsed.strftime('%H:%M') if parsed else None


def _format_status_label(value):
    if not value:
        return ''
    return value.replace('_', ' ').title()


def _format_initials(name):
    if not name:
        return ''
    parts = [segment[0].upper() for segment in str(name).split() if segment]
    return ''.join(parts)[:3]


def _get_slot_duration_minutes():
    try:
        duration = int(config('APPOINTMENT_SLOT_DURATION_MINUTES', default=60))
        return duration if duration > 0 else 60
    except (TypeError, ValueError):
        return 60


def _coerce_bool(value, default=True):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {'true', '1', 'yes', 'y'}:
            return True
        if lowered in {'false', '0', 'no', 'n'}:
            return False
    if isinstance(value, (int, float)):
        return bool(value)
    return default


def _normalize_working_days_payload(raw_value):
    if not raw_value:
        return []

    if isinstance(raw_value, dict):
        entries = [raw_value]
    else:
        entries = list(raw_value)

    normalized = []
    for entry in entries:
        if isinstance(entry, str):
            day = _normalize_day(entry)
            if day:
                normalized.append({
                    'day': day,
                    'start_time': None,
                    'end_time': None,
                    'available': True,
                    'active': True
                })
            continue

        if isinstance(entry, dict):
            day = _normalize_day(
                entry.get('day')
                or entry.get('day_of_week')
                or entry.get('weekday')
                or entry.get('name')
                or entry.get('value')
            )
            if not day:
                continue

            normalized.append({
                'day': day,
                'start_time': _format_time_value(
                    entry.get('start_time')
                    or entry.get('start')
                    or entry.get('from')
                    or entry.get('opens_at')
                ),
                'end_time': _format_time_value(
                    entry.get('end_time')
                    or entry.get('end')
                    or entry.get('to')
                    or entry.get('closes_at')
                ),
                'available': entry.get('available', entry.get('is_available', True)),
                'active': entry.get('active', True)
            })

    return normalized


def _build_weekly_schedule_payload(doctor):
    availabilities = (
        Availability.objects
        .filter(doctor=doctor)
        .order_by('day_of_week', 'start_time')
    )

    grouped = {day: [] for day in DAY_ORDER}
    for availability in availabilities:
        key = _normalize_day(availability.day_of_week)
        if key and key in grouped:
            grouped[key].append({
                'id': str(availability.id),
                'start_time': availability.start_time.strftime('%H:%M'),
                'end_time': availability.end_time.strftime('%H:%M'),
                'available': availability.is_available
            })

    weekly_schedule = {
        day: {
            'active': len(slots) > 0,
            'time_slots': slots
        }
        for day, slots in grouped.items()
    }

    default_start = _format_time_value(doctor.start_time) or '09:00'
    default_end = _format_time_value(doctor.end_time) or '19:00'

    return {
        'weekly_schedule': weekly_schedule,
        'working_days': _normalize_working_days_payload(doctor.working_days),
        'config': {
            'slot_duration_minutes': _get_slot_duration_minutes(),
            'default_hours': {
                'start': default_start,
                'end': default_end
            }
        }
    }


def _save_weekly_schedule(doctor, weekly_schedule):
    weekly_schedule = weekly_schedule or {}

    Availability.objects.filter(doctor=doctor).delete()

    working_day_entries = []
    earliest_start = None
    latest_end = None

    for day_key, schedule_data in weekly_schedule.items():
        normalized_day = _normalize_day(day_key)
        if not normalized_day or normalized_day not in DAY_ORDER:
            continue

        schedule_data = schedule_data or {}
        is_active = _coerce_bool(schedule_data.get('active', False), default=False)
        if not is_active:
            continue

        time_slots = schedule_data.get('time_slots') or schedule_data.get('slots') or []
        if not isinstance(time_slots, list):
            time_slots = []

        if not time_slots:
            default_start = _parse_time_value(
                schedule_data.get('default_start')
                or schedule_data.get('start_time')
                or doctor.start_time
                or dt_time(9, 0)
            )
            default_end = _parse_time_value(
                schedule_data.get('default_end')
                or schedule_data.get('end_time')
                or doctor.end_time
                or dt_time(19, 0)
            )

            if default_start and default_end and default_start < default_end:
                working_day_entries.append({
                    'day': normalized_day,
                    'start_time': default_start.strftime('%H:%M'),
                    'end_time': default_end.strftime('%H:%M'),
                    'available': True,
                    'active': True
                })

                if earliest_start is None or default_start < earliest_start:
                    earliest_start = default_start
                if latest_end is None or default_end > latest_end:
                    latest_end = default_end

            continue

        for slot in time_slots:
            start_raw = (
                slot.get('start_time')
                or slot.get('start')
                or slot.get('from')
            )
            end_raw = (
                slot.get('end_time')
                or slot.get('end')
                or slot.get('to')
            )

            start_time_obj = _parse_time_value(start_raw)
            end_time_obj = _parse_time_value(end_raw)

            if not (start_time_obj and end_time_obj and start_time_obj < end_time_obj):
                continue

            is_available = _coerce_bool(slot.get('available', slot.get('is_available', True)), True)

            Availability.objects.create(
                doctor=doctor,
                day_of_week=normalized_day.capitalize(),
                start_time=start_time_obj,
                end_time=end_time_obj,
                is_available=is_available
            )

            working_day_entries.append({
                'day': normalized_day,
                'start_time': start_time_obj.strftime('%H:%M'),
                'end_time': end_time_obj.strftime('%H:%M'),
                'available': is_available,
                'active': True
            })

            if earliest_start is None or start_time_obj < earliest_start:
                earliest_start = start_time_obj
            if latest_end is None or end_time_obj > latest_end:
                latest_end = end_time_obj

    if working_day_entries:
        doctor.working_days = working_day_entries
        doctor.start_time = earliest_start or dt_time(9, 0)
        doctor.end_time = latest_end or dt_time(19, 0)
    else:
        doctor.working_days = []
        doctor.start_time = dt_time(9, 0)
        doctor.end_time = dt_time(19, 0)

    doctor.save(update_fields=['working_days', 'start_time', 'end_time'])

    return _build_weekly_schedule_payload(doctor)


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
        time_24 = appointment.appointment_time.strftime('%H:%M')
        patient_name = appointment.patient.user.get_full_name()
        schedule_data.append({
            'id': str(appointment.id),
            'time': appointment.appointment_time.strftime('%I:%M %p'),
            'time_24': time_24,
            'patient': {
                'id': str(appointment.patient.id),
                'name': patient_name,
                'initials': _format_initials(patient_name),
                'email': appointment.patient.user.email,
                'phone': appointment.patient.phone_number or ''
            },
            'type': appointment.get_appointment_type_display() or 'Consultation',
            'type_code': appointment.appointment_type,
            'status': appointment.status,
            'status_label': appointment.get_status_display(),
            'reason': appointment.reason or appointment.chief_complaint or '',
            'notes': appointment.notes or ''
        })
    
    return Response({
        'doctor_info': {
            'id': str(doctor.id),
            'name': f"Dr. {doctor.user.get_full_name()}",
            'specialization': doctor.get_specialization_display(),
            'department': doctor.department or f"{doctor.get_specialization_display()} Department",
            'email': doctor.user.email,
            'phone': doctor.phone or '',
            'years_of_experience': doctor.years_of_experience or 0,
            'qualification': doctor.qualification or '',
            'license_number': doctor.license_number or '',
            'working_days': doctor.working_days or [],
            'default_hours': {
                'start': _format_time_value(doctor.start_time) or '09:00',
                'end': _format_time_value(doctor.end_time) or '19:00'
            }
        },
        'today_stats': {
            'scheduled_appointments': scheduled_count,
            'completed_appointments': completed_count,
            'pending_appointments': pending_count
        },
        'today_schedule': schedule_data,
        'config': {
            'slot_duration_minutes': _get_slot_duration_minutes()
        }
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
        default_schedule_days = config('DEFAULT_SCHEDULE_DAYS', default=7, cast=int)
        week_end = week_start + timedelta(days=default_schedule_days - 1)
        appointments = appointments.filter(
            appointment_date__range=[week_start, week_end]
        )
    elif period_filter == 'upcoming':
        appointments = appointments.filter(appointment_date__gte=today)
    
    # Serialize appointments
    appointments_data = []
    for appointment in appointments:
        date_display = appointment.appointment_date.strftime('%b %d, %Y')
        date_iso = appointment.appointment_date.isoformat()
        time_24 = appointment.appointment_time.strftime('%H:%M')
        time_display = appointment.appointment_time.strftime('%I:%M %p')
        patient_name = appointment.patient.user.get_full_name()

        appointments_data.append({
            'id': str(appointment.id),
            'date': date_display,
            'date_iso': date_iso,
            'time': time_24,
            'time_display': time_display,
            'patient': {
                'id': str(appointment.patient.id),
                'name': patient_name,
                'initials': _format_initials(patient_name),
                'email': appointment.patient.user.email,
                'phone': appointment.patient.phone_number or 'Not provided'
            },
            'type': appointment.get_appointment_type_display() or 'Consultation',
            'type_code': appointment.appointment_type,
            'department': doctor.department or f"{doctor.get_specialization_display()} Department",
            'status': appointment.status,
            'status_label': appointment.get_status_display(),
            'reason': appointment.reason or appointment.chief_complaint or 'General consultation',
            'notes': appointment.notes or '',
            'can_cancel': appointment.status not in ['completed', 'cancelled', 'no_show']
        })
    
    status_options = [
        {
            'value': code,
            'label': label
        }
        for code, label in Appointment.STATUS_CHOICES
    ]

    type_options = [
        {
            'value': code,
            'label': label
        }
        for code, label in Appointment.APPOINTMENT_TYPE_CHOICES
    ]

    return Response({
        'appointments': appointments_data,
        'total': len(appointments_data),
        'filters': {
            'available_statuses': [item['value'] for item in status_options],
            'available_types': [item['value'] for item in type_options],
            'status_options': status_options,
            'type_options': type_options
        },
        'meta': {
            'slot_duration_minutes': _get_slot_duration_minutes()
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
            'status_label': appointment.get_status_display(),
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
        last_appointment = Appointment.objects.filter(
            patient=patient,
            doctor=doctor,
            status='completed'
        ).order_by('-appointment_date', '-appointment_time').first()

        last_visit_iso = last_appointment.appointment_date.isoformat() if last_appointment else None
        last_visit_display = (
            last_appointment.appointment_date.strftime('%b %d, %Y')
            if last_appointment else 'No visits'
        )

        full_name = patient.user.get_full_name()
        patients_data.append({
            'id': str(patient.id),
            'name': full_name,
            'initials': _format_initials(full_name),
            'age': f"{patient.age} years" if patient.age else 'Unknown',
            'age_years': patient.age,
            'gender': patient.get_gender_display() if patient.gender else 'Not specified',
            'blood_group': patient.blood_group or 'Unknown',
            'contact': {
                'phone': patient.phone_number or 'Not provided',
                'email': patient.user.email
            },
            'last_visit': last_visit_display,
            'last_visit_iso': last_visit_iso,
            'total_completed_visits': Appointment.objects.filter(
                patient=patient,
                doctor=doctor,
                status='completed'
            ).count()
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
    last_completed_appointment = Appointment.objects.filter(
        patient=patient,
        doctor=doctor,
        status='completed'
    ).order_by('-appointment_date', '-appointment_time').first()

    patient_data = {
        'id': str(patient.id),
        'name': patient.user.get_full_name(),
        'patient_id': str(patient.id)[:8],  # Short ID for display
        'age': f"{patient.age} years" if patient.age else 'Unknown',
        'age_years': patient.age,
        'gender': patient.get_gender_display() if patient.gender else 'Not specified',
        'gender_code': patient.gender,
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
        },
        'last_visit': last_completed_appointment.appointment_date.strftime('%b %d, %Y') if last_completed_appointment else 'No visits',
        'last_visit_iso': last_completed_appointment.appointment_date.isoformat() if last_completed_appointment else None
    }
    
    # Serialize medical history
    history_data = []
    for history in medical_history:
        history_data.append({
            'id': str(history.id),
            'condition': history.condition,
            'diagnosed_date': history.date.strftime('%b %d, %Y'),
            'diagnosed_date_iso': history.date.isoformat(),
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
            'prescribed_date': medication.prescribed_date.strftime('%b %d, %Y'),
            'prescribed_date_iso': medication.prescribed_date.isoformat()
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
    
    schedule_payload = _build_weekly_schedule_payload(doctor)
    return Response(schedule_payload)


@api_view(['PUT', 'POST'])
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
    
    schedule_payload = _save_weekly_schedule(
        doctor,
        request.data.get('weekly_schedule', {})
    )
    schedule_payload.update({'message': 'Schedule updated successfully'})
    return Response(schedule_payload)


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


@api_view(['GET', 'PUT', 'POST'])
@permission_classes([IsAuthenticated])
def combined_availability(request):
    """
    Combined availability view: GET to fetch schedule, PUT/POST to update schedule
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
    
    if request.method == 'GET':
        # Get week parameter (defaults to current week)
        week_param = request.GET.get('week')
        if week_param:
            try:
                week_start = datetime.strptime(week_param, '%Y-%m-%d').date()
            except ValueError:
                week_start = timezone.now().date() - timedelta(days=timezone.now().date().weekday())
        else:
            week_start = timezone.now().date() - timedelta(days=timezone.now().date().weekday())
        
        schedule_payload = _build_weekly_schedule_payload(doctor)
        return Response(schedule_payload)
    
    elif request.method in ['PUT', 'POST']:
        schedule_payload = _save_weekly_schedule(
            doctor,
            request.data.get('weekly_schedule', {})
        )
        schedule_payload.update({'message': 'Schedule updated successfully'})
        return Response(schedule_payload)