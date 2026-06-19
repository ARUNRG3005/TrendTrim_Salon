/* backend/src/db.js
   PostgreSQL / Supabase Transaction Pooler – Render compatible.
   Full schema (18 tables) + seed data.
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
  ssl: { rejectUnauthorized: false }
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
 * run() — INSERT/UPDATE/DELETE helper.
 * Auto-appends RETURNING id to INSERT statements.
 */
async function run(text, params = []) {
  let sql = text.trim();
  const isInsert = /^INSERT\s/i.test(sql);
  if (isInsert && !/RETURNING/i.test(sql)) {
    sql = sql.replace(/;?\s*$/, '') + ' RETURNING id';
  }
  const res = await pool.query(formatSql(sql), params);
  const id  = res.rows[0] ? res.rows[0].id : null;
  return { id, changes: res.rowCount };
}

/**
 * withTransaction(fn) — runs fn(client) inside a PG transaction.
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

// ─── Schema ───────────────────────────────────────────────────────────────────
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

    // 9. Stylist Portfolio
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stylist_portfolio (
        id          SERIAL PRIMARY KEY,
        stylist_id  INTEGER NOT NULL REFERENCES stylists(id),
        image_url   TEXT NOT NULL,
        caption     TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Bookings
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

    // 11. Booking Services (join)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_services (
        id               SERIAL PRIMARY KEY,
        booking_id       TEXT NOT NULL REFERENCES bookings(id),
        service_id       INTEGER NOT NULL REFERENCES services(id),
        price_charged    REAL,
        duration_minutes INTEGER
      )
    `);

    // 12. Payments
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

    // 13. Refunds
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refunds (
        id                  SERIAL PRIMARY KEY,
        payment_id          INTEGER NOT NULL REFERENCES payments(id),
        booking_id          TEXT NOT NULL REFERENCES bookings(id),
        amount              REAL NOT NULL,
        reason              TEXT,
        refund_status       TEXT DEFAULT 'PENDING' CHECK (refund_status IN ('PENDING','COMPLETED','FAILED')),
        transaction_reference TEXT,
        processed_by        INTEGER REFERENCES users(id),
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 14. Reviews
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id          SERIAL PRIMARY KEY,
        booking_id  TEXT NOT NULL REFERENCES bookings(id),
        user_id     INTEGER NOT NULL REFERENCES users(id),
        stylist_id  INTEGER REFERENCES stylists(id),
        rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment     TEXT,
        is_featured BOOLEAN DEFAULT false,
        status      TEXT DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED','HIDDEN','PENDING')),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at  TIMESTAMP NULL
      )
    `);

    // 15. Booking Reschedule History
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

    // 16. Booking Cancellation Records
    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_cancellation_records (
        id              SERIAL PRIMARY KEY,
        booking_id      TEXT NOT NULL REFERENCES bookings(id),
        cancelled_by    INTEGER REFERENCES users(id),
        cancellation_reason TEXT,
        refund_issued   BOOLEAN DEFAULT false,
        refund_amount   REAL DEFAULT 0,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 17. User Activity Logs
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

    // 18. Audit Logs
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

    console.log('✅ PostgreSQL schema initialized (18 tables)');

    // ── SEED: Membership Tiers ────────────────────────────────────────────────
    await pool.query(`
      INSERT INTO membership_tiers (name, discount_percentage, description) VALUES
        ('STANDARD',        0,  'Standard membership'),
        ('PLATINUM MEMBER', 10, 'Platinum membership with 10% discount'),
        ('DIAMOND TIER',    20, 'Diamond membership with 20% discount'),
        ('VIP',             15, 'VIP membership with 15% discount')
      ON CONFLICT (name) DO NOTHING
    `);

    // ── SEED: Admin + Demo users ──────────────────────────────────────────────
    const diamondRow = await pool.query(`SELECT id FROM membership_tiers WHERE name = 'DIAMOND TIER'`);
    const platRow    = await pool.query(`SELECT id FROM membership_tiers WHERE name = 'PLATINUM MEMBER'`);
    const diamondId  = diamondRow.rows[0]?.id || null;
    const platId     = platRow.rows[0]?.id || null;

    await pool.query(
      `INSERT INTO users (email, password_hash, name, role, membership_tier_id, status)
       VALUES ($1, $2, $3, 'ADMIN', $4, 'ACTIVE') ON CONFLICT (email) DO NOTHING`,
      ['admin@gmail.com', hashPassword('adminlb123'), 'TrendTrim Admin', diamondId]
    );
    await pool.query(
      `INSERT INTO users (email, password_hash, name, role, membership_tier_id, status)
       VALUES ($1, $2, $3, 'ADMIN', $4, 'ACTIVE') ON CONFLICT (email) DO NOTHING`,
      ['admin@trendtrim.com', hashPassword('admin'), 'TrendTrim Admin', diamondId]
    );
    await pool.query(
      `INSERT INTO users (email, password_hash, name, role, membership_tier_id, status)
       VALUES ($1, $2, $3, 'USER', $4, 'ACTIVE') ON CONFLICT (email) DO NOTHING`,
      ['user@trendtrim.com', hashPassword('user'), 'Demo User', platId]
    );

    // Self-healing: Update users with placeholder migration hashes to valid backend hashes
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE email = 'admin@trendtrim.com' AND password_hash = 'PENDING_BACKEND_HASH'`,
      [hashPassword('admin')]
    );
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE email = 'user@trendtrim.com' AND password_hash = 'PENDING_BACKEND_HASH'`,
      [hashPassword('user')]
    );

    // Reset default stylist photo URLs to their unsplash links if they are currently using local uploads path or are null
    await pool.query(
      `UPDATE users SET profile_photo_url = $1 WHERE email = 'jessica@trendtrim.com' AND (profile_photo_url LIKE '/uploads/%' OR profile_photo_url IS NULL OR profile_photo_url LIKE '%luxebook%')`,
      ['https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=150&q=80']
    );
    await pool.query(
      `UPDATE users SET profile_photo_url = $1 WHERE email = 'david@trendtrim.com' AND (profile_photo_url LIKE '/uploads/%' OR profile_photo_url IS NULL OR profile_photo_url LIKE '%luxebook%')`,
      ['https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80']
    );
    await pool.query(
      `UPDATE users SET profile_photo_url = $1 WHERE email = 'priya@trendtrim.com' AND (profile_photo_url LIKE '/uploads/%' OR profile_photo_url IS NULL OR profile_photo_url LIKE '%luxebook%')`,
      ['https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80']
    );
    await pool.query(
      `UPDATE users SET profile_photo_url = $1 WHERE email = 'alex@trendtrim.com' AND (profile_photo_url LIKE '/uploads/%' OR profile_photo_url IS NULL OR profile_photo_url LIKE '%luxebook%')`,
      ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80']
    );

    console.log('✅ Admin and demo accounts ready');

    // ── SEED: Service Categories ──────────────────────────────────────────────
    const cats = ['Hair', 'Color', 'Beauty', 'Nails', 'Grooming'];
    for (const cat of cats) {
      await pool.query(
        `INSERT INTO service_categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
        [cat, `${cat} services`]
      );
    }

    // ── SEED: Services (50 total matching Booking.jsx DEFAULT_SERVICES) ───────
    const allServices = [
      // HAIR (10)
      { cat: 'Hair',     name: 'Signature Haircut & Style',            dur: 60,  price: 95  },
      { cat: 'Hair',     name: 'Luxury Blowout',                        dur: 45,  price: 65  },
      { cat: 'Hair',     name: 'Deep Conditioning Keratin Therapy',     dur: 75,  price: 120 },
      { cat: 'Hair',     name: 'Silk Press & Scalp Care',               dur: 90,  price: 110 },
      { cat: 'Hair',     name: 'Custom Extension Fitting',              dur: 150, price: 300 },
      { cat: 'Hair',     name: 'Olaplex Restructuring Ritual',          dur: 45,  price: 85  },
      { cat: 'Hair',     name: 'Scalp Detox & High-Frequency Massage',  dur: 60,  price: 90  },
      { cat: 'Hair',     name: 'Editorial Event Hair Updo',             dur: 75,  price: 135 },
      { cat: 'Hair',     name: 'Brazilian Blowout Treatment',           dur: 120, price: 280 },
      { cat: 'Hair',     name: 'Premium Hair Botox Styling',            dur: 90,  price: 190 },
      // COLOR (10)
      { cat: 'Color',    name: 'Premium Color & Highlights',            dur: 90,  price: 180 },
      { cat: 'Color',    name: 'Signature French Balayage',             dur: 150, price: 240 },
      { cat: 'Color',    name: 'Platinum Double Process Blonde',        dur: 180, price: 290 },
      { cat: 'Color',    name: 'Full Head Foil Highlights',             dur: 120, price: 195 },
      { cat: 'Color',    name: 'Root Touch-Up & Shine Glaze',           dur: 60,  price: 115 },
      { cat: 'Color',    name: 'Creative Fashion Color',                dur: 150, price: 220 },
      { cat: 'Color',    name: 'Color Correction Consultation',         dur: 180, price: 320 },
      { cat: 'Color',    name: 'Ombre Hair Graduation',                 dur: 120, price: 210 },
      { cat: 'Color',    name: 'Pastel Hair Tone Glazing',              dur: 45,  price: 95  },
      { cat: 'Color',    name: 'Sun-Kissed Babylights',                 dur: 90,  price: 165 },
      // BEAUTY (10)
      { cat: 'Beauty',   name: 'Bridal Makeup Package',                 dur: 120, price: 250 },
      { cat: 'Beauty',   name: 'Editorial Photographic Glamour',        dur: 75,  price: 140 },
      { cat: 'Beauty',   name: 'Airbrush High-Definition Makeup',       dur: 60,  price: 125 },
      { cat: 'Beauty',   name: 'Classic Lash Extension Full Set',       dur: 90,  price: 180 },
      { cat: 'Beauty',   name: 'Brow Lamination & Henna Shaping',       dur: 60,  price: 95  },
      { cat: 'Beauty',   name: 'Organic Hydration Facial Treatment',    dur: 60,  price: 110 },
      { cat: 'Beauty',   name: 'Anti-Aging Collagen Therapy',           dur: 75,  price: 145 },
      { cat: 'Beauty',   name: 'Custom Spray Tanning Sessions',         dur: 30,  price: 60  },
      { cat: 'Beauty',   name: 'Luxury Eye Contour Lifting',            dur: 45,  price: 80  },
      { cat: 'Beauty',   name: 'Express Glow Makeup Application',       dur: 45,  price: 75  },
      // NAILS (10)
      { cat: 'Nails',    name: 'Classic Manicure & Pedicure',           dur: 75,  price: 85  },
      { cat: 'Nails',    name: 'Gel Bottle Extensions Set',             dur: 90,  price: 120 },
      { cat: 'Nails',    name: 'Signature Champagne Pedicure',          dur: 60,  price: 95  },
      { cat: 'Nails',    name: 'Luxury Paraffin Wax Mani-Pedi',        dur: 90,  price: 110 },
      { cat: 'Nails',    name: 'Gel Polish Change & Shaping',           dur: 45,  price: 55  },
      { cat: 'Nails',    name: 'Custom Accent Nail Artistry',           dur: 60,  price: 75  },
      { cat: 'Nails',    name: 'Organic Spa Citrus Hand Treatment',     dur: 45,  price: 65  },
      { cat: 'Nails',    name: 'IBX Strength Repair Therapy',           dur: 30,  price: 45  },
      { cat: 'Nails',    name: 'Detox Charcoal Foot Spa',               dur: 60,  price: 80  },
      { cat: 'Nails',    name: 'Luxury Matte Gel Manicure',             dur: 45,  price: 70  },
      // GROOMING (10)
      { cat: 'Grooming', name: "Gentleman's Grooming",                  dur: 45,  price: 70  },
      { cat: 'Grooming', name: 'Executive Beard Sculpting',             dur: 30,  price: 50  },
      { cat: 'Grooming', name: 'Hot Towel Facial Shave Ritual',         dur: 45,  price: 60  },
      { cat: 'Grooming', name: "Premium Men's Charcoal Facial",         dur: 60,  price: 85  },
      { cat: 'Grooming', name: "Classic Men's Haircut & Wash",          dur: 45,  price: 65  },
      { cat: 'Grooming', name: 'Sport Pedicure for Men',                dur: 45,  price: 75  },
      { cat: 'Grooming', name: 'Nose & Ear Premium Waxing',             dur: 20,  price: 35  },
      { cat: 'Grooming', name: "Gentleman's Express Mani-Pedi",         dur: 60,  price: 90  },
      { cat: 'Grooming', name: 'Scalp Stimulation Treatment',           dur: 30,  price: 55  },
      { cat: 'Grooming', name: 'Grey Blending Color Treatment',         dur: 45,  price: 80  },
    ];

    for (let i = 0; i < allServices.length; i++) {
      const svc = allServices[i];
      const catRes = await pool.query(
        `SELECT id FROM service_categories WHERE name = $1`, [svc.cat]
      );
      const catId = catRes.rows[0]?.id;
      if (!catId) continue;

      const featured = i < 6; // first 6 are featured
      await pool.query(
        `INSERT INTO services
           (category_id, name, duration_minutes, price, display_order, is_available, is_featured, status)
         VALUES ($1, $2, $3, $4, $5, true, $6, 'ACTIVE')
         ON CONFLICT (name) DO NOTHING`,
        [catId, svc.name, svc.dur, svc.price, i, featured]
      );
    }

    console.log(`✅ ${allServices.length} services seeded`);

    // ── SEED: Stylists ────────────────────────────────────────────────────────
    const stylistSeed = [
      {
        email: 'jessica@trendtrim.com',
        name:  'Jessica Monroe',
        photo: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=150&q=80',
        phone: '+1-555-0199',
        bio:   'Senior stylist with 12 years of experience in luxury hair care and editorial styling.',
        spec:  'Senior Hair Stylist',
        years: 12,
        rating: 5.0,
        services: ['Signature Haircut & Style', 'Luxury Blowout', 'Deep Conditioning Keratin Therapy', 'Editorial Event Hair Updo', 'Brazilian Blowout Treatment'],
        days: [1,2,3,4,5]
      },
      {
        email: 'david@trendtrim.com',
        name:  'David Chen',
        photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80',
        phone: '+1-555-0188',
        bio:   'Color specialist trained in Paris with expertise in balayage and creative color.',
        spec:  'Color Specialist',
        years: 9,
        rating: 4.8,
        services: ['Premium Color & Highlights', 'Signature French Balayage', 'Platinum Double Process Blonde', 'Creative Fashion Color', 'Ombre Hair Graduation'],
        days: [1,2,4,5,6]
      },
      {
        email: 'priya@trendtrim.com',
        name:  'Priya Sharma',
        photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
        phone: '+1-555-0166',
        bio:   'Beauty artist specializing in bridal makeup, skincare, and luxury nail care.',
        spec:  'Beauty & Nail Artist',
        years: 7,
        rating: 4.9,
        services: ['Bridal Makeup Package', 'Classic Lash Extension Full Set', 'Classic Manicure & Pedicure', 'Luxury Paraffin Wax Mani-Pedi', 'Organic Hydration Facial Treatment'],
        days: [2,3,4,5,6]
      },
      {
        email: 'alex@trendtrim.com',
        name:  'Alex Rivera',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
        phone: '+1-555-0177',
        bio:   'Grooming specialist for the modern gentleman — precision cuts, beard sculpting and facial treatments.',
        spec:  'Grooming Specialist',
        years: 6,
        rating: 4.7,
        services: ["Gentleman's Grooming", 'Executive Beard Sculpting', 'Hot Towel Facial Shave Ritual', "Classic Men's Haircut & Wash", "Gentleman's Express Mani-Pedi"],
        days: [1,3,4,5,6]
      }
    ];

    const stylistPass = hashPassword('stylist123');

    for (const s of stylistSeed) {
      // Check if user already exists
      const existUser = await pool.query(
        `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [s.email]
      );

      let userId;
      if (existUser.rows.length > 0) {
        userId = existUser.rows[0].id;
        // Self-healing: if the user exists but has the placeholder migration hash, update it
        await pool.query(
          `UPDATE users SET password_hash = $1 WHERE id = $2 AND password_hash = 'PENDING_BACKEND_HASH'`,
          [stylistPass, userId]
        );
      } else {
        const uRes = await pool.query(
          `INSERT INTO users (email, password_hash, name, role, status, profile_photo_url, phone)
           VALUES ($1, $2, $3, 'STYLIST', 'ACTIVE', $4, $5) RETURNING id`,
          [s.email, stylistPass, s.name, s.photo, s.phone]
        );
        userId = uRes.rows[0].id;
      }

      // Check if stylist record exists
      const existStylist = await pool.query(
        `SELECT id FROM stylists WHERE user_id = $1`, [userId]
      );

      let stylistId;
      if (existStylist.rows.length > 0) {
        stylistId = existStylist.rows[0].id;
      } else {
        const stRes = await pool.query(
          `INSERT INTO stylists (user_id, bio, specialization, experience_years, employment_status, average_rating)
           VALUES ($1, $2, $3, $4, 'ACTIVE', $5) RETURNING id`,
          [userId, s.bio, s.spec, s.years, s.rating]
        );
        stylistId = stRes.rows[0].id;

        // Availability
        for (const d of s.days) {
          await pool.query(
            `INSERT INTO stylist_availability (stylist_id, day_of_week, start_time, end_time)
             VALUES ($1, $2, '09:00', '18:00')`,
            [stylistId, d]
          );
        }

        // Assign services
        for (const svcName of s.services) {
          const svcRes = await pool.query(
            `SELECT id FROM services WHERE name = $1`, [svcName]
          );
          if (svcRes.rows.length > 0) {
            await pool.query(
              `INSERT INTO stylist_services (stylist_id, service_id) VALUES ($1, $2)
               ON CONFLICT (stylist_id, service_id) DO NOTHING`,
              [stylistId, svcRes.rows[0].id]
            );
          }
        }
      }
    }

    console.log('✅ 4 stylists seeded with availability and service assignments');
    console.log('✅ DB initialization complete');

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
