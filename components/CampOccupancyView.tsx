'use client';

import React, { useState } from 'react';
import { Building2, Users, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

interface CampOccupancyViewProps {
  camps: any[];
  onRefresh: () => void;
  currentRole: string;
}

export default function CampOccupancyView({ camps, onRefresh, currentRole }: CampOccupancyViewProps) {
  const [loadingCampId, setLoadingCampId] = useState<number | null>(null);
  const [triggerNotification, setTriggerNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleUpdatePopulation = async (campId: number, delta: number) => {
    setLoadingCampId(campId);
    setTriggerNotification(null);
    try {
      const res = await fetch('/api/camps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camp_id: campId, delta_population: delta })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTriggerNotification({
          type: 'error',
          message: data.error || 'Database rejected the transaction.'
        });
      } else {
        setTriggerNotification({
          type: 'success',
          message: data.message || 'Population updated successfully!'
        });
        onRefresh();
      }
    } catch (err: any) {
      setTriggerNotification({
        type: 'error',
        message: err.message
      });
    } finally {
      setLoadingCampId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header and Explanation */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Building2 size={24} color="#38bdf8" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
                Relief Camp Occupancy & Capacity Enforcement
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Queried directly from SQL View <code style={{ color: '#38bdf8' }}>vw_camp_occupancy_rates</code> and protected by Trigger <code style={{ color: '#38bdf8' }}>trg_camp_population_check_bu</code>
            </p>
          </div>
          <button onClick={onRefresh} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            ↻ Refresh View
          </button>
        </div>

        {/* Live Trigger Response Notification Banner */}
        {triggerNotification && (
          <div style={{
            marginTop: 18,
            padding: '14px 18px',
            borderRadius: 12,
            background: triggerNotification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${triggerNotification.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            {triggerNotification.type === 'error' ? (
              <AlertOctagon size={22} color="#ef4444" style={{ flexShrink: 0 }} />
            ) : (
              <CheckCircle2 size={22} color="#10b981" style={{ flexShrink: 0 }} />
            )}
            <div style={{ fontSize: '0.85rem', color: triggerNotification.type === 'error' ? '#fca5a5' : '#86efac' }}>
              <strong>{triggerNotification.type === 'error' ? 'Database Trigger Rejection:' : 'Database Trigger Confirmed:'}</strong>{' '}
              {triggerNotification.message}
            </div>
          </div>
        )}
      </div>

      {/* Grid of Camps with Progress Bars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 20
      }}>
        {camps.map(camp => {
          const occupancy = Number(camp.occupancy_percentage || 0);
          const isOver = occupancy >= 100;
          const isNear = occupancy >= 85 && !isOver;

          let barColor = 'linear-gradient(90deg, #0284c7, #38bdf8)';
          if (isOver) barColor = 'linear-gradient(90deg, #e11d48, #f43f5e)';
          else if (isNear) barColor = 'linear-gradient(90deg, #d97706, #fbbf24)';

          return (
            <div key={camp.camp_id} className="glass-panel" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                    {camp.camp_name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {camp.location_address || camp.location_name}
                  </p>
                </div>
                <span className={`badge ${isOver ? 'badge-critical' : isNear ? 'badge-high' : 'badge-active'}`}>
                  {camp.crowd_density_indicator || camp.camp_status}
                </span>
              </div>

              {/* Occupancy Progress Bar */}
              <div style={{ margin: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Current Population: <strong style={{ color: '#fff' }}>{camp.current_population.toLocaleString()}</strong> / {camp.capacity.toLocaleString()}
                  </span>
                  <span style={{ fontWeight: 700, color: isOver ? '#f43f5e' : isNear ? '#fbbf24' : '#38bdf8' }}>
                    {occupancy}% Occupied
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: 10,
                  borderRadius: 9999,
                  background: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(100, occupancy)}%`,
                    height: '100%',
                    background: barColor,
                    borderRadius: 9999,
                    transition: 'width 0.4s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>Spare Beds: {Math.max(0, camp.capacity - camp.current_population)}</span>
                  <span>Max Limit: {camp.capacity}</span>
                </div>
              </div>

              {/* Manager info */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 16
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Camp Manager:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{camp.manager_name}</span>
              </div>

              {/* Trigger Interactive Simulation Controls */}
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 14,
                display: 'flex',
                gap: 10,
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  TEST TRIGGER:
                </span>
                <button
                  onClick={() => handleUpdatePopulation(camp.camp_id, 50)}
                  disabled={loadingCampId === camp.camp_id}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '7px 10px', fontSize: '0.75rem' }}
                >
                  +50 Influx (Valid)
                </button>
                <button
                  onClick={() => handleUpdatePopulation(camp.camp_id, 1000)}
                  disabled={loadingCampId === camp.camp_id}
                  className="btn btn-danger"
                  style={{ flex: 1, padding: '7px 10px', fontSize: '0.75rem' }}
                  title="Will trigger MySQL SQLSTATE 45000 Integrity Violation"
                >
                  +1,000 (Overcapacity)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
