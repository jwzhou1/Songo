# 🚀 SonGo Enterprise - Complete Deployment Guide

## 📋 **Pre-Deployment Checklist**

### **1. Required Accounts & API Keys**
- [ ] **AWS Account** with appropriate permissions
- [ ] **Stripe Account** (for payment processing)
- [ ] **Google Cloud Account** (for Maps API)
- [ ] **FedEx Developer Account** (for shipping API)
- [ ] **UPS Developer Account** (for shipping API)
- [ ] **DHL Developer Account** (for shipping API)
- [ ] **USPS Developer Account** (for shipping API)
- [ ] **Vercel Account** (for frontend deployment)
- [ ] **GitHub Account** (for code repository)

### **2. Local Development Tools**
- [ ] **Node.js 18+** installed
- [ ] **Docker & Docker Compose** installed
- [ ] **AWS CLI** configured
- [ ] **Terraform** installed
- [ ] **Git** configured
- [ ] **Angular CLI** installed globally

## 🔧 **Step-by-Step Deployment**

### **Phase 1: Local Development Setup (15 minutes)**

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/songo-enterprise-shipping.git
cd songo-enterprise-shipping

# 2. Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env

# 3. Install all dependencies
npm run install:all

# 4. Start local development environment
docker-compose -f docker-compose.enterprise.yml up -d

# 5. Start frontend development server
cd frontend
npm start
```

**Verify Local Setup:**
- Frontend: http://localhost:4200
- API Gateway: http://localhost:3000
- Grafana: http://localhost:3001
- Kibana: http://localhost:5601

### **Phase 2: AWS Infrastructure Setup (30 minutes)**

```bash
# 1. Configure AWS CLI
aws configure
# Enter your AWS credentials and region

# 2. Create S3 bucket for Terraform state
aws s3 mb s3://songo-terraform-state-$(date +%s)

# 3. Deploy infrastructure
cd infrastructure/terraform
terraform init
terraform plan -var="environment=production"
terraform apply -var="environment=production"

# 4. Save infrastructure outputs
terraform output -json > ../../aws-outputs.json
```

### **Phase 3: Configure Secrets (10 minutes)**

```bash
# Store Stripe credentials
aws secretsmanager create-secret \
    --name "songo-enterprise/stripe" \
    --secret-string '{
        "secretKey": "sk_live_your_secret_key",
        "publishableKey": "pk_live_your_publishable_key"
    }'

# Store shipping carrier credentials
aws secretsmanager create-secret \
    --name "songo-enterprise/carrier-apis" \
    --secret-string '{
        "fedex": {
            "apiKey": "your_fedex_api_key",
            "secretKey": "your_fedex_secret_key",
            "accountNumber": "123456789",
            "meterNumber": "123456789"
        },
        "ups": {
            "apiKey": "your_ups_api_key",
            "secretKey": "your_ups_secret_key",
            "accountNumber": "123456"
        },
        "dhl": {
            "apiKey": "your_dhl_api_key",
            "secretKey": "your_dhl_secret_key"
        },
        "usps": {
            "userId": "your_usps_user_id",
            "password": "your_usps_password"
        }
    }'

# Store Google Maps API key
aws secretsmanager create-secret \
    --name "songo-enterprise/google-maps" \
    --secret-string '{
        "apiKey": "your_google_maps_api_key"
    }'
```

### **Phase 4: Deploy Backend Services (20 minutes)**

```bash
# 1. Build and package Lambda functions
cd backend-serverless
npm run build
npm run package

# 2. Deploy Lambda functions
aws lambda create-function \
    --function-name songo-enterprise-quote-service \
    --runtime nodejs18.x \
    --role arn:aws:iam::YOUR_ACCOUNT:role/songo-enterprise-lambda-execution \
    --handler handler.getQuotes \
    --zip-file fileb://dist/packages/quote-service.zip

aws lambda create-function \
    --function-name songo-enterprise-tracking-service \
    --runtime nodejs18.x \
    --role arn:aws:iam::YOUR_ACCOUNT:role/songo-enterprise-lambda-execution \
    --handler handler.trackPackage \
    --zip-file fileb://dist/packages/tracking-service.zip

aws lambda create-function \
    --function-name songo-enterprise-payment-service \
    --runtime nodejs18.x \
    --role arn:aws:iam::YOUR_ACCOUNT:role/songo-enterprise-lambda-execution \
    --handler handler.processPayment \
    --zip-file fileb://dist/packages/payment-service.zip

# 3. Create API Gateway endpoints
aws apigateway create-rest-api --name songo-enterprise-api
# Configure API Gateway routes (detailed in AWS console)
```

### **Phase 5: Deploy Frontend (10 minutes)**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Configure environment variables in Vercel
cd frontend
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# 3. Deploy to production
vercel --prod
```

### **Phase 6: Setup CI/CD Pipeline (15 minutes)**

```bash
# 1. Setup Jenkins (if using Jenkins)
docker run -d -p 8080:8080 -p 50000:50000 \
    -v jenkins_home:/var/jenkins_home \
    --name jenkins jenkins/jenkins:lts

# 2. Configure Jenkins pipeline
# - Install required plugins (AWS, Docker, Node.js)
# - Add AWS credentials
# - Create pipeline job pointing to Jenkinsfile

# 3. Setup GitHub Actions (alternative)
# Copy .github/workflows/deploy.yml to your repository
```

## 🔍 **Verification & Testing**

### **Health Checks**
```bash
# Test API endpoints
curl -f https://api.songo-enterprise.com/health

# Test quote generation
curl -X POST https://api.songo-enterprise.com/api/quotes/quick-quote \
    -H "Content-Type: application/json" \
    -d '{
        "origin": {"city": "New York", "state": "NY", "zip": "10001", "country": "US"},
        "destination": {"city": "Los Angeles", "state": "CA", "zip": "90001", "country": "US"},
        "packages": [{
            "type": "PARCEL",
            "dimensions": {"length": 10, "width": 10, "height": 10, "weight": 5, "unit": "IN", "weightUnit": "LB"},
            "value": 100,
            "contents": "Test package"
        }],
        "serviceLevel": "GROUND",
        "pickupDate": "2024-01-01"
    }'

# Test tracking
curl -f https://api.songo-enterprise.com/api/tracking/1234567890
```

### **Performance Testing**
```bash
# Install k6 for load testing
npm install -g k6

# Run performance tests
k6 run tests/performance/load-test.js
```

## 📊 **Monitoring Setup**

### **CloudWatch Dashboards**
1. Go to AWS CloudWatch Console
2. Create custom dashboard
3. Add widgets for:
   - Lambda function metrics
   - API Gateway metrics
   - DynamoDB metrics
   - Error rates and latencies

### **Alerts Configuration**
```bash
# Create CloudWatch alarms
aws cloudwatch put-metric-alarm \
    --alarm-name "SonGo-High-Error-Rate" \
    --alarm-description "Alert when error rate exceeds 5%" \
    --metric-name ErrorRate \
    --namespace AWS/ApiGateway \
    --statistic Average \
    --period 300 \
    --threshold 5.0 \
    --comparison-operator GreaterThanThreshold
```

## 🔒 **Security Hardening**

### **IAM Policies**
- Review and apply least privilege principles
- Enable MFA for all admin accounts
- Rotate access keys regularly

### **Network Security**
- Configure VPC security groups
- Enable AWS WAF for API Gateway
- Set up CloudTrail for audit logging

### **Data Protection**
- Enable encryption at rest for DynamoDB
- Configure S3 bucket policies
- Set up backup and disaster recovery

## 🚨 **Troubleshooting Guide**

### **Common Issues**

**1. Lambda Function Timeout**
```bash
# Increase timeout
aws lambda update-function-configuration \
    --function-name songo-enterprise-quote-service \
    --timeout 30
```

**2. API Gateway CORS Issues**
- Enable CORS in API Gateway console
- Add proper headers in Lambda responses

**3. DynamoDB Throttling**
- Increase read/write capacity
- Implement exponential backoff

**4. Frontend Build Errors**
- Check environment variables
- Verify API endpoints are accessible
- Review build logs in Vercel

### **Debugging Commands**
```bash
# View Lambda logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/songo

# Check API Gateway logs
aws logs describe-log-groups --log-group-name-prefix API-Gateway-Execution-Logs

# Monitor DynamoDB metrics
aws cloudwatch get-metric-statistics \
    --namespace AWS/DynamoDB \
    --metric-name ConsumedReadCapacityUnits \
    --dimensions Name=TableName,Value=songo-enterprise-quotes \
    --start-time 2024-01-01T00:00:00Z \
    --end-time 2024-01-01T23:59:59Z \
    --period 3600 \
    --statistics Sum
```

## 📞 **Support & Maintenance**

### **Regular Maintenance Tasks**
- [ ] Update dependencies monthly
- [ ] Review and rotate API keys quarterly
- [ ] Monitor costs and optimize resources
- [ ] Update security patches
- [ ] Review and update documentation

### **Backup Procedures**
- DynamoDB: Enable point-in-time recovery
- S3: Enable versioning and cross-region replication
- Code: Regular Git backups and releases

### **Scaling Considerations**
- Monitor Lambda concurrency limits
- Plan for DynamoDB auto-scaling
- Consider CloudFront for global distribution
- Implement caching strategies

---

## 🎯 **Success Metrics**

After successful deployment, you should achieve:
- ✅ **99.9% uptime** for all services
- ✅ **<200ms response time** for API calls
- ✅ **Real-time tracking** with GPS coordinates
- ✅ **Secure payment processing** with PCI compliance
- ✅ **Multi-carrier integration** with live rates
- ✅ **Comprehensive monitoring** and alerting
- ✅ **Automated CI/CD pipeline**
- ✅ **Enterprise-grade security**

**Congratulations! Your SonGo Enterprise Shipping Platform is now live! 🚀**
