-- =====================================================================
-- PES UNIVERSITY - DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
-- DBMS EXPERIENTIAL LEARNING - LEVEL 3 PROJECT
-- PROJECT: DISASTER RELIEF RESOURCE MANAGEMENT SYSTEM (DRRMS)
-- FILE: 04_complex_queries.sql (Demonstration of DML & Complex Queries)
-- =====================================================================

USE disaster_relief_db;

-- =====================================================================
-- QUERY 1: MULTI-TABLE INNER JOIN & AGGREGATIONS
-- Goal: Calculate total supply volume requested per relief camp, grouped by category
-- Features: 4-table JOIN (RELIEF_CAMP, RESOURCE_REQUEST, REQUEST_ITEM, RESOURCE_CATEGORY),
--           SUM(), COUNT(), GROUP BY, ORDER BY
-- =====================================================================
SELECT 
    c.name AS relief_camp,
    c.current_population,
    rc.category AS supply_category,
    COUNT(DISTINCT rr.request_id) AS total_requisitions,
    SUM(ri.quantity_requested) AS total_units_needed,
    rc.unit
FROM RELIEF_CAMP c
JOIN RESOURCE_REQUEST rr ON c.camp_id = rr.camp_id
JOIN REQUEST_ITEM ri ON rr.request_id = ri.request_id
JOIN RESOURCE_CATEGORY rc ON ri.resource_id = rc.resource_id
GROUP BY c.camp_id, c.name, c.current_population, rc.category, rc.unit
ORDER BY c.name ASC, total_units_needed DESC;

-- =====================================================================
-- QUERY 2: GROUP BY WITH HAVING CLAUSE
-- Goal: Identify warehouses holding critically low stock across multiple items
-- Features: JOIN, COUNT(), HAVING filter (deficit count >= 1), ORDER BY
-- =====================================================================
SELECT 
    w.warehouse_id,
    w.warehouse_name,
    u.fullname AS warehouse_manager,
    COUNT(i.resource_id) AS total_monitored_items,
    SUM(CASE WHEN i.quantity_available < i.minimum_threshold THEN 1 ELSE 0 END) AS depleted_items_count,
    ROUND(AVG(i.quantity_available), 2) AS average_stock_units
FROM WAREHOUSE w
JOIN INVENTORY i ON w.warehouse_id = i.warehouse_id
JOIN USER u ON w.manager_id = u.user_id
GROUP BY w.warehouse_id, w.warehouse_name, u.fullname
HAVING depleted_items_count > 0
ORDER BY depleted_items_count DESC;

-- =====================================================================
-- QUERY 3: CORRELATED SUBQUERY
-- Goal: Find all resource requests whose priority score is ABOVE the average
--       priority score of all requests for that specific disaster
-- Features: Correlated Subquery referencing outer disaster_id, WHERE clause
-- =====================================================================
SELECT 
    rr.request_id,
    c.name AS camp_name,
    d.disaster_name,
    rr.priority_score,
    rr.priority_level,
    rr.status,
    rr.need_by,
    ROUND((
        SELECT AVG(inner_rr.priority_score) 
        FROM RESOURCE_REQUEST inner_rr 
        WHERE inner_rr.disaster_id = rr.disaster_id
    ), 1) AS disaster_avg_priority
FROM RESOURCE_REQUEST rr
JOIN RELIEF_CAMP c ON rr.camp_id = c.camp_id
JOIN DISASTER d ON rr.disaster_id = d.disaster_id
WHERE rr.priority_score > (
    SELECT AVG(inner_rr.priority_score) 
    FROM RESOURCE_REQUEST inner_rr 
    WHERE inner_rr.disaster_id = rr.disaster_id
)
ORDER BY rr.priority_score DESC;

-- =====================================================================
-- QUERY 4: SCALAR SUBQUERY & IN/EXISTS FILTER
-- Goal: Identify all active relief camps that currently have ZERO pending requisitions
-- Features: NOT IN / NOT EXISTS subquery, LEFT JOIN
-- =====================================================================
SELECT 
    c.camp_id,
    c.name AS camp_name,
    c.capacity,
    c.current_population,
    l.address AS location_address
FROM RELIEF_CAMP c
JOIN LOCATION l ON c.location_id = l.location_id
WHERE c.camp_id NOT IN (
    SELECT DISTINCT camp_id 
    FROM RESOURCE_REQUEST 
    WHERE status IN ('Pending', 'Approved')
)
AND c.status = 'OPERATIONAL';

-- =====================================================================
-- QUERY 5: ADVANCED ANALYTICAL QUERY (WINDOW FUNCTION & RANK)
-- Goal: Rank warehouses by their supply fulfillment capacity per resource category
-- Features: DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...), CTE / Subquery
-- =====================================================================
SELECT 
    rc.category,
    rc.resource_name,
    w.warehouse_name,
    i.quantity_available,
    DENSE_RANK() OVER (
        PARTITION BY rc.category 
        ORDER BY i.quantity_available DESC
    ) AS inventory_rank_in_category
FROM INVENTORY i
JOIN RESOURCE_CATEGORY rc ON i.resource_id = rc.resource_id
JOIN WAREHOUSE w ON i.warehouse_id = w.warehouse_id
ORDER BY rc.category, inventory_rank_in_category ASC;

-- =====================================================================
-- QUERY 6: FULL-TEXT NATURAL LANGUAGE SEARCH
-- Goal: Fast triage search across emergency requests matching medical or flood distress
-- Features: MATCH(...) AGAINST(... IN NATURAL LANGUAGE MODE)
-- =====================================================================
SELECT 
    request_id,
    camp_id,
    priority_level,
    status,
    remarks,
    MATCH(remarks) AGAINST('outbreak dehydration fever hospital' IN NATURAL LANGUAGE MODE) AS relevance_score
FROM RESOURCE_REQUEST
WHERE MATCH(remarks) AGAINST('outbreak dehydration fever hospital' IN NATURAL LANGUAGE MODE) > 0
ORDER BY relevance_score DESC;

-- =====================================================================
-- QUERY 7: DML TRANSACTIONS DEMONSTRATION (INSERT, UPDATE, DELETE)
-- =====================================================================

-- DML 1: Insert new high-priority requisition
INSERT INTO RESOURCE_REQUEST (
    camp_id, disaster_id, requested_by, need_by, medical_emergency, remarks
) VALUES (
    1, 1, 3, DATE_ADD(NOW(), INTERVAL 8 HOUR), TRUE, 
    'Urgent pediatric emergency: dehydration and cholera symptoms reported in 25 refugees.'
);

-- DML 2: Update camp population after rescue influx
UPDATE RELIEF_CAMP 
SET current_population = current_population + 50
WHERE camp_id = 1;

-- DML 3: Soft-update / status update for vehicle maintenance
UPDATE VEHICLE 
SET status = 'MAINTENANCE' 
WHERE vehicle_id = 2;

