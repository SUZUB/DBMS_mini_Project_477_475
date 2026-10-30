/**
 * Secondary Database Model: Volunteer Action Logs (NoSQL Strategy)
 *
 * Justification: Field volunteers generate high-velocity, semi-structured events
 * with variable payloads (e.g. photos, voice note metadata, triage scores, GPS breadcrumbs).
 * A document store provides schema flexibility and rapid ingestion without locking
 * relational tables.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVolunteerActionLog extends Document {
  volunteer_id: number;              // References SQL VOLUNTEER(volunteer_id)
  disaster_id?: number;              // References SQL DISASTER(disaster_id)
  action_type: 'CHECK_IN' | 'TRIAGE_ASSESSMENT' | 'DISTRIBUTION' | 'FIRST_AID' | 'INCIDENT_REPORT' | 'SOS_ESCALATION';
  timestamp: Date;
  location: {
    type: 'Point';
    coordinates: [number, number];   // [longitude, latitude] GeoJSON format
    accuracy_meters?: number;
    elevation_meters?: number;
  };
  payload: Record<string, unknown>;  // Flexible, dynamic payload (e.g. patients treated, goods handed over)
  device_metadata: {
    device_id?: string;
    battery_level?: number;
    network_status?: 'ONLINE' | 'OFFLINE_SYNC' | 'SATELLITE';
    app_version?: string;
  };
  verification_status: 'PENDING' | 'VERIFIED' | 'FLAGGED';
}

const VolunteerActionLogSchema: Schema = new Schema(
  {
    volunteer_id: { type: Number, required: true, index: true },
    disaster_id: { type: Number, index: true },
    action_type: {
      type: String,
      required: true,
      enum: ['CHECK_IN', 'TRIAGE_ASSESSMENT', 'DISTRIBUTION', 'FIRST_AID', 'INCIDENT_REPORT', 'SOS_ESCALATION'],
      index: true,
    },
    timestamp: { type: Date, default: Date.now, index: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      accuracy_meters: { type: Number },
      elevation_meters: { type: Number },
    },
    payload: { type: Schema.Types.Mixed, default: {} },
    device_metadata: {
      device_id: { type: String },
      battery_level: { type: Number },
      network_status: { type: String, enum: ['ONLINE', 'OFFLINE_SYNC', 'SATELLITE'], default: 'ONLINE' },
      app_version: { type: String },
    },
    verification_status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'FLAGGED'],
      default: 'PENDING',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'volunteer_action_logs',
  }
);

// 2dsphere index for geospatial proximity queries
VolunteerActionLogSchema.index({ location: '2dsphere' });
VolunteerActionLogSchema.index({ volunteer_id: 1, timestamp: -1 });

export const VolunteerActionLog: Model<IVolunteerActionLog> =
  mongoose.models.VolunteerActionLog ||
  mongoose.model<IVolunteerActionLog>('VolunteerActionLog', VolunteerActionLogSchema);

export default VolunteerActionLog;
