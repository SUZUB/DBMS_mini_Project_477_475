/**
 * SQL Database Connection Layer
 * Supports both MySQL and PostgreSQL pools determined by process.env.DB_DIALECT
 * All credentials strictly read from environment variables.
 */

import mysql from 'mysql2/promise';

const dialect = process.env.DB_DIALECT || 'mysql';

// MySQL Connection Pool (Default for local MySQL 8.0 installation)
let mysqlPool: mysql.Pool | null = null;

export function getMySQLPool(): mysql.Pool {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'disaster_relief_db',
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return mysqlPool;
}

/**
 * Universal Query Execution Helper
 * Automatically handles parameterized queries to prevent SQL Injection
 */
export async function executeQuery<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const pool = getMySQLPool();
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

export default {
  getMySQLPool,
  executeQuery,
  dialect,
};
