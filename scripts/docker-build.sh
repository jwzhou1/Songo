#!/bin/bash

# SonGo Shipping Platform - Docker Build Script
# This script builds all Docker images for the SonGo platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="songo"
VERSION=${1:-latest}
REGISTRY=${DOCKER_REGISTRY:-}

echo -e "${GREEN}🚀 Building SonGo Docker Images${NC}"
echo "=================================================="
echo -e "${BLUE}Project: ${PROJECT_NAME}${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo -e "${BLUE}Registry: ${REGISTRY:-local}${NC}"
echo ""

# Function to build and tag image
build_image() {
    local service=$1
    local dockerfile=$2
    local context=${3:-.}
    
    echo -e "${YELLOW}📦 Building ${service} image...${NC}"
    
    local image_name="${PROJECT_NAME}-${service}:${VERSION}"
    if [ -n "$REGISTRY" ]; then
        image_name="${REGISTRY}/${image_name}"
    fi
    
    docker build -f "$dockerfile" -t "$image_name" "$context"
    
    # Also tag as latest
    local latest_name="${PROJECT_NAME}-${service}:latest"
    if [ -n "$REGISTRY" ]; then
        latest_name="${REGISTRY}/${latest_name}"
    fi
    docker tag "$image_name" "$latest_name"
    
    echo -e "${GREEN}✅ Built ${service} image: ${image_name}${NC}"
    echo ""
}

# Build backend image
build_image "backend" "Dockerfile.backend"

# Build frontend image
build_image "frontend" "Dockerfile.frontend"

# List built images
echo -e "${GREEN}📋 Built Images:${NC}"
docker images | grep "${PROJECT_NAME}" | head -10

echo ""
echo -e "${GREEN}🎉 All images built successfully!${NC}"

# Optional: Push to registry
if [ -n "$REGISTRY" ] && [ "$2" = "--push" ]; then
    echo ""
    echo -e "${YELLOW}📤 Pushing images to registry...${NC}"
    
    docker push "${REGISTRY}/${PROJECT_NAME}-backend:${VERSION}"
    docker push "${REGISTRY}/${PROJECT_NAME}-backend:latest"
    docker push "${REGISTRY}/${PROJECT_NAME}-frontend:${VERSION}"
    docker push "${REGISTRY}/${PROJECT_NAME}-frontend:latest"
    
    echo -e "${GREEN}✅ Images pushed to registry${NC}"
fi

echo ""
echo -e "${BLUE}💡 Next steps:${NC}"
echo "  • Run development: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up"
echo "  • Run production: docker-compose -f docker-compose.yml -f docker-compose.prod.yml up"
echo "  • View logs: docker-compose logs -f [service-name]"
echo "  • Scale services: docker-compose up --scale backend=3"
