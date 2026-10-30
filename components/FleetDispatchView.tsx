'use client';

import React, { useState } from 'react';
import { Truck, CheckCircle2, Navigation, Clock, Radio, Sparkles } from 'lucide-react';

interface FleetDispatchViewProps {
  deliveries: any[];
  vehicles: any[];
  onRefresh: () => void;
  currentRole: string;
}

export default function FleetDispatchView({
  deliveries,
  vehicles,
  onRefresh,
  currentRole
}: FleetDispatchViewProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [triggerBanner, setTriggerBanner] = useState<string | null>(null);

  const handleCompleteDelivery = async (deliveryId: number) => {
    setUpdatingId(deliveryId);
    setTriggerBanner(null);

    try {
      const res = await fetch('/api/deliveries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_id: deliveryId, status: 'Completed' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTriggerBanner(data.message || 'Trigger trg_after_delivery_completed executed! Vehicle reset to AVAILABLE and requisition marked Fulfilled.');
        onRefresh();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Truck size={22} color="#10b981" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Fleet Logistics & Transit Dispatch Tracking
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Backed by View <code style={{ color: '#38bdf8' }}>vw_fleet_dispatch_tracking</code> and automated by Trigger <code style={{ color: '#38bdf8' }}>trg_after_delivery_completed</code>
            </p>
          </div>
          <button onClick={onRefresh} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            ↻ Refresh Dispatches
          </button>
        </div>

        {triggerBanner && (
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#86efac',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <CheckCircle2 size={18} />
            <span>{triggerBanner}</span>
          </div>
        )}
      </div>

      {/* Vehicles Fleet Summary Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 14
      }}>
        {vehicles.map(v => (
          <div key={v.vehicle_id} className="glass-panel" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{v.number}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.type}</div>
              </div>
              <span className={`badge ${v.status === 'AVAILABLE' ? 'badge-low' : 'badge-high'}`}>
                {v.status}
              </span>
            </div>
            <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Capacity: <strong style={{ color: '#fff' }}>{v.capacity} Tons</strong> | Current: {v.current_location}
            </div>
          </div>
        ))}
      </div>

      {/* Dispatches Table */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 14 }}>
          Active & Completed Aid Dispatches
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Vehicle & Driver</th>
                <th>Origin (Hub)</th>
                <th>Destination (Camp)</th>
                <th>Departure Time</th>
                <th>Expected Arrival</th>
                <th>Status</th>
                <th>Trigger Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map(del => {
                const isInTransit = del.status === 'In Transit' || del.status === 'Dispatched';
                return (
                  <tr key={del.delivery_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)' }}>
                      #{del.delivery_id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{del.vehicle_number}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Driver: {del.driver_name}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      {del.source_location || del.origin_hub}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      {del.dest_location || del.destination_zone}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {del.dept_time}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {del.expected_arrival}
                    </td>
                    <td>
                      <span className={`badge ${del.status === 'Completed' ? 'badge-low' : 'badge-high'}`}>
                        {del.status}
                      </span>
                    </td>
                    <td>
                      {isInTransit && (currentRole === 'ADMIN' || currentRole === 'DISPATCHER' || currentRole === 'VOLUNTEER') ? (
                        <button
                          onClick={() => handleCompleteDelivery(del.delivery_id)}
                          disabled={updatingId === del.delivery_id}
                          className="btn btn-success"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                          title="Fires trg_after_delivery_completed to release vehicle & fulfill request"
                        >
                          <CheckCircle2 size={13} /> Confirm Delivery (Trigger)
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {del.status === 'Completed' ? `Arrived at ${del.actual_arrival || 'destination'}` : del.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
