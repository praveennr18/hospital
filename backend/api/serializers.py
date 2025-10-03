from django.core.mail import send_mail
from rest_framework import serializers
from .models import User, Doctor, Patient, Appointment
from django.contrib.auth.base_user import BaseUserManager

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name']


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'specialty', 'department', 'phone', 'dob', 'gender', 'experience', 'license', 'qualifications',
            'address', 'city', 'state', 'zip', 'emergency_name', 'emergency_relationship', 'emergency_phone', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


    def create(self, validated_data):
        user_data = validated_data.pop('user')
        email = user_data.get('email')
        temp_password = User.objects.make_random_password()
        user = User.objects.create(
            username=email,
            email=email,
            role='doctor',
            must_reset_password=True
        )
        user.set_password(temp_password)
        user.save()
        doctor = Doctor.objects.create(user=user, **validated_data)
        # Send credentials to doctor's email
        send_mail(
            subject='Your Doctor Account Credentials',
            message=f'Your account has been created.\nUsername: {email}\nTemporary Password: {temp_password}\nPlease reset your password after first login.',
            from_email=None,
            recipient_list=[email],
            fail_silently=True
        )
        return doctor

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance



class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'dob', 'phone', 'gender', 'blood', 'address', 'city', 'state', 'zip',
            'emergency_name', 'emergency_relationship', 'emergency_phone',
            'insurance_provider', 'policy_number', 'status', 'created_at', 'updated_at',
            'medical_history', 'allergies', 'medications',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = 'patient'  # Always enforce role in backend
        user_data['must_reset_password'] = True
        user = User.objects.create(**user_data)
        user.save()
        patient = Patient.objects.create(user=user, **validated_data)
        return patient

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all())
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())

    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'patient', 'date', 'reason', 'status']
