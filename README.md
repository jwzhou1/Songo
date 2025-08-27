# SonGo Enterprise Shipping Platform

A comprehensive, enterprise-grade shipping and logistics management platform built with modern web technologies. This project demonstrates advanced full-stack development skills with real-time tracking, payment processing, and multi-carrier integration.

## 🚀 Live Demo

- **Frontend**: http://localhost:3001
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
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **UI Library**: Material-UI (MUI) 5.15
- **Styling**: Emotion CSS-in-JS
- **Animations**: Framer Motion 10.16
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form + Yup validation
- **Maps**: Google Maps JavaScript API
- **Charts**: Recharts 2.8
- **Testing**: Jest + React Testing Library

### Backend & APIs
- **Runtime**: Node.js 18+
- **API Framework**: Next.js API Routes
- **Serverless Functions**: AWS Lambda (via Vercel)
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Processing**: Stripe API
- **File Storage**: AWS S3 (for documents)
- **Real-time**: Socket.IO

### Database & Storage
- **Primary Database**: PostgreSQL (Supabase)
- **Caching**: Redis (Upstash)
- **File Storage**: AWS S3
- **Session Storage**: JWT + Local Storage
- **Analytics**: Google Analytics 4

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
# Install frontend dependencies
cd vercel-app
npm install

# Install backend dependencies (if using separate backend)
cd ../backend-serverless
npm install
```

### 3. Database Setup

#### Option A: Using Supabase (Recommended)
1. Create a [Supabase](https://supabase.com) account
2. Create a new project
3. Copy the database URL and anon key

#### Option B: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `songo_enterprise`
3. Run the SQL schema from `database/schema.sql`

### 4. Configure Environment Variables

Create `.env.local` in the `vercel-app` directory:

```bash
cp .env.example .env.local
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
# Start the development server
cd vercel-app
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000 (or 3001 if 3000 is in use)
- **API**: http://localhost:3000/api

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Format code
npm run format
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
├── vercel-app/                 # Frontend application
│   ├── src/
│   │   ├── app/               # Next.js app router pages
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API service layers
│   │   └── theme/             # MUI theme configuration
│   ├── public/                # Static assets
│   └── package.json
├── backend-serverless/         # Serverless backend functions
│   └── src/functions/         # Lambda functions
├── database/                   # Database schemas and migrations
├── docs/                      # Documentation
└── README.md
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

### 1. User Registration & Login
1. Visit `/register` to create a new account
2. Use `/login` with demo credentials
3. Access `/dashboard` for user management

### 2. Get Shipping Quote
1. Navigate to `/get-quote`
2. Enter pickup and delivery addresses
3. Select package dimensions and weight
4. Compare rates from multiple carriers

### 3. Create Shipment & Payment
1. Select preferred shipping option
2. Proceed to `/checkout`
3. Enter payment information (use test cards)
4. Complete payment and get confirmation

### 4. Track Package
1. Visit `/tracking`
2. Enter any test tracking number
3. View real-time tracking with interactive map
4. See delivery status and history

### 5. User Dashboard
1. Login and visit `/dashboard`
2. View shipment history
3. Check invoice history
4. Manage profile settings

## 🚫 Contributing

This project is a demonstration of technical skills and is not open for contributions. It serves as a portfolio piece showcasing enterprise-level development capabilities.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note**: This is a demonstration project showcasing enterprise-level development skills. It is not intended for production use without proper security auditing and compliance verification.

**Built with ❤️ for demonstrating full-stack development expertise**