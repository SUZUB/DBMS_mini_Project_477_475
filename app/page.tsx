'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardOverview from '@/components/DashboardOverview';
import CampOccupancyView from '@/components/CampOccupancyView';
import ResourceRequestsTable from '@/components/ResourceRequestsTable';
import FleetDispatchView from '@/components/FleetDispatchView';
import ComplexQueriesView from '@/components/ComplexQueriesView';
import NoSQLTelemetryView from '@/components/NoSQLTelemetryView';
import NewRequestModal from '@/components/NewRequestModal';
import AllocationModal from '@/components/AllocationModal';
import VectorSearchModal from '@/components/VectorSearchModal';
import DocumentationModal from '@/components/DocumentationModal';
import { ResourceRequest } from '@/lib/mockDb';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('ADMIN');
  const [dbStatus, setDbStatus] = useState({ connected: false, message: 'Checking...' });

  const [disasters, setDisasters] = useState<any[]>([]);
  const [camps, setCamps] = useState<any[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [shortages, setShortages] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  // Modals
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [selectedRequestForAlloc, setSelectedRequestForAlloc] = useState<ResourceRequest | null>(null);
  const [isVectorModalOpen, setIsVectorModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isNewDisasterOpen, setIsNewDisasterOpen] = useState(false);

  // New Disaster form state
  const [newDisasterName, setNewDisasterName] = useState('');
  const [newDisasterType, setNewDisasterType] = useState('Flood');
  const [newDisasterSeverity, setNewDisasterSeverity] = useState('HIGH');
  const [newDisasterDesc, setNewDisasterDesc] = useState('');
  const [newDisasterPop, setNewDisasterPop] = useState(25000);

  const fetchAllData = async () => {
    try {
      const [disastersRes, campsRes, reqsRes, invRes, delRes] = await Promise.all([
        fetch('/api/disasters').then(r => r.json()),
        fetch('/api/camps').then(r => r.json()),
        fetch('/api/requests').then(r => r.json()),
        fetch('/api/inventory').then(r => r.json()),
        fetch('/api/deliveries').then(r => r.json()),
      ]);

      if (disastersRes.data) setDisasters(disastersRes.data);
      if (campsRes.data) setCamps(campsRes.data);
      if (reqsRes.data) setRequests(reqsRes.data);
      if (invRes.inventory) setInventory(invRes.inventory);
      if (invRes.shortages) setShortages(invRes.shortages);
      if (invRes.resources) setResources(invRes.resources);
      if (invRes.warehouses) setWarehouses(invRes.warehouses);
      if (delRes.data) setDeliveries(delRes.data);
      if (delRes.vehicles) setVehicles(delRes.vehicles);

      if (disastersRes.databaseStatus) {
        setDbStatus(disastersRes.databaseStatus);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleOpenAllocate = (req: ResourceRequest) => {
    setSelectedRequestForAlloc(req);
    setIsAllocModalOpen(true);
  };

  const handleCreateDisaster = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/disasters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disaster_name: newDisasterName,
          disaster_type: newDisasterType,
          severity: newDisasterSeverity,
          description: newDisasterDesc,
          affected_population: newDisasterPop
        })
      });
      setIsNewDisasterOpen(false);
      setNewDisasterName('');
      setNewDisasterDesc('');
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenNewRequest={() => setIsNewRequestOpen(true)}
        onOpenVectorSearch={() => setIsVectorModalOpen(true)}
        onOpenDocs={() => setIsDocsModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dbStatus={dbStatus}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: 1400, width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        {activeTab === 'dashboard' && (
          <DashboardOverview
            disasters={disasters}
            campsCount={camps.length}
            pendingRequestsCount={requests.filter(r => r.status === 'Pending' || r.status === 'Approved').length}
            fleetCount={deliveries.filter(d => d.status === 'In Transit' || d.status === 'Dispatched').length}
            shortagesCount={shortages.length}
            onNavigateTab={setActiveTab}
            onOpenNewDisaster={() => setIsNewDisasterOpen(true)}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'camps' && (
          <CampOccupancyView
            camps={camps}
            onRefresh={fetchAllData}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'requests' && (
          <ResourceRequestsTable
            requests={requests}
            onOpenAllocateModal={handleOpenAllocate}
            onOpenNewRequest={() => setIsNewRequestOpen(true)}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'logistics' && (
          <FleetDispatchView
            deliveries={deliveries}
            vehicles={vehicles}
            onRefresh={fetchAllData}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'queries' && (
          <ComplexQueriesView />
        )}

        {activeTab === 'nosql' && (
          <NoSQLTelemetryView />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        background: 'rgba(10, 14, 23, 0.95)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span>
            PES University Department of CSE • DBMS Experiential Learning Level 3 Project
          </span>
          <span>
            Disaster Relief Resource Management System (MySQL 8.0 + MongoDB + pgvector)
          </span>
        </div>
      </footer>

      {/* Modals */}
      {isNewRequestOpen && (
        <NewRequestModal
          onClose={() => setIsNewRequestOpen(false)}
          onSuccess={() => {
            setIsNewRequestOpen(false);
            fetchAllData();
            setActiveTab('requests');
          }}
          camps={camps}
          disasters={disasters}
          resources={resources.length > 0 ? resources : [
            { resource_id: 1, resource_name: 'Trauma First Aid Kit', category: 'Medical Supplies' },
            { resource_id: 2, resource_name: 'ORS Sachet Bundles', category: 'Medical Supplies' },
            { resource_id: 3, resource_name: 'Clean Packaged Drinking Water (20L)', category: 'Food & Water' },
            { resource_id: 4, resource_name: 'High Energy Ration Biscuits', category: 'Food & Water' },
            { resource_id: 5, resource_name: 'Waterproof Family Tent (6-Person)', category: 'Shelter & Bedding' },
            { resource_id: 6, resource_name: 'Chlorine Water Purification Tablets', category: 'Sanitation' }
          ]}
        />
      )}

      {isAllocModalOpen && selectedRequestForAlloc && (
        <AllocationModal
          request={selectedRequestForAlloc}
          onClose={() => {
            setIsAllocModalOpen(false);
            setSelectedRequestForAlloc(null);
          }}
          onSuccess={() => {
            setIsAllocModalOpen(false);
            setSelectedRequestForAlloc(null);
            fetchAllData();
          }}
          warehouses={warehouses}
        />
      )}

      {isVectorModalOpen && (
        <VectorSearchModal onClose={() => setIsVectorModalOpen(false)} />
      )}

      {isDocsModalOpen && (
        <DocumentationModal onClose={() => setIsDocsModalOpen(false)} />
      )}

      {/* New Disaster Modal */}
      {isNewDisasterOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: 14 }}>
              Declare New Incident Operation
            </h3>
            <form onSubmit={handleCreateDisaster}>
              <div className="form-group">
                <label className="form-label">Disaster Name</label>
                <input
                  type="text"
                  required
                  value={newDisasterName}
                  onChange={(e) => setNewDisasterName(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Uttara Kannada Landslide Emergency"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select value={newDisasterType} onChange={(e) => setNewDisasterType(e.target.value)} className="form-select">
                    <option value="Flood">Flood</option>
                    <option value="Cyclone">Cyclone</option>
                    <option value="Earthquake">Earthquake</option>
                    <option value="Landslide">Landslide</option>
                    <option value="Epidemic">Epidemic</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Severity Level</label>
                  <select value={newDisasterSeverity} onChange={(e) => setNewDisasterSeverity(e.target.value)} className="form-select">
                    <option value="LOW">LOW</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Affected Population</label>
                <input
                  type="number"
                  min="1"
                  value={newDisasterPop}
                  onChange={(e) => setNewDisasterPop(Number(e.target.value))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Incident Synopsis</label>
                <textarea
                  rows={3}
                  value={newDisasterDesc}
                  onChange={(e) => setNewDisasterDesc(e.target.value)}
                  className="form-textarea"
                  placeholder="Summary of impact, affected highways, river basin..."
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="button" onClick={() => setIsNewDisasterOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record in Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
