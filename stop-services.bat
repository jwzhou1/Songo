@echo off
echo ========================================
echo    Stopping SonGo Services
echo ========================================
echo.

echo Stopping Docker services...
docker-compose down

echo Services stopped successfully!
pause
