#!/bin/bash

# SonGo Shipping Platform - AWS RDS MySQL Setup Script
# This script creates an RDS MySQL instance for the SonGo application

set -e

# Configuration
DB_INSTANCE_IDENTIFIER="songo-mysql-db"
DB_NAME="songo_db"
DB_USERNAME="songo_user"
DB_PASSWORD="SonGo2024!SecurePassword"
DB_INSTANCE_CLASS="db.t3.micro"  # Free tier eligible
DB_ALLOCATED_STORAGE="20"
DB_ENGINE="mysql"
DB_ENGINE_VERSION="8.0.35"
VPC_SECURITY_GROUP_ID=""  # Will be created
SUBNET_GROUP_NAME="songo-db-subnet-group"
PARAMETER_GROUP_NAME="songo-mysql-params"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up AWS RDS MySQL Database for SonGo Platform${NC}"
echo "=================================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is logged in to AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  DB Instance: $DB_INSTANCE_IDENTIFIER"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USERNAME"
echo "  Instance Class: $DB_INSTANCE_CLASS"
echo "  Storage: ${DB_ALLOCATED_STORAGE}GB"
echo "  Engine: $DB_ENGINE $DB_ENGINE_VERSION"
echo ""

# Get default VPC
echo -e "${YELLOW}🔍 Getting default VPC information...${NC}"
DEFAULT_VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text)

if [ "$DEFAULT_VPC_ID" = "None" ] || [ -z "$DEFAULT_VPC_ID" ]; then
    echo -e "${RED}❌ No default VPC found. Please create a VPC first.${NC}"
    exit 1
fi

echo "  Default VPC ID: $DEFAULT_VPC_ID"

# Get subnets in different AZs
echo -e "${YELLOW}🔍 Getting subnet information...${NC}"
SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$DEFAULT_VPC_ID" --query 'Subnets[*].[SubnetId,AvailabilityZone]' --output text)

if [ -z "$SUBNETS" ]; then
    echo -e "${RED}❌ No subnets found in the default VPC.${NC}"
    exit 1
fi

# Get at least 2 subnets in different AZs
SUBNET_IDS=($(echo "$SUBNETS" | awk '{print $1}' | head -2))

if [ ${#SUBNET_IDS[@]} -lt 2 ]; then
    echo -e "${RED}❌ Need at least 2 subnets in different availability zones.${NC}"
    exit 1
fi

echo "  Using subnets: ${SUBNET_IDS[*]}"

# Create DB subnet group
echo -e "${YELLOW}🏗️  Creating DB subnet group...${NC}"
aws rds create-db-subnet-group \
    --db-subnet-group-name "$SUBNET_GROUP_NAME" \
    --db-subnet-group-description "SonGo DB Subnet Group" \
    --subnet-ids "${SUBNET_IDS[@]}" \
    --tags Key=Project,Value=SonGo Key=Environment,Value=Production \
    2>/dev/null || echo "  Subnet group may already exist"

# Create security group for RDS
echo -e "${YELLOW}🔒 Creating security group for RDS...${NC}"
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name "songo-rds-sg" \
    --description "Security group for SonGo RDS MySQL database" \
    --vpc-id "$DEFAULT_VPC_ID" \
    --query 'GroupId' \
    --output text 2>/dev/null || aws ec2 describe-security-groups --filters "Name=group-name,Values=songo-rds-sg" --query 'SecurityGroups[0].GroupId' --output text)

echo "  Security Group ID: $SECURITY_GROUP_ID"

# Add inbound rule for MySQL (port 3306)
echo -e "${YELLOW}🔓 Adding MySQL port rule to security group...${NC}"
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 3306 \
    --cidr 0.0.0.0/0 \
    2>/dev/null || echo "  Rule may already exist"

# Create parameter group for MySQL 8.0
echo -e "${YELLOW}⚙️  Creating DB parameter group...${NC}"
aws rds create-db-parameter-group \
    --db-parameter-group-name "$PARAMETER_GROUP_NAME" \
    --db-parameter-group-family "mysql8.0" \
    --description "SonGo MySQL 8.0 parameters" \
    --tags Key=Project,Value=SonGo Key=Environment,Value=Production \
    2>/dev/null || echo "  Parameter group may already exist"

# Set some MySQL parameters
echo -e "${YELLOW}🔧 Configuring MySQL parameters...${NC}"
aws rds modify-db-parameter-group \
    --db-parameter-group-name "$PARAMETER_GROUP_NAME" \
    --parameters "ParameterName=innodb_buffer_pool_size,ParameterValue={DBInstanceClassMemory*3/4},ApplyMethod=pending-reboot" \
    2>/dev/null || true

# Create RDS instance
echo -e "${YELLOW}🗄️  Creating RDS MySQL instance...${NC}"
echo "  This may take 10-15 minutes..."

aws rds create-db-instance \
    --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" \
    --db-instance-class "$DB_INSTANCE_CLASS" \
    --engine "$DB_ENGINE" \
    --engine-version "$DB_ENGINE_VERSION" \
    --master-username "$DB_USERNAME" \
    --master-user-password "$DB_PASSWORD" \
    --allocated-storage "$DB_ALLOCATED_STORAGE" \
    --db-name "$DB_NAME" \
    --vpc-security-group-ids "$SECURITY_GROUP_ID" \
    --db-subnet-group-name "$SUBNET_GROUP_NAME" \
    --db-parameter-group-name "$PARAMETER_GROUP_NAME" \
    --backup-retention-period 7 \
    --storage-encrypted \
    --multi-az false \
    --publicly-accessible true \
    --auto-minor-version-upgrade true \
    --deletion-protection false \
    --tags Key=Project,Value=SonGo Key=Environment,Value=Production Key=Application,Value=ShippingPlatform

echo -e "${GREEN}✅ RDS instance creation initiated!${NC}"
echo ""
echo -e "${YELLOW}⏳ Waiting for RDS instance to be available...${NC}"

# Wait for the instance to be available
aws rds wait db-instance-available --db-instance-identifier "$DB_INSTANCE_IDENTIFIER"

# Get the endpoint
ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" --query 'DBInstances[0].Endpoint.Address' --output text)
PORT=$(aws rds describe-db-instances --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" --query 'DBInstances[0].Endpoint.Port' --output text)

echo -e "${GREEN}🎉 RDS MySQL instance is now available!${NC}"
echo ""
echo -e "${GREEN}📋 Connection Details:${NC}"
echo "  Endpoint: $ENDPOINT"
echo "  Port: $PORT"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USERNAME"
echo "  Password: $DB_PASSWORD"
echo ""
echo -e "${GREEN}🔗 JDBC URL:${NC}"
echo "  jdbc:mysql://$ENDPOINT:$PORT/$DB_NAME?useSSL=true&serverTimezone=UTC"
echo ""
echo -e "${YELLOW}📝 Environment Variables for your application:${NC}"
echo "  export DATABASE_URL=\"jdbc:mysql://$ENDPOINT:$PORT/$DB_NAME?useSSL=true&serverTimezone=UTC\""
echo "  export DATABASE_USERNAME=\"$DB_USERNAME\""
echo "  export DATABASE_PASSWORD=\"$DB_PASSWORD\""
echo ""
echo -e "${GREEN}✅ Setup complete! You can now connect to your RDS MySQL database.${NC}"

# Create .env file for local development
cat > .env << EOF
# SonGo Database Configuration
DATABASE_URL=jdbc:mysql://$ENDPOINT:$PORT/$DB_NAME?useSSL=true&serverTimezone=UTC
DATABASE_USERNAME=$DB_USERNAME
DATABASE_PASSWORD=$DB_PASSWORD

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Other configurations
JWT_SECRET=songoSecretKeyForJWTTokenGenerationAndValidation2024!@#$%^&*()
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
EOF

echo -e "${GREEN}📄 Created .env file with database configuration${NC}"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "  1. The database password is: $DB_PASSWORD"
echo "  2. Make sure to update your application.yml or use environment variables"
echo "  3. The database is publicly accessible - consider restricting access in production"
echo "  4. Backup retention is set to 7 days"
echo "  5. Remember to run the database initialization script after connecting"
