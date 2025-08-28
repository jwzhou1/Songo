# SonGo Shipping Platform - Docker Run Script (PowerShell)
# This script runs the SonGo platform using Docker Compose

param(
    [string]$Environment = "dev",
    [switch]$Build,
    [switch]$Detach,
    [switch]$Logs,
    [switch]$Stop,
    [switch]$Clean,
    [string]$Service = ""
)

# Colors for output
$Green = "`e[32m"
$Yellow = "`e[33m"
$Red = "`e[31m"
$Blue = "`e[34m"
$Reset = "`e[0m"

Write-Host "${Green}🚀 SonGo Docker Management Script${Reset}"
Write-Host "=================================================="

# Check if Docker is running
try {
    docker version | Out-Null
} catch {
    Write-Host "${Red}❌ Docker is not running. Please start Docker Desktop.${Reset}"
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose version | Out-Null
} catch {
    Write-Host "${Red}❌ Docker Compose is not available.${Reset}"
    exit 1
}

# Set compose files based on environment
$ComposeFiles = @("docker-compose.yml")
switch ($Environment.ToLower()) {
    "dev" { 
        $ComposeFiles += "docker-compose.dev.yml"
        Write-Host "${Blue}Environment: Development${Reset}"
    }
    "prod" { 
        $ComposeFiles += "docker-compose.prod.yml"
        Write-Host "${Blue}Environment: Production${Reset}"
    }
    default { 
        Write-Host "${Blue}Environment: Default${Reset}"
    }
}

$ComposeArgs = $ComposeFiles | ForEach-Object { "-f", $_ }

# Handle different operations
if ($Stop) {
    Write-Host "${Yellow}🛑 Stopping SonGo services...${Reset}"
    docker-compose @ComposeArgs down
    Write-Host "${Green}✅ Services stopped${Reset}"
    exit 0
}

if ($Clean) {
    Write-Host "${Yellow}🧹 Cleaning up SonGo resources...${Reset}"
    docker-compose @ComposeArgs down -v --remove-orphans
    docker system prune -f
    Write-Host "${Green}✅ Cleanup completed${Reset}"
    exit 0
}

if ($Logs) {
    Write-Host "${Yellow}📋 Showing logs...${Reset}"
    if ($Service) {
        docker-compose @ComposeArgs logs -f $Service
    } else {
        docker-compose @ComposeArgs logs -f
    }
    exit 0
}

# Build images if requested
if ($Build) {
    Write-Host "${Yellow}🔨 Building images...${Reset}"
    docker-compose @ComposeArgs build
}

# Start services
Write-Host "${Yellow}🚀 Starting SonGo services...${Reset}"

$UpArgs = @()
if ($Detach) {
    $UpArgs += "-d"
}

if ($Service) {
    $UpArgs += $Service
}

docker-compose @ComposeArgs up @UpArgs

if ($Detach) {
    Write-Host ""
    Write-Host "${Green}🎉 SonGo platform is running!${Reset}"
    Write-Host ""
    Write-Host "${Blue}📋 Service URLs:${Reset}"
    Write-Host "  • Frontend: http://localhost"
    Write-Host "  • Backend API: http://localhost:8080/api"
    Write-Host "  • phpMyAdmin: http://localhost:8081"
    Write-Host "  • MailHog: http://localhost:8025"
    Write-Host ""
    Write-Host "${Blue}💡 Useful commands:${Reset}"
    Write-Host "  • View logs: .\scripts\docker-run.ps1 -Logs"
    Write-Host "  • Stop services: .\scripts\docker-run.ps1 -Stop"
    Write-Host "  • Clean up: .\scripts\docker-run.ps1 -Clean"
    Write-Host "  • Service logs: .\scripts\docker-run.ps1 -Logs -Service backend"
}
