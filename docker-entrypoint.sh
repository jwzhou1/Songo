#!/bin/sh

# Docker entrypoint script for Angular frontend
# This script allows for runtime environment variable configuration

set -e

# Default API URL if not provided
API_URL=${API_URL:-http://localhost:8080/api}

echo "Configuring Angular app with API_URL: $API_URL"

# Create environment configuration file
cat > /usr/share/nginx/html/assets/env.js << EOF
(function(window) {
  window.__env = window.__env || {};
  window.__env.apiUrl = '$API_URL';
  window.__env.production = true;
})(this);
EOF

echo "Environment configuration created"

# Execute the main command
exec "$@"
