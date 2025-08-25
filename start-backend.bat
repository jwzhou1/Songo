@echo off
echo ========================================
echo    Starting SonGo Backend Server
echo ========================================
echo.

echo Checking if database is running...
docker ps | findstr songo-mysql >nul
if %errorlevel% neq 0 (
    echo Starting database services...
    docker-compose up -d mysql phpmyadmin mailhog redis
    echo Waiting for database to be ready...
    timeout /t 20 /nobreak >nul
)

echo Starting Spring Boot application...
cd backend
call mvn spring-boot:run
cd ..
