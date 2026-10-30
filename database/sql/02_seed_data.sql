-- =====================================================================
-- SEED DATA FOR DISASTER RELIEF RESOURCE MANAGEMENT SYSTEM (DRRMS)
-- Compatible with MySQL and PostgreSQL
-- =====================================================================

-- 1. ROLES
INSERT INTO ROLE (role_id, role_name, descp) VALUES
(1, 'ADMIN', 'Master administrator with full system orchestration privilege'),
(2, 'DISPATCHER', 'Logistics coordinator managing supply allocation and fleet dispatch'),
(3, 'CAMP_MANAGER', 'Ground coordinator managing relief camp populations and requisitions'),
(4, 'VOLUNTEER', 'Field relief worker updating operational status and delivering aid')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 2. USERS (passwords hashed using bcrypt for 'Password@123')
INSERT INTO USER (user_id, role_id, fullname, email, password_hash, phone, is_active) VALUES
(1, 1, 'Dr. Rajesh Sharma', 'admin@drrms.org', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.qH0vJ2mQ6wI2u5T8v9F7.qE5f1uR0iK', '+91-9876543210', TRUE),
(2, 2, 'Ananya Sen', 'dispatcher@drrms.org', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.qH0vJ2mQ6wI2u5T8v9F7.qE5f1uR0iK', '+91-9876543211', TRUE),
(3, 3, 'Vikram Rathore', 'campmgr.north@drrms.org', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.qH0vJ2mQ6wI2u5T8v9F7.qE5f1uR0iK', '+91-9876543212', TRUE),
(4, 3, 'Priya Kulkarni', 'campmgr.coastal@drrms.org', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.qH0vJ2mQ6wI2u5T8v9F7.qE5f1uR0iK', '+91-9876543213', TRUE),
(5, 2, 'Mohan Das (Driver)', 'driver.mohan@drrms.org', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.qH0vJ2mQ6wI2u5T8v9F7.qE5f1uR0iK', '+91-9876543214', TRUE)
ON DUPLICATE KEY UPDATE fullname = VALUES(fullname);

-- 3. LOCATIONS
INSERT INTO LOCATION (location_id, name, type, address, latitude, longitude) VALUES
(1, 'Central Warehouse Hub Bengaluru', 'WAREHOUSE', 'Sector 4, Peenya Industrial Area, Bengaluru', 13.02850000, 77.51970000),
(2, 'North Coast Warehouse Mangaluru', 'WAREHOUSE', 'Baikampady Industrial Estate, Mangaluru', 12.94630000, 74.82110000),
(3, 'Cauvery Basin Flood Zone', 'DISASTER_ZONE', 'Kodagu River Basin, Madikeri', 12.42440000, 75.73820000),
(4, 'Mangaluru Cyclone Impact Zone', 'DISASTER_ZONE', 'Panambur Coastal Belt, Dakshina Kannada', 12.95100000, 74.80200000),
(5, 'Madikeri Govt College Relief Camp', 'RELIEF_CAMP', 'Field Marshal KM Cariappa College, Madikeri', 12.42100000, 75.73400000),
(6, 'Surathkal High School Camp', 'RELIEF_CAMP', 'National Highway 66, Surathkal', 13.01100000, 74.79400000)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 4. DISASTERS
INSERT INTO DISASTER (disaster_id, disaster_name, disaster_type, severity, started_at, ended_at, status, description, created_by) VALUES
(1, 'Flash Floods Kodagu 2026', 'Flood', 'HIGH', '2026-08-10 04:00:00', NULL, 'ACTIVE', 'Severe rainfall triggered widespread mudslides and river flooding across Kodagu district.', 1),
(2, 'Cyclone Sagar Coastal Surge', 'Cyclone', 'CRITICAL', '2026-09-02 11:30:00', NULL, 'ACTIVE', 'Category 4 cyclone causing coastal embankment breaches and power grid collapse.', 1)
ON DUPLICATE KEY UPDATE disaster_name = VALUES(disaster_name);

-- 5. DISASTER_LOCATION
INSERT INTO DISASTER_LOCATION (disaster_id, location_id, impact_level, affected_population, reported_at) VALUES
(1, 3, 'SEVERE', 45000, '2026-08-10 06:00:00'),
(2, 4, 'CATASTROPHIC', 120000, '2026-09-02 12:00:00')
ON DUPLICATE KEY UPDATE impact_level = VALUES(impact_level);

-- 6. RELIEF CAMPS
INSERT INTO RELIEF_CAMP (camp_id, location_id, name, capacity, current_population, manager_id, status, established_dt) VALUES
(1, 5, 'Madikeri Primary Relief Center', 1500, 1120, 3, 'OPERATIONAL', '2026-08-11'),
(2, 6, 'Surathkal Coastal Evac Camp', 2000, 1850, 4, 'OPERATIONAL', '2026-09-03')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 7. RESOURCE CATEGORIES
INSERT INTO RESOURCE_CATEGORY (resource_id, category, resource_name, unit, description, is_perishable) VALUES
(1, 'Medical Supplies', 'Trauma First Aid Kit', 'kits', 'Comprehensive surgical dressing, sterile gauze, tourniquets, analgesics', FALSE),
(2, 'Medical Supplies', 'ORS Sachet Bundles', 'boxes', 'Oral rehydration salts packets for dehydration prevention (100 per box)', TRUE),
(3, 'Food & Water', 'Clean Packaged Drinking Water (20L)', 'cans', 'Mineral-filtered emergency water supply canisters', TRUE),
(4, 'Food & Water', 'High Energy Ration Biscuits', 'cartons', 'Fortified emergency meal replacement rations (50 packs per carton)', TRUE),
(5, 'Shelter & Bedding', 'Waterproof Family Tent (6-Person)', 'units', 'Heavy-duty poly-canvas all-weather emergency shelters', FALSE),
(6, 'Sanitation', 'Chlorine Water Purification Tablets', 'bottles', 'Effervescent tablets purifying 1000L water per bottle', FALSE)
ON DUPLICATE KEY UPDATE resource_name = VALUES(resource_name);

-- 8. WAREHOUSES
INSERT INTO WAREHOUSE (warehouse_id, location_id, warehouse_name, manager_id, capacity, status) VALUES
(1, 1, 'Bengaluru Apex Strategic Reserve', 1, 100000, 'ACTIVE'),
(2, 2, 'Mangaluru Maritime Supply Depot', 2, 65000, 'ACTIVE')
ON DUPLICATE KEY UPDATE warehouse_name = VALUES(warehouse_name);

-- 9. INVENTORY
INSERT INTO INVENTORY (warehouse_id, resource_id, quantity_available, minimum_threshold) VALUES
(1, 1, 850.00, 100.00),
(1, 2, 1200.00, 150.00),
(1, 3, 5000.00, 500.00),
(1, 4, 3400.00, 400.00),
(1, 5, 450.00, 50.00),
(1, 6, 2000.00, 250.00),
(2, 1, 400.00, 80.00),
(2, 2, 750.00, 100.00),
(2, 3, 2800.00, 300.00),
(2, 4, 1500.00, 200.00),
(2, 5, 200.00, 40.00),
(2, 6, 900.00, 150.00)
ON DUPLICATE KEY UPDATE quantity_available = VALUES(quantity_available);

-- 10. VEHICLES
INSERT INTO VEHICLE (vehicle_id, number, type, capacity, status, current_location_id) VALUES
(1, 'KA-01-EA-1001', 'Heavy Logistics Truck', 15.00, 'AVAILABLE', 1),
(2, 'KA-01-EA-1002', 'High-Clearance 4x4 Van', 3.50, 'AVAILABLE', 1),
(3, 'KA-19-TR-4020', 'All-Terrain Amphibious Truck', 8.00, 'AVAILABLE', 2),
(4, 'KA-19-AM-9901', 'Emergency Medical Ambulance', 1.50, 'AVAILABLE', 2)
ON DUPLICATE KEY UPDATE number = VALUES(number);

-- 11. VOLUNTEERS
INSERT INTO VOLUNTEER (volunteer_id, full_name, phone, email, skills, availability_status) VALUES
(1, 'Ramesh Hegde', '+91-9448123456', 'ramesh.hegde@volunteers.in', 'Swift Water Rescue, First Aid Certified', 'AVAILABLE'),
(2, 'Deepa Narayan', '+91-9448123457', 'deepa.narayan@volunteers.in', 'Emergency Nursing, Triage Assessment', 'AVAILABLE'),
(3, 'Karthik Rao', '+91-9448123458', 'karthik.rao@volunteers.in', 'Heavy Vehicle Transport, Fleet Coordination', 'ASSIGNED')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- 12. RESOURCE REQUESTS
INSERT INTO RESOURCE_REQUEST (request_id, camp_id, disaster_id, requested_by, requested_at, need_by, priority_score, priority_level, status, medical_emergency, remarks) VALUES
(1, 1, 1, 3, '2026-08-11 08:30:00', '2026-08-11 18:00:00', 95, 'CRITICAL', 'Pending', TRUE, 'Urgent outbreak of waterborne gastroenteritis among 60 children. Needs immediate ORS and IV kits.'),
(2, 1, 1, 3, '2026-08-11 10:00:00', '2026-08-12 12:00:00', 70, 'HIGH', 'Approved', FALSE, 'Fresh drinking water supplies running critically low after river sedimentation.'),
(3, 2, 2, 4, '2026-09-03 14:00:00', '2026-09-04 08:00:00', 85, 'CRITICAL', 'Pending', TRUE, 'Multiple flood trauma injuries requiring sterile bandages and pain relief.')
ON DUPLICATE KEY UPDATE remarks = VALUES(remarks);

-- 13. REQUEST ITEMS
INSERT INTO REQUEST_ITEM (request_id, resource_id, quantity_requested) VALUES
(1, 1, 50.00),
(1, 2, 200.00),
(2, 3, 600.00),
(3, 1, 100.00),
(3, 6, 150.00)
ON DUPLICATE KEY UPDATE quantity_requested = VALUES(quantity_requested);
