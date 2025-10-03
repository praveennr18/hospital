from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Doctor, Patient

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample users for testing'

    def handle(self, *args, **options):
        # Create admin user with both username 'admin' and email 'admin@admin.com'
        admin_user = User.objects.filter(username='admin').first()
        if not admin_user:
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@admin.com',
                password='admin123',
                role='admin',
                first_name='Admin',
                last_name='User'
            )
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Admin user created: admin / admin123'))
        else:
            # Ensure email is set for admin user
            if not admin_user.email:
                admin_user.email = 'admin@admin.com'
                admin_user.save()
            self.stdout.write(self.style.SUCCESS('Admin user already exists: admin'))
        
        # Create doctor user
        if not User.objects.filter(username='doctor@test.com').exists():
            doctor_user = User.objects.create_user(
                username='doctor@test.com',
                email='doctor@test.com',
                password='doctor123',
                role='doctor',
                first_name='Dr. John',
                last_name='Smith'
            )
            
            # Create doctor profile
            Doctor.objects.create(
                user=doctor_user,
                specialty='General Medicine',
                department='Medicine',
                phone='(555) 123-4567',
                experience='10 years',
                license='MD12345',
                qualifications='MD, Internal Medicine'
            )
            self.stdout.write(self.style.SUCCESS('Doctor user created: doctor@test.com / doctor123'))
        
        # Create patient user
        if not User.objects.filter(username='patient@test.com').exists():
            patient_user = User.objects.create_user(
                username='patient@test.com',
                email='patient@test.com',
                password='patient123',
                role='patient',
                first_name='Jane',
                last_name='Doe'
            )
            
            # Create patient profile
            from datetime import date
            Patient.objects.create(
                user=patient_user,
                dob=date(1985, 5, 15),
                phone='(555) 987-6543',
                gender='Female',
                blood='A+',
                address='123 Main St',
                city='New York',
                state='NY',
                zip='10001'
            )
            self.stdout.write(self.style.SUCCESS('Patient user created: patient@test.com / patient123'))
        
        self.stdout.write(self.style.SUCCESS('Sample users created successfully!'))