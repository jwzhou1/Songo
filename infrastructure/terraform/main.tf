# SonGo Enterprise Shipping Platform - AWS Infrastructure
# Terraform configuration for Amazon-ready cloud architecture

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "songo-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "SonGo-Enterprise"
      Environment = var.environment
      Owner       = "DevOps-Team"
      Purpose     = "Amazon-Interview-Demo"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "songo-enterprise"
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# S3 Buckets for storage
resource "aws_s3_bucket" "documents" {
  bucket = "${var.project_name}-documents-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket" "shipping_labels" {
  bucket = "${var.project_name}-labels-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket" "analytics" {
  bucket = "${var.project_name}-analytics-${random_id.bucket_suffix.hex}"
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 bucket configurations
resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# DynamoDB Tables
resource "aws_dynamodb_table" "users" {
  name           = "${var.project_name}-users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  attribute {
    name = "email"
    type = "S"
  }
  
  global_secondary_index {
    name     = "EmailIndex"
    hash_key = "email"
  }
  
  tags = {
    Name = "Users Table"
  }
}

resource "aws_dynamodb_table" "quotes" {
  name           = "${var.project_name}-quotes"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "quoteId"
  range_key      = "userId"
  
  attribute {
    name = "quoteId"
    type = "S"
  }
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  attribute {
    name = "status"
    type = "S"
  }
  
  global_secondary_index {
    name     = "UserStatusIndex"
    hash_key = "userId"
    range_key = "status"
  }
  
  tags = {
    Name = "Quotes Table"
  }
}

resource "aws_dynamodb_table" "shipments" {
  name           = "${var.project_name}-shipments"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "shipmentId"
  
  attribute {
    name = "shipmentId"
    type = "S"
  }
  
  attribute {
    name = "trackingNumber"
    type = "S"
  }
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  global_secondary_index {
    name     = "TrackingIndex"
    hash_key = "trackingNumber"
  }
  
  global_secondary_index {
    name     = "UserIndex"
    hash_key = "userId"
  }
  
  tags = {
    Name = "Shipments Table"
  }
}

resource "aws_dynamodb_table" "tracking_events" {
  name           = "${var.project_name}-tracking-events"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "shipmentId"
  range_key      = "timestamp"
  
  attribute {
    name = "shipmentId"
    type = "S"
  }
  
  attribute {
    name = "timestamp"
    type = "S"
  }
  
  tags = {
    Name = "Tracking Events Table"
  }
}

# SNS Topics for notifications
resource "aws_sns_topic" "shipment_updates" {
  name = "${var.project_name}-shipment-updates"
}

resource "aws_sns_topic" "payment_notifications" {
  name = "${var.project_name}-payment-notifications"
}

resource "aws_sns_topic" "system_alerts" {
  name = "${var.project_name}-system-alerts"
}

# SQS Queues for async processing
resource "aws_sqs_queue" "quote_processing" {
  name                      = "${var.project_name}-quote-processing"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 1209600
  receive_wait_time_seconds = 10
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.quote_processing_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue" "quote_processing_dlq" {
  name = "${var.project_name}-quote-processing-dlq"
}

resource "aws_sqs_queue" "tracking_updates" {
  name                      = "${var.project_name}-tracking-updates"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 1209600
  receive_wait_time_seconds = 10
}

# EventBridge Custom Bus
resource "aws_cloudwatch_event_bus" "songo_events" {
  name = "${var.project_name}-events"
}

# Secrets Manager for API keys
resource "aws_secretsmanager_secret" "carrier_apis" {
  name        = "${var.project_name}/carrier-apis"
  description = "API keys for shipping carriers"
}

resource "aws_secretsmanager_secret" "stripe_keys" {
  name        = "${var.project_name}/stripe"
  description = "Stripe payment processing keys"
}

resource "aws_secretsmanager_secret" "google_maps" {
  name        = "${var.project_name}/google-maps"
  description = "Google Maps API key"
}

# IAM Roles and Policies
resource "aws_iam_role" "lambda_execution_role" {
  name = "${var.project_name}-lambda-execution"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.lambda_execution_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "sns:Publish",
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "secretsmanager:GetSecretValue",
          "events:PutEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# Outputs
output "dynamodb_tables" {
  value = {
    users           = aws_dynamodb_table.users.name
    quotes          = aws_dynamodb_table.quotes.name
    shipments       = aws_dynamodb_table.shipments.name
    tracking_events = aws_dynamodb_table.tracking_events.name
  }
}

output "s3_buckets" {
  value = {
    documents       = aws_s3_bucket.documents.bucket
    shipping_labels = aws_s3_bucket.shipping_labels.bucket
    analytics       = aws_s3_bucket.analytics.bucket
  }
}

output "sns_topics" {
  value = {
    shipment_updates      = aws_sns_topic.shipment_updates.arn
    payment_notifications = aws_sns_topic.payment_notifications.arn
    system_alerts        = aws_sns_topic.system_alerts.arn
  }
}

output "sqs_queues" {
  value = {
    quote_processing = aws_sqs_queue.quote_processing.url
    tracking_updates = aws_sqs_queue.tracking_updates.url
  }
}
