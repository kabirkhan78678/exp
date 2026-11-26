@echo off
title VELTRIX ARENA Launcher
echo ========================================================
echo       STARTING VELTRIX ARENA (BACKEND + FRONTEND)
echo ========================================================
echo.

echo [1/2] Starting Django Backend on port 8000...
start "VELTRIX Backend (Django API)" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000"

echo [2/2] Starting Next.js Frontend on port 3000...
start "VELTRIX Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Both servers launched successfully!
echo   Frontend : http://localhost:3000
echo   Backend  : http://127.0.0.1:8000
echo   Admin    : http://localhost:3000/admin
echo ========================================================
echo.
pause
