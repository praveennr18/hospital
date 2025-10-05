from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound

from ..models import PatientProfile, MedicalHistory
from ..serializers import (
    MedicalHistorySerializer, MedicalHistoryCreateSerializer
)
from accounts.permissions import IsAdminOrDoctor, IsPatientOrReadOnly


class MedicalHistoryListCreateView(generics.ListCreateAPIView):
    """
    List or create medical history records.
    """
    permission_classes = [IsAdminOrDoctor]
    
    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        return MedicalHistory.objects.filter(patient_id=patient_id).order_by('-date')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MedicalHistoryCreateSerializer
        return MedicalHistorySerializer
    
    def perform_create(self, serializer):
        patient_id = self.kwargs.get('patient_id')
        try:
            patient = PatientProfile.objects.get(id=patient_id)
        except PatientProfile.DoesNotExist:
            raise NotFound("Patient not found.")
        
        serializer.save(patient=patient)


class MedicalHistoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a medical history record.
    """
    queryset = MedicalHistory.objects.all()
    serializer_class = MedicalHistorySerializer
    permission_classes = [IsAdminOrDoctor]