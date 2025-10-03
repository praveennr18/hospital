from django.contrib import admin
from .models import User, Doctor, Patient, Appointment

admin.site.register(User)
admin.site.register(Doctor)
admin.site.register(Patient)
admin.site.register(Appointment)
