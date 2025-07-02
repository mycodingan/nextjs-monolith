const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Konfigurasi database
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'nearnnext_db',
  port: 3306,
};

async function updatePassword() {
  console.log('🔧 Updating admin password...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully!');
    
    // Generate new password hash
    const newPassword = 'password123';
    const newHash = await bcrypt.hash(newPassword, 10);
    
    console.log('🔄 New password hash generated');
    
    // Update password untuk admin user
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [newHash, 'user@example.com']
    );
    
    console.log('✅ Password updated successfully!');
    console.log('📧 Email: user@example.com');
    console.log('🔐 Password: password123');
    console.log('📊 Rows affected:', result.affectedRows);
    
    // Verify the update
    const [userRows] = await connection.execute(
      'SELECT email, password FROM users WHERE email = ?',
      ['user@example.com']
    );
    
    if (userRows.length > 0) {
      const isPasswordValid = await bcrypt.compare(newPassword, userRows[0].password);
      console.log('✅ Password verification test:', isPasswordValid ? 'SUCCESS' : 'FAILED');
    }
    
    await connection.end();
    console.log('✅ Password update completed!');
    
  } catch (error) {
    console.error('❌ Password update failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno
    });
  }
}

// Jalankan update
updatePassword(); 