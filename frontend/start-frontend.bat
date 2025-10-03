@echo off
echo Setting up and running the Healthcare Frontend...
echo.

cd react_app

echo Installing dependencies...
npm install

echo.
echo Starting Vite development server...
echo Frontend will be available at: http://localhost:5173
echo.
echo Make sure the backend is running at http://localhost:8000
echo.

npm run dev