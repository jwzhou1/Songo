# SonGo Enterprise Shipping Platform

A comprehensive, enterprise-grade shipping and logistics management platform built with modern web technologies. This project demonstrates advanced full-stack development skills with real-time tracking, payment processing, and multi-carrier integration.

## 🚀 Live Demo

- **Frontend**: http://localhost:4200 (Angular Development Server)
- **Production**: https://songo-five.vercel.app/
- **Demo Account**:
  - Email: `demo@songo-enterprise.com`
  - Password: `demo123`

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Demo Features](#demo-features--test-data)
- [License](#license)

## ✨ Features

### Core Functionality
- **Multi-Carrier Integration** - FedEx, UPS, DHL, USPS, Canada Post, Canpar
- **Real-time Package Tracking** - GPS-enabled tracking with interactive maps
- **Intelligent Quote System** - Compare rates across multiple carriers
- **Secure Payment Processing** - Stripe integration with PCI compliance
- **User Authentication** - JWT-based auth with social login options
- **Enterprise Dashboard** - Comprehensive analytics and reporting

### Advanced Features
- **Smart Carrier Detection** - Automatic carrier identification from tracking numbers
- **Interactive Maps** - Google Maps integration for route visualization
- **Document Generation** - PDF shipping labels and invoices
- **Real-time Notifications** - WebSocket-based status updates
- **Mobile Responsive** - Progressive Web App (PWA) capabilities
- **Internationalization** - Multi-language and currency support

## 🛠 Technology Stack

### Frontend
- **Framework**: Angular 18 (Standalone Components)
- **Language**: TypeScript 5.3
- **UI Library**: Angular Material 18
- **Styling**: SCSS (Sass)
- **Animations**: Angular Animations
- **State Management**: Angular Services + RxJS
- **Form Handling**: Angular Reactive Forms
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router (Lazy Loading)
- **Testing**: Jasmine + Karma

### Backend & APIs
- **Runtime**: Node.js 18+ (Backend Services)
- **API Framework**: RESTful APIs (Mock/Demo Mode)
- **Authentication**: JWT (JSON Web Tokens) - Demo Mode
- **Payment Processing**: Stripe API - Demo Mode
- **File Storage**: Local Storage (Demo)
- **Real-time**: WebSocket (Planned)
- **Data**: Mock Data Services

### Database & Storage
- **Primary Database**: Mock Data (Demo Mode)
- **Caching**: Browser Local Storage
- **File Storage**: Browser Storage
- **Session Storage**: JWT + Local Storage
- **Analytics**: Google Analytics 4 (Optional)

### DevOps & Deployment
- **Hosting**: Vercel (Frontend + API)
- **Serverless**: AWS Lambda
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry
- **Performance**: Lighthouse CI

### External Integrations
- **Payment**: Stripe Payment Intent API
- **Shipping APIs**:
  - FedEx Ship Manager API
  - UPS Developer Kit
  - DHL Express API
  - USPS Web Tools
- **Maps**: Google Maps Platform
- **Email**: SendGrid API
- **SMS**: Twilio API

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   External APIs │
│   (Next.js)     │◄──►│   (Serverless)  │◄──►│   (Carriers)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   File Storage  │    │   Cache Layer   │
│   (PostgreSQL)  │    │   (AWS S3)      │    │   (Redis)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **PostgreSQL** database (or Supabase account)
- **Stripe** account for payment processing
- **Google Cloud** account for Maps API
- **AWS** account for S3 storage (optional)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/songo-enterprise-shipping.git
cd songo-enterprise-shipping
```

### 2. Install Dependencies

```bash
# Install Angular frontend dependencies
cd angular-frontend
npm install

# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli
```

### 3. Configure Environment (Optional)

For demo purposes, the application works without any external APIs. All data is mocked.

If you want to integrate real APIs later, create environment files:

```bash
# Create environment file (optional)
cd angular-frontend
cp src/environments/environment.example.ts src/environments/environment.ts
```

## 🔐 Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/songo_enterprise"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Payment Processing
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Google Services
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Shipping APIs
FEDEX_API_KEY="your-fedex-api-key"
FEDEX_SECRET_KEY="your-fedex-secret-key"
UPS_API_KEY="your-ups-api-key"
DHL_API_KEY="your-dhl-api-key"
USPS_API_KEY="your-usps-api-key"

# AWS (Optional)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="your-s3-bucket-name"
AWS_REGION="us-east-1"

# Email & SMS
SENDGRID_API_KEY="your-sendgrid-api-key"
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV="development"
```

### Optional Variables

```env
# Analytics & Monitoring
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
SENTRY_DSN="your-sentry-dsn"
VERCEL_ANALYTICS_ID="your-vercel-analytics-id"

# Redis Cache
REDIS_URL="redis://localhost:6379"
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

# Social Authentication
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Start the Angular development server
cd angular-frontend
npm start
# or
ng serve
```

The application will be available at:
- **Frontend**: http://localhost:4200
- **API**: Mock data services (no backend required for demo)

### Production Build

```bash
# Build the Angular application
cd angular-frontend
npm run build

# The built files will be in dist/angular-frontend/
# Serve with any static file server
npx http-server dist/angular-frontend
```

### Testing

```bash
# Run Angular unit tests
cd angular-frontend
npm test

# Run tests in watch mode (default)
ng test

# Run tests once with coverage
ng test --watch=false --code-coverage

# Run end-to-end tests
ng e2e
```

### Code Quality

```bash
# Lint Angular code
cd angular-frontend
ng lint

# Fix linting issues
ng lint --fix

# Type checking (built into Angular CLI)
ng build --dry-run

# Format code with Prettier (if configured)
npx prettier --write src/**/*.{ts,html,scss}
```

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
GET  /api/auth/me            # Get current user
```

### Shipping Endpoints

```
POST /api/shipping/quotes     # Get shipping quotes
POST /api/shipping/create     # Create shipment
GET  /api/shipping/tracking/[id] # Track package
```

### Payment Endpoints

```
POST /api/payments/create-intent # Create payment intent
POST /api/payments/confirm       # Confirm payment
GET  /api/payments/history       # Payment history
```

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Load and stress testing

```bash
# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

```bash
# Manual deployment
npm run deploy

# Production deployment
npm run deploy:prod
```

### AWS Lambda Deployment

```bash
# Deploy serverless functions
cd backend-serverless
serverless deploy
```

## 📁 Project Structure

```
songo-enterprise-shipping/
├── angular-frontend/           # Angular frontend application
│   ├── src/
│   │   ├── app/               # Angular app module and routing
│   │   │   ├── components/    # Feature components
│   │   │   │   ├── home/      # Home page component
│   │   │   │   ├── get-quote/ # Quote request component
│   │   │   │   ├── tracking/  # Package tracking component
│   │   │   │   ├── login/     # User login component
│   │   │   │   ├── register/  # User registration component
│   │   │   │   └── dashboard/ # User dashboard component
│   │   │   ├── services/      # Angular services
│   │   │   ├── app.ts         # Root component
│   │   │   ├── app.html       # Root template
│   │   │   ├── app.scss       # Root styles
│   │   │   └── app.routes.ts  # Application routing
│   │   ├── assets/            # Static assets
│   │   ├── environments/      # Environment configurations
│   │   └── styles.scss        # Global styles
│   ├── public/                # Public assets
│   ├── angular.json           # Angular CLI configuration
│   ├── package.json           # Dependencies and scripts
│   └── vercel.json            # Vercel deployment config
├── vercel-app/                 # Legacy Next.js app (deprecated)
├── docs/                       # Documentation
├── vercel.json                 # Root Vercel configuration
├── package.json                # Root package configuration
└── README.md                   # This file
```

## 🎮 Demo Features & Test Data

### Test Accounts
- **Customer**: `demo@songo-enterprise.com` / `demo123`
- **Admin**: `admin@songo-enterprise.com` / `admin123`

### Test Payment Cards
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Tracking Numbers
- **UPS**: `1Z999AA1234567890`
- **FedEx**: `123456789012`
- **Canpar**: `D420352470001072202001`
- **DHL**: `1234567890`

## 🔧 Key Features Walkthrough

### 1. Home Page (`/`)
- **Hero Section**: Professional landing page with call-to-action buttons
- **Features Overview**: Cards showcasing key platform capabilities
- **Carrier Integration**: Display of supported shipping carriers
- **Call-to-Action**: Direct links to quote and tracking features

### 2. Get Shipping Quote (`/get-quote`)
- **Address Forms**: Reactive forms for pickup and delivery addresses
- **Package Details**: Weight, dimensions, and package type selection
- **Rate Comparison**: Mock API simulation showing multiple carrier quotes
- **Interactive Results**: Hover effects and selection capabilities
- **Responsive Design**: Mobile-optimized form layout

### 3. Package Tracking (`/tracking`)
- **Tracking Input**: Search form with validation
- **Sample Numbers**: Click-to-fill demo tracking numbers
- **Tracking Timeline**: Visual progress indicator with icons
- **Status Updates**: Color-coded status information
- **Mock Data**: Realistic tracking events and locations

### 4. User Authentication (`/login`, `/register`)
- **Login Form**: Email and password authentication (demo mode)
- **Registration**: New user account creation (demo mode)
- **Form Validation**: Angular reactive forms with validation
- **Material Design**: Consistent UI with Angular Material

### 5. User Dashboard (`/dashboard`)
- **Account Overview**: User profile and account information
- **Shipment History**: Past and current shipments
- **Quick Actions**: Fast access to common features
- **Responsive Layout**: Mobile-friendly dashboard design

## 🎨 Angular-Specific Features

### **Modern Angular Architecture**
- **Standalone Components**: No NgModules required
- **Lazy Loading**: Route-based code splitting
- **Reactive Forms**: Type-safe form handling
- **Angular Material**: Consistent Material Design UI
- **SCSS Styling**: Advanced styling with Sass
- **TypeScript**: Full type safety throughout

### **Performance Optimizations**
- **OnPush Change Detection**: Optimized rendering
- **Lazy Loading Routes**: Reduced initial bundle size
- **Tree Shaking**: Unused code elimination
- **AOT Compilation**: Ahead-of-time compilation
- **Service Workers**: PWA capabilities (configurable)

## 🚫 Contributing

This project is a demonstration of technical skills and is not open for contributions. It serves as a portfolio piece showcasing enterprise-level development capabilities.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note**: This is a demonstration project showcasing enterprise-level development skills. It is not intended for production use without proper security auditing and compliance verification.

**Built with ❤️ for demonstrating full-stack development expertise**