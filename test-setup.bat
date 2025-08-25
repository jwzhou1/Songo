@echo off
echo ========================================
echo    SonGo Setup Verification Test
echo ========================================
echo.

echo [1/5] Checking Docker...
docker --version >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    goto :end
) else (
    echo ✅ Docker is available
)

echo [2/5] Checking Node.js...
node --version >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    goto :end
) else (
    echo ✅ Node.js is available
)

echo [3/5] Checking Maven...
mvn --version >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Maven is not installed
    echo Please install Maven from https://maven.apache.org/
    goto :end
) else (
    echo ✅ Maven is available
)

echo [4/5] Checking Java...
java --version >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Java is not installed
    echo Please install Java 17 or higher
    goto :end
) else (
    echo ✅ Java is available
)

echo [5/5] Testing Docker Compose...
docker-compose --version >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not available
    goto :end
) else (
    echo ✅ Docker Compose is available
)

echo.
echo ========================================
echo    ✅ All Prerequisites Met!
echo ========================================
echo.
echo Your system is ready for SonGo development.
echo.
echo Next steps:
echo 1. Run: setup.bat (to install dependencies and start services)
echo 2. Run: start-backend.bat (to start the Spring Boot API)
echo 3. Run: start-frontend.bat (to start the Angular app)
echo.
echo Services will be available at:
echo - Frontend: http://localhost:4200
echo - Backend API: http://localhost:8080/api
echo - Database Admin: http://localhost:8081
echo - Email Testing: http://localhost:8025
echo.

:end
echo Press any key to continue...
pause >nul
