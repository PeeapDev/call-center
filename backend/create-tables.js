const { createConnection } = require('typeorm');
require('dotenv').config();

async function createTables() {
  try {
    console.log('🔄 Connecting to PostgreSQL...');

    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'callcenter',
      entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    });

    console.log('✅ Connected and synchronized!');

    // Check tables again
    const tables = await connection.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
    `);

    console.log('📋 Created tables:', tables.map(t => t.tablename));

    await connection.close();
    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('🔍 Full error:', error);
  }
}

createTables();