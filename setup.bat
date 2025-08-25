@echo off
echo ========================================
echo    SonGo Shipping Platform Setup
echo ========================================
echo.

echo [1/6] Checking prerequisites...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven from https://maven.apache.org/
    pause
    exit /b 1
)

echo Prerequisites check passed!
echo.

echo [2/6] Starting database services...
docker-compose up -d mysql phpmyadmin mailhog redis
if %errorlevel% neq 0 (
    echo ERROR: Failed to start database services
    pause
    exit /b 1
)

echo Waiting for MySQL to be ready...
timeout /t 30 /nobreak >nul

echo [3/6] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo [4/6] Installing Angular CLI globally (if not already installed)...
call npm list -g @angular/cli >nul 2>nul
if %errorlevel% neq 0 (
    call npm install -g @angular/cli
)

echo [5/6] Building backend...
cd backend
call mvn clean compile
if %errorlevel% neq 0 (
    echo ERROR: Failed to build backend
    cd ..
    pause
    exit /b 1
)
cd ..

echo [6/6] Setup completed successfully!
echo.
echo ========================================
echo    Services Information
echo ========================================
echo Backend API: http://localhost:8080/api
echo Frontend: http://localhost:4200
echo Database Admin: http://localhost:8081
echo Email Testing: http://localhost:8025
echo ========================================
echo.
echo To start the application:
echo 1. Run: start-backend.bat
echo 2. Run: start-frontend.bat
echo.
echo Press any key to continue...
pause >nul
