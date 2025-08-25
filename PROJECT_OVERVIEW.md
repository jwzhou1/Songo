# SonGo Shipping Platform - Project Overview

## 🚚 What is SonGo?

SonGo is a comprehensive shipping platform similar to FreightCom and UUCargo that helps customers book parcel and pallet transportation services. It provides real-time quotes from multiple carriers, shipment tracking, and customer management.

## 🏗️ Architecture

### Technology Stack
- **Backend**: Java 17 + Spring Boot 3.x + MySQL 8.0
- **Frontend**: Angular 17 + TypeScript + Bootstrap 5 + Angular Material
- **Database**: MySQL 8.0 with JPA/Hibernate
- **Security**: JWT Authentication + Spring Security
- **API Documentation**: OpenAPI 3 (Swagger)
- **Development**: Docker Compose for local services

### Project Structure
```
songo/
├── backend/                 # Spring Boot REST API
├── frontend/                # Angular SPA
├── database/                # Database scripts
├── docker-compose.yml       # Development services
└── *.bat                   # Windows setup scripts
```

## 🎯 Core Features

### Customer Features
- ✅ User registration and authentication
- ✅ Address management (billing, shipping, pickup)
- ✅ Multi-carrier rate comparison
- ✅ Shipment booking and tracking
- ✅ Package management
- ✅ Customer dashboard

### Admin Features
- ✅ User management
- ✅ Carrier configuration
- ✅ Service management
- ✅ Shipment monitoring
- ✅ System analytics

### Carrier Integration
- 🔄 Canada Post API
- 🔄 Purolator API
- 🔄 UPS API
- 🔄 FedEx API
- 🔄 Real-time tracking

## 📊 Database Schema

### Core Entities
1. **Users** - Customer and admin accounts
2. **Customer Profiles** - Extended customer information
3. **Addresses** - Shipping, billing, and pickup addresses
4. **Carriers** - Shipping companies (Canada Post, UPS, etc.)
5. **Services** - Carrier services (Express, Ground, etc.)
6. **Shipments** - Customer shipments
7. **Packages** - Individual packages within shipments

### Key Relationships
- User → Customer Profile (1:1)
- User → Addresses (1:Many)
- User → Shipments (1:Many)
- Carrier → Services (1:Many)
- Shipment → Packages (1:Many)

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.6+
- Docker Desktop
- Angular CLI

### Quick Start
1. **Test Prerequisites**: `test-setup.bat`
2. **Setup Project**: `setup.bat`
3. **Start Backend**: `start-backend.bat`
4. **Start Frontend**: `start-frontend.bat`

### Development URLs
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080/api
- **API Docs**: http://localhost:8080/api/swagger-ui.html
- **Database Admin**: http://localhost:8081
- **Email Testing**: http://localhost:8025

## 🔧 Development Status

### ✅ Completed
- [x] Project structure and configuration
- [x] Database schema design
- [x] Entity models and relationships
- [x] Repository interfaces
- [x] Docker development environment
- [x] Setup and startup scripts

### 🔄 In Progress
- [ ] REST API controllers
- [ ] Service layer implementation
- [ ] JWT authentication
- [ ] Angular components
- [ ] Carrier API integration

### 📋 Next Steps
1. **Backend APIs** - User management, shipment booking
2. **Frontend Components** - Login, dashboard, booking forms
3. **Carrier Integration** - Real-time quotes and tracking
4. **Authentication** - JWT tokens and security
5. **Testing** - Unit and integration tests

## 🎨 UI/UX Design

### Design Principles
- **Responsive**: Mobile-first design
- **Intuitive**: Easy-to-use interface
- **Professional**: Clean, modern look
- **Accessible**: WCAG 2.1 compliant

### Key Pages
1. **Landing Page** - Marketing and features
2. **Login/Register** - User authentication
3. **Dashboard** - Shipment overview
4. **Quote** - Rate comparison
5. **Book Shipment** - Booking form
6. **Track** - Shipment tracking
7. **Profile** - Account management

## 🔐 Security Features

### Authentication
- JWT-based authentication
- Password hashing (BCrypt)
- Email verification
- Role-based access control

### API Security
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention

## 📈 Scalability Considerations

### Performance
- Database indexing
- Query optimization
- Caching (Redis)
- Connection pooling

### Monitoring
- Application metrics
- Health checks
- Error logging
- Performance monitoring

## 🧪 Testing Strategy

### Backend Testing
- Unit tests (JUnit 5)
- Integration tests
- API testing
- Database testing

### Frontend Testing
- Component tests (Jasmine/Karma)
- E2E tests (Cypress)
- Accessibility testing
- Cross-browser testing

## 📦 Deployment

### Development
- Docker Compose
- Local MySQL
- Hot reloading

### Production (Future)
- Docker containers
- Cloud database
- Load balancing
- CI/CD pipeline

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Implement changes
3. Write tests
4. Submit pull request
5. Code review
6. Merge to main

### Code Standards
- Java: Google Java Style
- TypeScript: Angular Style Guide
- Database: Naming conventions
- API: RESTful principles

## 📞 Support

For development questions or issues:
1. Check the documentation
2. Review existing issues
3. Create new issue with details
4. Contact the development team

---

**SonGo Team** - Making shipping simple and efficient! 🚚✨
