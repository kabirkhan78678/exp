@echo off
title Veltrix Arena - Deploy to Vercel (Production)
color 0B
echo ========================================================
echo   VELTRIX ARENA - VERCEL PRODUCTION DEPLOYMENT (--prod)
echo ========================================================
echo.
cd /d "%~dp0frontend"

echo Deploying directly to Production domain...
call npx vercel --prod

echo.
echo ========================================================
echo  Deploy complete! Aapki website live ho chuki hai!
echo ========================================================
pause
