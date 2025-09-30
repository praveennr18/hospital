from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Q, Count
from datetime import date, datetime, timedelta

from ..models import PatientProfile, MedicalHistory
from ..serializers import PatientProfileSerializer, MedicalHistorySerializer
from appointments.models import Appointment
from doctors.models import Doctor


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_dashboard(request):
    """
    Get patient dashboard overview with all necessary information.
    Only for patients.
    """
    if request.user.role != 'patient':
        return Response(
            {"error": "This endpoint is only for patients."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.select_related('user').get(user=request.user)
        
        # Get upcoming appointments
        upcoming_appointments = Appointment.objects.filter(
            patient=patient,
            appointment_date__gte=date.today(),
            status__in=['scheduled', 'confirmed']
        ).select_related('doctor__user').order_by('appointment_date', 'appointment_time')[:5]
        
        # Get recent medical history
        recent_medical_history = MedicalHistory.objects.filter(
            patient=patient
        ).select_related('doctor__user').order_by('-date')[:5]
        
        # Health summary statistics
        health_stats = {
            'known_allergies': len(patient.allergies.split(',')) if patient.allergies else 0,
            'current_medications': len(patient.current_medications.split(',')) if patient.current_medications else 0,
            'medical_conditions': len(patient.chronic_conditions.split(',')) if patient.chronic_conditions else 0,
        }
        
        # Serialize appointments
        appointments_data = []
        for appointment in upcoming_appointments:
            appointments_data.append({
                'id': str(appointment.id),
                'doctor': {
                    'name': f"Dr. {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}",
                    'specialization': appointment.doctor.get_specialization_display(),
                    'department': appointment.doctor.department or appointment.doctor.get_specialization_display() + " Department"
                },
                'date': appointment.appointment_date.strftime('%b %d, %Y'),
                'time': appointment.appointment_time.strftime('%I:%M %p'),
                'appointment_type': appointment.appointment_type,
                'status': appointment.status,
                'reason': appointment.reason or 'Consultation'
            })
        
        # Serialize medical history
        medical_history_data = []
        for history in recent_medical_history:
            medical_history_data.append({
                'id': str(history.id),
                'condition': history.condition,
                'date': history.date.strftime('%b %d, %Y'),
                'doctor': f"Dr. {history.doctor.user.first_name} {history.doctor.user.last_name}" if history.doctor else "Unknown",
                'treatment': history.treatment,
                'description': history.description
            })
        
        # Get allergies list
        allergies_list = []
        if patient.allergies:
            allergies_list = [allergy.strip() for allergy in patient.allergies.split(',') if allergy.strip()]
        
        # Get current medications list
        medications_list = []
        if patient.current_medications:
            medications_list = [medication.strip() for medication in patient.current_medications.split(',') if medication.strip()]
        
        dashboard_data = {
            'patient_info': {
                'id': str(patient.id),
                'name': patient.user.get_full_name(),
                'email': patient.user.email,
                'phone': patient.phone_number,
                'date_of_birth': patient.date_of_birth.strftime('%m/%d/%Y') if patient.date_of_birth else None,
                'age': patient.age,
                'gender': patient.get_gender_display() if patient.gender else None,
                'blood_group': patient.blood_group,
                'address': {
                    'street': patient.address,
                    'city': patient.city,
                    'state': patient.state,
                    'zip_code': patient.zip_code
                },
                'emergency_contact': {
                    'name': patient.emergency_contact_name,
                    'phone': patient.emergency_contact_phone,
                    'relationship': patient.relationship
                },
                'insurance': {
                    'provider': patient.insurance_provider,
                    'policy_number': patient.policy_number
                }
            },
            'health_summary': {
                'stats': health_stats,
                'allergies': allergies_list,
                'current_medications': medications_list,
                'chronic_conditions': patient.chronic_conditions.split(',') if patient.chronic_conditions else [],
                'height': patient.height,
                'weight': patient.weight,
                'bmi': patient.bmi
            },
            'upcoming_appointments': appointments_data,
            'recent_medical_history': medical_history_data,
            'quick_stats': {
                'total_appointments': Appointment.objects.filter(patient=patient).count(),
                'completed_appointments': Appointment.objects.filter(patient=patient, status='completed').count(),
                'upcoming_appointments': len(appointments_data),
                'medical_records': MedicalHistory.objects.filter(patient=patient).count()
            }
        }
        
        return Response(dashboard_data)
        
    except PatientProfile.DoesNotExist:
        return Response(
            {"error": "Patient profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_profile(request):
    """
    Get current patient's profile.
    Only for patients.
    """
    if request.user.role != 'patient':
        return Response(
            {"error": "This endpoint is only for patients."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.select_related('user').get(user=request.user)
        serializer = PatientProfileSerializer(patient)
        return Response(serializer.data)
    except PatientProfile.DoesNotExist:
        return Response(
            {"error": "Patient profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """
    Update current patient's profile.
    Patients can only update certain fields, not personal info managed by admin.
    """
    if request.user.role != 'patient':
        return Response(
            {"error": "This endpoint is only for patients."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.select_related('user').get(user=request.user)
        
        # Only allow patients to update certain fields
        allowed_fields = [
            'phone_number', 'address', 'city', 'state', 'zip_code',
            'height', 'weight', 'allergies', 'current_medications',
            'emergency_contact_name', 'emergency_contact_phone', 'relationship'
        ]
        
        # Filter request data to only include allowed fields
        filtered_data = {key: value for key, value in request.data.items() if key in allowed_fields}
        
        serializer = PatientProfileSerializer(patient, data=filtered_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except PatientProfile.DoesNotExist:
        return Response(
            {"error": "Patient profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_appointments(request):
    """
    Get all appointments for the current patient.
    """
    if request.user.role != 'patient':
        return Response(
            {"error": "This endpoint is only for patients."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.get(user=request.user)
        
        # Get query parameters for filtering
        status_filter = request.GET.get('status')
        upcoming_only = request.GET.get('upcoming', 'false').lower() == 'true'
        
        # Base queryset
        appointments = Appointment.objects.filter(patient=patient).select_related('doctor__user')
        
        # Apply filters
        if status_filter:
            appointments = appointments.filter(status=status_filter)
        
        if upcoming_only:
            appointments = appointments.filter(appointment_date__gte=date.today())
        
        appointments = appointments.order_by('-appointment_date', '-appointment_time')
        
        # Serialize appointments
        appointments_data = []
        for appointment in appointments:
            appointments_data.append({
                'id': str(appointment.id),
                'doctor': {
                    'id': str(appointment.doctor.id),
                    'name': f"Dr. {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}",
                    'specialization': appointment.doctor.get_specialization_display(),
                    'department': appointment.doctor.department or appointment.doctor.get_specialization_display() + " Department"
                },
                'date': appointment.appointment_date.strftime('%b %d, %Y'),
                'time': appointment.appointment_time.strftime('%I:%M %p'),
                'appointment_type': appointment.appointment_type,
                'status': appointment.status,
                'reason': appointment.reason or 'Consultation',
                'notes': appointment.notes,
                'created_at': appointment.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return Response({
            'appointments': appointments_data,
            'total': len(appointments_data)
        })
        
    except PatientProfile.DoesNotExist:
        return Response(
            {"error": "Patient profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_medical_history(request):
    """
    Get medical history for the current patient.
    """
    if request.user.role != 'patient':
        return Response(
            {"error": "This endpoint is only for patients."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.get(user=request.user)
        
        medical_history = MedicalHistory.objects.filter(
            patient=patient
        ).select_related('doctor__user').order_by('-date')
        
        # Serialize medical history
        history_data = []
        for history in medical_history:
            history_data.append({
                'id': str(history.id),
                'condition': history.condition,
                'description': history.description,
                'treatment': history.treatment,
                'date': history.date.strftime('%Y-%m-%d'),
                'doctor': {
                    'name': f"Dr. {history.doctor.user.first_name} {history.doctor.user.last_name}" if history.doctor else "Unknown",
                    'specialization': history.doctor.get_specialization_display() if history.doctor else None
                },
                'created_at': history.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return Response({
            'medical_history': history_data,
            'total': len(history_data)
        })
        
    except PatientProfile.DoesNotExist:
        return Response(
            {"error": "Patient profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )



@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_doctors(request):
    """
    Get list of available doctors for appointment booking.
    """
    if request.user.role != 'patient':
        return Response(
            {"error": "This endpoint is only for patients."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    specialization = request.GET.get('specialization')
    
    # Get available doctors
    doctors = Doctor.objects.filter(is_available=True).select_related('user')
    
    if specialization:
        doctors = doctors.filter(specialization=specialization)
    
    doctors_data = []
    for doctor in doctors:
        doctors_data.append({
            'id': str(doctor.id),
            'name': f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
            'specialization': doctor.get_specialization_display(),
            'department': doctor.department or doctor.get_specialization_display() + " Department",
            'years_of_experience': doctor.years_of_experience,
            'working_days': doctor.working_days,
            'start_time': doctor.start_time.strftime('%H:%M') if doctor.start_time else None,
            'end_time': doctor.end_time.strftime('%H:%M') if doctor.end_time else None
        })
    
    return Response({
        'doctors': doctors_data,
        'total': len(doctors_data)
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated]) 
def health_summary(request):
    """
    Get health summary statistics for the current patient.
    """
    if request.user.role != 'patient':
        return Response(
            {"error": "This endpoint is only for patients."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.get(user=request.user)
        
        # Calculate health metrics
        total_appointments = Appointment.objects.filter(patient=patient).count()
        completed_appointments = Appointment.objects.filter(patient=patient, status='completed').count()
        medical_records = MedicalHistory.objects.filter(patient=patient).count()
        
        # Parse allergies and medications
        allergies_count = len(patient.allergies.split(',')) if patient.allergies else 0
        medications_count = len(patient.current_medications.split(',')) if patient.current_medications else 0
        
        summary = {
            'patient_info': {
                'name': patient.user.get_full_name(),
                'age': patient.age,
                'blood_group': patient.blood_group,
                'bmi': patient.bmi
            },
            'statistics': {
                'total_appointments': total_appointments,
                'completed_appointments': completed_appointments,  
                'medical_records': medical_records,
                'known_allergies': allergies_count,
                'current_medications': medications_count
            },
            'health_indicators': {
                'height': patient.height,
                'weight': patient.weight,
                'bmi': patient.bmi,
                'bmi_category': 'Normal' if patient.bmi and 18.5 <= patient.bmi < 25 else 
                              'Underweight' if patient.bmi and patient.bmi < 18.5 else
                              'Overweight' if patient.bmi and 25 <= patient.bmi < 30 else
                              'Obese' if patient.bmi and patient.bmi >= 30 else 'Unknown'
            }
        }
        
        return Response(summary)
        
    except PatientProfile.DoesNotExist:
        return Response(
            {"error": "Patient profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )