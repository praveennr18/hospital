from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import PatientProfile, MedicalHistory, Allergy, Medication
from ..serializers import MedicalHistorySerializer, AllergySerializer, MedicationSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def medical_history_management(request):
    """
    Manage patient's medical history.
    GET: List patient's medical history
    POST: Add new medical history entry
    """
    if not hasattr(request.user, 'patientprofile'):
        return Response(
            {'error': 'User is not associated with a patient profile'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    patient = request.user.patientprofile
    
    if request.method == 'GET':
        medical_history = MedicalHistory.objects.filter(patient=patient).order_by('-created_at')
        serializer = MedicalHistorySerializer(medical_history, many=True)
        
        return Response({
            'medical_history': serializer.data,
            'total_count': len(serializer.data)
        })
    
    elif request.method == 'POST':
        # Create new medical history entry
        serializer = MedicalHistorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(patient=patient)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def medical_history_detail(request, history_id):
    """
    Update or delete specific medical history entry.
    """
    if not hasattr(request.user, 'patientprofile'):
        return Response(
            {'error': 'User is not associated with a patient profile'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    patient = request.user.patientprofile
    medical_history = get_object_or_404(
        MedicalHistory, 
        id=history_id, 
        patient=patient
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
    Manage patient's allergies.
    GET: List patient's allergies
    POST: Add new allergy
    """
    if not hasattr(request.user, 'patientprofile'):
        return Response(
            {'error': 'User is not associated with a patient profile'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    patient = request.user.patientprofile
    
    if request.method == 'GET':
        allergies = Allergy.objects.filter(patient=patient).order_by('-created_at')
        serializer = AllergySerializer(allergies, many=True)
        
        return Response({
            'allergies': serializer.data,
            'total_count': len(serializer.data)
        })
    
    elif request.method == 'POST':
        # Create new allergy entry
        serializer = AllergySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(patient=patient)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def allergy_detail(request, allergy_id):
    """
    Update or delete specific allergy.
    """
    if not hasattr(request.user, 'patientprofile'):
        return Response(
            {'error': 'User is not associated with a patient profile'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    patient = request.user.patientprofile
    allergy = get_object_or_404(Allergy, id=allergy_id, patient=patient)
    
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
    Manage patient's current medications.
    GET: List patient's medications
    POST: Add new medication
    """
    if not hasattr(request.user, 'patientprofile'):
        return Response(
            {'error': 'User is not associated with a patient profile'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    patient = request.user.patientprofile
    
    if request.method == 'GET':
        medications = Medication.objects.filter(patient=patient, is_active=True).order_by('-created_at')
        serializer = MedicationSerializer(medications, many=True)
        
        return Response({
            'medications': serializer.data,
            'total_count': len(serializer.data)
        })
    
    elif request.method == 'POST':
        # Create new medication entry
        serializer = MedicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(patient=patient, is_active=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def medication_detail(request, medication_id):
    """
    Update or delete/stop specific medication.
    """
    if not hasattr(request.user, 'patientprofile'):
        return Response(
            {'error': 'User is not associated with a patient profile'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    patient = request.user.patientprofile
    medication = get_object_or_404(Medication, id=medication_id, patient=patient)
    
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