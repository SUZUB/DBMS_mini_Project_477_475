'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Clock, PackageCheck, Zap, AlertTriangle } from 'lucide-react';
import { ResourceRequest } from '@/lib/mockDb';

interface ResourceRequestsTableProps {
  requests: ResourceRequest[];
  onOpenAllocateModal: (request: ResourceRequest) => void;
  onOpenNewRequest: () => void;
  currentRole: string;
}

export default function ResourceRequestsTable({
  requests,
  onOpenAllocateModal,
  onOpenNewRequest,
  currentRole
}: ResourceRequestsTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = requests.filter(r => {
    const matchesStatus = filterStatus === 'ALL' || r.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = 
      r.camp_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.disaster_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.remarks.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Filter Controls */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldAlert size={22} color="#f59e0b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Relief Requisitions & Supply Allocations
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Demonstrates Stored Procedure <code style={{ color: '#38bdf8' }}>sp_allocate_supplies_atomic</code> & Stored Function <code style={{ color: '#38bdf8' }}>fn_calculate_request_priority</code>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="text"
              placeholder="Filter by camp, disaster, or distress remark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: 280, fontSize: '0.82rem', padding: '8px 12px' }}
            />
            {(currentRole === 'ADMIN' || currentRole === 'CAMP_MANAGER') && (
              <button onClick={onOpenNewRequest} className="btn btn-primary" style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                + Submit Requisition
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {['ALL', 'Pending', 'Approved', 'Allocated', 'In Transit', 'Fulfilled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                background: filterStatus === status ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: filterStatus === status ? '#38bdf8' : 'var(--text-secondary)',
                border: filterStatus === status ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)',
                padding: '5px 12px',
                borderRadius: 9999,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Camp & Disaster</th>
                <th>Priority (Score)</th>
                <th>Requested Supplies</th>
                <th>Emergency?</th>
                <th>Need By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => {
                const isPending = req.status === 'Pending' || req.status === 'Approved';
                return (
                  <tr key={req.request_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)' }}>
                      #{req.request_id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{req.camp_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{req.disaster_name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={`badge badge-${req.priority_level.toLowerCase()}`}>
                          {req.priority_level}
                        </span>
                        <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700 }}>
                          ({req.priority_score})
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {req.items && req.items.length > 0 ? (
                          req.items.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                              • <strong style={{ color: '#fff' }}>{item.quantity_requested}</strong> {item.unit} {item.resource_name}
                            </div>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No items specified</span>
                        )}
                      </div>
                      {req.remarks && (
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic', maxWidth: 260 }}>
                          "{req.remarks}"
                        </div>
                      )}
                    </td>
                    <td>
                      {req.medical_emergency ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          color: '#f43f5e',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          background: 'rgba(244, 63, 94, 0.15)',
                          padding: '3px 8px',
                          borderRadius: 6
                        }}>
                          <AlertTriangle size={13} /> YES (+50 pts)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {req.need_by}
                    </td>
                    <td>
                      <span className={`badge ${
                        req.status === 'Fulfilled' ? 'badge-low' :
                        req.status === 'Allocated' ? 'badge-medium' :
                        req.status === 'In Transit' ? 'badge-high' : 'badge-critical'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {isPending && (currentRole === 'ADMIN' || currentRole === 'DISPATCHER') ? (
                        <button
                          onClick={() => onOpenAllocateModal(req)}
                          className="btn btn-primary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Zap size={13} /> Allocate (ACID)
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {req.status === 'Fulfilled' ? '✓ Completed' : req.status}
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
