// Utility script to clear all call records from the database
// Usage (from project root):
//   node backend/scripts/clear-calls.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'callcenter',
  });

  try {
    console.log('Connecting to database to clear calls...');
    await client.connect();

    const result = await client.query('DELETE FROM calls');
    console.log(`✅ Deleted ${result.rowCount} call(s) from calls table.`);
  } catch (err) {
    console.error('❌ Failed to clear calls table:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
