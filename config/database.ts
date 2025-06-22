// Purpose: Database connection pool configuration.
// This file sets up a MySQL connection pool using environment variables.
// It provides a promise-based interface for database interactions throughout the application.
import mysql from 'mysql2/promise';
import { PoolOptions } from 'mysql2/promise';

// Hardcoded DB config for development
const poolOptions: PoolOptions = {
  host: 'localhost',
  user: 'root',
  password: 'DanishQureshi@1212',
  database: 'election_management_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(poolOptions);

export default pool; 