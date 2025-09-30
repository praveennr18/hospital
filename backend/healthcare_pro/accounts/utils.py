import secrets
import string
from django.core.mail import send_mail
from django.conf import settings

def generate_random_password(length=12):
    """Generate a secure random password"""
    characters = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(characters) for _ in range(length))
    return password

def send_credentials_email(email, password, role):
    """Send email with login credentials"""
    subject = 'HealthCare Pro - Your Account Credentials'
    
    message = f"""
    Dear User,
    
    Your account has been created in HealthCare Pro system.
    
    Login Details:
    Email: {email}
    Password: {password}
    Role: {role.capitalize()}
    
    Please login at: http://localhost:3000/login
    
    For security reasons, we recommend changing your password after first login.
    
    Best regards,
    HealthCare Pro Team
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False