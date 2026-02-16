/**
 * Database initialization script
 * Run with: npm run db:init
 *
 * This will create the database, tables, and seed data.
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function initDatabase() {
  // Connect without specifying a database first
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    multipleStatements: true,
  });

  try {
    console.log('Connected to MySQL server.');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('Running schema...');
    await connection.query(schema);
    console.log('Schema created successfully.');

    // Read and execute seed data
    const seedPath = path.join(__dirname, 'seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    console.log('Running seed data...');
    await connection.query(seed);
    console.log('Seed data inserted successfully.');

    console.log('\nDatabase initialization complete!');
    console.log('Demo account: demo@volleyball.app / password123');
  } catch (error) {
    console.error('Database initialization error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();
