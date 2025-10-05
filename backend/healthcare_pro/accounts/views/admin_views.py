from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db import transaction
from datetime import datetime

from ..models import User
from ..serializers import (
    UserSerializer,
    RegisterUserSerializer
)
from ..permissions import IsAdmin
from doctors.models import Doctor
from patients.models import PatientProfile


def _normalize_gender(value):
    if not value:
        return None
    value = value.strip().lower()
    mapping = {
        'male': 'M',
        'm': 'M',
        'female': 'F',
        'f': 'F',
        'other': 'O',
        'o': 'O'
    }
    return mapping.get(value, None)


def _normalize_specialization(value):
    if not value:
        return None
    from doctors.models import Doctor

    normalized = value.strip().lower().replace(' ', '_')
    valid_codes = {choice[0] for choice in Doctor.SPECIALIZATION_CHOICES}
    if normalized in valid_codes:
        return normalized

    # Try to match on display label
    display_map = {choice[1].strip().lower(): choice[0] for choice in Doctor.SPECIALIZATION_CHOICES}
    if value.strip().lower() in display_map:
        return display_map[value.strip().lower()]

    return normalized


def _parse_date(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value.date()
    for fmt in ('%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y'):
        try:
            return datetime.strptime(value, fmt).date()
        except (ValueError, TypeError):
            continue
    return None


def _parse_time(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value.time()
    for fmt in ('%H:%M', '%H:%M:%S', '%I:%M %p'):
        try:
            return datetime.strptime(value, fmt).time()
        except (ValueError, TypeError):
            continue
    return None


def _format_doctor_response(doctor):
    specialization_display = doctor.get_specialization_display() if hasattr(doctor, 'get_specialization_display') else doctor.specialization
    return {
        'id': str(doctor.id),
        'doctor_id': doctor.doctor_id,
        'user_id': str(doctor.user.id),
        'name': f"Dr. {doctor.user.get_full_name()}",
        'first_name': doctor.user.first_name,
        'last_name': doctor.user.last_name,
        'email': doctor.user.email,
        'phone': doctor.phone or '',
        'specialization': specialization_display,
        'specialty': specialization_display,
        'specialization_code': doctor.specialization,
        'department': doctor.department or specialization_display,
        'experience': doctor.years_of_experience,
        'experience_label': f"{doctor.years_of_experience} years" if doctor.years_of_experience is not None else None,
        'license_number': doctor.license_number,
        'qualification': doctor.qualification,
        'date_of_birth': doctor.date_of_birth.isoformat() if doctor.date_of_birth else None,
        'gender': doctor.get_gender_display() if doctor.gender else None,
        'gender_code': doctor.gender,
        'address': {
            'street': doctor.address or '',
            'city': doctor.city or '',
            'state': doctor.state or '',
            'zip': doctor.zip_code or ''
        },
        'emergency_contact': {
            'name': doctor.emergency_contact_name or '',
            'phone': doctor.emergency_contact_phone or '',
            'relationship': doctor.relationship or ''
        },
        'consultation_fee': str(doctor.consultation_fee),
        'working_days': doctor.working_days or [],
        'start_time': doctor.start_time.isoformat() if doctor.start_time else None,
        'end_time': doctor.end_time.isoformat() if doctor.end_time else None,
        'status': 'Active' if doctor.is_available else 'Inactive',
        'status_boolean': doctor.is_available,
        'created_at': doctor.created_at.isoformat()
    }


def _format_patient_response(patient):
    from appointments.models import Appointment

    age = patient.age
    last_appointment = Appointment.objects.filter(patient=patient).order_by('-appointment_date').first()
    last_visit = last_appointment.appointment_date.strftime('%m/%d/%Y') if last_appointment else None

    return {
        'id': patient.id,
        'patient_id': patient.id,
        'user_id': str(patient.user.id),
        'name': patient.user.get_full_name(),
        'first_name': patient.user.first_name,
        'last_name': patient.user.last_name,
        'email': patient.user.email,
        'phone': patient.phone_number or '',
        'date_of_birth': patient.date_of_birth.isoformat() if patient.date_of_birth else None,
        'age': age,
        'gender': patient.get_gender_display() if patient.gender else None,
        'gender_code': patient.gender,
        'blood_group': patient.blood_group,
        'blood': patient.blood_group,
        'address': {
            'street': patient.address or '',
            'city': patient.city or '',
            'state': patient.state or '',
            'zip': patient.zip_code or ''
        },
        'emergency_contact': {
            'name': patient.emergency_contact_name or '',
            'phone': patient.emergency_contact_phone or '',
            'relationship': patient.relationship or ''
        },
        'insurance': {
            'provider': patient.insurance_provider or '',
            'policy_number': patient.policy_number or ''
        },
        'last_visit': last_visit,
        'created_at': patient.created_at.isoformat()
    }


def _get_value(data, *keys, default=None):
    for key in keys:
        if key in data and data[key] not in [None, '']:
            return data[key]
    return default


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
        email_sent = result.get('email_sent', False)
        
        return Response({
            'user': UserSerializer(user).data,
            'password': password,
            'email_sent': email_sent,
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
            data = request.data

            # Extract user data with flexible key support
            user_data = {
                'email': _get_value(data, 'email'),
                'first_name': _get_value(data, 'first_name', 'firstName'),
                'last_name': _get_value(data, 'last_name', 'lastName'),
                'role': 'patient'
            }

            if not user_data['email']:
                raise ValidationError({'email': 'Email is required.'})

            # Create user account
            user_serializer = RegisterUserSerializer(data=user_data)
            user_serializer.is_valid(raise_exception=True)
            result = user_serializer.save()
            user = result['user']
            password = result['password']
            email_sent = result.get('email_sent', False)

            address_data = data.get('address') or {}
            emergency_data = data.get('emergency_contact') or {}
            insurance_data = data.get('insurance') or {}

            profile_data = {
                'phone_number': _get_value(data, 'phone_number', 'phone'),
                'date_of_birth': _parse_date(_get_value(data, 'date_of_birth', 'dob')),
                'gender': _normalize_gender(_get_value(data, 'gender')),
                'blood_group': _get_value(data, 'blood_group', 'blood', 'bloodType'),
                'address': _get_value(address_data, 'street', 'address', default=''),
                'city': _get_value(address_data, 'city', default=''),
                'state': _get_value(address_data, 'state', default=''),
                'zip_code': _get_value(address_data, 'zip', 'postalCode', default=''),
                'emergency_contact_name': _get_value(emergency_data, 'name', 'full_name'),
                'emergency_contact_phone': _get_value(emergency_data, 'phone'),
                'relationship': _get_value(emergency_data, 'relationship'),
                'insurance_provider': _get_value(insurance_data, 'provider'),
                'policy_number': _get_value(insurance_data, 'policy_number')
            }

            # Remove None values to avoid overriding defaults
            profile_data = {k: v for k, v in profile_data.items() if v not in [None, '']}

            # Create patient profile
            patient_profile = PatientProfile.objects.create(user=user, **profile_data)

            return Response({
                'success': True,
                'message': 'Patient registered successfully',
                'user': UserSerializer(user).data,
                'patient': _format_patient_response(patient_profile),
                'patient_id': str(patient_profile.id),
                'credentials': {
                    'email': user.email,
                    'password': password,
                    'role': 'patient'
                },
                'email_sent': email_sent
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
            data = request.data

            user_data = {
                'email': _get_value(data, 'email'),
                'first_name': _get_value(data, 'first_name', 'firstName'),
                'last_name': _get_value(data, 'last_name', 'lastName'),
                'role': 'doctor'
            }

            if not user_data['email']:
                raise ValidationError({'email': 'Email is required.'})

            specialization_code = _normalize_specialization(_get_value(data, 'specialization', 'specialty'))
            if not specialization_code:
                raise ValidationError({'specialization': 'Specialization is required.'})

            license_number = _get_value(data, 'license_number', 'license')
            if not license_number:
                raise ValidationError({'license_number': 'License number is required.'})

            experience_value = _get_value(data, 'years_of_experience', 'experience')
            try:
                years_of_experience = int(experience_value) if experience_value is not None else 0
            except (TypeError, ValueError):
                years_of_experience = 0

            consultation_fee = _get_value(data, 'consultation_fee', 'consultationFee')
            try:
                consultation_fee = float(consultation_fee) if consultation_fee is not None else 0.00
            except (TypeError, ValueError):
                consultation_fee = 0.00

            address_data = data.get('address') or {}
            emergency_data = data.get('emergency_contact') or {}

            start_time = _parse_time(_get_value(data, 'start_time'))
            end_time = _parse_time(_get_value(data, 'end_time'))

            status_value = (_get_value(data, 'status') or 'active').strip().lower()
            is_available = status_value not in ['inactive', 'false', '0']

            profile_data = {
                'specialization': specialization_code,
                'department': _get_value(data, 'department'),
                'years_of_experience': years_of_experience,
                'license_number': license_number,
                'qualification': _get_value(data, 'qualification'),
                'phone': _get_value(data, 'phone'),
                'date_of_birth': _parse_date(_get_value(data, 'date_of_birth', 'dob')),
                'gender': _normalize_gender(_get_value(data, 'gender')),
                'address': _get_value(address_data, 'street', 'address', default=''),
                'city': _get_value(address_data, 'city', default=''),
                'state': _get_value(address_data, 'state', default=''),
                'zip_code': _get_value(address_data, 'zip', 'postalCode', default=''),
                'emergency_contact_name': _get_value(emergency_data, 'name', 'full_name'),
                'emergency_contact_phone': _get_value(emergency_data, 'phone'),
                'relationship': _get_value(emergency_data, 'relationship'),
                'consultation_fee': consultation_fee,
                'working_days': data.get('working_days') or ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                'start_time': start_time,
                'end_time': end_time,
                'is_available': is_available,
            }

            profile_data = {k: v for k, v in profile_data.items() if v not in [None, '']}

            user_serializer = RegisterUserSerializer(data=user_data)
            user_serializer.is_valid(raise_exception=True)
            result = user_serializer.save()
            user = result['user']
            password = result['password']
            email_sent = result.get('email_sent', False)

            doctor_profile = Doctor.objects.create(user=user, **profile_data)

            return Response({
                'success': True,
                'message': 'Doctor registered successfully',
                'user': UserSerializer(user).data,
                'doctor': _format_doctor_response(doctor_profile),
                'doctor_id': doctor_profile.doctor_id,
                'credentials': {
                    'email': user.email,
                    'password': password,
                    'role': 'doctor'
                },
                'email_sent': email_sent
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

    doctors_data = [_format_doctor_response(doctor) for doctor in doctors]

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

    patients_data = [_format_patient_response(patient) for patient in patients]

    return Response({
        'patients': patients_data,
        'total': len(patients_data)
    })


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAdmin])
def admin_doctor_detail(request, doctor_id):
    doctor = get_object_or_404(Doctor.objects.select_related('user'), doctor_id=doctor_id)

    if request.method == 'GET':
        return Response({'doctor': _format_doctor_response(doctor)})

    if request.method == 'PATCH':
        data = request.data
        try:
            with transaction.atomic():
                user = doctor.user

                email = _get_value(data, 'email')
                if email and email != user.email:
                    if User.objects.filter(email=email).exclude(pk=user.pk).exists():
                        raise ValidationError({'email': 'User with this email already exists.'})
                    user.email = email

                first_name = _get_value(data, 'first_name', 'firstName')
                if first_name is not None:
                    user.first_name = first_name

                last_name = _get_value(data, 'last_name', 'lastName')
                if last_name is not None:
                    user.last_name = last_name

                user.save()

                specialization = _get_value(data, 'specialization', 'specialty')
                if specialization is not None:
                    doctor.specialization = _normalize_specialization(specialization)

                department = _get_value(data, 'department')
                if department is not None:
                    doctor.department = department

                phone = _get_value(data, 'phone')
                if phone is not None:
                    doctor.phone = phone

                experience_value = _get_value(data, 'years_of_experience', 'experience')
                if experience_value is not None:
                    try:
                        doctor.years_of_experience = int(experience_value)
                    except (TypeError, ValueError):
                        pass

                qualification = _get_value(data, 'qualification')
                if qualification is not None:
                    doctor.qualification = qualification

                license_number = _get_value(data, 'license_number', 'license')
                if license_number is not None:
                    doctor.license_number = license_number

                gender = _normalize_gender(_get_value(data, 'gender'))
                if gender is not None:
                    doctor.gender = gender

                date_of_birth = _parse_date(_get_value(data, 'date_of_birth', 'dob'))
                if date_of_birth is not None:
                    doctor.date_of_birth = date_of_birth

                address_data = data.get('address') or {}
                if address_data:
                    street = _get_value(address_data, 'street', 'address')
                    if street is not None:
                        doctor.address = street
                    city = _get_value(address_data, 'city')
                    if city is not None:
                        doctor.city = city
                    state = _get_value(address_data, 'state')
                    if state is not None:
                        doctor.state = state
                    zip_code = _get_value(address_data, 'zip', 'postalCode')
                    if zip_code is not None:
                        doctor.zip_code = zip_code

                emergency_data = data.get('emergency_contact') or {}
                if emergency_data:
                    ec_name = _get_value(emergency_data, 'name', 'full_name')
                    if ec_name is not None:
                        doctor.emergency_contact_name = ec_name
                    ec_phone = _get_value(emergency_data, 'phone')
                    if ec_phone is not None:
                        doctor.emergency_contact_phone = ec_phone
                    ec_relationship = _get_value(emergency_data, 'relationship')
                    if ec_relationship is not None:
                        doctor.relationship = ec_relationship

                consultation_fee = _get_value(data, 'consultation_fee', 'consultationFee')
                if consultation_fee is not None:
                    try:
                        doctor.consultation_fee = float(consultation_fee)
                    except (TypeError, ValueError):
                        pass

                start_time = _parse_time(_get_value(data, 'start_time'))
                if start_time is not None:
                    doctor.start_time = start_time

                end_time = _parse_time(_get_value(data, 'end_time'))
                if end_time is not None:
                    doctor.end_time = end_time

                if 'working_days' in data and isinstance(data['working_days'], list):
                    doctor.working_days = data['working_days']

                if 'is_available' in data:
                    doctor.is_available = bool(data['is_available'])
                elif 'status' in data:
                    status_value = str(data['status']).strip().lower()
                    doctor.is_available = status_value not in ['inactive', 'false', '0']

                doctor.save()

                return Response({
                    'success': True,
                    'doctor': _format_doctor_response(doctor)
                })
        except ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    user_email = doctor.user.email
    doctor.user.delete()
    return Response({
        'success': True,
        'message': f'Doctor {user_email} deleted successfully.'
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAdmin])
def admin_patient_detail(request, patient_id):
    patient = get_object_or_404(PatientProfile.objects.select_related('user'), pk=patient_id)

    if request.method == 'GET':
        return Response({'patient': _format_patient_response(patient)})

    if request.method == 'PATCH':
        data = request.data
        try:
            with transaction.atomic():
                user = patient.user

                email = _get_value(data, 'email')
                if email and email != user.email:
                    if User.objects.filter(email=email).exclude(pk=user.pk).exists():
                        raise ValidationError({'email': 'User with this email already exists.'})
                    user.email = email

                first_name = _get_value(data, 'first_name', 'firstName')
                if first_name is not None:
                    user.first_name = first_name

                last_name = _get_value(data, 'last_name', 'lastName')
                if last_name is not None:
                    user.last_name = last_name

                user.save()

                phone = _get_value(data, 'phone_number', 'phone')
                if phone is not None:
                    patient.phone_number = phone

                gender = _normalize_gender(_get_value(data, 'gender'))
                if gender is not None:
                    patient.gender = gender

                date_of_birth = _parse_date(_get_value(data, 'date_of_birth', 'dob'))
                if date_of_birth is not None:
                    patient.date_of_birth = date_of_birth

                blood_group = _get_value(data, 'blood_group', 'blood', 'bloodType')
                if blood_group is not None:
                    patient.blood_group = blood_group

                address_data = data.get('address') or {}
                if address_data:
                    street = _get_value(address_data, 'street', 'address')
                    if street is not None:
                        patient.address = street
                    city = _get_value(address_data, 'city')
                    if city is not None:
                        patient.city = city
                    state = _get_value(address_data, 'state')
                    if state is not None:
                        patient.state = state
                    zip_code = _get_value(address_data, 'zip', 'postalCode')
                    if zip_code is not None:
                        patient.zip_code = zip_code

                emergency_data = data.get('emergency_contact') or {}
                if emergency_data:
                    ec_name = _get_value(emergency_data, 'name', 'full_name')
                    if ec_name is not None:
                        patient.emergency_contact_name = ec_name
                    ec_phone = _get_value(emergency_data, 'phone')
                    if ec_phone is not None:
                        patient.emergency_contact_phone = ec_phone
                    ec_relationship = _get_value(emergency_data, 'relationship')
                    if ec_relationship is not None:
                        patient.relationship = ec_relationship

                insurance_data = data.get('insurance') or {}
                if insurance_data:
                    provider = _get_value(insurance_data, 'provider')
                    if provider is not None:
                        patient.insurance_provider = provider
                    policy_number = _get_value(insurance_data, 'policy_number')
                    if policy_number is not None:
                        patient.policy_number = policy_number

                patient.save()

                return Response({
                    'success': True,
                    'patient': _format_patient_response(patient)
                })
        except ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    user_email = patient.user.email
    patient.user.delete()
    return Response({
        'success': True,
        'message': f'Patient {user_email} deleted successfully.'
    }, status=status.HTTP_200_OK)


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