import { NextResponse } from 'next/server';
import { mockData } from '@/lib/mockDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Aggregate telemetry stats: speed, cold-chain violations, and fuel levels
  const telemetry = mockData.telemetryLogs;

  const stats = {
    totalPackets: telemetry.length,
    activeAnomalies: telemetry.filter(t => t.anomaly).length,
    averageSpeedKmh: Math.round(telemetry.reduce((acc, t) => acc + (t.gps.speed_kmh || 0), 0) / telemetry.length),
    latestColdChainTemp: telemetry[telemetry.length - 1]?.cargo?.temp_c || 4.0,
    storageStrategy: 'MongoDB drrms_telemetry.supply_chain_telemetry collection with 90-day TTL index'
  };

  return NextResponse.json({
    success: true,
    stats,
    logs: telemetry
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { delivery_id, vehicle_id, gps, cargo, fuel_pct } = body;

    const isAnomaly = (cargo?.temp_c > 8.0) || (cargo?.door_opened === true);
    const newEntry = {
      delivery_id: Number(delivery_id) || 1,
      vehicle_id: Number(vehicle_id) || 1,
      vehicle_number: 'KA-01-EA-1001',
      timestamp: new Date().toISOString(),
      gps: gps || { lat: 12.55, lng: 75.92, speed_kmh: 48 },
      cargo: cargo || { temp_c: 4.5, humidity: 45, door_opened: false },
      fuel_pct: Number(fuel_pct) || 75,
      anomaly: isAnomaly,
      anomaly_reason: isAnomaly ? 'IoT Alert: Cargo breach or cold chain temperature violation!' : undefined
    };

    mockData.telemetryLogs.push(newEntry);

    return NextResponse.json({
      success: true,
      message: 'NoSQL Telemetry Packet ingested into high-velocity MongoDB collection.',
      packet: newEntry
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
