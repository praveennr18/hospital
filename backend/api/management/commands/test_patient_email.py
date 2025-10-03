from django.core.management.base import BaseCommand
from api.serializers import PatientSerializer

class Command(BaseCommand):
    help = 'Test patient registration and email sending.'

    def handle(self, *args, **options):
        data = {
            'user': {
                'email': 'testmaildebug@example.com',
                'first_name': 'Debug',
                'last_name': 'Test'
            },
            'dob': '2000-01-01',
            'phone': '1234567890',
            'gender': 'Other',
            'blood': 'O+',
            'address': 'Test Address',
            'city': 'Test City',
            'state': 'Test State',
            'zip': '12345',
            'emergency_name': 'Test Emergency',
            'emergency_relationship': 'Other',
            'emergency_phone': '0987654321',
            'status': 'Active',
        }
        try:
            serializer = PatientSerializer()
            serializer.create(data)
            self.stdout.write(self.style.SUCCESS('Patient registration and email sending succeeded.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'ERROR: {e}'))
