-- SonGo Shipping Platform Database Initialization Script
-- MySQL 8.0 Compatible

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS songo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'songo_user'@'localhost' IDENTIFIED BY 'songo_password';
CREATE USER IF NOT EXISTS 'songo_user'@'%' IDENTIFIED BY 'songo_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON songo_db.* TO 'songo_user'@'localhost';
GRANT ALL PRIVILEGES ON songo_db.* TO 'songo_user'@'%';
FLUSH PRIVILEGES;

-- Use the database
USE songo_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('CUSTOMER', 'ADMIN', 'SUPPORT') DEFAULT 'CUSTOMER',
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- Customer profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(255),
    business_type VARCHAR(100),
    tax_number VARCHAR(50),
    website VARCHAR(255),
    preferred_language ENUM('EN', 'FR') DEFAULT 'EN',
    timezone VARCHAR(50) DEFAULT 'America/Toronto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('BILLING', 'SHIPPING', 'PICKUP') NOT NULL,
    company_name VARCHAR(255),
    contact_name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(50) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    country VARCHAR(2) DEFAULT 'CA',
    phone VARCHAR(20),
    email VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    is_residential BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_postal_code (postal_code)
);

-- Carriers table
CREATE TABLE IF NOT EXISTS carriers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    api_endpoint VARCHAR(255),
    logo_url VARCHAR(255),
    website VARCHAR(255),
    supports_tracking BOOLEAN DEFAULT TRUE,
    supports_parcel BOOLEAN DEFAULT TRUE,
    supports_ltl BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active)
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    carrier_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    service_type ENUM('PARCEL', 'LTL', 'EXPRESS', 'GROUND') NOT NULL,
    description TEXT,
    max_weight DECIMAL(10,2),
    max_dimensions VARCHAR(50),
    transit_time_min INT,
    transit_time_max INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (carrier_id) REFERENCES carriers(id) ON DELETE CASCADE,
    INDEX idx_carrier_id (carrier_id),
    INDEX idx_service_type (service_type),
    INDEX idx_is_active (is_active),
    UNIQUE KEY unique_carrier_service (carrier_id, code)
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    shipment_number VARCHAR(50) NOT NULL UNIQUE,
    carrier_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    status ENUM('DRAFT', 'QUOTED', 'BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'EXCEPTION') DEFAULT 'DRAFT',
    shipment_type ENUM('PARCEL', 'LTL') NOT NULL,
    
    -- Origin and destination
    origin_address_id BIGINT NOT NULL,
    destination_address_id BIGINT NOT NULL,
    
    -- Package details
    total_weight DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'CAD',
    
    -- Pricing
    base_cost DECIMAL(10,2),
    fuel_surcharge DECIMAL(10,2),
    taxes DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    -- Tracking
    tracking_number VARCHAR(100),
    carrier_reference VARCHAR(100),
    
    -- Dates
    pickup_date DATE,
    delivery_date DATE,
    estimated_delivery DATE,
    
    -- Special instructions
    pickup_instructions TEXT,
    delivery_instructions TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (carrier_id) REFERENCES carriers(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (origin_address_id) REFERENCES addresses(id),
    FOREIGN KEY (destination_address_id) REFERENCES addresses(id),
    
    INDEX idx_user_id (user_id),
    INDEX idx_shipment_number (shipment_number),
    INDEX idx_status (status),
    INDEX idx_tracking_number (tracking_number),
    INDEX idx_pickup_date (pickup_date),
    INDEX idx_created_at (created_at)
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shipment_id BIGINT NOT NULL,
    package_type ENUM('BOX', 'ENVELOPE', 'PALLET', 'TUBE', 'OTHER') DEFAULT 'BOX',
    length DECIMAL(8,2) NOT NULL,
    width DECIMAL(8,2) NOT NULL,
    height DECIMAL(8,2) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    declared_value DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    INDEX idx_shipment_id (shipment_id)
);

-- Insert default carriers
INSERT IGNORE INTO carriers (name, code, supports_parcel, supports_ltl, logo_url, website) VALUES
('Canada Post', 'CP', TRUE, FALSE, '/assets/carriers/canada-post.png', 'https://www.canadapost.ca'),
('Purolator', 'PUR', TRUE, TRUE, '/assets/carriers/purolator.png', 'https://www.purolator.com'),
('UPS', 'UPS', TRUE, TRUE, '/assets/carriers/ups.png', 'https://www.ups.com'),
('FedEx', 'FEDEX', TRUE, TRUE, '/assets/carriers/fedex.png', 'https://www.fedex.com'),
('DHL', 'DHL', TRUE, FALSE, '/assets/carriers/dhl.png', 'https://www.dhl.com');

-- Insert default services for Canada Post
INSERT IGNORE INTO services (carrier_id, name, code, service_type, description, max_weight, transit_time_min, transit_time_max) VALUES
((SELECT id FROM carriers WHERE code = 'CP'), 'Regular Parcel', 'REG', 'PARCEL', 'Standard ground delivery', 30.00, 2, 9),
((SELECT id FROM carriers WHERE code = 'CP'), 'Expedited Parcel', 'EXP', 'PARCEL', 'Faster ground delivery', 30.00, 1, 4),
((SELECT id FROM carriers WHERE code = 'CP'), 'Xpresspost', 'XP', 'EXPRESS', 'Next day delivery', 30.00, 1, 2),
((SELECT id FROM carriers WHERE code = 'CP'), 'Priority', 'PRI', 'EXPRESS', 'Guaranteed next day', 30.00, 1, 1);

-- Insert default services for Purolator
INSERT IGNORE INTO services (carrier_id, name, code, service_type, description, max_weight, transit_time_min, transit_time_max) VALUES
((SELECT id FROM carriers WHERE code = 'PUR'), 'Ground', 'GRD', 'GROUND', 'Standard ground service', 68.00, 1, 7),
((SELECT id FROM carriers WHERE code = 'PUR'), 'Express', 'EXP', 'EXPRESS', 'Next day delivery', 68.00, 1, 2),
((SELECT id FROM carriers WHERE code = 'PUR'), 'Express 9AM', 'EXP9', 'EXPRESS', 'Next day by 9AM', 68.00, 1, 1),
((SELECT id FROM carriers WHERE code = 'PUR'), 'Freight', 'FRT', 'LTL', 'LTL freight service', 10000.00, 1, 5);

-- Create admin user (password: admin123)
INSERT IGNORE INTO users (email, password, first_name, last_name, role, email_verified) VALUES
('admin@songo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'ADMIN', TRUE);

-- Create sample customer (password: customer123)
INSERT IGNORE INTO users (email, password, first_name, last_name, phone, email_verified) VALUES
('customer@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', '416-555-0123', TRUE);

COMMIT;
