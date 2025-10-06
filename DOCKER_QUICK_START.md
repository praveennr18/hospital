# Healthcare Pro - Docker Guide

## 🚀 Quick Start (Zero Configuration!)

### For Your Team (Just Run It!)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd hospital-v5

# 2. Start everything
docker-compose up

# 3. Open browser
# Go to: http://localhost
```

**That's it!** Everything runs automatically:
- ✅ Database setup
- ✅ Migrations run
- ✅ Admin user created
- ✅ Frontend + Backend + Database all running

---

## 🎯 Access Points

- **Main Application**: http://localhost
- **Django Admin**: http://localhost/admin
  - Username: `admin`
  - Password: `admin123`

---

## 📦 Push to Docker Hub

### Step 1: Build & Test Locally
```bash
cd hospital-v5
docker-compose up
```

### Step 2: Login to Docker Hub
```bash
docker login
```

### Step 3: Tag Images
Replace `YOUR_USERNAME` with your Docker Hub username:

```bash
docker tag hospital-v5-backend YOUR_USERNAME/healthcare-backend:latest
docker tag hospital-v5-frontend YOUR_USERNAME/healthcare-frontend:latest
docker tag hospital-v5-nginx YOUR_USERNAME/healthcare-nginx:latest
```

### Step 4: Push to Docker Hub
```bash
docker push YOUR_USERNAME/healthcare-backend:latest
docker push YOUR_USERNAME/healthcare-frontend:latest
docker push YOUR_USERNAME/healthcare-nginx:latest
```

---

## 🛠️ Useful Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up --build

# Remove everything (including database)
docker-compose down -v
```

---

## ✨ Features

- **Zero Configuration**: No email setup, no database setup, nothing!
- **Single URL**: Everything accessible from http://localhost
- **Auto Setup**: Database, migrations, admin user - all automatic
- **Team Ready**: Clone and run, that's it!

---

## 📝 What's Excluded

- Testing/ folder (not needed in production)
- figma/ folder (design files)
- Development files (.git, node_modules, etc.)

---

## 🎉 For Your Teammates

Just tell them:
```bash
git clone <repo-url>
cd hospital-v5
docker-compose up
```

Then open: http://localhost

No setup, no configuration, no hassle!
