import { NextResponse } from 'next/server';
import { checkDatabaseConnection, query } from '@/lib/dbClient';
import { mockData } from '@/lib/mockDb';

export async function GET() {
  const dbStatus = await checkDatabaseConnection();

  if (dbStatus.connected) {
    try {
      const res = await query(`SELECT * FROM vw_fleet_dispatch_tracking ORDER BY delivery_id DESC`);
      const vehiclesRes = await query(`
        SELECT v.vehicle_id, v.number, v.type, v.capacity, v.status, l.name AS current_location
        FROM VEHICLE v
        JOIN LOCATION l ON v.current_location_id = l.location_id
      `);
      if (res.rows) {
        return NextResponse.json({ 
          success: true, 
          source: 'MYSQL_VIEW', 
          data: res.rows,
          vehicles: vehiclesRes.rows || []
        });
      }
    } catch (e) {
      console.warn('MySQL fallback in deliveries GET');
    }
  }

  return NextResponse.json({
    success: true,
    source: 'IN_MEMORY',
    databaseStatus: dbStatus,
    data: mockData.deliveries,
    vehicles: mockData.vehicles
  });
}

// Complete delivery (Fires trg_after_delivery_completed in MySQL)
export async function PUT(req: Request) {
  try {
    const { delivery_id, status } = await req.json();

    const dbStatus = await checkDatabaseConnection();
    if (dbStatus.connected) {
      await query(`
        UPDATE DELIVERY 
        SET status = ?, actual_arrival = NOW()
        WHERE delivery_id = ?
      `, [status, delivery_id]);

      return NextResponse.json({
        success: true,
        source: 'MYSQL_TRIGGER_FIRED',
        message: 'Delivery status updated. DB trigger trg_after_delivery_completed released the vehicle and marked request as Fulfilled!'
      });
    }

    // In-Memory Trigger simulation
    const delivery = mockData.deliveries.find(d => d.delivery_id === Number(delivery_id));
    if (!delivery) {
      return NextResponse.json({ success: false, error: 'Delivery not found' }, { status: 404 });
    }

    delivery.status = status;
    delivery.actual_arrival = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (status === 'Completed') {
      const vehicle = mockData.vehicles.find(v => v.vehicle_id === delivery.vehicle_id);
      if (vehicle) {
        vehicle.status = 'AVAILABLE';
        vehicle.current_location = delivery.dest_location;
      }
      // Also fulfill matching request
      const reqMatch = mockData.requests.find(r => r.camp_name.includes(delivery.target_camp));
      if (reqMatch) reqMatch.status = 'Fulfilled';
    }

    return NextResponse.json({
      success: true,
      source: 'IN_MEMORY_TRIGGER_SIMULATED',
      data: delivery,
      message: `Trigger executed: Vehicle released back to AVAILABLE status and request marked Fulfilled.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
