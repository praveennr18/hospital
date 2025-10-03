from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User, Doctor, Patient, Appointment
from .serializers import UserSerializer, DoctorSerializer, PatientSerializer, AppointmentSerializer
from rest_framework.permissions import BasePermission
from rest_framework.decorators import action
import logging

logger = logging.getLogger('django')

# Custom permissions
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'doctor'

class IsPatient(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'patient'



class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        # Return the current user's information
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        logger.info(f"Admin {request.user.username} created a user.")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        logger.info(f"Admin {request.user.username} updated a user.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        logger.info(f"Admin {request.user.username} deleted a user.")
        return super().destroy(request, *args, **kwargs)



class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAdmin]

    def create(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'detail': 'Only admin can create doctor accounts.'}, status=status.HTTP_403_FORBIDDEN)
        logger.info(f"Admin {request.user.username} created a doctor profile.")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        logger.info(f"{request.user.role.capitalize()} {request.user.username} updated a doctor profile.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        logger.info(f"{request.user.role.capitalize()} {request.user.username} deleted a doctor profile.")
        return super().destroy(request, *args, **kwargs)



class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        elif self.action == 'me':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsAdmin]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        # Return the patient object for the logged-in user
        try:
            patient = Patient.objects.get(user=request.user)
            serializer = self.get_serializer(patient)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response({'detail': 'Patient profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'detail': 'Only admin can create patient accounts.'}, status=status.HTTP_403_FORBIDDEN)
        logger.info(f"Admin {request.user.username} created a patient profile.")
        import random, string
        # Generate temp password
        temp_password = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(10))
        # Set password in user data
        data = request.data.copy()
        if 'user' in data:
            data['user'] = data['user'].copy() if isinstance(data['user'], dict) else data['user']
            data['user']['must_reset_password'] = True
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        patient = serializer.save()
        # Set password after user is created
        user = patient.user
        user.set_password(temp_password)
        user.save()
        headers = self.get_success_headers(serializer.data)
        return Response({
            'patient': PatientSerializer(patient).data,
            'username': user.email,
            'temp_password': temp_password
        }, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        logger.info(f"{request.user.role.capitalize()} {request.user.username} updated a patient profile.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        logger.info(f"{request.user.role.capitalize()} {request.user.username} deleted a patient profile.")
        return super().destroy(request, *args, **kwargs)


# Password reset endpoint for first login
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
UserModel = get_user_model()

class FirstLoginPasswordResetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.must_reset_password:
            return Response({'detail': 'Password reset not required.'}, status=status.HTTP_400_BAD_REQUEST)
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({'detail': 'New password required.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.must_reset_password = False
        user.save()
        logger.info(f"{user.role.capitalize()} {user.username} reset their password on first login.")
        return Response({'detail': 'Password reset successful.'})

    def update(self, request, *args, **kwargs):
        logger.info(f"{request.user.role.capitalize()} {request.user.username} updated a patient profile.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        logger.info(f"{request.user.role.capitalize()} {request.user.username} deleted a patient profile.")
        return super().destroy(request, *args, **kwargs)



class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'create', 'update', 'partial_update', 'destroy', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        logger.info(f"{request.user.role.capitalize()} {request.user.username} created an appointment.")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        logger.info(f"{request.user.role.capitalize()} {request.user.username} updated an appointment.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        logger.info(f"{request.user.role.capitalize()} {request.user.username} deleted an appointment.")
        return super().destroy(request, *args, **kwargs)
