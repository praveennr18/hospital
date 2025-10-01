# 🏥 Healthcare Pro - Django API# Healthcare Pro - Django REST API



A comprehensive healthcare management system built with Django REST Framework, featuring appointment scheduling, patient management, and role-based access control.A comprehensive healthcare management system built with Django REST Framework.



## 🚀 Quick Start## Features



### Prerequisites- **User Authentication & Authorization**

- Python 3.8+  - JWT-based authentication

- Django 4.2.9  - Role-based access control (Patients, Doctors, Admins)

- PostgreSQL (optional, SQLite by default)  - Secure user registration and login



### Installation- **Patient Management**

```bash  - Patient registration and profile management

# Clone the repository  - Medical history tracking

cd healthcare_pro  - Appointment booking



# Install dependencies- **Doctor Management**

pip install -r requirements.txt  - Doctor profiles and specializations

  - Schedule management

# Configure environment  - Patient consultation history

cp .env.example .env

# Edit .env with your settings- **Appointment System**

  - Enhanced online appointment booking with department selection

# Run migrations  - Doctor availability checking with time slots

python manage.py migrate  - Appointment scheduling, cancellation, and rescheduling

  - Real-time slot availability

# Start the server  - Confirmation codes and appointment tracking

python manage.py runserver

```## Tech Stack



## 📂 Project Structure- **Backend**: Django 4.2.9, Django REST Framework

- **Database**: PostgreSQL

```- **Authentication**: JWT (Simple JWT)

healthcare_pro/- **API Documentation**: Django REST Framework browsable API

├── 📁 accounts/           # User management and authentication- **CORS**: django-cors-headers

├── 📁 appointments/       # Appointment scheduling system

├── 📁 doctors/           # Doctor-specific functionality## Installation

├── 📁 patients/          # Patient-specific functionality

├── 📁 config/            # Django configuration1. **Clone the repository**

├── 📁 docs/              # 📖 All documentation   ```bash

│   ├── 📁 api/           # API endpoint documentation   git clone <repository-url>

│   ├── 📁 development/   # Development guides   cd healthcare_pro

│   └── 📁 setup/         # Installation & deployment   ```

├── 📁 tests/             # 🧪 Test files

├── 📁 logs/              # 📊 Application logs2. **Create a virtual environment**

├── 📁 venv/              # Virtual environment   ```bash

├── 📄 manage.py          # Django management script   python -m venv venv

├── 📄 requirements.txt   # Python dependencies   source venv/bin/activate  # On Windows: venv\Scripts\activate

├── 📄 .env               # Environment configuration   ```

└── 📄 .env.example       # Environment template

```3. **Install dependencies**

   ```bash

## 🔐 User Roles   pip install -r requirements.txt

   ```

- **👨‍⚕️ Doctor**: Manage patients, view appointments, update medical records

- **👤 Patient**: Book appointments, view medical history, manage profile  4. **Environment Setup**

- **👨‍💼 Admin**: Full system access, user management, system monitoring   ```bash

   cp .env.example .env

## 🛠️ Key Features   # Edit .env file with your configuration

   ```

### ✅ Authentication & Authorization

- JWT-based authentication5. **Database Setup**

- Role-based access control   ```bash

- Secure password management   python manage.py makemigrations

   python manage.py migrate

### ✅ Appointment Management   ```

- Multi-role appointment scheduling

- Real-time availability checking6. **Create Superuser**

- Appointment status tracking   ```bash

   python manage.py createsuperuser

### ✅ Patient Management   ```

- Medical history tracking

- Allergy and medication management7. **Run the server**

- Patient profile management   ```bash

   python manage.py runserver

### ✅ Logging & Monitoring   ```

- Simplified API request logging

- Performance monitoring## API Endpoints

- Error tracking

### Authentication

## 📖 Documentation- `POST /api/auth/register/` - User registration

- `POST /api/auth/login/` - User login

### For Developers- `POST /api/auth/token/refresh/` - Refresh JWT token

- 📖 [Documentation Overview](docs/README.md)

- 🛠️ [API Documentation](docs/api/overview.md)### Patients

- 📊 [Logging System](docs/development/logging.md)- `GET /api/patients/` - List all patients

- `POST /api/patients/` - Create new patient

### For API Users- `GET /api/patients/{id}/` - Get patient details

- 👨‍⚕️ [Doctor API](docs/api/doctor_api.md)- `PUT /api/patients/{id}/` - Update patient

- 👤 [Patient API](docs/api/patient_api.md)- `DELETE /api/patients/{id}/` - Delete patient

- 👨‍💼 [Admin API](docs/api/admin_api.md)

### Doctors

## 🧪 Testing- `GET /api/doctors/` - List all doctors

- `POST /api/doctors/` - Create new doctor

```bash- `GET /api/doctors/{id}/` - Get doctor details

# Run individual tests- `PUT /api/doctors/{id}/` - Update doctor

python tests/test_appointment.py- `DELETE /api/doctors/{id}/` - Delete doctor

python tests/test_permissions.py

python tests/test_simple_logging.py### Appointments

- `GET /api/appointments/` - List appointments

# Test logging system- `POST /api/appointments/schedule/` - Schedule new appointment with enhanced booking

python tests/test_simple_logging.py- `GET /api/appointments/available-slots/` - Get available time slots for doctor/date

```- `GET /api/appointments/departments/` - Get list of departments with doctor counts

- `GET /api/appointments/doctors-by-department/` - Get doctors in specific department

See [Tests Documentation](tests/README.md) for detailed testing information.- `GET /api/appointments/{id}/` - Get appointment details

- `PATCH /api/appointments/{id}/cancel/` - Cancel appointment

## ⚙️ Configuration- `PATCH /api/appointments/{id}/reschedule/` - Reschedule appointment



### Environment Variables### Patient Portal

Key configuration options in `.env`:- `GET /api/patients/my/dashboard/` - Patient dashboard with stats

```env- `GET /api/patients/my/profile/` - Get patient profile

# Django Settings- `PUT /api/patients/my/profile/update/` - Update patient profile

DEBUG=True- `GET /api/patients/my/appointments/` - Get patient's appointments

SECRET_KEY=your-secret-key- `GET /api/patients/my/appointments/{id}/` - Get specific appointment details

ALLOWED_HOSTS=localhost,127.0.0.1- `GET /api/patients/my/medical-history/` - Get medical history

- `GET /api/patients/my/health-summary/` - Get health summary

# Database

DB_NAME=healthcare_pro_db## Project Structure

DB_USER=postgres

DB_PASSWORD=password```

healthcare_pro/

# JWT Authentication├── manage.py

JWT_ACCESS_TOKEN_LIFETIME=60├── requirements.txt

JWT_REFRESH_TOKEN_LIFETIME=1440├── .env

├── .env.example

# Logging├── .gitignore

LOG_LEVEL=INFO├── README.md

LOG_MAX_BYTES=10485760├── config/           # Django project settings

LOG_BACKUP_COUNT=3├── accounts/         # User authentication and management

├── patients/         # Patient management

# Business Logic├── doctors/          # Doctor management

APPOINTMENT_SLOT_DURATION_MINUTES=30└── appointments/     # Appointment management

CANCELLATION_DEADLINE_HOURS=24```

DEFAULT_PAGE_SIZE=10

```## Environment Variables



## 📊 API EndpointsCreate a `.env` file in the project root with the following variables:



### Authentication```env

- `POST /api/accounts/login/` - User loginSECRET_KEY=your-secret-key

- `POST /api/accounts/refresh/` - Refresh JWT tokenDEBUG=True

- `POST /api/accounts/logout/` - User logoutALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=healthcare_pro_db

### AppointmentsDB_USER=your_db_user

- `GET /api/appointments/` - List appointmentsDB_PASSWORD=your_db_password

- `POST /api/appointments/schedule/` - Schedule appointmentDB_HOST=localhost

- `PATCH /api/appointments/{id}/cancel/` - Cancel appointmentDB_PORT=5432

JWT_SECRET_KEY=your-jwt-secret

### User Management```

- `GET /api/accounts/profile/` - Get user profile

- `PUT /api/accounts/profile/` - Update profile## Contributing

- `GET /api/doctors/my/patients/` - Doctor's patients

1. Fork the repository

See [API Documentation](docs/api/overview.md) for complete endpoint details.2. Create a feature branch (`git checkout -b feature/new-feature`)

3. Commit your changes (`git commit -am 'Add new feature'`)

## 🔧 Development4. Push to the branch (`git push origin feature/new-feature`)

5. Create a Pull Request

### Code Style

- Follow PEP 8 standards## License

- Use environment variables for configuration

- Comprehensive logging for debuggingThis project is licensed under the MIT License - see the LICENSE file for details.



### Database## Contact

- Models with proper relationships

- Automatic migrationsFor any questions or support, please contact [your-email@example.com]
- Data validation and constraints

### Security
- JWT authentication
- Role-based permissions
- Input validation and sanitization

## 📝 Logging

The application uses a simplified logging system:
- All logs in `logs/healthcare_app.log`
- Simple, readable format
- Automatic log rotation
- Configurable log levels

Example log entry:
```
2025-10-01 15:44:34 - INFO - GET /api/appointments/ - Status: 200 - User: doctor@hospital.com - Duration: 45ms
```

## 🤝 Contributing

1. Follow the established code structure
2. Add tests for new functionality
3. Update documentation as needed
4. Use environment variables for configuration

## 📄 License

This project is for educational and development purposes.

---

**🚀 Healthcare Pro** - *Streamlined healthcare management with Django*