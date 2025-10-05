import secrets
import string

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from decouple import config

def generate_random_password(length=12):
    """Generate a secure random password"""
    characters = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(characters) for _ in range(length))
    return password

def send_credentials_email(email, password, role, first_name=None):
    """Send a professional email with login credentials."""
    recipient_name = (first_name or '').strip() or 'there'
    role_label = (role or 'user').capitalize()
    login_base_url = config('FRONTEND_URL', default='http://localhost:5173').rstrip('/')
    login_url = f"{login_base_url}/login"

    subject = f"HealthCare Pro – Your {role_label} Account Is Ready"

    text_message = (
        f"Dear {recipient_name},\n\n"
        "Welcome to HealthCare Pro! Your account has been created successfully.\n\n"
        "You can sign in with the credentials below:\n"
        f"• Portal: {login_url}\n"
        f"• Username: {email}\n"
        f"• Temporary password: {password}\n\n"
        "For security, please change this temporary password after your first login.\n\n"
        "If you have any questions, our support team is here to help.\n\n"
        "Best regards,\n"
        "HealthCare Pro Support Team"
    )

    html_message = f"""
        <p>Dear {recipient_name},</p>
        <p>Welcome to <strong>HealthCare Pro</strong>! Your {role_label.lower()} account has been created successfully.</p>
        <p>Here are your login credentials:</p>
        <ul>
            <li><strong>Portal:</strong> <a href="{login_url}" target="_blank" rel="noopener">{login_url}</a></li>
            <li><strong>Username:</strong> {email}</li>
            <li><strong>Temporary password:</strong> {password}</li>
        </ul>
        <p>Please sign in and update your password from the profile settings at your earliest convenience.</p>
        <p>If you have any questions or need assistance, our support team is happy to help.</p>
        <p>Warm regards,<br />
        <strong>HealthCare Pro Support Team</strong></p>
    """

    try:
        message = EmailMultiAlternatives(
            subject,
            text_message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )
        message.attach_alternative(html_message, "text/html")
        message.send(fail_silently=False)
        return True
    except Exception as exc:
        print(f"Error sending email: {exc}")
        return False