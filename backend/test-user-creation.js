const { createConnection } = require('typeorm');
require('dotenv').config();

async function testUserCreation() {
  try {
    console.log('🔄 Testing user creation...');

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

    console.log('✅ Connected to PostgreSQL!');

    // Check tables
    const tables = await connection.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
    `);
    console.log('📋 Tables:', tables.map(t => t.tablename));

    // Try to create a test user
    const userRepo = connection.getRepository('User');
    const testUser = userRepo.create({
      phoneNumber: '+1234567890',
      password: 'hashedpassword',
      name: 'Test User',
      accountType: 'agent',
      skills: ['test'],
      isActive: true,
    });

    const savedUser = await userRepo.save(testUser);
    console.log('✅ User created successfully:', savedUser.id);

    await connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('🔍 Full error:', error);
  }
}

testUserCreation();