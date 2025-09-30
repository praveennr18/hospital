from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from datetime import date

from patients.models import PatientProfile, MedicalHistory, Allergy, Medication
from appointments.models import Appointment
from doctors.models import Doctor
from patients.serializers import MedicalHistorySerializer, AllergySerializer, MedicationSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_dashboard(request):
    """
    Patient Dashboard - Shows personal info and health summary
    Matches the Dashboard UI with Overview tab
    """
    if request.user.role != 'patient':
        return Response(
            {'error': 'Access denied. Patient role required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.select_related('user').get(user=request.user)
    except PatientProfile.DoesNotExist:
        return Response(
            {'error': 'Patient profile not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get health summary counts
    medical_history_count = MedicalHistory.objects.filter(patient=patient).count()
    allergies_count = Allergy.objects.filter(patient=patient).count()
    medications_count = Medication.objects.filter(patient=patient, is_active=True).count()
    
    return Response({
        'patient_info': {
            'id': str(patient.id),
            'name': patient.user.get_full_name(),
            'email': patient.user.email,
            'phone': patient.phone_number or 'Not provided',
            'date_of_birth': patient.date_of_birth.strftime('%m/%d/%Y') if patient.date_of_birth else 'Not provided',
            'gender': patient.get_gender_display() if patient.gender else 'Not specified',
            'blood_group': patient.blood_group or 'Not specified',
            'insurance_info': f"{patient.insurance_provider} - Policy #{patient.policy_number}" if patient.insurance_provider else 'Not provided',
            'address': f"{patient.address}, {patient.city}, {patient.state} {patient.zip_code}" if patient.address else 'Not provided',
            'note': 'To update personal information, please contact the administration office.'
        },
        'health_summary': {
            'known_allergies': allergies_count,
            'current_medications': medications_count,
            'medical_history': medical_history_count
        }
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def medical_history_management(request):
    """
    Medical History Management - Get list or add new entry
    Matches the Medical History tab UI
    """
    if request.user.role != 'patient':
        return Response(
            {'error': 'Access denied. Patient role required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.get(user=request.user)
    except PatientProfile.DoesNotExist:
        return Response(
            {'error': 'Patient profile not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        medical_history = MedicalHistory.objects.filter(patient=patient).order_by('-created_at')
        serializer = MedicalHistorySerializer(medical_history, many=True)
        
        return Response({
            'medical_history': serializer.data,
            'total_count': len(serializer.data)
        })
    
    elif request.method == 'POST':
        serializer = MedicalHistorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(patient=patient)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def medical_history_detail(request, history_id):
    """
    Update or delete specific medical history entry
    """
    if request.user.role != 'patient':
        return Response(
            {'error': 'Access denied. Patient role required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.get(user=request.user)
        medical_history = MedicalHistory.objects.get(id=history_id, patient=patient)
    except (PatientProfile.DoesNotExist, MedicalHistory.DoesNotExist):
        return Response(
            {'error': 'Medical history entry not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'PUT':
        serializer = MedicalHistorySerializer(medical_history, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        medical_history.delete()
        return Response({'message': 'Medical history entry deleted successfully'}, 
                       status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def allergies_management(request):
    """
    Allergies Management - Get list or add new allergy
    Matches the Allergies section in Medical History tab
    """
    if request.user.role != 'patient':
        return Response(
            {'error': 'Access denied. Patient role required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.get(user=request.user)
    except PatientProfile.DoesNotExist:
        return Response(
            {'error': 'Patient profile not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        allergies = Allergy.objects.filter(patient=patient).order_by('-created_at')
        serializer = AllergySerializer(allergies, many=True)
        
        return Response({
            'allergies': serializer.data,
            'total_count': len(serializer.data)
        })
    
    elif request.method == 'POST':
        serializer = AllergySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(patient=patient)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def allergy_detail(request, allergy_id):
    """
    Update or delete specific allergy
    """
    if request.user.role != 'patient':
        return Response(
            {'error': 'Access denied. Patient role required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.get(user=request.user)
        allergy = Allergy.objects.get(id=allergy_id, patient=patient)
    except (PatientProfile.DoesNotExist, Allergy.DoesNotExist):
        return Response(
            {'error': 'Allergy not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'PUT':
        serializer = AllergySerializer(allergy, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        allergy.delete()
        return Response({'message': 'Allergy deleted successfully'}, 
                       status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def medications_management(request):
    """
    Current Medications Management - Get list or add new medication
    Matches the Current Medications section in Medical History tab
    """
    if request.user.role != 'patient':
        return Response(
            {'error': 'Access denied. Patient role required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.get(user=request.user)
    except PatientProfile.DoesNotExist:
        return Response(
            {'error': 'Patient profile not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        medications = Medication.objects.filter(patient=patient, is_active=True).order_by('-created_at')
        serializer = MedicationSerializer(medications, many=True)
        
        return Response({
            'medications': serializer.data,
            'total_count': len(serializer.data)
        })
    
    elif request.method == 'POST':
        serializer = MedicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(patient=patient, is_active=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def medication_detail(request, medication_id):
    """
    Update or delete/stop specific medication
    """
    if request.user.role != 'patient':
        return Response(
            {'error': 'Access denied. Patient role required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.get(user=request.user)
        medication = Medication.objects.get(id=medication_id, patient=patient)
    except (PatientProfile.DoesNotExist, Medication.DoesNotExist):
        return Response(
            {'error': 'Medication not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'PUT':
        serializer = MedicationSerializer(medication, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Mark medication as inactive instead of deleting
        medication.is_active = False
        medication.save()
        return Response({'message': 'Medication stopped successfully'}, 
                       status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_appointments(request):
    """
    My Appointments - View all patient appointments
    Matches the Appointments tab UI
    """
    if request.user.role != 'patient':
        return Response(
            {'error': 'Access denied. Patient role required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.get(user=request.user)
    except PatientProfile.DoesNotExist:
        return Response(
            {'error': 'Patient profile not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get all appointments for this patient
    appointments = Appointment.objects.filter(
        patient=patient
    ).select_related('doctor__user').order_by('-appointment_date', '-appointment_time')
    
    appointments_data = []
    for appointment in appointments:
        appointments_data.append({
            'id': str(appointment.id),
            'doctor': {
                'name': f"Dr. {appointment.doctor.user.get_full_name()}",
                'specialization': appointment.doctor.get_specialization_display(),
                'department': appointment.doctor.department or f"{appointment.doctor.get_specialization_display()} Department"
            },
            'date': appointment.appointment_date.strftime('%b %d, %Y'),
            'time': appointment.appointment_time.strftime('%I:%M %p'),
            'type': appointment.get_appointment_type_display() or 'Consultation',
            'status': appointment.status,
            'reason': appointment.reason or appointment.chief_complaint or 'General consultation'
        })
    
    return Response({
        'appointments': appointments_data,
        'total_count': len(appointments_data)
    })


# Appointment booking endpoints are already handled in appointments/views/booking_views.py
# so we just need to ensure they match the UI requirements