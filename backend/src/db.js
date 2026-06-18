/* backend/src/db.js
   PostgreSQL / Supabase Transaction Pooler – Render compatible.
   Fully self-contained: schema, seed data, helpers.
*/

const { Pool } = require('pg');
const crypto   = require('crypto');

// ─── Startup validation ───────────────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing. Set it in the Render dashboard.');
}

try {
  console.log('🔌 Connecting to DB host:', new URL(process.env.DATABASE_URL).hostname);
} catch {
  console.log('🔌 DATABASE_URL is set (unable to parse host).');
}

// ─── Pool ─────────────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }          // required for Supabase pooler
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err.message);
});

// ─── SQL helper: ? → $1, $2, … ───────────────────────────────────────────────
function formatSql(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// ─── Compatibility wrappers ───────────────────────────────────────────────────
async function query(text, params = []) {
  const res = await pool.query(formatSql(text), params);
  return res.rows;
}

async function get(text, params = []) {
  const res = await pool.query(formatSql(text), params);
  return res.rows[0];
}

/**
 * run() – INSERT / UPDATE / DELETE helper.
 * Automatically appends RETURNING id to INSERT statements so the
 * caller always receives { id, changes } without needing to add
 * RETURNING manually everywhere.
 */
async function run(text, params = []) {
  let sql = text.trim();

  // Auto-append RETURNING id to INSERT statements (idempotent)
  const isInsert = /^INSERT\s/i.test(sql);
  if (isInsert && !/RETURNING/i.test(sql)) {
    sql = sql.replace(/;?\s*$/, '') + ' RETURNING id';
  }

  const res = await pool.query(formatSql(sql), params);
  const id  = res.rows[0] ? res.rows[0].id : null;
  return { id, changes: res.rowCount };
}

/**
 * withTransaction(fn) – executes fn(client) inside a PG transaction.
 * Auto-commits on success, rolls back on error, always releases client.
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await fn(client);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── Password utilities ───────────────────────────────────────────────────────
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, hash] = storedHash.split(':');
  const checkHash    = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === checkHash;
}

// ─── Schema + Seed ────────────────────────────────────────────────────────────
const initDb = async () => {
  try {
    // 1. Membership Tiers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS membership_tiers (
        id                   SERIAL PRIMARY KEY,
        name                 TEXT   NOT NULL UNIQUE,
        discount_percentage  REAL   DEFAULT 0.0 CHECK (discount_percentage >= 0.0 AND discount_percentage <= 100.0),
        description          TEXT,
        created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id                        SERIAL PRIMARY KEY,
        email                     TEXT NOT NULL UNIQUE,
        password_hash             TEXT NOT NULL,
        name                      TEXT NOT NULL,
        role                      TEXT NOT NULL CHECK (role IN ('ADMIN','USER','STYLIST')),
        membership_tier_id        INTEGER REFERENCES membership_tiers(id),
        status                    TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','INACTIVE')),
        profile_photo_url         TEXT,
        phone                     TEXT,
        notification_preferences  JSONB DEFAULT '{"email":true,"sms":false,"push":false}',
        created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at                TIMESTAMP NULL
      )
    `);

    // 3. Stylists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stylists (
        id                 SERIAL PRIMARY KEY,
        user_id            INTEGER NOT NULL REFERENCES users(id),
        bio                TEXT,
        specialization     TEXT,
        experience_years   INTEGER DEFAULT 0,
        employment_status  TEXT DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE','INACTIVE','TERMINATED')),
        average_rating     REAL DEFAULT 5.0,
        created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at         TIMESTAMP NULL
      )
    `);

    // 4. Service Categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id          SERIAL PRIMARY KEY,
        name        TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at  TIMESTAMP NULL
      )
    `);

    // 5. Services
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id               SERIAL PRIMARY KEY,
        category_id      INTEGER NOT NULL REFERENCES service_categories(id),
        name             TEXT NOT NULL UNIQUE,
        description      TEXT,
        duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
        price            REAL NOT NULL CHECK (price >= 0.0),
        discount_price   REAL CHECK (discount_price >= 0.0),
        image_url        TEXT,
        display_order    INTEGER DEFAULT 0,
        is_available     BOOLEAN DEFAULT true,
        is_featured      BOOLEAN DEFAULT false,
        status           TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at       TIMESTAMP NULL
      )
    `);

    // 6. Service Images
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_images (
        id          SERIAL PRIMARY KEY,
        service_id  INTEGER NOT NULL REFERENCES services(id),
        image_url   TEXT NOT NULL,
        is_primary  BOOLEAN DEFAULT false,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Stylist Services (join)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stylist_services (
        id          SERIAL PRIMARY KEY,
        stylist_id  INTEGER NOT NULL REFERENCES stylists(id),
        service_id  INTEGER NOT NULL REFERENCES services(id),
        UNIQUE (stylist_id, service_id)
      )
    `);

    // 8. Stylist Availability
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stylist_availability (
        id          SERIAL PRIMARY KEY,
        stylist_id  INTEGER NOT NULL REFERENCES stylists(id),
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        start_time  TEXT DEFAULT '09:00',
        end_time    TEXT DEFAULT '18:00'
      )
    `);

    // 9. Bookings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id               TEXT PRIMARY KEY,
        user_id          INTEGER NOT NULL REFERENCES users(id),
        stylist_id       INTEGER NOT NULL REFERENCES stylists(id),
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        status           TEXT DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW')),
        payment_status   TEXT DEFAULT 'PENDING'   CHECK (payment_status IN ('PENDING','PAID','REFUNDED','FAILED','COMPLETED')),
        total_price      REAL NOT NULL,
        notes            TEXT,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at       TIMESTAMP NULL
      )
    `);

    // 10. Booking Services (join)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_services (
        id               SERIAL PRIMARY KEY,
        booking_id       TEXT NOT NULL REFERENCES bookings(id),
        service_id       INTEGER NOT NULL REFERENCES services(id),
        price_charged    REAL,
        duration_minutes INTEGER
      )
    `);

    // 11. Payments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id                    SERIAL PRIMARY KEY,
        booking_id            TEXT NOT NULL REFERENCES bookings(id),
        amount                REAL NOT NULL,
        payment_method        TEXT DEFAULT 'CREDIT_CARD',
        payment_status        TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING','COMPLETED','REFUNDED','FAILED')),
        transaction_reference TEXT,
        invoice_number        TEXT,
        created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 12. Booking Reschedule History
    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_reschedule_history (
        id             SERIAL PRIMARY KEY,
        booking_id     TEXT NOT NULL REFERENCES bookings(id),
        previous_date  TEXT,
        previous_time  TEXT,
        new_date       TEXT,
        new_time       TEXT,
        reason         TEXT,
        rescheduled_by INTEGER REFERENCES users(id),
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 13. User Activity Logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id),
        action      TEXT NOT NULL,
        ip_address  TEXT,
        user_agent  TEXT,
        details     TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 14. Audit Logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id              SERIAL PRIMARY KEY,
        actor_id        INTEGER REFERENCES users(id),
        action          TEXT NOT NULL,
        target_table    TEXT NOT NULL,
        target_id       TEXT NOT NULL,
        previous_state  TEXT,
        new_state       TEXT,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ PostgreSQL schema initialized');

    // ── Seed default membership tiers ────────────────────────────────────────
    await pool.query(`
      INSERT INTO membership_tiers (name, discount_percentage, description)
      VALUES
        ('STANDARD',        0,  'Standard membership'),
        ('PLATINUM MEMBER', 10, 'Platinum membership with 10% discount'),
        ('DIAMOND TIER',    20, 'Diamond membership with 20% discount')
      ON CONFLICT (name) DO NOTHING
    `);

    // ── Seed admin accounts (admin@gmail.com AND admin@trendtrim.com) ─────────
    const adminHash1 = hashPassword('adminlb123');
    const adminHash2 = hashPassword('admin');

    await pool.query(
      `INSERT INTO users (email, password_hash, name, role, status)
       VALUES ($1, $2, $3, 'ADMIN', 'ACTIVE')
       ON CONFLICT (email) DO NOTHING`,
      ['admin@gmail.com', adminHash1, 'TrendTrim Admin']
    );

    await pool.query(
      `INSERT INTO users (email, password_hash, name, role, status)
       VALUES ($1, $2, $3, 'ADMIN', 'ACTIVE')
       ON CONFLICT (email) DO NOTHING`,
      ['admin@trendtrim.com', adminHash2, 'TrendTrim Admin']
    );

    // ── Seed demo user (user@trendtrim.com / user) ────────────────────────────
    const platRow = await pool.query(
      `SELECT id FROM membership_tiers WHERE name = 'PLATINUM MEMBER'`
    );
    const platId = platRow.rows[0]?.id || null;

    const demoHash = hashPassword('user');
    await pool.query(
      `INSERT INTO users (email, password_hash, name, role, membership_tier_id, status)
       VALUES ($1, $2, $3, 'USER', $4, 'ACTIVE')
       ON CONFLICT (email) DO NOTHING`,
      ['user@trendtrim.com', demoHash, 'Demo User', platId]
    );

    console.log('✅ Seed accounts ready (admin@gmail.com, admin@trendtrim.com, user@trendtrim.com)');
  } catch (err) {
    console.error('❌ Error initializing DB schema:', err.message);
    throw err;
  }
};

module.exports = {
  pool,
  query,
  get,
  run,
  withTransaction,
  formatSql,
  hashPassword,
  verifyPassword,
  initDb
};
