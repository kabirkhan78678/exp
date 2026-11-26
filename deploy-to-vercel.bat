@echo off
title Veltrix Arena - Deploy to Vercel
color 0A
echo ========================================================
echo        VELTRIX ARENA - VERCEL 1-CLICK DEPLOYMENT
echo ========================================================
echo.
echo [1/2] Navigating to frontend directory...
cd /d "%~dp0frontend"

echo [2/2] Launching Vercel CLI...
echo (Agar pehli baar chala rahe hain, to browser me Login popup aayega)
echo.
call npx vercel

echo.
echo ========================================================
echo Agar aapko LIVE PRODUCTION URL chahiye, to run karein:
echo   deploy-production.bat
echo ========================================================
pause
