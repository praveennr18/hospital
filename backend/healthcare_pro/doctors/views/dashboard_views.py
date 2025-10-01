from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.db.models import Q, Count
from datetime import datetime, timedelta, date
from rest_framework.decorators import api_view, permission_classes
from decouple import config
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import json

from doctors.models import Doctor, Availability
from patients.models import PatientProfile
from appointments.models import Appointment
from appointments.serializers import (
    DoctorAppointmentSerializer, AppointmentCreateSerializer,
    AppointmentUpdateSerializer, AppointmentListSerializer
)
from patients.serializers import PatientProfileListSerializer
from doctors.serializers import AvailabilitySerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_dashboard(request):
    """
    Doctor Dashboard - Main overview page
    Shows today's appointments, patient count, and quick stats
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
    
    # Get appointment counts
    scheduled_count = today_appointments.filter(status='scheduled').count()
    total_patients = PatientProfile.objects.filter(
        appointments__doctor=doctor
    ).distinct().count()
    
    # Serialize today's appointments
    appointments_data = []
    for appointment in today_appointments:
        appointments_data.append({
            'id': str(appointment.id),
            'time': appointment.appointment_time.strftime('%H:%M'),
            'patient_name': appointment.patient.user.get_full_name(),
            'appointment_type': appointment.get_appointment_type_display(),
            'status': appointment.status,
            'chief_complaint': appointment.chief_complaint
        })
    
    return Response({
        'today_patients': scheduled_count,
        'total_patients': total_patients,
        'doctor_name': f"Dr. {doctor.user.get_full_name()}",
        'doctor_specialization': doctor.get_specialization_display(),
        'todays_schedule': appointments_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_appointments(request):
    """
    Doctor Appointments - View and manage all appointments
    Supports filtering by status, date range, and appointment type
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
    status_filter = request.GET.get('status', 'all')
    date_filter = request.GET.get('date_range', 'all')  # all, today, week, upcoming
    appointment_type = request.GET.get('type', 'all')
    
    # Base queryset
    appointments = Appointment.objects.filter(
        doctor=doctor
    ).select_related('patient__user').order_by('-appointment_date', '-appointment_time')
    
    # Apply filters
    if status_filter != 'all':
        appointments = appointments.filter(status=status_filter)
    
    if appointment_type != 'all':
        appointments = appointments.filter(appointment_type=appointment_type)
    
    # Date filtering
    today = timezone.now().date()
    if date_filter == 'today':
        appointments = appointments.filter(appointment_date=today)
    elif date_filter == 'week':
        week_start = today - timedelta(days=today.weekday())
        default_schedule_days = config('DEFAULT_SCHEDULE_DAYS', default=7, cast=int)
        week_end = week_start + timedelta(days=default_schedule_days - 1)
        appointments = appointments.filter(
            appointment_date__range=[week_start, week_end]
        )
    elif date_filter == 'upcoming':
        appointments = appointments.filter(appointment_date__gte=today)
    
    # Serialize appointments
    serializer = DoctorAppointmentSerializer(appointments, many=True)
    
    return Response({
        'appointments': serializer.data,
        'total_count': appointments.count(),
        'filters': {
            'status': status_filter,
            'date_range': date_filter,
            'type': appointment_type
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def schedule_appointment(request):
    """
    Schedule New Appointment - Create appointment for a patient
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
    
    # Add doctor to the request data
    data = request.data.copy()
    data['doctor'] = doctor.id
    
    serializer = AppointmentCreateSerializer(data=data)
    if serializer.is_valid():
        appointment = serializer.save()
        response_serializer = DoctorAppointmentSerializer(appointment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def appointment_detail(request, appointment_id):
    """
    Appointment Detail - View, update, or cancel specific appointment
    """
    if request.user.role != 'doctor':
        return Response(
            {"error": "Access denied. Doctor role required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doctor = Doctor.objects.get(user=request.user)
        appointment = get_object_or_404(
            Appointment,
            id=appointment_id,
            doctor=doctor
        )
    except Doctor.DoesNotExist:
        return Response(
            {"error": "Doctor profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = DoctorAppointmentSerializer(appointment)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = AppointmentUpdateSerializer(appointment, data=request.data, partial=True)
        if serializer.is_valid():
            updated_appointment = serializer.save()
            response_serializer = DoctorAppointmentSerializer(updated_appointment)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if appointment.can_be_cancelled:
            appointment.status = 'cancelled'
            appointment.save()
            return Response({"message": "Appointment cancelled successfully."})
        else:
            return Response(
                {"error": "This appointment cannot be cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_patients(request):
    """
    Doctor Patients - View and manage assigned patients
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
    
    # Get patients who have appointments with this doctor
    patients = PatientProfile.objects.filter(
        appointments__doctor=doctor
    ).distinct().select_related('user')
    
    # Add last visit information
    patients_data = []
    for patient in patients:
        last_appointment = Appointment.objects.filter(
            doctor=doctor,
            patient=patient,
            status='completed'
        ).order_by('-appointment_date').first()
        
        patient_data = PatientProfileListSerializer(patient).data
        patient_data['last_visit'] = None
        if last_appointment:
            patient_data['last_visit'] = last_appointment.appointment_date.strftime('%Y-%m-%d')
        
        patients_data.append(patient_data)
    
    return Response({
        'patients': patients_data,
        'total_count': len(patients_data)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_detail_for_doctor(request, patient_id):
    """
    Patient Detail for Doctor - Detailed patient view with medical history
    """
    if request.user.role != 'doctor':
        return Response(
            {"error": "Access denied. Doctor role required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doctor = Doctor.objects.get(user=request.user)
        patient = get_object_or_404(PatientProfile, id=patient_id)
        
        # Check if doctor has treated this patient
        has_treated = Appointment.objects.filter(
            doctor=doctor,
            patient=patient
        ).exists()
        
        if not has_treated:
            return Response(
                {"error": "You don't have access to this patient's records."},
                status=status.HTTP_403_FORBIDDEN
            )
        
    except Doctor.DoesNotExist:
        return Response(
            {"error": "Doctor profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get patient's medical history with this doctor
    from patients.models import MedicalHistory, Prescription
    
    medical_history = MedicalHistory.objects.filter(
        patient=patient,
        doctor=doctor
    ).order_by('-date')
    
    prescriptions = Prescription.objects.filter(
        patient=patient,
        doctor=doctor
    ).order_by('-prescribed_date')
    
    # Get appointment history
    appointments = Appointment.objects.filter(
        doctor=doctor,
        patient=patient
    ).order_by('-appointment_date')
    
    from patients.serializers import MedicalHistorySerializer, PrescriptionSerializer
    
    return Response({
        'patient': PatientProfileListSerializer(patient).data,
        'medical_history': MedicalHistorySerializer(medical_history, many=True).data,
        'prescriptions': PrescriptionSerializer(prescriptions, many=True).data,
        'appointments': DoctorAppointmentSerializer(appointments, many=True).data,
        'summary': {
            'total_visits': appointments.count(),
            'last_visit': appointments.first().appointment_date if appointments.exists() else None,
            'conditions_count': medical_history.count(),
            'active_medications': prescriptions.filter().count()
        }
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def doctor_availability(request):
    """
    Doctor Availability Management - View and update weekly schedule
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
        # Get current availability schedule
        availability = Availability.objects.filter(doctor=doctor).order_by('day')
        serializer = AvailabilitySerializer(availability, many=True)
        
        return Response({
            'schedule': serializer.data,
            'doctor_name': f"Dr. {doctor.user.get_full_name()}"
        })
    
    elif request.method == 'POST':
        # Update availability schedule
        schedule_data = request.data.get('schedule', [])
        
        # Clear existing schedule
        Availability.objects.filter(doctor=doctor).delete()
        
        # Create new schedule
        for slot_data in schedule_data:
            slot_data['doctor'] = doctor.id
            serializer = AvailabilitySerializer(data=slot_data)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(
                    {"error": f"Invalid data for slot: {serializer.errors}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response({"message": "Schedule updated successfully."})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_time_slots(request):
    """
    Get available time slots for a specific date
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
    
    date_str = request.GET.get('date')
    if not date_str:
        return Response(
            {"error": "Date parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        requested_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response(
            {"error": "Invalid date format. Use YYYY-MM-DD."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get doctor's availability for this day
    day_of_week = requested_date.weekday()
    availability = Availability.objects.filter(
        doctor=doctor,
        day=day_of_week,
        is_available=True
    )
    
    if not availability.exists():
        return Response({
            'available_slots': [],
            'message': 'Doctor is not available on this day.'
        })
    
    # Get existing appointments for this date
    existing_appointments = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=requested_date,
        status__in=['scheduled', 'confirmed', 'in_progress']
    ).values_list('appointment_time', flat=True)
    
    # Generate available time slots
    available_slots = []
    for slot in availability:
        current_time = slot.start_time
        slot_duration = 30  # 30-minute slots
        
        while current_time < slot.end_time:
            if current_time not in existing_appointments:
                available_slots.append({
                    'time': current_time.strftime('%H:%M'),
                    'is_available': True
                })
            
            # Add 30 minutes for next slot
            current_datetime = datetime.combine(requested_date, current_time)
            next_datetime = current_datetime + timedelta(minutes=slot_duration)
            current_time = next_datetime.time()
    
    return Response({
        'date': date_str,
        'available_slots': available_slots
    })