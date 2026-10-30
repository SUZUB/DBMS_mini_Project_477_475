import { NextResponse } from 'next/server';
import { checkDatabaseConnection, query } from '@/lib/dbClient';
import { mockData, ResourceRequest } from '@/lib/mockDb';

export async function GET() {
  const dbStatus = await checkDatabaseConnection();

  if (dbStatus.connected) {
    try {
      const res = await query(`
        SELECT 
          rr.request_id,
          rr.camp_id,
          c.name AS camp_name,
          rr.disaster_id,
          d.disaster_name,
          rr.requested_by,
          u.fullname AS requester_name,
          rr.requested_at,
          rr.need_by,
          rr.priority_score,
          rr.priority_level,
          rr.status,
          rr.medical_emergency,
          rr.remarks
        FROM RESOURCE_REQUEST rr
        JOIN RELIEF_CAMP c ON rr.camp_id = c.camp_id
        JOIN DISASTER d ON rr.disaster_id = d.disaster_id
        JOIN USER u ON rr.requested_by = u.user_id
        ORDER BY rr.priority_score DESC, rr.requested_at DESC
      `);

      if (res.rows && res.rows.length > 0) {
        // Query items for all requests
        const itemsRes = await query(`
          SELECT 
            ri.request_id,
            ri.resource_id,
            rc.resource_name,
            ri.quantity_requested,
            rc.unit
          FROM REQUEST_ITEM ri
          JOIN RESOURCE_CATEGORY rc ON ri.resource_id = rc.resource_id
        `);

        const rowsWithItems = res.rows.map((r: any) => ({
          ...r,
          items: itemsRes.rows.filter((it: any) => it.request_id === r.request_id)
        }));

        return NextResponse.json({ success: true, source: 'MYSQL', data: rowsWithItems });
      }
    } catch (e) {
      console.warn('MySQL fallback in requests GET');
    }
  }

  return NextResponse.json({
    success: true,
    source: 'IN_MEMORY',
    databaseStatus: dbStatus,
    data: mockData.requests
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { camp_id, disaster_id, requested_by, need_by, medical_emergency, remarks, items } = body;

    const dbStatus = await checkDatabaseConnection();
    if (dbStatus.connected) {
      // Direct SQL insertion - Trigger trg_auto_compute_priority_bi will automatically compute priority!
      const insertReqResult: any = await query(`
        INSERT INTO RESOURCE_REQUEST (camp_id, disaster_id, requested_by, need_by, medical_emergency, remarks)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [camp_id, disaster_id, requested_by || 3, need_by, medical_emergency ? 1 : 0, remarks]);

      const requestId = insertReqResult.rows?.insertId;

      if (items && Array.isArray(items)) {
        for (const item of items) {
          if (item.resource_id && item.quantity > 0) {
            await query(`
              INSERT INTO REQUEST_ITEM (request_id, resource_id, quantity_requested)
              VALUES (?, ?, ?)
            `, [requestId, item.resource_id, item.quantity]);
          }
        }
      }

      return NextResponse.json({
        success: true,
        source: 'MYSQL_TRIGGER_CALCULATED',
        request_id: requestId,
        message: 'Requisition created. Stored function calculated priority score and trigger assigned urgency tier.'
      });
    }

    // In-memory simulation of stored function fn_calculate_request_priority & trigger
    let priorityScore = 15;
    if (medical_emergency) priorityScore += 50;
    const disaster = mockData.disasters.find(d => d.disaster_id === Number(disaster_id));
    if (disaster && (disaster.affected_pop || 0) > 20000) priorityScore += 20;
    if (priorityScore > 100) priorityScore = 100;

    let priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    if (priorityScore >= 80) priorityLevel = 'CRITICAL';
    else if (priorityScore >= 60) priorityLevel = 'HIGH';
    else if (priorityScore < 35) priorityLevel = 'LOW';

    const camp = mockData.camps.find(c => c.camp_id === Number(camp_id));
    const newRequest: ResourceRequest = {
      request_id: mockData.requests.length + 1,
      camp_id: Number(camp_id),
      camp_name: camp ? camp.name : `Camp #${camp_id}`,
      disaster_id: Number(disaster_id),
      disaster_name: disaster ? disaster.disaster_name : `Disaster #${disaster_id}`,
      requested_by: Number(requested_by) || 3,
      requester_name: 'Camp Ground Officer',
      requested_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      need_by: need_by || new Date(Date.now() + 86400000).toISOString().replace('T', ' ').slice(0, 19),
      priority_score: priorityScore,
      priority_level: priorityLevel,
      status: 'Pending',
      medical_emergency: Boolean(medical_emergency),
      remarks: remarks || '',
      items: (items || []).map((it: any) => {
        const resCat = mockData.resources.find(r => r.resource_id === Number(it.resource_id));
        return {
          resource_id: Number(it.resource_id),
          resource_name: resCat ? resCat.resource_name : 'Relief Supply',
          quantity_requested: Number(it.quantity),
          unit: resCat ? resCat.unit : 'units'
        };
      })
    };

    mockData.requests.unshift(newRequest);

    return NextResponse.json({
      success: true,
      source: 'IN_MEMORY_TRIGGER_SIMULATED',
      data: newRequest,
      message: `Requisition created! Stored function fn_calculate_request_priority scored: ${priorityScore} (${priorityLevel})`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
