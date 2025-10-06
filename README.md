# Healthcare Pro - Hospital Management System

A complete hospital management system with patient portal, doctor dashboard, and admin panel.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Git

### Run the Application

```bash
# Clone the repository
git clone <your-repo-url>
cd hospital-v5

# Start all services
docker-compose up

# Open browser and go to:
# http://localhost
```

That's it! Everything is configured automatically.

---

## 🎯 Access

- **Main Application**: http://localhost
- **Admin Panel**: http://localhost/admin
  - Username: `admin`
  - Password: `admin123`

---

## 👥 Default Users

The system comes with pre-configured test accounts:

### Admin
- Email: `praveennr6361@gmail.com`
- Password: `praveen`

### Doctor
- Email: `praveennr03@gmail.com`
- Password: `praveen`

### Patient
- Email: `skandaudemy@gmail.com`
- Password: `skanda`

---

## 🛠️ Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build
```

---

## 📁 Project Structure

```
hospital-v5/
├── backend/              # Django REST API
├── frontend/             # React Application
├── docker-compose.yml    # Docker orchestration
└── nginx.conf           # Reverse proxy config
```

---

## ✨ Features

- **Patient Portal**: Book appointments, manage medical records
- **Doctor Dashboard**: View schedule, manage patients
- **Admin Panel**: Manage users, doctors, patients, appointments
- **Zero Configuration**: No setup required, just run!

---

## 📖 Documentation

- **Docker Guide**: See `DOCKER_QUICK_START.md`
- **Backend API**: See `backend/README.md`
- **Frontend**: See `frontend/react_app/README.md`

---

## 🔧 Development

### Without Docker

**Backend:**
```bash
cd backend/healthcare_pro
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend/react_app
npm install
npm run dev
```

---

## 📦 Docker Hub

To push to Docker Hub, see `DOCKER_QUICK_START.md`

---

## 🤝 Team Collaboration

1. Clone the repository
2. Run `docker-compose up`
3. Start coding!

No configuration needed. All environment variables are pre-set for development.

---

## 📝 Notes

- Email functionality uses console backend (no SMTP setup needed)
- Database is PostgreSQL (auto-configured)
- All migrations run automatically on startup
- Admin user is created automatically

---

**Built with**: Django REST Framework, React, PostgreSQL, Docker
