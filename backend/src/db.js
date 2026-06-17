/* backend/src/db.js
   PostgreSQL implementation – supersedes SQLite.
*/

const { Pool } = require('pg');
const crypto = require('crypto');

// -----------------------------------------------------
// PostgreSQL Pool
// -----------------------------------------------------
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host:     'aws-1-ap-southeast-2.pooler.supabase.com',
        port:     6543,
        database: 'postgres',
        user:     'postgres.ccizqfpxoizccnbjbedb',
        password: 'Arun3011***',
        ssl:      { rejectUnauthorized: false }
      }
);

// Helper to convert SQLite '?' placeholders to PostgreSQL '$n'
function formatSql(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// -----------------------------------------------------
// Compatibility wrappers (maintain same API as previous SQLite code)
// -----------------------------------------------------
async function query(text, params = []) {
  const formatted = formatSql(text);
  const res = await pool.query(formatted, params);
  return res.rows;
}

async function get(text, params = []) {
  const formatted = formatSql(text);
  const res = await pool.query(formatted, params);
  return res.rows[0];
}

/**
 * `run` mimics sqlite3.run – returns an object with `id` (last insert id)
 * and `changes` (rowCount). For INSERTs `id` is the generated primary key.
 */
async function run(text, params = []) {
  const formatted = formatSql(text);
  const res = await pool.query(formatted, params);
  const id = res.rows[0] ? res.rows[0].id : null;
  return { id, changes: res.rowCount };
}

// -----------------------------------------------------
// Password hashing utilities (unchanged)
// -----------------------------------------------------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, hash] = storedHash.split(':');
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === checkHash;
}

// -----------------------------------------------------
// Database schema initialization
// -----------------------------------------------------
const initDb = async () => {
  try {
    // 1. Membership Tiers
    await run(`
      CREATE TABLE IF NOT EXISTS membership_tiers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        discount_percentage REAL DEFAULT 0.0 CHECK (discount_percentage >= 0.0 AND discount_percentage <= 100.0),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Users
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER', 'STYLIST')),
        membership_tier_id INTEGER REFERENCES membership_tiers(id),
        status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
        profile_photo_url TEXT,
        phone TEXT,
        notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": false}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )
    `);

    // 3. User Activity Logs
    await run(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        action TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Audit Logs
    await run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        actor_id INTEGER REFERENCES users(id),
        action TEXT NOT NULL,
        target_table TEXT NOT NULL,
        target_id TEXT NOT NULL,
        previous_state TEXT,
        new_state TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Service Categories
    await run(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )
    `);

    // 6. Services
    await run(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        category_id INTEGER NOT NULL REFERENCES service_categories(id),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
        price REAL NOT NULL CHECK (price >= 0.0),
        discount_price REAL CHECK (discount_price >= 0.0),
        image_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_available BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (category_id) REFERENCES service_categories(id)
      )
    `);

    // 7. Service Images
    await run(`
      CREATE TABLE IF NOT EXISTS service_images (
        id SERIAL PRIMARY KEY,
        service_id INTEGER NOT NULL REFERENCES services(id),
        image_url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ PostgreSQL schema initialized');
  } catch (err) {
    console.error('❌ Error initializing DB schema:', err);
    throw err;
  }
};

module.exports = {
  pool,
  query,
  get,
  run,
  hashPassword,
  verifyPassword,
  initDb
};
