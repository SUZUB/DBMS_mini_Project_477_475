'use client';

import React from 'react';
import { 
  Flame, 
  Building2, 
  PackageX, 
  Truck, 
  AlertTriangle, 
  Users, 
  Calendar,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Disaster } from '@/lib/mockDb';

interface DashboardOverviewProps {
  disasters: Disaster[];
  campsCount: number;
  pendingRequestsCount: number;
  fleetCount: number;
  shortagesCount: number;
  onNavigateTab: (tab: string) => void;
  onOpenNewDisaster: () => void;
  currentRole: string;
}

export default function DashboardOverview({
  disasters,
  campsCount,
  pendingRequestsCount,
  fleetCount,
  shortagesCount,
  onNavigateTab,
  onOpenNewDisaster,
  currentRole
}: DashboardOverviewProps) {
  const totalAffected = disasters.reduce((acc, d) => acc + (d.affected_pop || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero KPI Metrics Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16
      }}>
        {/* KPI 1 */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              ACTIVE DISASTERS
            </span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(244, 63, 94, 0.15)' }}>
              <Flame size={18} color="#f43f5e" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 10, color: '#fff' }}>
            {disasters.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.78rem', color: '#f43f5e' }}>
            <span className="pulse-dot" />
            <span>{totalAffected.toLocaleString()} Civilian Population Affected</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onNavigateTab('camps')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              OPERATIONAL CAMPS
            </span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(56, 189, 248, 0.15)' }}>
              <Building2 size={18} color="#38bdf8" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 10, color: '#fff' }}>
            {campsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            Monitored via View <code style={{ color: '#38bdf8' }}>vw_camp_occupancy_rates</code>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onNavigateTab('requests')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              PENDING REQUISITIONS
            </span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)' }}>
              <PackageX size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 10, color: '#fff' }}>
            {pendingRequestsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#fbbf24', marginTop: 6 }}>
            Awaiting Atomic Allocation Transaction
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onNavigateTab('logistics')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              FLEET IN TRANSIT
            </span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)' }}>
              <Truck size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 10, color: '#fff' }}>
            {fleetCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: 6 }}>
            GPS & Temperature Monitored in NoSQL
          </div>
        </div>

        {/* KPI 5 */}
        <div className="glass-panel" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onNavigateTab('camps')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              DEPLETED STOCK ITEMS
            </span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)' }}>
              <AlertTriangle size={18} color="#ef4444" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 10, color: '#fff' }}>
            {shortagesCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#f87171', marginTop: 6 }}>
            Breached <code style={{ color: '#f87171' }}>minimum_threshold</code>
          </div>
        </div>
      </div>

      {/* Disasters Management Section */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              Active Disaster Operations
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Relational representation in MySQL table <code style={{ color: '#38bdf8' }}>DISASTER</code> and <code style={{ color: '#38bdf8' }}>DISASTER_LOCATION</code>
            </p>
          </div>
          {currentRole === 'ADMIN' && (
            <button onClick={onOpenNewDisaster} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
              + Declare New Incident
            </button>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Incident Name</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Estimated Affected</th>
                <th>Commenced At</th>
                <th>Status</th>
                <th>Overview</th>
              </tr>
            </thead>
            <tbody>
              {disasters.map(d => (
                <tr key={d.disaster_id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    #{d.disaster_id}
                  </td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>
                    {d.disaster_name}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.05)',
                      fontSize: '0.78rem'
                    }}>
                      {d.disaster_type}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${d.severity.toLowerCase()}`}>
                      {d.severity}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#38bdf8' }}>
                    {(d.affected_pop || 0).toLocaleString()} people
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {d.started_at}
                  </td>
                  <td>
                    <span className="badge badge-active">
                      {d.status}
                    </span>
                  </td>
                  <td style={{ maxWidth: 320, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {d.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SQL Engine Architecture Highlights Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16
      }}>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Layers size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              Advanced Database Concepts (PES Rubric)
            </h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span><strong>ACID Stored Procedure:</strong> <code style={{ color: '#38bdf8' }}>sp_allocate_supplies_atomic</code> with strict rollback</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span><strong>Stored Function:</strong> <code style={{ color: '#38bdf8' }}>fn_calculate_request_priority</code> automated scoring</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span><strong>Integrity Triggers:</strong> Camp capacity limits and automatic delivery completion</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span><strong>Optimized Views:</strong> 4 high-velocity aggregation views for dashboards</span>
            </li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Sparkles size={20} color="#8b5cf6" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              Hybrid Multi-Paradigm Storage Justification
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
            <strong>Relational (MySQL):</strong> ACID transactions for inventory stock balances, role-based security, and strict foreign key integrity.<br />
            <strong>NoSQL (MongoDB):</strong> High-throughput IoT GPS & temperature breadcrumbs with 90-day TTL.<br />
            <strong>Vector (pgvector):</strong> 1536-dim semantic cosine similarity for civilian SOS free-text matching.
          </p>
          <button 
            onClick={() => onNavigateTab('queries')} 
            className="btn btn-secondary" 
            style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'center' }}
          >
            Launch SQL Laboratory (Live Query Benchmark) <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
