#!/bin/bash
echo "Setting up and running the Healthcare Backend..."
echo

echo "Activating virtual environment..."
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
fi

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

echo "Creating sample users..."
python manage.py create_sample_users

echo
echo "Starting Django development server..."
echo "Backend will be available at: http://localhost:8000"
echo "Admin Panel: http://localhost:8000/admin/"
echo "API Docs: http://localhost:8000/api/"
echo
echo "Sample Users:"
echo "- Admin: admin@admin.com / admin123"
echo "- Doctor: doctor@test.com / doctor123"
echo "- Patient: patient@test.com / patient123"
echo

python manage.py runserver