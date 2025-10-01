from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from datetime import datetime, time, timedelta
from django.utils import timezone
from decouple import config

from ..models import Appointment
from ..serializers import AppointmentCreateSerializer, AppointmentSerializer
from doctors.models import Doctor
from patients.models import PatientProfile


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def schedule_appointment(request):
    """
    Schedule a new appointment with enhanced booking functionality
    Allows patients, doctors, and admins to schedule appointments
    """
    # Allow patients, doctors, and admins to schedule appointments
    if request.user.role not in ['patient', 'doctor', 'admin']:
        return Response(
            {'error': 'Only patients, doctors, and admins can schedule appointments'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    data = request.data
    
    # If user is a patient, use their own profile
    if request.user.role == 'patient':
        try:
            patient = PatientProfile.objects.get(user=request.user)
            # For patients scheduling their own appointments, use their ID
            if 'patient_id' not in data:
                data = data.copy()
                data['patient_id'] = patient.id
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        # For doctors and admins, patient_id must be provided
        if 'patient_id' not in data:
            return Response(
                {'error': 'Patient ID is required when scheduling for another patient'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify the patient exists
        try:
            patient = PatientProfile.objects.get(id=data['patient_id'])
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    # Validate required fields
    required_fields = ['department', 'appointment_date', 'preferred_time', 'appointment_type', 'reason']
    for field in required_fields:
        if field not in data:
            return Response(
                {'error': f'{field} is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    try:
        # Find available doctor in the department
        department = data['department']
        preferred_doctor_id = data.get('doctor_id') or data.get('preferred_doctor')
        appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
        preferred_time = datetime.strptime(data['preferred_time'], '%H:%M').time()
        
        # If preferred doctor is specified, use them
        if preferred_doctor_id:
            try:
                doctor = Doctor.objects.get(id=preferred_doctor_id, department=department)
            except Doctor.DoesNotExist:
                return Response(
                    {'error': 'Preferred doctor not found in the specified department'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Find any available doctor in the department
            doctors = Doctor.objects.filter(department=department, is_available=True)
            if not doctors.exists():
                return Response(
                    {'error': 'No doctors available in the specified department'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            doctor = doctors.first()  # For now, take the first available doctor
        
        # Check if the time slot is available
        existing_appointment = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=preferred_time,
            status__in=['scheduled', 'confirmed']
        ).exists()
        
        if existing_appointment:
            return Response(
                {'error': 'The selected time slot is not available'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the appointment
        reason_text = data.get('reason') or data.get('reason_for_visit', '')
        appointment_data = {
            'patient': patient.id,
            'doctor': doctor.id,
            'appointment_date': appointment_date,
            'appointment_time': preferred_time,
            'appointment_type': data['appointment_type'],
            'chief_complaint': reason_text,
            'reason': reason_text,
            'status': 'scheduled'
        }
        
        serializer = AppointmentCreateSerializer(data=appointment_data)
        if serializer.is_valid():
            appointment = serializer.save()
            
            # Generate confirmation code
            confirmation_code = f"APT-{appointment_date.year}-{str(appointment.id)[-6:].zfill(6)}"
            appointment.confirmation_code = confirmation_code
            appointment.save()
            
            return Response({
                'id': appointment.id,
                'message': 'Appointment scheduled successfully',
                'appointment': {
                    'id': appointment.id,
                    'doctor': {
                        'name': f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
                        'specialization': doctor.specialization,
                        'department': doctor.department
                    },
                    'date': appointment.appointment_date.strftime('%Y-%m-%d'),
                    'time': appointment.appointment_time.strftime('%H:%M:%S'),
                    'status': appointment.status,
                    'appointment_type': appointment.appointment_type,
                    'reason': appointment.reason
                },
                'confirmation_code': confirmation_code
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except ValueError as e:
        return Response(
            {'error': 'Invalid date or time format'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_available_slots(request):
    """
    Get available time slots for a specific doctor and date
    """
    doctor_id = request.GET.get('doctor_id')
    date_str = request.GET.get('date')
    
    if not doctor_id or not date_str:
        return Response(
            {'error': 'doctor_id and date parameters are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        doctor = Doctor.objects.get(id=doctor_id)
        appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        # Get all booked appointments for this doctor on this date
        booked_appointments = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            status__in=['scheduled', 'confirmed']
        ).values_list('appointment_time', flat=True)
        
        # Generate time slots (9 AM to 5 PM, configurable duration)
        start_time = time(9, 0)  # 9:00 AM
        end_time = time(17, 0)   # 5:00 PM
        slot_duration_minutes = config('APPOINTMENT_SLOT_DURATION_MINUTES', default=30, cast=int)
        slot_duration = timedelta(minutes=slot_duration_minutes)
        
        slots = []
        current_time = datetime.combine(appointment_date, start_time)
        end_datetime = datetime.combine(appointment_date, end_time)
        
        while current_time < end_datetime:
            slot_time = current_time.time()
            is_booked = slot_time in booked_appointments
            
            slots.append({
                'time': slot_time.strftime('%H:%M'),
                'status': 'booked' if is_booked else 'available'
            })
            
            current_time += slot_duration
        
        return Response({
            'doctor': {
                'id': doctor.id,
                'name': f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
                'department': doctor.department
            },
            'date': date_str,
            'available_slots': slots
        })
        
    except Doctor.DoesNotExist:
        return Response(
            {'error': 'Doctor not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except ValueError:
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_departments(request):
    """
    Get list of all departments with doctor count
    """
    from django.db.models import Count
    
    # Get unique departments from available doctors
    departments = Doctor.objects.filter(is_available=True).values('specialization').annotate(
        doctors_count=Count('id')
    ).order_by('specialization')
    
    department_list = []
    for dept in departments:
        specialization = dept['specialization']
        department_list.append({
            'id': specialization,
            'name': f"{dict(Doctor.SPECIALIZATION_CHOICES).get(specialization, specialization)} Department",
            'specialization': specialization
        })
    
    return Response({
        'departments': department_list
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_doctors_by_department(request):
    """
    Get doctors in a specific department
    """
    department = request.GET.get('department')
    
    if not department:
        return Response(
            {'error': 'department parameter is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    doctors = Doctor.objects.filter(
        specialization=department, 
        is_available=True
    ).select_related('user')
    
    doctor_list = [
        {
            'id': str(doctor.id),
            'name': f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
            'specialization': dict(Doctor.SPECIALIZATION_CHOICES).get(doctor.specialization, doctor.specialization),
            'department': f"{dict(Doctor.SPECIALIZATION_CHOICES).get(doctor.specialization, doctor.specialization)} Department",
            'years_of_experience': doctor.years_of_experience or 0,
            'is_available': doctor.is_available
        }
        for doctor in doctors
    ]
    
    return Response({
        'doctors': doctor_list
    })


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def cancel_appointment(request, appointment_id):
    """
    Cancel an appointment
    """
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        
        # Check permissions
        if request.user.role == 'patient':
            try:
                patient = PatientProfile.objects.get(user=request.user)
                if appointment.patient != patient:
                    return Response(
                        {'error': 'You can only cancel your own appointments'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            except PatientProfile.DoesNotExist:
                return Response(
                    {'error': 'Patient profile not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        elif request.user.role == 'doctor':
            try:
                doctor = Doctor.objects.get(user=request.user)
                if appointment.doctor != doctor:
                    return Response(
                        {'error': 'You can only cancel appointments assigned to you'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Doctor.DoesNotExist:
                return Response(
                    {'error': 'Doctor profile not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        elif request.user.role != 'admin':
            return Response(
                {'error': 'You do not have permission to cancel appointments'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if appointment can be cancelled
        if appointment.status in ['cancelled', 'completed']:
            return Response(
                {'error': f'Cannot cancel an appointment that is already {appointment.status}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update appointment status
        cancellation_reason = request.data.get('cancellation_reason', 'No reason provided')
        appointment.status = 'cancelled'
        appointment.cancellation_reason = cancellation_reason
        appointment.cancelled_at = timezone.now()
        appointment.save()
        
        return Response({
            'message': 'Appointment cancelled successfully',
            'appointment': {
                'id': appointment.id,
                'status': appointment.status,
                'cancellation_reason': appointment.cancellation_reason,
                'cancelled_at': appointment.cancelled_at.isoformat()
            }
        })
        
    except Appointment.DoesNotExist:
        return Response(
            {'error': 'Appointment not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def reschedule_appointment(request, appointment_id):
    """
    Reschedule an appointment
    """
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        
        # Check permissions (same as cancel)
        if request.user.role == 'patient':
            try:
                patient = PatientProfile.objects.get(user=request.user)
                if appointment.patient != patient:
                    return Response(
                        {'error': 'You can only reschedule your own appointments'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            except PatientProfile.DoesNotExist:
                return Response(
                    {'error': 'Patient profile not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        elif request.user.role != 'admin':
            return Response(
                {'error': 'You do not have permission to reschedule appointments'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if appointment can be rescheduled
        if appointment.status in ['cancelled', 'completed']:
            return Response(
                {'error': f'Cannot reschedule an appointment that is {appointment.status}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new date and time
        new_date_str = request.data.get('new_date')
        new_time_str = request.data.get('new_time')
        reschedule_reason = request.data.get('reschedule_reason', 'No reason provided')
        
        if not new_date_str or not new_time_str:
            return Response(
                {'error': 'new_date and new_time are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_date = datetime.strptime(new_date_str, '%Y-%m-%d').date()
            new_time = datetime.strptime(new_time_str, '%H:%M').time()
        except ValueError:
            return Response(
                {'error': 'Invalid date or time format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if new time slot is available
        existing_appointment = Appointment.objects.filter(
            doctor=appointment.doctor,
            appointment_date=new_date,
            appointment_time=new_time,
            status__in=['scheduled', 'confirmed']
        ).exclude(id=appointment.id).exists()
        
        if existing_appointment:
            return Response(
                {'error': 'The selected time slot is not available'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update appointment
        appointment.appointment_date = new_date
        appointment.appointment_time = new_time
        appointment.status = 'rescheduled'
        appointment.reschedule_reason = reschedule_reason
        appointment.rescheduled_at = timezone.now()
        appointment.save()
        
        return Response({
            'message': 'Appointment rescheduled successfully',
            'appointment': {
                'id': appointment.id,
                'date': appointment.appointment_date.strftime('%Y-%m-%d'),
                'time': appointment.appointment_time.strftime('%H:%M:%S'),
                'status': appointment.status,
                'reschedule_reason': appointment.reschedule_reason,
                'rescheduled_at': appointment.rescheduled_at.isoformat()
            }
        })
        
    except Appointment.DoesNotExist:
        return Response(
            {'error': 'Appointment not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )