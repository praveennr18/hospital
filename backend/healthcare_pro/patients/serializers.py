from rest_framework import serializers
from .models import PatientProfile, MedicalHistory, Allergy, Medication
from accounts.serializers import UserSerializer


class PatientProfileSerializer(serializers.ModelSerializer):
    """Serializer for PatientProfile model."""
    
    user = UserSerializer(read_only=True)
    age = serializers.ReadOnlyField()
    bmi = serializers.ReadOnlyField()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user', 'full_name', 'phone_number', 'date_of_birth', 'gender', 'age',
            'address', 'city', 'state', 'zip_code', 'blood_group', 'height', 'weight', 'bmi', 
            'allergies', 'chronic_conditions', 'current_medications', 'emergency_contact_name', 
            'emergency_contact_phone', 'relationship', 'insurance_provider', 'policy_number', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()


class PatientProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating PatientProfile."""
    
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    
    class Meta:
        model = PatientProfile
        fields = [
            'email', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 
            'gender', 'address', 'city', 'state', 'zip_code', 'blood_group', 
            'height', 'weight', 'allergies', 'chronic_conditions', 'current_medications', 
            'emergency_contact_name', 'emergency_contact_phone', 'relationship', 
            'insurance_provider', 'policy_number'
        ]


class PatientProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating PatientProfile."""
    
    class Meta:
        model = PatientProfile
        fields = [
            'phone_number', 'date_of_birth', 'gender', 'address', 'city', 'state', 'zip_code',
            'blood_group', 'height', 'weight', 'allergies', 'chronic_conditions', 'current_medications',
            'emergency_contact_name', 'emergency_contact_phone', 'relationship', 
            'insurance_provider', 'policy_number'
        ]


class PatientProfileListSerializer(serializers.ModelSerializer):
    """Serializer for listing patients."""
    
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user', 'full_name', 'phone_number', 'age', 'gender', 
            'blood_group', 'created_at'
        ]
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()


class MedicalHistorySerializer(serializers.ModelSerializer):
    """Serializer for MedicalHistory model for patient self-management."""
    
    diagnosed_date = serializers.DateField(source='date')
    notes = serializers.CharField(source='description', required=False, allow_blank=True)
    status = serializers.CharField(default='Ongoing', read_only=True)
    
    class Meta:
        model = MedicalHistory
        fields = [
            'id', 'condition', 'diagnosed_date', 'status', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'status']


class MedicalHistoryCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating MedicalHistory records."""
    
    class Meta:
        model = MedicalHistory
        fields = ['condition']


class AllergySerializer(serializers.ModelSerializer):
    """Serializer for Allergy model."""
    
    class Meta:
        model = Allergy
        fields = ['id', 'allergen', 'severity', 'reaction', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class AllergyCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating Allergy records."""
    
    class Meta:
        model = Allergy
        fields = ['allergen']


class MedicationSerializer(serializers.ModelSerializer):
    """Serializer for Medication model."""
    
    class Meta:
        model = Medication
        fields = [
            'id', 'medication_name', 'dosage', 'frequency', 'prescribed_date',
            'condition', 'prescribing_doctor', 'notes', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MedicationCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating Medication records."""
    
    class Meta:
        model = Medication
        fields = ['medication_name', 'dosage']


# Simplified serializers for GET responses (patient API)
class MedicalHistorySimpleSerializer(serializers.ModelSerializer):
    """Simplified serializer for MedicalHistory GET responses."""
    
    class Meta:
        model = MedicalHistory
        fields = ['id', 'condition']


class AllergySimpleSerializer(serializers.ModelSerializer):
    """Simplified serializer for Allergy GET responses."""
    
    class Meta:
        model = Allergy
        fields = ['id', 'allergen']


class MedicationSimpleSerializer(serializers.ModelSerializer):
    """Simplified serializer for Medication GET responses."""
    
    class Meta:
        model = Medication
        fields = ['id', 'medication_name', 'dosage']