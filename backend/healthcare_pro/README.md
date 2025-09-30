# Healthcare Pro - Django REST API

A comprehensive healthcare management system built with Django REST Framework.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Patients, Doctors, Admins)
  - Secure user registration and login

- **Patient Management**
  - Patient registration and profile management
  - Medical history tracking
  - Appointment booking

- **Doctor Management**
  - Doctor profiles and specializations
  - Schedule management
  - Patient consultation history

- **Appointment System**
  - Enhanced online appointment booking with department selection
  - Doctor availability checking with time slots
  - Appointment scheduling, cancellation, and rescheduling
  - Real-time slot availability
  - Confirmation codes and appointment tracking

## Tech Stack

- **Backend**: Django 4.2.9, Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (Simple JWT)
- **API Documentation**: Django REST Framework browsable API
- **CORS**: django-cors-headers

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd healthcare_pro
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

5. **Database Setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create Superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the server**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Patients
- `GET /api/patients/` - List all patients
- `POST /api/patients/` - Create new patient
- `GET /api/patients/{id}/` - Get patient details
- `PUT /api/patients/{id}/` - Update patient
- `DELETE /api/patients/{id}/` - Delete patient

### Doctors
- `GET /api/doctors/` - List all doctors
- `POST /api/doctors/` - Create new doctor
- `GET /api/doctors/{id}/` - Get doctor details
- `PUT /api/doctors/{id}/` - Update doctor
- `DELETE /api/doctors/{id}/` - Delete doctor

### Appointments
- `GET /api/appointments/` - List appointments
- `POST /api/appointments/schedule/` - Schedule new appointment with enhanced booking
- `GET /api/appointments/available-slots/` - Get available time slots for doctor/date
- `GET /api/appointments/departments/` - Get list of departments with doctor counts
- `GET /api/appointments/doctors-by-department/` - Get doctors in specific department
- `GET /api/appointments/{id}/` - Get appointment details
- `PATCH /api/appointments/{id}/cancel/` - Cancel appointment
- `PATCH /api/appointments/{id}/reschedule/` - Reschedule appointment

### Patient Portal
- `GET /api/patients/my/dashboard/` - Patient dashboard with stats
- `GET /api/patients/my/profile/` - Get patient profile
- `PUT /api/patients/my/profile/update/` - Update patient profile
- `GET /api/patients/my/appointments/` - Get patient's appointments
- `GET /api/patients/my/appointments/{id}/` - Get specific appointment details
- `GET /api/patients/my/medical-history/` - Get medical history
- `GET /api/patients/my/health-summary/` - Get health summary

## Project Structure

```
healthcare_pro/
├── manage.py
├── requirements.txt
├── .env
├── .env.example
├── .gitignore
├── README.md
├── config/           # Django project settings
├── accounts/         # User authentication and management
├── patients/         # Patient management
├── doctors/          # Doctor management
└── appointments/     # Appointment management
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=healthcare_pro_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET_KEY=your-jwt-secret
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or support, please contact [your-email@example.com]