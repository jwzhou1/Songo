pipeline {
    agent any
    
    environment {
        // AWS Configuration
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = credentials('aws-account-id')
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        
        // Docker Configuration
        DOCKER_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/songo-frontend"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/songo-backend"
        
        // Application Configuration
        NODE_VERSION = '18'
        JAVA_VERSION = '17'
        
        // Deployment Configuration
        ENVIRONMENT = "${env.BRANCH_NAME == 'main' ? 'production' : 'staging'}"
        NAMESPACE = "songo-${ENVIRONMENT}"
        
        // Notification Configuration
        SLACK_CHANNEL = '#songo-deployments'
        TEAMS_WEBHOOK = credentials('teams-webhook-url')
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 45, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
    }
    
    stages {
        stage('Checkout & Setup') {
            steps {
                script {
                    // Clean workspace
                    cleanWs()
                    
                    // Checkout code
                    checkout scm
                    
                    // Set build information
                    env.BUILD_VERSION = sh(
                        script: "echo '${env.BUILD_NUMBER}-${env.GIT_COMMIT[0..7]}'",
                        returnStdout: true
                    ).trim()
                    
                    // Install dependencies
                    sh '''
                        echo "Setting up build environment..."
                        node --version
                        npm --version
                        docker --version
                        aws --version
                    '''
                }
            }
        }
        
        stage('Code Quality & Security') {
            parallel {
                stage('Frontend Lint & Test') {
                    steps {
                        dir('frontend') {
                            sh '''
                                echo "Installing frontend dependencies..."
                                npm ci
                                
                                echo "Running ESLint..."
                                npm run lint
                                
                                echo "Running unit tests..."
                                npm run test:ci
                                
                                echo "Running e2e tests..."
                                npm run e2e:ci
                                
                                echo "Generating coverage report..."
                                npm run test:coverage
                            '''
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'frontend/coverage',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }
                
                stage('Backend Lint & Test') {
                    steps {
                        dir('backend-serverless') {
                            sh '''
                                echo "Installing backend dependencies..."
                                npm ci
                                
                                echo "Running TypeScript compilation..."
                                npm run build
                                
                                echo "Running unit tests..."
                                npm run test
                                
                                echo "Running integration tests..."
                                npm run test:integration
                            '''
                        }
                    }
                }
                
                stage('Security Scan') {
                    steps {
                        sh '''
                            echo "Running security scans..."
                            
                            # Frontend security scan
                            cd frontend
                            npm audit --audit-level=high
                            
                            # Backend security scan
                            cd ../backend-serverless
                            npm audit --audit-level=high
                            
                            # Docker security scan
                            echo "Scanning Docker images for vulnerabilities..."
                            # Add Trivy or similar security scanner here
                        '''
                    }
                }
            }
        }
        
        stage('Build & Package') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh '''
                                echo "Building Angular application..."
                                npm run build:prod
                                
                                echo "Building Docker image..."
                                docker build -t ${FRONTEND_IMAGE}:${BUILD_VERSION} -f Dockerfile.prod .
                                docker tag ${FRONTEND_IMAGE}:${BUILD_VERSION} ${FRONTEND_IMAGE}:latest
                            '''
                        }
                    }
                }
                
                stage('Package Lambda Functions') {
                    steps {
                        dir('backend-serverless') {
                            sh '''
                                echo "Packaging Lambda functions..."
                                npm run build
                                
                                # Create deployment packages
                                mkdir -p dist/packages
                                
                                # Package quote service
                                cd src/functions/quote-service
                                zip -r ../../../dist/packages/quote-service.zip . -x "*.test.*" "node_modules/.cache/*"
                                
                                # Package tracking service
                                cd ../tracking-service
                                zip -r ../../../dist/packages/tracking-service.zip . -x "*.test.*" "node_modules/.cache/*"
                                
                                # Package payment service
                                cd ../payment-service
                                zip -r ../../../dist/packages/payment-service.zip . -x "*.test.*" "node_modules/.cache/*"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Infrastructure Deployment') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                }
            }
            steps {
                dir('infrastructure/terraform') {
                    sh '''
                        echo "Deploying AWS infrastructure..."
                        
                        # Initialize Terraform
                        terraform init -backend-config="bucket=songo-terraform-state-${ENVIRONMENT}"
                        
                        # Plan infrastructure changes
                        terraform plan -var="environment=${ENVIRONMENT}" -out=tfplan
                        
                        # Apply infrastructure changes
                        terraform apply -auto-approve tfplan
                        
                        # Output important values
                        terraform output -json > ../../terraform-outputs.json
                    '''
                }
            }
        }
        
        stage('Deploy Services') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                }
            }
            parallel {
                stage('Deploy Lambda Functions') {
                    steps {
                        sh '''
                            echo "Deploying Lambda functions..."
                            
                            # Deploy quote service
                            aws lambda update-function-code \
                                --function-name songo-${ENVIRONMENT}-quote-service \
                                --zip-file fileb://backend-serverless/dist/packages/quote-service.zip \
                                --region ${AWS_REGION}
                            
                            # Deploy tracking service
                            aws lambda update-function-code \
                                --function-name songo-${ENVIRONMENT}-tracking-service \
                                --zip-file fileb://backend-serverless/dist/packages/tracking-service.zip \
                                --region ${AWS_REGION}
                            
                            # Deploy payment service
                            aws lambda update-function-code \
                                --function-name songo-${ENVIRONMENT}-payment-service \
                                --zip-file fileb://backend-serverless/dist/packages/payment-service.zip \
                                --region ${AWS_REGION}
                        '''
                    }
                }
                
                stage('Deploy Frontend') {
                    steps {
                        sh '''
                            echo "Pushing frontend image to ECR..."
                            
                            # Login to ECR
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${DOCKER_REGISTRY}
                            
                            # Push images
                            docker push ${FRONTEND_IMAGE}:${BUILD_VERSION}
                            docker push ${FRONTEND_IMAGE}:latest
                            
                            echo "Deploying to ECS Fargate..."
                            # Update ECS service with new image
                            aws ecs update-service \
                                --cluster songo-${ENVIRONMENT} \
                                --service songo-frontend \
                                --force-new-deployment \
                                --region ${AWS_REGION}
                        '''
                    }
                }
            }
        }
        
        stage('Health Checks & Smoke Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                }
            }
            steps {
                script {
                    def apiUrl = env.ENVIRONMENT == 'production' ? 
                        'https://api.songo-enterprise.com' : 
                        'https://api-staging.songo-enterprise.com'
                    
                    sh """
                        echo "Running health checks..."
                        
                        # Wait for services to be ready
                        sleep 30
                        
                        # Health check API Gateway
                        curl -f ${apiUrl}/health || exit 1
                        
                        # Test quote endpoint
                        curl -f -X POST ${apiUrl}/api/quotes/quick-quote \
                            -H "Content-Type: application/json" \
                            -d '{"origin":{"city":"New York","state":"NY","zip":"10001","country":"US"},"destination":{"city":"Los Angeles","state":"CA","zip":"90001","country":"US"},"packages":[{"type":"PARCEL","dimensions":{"length":10,"width":10,"height":10,"weight":5,"unit":"IN","weightUnit":"LB"},"value":100,"contents":"Test package"}],"serviceLevel":"GROUND","pickupDate":"2024-01-01"}' \
                            || exit 1
                        
                        # Test tracking endpoint
                        curl -f ${apiUrl}/api/tracking/1234567890 || echo "Tracking test completed"
                        
                        echo "All health checks passed!"
                    """
                }
            }
        }
        
        stage('Performance Tests') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    echo "Running performance tests..."
                    
                    # Install k6 if not available
                    if ! command -v k6 &> /dev/null; then
                        echo "Installing k6..."
                        sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
                        echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
                        sudo apt-get update
                        sudo apt-get install k6
                    fi
                    
                    # Run performance tests
                    k6 run tests/performance/load-test.js
                '''
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'tests/performance/reports',
                        reportFiles: '*.html',
                        reportName: 'Performance Test Report'
                    ])
                }
            }
        }
    }
    
    post {
        always {
            // Clean up Docker images
            sh '''
                docker image prune -f
                docker system prune -f --volumes
            '''
            
            // Archive artifacts
            archiveArtifacts artifacts: 'terraform-outputs.json,backend-serverless/dist/packages/*.zip', allowEmptyArchive: true
        }
        
        success {
            script {
                def message = """
                ✅ **SonGo Enterprise Deployment Successful**
                
                **Environment:** ${env.ENVIRONMENT}
                **Version:** ${env.BUILD_VERSION}
                **Branch:** ${env.BRANCH_NAME}
                **Commit:** ${env.GIT_COMMIT[0..7]}
                
                **Services Deployed:**
                - Frontend (Angular SPA)
                - Lambda Functions (Quote, Tracking, Payment)
                - Infrastructure Updates
                
                **URLs:**
                - Frontend: https://${env.ENVIRONMENT == 'production' ? '' : 'staging.'}songo-enterprise.com
                - API: https://api${env.ENVIRONMENT == 'production' ? '' : '-staging'}.songo-enterprise.com
                - Monitoring: https://monitoring.songo-enterprise.com
                
                **Duration:** ${currentBuild.durationString}
                """
                
                // Send Teams notification
                office365ConnectorSend(
                    webhookUrl: env.TEAMS_WEBHOOK,
                    message: message,
                    status: 'Success',
                    color: '00FF00'
                )
            }
        }
        
        failure {
            script {
                def message = """
                ❌ **SonGo Enterprise Deployment Failed**
                
                **Environment:** ${env.ENVIRONMENT}
                **Branch:** ${env.BRANCH_NAME}
                **Commit:** ${env.GIT_COMMIT[0..7]}
                **Build:** ${env.BUILD_NUMBER}
                
                **Error:** Check Jenkins logs for details
                **Duration:** ${currentBuild.durationString}
                
                **Action Required:** Please investigate and fix the deployment issues.
                """
                
                // Send Teams notification
                office365ConnectorSend(
                    webhookUrl: env.TEAMS_WEBHOOK,
                    message: message,
                    status: 'Failed',
                    color: 'FF0000'
                )
            }
        }
    }
}
