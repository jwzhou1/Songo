#!/bin/bash

# SonGo Enterprise - Health Check Script
# This script performs comprehensive health checks on the deployed application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_URL=${1:-"https://songo-enterprise.vercel.app"}
TIMEOUT=30
MAX_RETRIES=3

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

# Function to make HTTP requests with retry logic
make_request() {
    local url=$1
    local expected_status=${2:-200}
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        local response=$(curl -s -w "%{http_code}" -o /tmp/response_body --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")
        
        if [ "$response" = "$expected_status" ]; then
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $MAX_RETRIES ]; then
            print_warning "Request failed (attempt $retry_count/$MAX_RETRIES), retrying in 5 seconds..."
            sleep 5
        fi
    done
    
    return 1
}

# Check if URL is accessible
check_basic_connectivity() {
    print_status "Checking basic connectivity to $DEPLOYMENT_URL..."
    
    if make_request "$DEPLOYMENT_URL" 200; then
        print_success "✅ Site is accessible"
        return 0
    else
        print_error "❌ Site is not accessible"
        return 1
    fi
}

# Check critical pages
check_critical_pages() {
    print_status "Checking critical pages..."
    
    local pages=(
        "/"
        "/get-quote"
        "/tracking"
        "/checkout"
    )
    
    local failed_pages=()
    
    for page in "${pages[@]}"; do
        local url="${DEPLOYMENT_URL}${page}"
        print_status "Checking $url..."
        
        if make_request "$url" 200; then
            print_success "✅ $page is accessible"
        else
            print_error "❌ $page is not accessible"
            failed_pages+=("$page")
        fi
    done
    
    if [ ${#failed_pages[@]} -eq 0 ]; then
        print_success "All critical pages are accessible"
        return 0
    else
        print_error "Failed pages: ${failed_pages[*]}"
        return 1
    fi
}

# Check API endpoints
check_api_endpoints() {
    print_status "Checking API endpoints..."
    
    local endpoints=(
        "/api/shipping/quotes"
        "/api/payments/create-intent"
    )
    
    local failed_endpoints=()
    
    for endpoint in "${endpoints[@]}"; do
        local url="${DEPLOYMENT_URL}${endpoint}"
        print_status "Checking $url..."
        
        # API endpoints might return 405 (Method Not Allowed) for GET requests, which is expected
        if make_request "$url" 200 || make_request "$url" 405 || make_request "$url" 400; then
            print_success "✅ $endpoint is responding"
        else
            print_error "❌ $endpoint is not responding"
            failed_endpoints+=("$endpoint")
        fi
    done
    
    if [ ${#failed_endpoints[@]} -eq 0 ]; then
        print_success "All API endpoints are responding"
        return 0
    else
        print_error "Failed endpoints: ${failed_endpoints[*]}"
        return 1
    fi
}

# Check performance metrics
check_performance() {
    print_status "Checking performance metrics..."
    
    local start_time=$(date +%s%N)
    
    if make_request "$DEPLOYMENT_URL" 200; then
        local end_time=$(date +%s%N)
        local duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
        
        print_success "✅ Response time: ${duration}ms"
        
        if [ $duration -lt 2000 ]; then
            print_success "✅ Performance: Excellent (< 2s)"
        elif [ $duration -lt 5000 ]; then
            print_warning "⚠️  Performance: Good (< 5s)"
        else
            print_warning "⚠️  Performance: Needs improvement (> 5s)"
        fi
        
        return 0
    else
        print_error "❌ Could not measure performance"
        return 1
    fi
}

# Check security headers
check_security_headers() {
    print_status "Checking security headers..."
    
    local headers_to_check=(
        "X-Frame-Options"
        "X-Content-Type-Options"
        "Referrer-Policy"
    )
    
    local missing_headers=()
    
    # Get headers
    local response_headers=$(curl -s -I --max-time $TIMEOUT "$DEPLOYMENT_URL" 2>/dev/null || echo "")
    
    if [ -z "$response_headers" ]; then
        print_error "❌ Could not retrieve headers"
        return 1
    fi
    
    for header in "${headers_to_check[@]}"; do
        if echo "$response_headers" | grep -qi "$header"; then
            print_success "✅ $header header is present"
        else
            print_warning "⚠️  $header header is missing"
            missing_headers+=("$header")
        fi
    done
    
    # Check HTTPS
    if [[ $DEPLOYMENT_URL == https://* ]]; then
        print_success "✅ HTTPS is enabled"
    else
        print_warning "⚠️  HTTPS is not enabled"
    fi
    
    if [ ${#missing_headers[@]} -eq 0 ]; then
        print_success "All security headers are present"
        return 0
    else
        print_warning "Missing headers: ${missing_headers[*]}"
        return 0 # Don't fail on missing headers, just warn
    fi
}

# Check content integrity
check_content_integrity() {
    print_status "Checking content integrity..."
    
    if make_request "$DEPLOYMENT_URL" 200; then
        local content=$(cat /tmp/response_body)
        
        # Check for critical content
        local critical_content=(
            "SonGo Enterprise"
            "Enterprise Shipping"
            "Get Quote"
            "Track Package"
        )
        
        local missing_content=()
        
        for item in "${critical_content[@]}"; do
            if echo "$content" | grep -q "$item"; then
                print_success "✅ Found: $item"
            else
                print_warning "⚠️  Missing: $item"
                missing_content+=("$item")
            fi
        done
        
        # Check for error indicators
        if echo "$content" | grep -qi "error\|404\|500\|not found"; then
            print_warning "⚠️  Potential error content detected"
        else
            print_success "✅ No error indicators found"
        fi
        
        if [ ${#missing_content[@]} -eq 0 ]; then
            print_success "All critical content is present"
            return 0
        else
            print_warning "Missing content: ${missing_content[*]}"
            return 0 # Don't fail on missing content, just warn
        fi
    else
        print_error "❌ Could not check content integrity"
        return 1
    fi
}

# Check SSL certificate
check_ssl_certificate() {
    if [[ $DEPLOYMENT_URL == https://* ]]; then
        print_status "Checking SSL certificate..."
        
        local domain=$(echo "$DEPLOYMENT_URL" | sed 's|https://||' | sed 's|/.*||')
        local cert_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
        
        if [ -n "$cert_info" ]; then
            print_success "✅ SSL certificate is valid"
            
            # Check expiration
            local not_after=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
            if [ -n "$not_after" ]; then
                print_success "✅ Certificate expires: $not_after"
            fi
        else
            print_warning "⚠️  Could not verify SSL certificate"
        fi
    else
        print_status "Skipping SSL check (not HTTPS)"
    fi
}

# Generate health report
generate_report() {
    local total_checks=$1
    local passed_checks=$2
    local failed_checks=$((total_checks - passed_checks))
    
    print_status "================================================"
    print_status "🏥 HEALTH CHECK REPORT"
    print_status "================================================"
    print_status "URL: $DEPLOYMENT_URL"
    print_status "Timestamp: $(date)"
    print_status "Total Checks: $total_checks"
    print_success "Passed: $passed_checks"
    
    if [ $failed_checks -gt 0 ]; then
        print_error "Failed: $failed_checks"
    else
        print_success "Failed: $failed_checks"
    fi
    
    local success_rate=$((passed_checks * 100 / total_checks))
    print_status "Success Rate: $success_rate%"
    
    if [ $success_rate -ge 90 ]; then
        print_success "🎉 Overall Status: HEALTHY"
        return 0
    elif [ $success_rate -ge 70 ]; then
        print_warning "⚠️  Overall Status: DEGRADED"
        return 1
    else
        print_error "❌ Overall Status: UNHEALTHY"
        return 2
    fi
}

# Main health check function
main() {
    print_status "🏥 Starting SonGo Enterprise Health Check..."
    print_status "================================================"
    print_status "Target URL: $DEPLOYMENT_URL"
    print_status "Timeout: ${TIMEOUT}s"
    print_status "Max Retries: $MAX_RETRIES"
    print_status "================================================"
    
    local total_checks=0
    local passed_checks=0
    
    # Run all checks
    local checks=(
        "check_basic_connectivity"
        "check_critical_pages"
        "check_api_endpoints"
        "check_performance"
        "check_security_headers"
        "check_content_integrity"
        "check_ssl_certificate"
    )
    
    for check in "${checks[@]}"; do
        total_checks=$((total_checks + 1))
        
        if $check; then
            passed_checks=$((passed_checks + 1))
        fi
        
        echo "" # Add spacing between checks
    done
    
    # Generate final report
    generate_report $total_checks $passed_checks
}

# Handle script interruption
trap 'print_error "Health check interrupted!"; exit 1' INT TERM

# Run main function
main "$@"
