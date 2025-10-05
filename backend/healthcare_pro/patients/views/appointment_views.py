from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings

from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer, AppointmentListSerializer
from ..models import PatientProfile


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_appointments(request):
    """
    Get appointments for the current patient
    """
    if request.user.role != 'patient':
        return Response(
            {'error': 'Only patients can access this endpoint'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.get(user=request.user)
    except PatientProfile.DoesNotExist:
        return Response(
            {'error': 'Patient profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Filter by status if provided
    status_filter = request.GET.get('status')
    appointments = Appointment.objects.filter(patient=patient).select_related('doctor__user').order_by('-appointment_date', '-appointment_time')
    
    if status_filter:
        if status_filter == 'upcoming':
            appointments = appointments.filter(status__in=['scheduled', 'confirmed'])
        elif status_filter == 'completed':
            appointments = appointments.filter(status='completed')
        elif status_filter == 'cancelled':
            appointments = appointments.filter(status='cancelled')
        else:
            appointments = appointments.filter(status=status_filter)
    
    # Basic pagination
    page = request.GET.get('page', 1)
    try:
        page = int(page)
    except ValueError:
        page = 1
    
    page_size = getattr(settings, 'REST_FRAMEWORK', {}).get('PAGE_SIZE', 10)
    start = (page - 1) * page_size
    end = start + page_size
    
    total_count = appointments.count()
    appointments_page = appointments[start:end]
    
    # Serialize the appointments
    appointment_data = []
    for appointment in appointments_page:
        appointment_data.append({
            'id': appointment.id,
            'doctor': {
                'name': f"Dr. {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}",
                'specialization': appointment.doctor.specialization,
                'department': appointment.doctor.department or f"{appointment.doctor.specialization} Department"
            },
            'date': appointment.appointment_date.strftime('%Y-%m-%d'),
            'time': appointment.appointment_time.strftime('%H:%M:%S'),
            'status': appointment.status,
            'appointment_type': appointment.appointment_type,
            'reason': appointment.reason or appointment.chief_complaint,
            'confirmation_code': appointment.confirmation_code
        })
    
    # Calculate pagination
    has_next = end < total_count
    has_previous = page > 1
    next_page = f"http://127.0.0.1:8000/api/patients/my/appointments/?page={page + 1}" if has_next else None
    previous_page = f"http://127.0.0.1:8000/api/patients/my/appointments/?page={page - 1}" if has_previous else None
    
    return Response({
        'count': total_count,
        'next': next_page,
        'previous': previous_page,
        'results': appointment_data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_appointment_detail(request, appointment_id):
    """
    Get detailed information about a specific appointment
    """
    if request.user.role != 'patient':
        return Response(
            {'error': 'Only patients can access this endpoint'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.get(user=request.user)
    except PatientProfile.DoesNotExist:
        return Response(
            {'error': 'Patient profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        appointment = Appointment.objects.select_related('doctor__user').get(
            id=appointment_id, 
            patient=patient
        )
    except Appointment.DoesNotExist:
        return Response(
            {'error': 'Appointment not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    return Response({
        'id': appointment.id,
        'doctor': {
            'name': f"Dr. {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}",
            'specialization': appointment.doctor.specialization,
            'department': appointment.doctor.department or f"{appointment.doctor.specialization} Department",
            'phone': appointment.doctor.phone,
            'email': appointment.doctor.user.email
        },
        'date': appointment.appointment_date.strftime('%Y-%m-%d'),
        'time': appointment.appointment_time.strftime('%H:%M:%S'),
        'status': appointment.status,
        'appointment_type': appointment.appointment_type,
        'reason': appointment.reason or appointment.chief_complaint,
        'confirmation_code': appointment.confirmation_code,
        'created_at': appointment.created_at.isoformat(),
        'can_cancel': appointment.can_be_cancelled,
        'can_reschedule': appointment.can_be_cancelled and appointment.status in ['scheduled', 'confirmed']
    })