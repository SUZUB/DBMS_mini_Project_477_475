-- =====================================================================
-- PES UNIVERSITY - DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
-- DBMS EXPERIENTIAL LEARNING - LEVEL 3 PROJECT
-- PROJECT: DISASTER RELIEF RESOURCE MANAGEMENT SYSTEM (DRRMS)
-- FILE: 01_schema_postgres.sql (PostgreSQL 14+ Dialect with pgvector)
-- =====================================================================

-- 0. Enable pgvector extension for Vector / Semantic Similarity Search
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS DELIVERY CASCADE;
DROP TABLE IF EXISTS ALLOCATION CASCADE;
DROP TABLE IF EXISTS REQUEST_ITEM CASCADE;
DROP TABLE IF EXISTS RESOURCE_REQUEST CASCADE;
DROP TABLE IF EXISTS INVENTORY CASCADE;
DROP TABLE IF EXISTS WAREHOUSE CASCADE;
DROP TABLE IF EXISTS RESOURCE_CATEGORY CASCADE;
DROP TABLE IF EXISTS RELIEF_CAMP CASCADE;
DROP TABLE IF EXISTS DISASTER_LOCATION CASCADE;
DROP TABLE IF EXISTS VEHICLE CASCADE;
DROP TABLE IF EXISTS VOLUNTEER CASCADE;
DROP TABLE IF EXISTS DISASTER_REPORT_VECTOR CASCADE;
DROP TABLE IF EXISTS DISASTER CASCADE;
DROP TABLE IF EXISTS LOCATION CASCADE;
DROP TABLE IF EXISTS "USER" CASCADE;
DROP TABLE IF EXISTS ROLE CASCADE;

-- =====================================================================
-- TABLE 1: ROLE
-- =====================================================================
CREATE TABLE ROLE (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    descp TEXT
);

-- =====================================================================
-- TABLE 2: "USER"
-- =====================================================================
CREATE TABLE "USER" (
    user_id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES ROLE(role_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- TABLE 3: DISASTER
-- =====================================================================
CREATE TABLE DISASTER (
    disaster_id SERIAL PRIMARY KEY,
    disaster_name VARCHAR(120) NOT NULL,
    disaster_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONTAINED', 'RESOLVED')),
    description TEXT,
    created_by INT NOT NULL REFERENCES "USER"(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- TABLE 4: LOCATION
-- =====================================================================
CREATE TABLE LOCATION (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('DISASTER_ZONE', 'RELIEF_CAMP', 'WAREHOUSE', 'HOSPITAL', 'TRANSIT_HUB')),
    address TEXT,
    latitude DECIMAL(10, 8) NOT NULL CHECK (latitude BETWEEN -90.00000000 AND 90.00000000),
    longitude DECIMAL(11, 8) NOT NULL CHECK (longitude BETWEEN -180.00000000 AND 180.00000000)
);

-- =====================================================================
-- TABLE 5: DISASTER_LOCATION
-- =====================================================================
CREATE TABLE DISASTER_LOCATION (
    disaster_id INT NOT NULL REFERENCES DISASTER(disaster_id) ON DELETE CASCADE ON UPDATE CASCADE,
    location_id INT NOT NULL REFERENCES LOCATION(location_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    impact_level VARCHAR(30) NOT NULL CHECK (impact_level IN ('MINOR', 'MODERATE', 'SEVERE', 'CATASTROPHIC')),
    affected_population INT NOT NULL DEFAULT 0 CHECK (affected_population >= 0),
    reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (disaster_id, location_id)
);

-- =====================================================================
-- TABLE 6: RELIEF_CAMP
-- =====================================================================
CREATE TABLE RELIEF_CAMP (
    camp_id SERIAL PRIMARY KEY,
    location_id INT NOT NULL REFERENCES LOCATION(location_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    name VARCHAR(120) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    current_population INT NOT NULL DEFAULT 0 CHECK (current_population >= 0 AND current_population <= capacity),
    manager_id INT NOT NULL REFERENCES "USER"(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'OPERATIONAL' CHECK (status IN ('PREPARING', 'OPERATIONAL', 'FULL', 'CLOSED')),
    established_dt DATE NOT NULL
);

-- =====================================================================
-- TABLE 7: RESOURCE_CATEGORY
-- =====================================================================
CREATE TABLE RESOURCE_CATEGORY (
    resource_id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    resource_name VARCHAR(100) NOT NULL UNIQUE,
    unit VARCHAR(30) NOT NULL,
    description TEXT,
    is_perishable BOOLEAN NOT NULL DEFAULT FALSE
);

-- =====================================================================
-- TABLE 8: WAREHOUSE
-- =====================================================================
CREATE TABLE WAREHOUSE (
    warehouse_id SERIAL PRIMARY KEY,
    location_id INT NOT NULL REFERENCES LOCATION(location_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    warehouse_name VARCHAR(120) NOT NULL,
    manager_id INT NOT NULL REFERENCES "USER"(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    capacity INT NOT NULL CHECK (capacity > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'DECOMMISSIONED'))
);

-- =====================================================================
-- TABLE 9: INVENTORY
-- =====================================================================
CREATE TABLE INVENTORY (
    warehouse_id INT NOT NULL REFERENCES WAREHOUSE(warehouse_id) ON DELETE CASCADE ON UPDATE CASCADE,
    resource_id INT NOT NULL REFERENCES RESOURCE_CATEGORY(resource_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    quantity_available DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (quantity_available >= 0.00),
    minimum_threshold DECIMAL(12, 2) NOT NULL DEFAULT 10.00 CHECK (minimum_threshold >= 0.00),
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (warehouse_id, resource_id)
);

-- =====================================================================
-- TABLE 10: RESOURCE_REQUEST
-- =====================================================================
CREATE TABLE RESOURCE_REQUEST (
    request_id SERIAL PRIMARY KEY,
    camp_id INT NOT NULL REFERENCES RELIEF_CAMP(camp_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    disaster_id INT NOT NULL REFERENCES DISASTER(disaster_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    requested_by INT NOT NULL REFERENCES "USER"(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    need_by TIMESTAMP WITH TIME ZONE NOT NULL,
    priority_score INT NOT NULL DEFAULT 1 CHECK (priority_score BETWEEN 1 AND 100),
    priority_level VARCHAR(20) NOT NULL CHECK (priority_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Allocated', 'In Transit', 'Fulfilled', 'Cancelled', 'Rejected')),
    medical_emergency BOOLEAN NOT NULL DEFAULT FALSE,
    remarks TEXT
);

-- =====================================================================
-- TABLE 11: REQUEST_ITEM
-- =====================================================================
CREATE TABLE REQUEST_ITEM (
    request_id INT NOT NULL REFERENCES RESOURCE_REQUEST(request_id) ON DELETE CASCADE ON UPDATE CASCADE,
    resource_id INT NOT NULL REFERENCES RESOURCE_CATEGORY(resource_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    quantity_requested DECIMAL(12, 2) NOT NULL CHECK (quantity_requested > 0.00),
    PRIMARY KEY (request_id, resource_id)
);

-- =====================================================================
-- TABLE 12: ALLOCATION
-- =====================================================================
CREATE TABLE ALLOCATION (
    allocation_id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES RESOURCE_REQUEST(request_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    allocated_by INT NOT NULL REFERENCES "USER"(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    allocated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'Allocated' CHECK (status IN ('Allocated', 'Dispatched', 'Delivered', 'Cancelled')),
    remark TEXT
);

-- =====================================================================
-- TABLE 13: VEHICLE
-- =====================================================================
CREATE TABLE VEHICLE (
    vehicle_id SERIAL PRIMARY KEY,
    number VARCHAR(30) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    capacity DECIMAL(10, 2) NOT NULL CHECK (capacity > 0.00),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE', 'OUT_OF_SERVICE')),
    current_location_id INT NOT NULL REFERENCES LOCATION(location_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =====================================================================
-- TABLE 14: DELIVERY
-- =====================================================================
CREATE TABLE DELIVERY (
    delivery_id SERIAL PRIMARY KEY,
    allocation_id INT NOT NULL REFERENCES ALLOCATION(allocation_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    vehicle_id INT NOT NULL REFERENCES VEHICLE(vehicle_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    driver_id INT NOT NULL REFERENCES "USER"(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    source_location INT NOT NULL REFERENCES LOCATION(location_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    dest_location INT NOT NULL REFERENCES LOCATION(location_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    dept_time TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_arrival TIMESTAMP WITH TIME ZONE NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Dispatched', 'In Transit', 'Completed', 'Failed'))
);

-- =====================================================================
-- TABLE 15: VOLUNTEER
-- =====================================================================
CREATE TABLE VOLUNTEER (
    volunteer_id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    skills TEXT,
    availability_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' CHECK (availability_status IN ('AVAILABLE', 'ASSIGNED', 'INACTIVE')),
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- OPTIONAL VECTOR STORE TABLE: DISASTER_REPORT_VECTOR (Option A)
-- Stores unstructured SOS incident reports with 1536-dim vector embeddings
-- =====================================================================
CREATE TABLE DISASTER_REPORT_VECTOR (
    report_id SERIAL PRIMARY KEY,
    disaster_id INT REFERENCES DISASTER(disaster_id) ON DELETE SET NULL,
    reporter_contact VARCHAR(100),
    raw_sos_text TEXT NOT NULL,
    detected_urgency VARCHAR(30) DEFAULT 'HIGH',
    embedding vector(1536), -- 1536 dimensions for text-embedding-3-small or Gemini text-embedding-004 (768/1536)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create HNSW index for sub-millisecond vector similarity search
CREATE INDEX IF NOT EXISTS idx_incident_embedding ON DISASTER_REPORT_VECTOR 
USING hnsw (embedding vector_cosine_ops);

-- =====================================================================
-- DEMONSTRATION OF DDL ALTER STATEMENTS
-- =====================================================================
ALTER TABLE "USER" ADD COLUMN last_login TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE RESOURCE_REQUEST ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE NULL;

CREATE INDEX idx_user_role ON "USER" (role_id);
CREATE INDEX idx_disaster_status ON DISASTER (status);
CREATE INDEX idx_request_status_priority ON RESOURCE_REQUEST (status, priority_level);
CREATE INDEX idx_inventory_threshold ON INVENTORY (quantity_available, minimum_threshold);
CREATE INDEX idx_delivery_status ON DELIVERY (status);
