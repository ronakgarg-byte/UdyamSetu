@echo off
echo ===================================================
echo   Starting Udyam Setu (Backend + Frontend)
echo ===================================================

start "Udyam Setu - Backend API (Port 5000)" cmd /k "cd backend && npm start"
start "Udyam Setu - Frontend App (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers launched in separate windows!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo ===================================================
