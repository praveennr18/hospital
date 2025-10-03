"# Healthcare Management System

A comprehensive healthcare management system with Django REST API backend and React frontend, supporting role-based access for Admins, Doctors, and Patients.

## Features

### Backend (Django REST API)
- **Authentication**: JWT-based authentication with role-based access control
- **User Management**: Admin, Doctor, and Patient roles
- **CRUD Operations**: Complete management of doctors, patients, and appointments
- **Security**: HIPAA compliance considerations and secure API endpoints
- **Database**: SQLite for development (easily configurable for PostgreSQL/MySQL)

### Frontend (React + Vite)
- **Modern UI**: React 19 with responsive design
- **Role-based Dashboards**: Separate interfaces for Admin, Doctor, and Patient
- **Real-time Updates**: API integration with automatic data refresh
- **Authentication**: JWT token management with automatic refresh
- **Routing**: React Router for seamless navigation

## Quick Setup

### Prerequisites
- Python 3.10+
- Node.js 16+
- npm or yarn

### Option 1: Using Setup Scripts (Recommended)

#### For Windows:
1. **Start Backend:**
   ```bash
   cd backend
   ./start-backend.bat
   ```

2. **Start Frontend (in a new terminal):**
   ```bash
   cd frontend
   ./start-frontend.bat
   ```

#### For Linux/Mac:
1. **Start Backend:**
   ```bash
   cd backend
   chmod +x start-backend.sh
   ./start-backend.sh
   ```

2. **Start Frontend (in a new terminal):**
   ```bash
   cd frontend
   chmod +x start-frontend.sh
   ./start-frontend.sh
   ```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create sample users
python manage.py create_sample_users

# Start server
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend/react_app

# Install dependencies
npm install

# Start development server
npm run dev
```

## Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

## Sample Users

The system comes with pre-created sample users for testing:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@admin.com | admin123 | Full system access |
| Doctor | doctor@test.com | doctor123 | Doctor portal access |
| Patient | patient@test.com | patient123 | Patient portal access |

## API Endpoints

### Authentication
- `POST /api/token/` - Login (get JWT tokens)
- `POST /api/token/refresh/` - Refresh access token
- `POST /api/password-reset/` - Reset password for first login

### Users
- `GET /api/users/` - List all users (Admin only)
- `GET /api/users/me/` - Get current user info
- `POST /api/users/` - Create user (Admin only)
- `PUT /api/users/{id}/` - Update user (Admin only)
- `DELETE /api/users/{id}/` - Delete user (Admin only)

### Doctors
- `GET /api/doctors/` - List all doctors
- `GET /api/doctors/{id}/` - Get doctor details
- `POST /api/doctors/` - Create doctor (Admin only)
- `PUT /api/doctors/{id}/` - Update doctor
- `DELETE /api/doctors/{id}/` - Delete doctor (Admin only)

### Patients
- `GET /api/patients/` - List all patients (Admin/Doctor only)
- `GET /api/patients/{id}/` - Get patient details
- `GET /api/patients/me/` - Get current patient info (Patient only)
- `POST /api/patients/` - Create patient (Admin only)
- `PUT /api/patients/{id}/` - Update patient
- `DELETE /api/patients/{id}/` - Delete patient (Admin only)

### Appointments
- `GET /api/appointments/` - List appointments
- `GET /api/appointments/{id}/` - Get appointment details
- `POST /api/appointments/` - Create appointment
- `PUT /api/appointments/{id}/` - Update appointment
- `DELETE /api/appointments/{id}/` - Delete appointment

## Project Structure

```
hospital/
├── backend/                 # Django REST API
│   ├── api/                 # Main API app
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API views
│   │   ├── serializers.py   # Data serializers
│   │   ├── urls.py          # API routes
│   │   └── management/      # Custom commands
│   ├── healthcare_backend/  # Django project settings
│   ├── requirements.txt     # Python dependencies
│   ├── manage.py           # Django management script
│   └── start-backend.bat   # Setup script
├── frontend/               # React application
│   └── react_app/         
│       ├── src/
│       │   ├── api/        # API client
│       │   ├── pages/      # Page components
│       │   ├── doctor/     # Doctor components
│       │   └── components/ # Shared components
│       ├── package.json    # Node dependencies
│       └── vite.config.ts  # Vite configuration
└── docs/                   # Documentation
```

## Development

### Backend Development
- **Django Admin**: Access at http://localhost:8000/admin/
- **API Testing**: Use tools like Postman or curl
- **Database**: SQLite file at `backend/db.sqlite3`
- **Logs**: Check Django console for API logs

### Frontend Development
- **Hot Reload**: Vite provides instant updates during development
- **API Proxy**: Configured to proxy `/api` requests to backend
- **Environment**: Set `VITE_API_BASE_URL` in `.env` for custom backend URL

### Authentication Flow
1. User logs in with email/password
2. Backend validates credentials and returns JWT tokens
3. Frontend stores tokens and includes in API requests
4. Automatic token refresh on expiration
5. Role-based routing and component access

## Configuration

### Backend Configuration
- **Environment Variables**: Set in `backend/.env`
- **Database**: Configure in `settings.py`
- **Email**: Update SMTP settings for credential emails
- **CORS**: Adjust allowed origins for production

### Frontend Configuration
- **API URL**: Set `VITE_API_BASE_URL` in `frontend/react_app/.env`
- **Proxy**: Configure in `vite.config.ts`
- **Build**: Run `npm run build` for production

## Production Deployment

### Backend
1. Set `DJANGO_DEBUG=False` in environment
2. Configure production database (PostgreSQL/MySQL)
3. Set secure `DJANGO_SECRET_KEY`
4. Configure SMTP for email sending
5. Use gunicorn/uwsgi for serving
6. Set up reverse proxy (nginx)

### Frontend
1. Build production bundle: `npm run build`
2. Serve static files with nginx/Apache
3. Update API URL for production backend
4. Configure SSL certificates

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS settings include frontend URL
2. **Authentication Issues**: Check JWT token validity and refresh logic
3. **Database Issues**: Run migrations and check database connectivity
4. **API Connection**: Verify backend is running and accessible

### Reset Database
```bash
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py create_sample_users
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check this README for common solutions
2. Review Django and React documentation
3. Check API logs for backend issues
4. Use browser developer tools for frontend debugging" 
