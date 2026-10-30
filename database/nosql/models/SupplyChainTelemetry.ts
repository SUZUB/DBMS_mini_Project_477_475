/**
 * Secondary Database Model: Real-Time Supply Chain Telemetry (NoSQL Strategy)
 *
 * Justification: Transit dispatches and refrigerated medication trucks continuously
 * emit IoT telemetry packets every 5-30 seconds. Ingesting this into an append-heavy
 * NoSQL collection with TTL (Time-To-Live) indexes prevents SQL table bloat while
 * enabling live dashboard map tracking and temperature alert detection.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupplyChainTelemetry extends Document {
  delivery_id: number;     // References SQL DELIVERY(delivery_id)
  vehicle_id: number;      // References SQL VEHICLE(vehicle_id)
  recorded_at: Date;
  gps_coordinates: {
    latitude: number;
    longitude: number;
    speed_kmh?: number;
    heading_degrees?: number;
  };
  cargo_sensors?: {
    temperature_celsius?: number;
    humidity_percentage?: number;
    door_opened?: boolean;
    shock_detected_g?: number;
  };
  fuel_level_percentage?: number;
  anomaly_detected?: boolean;
  anomaly_reason?: string;
}

const SupplyChainTelemetrySchema: Schema = new Schema(
  {
    delivery_id: { type: Number, required: true, index: true },
    vehicle_id: { type: Number, required: true, index: true },
    recorded_at: { type: Date, default: Date.now, index: true },
    gps_coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      speed_kmh: { type: Number },
      heading_degrees: { type: Number },
    },
    cargo_sensors: {
      temperature_celsius: { type: Number },
      humidity_percentage: { type: Number },
      door_opened: { type: Boolean, default: false },
      shock_detected_g: { type: Number },
    },
    fuel_level_percentage: { type: Number, min: 0, max: 100 },
    anomaly_detected: { type: Boolean, default: false, index: true },
    anomaly_reason: { type: String },
  },
  {
    collection: 'supply_chain_telemetry',
    // Automatically prune raw high-frequency telemetry older than 90 days
    expireAfterSeconds: 7776000, 
  }
);

SupplyChainTelemetrySchema.index({ delivery_id: 1, recorded_at: -1 });

export const SupplyChainTelemetry: Model<ISupplyChainTelemetry> =
  mongoose.models.SupplyChainTelemetry ||
  mongoose.model<ISupplyChainTelemetry>('SupplyChainTelemetry', SupplyChainTelemetrySchema);

export default SupplyChainTelemetry;
