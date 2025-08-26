# SonGo Enterprise Shipping Platform

## 🚀 **Amazon-Ready Cloud-Native Shipping Management System**

A comprehensive, enterprise-grade shipping platform built with AWS cloud technologies, demonstrating scalable architecture, real-time tracking, and automated fulfillment capabilities - designed to showcase skills for Amazon's Fulfillment Technology & Robotics team.

## 🏗️ **Architecture Overview**

### **Cloud-Native AWS Architecture**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Angular SPA   │────│   API Gateway    │────│   Lambda Functions│
│   (Vercel)      │    │   (REST/WS)      │    │   (Serverless)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                       ┌────────▼────────┐    ┌─────────▼─────────┐
                       │   CloudFront    │    │   ECS Fargate     │
                       │   (CDN)         │    │   (Containers)    │
                       └─────────────────┘    └───────────────────┘
                                                        │
┌─────────────────┐    ┌──────────────────┐    ┌─────────▼─────────┐
│   EventBridge   │────│   SNS/SQS        │────│   DynamoDB        │
│   (Events)      │    │   (Messaging)    │    │   (Database)      │
└─────────────────┘    └──────────────────┘    └───────────────────┘
         │                       │                        │
┌────────▼────────┐    ┌─────────▼─────────┐    ┌─────────▼─────────┐
│   S3 Buckets    │    │   CloudWatch      │    │   Secrets Manager │
│   (Storage)     │    │   (Monitoring)    │    │   (API Keys)      │
└─────────────────┘    └───────────────────┘    └───────────────────┘
```

## 🎯 **Key Features**

### **🔐 Enterprise Authentication & Authorization**
- **Multi-factor Authentication** with AWS Cognito
- **Role-based Access Control** (Customer, Admin, Super Admin)
- **JWT token management** with automatic refresh
- **OAuth integration** for social login

### **📦 Real-Time Shipping & Logistics**
- **Multi-carrier Integration**: FedEx, UPS, DHL, USPS, Canada Post
- **Dynamic Rate Shopping** with real-time quotes
- **Pallet & Parcel Support** with dimensional weight calculation
- **Automated Label Generation** and tracking number assignment

### **🗺️ Interactive Tracking & Monitoring**
- **Real-time GPS tracking** with Google Maps integration
- **Package trajectory visualization** with movement history
- **Delivery notifications** via SNS/SMS/Email
- **Predictive delivery analytics** using ML

### **💳 Secure Payment Processing**
- **Stripe Integration** for credit/debit card processing
- **PCI DSS compliant** payment handling
- **Multi-currency support** with real-time exchange rates
- **Automated billing** and invoice generation

### **🏭 Warehouse Management Integration**
- **AWS-based inventory tracking** with DynamoDB
- **Automated fulfillment workflows** using Step Functions
- **Real-time stock monitoring** and alerts
- **Integration with Amazon fulfillment centers**

## 🛠️ **Technology Stack**

### **Frontend (Angular 17+)**
- **Angular Material** for enterprise UI components
- **NgRx** for state management
- **PWA capabilities** for mobile experience
- **Real-time WebSocket** connections
- **Google Maps API** for tracking visualization

### **Backend Services**
- **Node.js/TypeScript** Lambda functions
- **Python** for data processing and ML
- **Java Spring Boot** for core business logic
- **GraphQL** for efficient data fetching

### **AWS Cloud Services**
- **Lambda**: Serverless compute for business logic
- **Fargate/ECS**: Containerized microservices
- **DynamoDB**: NoSQL database for scalability
- **S3**: Document and image storage
- **SNS/SQS**: Event-driven messaging
- **EventBridge**: Event routing and processing
- **API Gateway**: RESTful API management
- **CloudWatch**: Monitoring and logging
- **Secrets Manager**: Secure API key storage

### **DevOps & CI/CD**
- **Docker**: Containerization for all services
- **Jenkins**: Automated CI/CD pipeline
- **Terraform**: Infrastructure as Code
- **GitHub Actions**: Automated testing and deployment

## 📋 **Core Functionalities**

### **1. Smart Quote Generation**
```typescript
// Real-time multi-carrier rate comparison
const quoteRequest = {
  origin: { address, city, state, zip, country },
  destination: { address, city, state, zip, country },
  packages: [{
    type: 'PALLET' | 'PARCEL',
    dimensions: { length, width, height, weight },
    value: monetaryValue,
    contents: description
  }],
  serviceLevel: 'GROUND' | 'EXPRESS' | 'OVERNIGHT'
};

const quotes = await getMultiCarrierQuotes(quoteRequest);
```

### **2. Real-Time Package Tracking**
```typescript
// Live tracking with GPS coordinates
const trackingData = {
  trackingNumber: string,
  carrier: CarrierType,
  currentLocation: { lat, lng, address },
  status: TrackingStatus,
  estimatedDelivery: Date,
  events: TrackingEvent[]
};
```

### **3. Payment Processing**
```typescript
// Secure payment with Stripe
const payment = await processPayment({
  amount: totalCost,
  currency: 'USD',
  paymentMethod: stripePaymentMethod,
  metadata: { shipmentId, customerId }
});
```

## 🚀 **Complete Setup & Deployment Guide**

### **Prerequisites**
- **Node.js 18+** with npm/yarn
- **Docker & Docker Compose** for containerization
- **AWS CLI** configured with appropriate permissions
- **Terraform** for infrastructure as code
- **Jenkins** for CI/CD pipeline
- **Angular CLI 17+** for frontend development
- **Git** for version control

### **🔧 Local Development Setup**

#### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/songo-enterprise-shipping.git
cd songo-enterprise-shipping
```

#### **2. Environment Configuration**
```bash
# Copy environment templates
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend-serverless/.env.example backend-serverless/.env

# Configure your environment variables
nano .env
```

**Required Environment Variables:**
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Carrier API Keys (stored in AWS Secrets Manager)
FEDEX_API_KEY=your_fedex_api_key
UPS_API_KEY=your_ups_api_key
DHL_API_KEY=your_dhl_api_key
USPS_API_KEY=your_usps_api_key

# Database Configuration
POSTGRES_USER=songo_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=songo_enterprise

# Redis Configuration
REDIS_PASSWORD=redis_secure_password

# Monitoring
GRAFANA_PASSWORD=admin_password
```

#### **3. Install Dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend-serverless
npm install

# Return to root
cd ..
```

#### **4. Start Local Development Environment**
```bash
# Start all services with Docker Compose
docker-compose -f docker-compose.enterprise.yml up -d

# Start frontend development server
cd frontend
npm start

# In another terminal, start local AWS services
cd ../
npm run start:localstack
```

**Access Points:**
- **Frontend**: http://localhost:4200
- **API Gateway**: http://localhost:3000
- **LocalStack**: http://localhost:4566
- **Grafana**: http://localhost:3001
- **Kibana**: http://localhost:5601
- **Prometheus**: http://localhost:9090

### **☁️ AWS Infrastructure Deployment**

#### **1. Configure AWS Credentials**
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region, and Output format
```

#### **2. Deploy Infrastructure with Terraform**
```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan -var="environment=production"

# Apply the infrastructure
terraform apply -var="environment=production"

# Save outputs for later use
terraform output -json > ../../aws-outputs.json
```

#### **3. Configure Secrets in AWS Secrets Manager**
```bash
# Store Stripe keys
aws secretsmanager create-secret \
    --name "songo-enterprise/stripe" \
    --description "Stripe payment processing keys" \
    --secret-string '{"secretKey":"sk_live_your_secret_key","publishableKey":"pk_live_your_publishable_key"}'

# Store carrier API keys
aws secretsmanager create-secret \
    --name "songo-enterprise/carrier-apis" \
    --description "Shipping carrier API keys" \
    --secret-string '{"fedex":{"apiKey":"your_key","secretKey":"your_secret"},"ups":{"apiKey":"your_key","secretKey":"your_secret"},"dhl":{"apiKey":"your_key"},"usps":{"userId":"your_user_id"}}'

# Store Google Maps API key
aws secretsmanager create-secret \
    --name "songo-enterprise/google-maps" \
    --description "Google Maps API key" \
    --secret-string '{"apiKey":"your_google_maps_api_key"}'
```

### **🚀 Production Deployment**

#### **Option 1: Jenkins CI/CD Pipeline (Recommended)**
```bash
# Push to main branch triggers automated deployment
git add .
git commit -m "Deploy to production"
git push origin main

# Monitor deployment in Jenkins
# URL: http://your-jenkins-server:8080/job/songo-enterprise-pipeline/
```

#### **Option 2: Manual Deployment**

**Deploy Lambda Functions:**
```bash
cd backend-serverless

# Build and package functions
npm run build
npm run package

# Deploy quote service
aws lambda update-function-code \
    --function-name songo-enterprise-quote-service \
    --zip-file fileb://dist/packages/quote-service.zip

# Deploy tracking service
aws lambda update-function-code \
    --function-name songo-enterprise-tracking-service \
    --zip-file fileb://dist/packages/tracking-service.zip

# Deploy payment service
aws lambda update-function-code \
    --function-name songo-enterprise-payment-service \
    --zip-file fileb://dist/packages/payment-service.zip
```

**Deploy Frontend to Vercel:**
```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Configure environment variables in Vercel dashboard
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

### **🐳 Docker Deployment (Alternative)**
```bash
# Build and deploy with Docker Compose
docker-compose -f docker-compose.enterprise.yml up -d --build

# Scale services as needed
docker-compose -f docker-compose.enterprise.yml up -d --scale api-gateway=3 --scale job-processor=2

# Monitor services
docker-compose -f docker-compose.enterprise.yml logs -f
```

## 📊 **Monitoring & Analytics**

### **CloudWatch Dashboards**
- **System Performance**: Lambda execution times, error rates
- **Business Metrics**: Quote conversion rates, shipping volumes
- **User Analytics**: Active users, feature usage patterns

### **Real-Time Alerts**
- **System Health**: Automated alerts for service failures
- **Business KPIs**: Notifications for unusual shipping patterns
- **Security**: Alerts for suspicious activities

## 🔒 **Security & Compliance**

### **Data Protection**
- **Encryption at rest** (DynamoDB, S3)
- **Encryption in transit** (TLS 1.3)
- **PCI DSS compliance** for payment processing
- **GDPR compliance** for user data

### **Access Control**
- **IAM roles** with least privilege principle
- **API rate limiting** and throttling
- **Input validation** and sanitization
- **Audit logging** for all operations

## 🎯 **Amazon Interview Highlights**

This project demonstrates:

1. **Scalable Architecture**: Serverless and containerized microservices
2. **AWS Expertise**: Comprehensive use of AWS services
3. **Real-World Problem Solving**: Complex logistics and fulfillment challenges
4. **DevOps Best Practices**: CI/CD, monitoring, and automation
5. **Enterprise Security**: Compliance and data protection
6. **Performance Optimization**: Caching, CDN, and efficient data structures
7. **Event-Driven Design**: Asynchronous processing and messaging
8. **Monitoring & Observability**: Comprehensive logging and metrics

## 🚚 **How to Run the Complete Application**

### **Quick Start (5 minutes)**
```bash
# 1. Clone and setup
git clone https://github.com/yourusername/songo-enterprise-shipping.git
cd songo-enterprise-shipping
cp .env.example .env

# 2. Start with Docker
docker-compose -f docker-compose.enterprise.yml up -d

# 3. Access the application
open http://localhost:4200
```

### **Full Development Setup (15 minutes)**
```bash
# 1. Install dependencies
npm run install:all

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start services
docker-compose -f docker-compose.enterprise.yml up -d
cd frontend && npm start

# 4. Initialize data
npm run seed:data
```

### **Production Deployment (30 minutes)**
```bash
# 1. Deploy infrastructure
cd infrastructure/terraform
terraform init && terraform apply

# 2. Configure secrets
npm run setup:secrets

# 3. Deploy services
git push origin main  # Triggers Jenkins pipeline

# 4. Verify deployment
npm run health:check
```

## 📞 **Contact & Demo**

**Live Demo**: https://songo-enterprise.vercel.app
**API Documentation**: https://api.songo-enterprise.com/docs
**Monitoring Dashboard**: https://monitoring.songo-enterprise.com

**Your Name** - your.email@example.com
**LinkedIn**: [Your LinkedIn Profile]
**Portfolio**: [Your Portfolio Website]

---

*Built with ❤️ for Amazon's Fulfillment Technology & Robotics team*

## 🏆 **Project Achievements**

- ✅ **Real Carrier Integration** (FedEx, UPS, DHL, USPS)
- ✅ **Live GPS Tracking** with Google Maps
- ✅ **Secure Payment Processing** with Stripe
- ✅ **AWS Cloud Architecture** (Lambda, DynamoDB, S3, SNS, SQS)
- ✅ **Docker & Jenkins CI/CD**
- ✅ **Enterprise Security & Compliance**
- ✅ **Scalable Microservices Architecture**
- ✅ **Real-time Monitoring & Analytics**
- ✅ **Mobile-Responsive PWA**
- ✅ **Production-Ready Deployment**
