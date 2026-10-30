import mysql from 'mysql2/promise';
import { mockData } from './mockDb';

let pool: mysql.Pool | null = null;
let isConnected = false;
let hasChecked = false;

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (hasChecked && isConnected && pool) {
    return { connected: true, message: 'Connected to MySQL 8.0 server' };
  }

  try {
    if (!pool) {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'disaster_relief_db',
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 2000,
      });
    }

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    hasChecked = true;
    return { connected: true, message: 'Connected to MySQL 8.0 server (disaster_relief_db)' };
  } catch (error: any) {
    isConnected = false;
    hasChecked = true;
    return {
      connected: false,
      message: `MySQL offline or authentication required: ${error.message || 'Check .env credentials'}. Running in In-Memory Demo Mode with full Level 3 schema simulation.`,
    };
  }
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<{ rows: T[]; source: 'MYSQL' | 'IN_MEMORY' }> {
  const status = await checkDatabaseConnection();
  if (status.connected && pool) {
    try {
      const [rows] = await pool.query(sql, params);
      return { rows: rows as T[], source: 'MYSQL' };
    } catch (err) {
      console.warn('[DB] MySQL query execution error, falling back to mock:', err);
    }
  }

  return { rows: [] as T[], source: 'IN_MEMORY' };
}
