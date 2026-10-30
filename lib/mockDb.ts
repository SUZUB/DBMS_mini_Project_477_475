// In-Memory Database Store mimicking MySQL schema and seed data
// Used for instantaneous UI demonstration and fallback if MySQL server is offline

export interface Role {
  role_id: number;
  role_name: string;
  descp: string;
}

export interface User {
  user_id: number;
  role_id: number;
  fullname: string;
  email: string;
  phone: string;
  is_active: boolean;
  role_name?: string;
}

export interface Disaster {
  disaster_id: number;
  disaster_name: string;
  disaster_type: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  started_at: string;
  ended_at: string | null;
  status: 'ACTIVE' | 'CONTAINED' | 'RESOLVED';
  description: string;
  created_by: number;
  affected_pop?: number;
}

export interface Location {
  location_id: number;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface ReliefCamp {
  camp_id: number;
  location_id: number;
  name: string;
  capacity: number;
  current_population: number;
  manager_id: number;
  status: 'PREPARING' | 'OPERATIONAL' | 'FULL' | 'CLOSED';
  established_dt: string;
  location_name?: string;
  manager_name?: string;
  occupancy_pct?: number;
}

export interface ResourceCategory {
  resource_id: number;
  category: string;
  resource_name: string;
  unit: string;
  description: string;
  is_perishable: boolean;
}

export interface Warehouse {
  warehouse_id: number;
  location_id: number;
  warehouse_name: string;
  manager_id: number;
  capacity: number;
  status: string;
}

export interface InventoryItem {
  warehouse_id: number;
  warehouse_name: string;
  resource_id: number;
  resource_name: string;
  category: string;
  unit: string;
  quantity_available: number;
  minimum_threshold: number;
  deficit: number;
  last_updated: string;
}

export interface ResourceRequest {
  request_id: number;
  camp_id: number;
  camp_name: string;
  disaster_id: number;
  disaster_name: string;
  requested_by: number;
  requester_name: string;
  requested_at: string;
  need_by: string;
  priority_score: number;
  priority_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'Pending' | 'Approved' | 'Allocated' | 'In Transit' | 'Fulfilled' | 'Cancelled';
  medical_emergency: boolean;
  remarks: string;
  items: { resource_id: number; resource_name: string; quantity_requested: number; unit: string }[];
}

export interface DeliveryRecord {
  delivery_id: number;
  allocation_id: number;
  vehicle_id: number;
  vehicle_number: string;
  vehicle_type: string;
  driver_name: string;
  source_location: string;
  dest_location: string;
  dept_time: string;
  expected_arrival: string;
  actual_arrival: string | null;
  status: 'Pending' | 'Dispatched' | 'In Transit' | 'Completed' | 'Failed';
  target_camp: string;
}

// In-memory state initialized directly from 02_seed_data.sql
export const mockData: {
  roles: Role[];
  users: User[];
  locations: Location[];
  disasters: Disaster[];
  camps: ReliefCamp[];
  resources: ResourceCategory[];
  inventory: InventoryItem[];
  requests: ResourceRequest[];
  deliveries: DeliveryRecord[];
  vehicles: any[];
  telemetryLogs: any[];
} = {
  roles: [
    { role_id: 1, role_name: 'ADMIN', descp: 'Master administrator with full system orchestration privilege' },
    { role_id: 2, role_name: 'DISPATCHER', descp: 'Logistics coordinator managing supply allocation and fleet dispatch' },
    { role_id: 3, role_name: 'CAMP_MANAGER', descp: 'Ground coordinator managing relief camp populations and requisitions' },
    { role_id: 4, role_name: 'VOLUNTEER', descp: 'Field relief worker updating operational status and delivering aid' }
  ],
  users: [
    { user_id: 1, role_id: 1, fullname: 'Dr. Rajesh Sharma', email: 'admin@drrms.org', phone: '+91-9876543210', is_active: true, role_name: 'ADMIN' },
    { user_id: 2, role_id: 2, fullname: 'Ananya Sen', email: 'dispatcher@drrms.org', phone: '+91-9876543211', is_active: true, role_name: 'DISPATCHER' },
    { user_id: 3, role_id: 3, fullname: 'Vikram Rathore', email: 'campmgr.north@drrms.org', phone: '+91-9876543212', is_active: true, role_name: 'CAMP_MANAGER' },
    { user_id: 4, role_id: 3, fullname: 'Priya Kulkarni', email: 'campmgr.coastal@drrms.org', phone: '+91-9876543213', is_active: true, role_name: 'CAMP_MANAGER' },
    { user_id: 5, role_id: 2, fullname: 'Mohan Das (Driver)', email: 'driver.mohan@drrms.org', phone: '+91-9876543214', is_active: true, role_name: 'DISPATCHER' }
  ],
  locations: [
    { location_id: 1, name: 'Central Warehouse Hub Bengaluru', type: 'WAREHOUSE', address: 'Sector 4, Peenya Industrial Area, Bengaluru', latitude: 13.0285, longitude: 77.5197 },
    { location_id: 2, name: 'North Coast Warehouse Mangaluru', type: 'WAREHOUSE', address: 'Baikampady Industrial Estate, Mangaluru', latitude: 12.9463, longitude: 74.8211 },
    { location_id: 3, name: 'Cauvery Basin Flood Zone', type: 'DISASTER_ZONE', address: 'Kodagu River Basin, Madikeri', latitude: 12.4244, longitude: 75.7382 },
    { location_id: 4, name: 'Mangaluru Cyclone Impact Zone', type: 'DISASTER_ZONE', address: 'Panambur Coastal Belt, Dakshina Kannada', latitude: 12.9510, longitude: 74.8020 },
    { location_id: 5, name: 'Madikeri Govt College Relief Camp', type: 'RELIEF_CAMP', address: 'Field Marshal KM Cariappa College, Madikeri', latitude: 12.4210, longitude: 75.7340 },
    { location_id: 6, name: 'Surathkal High School Camp', type: 'RELIEF_CAMP', address: 'National Highway 66, Surathkal', latitude: 13.0110, longitude: 74.7940 }
  ],
  disasters: [
    {
      disaster_id: 1,
      disaster_name: 'Flash Floods Kodagu 2026',
      disaster_type: 'Flood',
      severity: 'HIGH' as const,
      started_at: '2026-08-10 04:00:00',
      ended_at: null,
      status: 'ACTIVE' as const,
      description: 'Severe rainfall triggered widespread mudslides and river flooding across Kodagu district.',
      created_by: 1,
      affected_pop: 45000
    },
    {
      disaster_id: 2,
      disaster_name: 'Cyclone Sagar Coastal Surge',
      disaster_type: 'Cyclone',
      severity: 'CRITICAL' as const,
      started_at: '2026-09-02 11:30:00',
      ended_at: null,
      status: 'ACTIVE' as const,
      description: 'Category 4 cyclone causing coastal embankment breaches and power grid collapse.',
      created_by: 1,
      affected_pop: 120000
    }
  ],
  camps: [
    {
      camp_id: 1,
      location_id: 5,
      name: 'Madikeri Primary Relief Center',
      capacity: 1500,
      current_population: 1120,
      manager_id: 3,
      status: 'OPERATIONAL' as const,
      established_dt: '2026-08-11',
      location_name: 'Field Marshal KM Cariappa College, Madikeri',
      manager_name: 'Vikram Rathore',
      occupancy_pct: 74.7
    },
    {
      camp_id: 2,
      location_id: 6,
      name: 'Surathkal Coastal Evac Camp',
      capacity: 2000,
      current_population: 1850,
      manager_id: 4,
      status: 'OPERATIONAL' as const,
      established_dt: '2026-09-03',
      location_name: 'National Highway 66, Surathkal',
      manager_name: 'Priya Kulkarni',
      occupancy_pct: 92.5
    }
  ],
  resources: [
    { resource_id: 1, category: 'Medical Supplies', resource_name: 'Trauma First Aid Kit', unit: 'kits', description: 'Comprehensive surgical dressing, sterile gauze, tourniquets, analgesics', is_perishable: false },
    { resource_id: 2, category: 'Medical Supplies', resource_name: 'ORS Sachet Bundles', unit: 'boxes', description: 'Oral rehydration salts packets for dehydration prevention (100 per box)', is_perishable: true },
    { resource_id: 3, category: 'Food & Water', resource_name: 'Clean Packaged Drinking Water (20L)', unit: 'cans', description: 'Mineral-filtered emergency water supply canisters', is_perishable: true },
    { resource_id: 4, category: 'Food & Water', resource_name: 'High Energy Ration Biscuits', unit: 'cartons', description: 'Fortified emergency meal replacement rations (50 packs per carton)', is_perishable: true },
    { resource_id: 5, category: 'Shelter & Bedding', resource_name: 'Waterproof Family Tent (6-Person)', unit: 'units', description: 'Heavy-duty poly-canvas all-weather emergency shelters', is_perishable: false },
    { resource_id: 6, category: 'Sanitation', resource_name: 'Chlorine Water Purification Tablets', unit: 'bottles', description: 'Effervescent tablets purifying 1000L water per bottle', is_perishable: false }
  ],
  inventory: [
    { warehouse_id: 1, warehouse_name: 'Bengaluru Apex Strategic Reserve', resource_id: 1, resource_name: 'Trauma First Aid Kit', category: 'Medical Supplies', unit: 'kits', quantity_available: 850.00, minimum_threshold: 100.00, deficit: 0, last_updated: '2026-10-26 12:00:00' },
    { warehouse_id: 1, warehouse_name: 'Bengaluru Apex Strategic Reserve', resource_id: 2, resource_name: 'ORS Sachet Bundles', category: 'Medical Supplies', unit: 'boxes', quantity_available: 1200.00, minimum_threshold: 150.00, deficit: 0, last_updated: '2026-10-26 12:00:00' },
    { warehouse_id: 1, warehouse_name: 'Bengaluru Apex Strategic Reserve', resource_id: 3, resource_name: 'Clean Packaged Drinking Water (20L)', category: 'Food & Water', unit: 'cans', quantity_available: 5000.00, minimum_threshold: 500.00, deficit: 0, last_updated: '2026-10-26 12:00:00' },
    { warehouse_id: 1, warehouse_name: 'Bengaluru Apex Strategic Reserve', resource_id: 4, resource_name: 'High Energy Ration Biscuits', category: 'Food & Water', unit: 'cartons', quantity_available: 3400.00, minimum_threshold: 400.00, deficit: 0, last_updated: '2026-10-26 12:00:00' },
    { warehouse_id: 1, warehouse_name: 'Bengaluru Apex Strategic Reserve', resource_id: 5, resource_name: 'Waterproof Family Tent (6-Person)', category: 'Shelter & Bedding', unit: 'units', quantity_available: 450.00, minimum_threshold: 50.00, deficit: 0, last_updated: '2026-10-26 12:00:00' },
    { warehouse_id: 1, warehouse_name: 'Bengaluru Apex Strategic Reserve', resource_id: 6, resource_name: 'Chlorine Water Purification Tablets', category: 'Sanitation', unit: 'bottles', quantity_available: 2000.00, minimum_threshold: 250.00, deficit: 0, last_updated: '2026-10-26 12:00:00' },
    { warehouse_id: 2, warehouse_name: 'Mangaluru Maritime Supply Depot', resource_id: 1, resource_name: 'Trauma First Aid Kit', category: 'Medical Supplies', unit: 'kits', quantity_available: 400.00, minimum_threshold: 80.00, deficit: 0, last_updated: '2026-10-26 12:00:00' },
    { warehouse_id: 2, warehouse_name: 'Mangaluru Maritime Supply Depot', resource_id: 2, resource_name: 'ORS Sachet Bundles', category: 'Medical Supplies', unit: 'boxes', quantity_available: 750.00, minimum_threshold: 100.00, deficit: 0, last_updated: '2026-10-26 12:00:00' },
    { warehouse_id: 2, warehouse_name: 'Mangaluru Maritime Supply Depot', resource_id: 3, resource_name: 'Clean Packaged Drinking Water (20L)', category: 'Food & Water', unit: 'cans', quantity_available: 2800.00, minimum_threshold: 300.00, deficit: 0, last_updated: '2026-10-26 12:00:00' },
    { warehouse_id: 2, warehouse_name: 'Mangaluru Maritime Supply Depot', resource_id: 4, resource_name: 'High Energy Ration Biscuits', category: 'Food & Water', unit: 'cartons', quantity_available: 1500.00, minimum_threshold: 200.00, deficit: 0, last_updated: '2026-10-26 12:00:00' },
    { warehouse_id: 2, warehouse_name: 'Mangaluru Maritime Supply Depot', resource_id: 5, resource_name: 'Waterproof Family Tent (6-Person)', category: 'Shelter & Bedding', unit: 'units', quantity_available: 35.00, minimum_threshold: 40.00, deficit: 5.00, last_updated: '2026-10-26 12:00:00' },
    { warehouse_id: 2, warehouse_name: 'Mangaluru Maritime Supply Depot', resource_id: 6, resource_name: 'Chlorine Water Purification Tablets', category: 'Sanitation', unit: 'bottles', quantity_available: 120.00, minimum_threshold: 150.00, deficit: 30.00, last_updated: '2026-10-26 12:00:00' }
  ],
  requests: [
    {
      request_id: 1,
      camp_id: 1,
      camp_name: 'Madikeri Primary Relief Center',
      disaster_id: 1,
      disaster_name: 'Flash Floods Kodagu 2026',
      requested_by: 3,
      requester_name: 'Vikram Rathore',
      requested_at: '2026-08-11 08:30:00',
      need_by: '2026-08-11 18:00:00',
      priority_score: 95,
      priority_level: 'CRITICAL' as const,
      status: 'Pending' as const,
      medical_emergency: true,
      remarks: 'Urgent outbreak of waterborne gastroenteritis among 60 children. Needs immediate ORS and IV kits.',
      items: [
        { resource_id: 1, resource_name: 'Trauma First Aid Kit', quantity_requested: 50.00, unit: 'kits' },
        { resource_id: 2, resource_name: 'ORS Sachet Bundles', quantity_requested: 200.00, unit: 'boxes' }
      ]
    },
    {
      request_id: 2,
      camp_id: 1,
      camp_name: 'Madikeri Primary Relief Center',
      disaster_id: 1,
      disaster_name: 'Flash Floods Kodagu 2026',
      requested_by: 3,
      requester_name: 'Vikram Rathore',
      requested_at: '2026-08-11 10:00:00',
      need_by: '2026-08-12 12:00:00',
      priority_score: 70,
      priority_level: 'HIGH' as const,
      status: 'Approved' as const,
      medical_emergency: false,
      remarks: 'Fresh drinking water supplies running critically low after river sedimentation.',
      items: [
        { resource_id: 3, resource_name: 'Clean Packaged Drinking Water (20L)', quantity_requested: 600.00, unit: 'cans' }
      ]
    },
    {
      request_id: 3,
      camp_id: 2,
      camp_name: 'Surathkal Coastal Evac Camp',
      disaster_id: 2,
      disaster_name: 'Cyclone Sagar Coastal Surge',
      requested_by: 4,
      requester_name: 'Priya Kulkarni',
      requested_at: '2026-09-03 14:00:00',
      need_by: '2026-09-04 08:00:00',
      priority_score: 85,
      priority_level: 'CRITICAL' as const,
      status: 'Pending' as const,
      medical_emergency: true,
      remarks: 'Multiple flood trauma injuries requiring sterile bandages and pain relief.',
      items: [
        { resource_id: 1, resource_name: 'Trauma First Aid Kit', quantity_requested: 100.00, unit: 'kits' },
        { resource_id: 6, resource_name: 'Chlorine Water Purification Tablets', quantity_requested: 150.00, unit: 'bottles' }
      ]
    }
  ],
  deliveries: [
    {
      delivery_id: 1,
      allocation_id: 101,
      vehicle_id: 1,
      vehicle_number: 'KA-01-EA-1001',
      vehicle_type: 'Heavy Logistics Truck',
      driver_name: 'Mohan Das (Driver)',
      source_location: 'Central Warehouse Hub Bengaluru',
      dest_location: 'Madikeri Primary Relief Center',
      dept_time: '2026-10-26 09:30:00',
      expected_arrival: '2026-10-26 16:30:00',
      actual_arrival: null,
      status: 'In Transit' as const,
      target_camp: 'Madikeri Primary Relief Center'
    },
    {
      delivery_id: 2,
      allocation_id: 102,
      vehicle_id: 3,
      vehicle_number: 'KA-19-TR-4020',
      vehicle_type: 'All-Terrain Amphibious Truck',
      driver_name: 'Karthik Rao',
      source_location: 'North Coast Warehouse Mangaluru',
      dest_location: 'Surathkal Coastal Evac Camp',
      dept_time: '2026-10-26 11:00:00',
      expected_arrival: '2026-10-26 13:00:00',
      actual_arrival: '2026-10-26 12:45:00',
      status: 'Completed' as const,
      target_camp: 'Surathkal Coastal Evac Camp'
    }
  ],
  vehicles: [
    { vehicle_id: 1, number: 'KA-01-EA-1001', type: 'Heavy Logistics Truck', capacity: 15.00, status: 'IN_TRANSIT', current_location: 'NH-75 en route to Madikeri' },
    { vehicle_id: 2, number: 'KA-01-EA-1002', type: 'High-Clearance 4x4 Van', capacity: 3.50, status: 'AVAILABLE', current_location: 'Bengaluru Hub' },
    { vehicle_id: 3, number: 'KA-19-TR-4020', type: 'All-Terrain Amphibious Truck', capacity: 8.00, status: 'AVAILABLE', current_location: 'Mangaluru Depot' },
    { vehicle_id: 4, number: 'KA-19-AM-9901', type: 'Emergency Medical Ambulance', capacity: 1.50, status: 'AVAILABLE', current_location: 'Surathkal Camp' }
  ],
  telemetryLogs: [
    {
      delivery_id: 1,
      vehicle_id: 1,
      vehicle_number: 'KA-01-EA-1001',
      timestamp: '2026-10-26T12:45:00Z',
      gps: { lat: 12.723, lng: 76.211, speed_kmh: 58 },
      cargo: { temp_c: 4.2, humidity: 48, door_opened: false },
      fuel_pct: 78,
      anomaly: false
    },
    {
      delivery_id: 1,
      vehicle_id: 1,
      vehicle_number: 'KA-01-EA-1001',
      timestamp: '2026-10-26T12:50:00Z',
      gps: { lat: 12.684, lng: 76.102, speed_kmh: 42 },
      cargo: { temp_c: 8.9, humidity: 52, door_opened: true },
      fuel_pct: 76,
      anomaly: true,
      anomaly_reason: 'Door opened alert & Cold-chain temperature spiked above 8°C!'
    }
  ]
};
