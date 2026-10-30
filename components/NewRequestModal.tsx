'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, ShieldAlert, Sparkles } from 'lucide-react';

interface NewRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
  camps: any[];
  disasters: any[];
  resources: any[];
}

export default function NewRequestModal({
  onClose,
  onSuccess,
  camps,
  disasters,
  resources
}: NewRequestModalProps) {
  const [campId, setCampId] = useState(camps[0]?.camp_id || '1');
  const [disasterId, setDisasterId] = useState(disasters[0]?.disaster_id || '1');
  const [needBy, setNeedBy] = useState('2026-10-27 18:00:00');
  const [medicalEmergency, setMedicalEmergency] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<{ resource_id: number; quantity: number }[]>([
    { resource_id: 1, quantity: 40 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const addItemRow = () => {
    setItems([...items, { resource_id: 2, quantity: 100 }]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = Number(value);
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camp_id: Number(campId),
          disaster_id: Number(disasterId),
          requested_by: 3,
          need_by: needBy,
          medical_emergency: medicalEmergency,
          remarks,
          items
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to submit requisition');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={22} color="#f59e0b" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
              Create Emergency Requisition
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Database Stored Function Highlight Banner */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          padding: '12px 14px',
          borderRadius: 10,
          fontSize: '0.78rem',
          color: '#fef08a',
          marginBottom: 18
        }}>
          <strong>Stored Function & Trigger Automation:</strong><br />
          On SQL INSERT, Trigger <code style={{ color: '#fff' }}>trg_auto_compute_priority_bi</code> calls <code style={{ color: '#fff' }}>fn_calculate_request_priority()</code>. Checking "Medical Emergency" dynamically injects +50 points to rank this request above others!
        </div>

        {errorMsg && (
          <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', fontSize: '0.82rem', marginBottom: 14 }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Relief Camp</label>
              <select value={campId} onChange={(e) => setCampId(e.target.value)} className="form-select">
                {camps.map(c => (
                  <option key={c.camp_id} value={c.camp_id}>
                    {c.camp_name || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Disaster Occurrence</label>
              <select value={disasterId} onChange={(e) => setDisasterId(e.target.value)} className="form-select">
                {disasters.map(d => (
                  <option key={d.disaster_id} value={d.disaster_id}>
                    {d.disaster_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Required Delivery Deadline</label>
            <input
              type="text"
              value={needBy}
              onChange={(e) => setNeedBy(e.target.value)}
              className="form-input"
              placeholder="YYYY-MM-DD HH:MM:SS"
            />
          </div>

          <div className="form-group">
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 8,
              background: medicalEmergency ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${medicalEmergency ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)'}`,
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={medicalEmergency}
                onChange={(e) => setMedicalEmergency(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#f43f5e' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: medicalEmergency ? '#fca5a5' : 'var(--text-primary)' }}>
                Mark as Critical Medical Emergency (Triggers Priority Surge)
              </span>
            </label>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>Required Line Items</label>
              <button type="button" onClick={addItemRow} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                <Plus size={12} /> Add Item
              </button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <select
                  value={item.resource_id}
                  onChange={(e) => updateItem(idx, 'resource_id', e.target.value)}
                  className="form-select"
                  style={{ flex: 2 }}
                >
                  {resources.map(r => (
                    <option key={r.resource_id} value={r.resource_id}>
                      {r.resource_name} ({r.category})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Quantity"
                />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItemRow(idx)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                    <Trash2 size={14} color="#f43f5e" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Triage & Distress Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="form-textarea"
              placeholder="e.g. 80 evacuees showing acute signs of waterborne diarrhea. Emergency antibiotics and rehydration urgently requested."
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Computing Priority & Submitting...' : 'Submit Requisition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
