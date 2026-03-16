@echo off
echo Starting Leadsyncflow Application...

:: Start Backend
start "Backend Server" cmd /k "cd leadsyncflow && npm run dev"

:: Start Frontend
start "Frontend Client" cmd /k "npm run dev"

echo Both servers are starting in separate windows.
