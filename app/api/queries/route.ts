import { NextResponse } from 'next/server';
import { checkDatabaseConnection, query } from '@/lib/dbClient';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const queryId = searchParams.get('id') || '1';

  const dbStatus = await checkDatabaseConnection();

  const queryRegistry: Record<string, {
    title: string;
    category: string;
    concepts: string[];
    sql: string;
    explanation: string;
    mockResult: any[];
  }> = {
    '1': {
      title: 'Multi-Table Requisition Volume by Category',
      category: 'Multi-Table INNER JOIN & Aggregations',
      concepts: ['4-Table INNER JOIN', 'SUM()', 'COUNT()', 'GROUP BY', 'ORDER BY'],
      sql: `SELECT 
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
ORDER BY c.name ASC, total_units_needed DESC;`,
      explanation: 'Joins 4 core entities (Camp, Request, Request Item, Resource Category) to aggregate total requested quantities by item category per camp.',
      mockResult: [
        { relief_camp: 'Madikeri Primary Relief Center', current_population: 1120, supply_category: 'Food & Water', total_requisitions: 1, total_units_needed: '600.00', unit: 'cans' },
        { relief_camp: 'Madikeri Primary Relief Center', current_population: 1120, supply_category: 'Medical Supplies', total_requisitions: 1, total_units_needed: '250.00', unit: 'kits/boxes' },
        { relief_camp: 'Surathkal Coastal Evac Camp', current_population: 1850, supply_category: 'Medical Supplies', total_requisitions: 1, total_units_needed: '100.00', unit: 'kits' },
        { relief_camp: 'Surathkal Coastal Evac Camp', current_population: 1850, supply_category: 'Sanitation', total_requisitions: 1, total_units_needed: '150.00', unit: 'bottles' }
      ]
    },
    '2': {
      title: 'Warehouse Stockpile Depletion Analysis',
      category: 'GROUP BY with HAVING Clause',
      concepts: ['JOIN', 'Conditional Aggregation SUM(CASE...)', 'AVG()', 'HAVING depleted_items > 0'],
      sql: `SELECT 
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
ORDER BY depleted_items_count DESC;`,
      explanation: 'Filters warehouses with the HAVING clause to expose facilities with active supply deficits beneath safety thresholds.',
      mockResult: [
        { warehouse_id: 2, warehouse_name: 'Mangaluru Maritime Supply Depot', warehouse_manager: 'Ananya Sen', total_monitored_items: 6, depleted_items_count: 2, average_stock_units: '1084.17' }
      ]
    },
    '3': {
      title: 'Above-Average Priority Disaster Requests',
      category: 'Correlated Subquery',
      concepts: ['Correlated Subquery', 'WHERE Priority > AVG() per disaster', 'JOIN', 'ORDER BY'],
      sql: `SELECT 
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
ORDER BY rr.priority_score DESC;`,
      explanation: 'Evaluates each request dynamically against the disaster-wide mean priority score using a correlated subquery in the WHERE clause.',
      mockResult: [
        { request_id: 1, camp_name: 'Madikeri Primary Relief Center', disaster_name: 'Flash Floods Kodagu 2026', priority_score: 95, priority_level: 'CRITICAL', status: 'Pending', need_by: '2026-08-11 18:00:00', disaster_avg_priority: '82.5' }
      ]
    },
    '4': {
      title: 'Relief Camps with Zero Pending Requisitions',
      category: 'Scalar Subquery & NOT IN',
      concepts: ['NOT IN (Subquery)', 'DISTINCT', 'LEFT JOIN', 'Integrity Filter'],
      sql: `SELECT 
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
AND c.status = 'OPERATIONAL';`,
      explanation: 'Identifies camps that have all supply lines fulfilled or no open requisitions to allocate aid to camps with urgent needs.',
      mockResult: []
    },
    '5': {
      title: 'Warehouse Stock Ranking by Resource Category',
      category: 'Window Functions & DENSE_RANK()',
      concepts: ['DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...)', 'Window Functions', 'Multi-level Sorting'],
      sql: `SELECT 
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
ORDER BY rc.category, inventory_rank_in_category ASC;`,
      explanation: 'Partitions inventory by category and computes ordinal ranks across warehouses without collapsing rows into groups.',
      mockResult: [
        { category: 'Food & Water', resource_name: 'Clean Packaged Drinking Water (20L)', warehouse_name: 'Bengaluru Apex Strategic Reserve', quantity_available: '5000.00', inventory_rank_in_category: 1 },
        { category: 'Food & Water', resource_name: 'Clean Packaged Drinking Water (20L)', warehouse_name: 'Mangaluru Maritime Supply Depot', quantity_available: '2800.00', inventory_rank_in_category: 2 },
        { category: 'Medical Supplies', resource_name: 'ORS Sachet Bundles', warehouse_name: 'Bengaluru Apex Strategic Reserve', quantity_available: '1200.00', inventory_rank_in_category: 1 },
        { category: 'Medical Supplies', resource_name: 'ORS Sachet Bundles', warehouse_name: 'Mangaluru Maritime Supply Depot', quantity_available: '750.00', inventory_rank_in_category: 2 }
      ]
    },
    '6': {
      title: 'Full-Text Natural Language SOS Distress Search',
      category: 'Full-Text Indexing & Relevance Ranking',
      concepts: ['FULLTEXT Index', 'MATCH(...) AGAINST(...)', 'Natural Language Mode', 'BM25 / Cosine Weighting'],
      sql: `SELECT 
    request_id,
    camp_id,
    priority_level,
    status,
    remarks,
    ROUND(MATCH(remarks) AGAINST('outbreak dehydration fever hospital' IN NATURAL LANGUAGE MODE), 4) AS relevance_score
FROM RESOURCE_REQUEST
WHERE MATCH(remarks) AGAINST('outbreak dehydration fever hospital' IN NATURAL LANGUAGE MODE) > 0
ORDER BY relevance_score DESC;`,
      explanation: 'Uses MySQL FULLTEXT index on the remarks column to rapidly locate urgent medical emergency dispatches by token relevance.',
      mockResult: [
        { request_id: 1, camp_id: 1, priority_level: 'CRITICAL', status: 'Pending', remarks: 'Urgent outbreak of waterborne gastroenteritis among 60 children. Needs immediate ORS and IV kits.', relevance_score: '0.8421' }
      ]
    }
  };

  const selectedQuery = queryRegistry[queryId] || queryRegistry['1'];

  if (dbStatus.connected) {
    try {
      const res = await query(selectedQuery.sql);
      return NextResponse.json({
        success: true,
        source: 'MYSQL_LIVE',
        queryId,
        details: selectedQuery,
        result: res.rows
      });
    } catch (e: any) {
      console.warn('MySQL query error, using formatted result:', e.message);
    }
  }

  return NextResponse.json({
    success: true,
    source: 'IN_MEMORY_PRECOMPUTED',
    queryId,
    details: selectedQuery,
    result: selectedQuery.mockResult,
    databaseStatus: dbStatus
  });
}
