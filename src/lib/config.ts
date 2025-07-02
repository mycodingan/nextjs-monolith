// Konfigurasi aplikasi tanpa environment variables
export const appConfig = {
  // Database configuration
  database: {
    host: 'localhost',
    user: 'root',
    password: '', // default Laragon kosong
    database: 'nearnnext_db',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
  
  // JWT configuration
  jwt: {
    secret: 'your-super-secret-jwt-key-change-this-in-production-2024',
    expiresIn: '7d',
  },
  
  // App configuration
  app: {
    name: 'NearnNext',
    version: '1.0.0',
    port: 3000,
    baseUrl: 'http://localhost:3000',
  },
  
  // Security
  security: {
    bcryptRounds: 10,
    tokenPrefix: 'Bearer ',
  }
}; 