@echo off
echo ========================================
echo    Starting SonGo Frontend Server
echo ========================================
echo.

echo Starting Angular development server...
cd frontend
call ng serve --open
cd ..
