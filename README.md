# SonGo - Shipping Platform

SonGo is a comprehensive shipping platform that helps customers book parcel and pallet transportation services. It provides real-time quotes from multiple carriers, shipment tracking, and customer management.

## Features

- **Multi-Carrier Integration**: Get quotes from Canada Post, Purolator, UPS, FedEx, and more
- **Parcel & LTL Freight**: Support for both small parcels and large freight shipments
- **Real-time Tracking**: Track shipments across all carriers
- **Customer Dashboard**: Manage shipments, view history, and track packages
- **Quote Comparison**: Compare rates and services from different carriers
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

### Backend
- **Java 17** with **Spring Boot 3.x**
- **Spring Security** for authentication
- **Spring Data JPA** for database operations
- **MySQL 8.0** for data storage
- **Maven** for dependency management

### Frontend
- **Angular 17** with TypeScript
- **Angular Material** for UI components
- **Bootstrap 5** for responsive design
- **RxJS** for reactive programming

## Project Structure

```
songo/
├── backend/                 # Spring Boot application
│   ├── src/main/java/
│   │   └── com/songo/
│   │       ├── SongoApplication.java
│   │       ├── config/      # Configuration classes
│   │       ├── controller/  # REST controllers
│   │       ├── service/     # Business logic
│   │       ├── repository/  # Data access layer
│   │       ├── model/       # Entity classes
│   │       └── dto/         # Data transfer objects
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/    # Database migrations
│   └── pom.xml
├── frontend/                # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Angular components
│   │   │   ├── services/    # Angular services
│   │   │   ├── models/      # TypeScript interfaces
│   │   │   └── guards/      # Route guards
│   │   ├── assets/          # Static assets
│   │   └── environments/    # Environment configs
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
└── database/
    └── init.sql            # Database initialization
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- MySQL 8.0
- Maven 3.6+
- Angular CLI

### Installation

1. Clone the repository
2. Set up MySQL database
3. Configure application properties
4. Run backend: `mvn spring-boot:run`
5. Run frontend: `ng serve`

## API Documentation

The API documentation will be available at `http://localhost:8080/swagger-ui.html` when the backend is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
