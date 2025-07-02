const fs = require('fs');

const envPath = './.env';

try {
  const content = fs.readFileSync(envPath, { encoding: 'utf8' });
  // Tulis ulang tanpa BOM
  fs.writeFileSync(envPath, content, { encoding: 'utf8', flag: 'w' });
  console.log('✅ .env file has been rewritten as UTF-8 without BOM!');
} catch (err) {
  console.error('❌ Failed to rewrite .env:', err.message);
} 