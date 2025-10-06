from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from doctors.models import Doctor, Availability
from appointments.models import AppointmentSlot


class AvailableSlotsAPITestCase(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="AdminPass123",
            first_name="Admin",
            last_name="User",
            role="admin",
            is_staff=True,
        )
        self.doctor_user = User.objects.create_user(
            email="doc@example.com",
            password="DocPass123",
            first_name="Doc",
            last_name="Tor",
            role="doctor",
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="cardiology",
            department="Cardiology",
            license_number="LIC123456",
            years_of_experience=10,
            qualification="MBBS",
        )
        self.doctor.working_days = []
        self.doctor.start_time = None
        self.doctor.end_time = None
        self.doctor.save(update_fields=["working_days", "start_time", "end_time"])
        self.client.force_authenticate(user=self.admin_user)
        self.url = reverse("get-available-slots")
        self.target_date = date.today() + timedelta(days=1)

    def test_returns_empty_list_when_no_configured_slots(self):
        response = self.client.get(
            self.url,
            {"doctor_id": str(self.doctor.id), "date": self.target_date.isoformat()},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("available_slots", response.data)
        self.assertEqual(response.data["available_slots"], [])
        self.assertEqual(response.data.get("day_of_week"), self.target_date.strftime('%A').lower())

    def test_returns_configured_slots_with_availability_metadata(self):
        AppointmentSlot.objects.create(
            doctor=self.doctor,
            date=self.target_date,
            start_time=time(9, 0),
            end_time=time(10, 0),
            is_available=True,
            max_appointments=2,
        )

        response = self.client.get(
            self.url,
            {"doctor_id": str(self.doctor.id), "date": self.target_date.isoformat()},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slots = response.data.get("available_slots", [])
        self.assertEqual(len(slots), 1)
        slot = slots[0]
        self.assertEqual(slot["time"], "09:00")
        self.assertEqual(slot["status"], "available")
        self.assertTrue(slot["is_available"])
        self.assertIn("remaining_capacity", slot)
        self.assertEqual(slot["remaining_capacity"], 2)

    def test_generates_slots_from_availability_when_no_configured_slots(self):
        Availability.objects.create(
            doctor=self.doctor,
            day_of_week=self.target_date.strftime('%A').lower(),
            start_time=time(10, 0),
            end_time=time(12, 0),
            is_available=True,
        )

        response = self.client.get(
            self.url,
            {"doctor_id": str(self.doctor.id), "date": self.target_date.isoformat()},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slots = response.data.get("available_slots", [])
        self.assertGreaterEqual(len(slots), 1)
        first_slot = slots[0]
        self.assertEqual(first_slot["time"], "10:00")
        self.assertEqual(first_slot["status"], "available")
        self.assertTrue(first_slot["is_available"])

    def test_generates_slots_from_working_days_configuration(self):
        target_day = self.target_date.strftime('%A').lower()
        self.doctor.working_days = [target_day]
        self.doctor.start_time = time(8, 0)
        self.doctor.end_time = time(10, 0)
        self.doctor.save(update_fields=["working_days", "start_time", "end_time"])

        response = self.client.get(
            self.url,
            {"doctor_id": str(self.doctor.id), "date": self.target_date.isoformat()},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slots = response.data.get("available_slots", [])
        self.assertGreaterEqual(len(slots), 2)
        times = {slot["time"] for slot in slots}
        self.assertIn("08:00", times)
        self.assertIn("09:00", times)
