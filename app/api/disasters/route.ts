import { NextResponse } from 'next/server';
import { checkDatabaseConnection, query } from '@/lib/dbClient';
import { mockData } from '@/lib/mockDb';

export async function GET() {
  const dbStatus = await checkDatabaseConnection();

  if (dbStatus.connected) {
    try {
      const res = await query(`
        SELECT 
          d.disaster_id,
          d.disaster_name,
          d.disaster_type,
          d.severity,
          d.status,
          d.started_at,
          d.description,
          COALESCE(SUM(dl.affected_population), 0) AS affected_pop
        FROM DISASTER d
        LEFT JOIN DISASTER_LOCATION dl ON d.disaster_id = dl.disaster_id
        GROUP BY d.disaster_id, d.disaster_name, d.disaster_type, d.severity, d.status, d.started_at, d.description
        ORDER BY d.disaster_id DESC
      `);
      if (res.rows && res.rows.length > 0) {
        return NextResponse.json({ success: true, source: 'MYSQL', data: res.rows });
      }
    } catch (e) {
      console.warn('MySQL fallback in disasters GET');
    }
  }

  return NextResponse.json({
    success: true,
    source: 'IN_MEMORY',
    databaseStatus: dbStatus,
    data: mockData.disasters,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { disaster_name, disaster_type, severity, description, affected_population, location_id } = body;

    const dbStatus = await checkDatabaseConnection();
    if (dbStatus.connected) {
      const result: any = await query(`
        INSERT INTO DISASTER (disaster_name, disaster_type, severity, started_at, status, description, created_by)
        VALUES (?, ?, ?, NOW(), 'ACTIVE', ?, 1)
      `, [disaster_name, disaster_type, severity, description]);

      const insertId = result.rows?.insertId || Date.now();
      if (location_id && affected_population) {
        await query(`
          INSERT INTO DISASTER_LOCATION (disaster_id, location_id, impact_level, affected_population, reported_at)
          VALUES (?, ?, 'SEVERE', ?, NOW())
        `, [insertId, location_id, affected_population]);
      }

      return NextResponse.json({ success: true, source: 'MYSQL', disaster_id: insertId });
    }

    // In-Memory Mode
    const newDisaster = {
      disaster_id: mockData.disasters.length + 1,
      disaster_name,
      disaster_type,
      severity,
      started_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ended_at: null,
      status: 'ACTIVE' as const,
      description,
      created_by: 1,
      affected_pop: Number(affected_population) || 5000
    };
    mockData.disasters.unshift(newDisaster);

    return NextResponse.json({ success: true, source: 'IN_MEMORY', data: newDisaster });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
