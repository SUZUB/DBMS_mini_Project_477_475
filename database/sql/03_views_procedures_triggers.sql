-- =====================================================================
-- PES UNIVERSITY - DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
-- DBMS EXPERIENTIAL LEARNING - LEVEL 3 PROJECT
-- PROJECT: DISASTER RELIEF RESOURCE MANAGEMENT SYSTEM (DRRMS)
-- FILE: 03_views_procedures_triggers.sql (MySQL 8.0+ Dialect)
-- =====================================================================

USE disaster_relief_db;

-- =====================================================================
-- SECTION 1: DATABASE VIEWS (ADVANCED FEATURE 1)
-- Provides encapsulated, high-performance read abstractions for UI
-- =====================================================================

-- VIEW 1: vw_camp_occupancy_rates
-- Calculates real-time occupancy percentages, spare capacity, and urgency status
DROP VIEW IF EXISTS vw_camp_occupancy_rates;
CREATE VIEW vw_camp_occupancy_rates AS
SELECT 
    c.camp_id,
    c.name AS camp_name,
    l.name AS location_name,
    l.address AS location_address,
    c.capacity,
    c.current_population,
    (c.capacity - c.current_population) AS available_capacity,
    ROUND((c.current_population / c.capacity) * 100, 2) AS occupancy_percentage,
    u.fullname AS manager_name,
    u.phone AS manager_phone,
    c.status AS camp_status,
    CASE 
        WHEN (c.current_population / c.capacity) >= 1.00 THEN 'OVERCROWDED'
        WHEN (c.current_population / c.capacity) >= 0.85 THEN 'NEAR_CAPACITY'
        WHEN (c.current_population / c.capacity) >= 0.50 THEN 'MODERATE'
        ELSE 'SPACIOUS'
    END AS crowd_density_indicator
FROM RELIEF_CAMP c
JOIN LOCATION l ON c.location_id = l.location_id
JOIN USER u ON c.manager_id = u.user_id;

-- VIEW 2: vw_critical_inventory_shortages
-- Identifies warehouse stockpiles that have breached safety thresholds
DROP VIEW IF EXISTS vw_critical_inventory_shortages;
CREATE VIEW vw_critical_inventory_shortages AS
SELECT 
    w.warehouse_id,
    w.warehouse_name,
    rc.resource_id,
    rc.resource_name,
    rc.category,
    rc.unit,
    i.quantity_available,
    i.minimum_threshold,
    (i.minimum_threshold - i.quantity_available) AS deficit_units,
    ROUND(((i.quantity_available / NULLIF(i.minimum_threshold, 0)) * 100), 1) AS stock_health_percent,
    i.last_updated,
    u.fullname AS warehouse_manager,
    u.phone AS manager_contact
FROM INVENTORY i
JOIN WAREHOUSE w ON i.warehouse_id = w.warehouse_id
JOIN RESOURCE_CATEGORY rc ON i.resource_id = rc.resource_id
JOIN USER u ON w.manager_id = u.user_id
WHERE i.quantity_available <= i.minimum_threshold;

-- VIEW 3: vw_active_disaster_impact_summary
-- Aggregates affected populations, operational camps, and active requisitions per disaster
DROP VIEW IF EXISTS vw_active_disaster_impact_summary;
CREATE VIEW vw_active_disaster_impact_summary AS
SELECT 
    d.disaster_id,
    d.disaster_name,
    d.disaster_type,
    d.severity,
    d.status,
    d.started_at,
    COALESCE(SUM(dl.affected_population), 0) AS total_affected_population,
    COUNT(DISTINCT dl.location_id) AS impacted_zones_count,
    COUNT(DISTINCT rr.request_id) AS total_resource_requests,
    SUM(CASE WHEN rr.status = 'Pending' THEN 1 ELSE 0 END) AS pending_requests_count,
    SUM(CASE WHEN rr.medical_emergency = TRUE THEN 1 ELSE 0 END) AS medical_emergencies_count
FROM DISASTER d
LEFT JOIN DISASTER_LOCATION dl ON d.disaster_id = dl.disaster_id
LEFT JOIN RESOURCE_REQUEST rr ON d.disaster_id = rr.disaster_id
GROUP BY d.disaster_id, d.disaster_name, d.disaster_type, d.severity, d.status, d.started_at;

-- VIEW 4: vw_fleet_dispatch_tracking
-- Complete logistics overview joining deliveries, vehicles, drivers, and allocations
DROP VIEW IF EXISTS vw_fleet_dispatch_tracking;
CREATE VIEW vw_fleet_dispatch_tracking AS
SELECT 
    del.delivery_id,
    del.status AS delivery_status,
    v.number AS vehicle_number,
    v.type AS vehicle_type,
    driver.fullname AS driver_name,
    driver.phone AS driver_phone,
    src.name AS origin_hub,
    dest.name AS destination_zone,
    del.dept_time,
    del.expected_arrival,
    del.actual_arrival,
    al.allocation_id,
    rr.request_id,
    camp.name AS target_camp_name
FROM DELIVERY del
JOIN VEHICLE v ON del.vehicle_id = v.vehicle_id
JOIN USER driver ON del.driver_id = driver.user_id
JOIN LOCATION src ON del.source_location = src.location_id
JOIN LOCATION dest ON del.dest_location = dest.location_id
JOIN ALLOCATION al ON del.allocation_id = al.allocation_id
JOIN RESOURCE_REQUEST rr ON al.request_id = rr.request_id
JOIN RELIEF_CAMP camp ON rr.camp_id = camp.camp_id;

-- =====================================================================
-- SECTION 2: STORED FUNCTIONS (ADVANCED FEATURE 2)
-- Business logic calculations executed inside SQL engine
-- =====================================================================

DROP FUNCTION IF EXISTS fn_calculate_request_priority;
DELIMITER //
CREATE FUNCTION fn_calculate_request_priority(
    p_medical_emergency BOOLEAN,
    p_affected_pop INT,
    p_need_by DATETIME
) 
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_score INT DEFAULT 10;
    DECLARE v_hours_remaining INT;

    -- Factor 1: Medical Emergency adds 50 points directly
    IF p_medical_emergency = TRUE THEN
        SET v_score = v_score + 50;
    END IF;

    -- Factor 2: Affected population density scaling (up to 25 points)
    IF p_affected_pop > 100000 THEN
        SET v_score = v_score + 25;
    ELSEIF p_affected_pop > 20000 THEN
        SET v_score = v_score + 15;
    ELSEIF p_affected_pop > 1000 THEN
        SET v_score = v_score + 8;
    END IF;

    -- Factor 3: Time urgency countdown (up to 15 points if needed within 12 hours)
    SET v_hours_remaining = TIMESTAMPDIFF(HOUR, NOW(), p_need_by);
    IF v_hours_remaining <= 6 THEN
        SET v_score = v_score + 15;
    ELSEIF v_hours_remaining <= 24 THEN
        SET v_score = v_score + 10;
    ELSEIF v_hours_remaining <= 48 THEN
        SET v_score = v_score + 5;
    END IF;

    -- Cap priority score between 1 and 100
    IF v_score > 100 THEN
        SET v_score = 100;
    END IF;

    RETURN v_score;
END //
DELIMITER ;

-- =====================================================================
-- SECTION 3: STORED PROCEDURES & ATOMIC TRANSACTIONS (ADVANCED FEATURE 3)
-- Guarantees ACID transactional consistency during resource allocations
-- =====================================================================

-- PROCEDURE 1: sp_allocate_supplies_atomic
-- Performs supply allocation with strict rollback if inventory is insufficient
DROP PROCEDURE IF EXISTS sp_allocate_supplies_atomic;
DELIMITER //
CREATE PROCEDURE sp_allocate_supplies_atomic(
    IN p_request_id INT,
    IN p_warehouse_id INT,
    IN p_allocated_by INT,
    IN p_remark TEXT,
    OUT p_allocation_id INT,
    OUT p_status_code VARCHAR(50),
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_req_status VARCHAR(30);
    DECLARE v_insufficient_stock BOOLEAN DEFAULT FALSE;
    DECLARE v_resource_id INT;
    DECLARE v_qty_needed DECIMAL(12, 2);
    DECLARE v_qty_available DECIMAL(12, 2);
    DECLARE v_done INT DEFAULT FALSE;

    -- Cursor to iterate over requested line items
    DECLARE item_cursor CURSOR FOR 
        SELECT resource_id, quantity_requested 
        FROM REQUEST_ITEM 
        WHERE request_id = p_request_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    -- Exception handler to rollback transaction on SQL error
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_allocation_id = NULL;
        SET p_status_code = 'TRANSACTION_ERROR';
        SET p_status_message = 'Internal error during allocation. Transaction rolled back.';
    END;

    -- Check if request exists and is in 'Pending' status
    SELECT status INTO v_req_status 
    FROM RESOURCE_REQUEST 
    WHERE request_id = p_request_id;

    IF v_req_status IS NULL THEN
        SET p_allocation_id = NULL;
        SET p_status_code = 'NOT_FOUND';
        SET p_status_message = 'Resource Request ID not found.';
        LEAVE proc_label;
    END IF;

    IF v_req_status NOT IN ('Pending', 'Approved') THEN
        SET p_allocation_id = NULL;
        SET p_status_code = 'INVALID_STATUS';
        SET p_status_message = CONCAT('Request cannot be allocated because current status is ', v_req_status);
        LEAVE proc_label;
    END IF;

    -- START ACID TRANSACTION
    START TRANSACTION;

    -- Verify inventory availability for every line-item in request
    OPEN item_cursor;
    check_loop: LOOP
        FETCH item_cursor INTO v_resource_id, v_qty_needed;
        IF v_done THEN
            LEAVE check_loop;
        END IF;

        -- Check warehouse stock
        SELECT COALESCE(quantity_available, 0.00) INTO v_qty_available
        FROM INVENTORY 
        WHERE warehouse_id = p_warehouse_id AND resource_id = v_resource_id
        FOR UPDATE; -- Row-level lock to prevent race conditions

        IF v_qty_available < v_qty_needed THEN
            SET v_insufficient_stock = TRUE;
            LEAVE check_loop;
        END IF;
    END LOOP;
    CLOSE item_cursor;

    -- If stock is inadequate, abort and rollback
    IF v_insufficient_stock = TRUE THEN
        ROLLBACK;
        SET p_allocation_id = NULL;
        SET p_status_code = 'INSUFFICIENT_STOCK';
        SET p_status_message = 'Warehouse lacks adequate inventory for one or more requested items.';
        LEAVE proc_label;
    END IF;

    -- Stock is adequate: Deduct inventory for all items
    SET v_done = FALSE;
    OPEN item_cursor;
    deduct_loop: LOOP
        FETCH item_cursor INTO v_resource_id, v_qty_needed;
        IF v_done THEN
            LEAVE deduct_loop;
        END IF;

        UPDATE INVENTORY 
        SET quantity_available = quantity_available - v_qty_needed,
            last_updated = CURRENT_TIMESTAMP
        WHERE warehouse_id = p_warehouse_id AND resource_id = v_resource_id;
    END LOOP;
    CLOSE item_cursor;

    -- Create ALLOCATION record
    INSERT INTO ALLOCATION (request_id, allocated_by, allocated_at, status, remark)
    VALUES (p_request_id, p_allocated_by, CURRENT_TIMESTAMP, 'Allocated', p_remark);
    
    SET p_allocation_id = LAST_INSERT_ID();

    -- Update RESOURCE_REQUEST status to 'Allocated'
    UPDATE RESOURCE_REQUEST
    SET status = 'Allocated',
        approved_at = CURRENT_TIMESTAMP
    WHERE request_id = p_request_id;

    -- COMMIT TRANSACTION
    COMMIT;

    SET p_status_code = 'SUCCESS';
    SET p_status_message = 'Supplies allocated successfully and inventory deducted.';
END //
DELIMITER ;

-- PROCEDURE 2: sp_dispatch_delivery
-- Dispatches an allocated supply with vehicle assignment and driver validation
DROP PROCEDURE IF EXISTS sp_dispatch_delivery;
DELIMITER //
CREATE PROCEDURE sp_dispatch_delivery(
    IN p_allocation_id INT,
    IN p_vehicle_id INT,
    IN p_driver_id INT,
    IN p_source_location INT,
    IN p_dest_location INT,
    IN p_expected_hours INT,
    OUT p_delivery_id INT,
    OUT p_status_code VARCHAR(50)
)
BEGIN
    DECLARE v_veh_status VARCHAR(30);

    -- Check vehicle availability
    SELECT status INTO v_veh_status FROM VEHICLE WHERE vehicle_id = p_vehicle_id;

    IF v_veh_status <> 'AVAILABLE' THEN
        SET p_delivery_id = NULL;
        SET p_status_code = 'VEHICLE_UNAVAILABLE';
    ELSE
        START TRANSACTION;

        -- Insert DELIVERY entry
        INSERT INTO DELIVERY (
            allocation_id, vehicle_id, driver_id, source_location, dest_location,
            dept_time, expected_arrival, status
        ) VALUES (
            p_allocation_id, p_vehicle_id, p_driver_id, p_source_location, p_dest_location,
            NOW(), DATE_ADD(NOW(), INTERVAL p_expected_hours HOUR), 'Dispatched'
        );
        SET p_delivery_id = LAST_INSERT_ID();

        -- Mark vehicle as IN_TRANSIT
        UPDATE VEHICLE SET status = 'IN_TRANSIT' WHERE vehicle_id = p_vehicle_id;

        -- Update Allocation & Resource Request status
        UPDATE ALLOCATION SET status = 'Dispatched' WHERE allocation_id = p_allocation_id;
        
        UPDATE RESOURCE_REQUEST rr
        JOIN ALLOCATION al ON rr.request_id = al.request_id
        SET rr.status = 'In Transit'
        WHERE al.allocation_id = p_allocation_id;

        COMMIT;
        SET p_status_code = 'SUCCESS';
    END IF;
END //
DELIMITER ;

-- =====================================================================
-- SECTION 4: DATABASE TRIGGERS (ADVANCED FEATURE 4)
-- Enforces domain constraints and automated operational side-effects
-- =====================================================================

-- TRIGGER 1: trg_check_camp_capacity_before_insert_or_update
-- Prevents camp overcapacity / invalid population counts
DROP TRIGGER IF EXISTS trg_camp_population_check_bi;
DELIMITER //
CREATE TRIGGER trg_camp_population_check_bi
BEFORE INSERT ON RELIEF_CAMP
FOR EACH ROW
BEGIN
    IF NEW.current_population > NEW.capacity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Violation: Current population cannot exceed camp maximum capacity.';
    END IF;
    IF NEW.current_population < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Violation: Current population cannot be negative.';
    END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_camp_population_check_bu;
DELIMITER //
CREATE TRIGGER trg_camp_population_check_bu
BEFORE UPDATE ON RELIEF_CAMP
FOR EACH ROW
BEGIN
    IF NEW.current_population > NEW.capacity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Violation: Current population cannot exceed camp maximum capacity.';
    END IF;
    -- Automatically set status to FULL if population reaches capacity
    IF NEW.current_population >= NEW.capacity AND NEW.status = 'OPERATIONAL' THEN
        SET NEW.status = 'FULL';
    ELSEIF NEW.current_population < NEW.capacity AND NEW.status = 'FULL' THEN
        SET NEW.status = 'OPERATIONAL';
    END IF;
END //
DELIMITER ;

-- TRIGGER 2: trg_after_delivery_completed
-- When a delivery status changes to 'Completed', automatically:
-- a) Free the vehicle and update its current location to the destination
-- b) Update the request status to 'Fulfilled'
DROP TRIGGER IF EXISTS trg_after_delivery_completed;
DELIMITER //
CREATE TRIGGER trg_after_delivery_completed
AFTER UPDATE ON DELIVERY
FOR EACH ROW
BEGIN
    IF NEW.status = 'Completed' AND OLD.status <> 'Completed' THEN
        -- Set vehicle back to AVAILABLE and update its location to destination
        UPDATE VEHICLE 
        SET status = 'AVAILABLE',
            current_location_id = NEW.dest_location
        WHERE vehicle_id = NEW.vehicle_id;

        -- Update allocation status
        UPDATE ALLOCATION 
        SET status = 'Delivered'
        WHERE allocation_id = NEW.allocation_id;

        -- Update resource request status
        UPDATE RESOURCE_REQUEST rr
        JOIN ALLOCATION al ON rr.request_id = al.request_id
        SET rr.status = 'Fulfilled'
        WHERE al.allocation_id = NEW.allocation_id;
    END IF;
END //
DELIMITER ;

-- TRIGGER 3: trg_auto_compute_priority_before_insert
-- Automatically calculates priority_score and priority_level on resource requests
DROP TRIGGER IF EXISTS trg_auto_compute_priority_bi;
DELIMITER //
CREATE TRIGGER trg_auto_compute_priority_bi
BEFORE INSERT ON RESOURCE_REQUEST
FOR EACH ROW
BEGIN
    DECLARE v_pop INT DEFAULT 0;

    -- Retrieve affected population from disaster location if available
    SELECT COALESCE(SUM(affected_population), 1000) INTO v_pop
    FROM DISASTER_LOCATION
    WHERE disaster_id = NEW.disaster_id;

    -- Calculate priority score using stored function
    SET NEW.priority_score = fn_calculate_request_priority(
        NEW.medical_emergency,
        v_pop,
        NEW.need_by
    );

    -- Assign priority level based on computed score
    IF NEW.priority_score >= 80 THEN
        SET NEW.priority_level = 'CRITICAL';
    ELSEIF NEW.priority_score >= 60 THEN
        SET NEW.priority_level = 'HIGH';
    ELSEIF NEW.priority_score >= 35 THEN
        SET NEW.priority_level = 'MEDIUM';
    ELSE
        SET NEW.priority_level = 'LOW';
    END IF;
END //
DELIMITER ;

-- =====================================================================
-- SECTION 5: FULL-TEXT SEARCH INDEXES (ADVANCED FEATURE 5)
-- Enables keyword and natural language search across disaster logs
-- =====================================================================
ALTER TABLE DISASTER ADD FULLTEXT idx_ft_disaster_desc (disaster_name, description);
ALTER TABLE RESOURCE_REQUEST ADD FULLTEXT idx_ft_request_remarks (remarks);

