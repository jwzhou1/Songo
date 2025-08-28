# SonGo Shipping Platform - Docker Setup

This document provides comprehensive instructions for running the SonGo Shipping Platform using Docker.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2.0+
- At least 4GB RAM available for containers
- Ports 80, 3306, 6379, 8080, 8081, 8025 available

### Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd Songo

# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f
```

### Production Environment
```bash
# Set environment variables
cp .env.example .env
# Edit .env with your production values

# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📋 Services Overview

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| Frontend | 80 | Angular application | http://localhost |
| Backend | 8080 | Spring Boot API | http://localhost:8080/api |
| MySQL | 3306 | Database | localhost:3306 |
| Redis | 6379 | Cache | localhost:6379 |
| phpMyAdmin | 8081 | Database admin | http://localhost:8081 |
| MailHog | 8025 | Email testing | http://localhost:8025 |

## 🛠️ Management Scripts

### Windows (PowerShell)
```powershell
# Start development environment
.\scripts\docker-run.ps1 -Environment dev -Detach

# Build and start
.\scripts\docker-run.ps1 -Environment dev -Build -Detach

# View logs
.\scripts\docker-run.ps1 -Logs

# Stop services
.\scripts\docker-run.ps1 -Stop

# Clean up
.\scripts\docker-run.ps1 -Clean
```

### Linux/Mac (Bash)
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Build images
./scripts/docker-build.sh

# Start development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=jdbc:mysql://mysql:3306/songo_db?useSSL=false&serverTimezone=UTC
DATABASE_USERNAME=songo_user
DATABASE_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# AWS Configuration (for production)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

### Database Initialization
The database is automatically initialized with:
- User tables and relationships
- Default carriers (Canada Post, Purolator, UPS, FedEx, DHL)
- Sample services for each carrier
- Admin user (admin@songo.com / admin123)
- Sample customer (customer@example.com / customer123)

## 🏗️ Development Workflow

### 1. Start Development Environment
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 2. Access Services
- **Frontend**: http://localhost:4200 (development port)
- **Backend**: http://localhost:8080/api
- **Database Admin**: http://localhost:8082
- **Email Testing**: http://localhost:8025

### 3. Development Features
- Hot reload for frontend changes
- Debug port 5005 for backend debugging
- Separate development database
- Enhanced logging
- Development-specific configurations

## 🚀 Production Deployment

### 1. Prepare Environment
```bash
# Copy and configure environment file
cp .env.example .env.prod
# Edit .env.prod with production values
```

### 2. Deploy with SSL (Recommended)
```bash
# Generate SSL certificates (Let's Encrypt recommended)
mkdir ssl
# Copy your SSL certificates to ssl/ directory

# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Production Features
- Multiple replicas for high availability
- Resource limits and reservations
- Health checks and restart policies
- SSL termination
- Production-optimized configurations
- Monitoring with Prometheus/Grafana (optional)

## 📊 Monitoring and Logging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

### Health Checks
```bash
# Check service health
docker-compose ps

# Backend health endpoint
curl http://localhost:8080/actuator/health

# Frontend health endpoint
curl http://localhost/health
```

### Monitoring (Production)
Enable monitoring profile:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile monitoring up -d
```

Access monitoring:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
netstat -an | findstr :8080

# Stop conflicting services
docker-compose down
```

#### Database Connection Issues
```bash
# Check MySQL logs
docker-compose logs mysql

# Connect to database
docker-compose exec mysql mysql -u songo_user -p songo_db
```

#### Memory Issues
```bash
# Check container resource usage
docker stats

# Increase Docker Desktop memory allocation
# Docker Desktop > Settings > Resources > Memory
```

#### Build Issues
```bash
# Clean build
docker-compose down -v
docker system prune -f
docker-compose build --no-cache
```

### Reset Everything
```bash
# Complete reset (WARNING: This will delete all data)
docker-compose down -v --remove-orphans
docker system prune -a -f
docker volume prune -f
```

## 📚 Additional Resources

### Database Management
- **phpMyAdmin**: http://localhost:8081
- **Direct MySQL**: `docker-compose exec mysql mysql -u songo_user -p`

### API Documentation
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/api-docs

### Email Testing
- **MailHog UI**: http://localhost:8025
- **SMTP**: localhost:1025

## 🔐 Security Notes

### Development
- Default passwords are used for convenience
- All services are accessible without authentication
- CORS is permissive for development

### Production
- Change all default passwords
- Use environment variables for secrets
- Enable SSL/TLS
- Restrict CORS origins
- Use proper firewall rules
- Regular security updates

## 📞 Support

For issues and questions:
1. Check the logs: `docker-compose logs -f`
2. Review this documentation
3. Check Docker Desktop status
4. Verify port availability
5. Contact the development team

---

**Happy Shipping with SonGo! 🚢**
