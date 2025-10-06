from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth import get_user_model

from ..models import PasswordResetToken
from ..utils import generate_verification_code, send_verification_code_email

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Step 1: Verify email exists and send verification code
    Only for doctor and patient roles
    """
    email = request.data.get('email', '').strip().lower()
    
    if not email:
        return Response({
            'success': False,
            'error': 'Email is required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Check if user is admin - not allowed for password reset
        if user.role == 'admin':
            return Response({
                'success': False,
                'error': 'Password reset is not available for admin accounts. Please contact system administrator.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user is doctor or patient
        if user.role not in ['doctor', 'patient']:
            return Response({
                'success': False,
                'error': 'Invalid user role.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Invalidate any existing unused tokens for this user
        PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Generate new verification code
        code = generate_verification_code()
        
        # Create new token
        reset_token = PasswordResetToken.objects.create(
            user=user,
            code=code
        )
        
        # Send verification code via email
        email_sent = send_verification_code_email(
            email=user.email,
            code=code,
            first_name=user.first_name
        )
        
        return Response({
            'success': True,
            'message': 'Verification code sent to your email.',
            'email_sent': email_sent,
            'email': user.email
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User is not registered. Please contact admin for registration process.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_code(request):
    """
    Step 2: Verify the code sent to user's email
    """
    email = request.data.get('email', '').strip().lower()
    code = request.data.get('code', '').strip()
    
    if not email or not code:
        return Response({
            'success': False,
            'error': 'Email and verification code are required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Get the most recent unused token for this user
        reset_token = PasswordResetToken.objects.filter(
            user=user,
            is_used=False
        ).order_by('-created_at').first()
        
        if not reset_token:
            return Response({
                'success': False,
                'error': 'No active verification code found. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if token is expired
        if not reset_token.is_valid():
            return Response({
                'success': False,
                'error': 'Verification code has expired. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the code
        if reset_token.code != code:
            return Response({
                'success': False,
                'error': 'Invalid verification code. Please try again.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': 'Verification code confirmed. You can now reset your password.'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User not found.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Step 3: Reset the password after code verification
    """
    email = request.data.get('email', '').strip().lower()
    code = request.data.get('code', '').strip()
    new_password = request.data.get('new_password', '')
    confirm_password = request.data.get('confirm_password', '')
    
    if not all([email, code, new_password, confirm_password]):
        return Response({
            'success': False,
            'error': 'All fields are required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate passwords match
    if new_password != confirm_password:
        return Response({
            'success': False,
            'error': 'Passwords do not match.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password length
    if len(new_password) < 6:
        return Response({
            'success': False,
            'error': 'Password must be at least 6 characters long.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Get the most recent unused token for this user
        reset_token = PasswordResetToken.objects.filter(
            user=user,
            is_used=False
        ).order_by('-created_at').first()
        
        if not reset_token:
            return Response({
                'success': False,
                'error': 'No active verification code found. Please start the process again.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if token is expired
        if not reset_token.is_valid():
            return Response({
                'success': False,
                'error': 'Verification code has expired. Please start the process again.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the code one more time
        if reset_token.code != code:
            return Response({
                'success': False,
                'error': 'Invalid verification code.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the password (Django will hash it automatically)
        user.set_password(new_password)
        user.save()
        
        # Mark the token as used
        reset_token.is_used = True
        reset_token.save()
        
        return Response({
            'success': True,
            'message': 'Password has been reset successfully. You can now login with your new password.'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User not found.'
        }, status=status.HTTP_404_NOT_FOUND)
