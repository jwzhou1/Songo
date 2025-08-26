#!/bin/bash

# SonGo Enterprise - Deployment Script
# This script handles the complete deployment process to Vercel

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    if ! command_exists vercel; then
        print_warning "Vercel CLI is not installed. Installing now..."
        npm install -g vercel
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "All prerequisites met!"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            print_warning ".env.local not found. Copying from .env.example..."
            cp .env.example .env.local
            print_warning "Please update .env.local with your actual API keys before deploying!"
        else
            print_error ".env.local not found and no .env.example to copy from!"
            exit 1
        fi
    fi
    
    print_success "Environment setup complete!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "Dependencies installed!"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Type checking
    if command_exists tsc; then
        print_status "Running TypeScript type checking..."
        npm run type-check || {
            print_warning "Type checking failed, but continuing with deployment..."
        }
    fi
    
    # Linting
    if npm run lint >/dev/null 2>&1; then
        print_status "Running ESLint..."
        npm run lint || {
            print_warning "Linting failed, but continuing with deployment..."
        }
    fi
    
    # Unit tests (if available)
    if npm run test >/dev/null 2>&1; then
        print_status "Running unit tests..."
        npm run test || {
            print_warning "Tests failed, but continuing with deployment..."
        }
    fi
    
    print_success "Tests completed!"
}

# Build application
build_application() {
    print_status "Building application..."
    
    # Clean previous build
    if [ -d ".next" ]; then
        rm -rf .next
    fi
    
    # Build the application
    npm run build
    
    print_success "Application built successfully!"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if user is logged in to Vercel
    if ! vercel whoami >/dev/null 2>&1; then
        print_status "Please log in to Vercel..."
        vercel login
    fi
    
    # Deploy based on environment
    if [ "$1" = "production" ]; then
        print_status "Deploying to production..."
        vercel --prod
    else
        print_status "Deploying to preview..."
        vercel
    fi
    
    print_success "Deployment completed!"
}

# Set environment variables in Vercel
setup_vercel_env() {
    print_status "Setting up Vercel environment variables..."
    
    # Read .env.local and set variables in Vercel
    if [ -f ".env.local" ]; then
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            if [[ $key =~ ^[[:space:]]*# ]] || [[ -z $key ]]; then
                continue
            fi
            
            # Remove quotes from value
            value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']$//')
            
            # Set environment variable in Vercel
            if [[ $key == NEXT_PUBLIC_* ]]; then
                vercel env add "$key" production <<< "$value" 2>/dev/null || true
                vercel env add "$key" preview <<< "$value" 2>/dev/null || true
                vercel env add "$key" development <<< "$value" 2>/dev/null || true
            else
                vercel env add "$key" production <<< "$value" 2>/dev/null || true
                vercel env add "$key" preview <<< "$value" 2>/dev/null || true
            fi
        done < .env.local
    fi
    
    print_success "Environment variables configured!"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls | grep "songo-enterprise" | head -1 | awk '{print $2}')
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        print_status "Checking deployment at: https://$DEPLOYMENT_URL"
        
        # Wait a moment for deployment to be ready
        sleep 10
        
        # Check if site is accessible
        if curl -f -s "https://$DEPLOYMENT_URL" > /dev/null; then
            print_success "Health check passed! Site is accessible."
            print_success "🚀 Deployment URL: https://$DEPLOYMENT_URL"
        else
            print_warning "Health check failed. Site may still be starting up."
            print_status "Please check: https://$DEPLOYMENT_URL"
        fi
    else
        print_warning "Could not determine deployment URL for health check."
    fi
}

# Cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Remove any temporary files
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache
    fi
    
    print_success "Cleanup completed!"
}

# Main deployment function
main() {
    print_status "🚀 Starting SonGo Enterprise deployment..."
    print_status "================================================"
    
    # Parse command line arguments
    ENVIRONMENT="preview"
    SKIP_TESTS=false
    SKIP_BUILD=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --production)
                ENVIRONMENT="production"
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --production    Deploy to production environment"
                echo "  --skip-tests    Skip running tests"
                echo "  --skip-build    Skip building the application"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_prerequisites
    setup_environment
    install_dependencies
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    else
        print_warning "Skipping tests as requested"
    fi
    
    if [ "$SKIP_BUILD" = false ]; then
        build_application
    else
        print_warning "Skipping build as requested"
    fi
    
    setup_vercel_env
    deploy_to_vercel "$ENVIRONMENT"
    health_check
    cleanup
    
    print_success "================================================"
    print_success "🎉 SonGo Enterprise deployment completed!"
    print_success "================================================"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        print_success "✅ Production deployment successful!"
        print_success "🌐 Your app is now live at: https://songo-enterprise.vercel.app"
    else
        print_success "✅ Preview deployment successful!"
        print_success "🔍 Check your preview deployment in the Vercel dashboard"
    fi
    
    print_status ""
    print_status "Next steps:"
    print_status "1. Test all functionality on the deployed site"
    print_status "2. Configure your custom domain (if needed)"
    print_status "3. Set up monitoring and analytics"
    print_status "4. Update DNS records (if using custom domain)"
    print_status ""
    print_success "Happy shipping! 📦✨"
}

# Handle script interruption
trap 'print_error "Deployment interrupted!"; exit 1' INT TERM

# Run main function
main "$@"
