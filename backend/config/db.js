// =============================================================
// DATABASE CONNECTION (config/db.js)
// This file creates one shared database connection pool.
// A "pool" means we reuse connections instead of opening
// a new one for every query — much more efficient.
// =============================================================

const { Pool } = require('pg'); // 'pg' is the PostgreSQL library for Node.js

// Create a connection pool using the DATABASE_URL from .env
// Format: postgresql://username:password@host:port/database_name
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  // In production (Render), the DB uses SSL encryption
  // This setting makes it work without a certificate file
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

// Test the connection when the app starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release(); // Return the connection back to the pool
  }
});

// Export so other files can use: const db = require('./config/db')
module.exports = pool;
