-- =====================================================================
-- PES UNIVERSITY - DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
-- DBMS EXPERIENTIAL LEARNING - LEVEL 3 PROJECT
-- PROJECT: DISASTER RELIEF RESOURCE MANAGEMENT SYSTEM (DRRMS)
-- FILE: 01_schema_mysql.sql (MySQL 8.0+ Dialect)
-- =====================================================================

-- 1. Database Creation
CREATE DATABASE IF NOT EXISTS disaster_relief_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE disaster_relief_db;

-- 2. Drop existing tables in reverse dependency order (Clean teardown)
DROP TABLE IF EXISTS DELIVERY;
DROP TABLE IF EXISTS ALLOCATION;
DROP TABLE IF EXISTS REQUEST_ITEM;
DROP TABLE IF EXISTS RESOURCE_REQUEST;
DROP TABLE IF EXISTS INVENTORY;
DROP TABLE IF EXISTS WAREHOUSE;
DROP TABLE IF EXISTS RESOURCE_CATEGORY;
DROP TABLE IF EXISTS RELIEF_CAMP;
DROP TABLE IF EXISTS DISASTER_LOCATION;
DROP TABLE IF EXISTS VEHICLE;
DROP TABLE IF EXISTS VOLUNTEER;
DROP TABLE IF EXISTS DISASTER;
DROP TABLE IF EXISTS LOCATION;
DROP TABLE IF EXISTS USER;
DROP TABLE IF EXISTS ROLE;

-- =====================================================================
-- TABLE 1: ROLE
-- Defines access tier levels for RBAC (Admin, Dispatcher, Camp Manager, etc.)
-- =====================================================================
CREATE TABLE ROLE (
    role_id INT AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL,
    descp TEXT,
    CONSTRAINT pk_role PRIMARY KEY (role_id),
    CONSTRAINT uq_role_name UNIQUE (role_name)
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 2: USER
-- System actors authenticated with hashed credentials and roles
-- =====================================================================
CREATE TABLE USER (
    user_id INT AUTO_INCREMENT,
    role_id INT NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user PRIMARY KEY (user_id),
    CONSTRAINT uq_user_email UNIQUE (email),
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) 
        REFERENCES ROLE (role_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 3: DISASTER
-- Tracks ongoing or historical disaster occurrences
-- =====================================================================
CREATE TABLE DISASTER (
    disaster_id INT AUTO_INCREMENT,
    disaster_name VARCHAR(120) NOT NULL,
    disaster_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    started_at DATETIME NOT NULL,
    ended_at DATETIME NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_disaster PRIMARY KEY (disaster_id),
    CONSTRAINT chk_disaster_severity CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_disaster_status CHECK (status IN ('ACTIVE', 'CONTAINED', 'RESOLVED')),
    CONSTRAINT fk_disaster_creator FOREIGN KEY (created_by) 
        REFERENCES USER (user_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 4: LOCATION
-- Standardized geographical coordinates and addresses for all points of interest
-- =====================================================================
CREATE TABLE LOCATION (
    location_id INT AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    CONSTRAINT pk_location PRIMARY KEY (location_id),
    CONSTRAINT chk_location_type CHECK (type IN ('DISASTER_ZONE', 'RELIEF_CAMP', 'WAREHOUSE', 'HOSPITAL', 'TRANSIT_HUB')),
    CONSTRAINT chk_latitude CHECK (latitude BETWEEN -90.00000000 AND 90.00000000),
    CONSTRAINT chk_longitude CHECK (longitude BETWEEN -180.00000000 AND 180.00000000)
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 5: DISASTER_LOCATION
-- Bridge table resolving M:N relationship between Disasters and affected zones
-- =====================================================================
CREATE TABLE DISASTER_LOCATION (
    disaster_id INT NOT NULL,
    location_id INT NOT NULL,
    impact_level VARCHAR(30) NOT NULL,
    affected_population INT NOT NULL DEFAULT 0,
    reported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_disaster_location PRIMARY KEY (disaster_id, location_id),
    CONSTRAINT chk_impact_level CHECK (impact_level IN ('MINOR', 'MODERATE', 'SEVERE', 'CATASTROPHIC')),
    CONSTRAINT chk_affected_population CHECK (affected_population >= 0),
    CONSTRAINT fk_dl_disaster FOREIGN KEY (disaster_id) 
        REFERENCES DISASTER (disaster_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_dl_location FOREIGN KEY (location_id) 
        REFERENCES LOCATION (location_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 6: RELIEF_CAMP
-- Relief camps housing displaced people, tied to a location and manager
-- =====================================================================
CREATE TABLE RELIEF_CAMP (
    camp_id INT AUTO_INCREMENT,
    location_id INT NOT NULL,
    name VARCHAR(120) NOT NULL,
    capacity INT NOT NULL,
    current_population INT NOT NULL DEFAULT 0,
    manager_id INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPERATIONAL',
    established_dt DATE NOT NULL,
    CONSTRAINT pk_relief_camp PRIMARY KEY (camp_id),
    CONSTRAINT chk_camp_capacity CHECK (capacity > 0),
    CONSTRAINT chk_camp_population CHECK (current_population >= 0 AND current_population <= capacity),
    CONSTRAINT chk_camp_status CHECK (status IN ('PREPARING', 'OPERATIONAL', 'FULL', 'CLOSED')),
    CONSTRAINT fk_camp_location FOREIGN KEY (location_id) 
        REFERENCES LOCATION (location_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_camp_manager FOREIGN KEY (manager_id) 
        REFERENCES USER (user_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 7: RESOURCE_CATEGORY
-- Master catalog of relief items (food, water, medicine, tents)
-- =====================================================================
CREATE TABLE RESOURCE_CATEGORY (
    resource_id INT AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL,
    resource_name VARCHAR(100) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    description TEXT,
    is_perishable BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_resource_category PRIMARY KEY (resource_id),
    CONSTRAINT uq_resource_name UNIQUE (resource_name)
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 8: WAREHOUSE
-- Distribution centers holding stockpiles
-- =====================================================================
CREATE TABLE WAREHOUSE (
    warehouse_id INT AUTO_INCREMENT,
    location_id INT NOT NULL,
    warehouse_name VARCHAR(120) NOT NULL,
    manager_id INT NOT NULL,
    capacity INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT pk_warehouse PRIMARY KEY (warehouse_id),
    CONSTRAINT chk_warehouse_capacity CHECK (capacity > 0),
    CONSTRAINT chk_warehouse_status CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'DECOMMISSIONED')),
    CONSTRAINT fk_warehouse_location FOREIGN KEY (location_id) 
        REFERENCES LOCATION (location_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_warehouse_manager FOREIGN KEY (manager_id) 
        REFERENCES USER (user_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 9: INVENTORY
-- Composite PK table storing real-time stock levels per warehouse
-- =====================================================================
CREATE TABLE INVENTORY (
    warehouse_id INT NOT NULL,
    resource_id INT NOT NULL,
    quantity_available DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    minimum_threshold DECIMAL(12, 2) NOT NULL DEFAULT 10.00,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_inventory PRIMARY KEY (warehouse_id, resource_id),
    CONSTRAINT chk_inv_qty_avail CHECK (quantity_available >= 0.00),
    CONSTRAINT chk_inv_min_thresh CHECK (minimum_threshold >= 0.00),
    CONSTRAINT fk_inv_warehouse FOREIGN KEY (warehouse_id) 
        REFERENCES WAREHOUSE (warehouse_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_inv_resource FOREIGN KEY (resource_id) 
        REFERENCES RESOURCE_CATEGORY (resource_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 10: RESOURCE_REQUEST
-- Urgent requisitions created by relief camps for specific disasters
-- =====================================================================
CREATE TABLE RESOURCE_REQUEST (
    request_id INT AUTO_INCREMENT,
    camp_id INT NOT NULL,
    disaster_id INT NOT NULL,
    requested_by INT NOT NULL,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    need_by DATETIME NOT NULL,
    priority_score INT NOT NULL DEFAULT 1,
    priority_level VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    medical_emergency BOOLEAN NOT NULL DEFAULT FALSE,
    remarks TEXT,
    CONSTRAINT pk_resource_request PRIMARY KEY (request_id),
    CONSTRAINT chk_req_priority_score CHECK (priority_score BETWEEN 1 AND 100),
    CONSTRAINT chk_req_priority_level CHECK (priority_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_req_status CHECK (status IN ('Pending', 'Approved', 'Allocated', 'In Transit', 'Fulfilled', 'Cancelled', 'Rejected')),
    CONSTRAINT fk_req_camp FOREIGN KEY (camp_id) 
        REFERENCES RELIEF_CAMP (camp_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_req_disaster FOREIGN KEY (disaster_id) 
        REFERENCES DISASTER (disaster_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_req_user FOREIGN KEY (requested_by) 
        REFERENCES USER (user_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 11: REQUEST_ITEM
-- Line-items specifying quantity requested per resource
-- =====================================================================
CREATE TABLE REQUEST_ITEM (
    request_id INT NOT NULL,
    resource_id INT NOT NULL,
    quantity_requested DECIMAL(12, 2) NOT NULL,
    CONSTRAINT pk_request_item PRIMARY KEY (request_id, resource_id),
    CONSTRAINT chk_req_qty CHECK (quantity_requested > 0.00),
    CONSTRAINT fk_ri_request FOREIGN KEY (request_id) 
        REFERENCES RESOURCE_REQUEST (request_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_ri_resource FOREIGN KEY (resource_id) 
        REFERENCES RESOURCE_CATEGORY (resource_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 12: ALLOCATION
-- Commitments of supplies by dispatchers to resource requests
-- =====================================================================
CREATE TABLE ALLOCATION (
    allocation_id INT AUTO_INCREMENT,
    request_id INT NOT NULL,
    allocated_by INT NOT NULL,
    allocated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'Allocated',
    remark TEXT,
    CONSTRAINT pk_allocation PRIMARY KEY (allocation_id),
    CONSTRAINT chk_alloc_status CHECK (status IN ('Allocated', 'Dispatched', 'Delivered', 'Cancelled')),
    CONSTRAINT fk_alloc_request FOREIGN KEY (request_id) 
        REFERENCES RESOURCE_REQUEST (request_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_alloc_user FOREIGN KEY (allocated_by) 
        REFERENCES USER (user_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 13: VEHICLE
-- Transport fleet available for emergency deliveries
-- =====================================================================
CREATE TABLE VEHICLE (
    vehicle_id INT AUTO_INCREMENT,
    number VARCHAR(30) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    current_location_id INT NOT NULL,
    CONSTRAINT pk_vehicle PRIMARY KEY (vehicle_id),
    CONSTRAINT uq_vehicle_number UNIQUE (number),
    CONSTRAINT chk_vehicle_capacity CHECK (capacity > 0.00),
    CONSTRAINT chk_vehicle_status CHECK (status IN ('AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE', 'OUT_OF_SERVICE')),
    CONSTRAINT fk_vehicle_location FOREIGN KEY (current_location_id) 
        REFERENCES LOCATION (location_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 14: DELIVERY
-- Active and past transit dispatches linking vehicles, routes, and drivers
-- =====================================================================
CREATE TABLE DELIVERY (
    delivery_id INT AUTO_INCREMENT,
    allocation_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    driver_id INT NOT NULL,
    source_location INT NOT NULL,
    dest_location INT NOT NULL,
    dept_time DATETIME NOT NULL,
    expected_arrival DATETIME NOT NULL,
    actual_arrival DATETIME NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    CONSTRAINT pk_delivery PRIMARY KEY (delivery_id),
    CONSTRAINT chk_delivery_status CHECK (status IN ('Pending', 'Dispatched', 'In Transit', 'Completed', 'Failed')),
    CONSTRAINT fk_delivery_allocation FOREIGN KEY (allocation_id) 
        REFERENCES ALLOCATION (allocation_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_delivery_vehicle FOREIGN KEY (vehicle_id) 
        REFERENCES VEHICLE (vehicle_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_delivery_driver FOREIGN KEY (driver_id) 
        REFERENCES USER (user_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_delivery_source FOREIGN KEY (source_location) 
        REFERENCES LOCATION (location_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_delivery_dest FOREIGN KEY (dest_location) 
        REFERENCES LOCATION (location_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE 15: VOLUNTEER
-- Field workers, medics, drivers, and relief volunteers
-- =====================================================================
CREATE TABLE VOLUNTEER (
    volunteer_id INT AUTO_INCREMENT,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    skills TEXT,
    availability_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_volunteer PRIMARY KEY (volunteer_id),
    CONSTRAINT uq_volunteer_email UNIQUE (email),
    CONSTRAINT chk_volunteer_status CHECK (availability_status IN ('AVAILABLE', 'ASSIGNED', 'INACTIVE'))
) ENGINE=InnoDB;

-- =====================================================================
-- DEMONSTRATION OF DDL ALTER STATEMENTS (As required by syllabus)
-- Adding specialized operational tracking & performance indexes
-- =====================================================================

-- Add indexes on frequently joined/filtered columns
ALTER TABLE USER ADD INDEX idx_user_role (role_id);
ALTER TABLE DISASTER ADD INDEX idx_disaster_status (status);
ALTER TABLE RESOURCE_REQUEST ADD INDEX idx_request_status_priority (status, priority_level);
ALTER TABLE INVENTORY ADD INDEX idx_inventory_threshold (quantity_available, minimum_threshold);
ALTER TABLE DELIVERY ADD INDEX idx_delivery_status (status);

-- Alter table to add audit tracking / security column demonstration
ALTER TABLE USER ADD COLUMN last_login DATETIME NULL AFTER is_active;
ALTER TABLE RESOURCE_REQUEST ADD COLUMN approved_at DATETIME NULL AFTER requested_at;
