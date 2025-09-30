from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db import transaction

from ..models import User
from ..serializers import (
    UserSerializer,
    RegisterUserSerializer
)
from ..permissions import IsAdmin
from doctors.models import Doctor
from doctors.serializers import DoctorCreateSerializer
from patients.models import PatientProfile
from patients.serializers import PatientProfileCreateSerializer


class AdminCreateUserView(generics.CreateAPIView):
    """Admin creates new users (doctors/patients)."""
    
    serializer_class = RegisterUserSerializer
    permission_classes = [IsAdmin]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        
        user = result['user']
        password = result['password']
        
        return Response({
            'user': UserSerializer(user).data,
            'password': password,
            'message': f'{user.get_role_display()} account created successfully. Credentials sent via email.'
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAdmin])
def admin_register_patient(request):
    """
    Admin registers a complete patient with user account and profile.
    """
    try:
        with transaction.atomic():
            # Extract user data
            user_data = {
                'email': request.data.get('email'),
                'first_name': request.data.get('first_name'),
                'last_name': request.data.get('last_name'),
                'role': 'patient'
            }
            
            # Create user account
            user_serializer = RegisterUserSerializer(data=user_data)
            user_serializer.is_valid(raise_exception=True)
            result = user_serializer.save()
            user = result['user']
            password = result['password']
            
            # Create patient profile
            profile_data = {
                'date_of_birth': request.data.get('date_of_birth'),
                'gender': request.data.get('gender'),
                'blood_group': request.data.get('blood_group'),
                'phone_number': request.data.get('phone_number'),
                'address': request.data.get('address'),
                'city': request.data.get('city'),
                'state': request.data.get('state'),
                'zip_code': request.data.get('zip_code'),
                'emergency_contact_name': request.data.get('emergency_contact_name'),
                'emergency_contact_phone': request.data.get('emergency_contact_phone'),
                'relationship': request.data.get('relationship'),
                'insurance_provider': request.data.get('insurance_provider'),
                'policy_number': request.data.get('policy_number'),
            }
            
            # Remove None values
            profile_data = {k: v for k, v in profile_data.items() if v is not None}
            
            # Create patient profile
            patient_profile = PatientProfile.objects.create(user=user, **profile_data)
            
            return Response({
                'success': True,
                'message': 'Patient registered successfully',
                'user': UserSerializer(user).data,
                'patient_id': str(patient_profile.id),
                'credentials': {
                    'email': user.email,
                    'password': password,
                    'role': 'patient'
                }
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdmin])
def admin_register_doctor(request):
    """
    Admin registers a complete doctor with user account and profile.
    """
    try:
        with transaction.atomic():
            # Extract user data
            user_data = {
                'email': request.data.get('email'),
                'first_name': request.data.get('first_name'),
                'last_name': request.data.get('last_name'),
                'role': 'doctor'
            }
            
            # Create user account
            user_serializer = RegisterUserSerializer(data=user_data)
            user_serializer.is_valid(raise_exception=True)
            result = user_serializer.save()
            user = result['user']
            password = result['password']
            
            # Create doctor profile
            profile_data = {
                'specialization': request.data.get('specialization'),
                'department': request.data.get('department'),
                'years_of_experience': request.data.get('years_of_experience'),
                'license_number': request.data.get('license_number'),
                'qualification': request.data.get('qualification'),
                'phone': request.data.get('phone'),
                'date_of_birth': request.data.get('date_of_birth'),
                'gender': request.data.get('gender'),
                'address': request.data.get('address'),
                'city': request.data.get('city'),
                'state': request.data.get('state'),
                'zip_code': request.data.get('zip_code'),
                'emergency_contact_name': request.data.get('emergency_contact_name'),
                'emergency_contact_phone': request.data.get('emergency_contact_phone'),
                'relationship': request.data.get('relationship'),
                'consultation_fee': request.data.get('consultation_fee', 0.00),
                'working_days': request.data.get('working_days', []),
                'start_time': request.data.get('start_time'),
                'end_time': request.data.get('end_time'),
                'is_available': True,
            }
            
            # Remove None values
            profile_data = {k: v for k, v in profile_data.items() if v is not None}
            
            # Create doctor profile
            doctor_profile = Doctor.objects.create(user=user, **profile_data)
            
            return Response({
                'success': True,
                'message': 'Doctor registered successfully',
                'user': UserSerializer(user).data,
                'doctor_id': doctor_profile.doctor_id,
                'credentials': {
                    'email': user.email,
                    'password': password,
                    'role': 'doctor'
                }
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard_stats(request):
    """
    Get admin dashboard statistics.
    """
    from appointments.models import Appointment
    from django.utils import timezone
    
    today = timezone.now().date()
    
    # Count statistics
    total_patients = PatientProfile.objects.count()
    total_doctors = Doctor.objects.count()
    today_appointments = Appointment.objects.filter(appointment_date=today).count()
    total_appointments = Appointment.objects.count()
    
    # Get today's appointments with details
    todays_schedule = Appointment.objects.filter(
        appointment_date=today
    ).select_related('patient__user', 'doctor__user').order_by('appointment_time')
    
    schedule_data = []
    for appointment in todays_schedule:
        schedule_data.append({
            'id': str(appointment.id),
            'time': appointment.appointment_time.strftime('%I:%M %p'),
            'patient_name': appointment.patient.user.get_full_name(),
            'doctor_name': f"Dr. {appointment.doctor.user.get_full_name()}",
            'reason': appointment.reason,
            'status': appointment.status,
            'appointment_type': appointment.reason.lower() if appointment.reason else 'consultation'
        })
    
    return Response({
        'stats': {
            'total_patients': total_patients,
            'total_doctors': total_doctors,
            'today_appointments': today_appointments,
            'total_appointments': total_appointments
        },
        'todays_schedule': schedule_data
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_doctors_list(request):
    """
    Get list of all doctors for admin management.
    """
    doctors = Doctor.objects.select_related('user').all().order_by('-created_at')
    
    doctors_data = []
    for doctor in doctors:
        doctors_data.append({
            'id': str(doctor.id),
            'doctor_id': doctor.doctor_id,
            'name': f"Dr. {doctor.user.get_full_name()}",
            'email': doctor.user.email,
            'phone': doctor.phone or "N/A",
            'specialization': doctor.specialization,
            'department': doctor.department,
            'experience': f"{doctor.years_of_experience} years",
            'status': 'Active' if doctor.is_available else 'Inactive',
            'created_at': doctor.created_at.strftime('%Y-%m-%d')
        })
    
    return Response({
        'doctors': doctors_data,
        'total': len(doctors_data)
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_patients_list(request):
    """
    Get list of all patients for admin management.
    """
    patients = PatientProfile.objects.select_related('user').all().order_by('-created_at')
    
    patients_data = []
    for patient in patients:
        # Calculate age from date_of_birth
        age = None
        if patient.date_of_birth:
            from datetime import date
            today = date.today()
            age = today.year - patient.date_of_birth.year - ((today.month, today.day) < (patient.date_of_birth.month, patient.date_of_birth.day))
        
        # Get last appointment date
        last_appointment = None
        from appointments.models import Appointment
        last_appt = Appointment.objects.filter(patient=patient).order_by('-appointment_date').first()
        if last_appt:
            last_appointment = last_appt.appointment_date.strftime('%m/%d/%Y')
        
        patients_data.append({
            'id': str(patient.id),
            'patient_id': str(patient.id)[:8].upper(),  # Short ID for display
            'name': patient.user.get_full_name(),
            'email': patient.user.email,
            'phone': patient.phone_number or "N/A",
            'age': f"{age} years" if age else "N/A",
            'gender': patient.get_gender_display() if patient.gender else "N/A",
            'blood_group': patient.blood_group or "N/A",
            'last_visit': last_appointment or "N/A",
            'created_at': patient.created_at.strftime('%Y-%m-%d')
        })
    
    return Response({
        'patients': patients_data,
        'total': len(patients_data)
    })


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin can view, update, or delete any user."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


class AdminResetPasswordView(generics.UpdateAPIView):
    """Admin can reset any user's password."""
    
    permission_classes = [IsAdmin]
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        new_password = User.objects.make_random_password(length=12)
        user.set_password(new_password)
        user.save()
        
        # In production, send email with new password
        # For development, return password in response
        return Response({
            'message': f'Password reset successfully for {user.email}',
            'new_password': new_password,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    def get_object(self):
        return get_object_or_404(User, pk=self.kwargs['pk'])


class UserListView(generics.ListAPIView):
    """Admin can list all users with filtering."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ['role', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'email']
    ordering = ['-date_joined']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by role
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset