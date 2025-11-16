const { createConnection } = require('typeorm');

async function testConnection() {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'callcenter',
      synchronize: false,
      logging: true,
    });

    console.log('✅ Connected to PostgreSQL successfully!');

    // Check if tables exist
    const tables = await connection.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND (tablename LIKE '%user%' OR tablename LIKE '%agent%' OR tablename LIKE '%status%')
    `);

    console.log('📋 Existing tables:', tables.map(t => t.tablename));

    await connection.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Full error:', error);
  }
}

testConnection();
