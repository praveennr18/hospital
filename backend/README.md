# Healthcare Pro – Django REST API

The Healthcare Pro backend is a Django REST Framework project that delivers secure, role-aware APIs for patients, doctors, and administrators. It powers the React frontend (`frontend2/react_app`) and exposes everything required for scheduling, availability, and medical record management.

## ✨ Highlights

- **JWT authentication** with refresh tokens and blacklisting.
- **Role-based access** for patients, doctors, and admins, including scoped “/my/” endpoints.
- **Admin tooling** for managing users, doctors, patients, and appointments with cancellation reasons.
- **Doctor dashboards** that surface KPIs, today’s schedule, patient lists, and availability settings.
- **Patient portal** covering appointments, medical history, medications, allergies, and health summaries.

## 🧰 Tech Stack

- Django 4.2 + Django REST Framework
- PostgreSQL (production) / SQLite (local default)
- Simple JWT for authentication
- django-cors-headers for CORS/CSRF controls

## 🚀 Getting Started

```powershell
git clone <repository-url>
cd backend/healthcare_pro

python -m venv .venv
& .venv\Scripts\Activate.ps1

pip install -r requirements.txt

copy .env.example .env   # populate secrets and database settings

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

python manage.py runserver 8000
```

> ℹ️ The project ships with fixtures and helper scripts under `tests/` to speed up local data seeding.

## 🔌 Core Endpoints (Summary)

### Authentication
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/token/refresh/`
- `POST /api/auth/logout/`

### Admin Operations
- `GET /api/accounts/admin/dashboard/stats/` – Metrics for the admin dashboard cards.
- `GET /api/accounts/admin/doctors/list/` / `patients/list/` – Live rosters for the frontend tables.
- `POST /api/accounts/admin/register/{doctor|patient}/` – Wizard-backed registration flows.
- `DELETE /api/appointments/{id}/` – Hard delete with audit logging.
- `PATCH /api/appointments/{id}/cancel/` – Cancel with a reason captured from the UI.

### Doctor Experience
- `GET /api/doctors/my/dashboard/` – KPIs + “today’s schedule” feed for `DoctorDataContext`.
- `GET /api/doctors/my/appointments/` – Supports filtering by status, type, and period.
- `PATCH /api/doctors/my/appointments/{id}/` – Update status/notes directly from the dashboard.
- `GET /api/doctors/my/patients/` – Enriched patient list used for quick searches.
- `GET|PUT /api/doctors/my/availability/` – Weekly availability slots maintained from the UI.

### Patient Experience
- `GET /api/patients/my/dashboard/` – High-level stats shown on the patient landing page.
- `GET /api/patients/my/appointments/` – Upcoming and past appointments.
- `GET /api/patients/my/medical-history/` – History, medications, and allergies endpoints.

### Shared Appointment Utilities
- `POST /api/appointments/schedule/` – Unified modal booking entry point.
- `GET /api/appointments/available-slots/` – Doctor availability lookup.
- `GET /api/appointments/departments/` & `/doctors-by-department/` – Populate cascading dropdowns.

For the full reference, see the markdown files under `docs/api/`.

## 📁 Project Structure

```
healthcare_pro/
├── accounts/        # Auth, roles, permissions
├── appointments/    # Booking, availability, status updates
├── doctors/         # Doctor metadata and dashboards
├── patients/        # Patient-facing endpoints and records
├── config/          # Settings, URLs, middleware
├── docs/            # API & development documentation
└── tests/           # Pytest suites and fixtures
```

## 🔐 Environment Variables

Create a `.env` file using `.env.example` as a template. Key settings include:

```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3   # or configure PostgreSQL credentials
JWT_SECRET_KEY=your-jwt-secret
FRONTEND_ORIGINS=http://localhost:5173
```

## 🤝 Contributing

1. Fork the repository and create a feature branch.
2. Add or update tests under `tests/` when you change behavior.
3. Run linting (`ruff`, `black`) and the pytest suite.
4. Open a pull request summarizing the change and any rollout steps.

## 📞 Support

Questions or issues? Reach out via the project discussion board or email the maintainers.

---

Updated October 2025 – Doctor & Admin dashboard refresh
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