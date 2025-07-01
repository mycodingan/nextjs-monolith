const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');

  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // default Laragon kosong
    database: 'nearnnext_db',
    port: 3306,
  };

  try {
    // Test koneksi
    console.log('📡 Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully!\n');

    // Test query sederhana
    console.log('🔍 Testing simple query...');
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
    console.log('✅ Query test:', rows[0], '\n');

    // Cek tables
    console.log('📋 Checking tables...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'nearnnext_db'
    `);
    
    console.log('📊 Found tables:');
    for (const table of tables) {
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table.TABLE_NAME}`);
      console.log(`  - ${table.TABLE_NAME}: ${count[0].count} records`);
    }

    // Test sample data
    console.log('\n👥 Checking sample users...');
    const [users] = await connection.execute('SELECT id, name, email, role FROM users LIMIT 3');
    console.log('✅ Sample users:', users);

    console.log('\n📝 Checking sample posts...');
    const [posts] = await connection.execute('SELECT id, title, published FROM posts LIMIT 3');
    console.log('✅ Sample posts:', posts);

    await connection.end();
    console.log('\n🎉 Database test completed successfully!');

  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Make sure Laragon MySQL is running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solution: Check username/password in Laragon');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Solution: Run the SQL script in HeidiSQL first');
    }
  }
}

// Jalankan test
testDatabaseConnection(); 