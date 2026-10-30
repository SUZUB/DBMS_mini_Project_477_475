'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Database, 
  Sparkles, 
  BookOpen, 
  Search, 
  Activity, 
  Radio
} from 'lucide-react';

interface NavbarProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  onOpenNewRequest: () => void;
  onOpenVectorSearch: () => void;
  onOpenDocs: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  dbStatus: { connected: boolean; message: string };
}

export default function Navbar({
  currentRole,
  onRoleChange,
  onOpenNewRequest,
  onOpenVectorSearch,
  onOpenDocs,
  activeTab,
  onTabChange,
  dbStatus
}: NavbarProps) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)'
          }}>
            <ShieldAlert size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                DRRMS
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                PES LEVEL 3
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Disaster Relief Resource Management System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255, 255, 255, 0.03)', padding: 4, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'camps', label: 'Camps & Occupancy', icon: Database },
            { id: 'requests', label: 'Requisitions & Allocation', icon: ShieldAlert },
            { id: 'logistics', label: 'Logistics & Fleet', icon: Radio },
            { id: 'queries', label: 'SQL Laboratory (6 Queries)', icon: Sparkles },
            { id: 'nosql', label: 'NoSQL Telemetry', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(37, 99, 235, 0.25))' : 'transparent',
                  color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Role Switcher & Modals */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* DB Health Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: dbStatus.connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${dbStatus.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            padding: '4px 10px',
            borderRadius: 9999,
            fontSize: '0.72rem',
            fontWeight: 600,
            color: dbStatus.connected ? '#34d399' : '#fbbf24'
          }} title={dbStatus.message}>
            <span className={`pulse-dot ${dbStatus.connected ? 'pulse-green' : ''}`} style={{ backgroundColor: dbStatus.connected ? '#10b981' : '#f59e0b' }} />
            <span>{dbStatus.connected ? 'MySQL 8.0 Live' : 'In-Memory Simulation'}</span>
          </div>

          {/* Role Switcher (RBAC) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-medium)',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ADMIN">ADMIN (Full Access)</option>
              <option value="DISPATCHER">DISPATCHER (Logistics)</option>
              <option value="CAMP_MANAGER">CAMP MANAGER (Requisitions)</option>
              <option value="VOLUNTEER">VOLUNTEER (Ground Ops)</option>
            </select>
          </div>

          {/* SOS Vector Search Trigger */}
          <button
            onClick={onOpenVectorSearch}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
            title="Semantic Vector Search (Option A)"
          >
            <Search size={15} color="#38bdf8" />
            <span>SOS Match</span>
          </button>

          {/* Requisition Button */}
          {(currentRole === 'ADMIN' || currentRole === 'CAMP_MANAGER') && (
            <button
              onClick={onOpenNewRequest}
              className="btn btn-primary"
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
            >
              + New Requisition
            </button>
          )}

          {/* Docs Button */}
          <button
            onClick={onOpenDocs}
            className="btn btn-secondary"
            style={{ padding: '8px 10px' }}
            title="PES Rubric Documentation & Schema"
          >
            <BookOpen size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
