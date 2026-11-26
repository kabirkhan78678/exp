Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       STARTING VELTRIX ARENA (BACKEND + FRONTEND)       " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

# 1. Start Django Backend in a new window
Write-Host "[1/2] Launching Django Backend on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; Write-Host '--- VELTRIX DJANGO BACKEND ---' -ForegroundColor Yellow; .\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000"

# 2. Start Next.js Frontend in a new window
Write-Host "[2/2] Launching Next.js Frontend on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; Write-Host '--- VELTRIX NEXT.JS FRONTEND ---' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "Both servers started in separate live windows!" -ForegroundColor Green
Write-Host "  Frontend URL : http://localhost:3000" -ForegroundColor White
Write-Host "  Backend API  : http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  Admin Center : http://localhost:3000/admin" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
