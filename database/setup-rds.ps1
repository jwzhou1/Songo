# SonGo Shipping Platform - AWS RDS MySQL Setup Script (PowerShell)
# This script creates an RDS MySQL instance for the SonGo application

param(
    [string]$DBInstanceIdentifier = "songo-mysql-db",
    [string]$DBName = "songo_db",
    [string]$DBUsername = "songo_user",
    [string]$DBPassword = "SonGo2024!SecurePassword",
    [string]$DBInstanceClass = "db.t3.micro",
    [int]$DBAllocatedStorage = 20,
    [string]$DBEngine = "mysql",
    [string]$DBEngineVersion = "8.0.35"
)

Write-Host "🚀 Setting up AWS RDS MySQL Database for SonGo Platform" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if AWS CLI is installed
try {
    aws --version | Out-Null
} catch {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if user is logged in to AWS
try {
    aws sts get-caller-identity | Out-Null
} catch {
    Write-Host "❌ AWS CLI is not configured. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  DB Instance: $DBInstanceIdentifier"
Write-Host "  Database: $DBName"
Write-Host "  Username: $DBUsername"
Write-Host "  Instance Class: $DBInstanceClass"
Write-Host "  Storage: ${DBAllocatedStorage}GB"
Write-Host "  Engine: $DBEngine $DBEngineVersion"
Write-Host ""

# Get default VPC
Write-Host "🔍 Getting default VPC information..." -ForegroundColor Yellow
$DefaultVpcId = aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text

if ($DefaultVpcId -eq "None" -or [string]::IsNullOrEmpty($DefaultVpcId)) {
    Write-Host "❌ No default VPC found. Please create a VPC first." -ForegroundColor Red
    exit 1
}

Write-Host "  Default VPC ID: $DefaultVpcId"

# Get subnets in different AZs
Write-Host "🔍 Getting subnet information..." -ForegroundColor Yellow
$SubnetsOutput = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$DefaultVpcId" --query 'Subnets[*].SubnetId' --output text

if ([string]::IsNullOrEmpty($SubnetsOutput)) {
    Write-Host "❌ No subnets found in the default VPC." -ForegroundColor Red
    exit 1
}

$SubnetIds = $SubnetsOutput -split '\s+' | Select-Object -First 2

if ($SubnetIds.Count -lt 2) {
    Write-Host "❌ Need at least 2 subnets in different availability zones." -ForegroundColor Red
    exit 1
}

Write-Host "  Using subnets: $($SubnetIds -join ', ')"

# Create DB subnet group
Write-Host "🏗️  Creating DB subnet group..." -ForegroundColor Yellow
try {
    aws rds create-db-subnet-group `
        --db-subnet-group-name "songo-db-subnet-group" `
        --db-subnet-group-description "SonGo DB Subnet Group" `
        --subnet-ids $SubnetIds `
        --tags Key=Project,Value=SonGo Key=Environment,Value=Production | Out-Null
} catch {
    Write-Host "  Subnet group may already exist"
}

# Create security group for RDS
Write-Host "🔒 Creating security group for RDS..." -ForegroundColor Yellow
try {
    $SecurityGroupId = aws ec2 create-security-group `
        --group-name "songo-rds-sg" `
        --description "Security group for SonGo RDS MySQL database" `
        --vpc-id $DefaultVpcId `
        --query 'GroupId' `
        --output text
} catch {
    $SecurityGroupId = aws ec2 describe-security-groups --filters "Name=group-name,Values=songo-rds-sg" --query 'SecurityGroups[0].GroupId' --output text
}

Write-Host "  Security Group ID: $SecurityGroupId"

# Add inbound rule for MySQL (port 3306)
Write-Host "🔓 Adding MySQL port rule to security group..." -ForegroundColor Yellow
try {
    aws ec2 authorize-security-group-ingress `
        --group-id $SecurityGroupId `
        --protocol tcp `
        --port 3306 `
        --cidr 0.0.0.0/0 | Out-Null
} catch {
    Write-Host "  Rule may already exist"
}

# Create parameter group for MySQL 8.0
Write-Host "⚙️  Creating DB parameter group..." -ForegroundColor Yellow
try {
    aws rds create-db-parameter-group `
        --db-parameter-group-name "songo-mysql-params" `
        --db-parameter-group-family "mysql8.0" `
        --description "SonGo MySQL 8.0 parameters" `
        --tags Key=Project,Value=SonGo Key=Environment,Value=Production | Out-Null
} catch {
    Write-Host "  Parameter group may already exist"
}

# Create RDS instance
Write-Host "🗄️  Creating RDS MySQL instance..." -ForegroundColor Yellow
Write-Host "  This may take 10-15 minutes..."

try {
    aws rds create-db-instance `
        --db-instance-identifier $DBInstanceIdentifier `
        --db-instance-class $DBInstanceClass `
        --engine $DBEngine `
        --engine-version $DBEngineVersion `
        --master-username $DBUsername `
        --master-user-password $DBPassword `
        --allocated-storage $DBAllocatedStorage `
        --db-name $DBName `
        --vpc-security-group-ids $SecurityGroupId `
        --db-subnet-group-name "songo-db-subnet-group" `
        --db-parameter-group-name "songo-mysql-params" `
        --backup-retention-period 7 `
        --storage-encrypted `
        --multi-az false `
        --publicly-accessible true `
        --auto-minor-version-upgrade true `
        --deletion-protection false `
        --tags Key=Project,Value=SonGo Key=Environment,Value=Production Key=Application,Value=ShippingPlatform | Out-Null

    Write-Host "✅ RDS instance creation initiated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⏳ Waiting for RDS instance to be available..." -ForegroundColor Yellow

    # Wait for the instance to be available
    aws rds wait db-instance-available --db-instance-identifier $DBInstanceIdentifier

    # Get the endpoint
    $Endpoint = aws rds describe-db-instances --db-instance-identifier $DBInstanceIdentifier --query 'DBInstances[0].Endpoint.Address' --output text
    $Port = aws rds describe-db-instances --db-instance-identifier $DBInstanceIdentifier --query 'DBInstances[0].Endpoint.Port' --output text

    Write-Host "🎉 RDS MySQL instance is now available!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Connection Details:" -ForegroundColor Green
    Write-Host "  Endpoint: $Endpoint"
    Write-Host "  Port: $Port"
    Write-Host "  Database: $DBName"
    Write-Host "  Username: $DBUsername"
    Write-Host "  Password: $DBPassword"
    Write-Host ""
    Write-Host "🔗 JDBC URL:" -ForegroundColor Green
    Write-Host "  jdbc:mysql://${Endpoint}:${Port}/${DBName}?useSSL=true&serverTimezone=UTC"
    Write-Host ""
    Write-Host "📝 Environment Variables for your application:" -ForegroundColor Yellow
    Write-Host "  DATABASE_URL=jdbc:mysql://${Endpoint}:${Port}/${DBName}?useSSL=true&serverTimezone=UTC"
    Write-Host "  DATABASE_USERNAME=$DBUsername"
    Write-Host "  DATABASE_PASSWORD=$DBPassword"

    # Create .env file for local development
    $EnvContent = @"
# SonGo Database Configuration
DATABASE_URL=jdbc:mysql://${Endpoint}:${Port}/${DBName}?useSSL=true&serverTimezone=UTC
DATABASE_USERNAME=$DBUsername
DATABASE_PASSWORD=$DBPassword

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Other configurations
JWT_SECRET=songoSecretKeyForJWTTokenGenerationAndValidation2024!@#$%^&*()
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
"@

    $EnvContent | Out-File -FilePath ".env" -Encoding UTF8

    Write-Host ""
    Write-Host "📄 Created .env file with database configuration" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Important Notes:" -ForegroundColor Yellow
    Write-Host "  1. The database password is: $DBPassword"
    Write-Host "  2. Make sure to update your application.yml or use environment variables"
    Write-Host "  3. The database is publicly accessible - consider restricting access in production"
    Write-Host "  4. Backup retention is set to 7 days"
    Write-Host "  5. Remember to run the database initialization script after connecting"
    Write-Host ""
    Write-Host "✅ Setup complete! You can now connect to your RDS MySQL database." -ForegroundColor Green

} catch {
    Write-Host "❌ Error creating RDS instance: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
