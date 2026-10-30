# Disaster Relief Resource Management System (DRRMS)
### PES University — Department of Computer Science & Engineering
**DBMS Experiential Learning — Level 3 Project**

---

## 📌 1. Project Overview & Problem Statement
During severe natural disasters (floods, cyclones, earthquakes), supply chain breakdowns and communication failures lead to acute logistical bottlenecks, relief camp overpopulation, and ration black-holes. 

**DRRMS** is a multi-paradigm database system built to coordinate humanitarian aid delivery:
- **Relational SQL (MySQL 8.0 / PostgreSQL):** Guarantees strict ACID consistency during atomic inventory allocations, prevents camp overpopulation via database triggers, and enforces referential integrity across 15 core entities.
- **NoSQL (MongoDB):** Ingests high-frequency IoT GPS breadcrumbs and refrigerated container temperature telemetry with automated 90-day TTL expiration.
- **Vector Database (pgvector):** Implements 1536-dimensional cosine similarity embeddings to match unstructured civilian SOS distress messages with active disaster zones.
- **Interactive Web App (Next.js):** Provides a mission-control dashboard with role-based access control (Admin, Dispatcher, Camp Manager, Volunteer) and an interactive SQL Laboratory.

---

## 🗄️ 2. Relational Schema (15 Tables)
Directly synthesized from the approved handwritten relational schema:

```
1. ROLE (role_id, role_name, descp)
2. USER (user_id, role_id*, fullname, email, password_hash, phone, is_active, last_login, created_at)
3. DISASTER (disaster_id, disaster_name, disaster_type, severity, started_at, ended_at, status, description, created_by*, created_at)
4. LOCATION (location_id, name, type, address, latitude, longitude)
5. DISASTER_LOCATION (disaster_id*, location_id*, impact_level, affected_population, reported_at)
6. RELIEF_CAMP (camp_id, location_id*, name, capacity, current_population, manager_id*, status, established_dt)
7. RESOURCE_CATEGORY (resource_id, category, resource_name, unit, description, is_perishable)
8. WAREHOUSE (warehouse_id, location_id*, warehouse_name, manager_id*, capacity, status)
9. INVENTORY (warehouse_id*, resource_id*, quantity_available, minimum_threshold, last_updated)
10. RESOURCE_REQUEST (request_id, camp_id*, disaster_id*, requested_by*, requested_at, need_by, priority_score, priority_level, status, medical_emergency, remarks)
11. REQUEST_ITEM (request_id*, resource_id*, quantity_requested)
12. ALLOCATION (allocation_id, request_id*, allocated_by*, allocated_at, status, remark)
13. VEHICLE (vehicle_id, number, type, capacity, status, current_location_id*)
14. DELIVERY (delivery_id, allocation_id*, vehicle_id*, driver_id*, source_location*, dest_location*, dept_time, expected_arrival, actual_arrival, status)
15. VOLUNTEER (volunteer_id, full_name, phone, email, skills, availability_status, registered_at)
```

---

## ⚡ 3. Advanced Database Concepts Demonstrated (PES Level 3)

| Concept | SQL Object / Mechanism | Functional Purpose |
|---|---|---|
| **ACID Transactions** | `sp_allocate_supplies_atomic` | Validates stock under row-level locks (`FOR UPDATE`), deducts inventory across multiple line items atomically, and rolls back if stock is insufficient. |
| **Stored Functions** | `fn_calculate_request_priority` | Automatically scores requisition urgency (1–100) based on medical emergency (+50), affected population, and countdown deadline. |
| **Integrity Triggers** | `trg_camp_population_check_bi/bu` | Enforces capacity constraints via `SQLSTATE 45000` and automatically flags camp status as `FULL`. |
| **Operational Triggers** | `trg_after_delivery_completed` | Upon delivery completion, releases the transport vehicle to `AVAILABLE`, resets its GPS to destination, and updates the request to `Fulfilled`. |
| **Pre-Insert Triggers** | `trg_auto_compute_priority_bi` | Automatically invokes the priority scoring function upon inserting a new `RESOURCE_REQUEST`. |
| **Analytical Views** | `vw_camp_occupancy_rates` | Computes live occupancy percentages, available beds, and crowd density indicators. |
| **Analytical Views** | `vw_critical_inventory_shortages` | Exposes warehouse supplies breaching minimum safety thresholds. |
| **Analytical Views** | `vw_active_disaster_impact_summary` | Aggregates impacted populations, operational camps, and open requisitions per disaster. |
| **Analytical Views** | `vw_fleet_dispatch_tracking` | Complete transit overview joining vehicles, drivers, origin depots, and target camps. |
| **Full-Text Search** | `MATCH(...) AGAINST(...)` | Natural language token search across disaster descriptions and emergency triage remarks. |
| **NoSQL (Option B)** | MongoDB Collection `supply_chain_telemetry` | High-throughput telemetry ingestion with 90-day TTL indexes and cold-chain temperature anomaly detection. |
| **Vector Search (Option A)** | PostgreSQL `pgvector` HNSW Index | 1536-dimensional cosine distance similarity search matching civilian SOS dispatches to disaster zones. |

---

## 🚀 4. Quick Start & Execution Guide

### Prerequisites
- Node.js v18+ (Node v24 installed)
- MySQL 8.0+ running on port 3306

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and enter your MySQL root password:
```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=disaster_relief_db
```
*(Note: If MySQL is not configured, DRRMS automatically runs in In-Memory Level 3 Simulation Mode, allowing full UI demonstration without database errors!)*

### Step 3: Run Database Verification & Audit
```bash
node scripts/verify_db.js
```

### Step 4: Launch Web Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 5. Evaluation Demonstration Checklist

1. **Dashboard Overview:** View live KPIs, Active Disasters, and switch user roles (Admin, Dispatcher, Camp Manager, Volunteer) in the top navbar.
2. **Camp Occupancy & Trigger Test:** Navigate to *Camps & Occupancy*. Click `+50 Influx (Valid)` to observe valid population updates, then click `+1,000 (Overcapacity)` to watch the database trigger `trg_camp_population_check_bu` reject the transaction with a `SQLSTATE 45000` integrity alert.
3. **Requisition & Priority Scoring:** Navigate to *Requisitions & Allocation*. Click `+ Submit Requisition`, check *Medical Emergency*, and observe how stored function `fn_calculate_request_priority` automatically surges the priority score to CRITICAL (95+).
4. **ACID Supply Allocation:** Click `Allocate (ACID)` on a pending request. Choose Warehouse 1 to commit the transaction and deduct stock, or Warehouse 2 to observe an atomic `ROLLBACK` due to insufficient stock.
5. **Fleet Dispatch & Trigger:** Navigate to *Logistics & Fleet*. Click `Confirm Delivery` to fire `trg_after_delivery_completed`, which instantly releases the truck back to `AVAILABLE` and fulfills the requisition.
6. **SQL Laboratory (6 Complex Queries):** Navigate to *SQL Laboratory*. Execute Query 1 through Query 6 to inspect live SQL statements, concepts (JOIN, GROUP BY/HAVING, Correlated Subqueries, Window functions, Full-Text Search), and formatted result tables.
7. **NoSQL Telemetry:** Navigate to *NoSQL Telemetry*. Click `+ Ingest Normal Ping` or `Simulate Cold-Chain Breach` to test live IoT stream ingestion and anomaly detection.
8. **Semantic Vector Search:** Click `SOS Match` in the header to paste unstructured civilian distress messages and compute cosine similarity matches against active disaster zones.

---

## 📂 Project Structure
```
├── app/
│   ├── api/
│   │   ├── disasters/route.ts
│   │   ├── camps/route.ts
│   │   ├── inventory/route.ts
│   │   ├── requests/route.ts
│   │   ├── allocations/route.ts
│   │   ├── deliveries/route.ts
│   │   ├── queries/route.ts
│   │   ├── nosql-telemetry/route.ts
│   │   └── vector-search/route.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── DashboardOverview.tsx
│   ├── CampOccupancyView.tsx
│   ├── ResourceRequestsTable.tsx
│   ├── AllocationModal.tsx
│   ├── NewRequestModal.tsx
│   ├── FleetDispatchView.tsx
│   ├── ComplexQueriesView.tsx
│   ├── NoSQLTelemetryView.tsx
│   ├── VectorSearchModal.tsx
│   └── DocumentationModal.tsx
├── database/
│   ├── sql/
│   │   ├── 01_schema_mysql.sql
│   │   ├── 01_schema_postgres.sql
│   │   ├── 02_seed_data.sql
│   │   ├── 03_views_procedures_triggers.sql
│   │   ├── 04_complex_queries.sql
│   │   └── db.ts
│   ├── nosql/
│   │   ├── models/
│   │   │   ├── SupplyChainTelemetry.ts
│   │   │   └── VolunteerActionLog.ts
│   │   └── mongodb.ts
│   └── vector/
│       └── incidentReportVector.ts
├── lib/
│   ├── dbClient.ts
│   └── mockDb.ts
├── scripts/
│   └── verify_db.js
└── package.json
```
