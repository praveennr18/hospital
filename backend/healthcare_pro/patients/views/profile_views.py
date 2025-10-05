from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions

from ..models import PatientProfile
from ..serializers import PatientProfileSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_profile(request):
    """
    Get current patient's profile.
    Only for patients.
    """
    if request.user.role != 'patient':
        return Response(
            {"error": "This endpoint is only for patients."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = PatientProfile.objects.select_related('user').get(user=request.user)
        serializer = PatientProfileSerializer(patient)
        return Response(serializer.data)
    except PatientProfile.DoesNotExist:
        return Response(
            {"error": "Patient profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )