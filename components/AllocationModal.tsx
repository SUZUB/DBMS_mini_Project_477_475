'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertOctagon, Zap, ShieldCheck } from 'lucide-react';
import { ResourceRequest } from '@/lib/mockDb';

interface AllocationModalProps {
  request: ResourceRequest | null;
  onClose: () => void;
  onSuccess: () => void;
  warehouses: any[];
}

export default function AllocationModal({
  request,
  onClose,
  onSuccess,
  warehouses
}: AllocationModalProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('1');
  const [remarks, setRemarks] = useState<string>('Dispatched from strategic reserve');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionResult, setTransactionResult] = useState<{
    status: 'SUCCESS' | 'ROLLED_BACK';
    message: string;
    source?: string;
  } | null>(null);

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTransactionResult(null);

    try {
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: request.request_id,
          warehouse_id: Number(selectedWarehouseId),
          allocated_by: 2,
          remark: remarks
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setTransactionResult({
          status: 'ROLLED_BACK',
          message: data.error || 'Transaction rolled back due to insufficient warehouse stock.',
          source: data.source
        });
      } else {
        setTransactionResult({
          status: 'SUCCESS',
          message: data.message || 'Supplies committed successfully. Inventory deducted atomically.',
          source: data.source
        });
        setTimeout(() => {
          onSuccess();
        }, 1800);
      }
    } catch (err: any) {
      setTransactionResult({
        status: 'ROLLED_BACK',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={22} color="#38bdf8" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
              Execute ACID Supply Allocation
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Database Stored Procedure Technical Banner */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '12px 14px',
          borderRadius: 10,
          fontSize: '0.78rem',
          color: '#bae6fd',
          marginBottom: 18,
          lineHeight: 1.5
        }}>
          <strong>Stored Procedure:</strong> <code style={{ color: '#fff' }}>CALL sp_allocate_supplies_atomic(p_request_id, p_warehouse_id, ...)</code><br />
          Guarantees Atomicity & Consistency. Uses <code style={{ color: '#fff' }}>FOR UPDATE</code> row-level locks and executes <code style={{ color: '#fff' }}>ROLLBACK</code> if stock falls short.
        </div>

        {/* Requisition Summary */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 10,
          padding: 14,
          marginBottom: 18
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Requisition:</div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
            #{request.request_id} — {request.camp_name}
          </div>
          <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
            <strong>Required Line Items:</strong>
            <ul style={{ paddingLeft: 18, marginTop: 4 }}>
              {request.items.map((it, idx) => (
                <li key={idx}>
                  {it.quantity_requested} {it.unit} of {it.resource_name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Source Warehouse Hub</label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="form-select"
            >
              <option value="1">Warehouse 1: Bengaluru Apex Strategic Reserve (High Stock)</option>
              <option value="2">Warehouse 2: Mangaluru Maritime Supply Depot (Low/Deficit Stock)</option>
            </select>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Tip: Selecting Warehouse 2 demonstrates ACID Rollback on high-volume requests!
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Dispatcher Allocation Remark</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="form-input"
              placeholder="e.g. Urgent airlift authorized by state disaster control"
            />
          </div>

          {/* Transaction Outcome Alert */}
          {transactionResult && (
            <div style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: transactionResult.status === 'ROLLED_BACK' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${transactionResult.status === 'ROLLED_BACK' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
              fontSize: '0.82rem',
              color: transactionResult.status === 'ROLLED_BACK' ? '#fca5a5' : '#86efac',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              {transactionResult.status === 'ROLLED_BACK' ? <AlertOctagon size={18} /> : <CheckCircle size={18} />}
              <span>{transactionResult.message}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Executing Transaction...' : 'Commit Transaction (Deduct Stock)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
