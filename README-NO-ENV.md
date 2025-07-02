# NearnNext - Versi Tanpa Environment Variables

Project Next.js dengan JWT Authentication tanpa menggunakan environment variables (.env).

## 🚀 Fitur Utama

- ✅ **JWT Authentication** - Login, Register, Token Verification
- ✅ **Database MySQL** - Konfigurasi hardcoded untuk Laragon
- ✅ **Password Hashing** - Menggunakan bcryptjs
- ✅ **Role-based Access** - User dan Admin roles
- ✅ **Protected API Routes** - Middleware protection
- ✅ **Tanpa Environment Variables** - Semua config di file `src/lib/config.ts`

## 📁 Struktur Project

```
src/
├── lib/
│   ├── config.ts          # Konfigurasi utama (database, JWT, dll)
│   ├── mysql.ts           # Database connection
│   └── auth.ts            # JWT authentication helpers
├── app/
│   ├── api/auth/          # Login & Register endpoints
│   ├── api/users/         # User management
│   └── api/posts/         # Posts management
└── middleware.ts          # API protection middleware
```

## ⚙️ Konfigurasi

Semua konfigurasi ada di `src/lib/config.ts`:

```typescript
export const config = {
  // Database configuration
  database: {
    host: 'localhost',
    user: 'root',
    password: '', // default Laragon kosong
    database: 'nearnnext_db',
    port: 3306,
  },
  
  // JWT configuration
  jwt: {
    secret: 'your-super-secret-jwt-key-change-this-in-production-2024',
    expiresIn: '7d',
  },
  
  // Security
  security: {
    bcryptRounds: 10,
    tokenPrefix: 'Bearer ',
  }
};
```

## 🛠️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
- Install Laragon (XAMPP/WAMP juga bisa)
- Buat database `nearnnext_db` di HeidiSQL/phpMyAdmin
- Jalankan migration:
```bash
npm run migrate:migrate
```

### 3. Run Development Server
```bash
npm run dev
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user

### Protected Routes (butuh JWT token)
- `GET /api/users` - Get semua users
- `POST /api/posts` - Create post baru
- `GET /api/posts` - Get semua posts

## 📝 Contoh Penggunaan

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Keuntungan Versi Ini

1. **Mudah Setup** - Tidak perlu file .env
2. **Portable** - Bisa langsung clone dan run
3. **JWT Tetap Aman** - Secret key di config file
4. **Database Ready** - Konfigurasi Laragon default
5. **Development Friendly** - Debug logs lengkap

## ⚠️ Catatan Keamanan

- **JWT Secret**: Ganti secret key di `config.ts` untuk production
- **Database Password**: Sesuaikan dengan setup database Anda
- **HTTPS**: Gunakan HTTPS di production
- **Rate Limiting**: Tambahkan rate limiting untuk API endpoints

## 🚀 Production Deployment

Untuk production, edit `src/lib/config.ts`:

```typescript
export const config = {
  database: {
    host: 'your-production-host',
    user: 'your-db-user',
    password: 'your-db-password',
    database: 'your-db-name',
    port: 3306,
  },
  jwt: {
    secret: 'your-super-secure-production-secret-key',
    expiresIn: '7d',
  },
  // ... rest of config
};
```

## 📊 Database Schema

Project ini menggunakan schema dari folder `migrations/`:
- `users` - User accounts
- `categories` - Post categories  
- `posts` - Blog posts
- `comments` - Post comments

Jalankan migration untuk setup database:
```bash
npm run migrate:migrate
``` 