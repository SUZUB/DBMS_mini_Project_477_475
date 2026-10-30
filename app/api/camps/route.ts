import { NextResponse } from 'next/server';
import { checkDatabaseConnection, query } from '@/lib/dbClient';
import { mockData } from '@/lib/mockDb';

export async function GET() {
  const dbStatus = await checkDatabaseConnection();

  if (dbStatus.connected) {
    try {
      const res = await query(`SELECT * FROM vw_camp_occupancy_rates`);
      if (res.rows && res.rows.length > 0) {
        return NextResponse.json({ success: true, source: 'MYSQL_VIEW', data: res.rows });
      }
    } catch (e) {
      console.warn('MySQL fallback in camps GET');
    }
  }

  // Calculate live occupancy in memory
  const campsWithCalculations = mockData.camps.map(camp => {
    const occupancy_percentage = Number(((camp.current_population / camp.capacity) * 100).toFixed(1));
    let crowd_density = 'SPACIOUS';
    if (occupancy_percentage >= 100) crowd_density = 'OVERCROWDED';
    else if (occupancy_percentage >= 85) crowd_density = 'NEAR_CAPACITY';
    else if (occupancy_percentage >= 50) crowd_density = 'MODERATE';

    return {
      camp_id: camp.camp_id,
      camp_name: camp.name,
      location_address: camp.location_name,
      capacity: camp.capacity,
      current_population: camp.current_population,
      available_capacity: camp.capacity - camp.current_population,
      occupancy_percentage,
      manager_name: camp.manager_name,
      camp_status: camp.status,
      crowd_density_indicator: crowd_density
    };
  });

  return NextResponse.json({
    success: true,
    source: 'IN_MEMORY',
    databaseStatus: dbStatus,
    data: campsWithCalculations
  });
}

// Update camp population (Fires Trigger trg_camp_population_check_bu)
export async function PUT(req: Request) {
  try {
    const { camp_id, delta_population } = await req.json();
    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.connected) {
      try {
        await query(`
          UPDATE RELIEF_CAMP 
          SET current_population = current_population + ?
          WHERE camp_id = ?
        `, [delta_population, camp_id]);

        return NextResponse.json({ 
          success: true, 
          source: 'MYSQL_TRIGGER_VERIFIED',
          message: 'Camp population updated; DB trigger verified constraints and occupancy status.' 
        });
      } catch (err: any) {
        // Trigger 45000 exception caught here
        return NextResponse.json({ 
          success: false, 
          error: `Database Trigger Rejection: ${err.message}` 
        }, { status: 400 });
      }
    }

    // In-memory simulation of Trigger logic
    const camp = mockData.camps.find(c => c.camp_id === Number(camp_id));
    if (!camp) {
      return NextResponse.json({ success: false, error: 'Camp not found' }, { status: 404 });
    }

    const newPop = camp.current_population + Number(delta_population);
    if (newPop > camp.capacity) {
      return NextResponse.json({
        success: false,
        error: `Integrity Violation (Trigger trg_camp_population_check_bu): Population (${newPop}) cannot exceed capacity (${camp.capacity})!`
      }, { status: 400 });
    }
    if (newPop < 0) {
      return NextResponse.json({
        success: false,
        error: `Integrity Violation (Trigger trg_camp_population_check_bu): Population cannot be negative!`
      }, { status: 400 });
    }

    camp.current_population = newPop;
    if (camp.current_population >= camp.capacity) {
      camp.status = 'FULL';
    } else {
      camp.status = 'OPERATIONAL';
    }

    return NextResponse.json({
      success: true,
      source: 'IN_MEMORY_TRIGGER_SIMULATED',
      data: camp,
      message: `Trigger executed: population set to ${newPop}. Status updated to ${camp.status}.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
