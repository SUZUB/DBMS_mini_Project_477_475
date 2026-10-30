import { NextResponse } from 'next/server';
import { checkDatabaseConnection, query } from '@/lib/dbClient';
import { mockData } from '@/lib/mockDb';

export async function GET() {
  const dbStatus = await checkDatabaseConnection();

  if (dbStatus.connected) {
    try {
      const shortagesRes = await query(`SELECT * FROM vw_critical_inventory_shortages`);
      const allInventoryRes = await query(`
        SELECT 
          w.warehouse_id,
          w.warehouse_name,
          rc.resource_id,
          rc.resource_name,
          rc.category,
          rc.unit,
          i.quantity_available,
          i.minimum_threshold,
          GREATEST(0, (i.minimum_threshold - i.quantity_available)) AS deficit,
          i.last_updated
        FROM INVENTORY i
        JOIN WAREHOUSE w ON i.warehouse_id = w.warehouse_id
        JOIN RESOURCE_CATEGORY rc ON i.resource_id = rc.resource_id
        ORDER BY w.warehouse_id, rc.category
      `);

      const warehousesRes = await query(`SELECT warehouse_id, warehouse_name FROM WAREHOUSE`);
      const resourcesRes = await query(`SELECT resource_id, resource_name, category, unit FROM RESOURCE_CATEGORY`);

      return NextResponse.json({
        success: true,
        source: 'MYSQL_VIEW',
        shortages: shortagesRes.rows,
        inventory: allInventoryRes.rows,
        warehouses: warehousesRes.rows,
        resources: resourcesRes.rows
      });
    } catch (e) {
      console.warn('MySQL fallback in inventory GET');
    }
  }

  // Filter in-memory inventory
  const shortages = mockData.inventory.filter(item => item.quantity_available <= item.minimum_threshold);

  return NextResponse.json({
    success: true,
    source: 'IN_MEMORY',
    databaseStatus: dbStatus,
    shortages,
    inventory: mockData.inventory,
    warehouses: [
      { warehouse_id: 1, warehouse_name: 'Bengaluru Apex Strategic Reserve', location: 'Peenya, Bengaluru' },
      { warehouse_id: 2, warehouse_name: 'Mangaluru Maritime Supply Depot', location: 'Baikampady, Mangaluru' }
    ],
    resources: mockData.resources
  });
}
