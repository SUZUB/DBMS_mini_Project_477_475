'use client';

import React from 'react';
import { X, BookOpen, Layers, CheckCircle, Database, FileText } from 'lucide-react';

interface DocumentationModalProps {
  onClose: () => void;
}

export default function DocumentationModal({ onClose }: DocumentationModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 880, maxHeight: '90vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={24} color="#38bdf8" />
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                DBMS Level 3 Project Documentation (Soft Copy)
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                PES University • Department of Computer Science and Engineering
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
          {/* Section 1 */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
              1. Project Title & Problem Statement
            </h3>
            <p>
              <strong>Title:</strong> Disaster Relief Resource Management System (DRRMS)<br />
              <strong>Problem Domain:</strong> During acute humanitarian emergencies (floods, cyclones, earthquakes), decentralized logistics frequently suffer from severe inventory black-holes, over-allocation, and transport bottlenecks. DRRMS provides an end-to-end mission-critical platform enforcing transactional consistency across warehouse stockpiles, automated triage priority scoring, relief camp occupancy limits, and IoT telemetry tracking.
            </p>
          </div>

          {/* Section 2 */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
              2. Relational Schema Specification (15 Entities)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
              Directly synthesized from the handwritten Relational Schema design approved by course staff:
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: '#080c14', padding: 12, borderRadius: 8, overflowX: 'auto', color: '#93c5fd' }}>
              1. ROLE (<u>role_id</u>, role_name, descp)<br />
              2. USER (<u>user_id</u>, role_id*, fullname, email, password_hash, phone, is_active, last_login, created_at)<br />
              3. DISASTER (<u>disaster_id</u>, disaster_name, disaster_type, severity, started_at, ended_at, status, description, created_by*, created_at)<br />
              4. LOCATION (<u>location_id</u>, name, type, address, latitude, longitude)<br />
              5. DISASTER_LOCATION (<u>disaster_id*</u>, <u>location_id*</u>, impact_level, affected_population, reported_at)<br />
              6. RELIEF_CAMP (<u>camp_id</u>, location_id*, name, capacity, current_population, manager_id*, status, established_dt)<br />
              7. RESOURCE_CATEGORY (<u>resource_id</u>, category, resource_name, unit, description, is_perishable)<br />
              8. WAREHOUSE (<u>warehouse_id</u>, location_id*, warehouse_name, manager_id*, capacity, status)<br />
              9. INVENTORY (<u>warehouse_id*</u>, <u>resource_id*</u>, quantity_available, minimum_threshold, last_updated)<br />
              10. RESOURCE_REQUEST (<u>request_id</u>, camp_id*, disaster_id*, requested_by*, requested_at, need_by, priority_score, priority_level, status, medical_emergency, remarks)<br />
              11. REQUEST_ITEM (<u>request_id*</u>, <u>resource_id*</u>, quantity_requested)<br />
              12. ALLOCATION (<u>allocation_id</u>, request_id*, allocated_by*, allocated_at, status, remark)<br />
              13. VEHICLE (<u>vehicle_id</u>, number, type, capacity, status, current_location_id*)<br />
              14. DELIVERY (<u>delivery_id</u>, allocation_id*, vehicle_id*, driver_id*, source_location*, dest_location*, dept_time, expected_arrival, actual_arrival, status)<br />
              15. VOLUNTEER (<u>volunteer_id</u>, full_name, phone, email, skills, availability_status, registered_at)
            </div>
          </div>

          {/* Section 3 */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
              3. Advanced Database Concepts Demonstrated (PES Level 3)
            </h3>
            <ul style={{ paddingLeft: 20 }}>
              <li>
                <strong>ACID Transactions & Stored Procedures:</strong> <code style={{ color: '#fff' }}>sp_allocate_supplies_atomic</code> guarantees that multiple line-items are validated and deducted simultaneously under row-level locks (<code style={{ color: '#38bdf8' }}>FOR UPDATE</code>). If any item is depleted, it triggers an explicit <code style={{ color: '#f43f5e' }}>ROLLBACK</code>.
              </li>
              <li>
                <strong>Stored Functions:</strong> <code style={{ color: '#fff' }}>fn_calculate_request_priority()</code> automates multi-factor triage priority scoring incorporating medical emergency boosts (+50), affected population density, and remaining time deadlines.
              </li>
              <li>
                <strong>Database Triggers:</strong>
                <ul style={{ paddingLeft: 18, marginTop: 4 }}>
                  <li><code style={{ color: '#fff' }}>trg_camp_population_check_bi/bu</code>: Blocks camp overcapacity via <code style={{ color: '#f43f5e' }}>SQLSTATE 45000</code>.</li>
                  <li><code style={{ color: '#fff' }}>trg_after_delivery_completed</code>: Automatically sets vehicle back to AVAILABLE, updates its GPS location to destination, and marks request as Fulfilled.</li>
                  <li><code style={{ color: '#fff' }}>trg_auto_compute_priority_bi</code>: Automatically invokes priority function on requisition insertion.</li>
                </ul>
              </li>
              <li>
                <strong>Optimized Views:</strong> 4 high-speed dashboard views (<code style={{ color: '#fff' }}>vw_camp_occupancy_rates</code>, <code style={{ color: '#fff' }}>vw_critical_inventory_shortages</code>, <code style={{ color: '#fff' }}>vw_active_disaster_impact_summary</code>, <code style={{ color: '#fff' }}>vw_fleet_dispatch_tracking</code>).
              </li>
              <li>
                <strong>Full-Text Search:</strong> MySQL <code style={{ color: '#fff' }}>MATCH(...) AGAINST(...)</code> with FULLTEXT indexes across remarks and descriptions.
              </li>
              <li>
                <strong>NoSQL Aggregation (MongoDB):</strong> High-velocity ingestion of vehicle GPS coordinates and temperature alerts with 90-day TTL indexes.
              </li>
              <li>
                <strong>Vector Semantic Search (pgvector):</strong> 1536-dimensional cosine distance similarity matching civilian SOS distress dispatches to affected zones.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
              4. Database Technology Selection Justification
            </h3>
            <p>
              • <strong>Relational SQL (MySQL 8.0 / PostgreSQL):</strong> Essential for core financial/physical accounting of relief supplies. Strict ACID transactions prevent double-allocation of rations. Foreign key constraints maintain referential integrity across dispatches, vehicles, and camps.<br />
              • <strong>NoSQL (MongoDB):</strong> Dedicated for append-heavy IoT telemetry emitted every 10 seconds per transit vehicle. Eliminates write lock contention on the relational database.<br />
              • <strong>Vector DB (pgvector):</strong> Provides sub-millisecond semantic retrieval across messy, free-text civilian SMS dispatches that do not match exact SQL keywords.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary">
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
