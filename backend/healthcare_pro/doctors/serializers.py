from rest_framework import serializers
from .models import Doctor, Availability
from accounts.serializers import UserSerializer

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['id', 'day_of_week', 'start_time', 'end_time', 'is_available', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    availabilities = AvailabilitySerializer(many=True, read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = ['id', 'user', 'doctor_id', 'full_name', 'specialization', 'license_number',
                  'years_of_experience', 'qualifications', 'date_of_birth', 'gender',
                  'phone', 'address', 'city', 'state', 'zip_code',
                  'emergency_contact_name', 'emergency_contact_phone',
                  'emergency_contact_relationship', 'department', 'consultation_fee',
                  'is_available', 'availabilities', 'created_at', 'updated_at']
        read_only_fields = ['id', 'doctor_id', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"

class DoctorCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    
    class Meta:
        model = Doctor
        fields = ['email', 'first_name', 'last_name', 'specialization', 'license_number',
                  'years_of_experience', 'qualifications', 'date_of_birth', 'gender',
                  'phone', 'address', 'city', 'state', 'zip_code',
                  'emergency_contact_name', 'emergency_contact_phone',
                  'emergency_contact_relationship', 'department', 'consultation_fee']

class DoctorUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['specialization', 'years_of_experience', 'qualifications',
                  'phone', 'address', 'city', 'state', 'zip_code',
                  'emergency_contact_name', 'emergency_contact_phone',
                  'emergency_contact_relationship', 'department',
                  'consultation_fee', 'is_available']


class DoctorPublicSerializer(serializers.ModelSerializer):
    """Public doctor serializer for patient-facing endpoints (excludes sensitive info like fees)."""
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    specialization_display = serializers.CharField(source='get_specialization_display', read_only=True)
    
    class Meta:
        model = Doctor
        fields = ['id', 'user', 'full_name', 'specialization', 'specialization_display', 
                  'years_of_experience', 'qualifications', 'department', 'is_available']
        read_only_fields = ['id']
    
    def get_full_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"

class DoctorListSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = ['id', 'doctor_id', 'full_name', 'user', 'specialization',
                  'years_of_experience', 'department', 'consultation_fee', 'is_available']
    
    def get_full_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"