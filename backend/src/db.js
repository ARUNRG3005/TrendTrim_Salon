const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, '../luxebook.db');
const db = new sqlite3.Database(dbPath);

// Promise wrappers
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Secure password hashing helper using PBKDF2
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

// DB schema initialization
const initDb = async () => {
  try {
    // Enable Foreign Keys
    await run('PRAGMA foreign_keys = ON');

    // Migration Check 1: Old basic schema check
    const usersTableCheck = await get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    if (usersTableCheck) {
      const tableInfo = await query("PRAGMA table_info(users)");
      const isOldSchema = tableInfo.some(col => col.name === 'password') && !tableInfo.some(col => col.name === 'password_hash');
      if (isOldSchema) {
        console.log('Old basic schema detected. Performing database upgrade migration...');
        await run('PRAGMA foreign_keys = OFF');
        await run('DROP TABLE IF EXISTS bookings');
        await run('DROP TABLE IF EXISTS users');
        await run('PRAGMA foreign_keys = ON');
      }
    }

    // Migration Check 2: New columns check (discount_price, display_order on services)
    const servicesTableCheck = await get("SELECT name FROM sqlite_master WHERE type='table' AND name='services'");
    if (servicesTableCheck) {
      const tableInfo = await query("PRAGMA table_info(services)");
      const needsUpgrade = !tableInfo.some(col => col.name === 'discount_price');
      if (needsUpgrade) {
        console.log('Upgrading database schema with new service and stylist columns...');
        await run('PRAGMA foreign_keys = OFF');
        await run('DROP TABLE IF EXISTS booking_services');
        await run('DROP TABLE IF EXISTS bookings');
        await run('DROP TABLE IF EXISTS services');
        await run('DROP TABLE IF EXISTS stylists');
        await run('DROP TABLE IF EXISTS stylist_services');
        await run('DROP TABLE IF EXISTS stylist_availability');
        await run('DROP TABLE IF EXISTS stylist_portfolio');
        await run('DROP TABLE IF EXISTS reviews');
        await run('DROP TABLE IF EXISTS payments');
        await run('DROP TABLE IF EXISTS refunds');
        await run('DROP TABLE IF EXISTS users');
        await run('DROP TABLE IF EXISTS membership_tiers');
        await run('DROP TABLE IF EXISTS service_categories');
        await run('PRAGMA foreign_keys = ON');
      }
    }

    // 1. Membership Tiers
    await run(`
      CREATE TABLE IF NOT EXISTS membership_tiers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER', 'STYLIST')),
        membership_tier_id INTEGER,
        status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
        profile_photo_url TEXT,
        phone TEXT,
        notification_preferences TEXT DEFAULT '{"email": true, "sms": false, "push": false}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL,
        FOREIGN KEY (membership_tier_id) REFERENCES membership_tiers(id)
      )
    `);

    // 3. User Activity Logs
    await run(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 4. Audit Logs (System Action Tracker)
    await run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_id INTEGER,
        action TEXT NOT NULL,
        target_table TEXT NOT NULL,
        target_id TEXT NOT NULL,
        previous_state TEXT,
        new_state TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (actor_id) REFERENCES users(id)
      )
    `);

    // 5. Service Categories
    await run(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL
      )
    `);

    // 6. Services
    await run(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
        price REAL NOT NULL CHECK (price >= 0.0),
        discount_price REAL DEFAULT NULL CHECK (discount_price >= 0.0),
        image_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_available BOOLEAN DEFAULT 1,
        is_featured BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL,
        FOREIGN KEY (category_id) REFERENCES service_categories(id)
      )
    `);

    // 7. Service Images (Gallery)
    await run(`
      CREATE TABLE IF NOT EXISTS service_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id)
      )
    `);

    // 8. Stylists
    await run(`
      CREATE TABLE IF NOT EXISTS stylists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        bio TEXT,
        specialization TEXT,
        experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
        employment_status TEXT DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE', 'ON_LEAVE', 'TERMINATED')),
        average_rating REAL DEFAULT 5.0 CHECK (average_rating >= 0.0 AND average_rating <= 5.0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 9. Stylist Services (Many-to-Many Relationship)
    await run(`
      CREATE TABLE IF NOT EXISTS stylist_services (
        stylist_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        PRIMARY KEY (stylist_id, service_id),
        FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      )
    `);

    // 10. Stylist Availability Schedule
    await run(`
      CREATE TABLE IF NOT EXISTS stylist_availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stylist_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE CASCADE
      )
    `);

    // 11. Stylist Portfolio Gallery
    await run(`
      CREATE TABLE IF NOT EXISTS stylist_portfolio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stylist_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE CASCADE
      )
    `);

    // 12. Bookings
    await run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        stylist_id INTEGER NOT NULL,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NOSHOW')),
        payment_status TEXT DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED')),
        notes TEXT,
        total_price REAL NOT NULL CHECK (total_price >= 0.0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (stylist_id) REFERENCES stylists(id)
      )
    `);

    // 13. Booking Services (Enables many-to-many services per booking)
    await run(`
      CREATE TABLE IF NOT EXISTS booking_services (
        booking_id TEXT NOT NULL,
        service_id INTEGER NOT NULL,
        price_charged REAL NOT NULL CHECK (price_charged >= 0.0),
        duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
        PRIMARY KEY (booking_id, service_id),
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id)
      )
    `);

    // 14. Booking Rescheduling History
    await run(`
      CREATE TABLE IF NOT EXISTS booking_reschedule_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL,
        previous_date TEXT NOT NULL,
        previous_time TEXT NOT NULL,
        new_date TEXT NOT NULL,
        new_time TEXT NOT NULL,
        reason TEXT,
        rescheduled_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (rescheduled_by) REFERENCES users(id)
      )
    `);

    // 15. Booking Cancellation Records
    await run(`
      CREATE TABLE IF NOT EXISTS booking_cancellation_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL UNIQUE,
        reason TEXT,
        cancelled_by INTEGER NOT NULL,
        refunded_amount REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (cancelled_by) REFERENCES users(id)
      )
    `);

    // 16. Payment Records
    await run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL,
        amount REAL NOT NULL CHECK (amount >= 0.0),
        payment_method TEXT NOT NULL CHECK (payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'MOBILE_PAY')),
        payment_status TEXT DEFAULT 'COMPLETED' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
        transaction_reference TEXT,
        invoice_number TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
      )
    `);

    // 17. Refund Records
    await run(`
      CREATE TABLE IF NOT EXISTS refunds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_id INTEGER NOT NULL,
        amount REAL NOT NULL CHECK (amount >= 0.0),
        status TEXT DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
        reason TEXT,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments(id)
      )
    `);

    // 18. Customer Reviews & Ratings
    await run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        stylist_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        is_moderated BOOLEAN DEFAULT 0,
        moderation_status TEXT DEFAULT 'PENDING' CHECK (moderation_status IN ('PENDING', 'APPROVED', 'REJECTED')),
        moderated_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (stylist_id) REFERENCES stylists(id),
        FOREIGN KEY (service_id) REFERENCES services(id),
        FOREIGN KEY (moderated_by) REFERENCES users(id)
      )
    `);

    // =========================================================================
    // Create SQLite Indexes
    // =========================================================================
    await run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL');
    await run('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await run('CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id) WHERE deleted_at IS NULL');
    await run('CREATE INDEX IF NOT EXISTS idx_bookings_stylist_id ON bookings(stylist_id) WHERE deleted_at IS NULL');
    await run('CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(appointment_date, appointment_time) WHERE deleted_at IS NULL');
    await run('CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)');
    await run('CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id) WHERE deleted_at IS NULL');
    await run('CREATE INDEX IF NOT EXISTS idx_services_status ON services(status)');
    await run('CREATE INDEX IF NOT EXISTS idx_reviews_stylist_id ON reviews(stylist_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user ON user_activity_logs(user_id, created_at)');
    await run('CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id, created_at)');

    // =========================================================================
    // Database Seeding
    // =========================================================================
    const userCount = await get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
      console.log('Seeding LuxeBook membership tiers...');
      const standardTier = await run('INSERT INTO membership_tiers (name, discount_percentage, description) VALUES (?, ?, ?)',
        ['STANDARD', 0.0, 'Standard salon membership tier.']
      );
      const vipTier = await run('INSERT INTO membership_tiers (name, discount_percentage, description) VALUES (?, ?, ?)',
        ['VIP', 10.0, 'VIP member with 10% booking discount.']
      );
      const platinumTier = await run('INSERT INTO membership_tiers (name, discount_percentage, description) VALUES (?, ?, ?)',
        ['PLATINUM MEMBER', 15.0, 'Platinum member with 15% booking discount.']
      );
      const diamondTier = await run('INSERT INTO membership_tiers (name, discount_percentage, description) VALUES (?, ?, ?)',
        ['DIAMOND TIER', 20.0, 'Diamond member with 20% booking discount.']
      );

      console.log('Seeding system users (Admin, User, Stylists)...');
      const adminHash = hashPassword('adminlb123');
      const userHash = hashPassword('user');
      const stylistHash = hashPassword('stylist123');

      // Insert Admin and standard User
      const adminResult = await run('INSERT INTO users (email, password_hash, name, role, membership_tier_id) VALUES (?, ?, ?, ?, ?)',
        ['admin@gmail.com', adminHash, 'LuxeBook Admin', 'ADMIN', diamondTier.id]
      );
      const userResult = await run('INSERT INTO users (email, password_hash, name, role, membership_tier_id) VALUES (?, ?, ?, ?, ?)',
        ['user@luxebook.com', userHash, 'Eleanor Vance', 'USER', platinumTier.id]
      );
      
      // Seed additional mock users for Admin panel logs/activity
      const user2Result = await run('INSERT INTO users (email, password_hash, name, role, membership_tier_id) VALUES (?, ?, ?, ?, ?)',
        ['marcus@sterling.co', userHash, 'Marcus Sterling', 'USER', standardTier.id]
      );
      const user3Result = await run('INSERT INTO users (email, password_hash, name, role, membership_tier_id, phone) VALUES (?, ?, ?, ?, ?, ?)',
        ['sophia@laurent.fr', userHash, 'Sophia Laurent', 'USER', vipTier.id, '+33-6-0102-0304']
      );

      // Insert Stylist accounts in Users table with Unsplash profile pictures
      const jessicaUser = await run('INSERT INTO users (email, password_hash, name, role, membership_tier_id, profile_photo_url, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['jessica@luxebook.com', stylistHash, 'Jessica Monroe', 'STYLIST', standardTier.id, 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=150&q=80', '+1-555-0199']
      );
      const davidUser = await run('INSERT INTO users (email, password_hash, name, role, membership_tier_id, profile_photo_url, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['david@luxebook.com', stylistHash, 'David Chen', 'STYLIST', standardTier.id, 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80', '+1-555-0188']
      );
      const alexUser = await run('INSERT INTO users (email, password_hash, name, role, membership_tier_id, profile_photo_url, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['alex@luxebook.com', stylistHash, 'Alex Rivera', 'STYLIST', standardTier.id, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', '+1-555-0177']
      );
      const priyaUser = await run('INSERT INTO users (email, password_hash, name, role, membership_tier_id, profile_photo_url, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['priya@luxebook.com', stylistHash, 'Priya Sharma', 'STYLIST', standardTier.id, 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80', '+1-555-0166']
      );

      console.log('Seeding stylists profiles...');
      const jessicaStylist = await run('INSERT INTO stylists (user_id, bio, specialization, experience_years, average_rating) VALUES (?, ?, ?, ?, ?)',
        [jessicaUser.id, 'Senior Hair Stylist with 8+ years experience in couture cuts.', 'Senior Hair Styling', 8, 5.0]
      );
      const davidStylist = await run('INSERT INTO stylists (user_id, bio, specialization, experience_years, average_rating) VALUES (?, ?, ?, ?, ?)',
        [davidUser.id, 'Color Specialist with a passion for balayage and highlights.', 'Balayage & Hair Coloring', 6, 4.8]
      );
      const alexStylist = await run('INSERT INTO stylists (user_id, bio, specialization, experience_years, average_rating) VALUES (?, ?, ?, ?, ?)',
        [alexUser.id, 'Master of blowouts and hair restructuring.', 'Nails & Gentleman Grooming', 5, 4.7]
      );
      const priyaStylist = await run('INSERT INTO stylists (user_id, bio, specialization, experience_years, average_rating) VALUES (?, ?, ?, ?, ?)',
        [priyaUser.id, 'Bridal Makeup expert specializing in High Definition and Airbrush glamour.', 'Bridal & Photographic Glamour', 7, 4.9]
      );

      console.log('Seeding service categories...');
      const catHair = await run('INSERT INTO service_categories (name, description) VALUES (?, ?)', ['Hair', 'Premium hair styles, haircuts, blowouts and treatments.']);
      const catColor = await run('INSERT INTO service_categories (name, description) VALUES (?, ?)', ['Color', 'Signature highlights, balayage, glazes and fashion colors.']);
      const catBeauty = await run('INSERT INTO service_categories (name, description) VALUES (?, ?)', ['Beauty', 'High definition makeup, lash lifts and skincare hydrations.']);
      const catNails = await run('INSERT INTO service_categories (name, description) VALUES (?, ?)', ['Nails', 'Gel manicures, champagne pedicures, and nail art.']);
      const catGrooming = await run('INSERT INTO service_categories (name, description) VALUES (?, ?)', ['Grooming', 'Executive beard sculpting, hot towel shaves and charcoal facials.']);

      console.log('Seeding salon services...');
      const servicesToSeed = [
        // Hair Category
        { category_id: catHair.id, name: 'Signature Haircut & Style', duration: 60, price: 95.0, discount_price: 85.0, is_featured: 1, order: 1, img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=400&q=80' },
        { category_id: catHair.id, name: 'Luxury Blowout', duration: 45, price: 65.0, discount_price: null, is_featured: 0, order: 2, img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80' },
        { category_id: catHair.id, name: 'Deep Conditioning Keratin Therapy', duration: 75, price: 120.0, discount_price: null, is_featured: 0, order: 3, img: 'https://images.unsplash.com/photo-1595859703065-2234986c2577?auto=format&fit=crop&w=400&q=80' },
        { category_id: catHair.id, name: 'Silk Press & Scalp Care', duration: 90, price: 110.0, discount_price: null, is_featured: 0, order: 4, img: '' },
        { category_id: catHair.id, name: 'Custom Extension Fitting', duration: 150, price: 300.0, discount_price: null, is_featured: 0, order: 5, img: '' },
        { category_id: catHair.id, name: 'Olaplex Restructuring Ritual', duration: 45, price: 85.0, discount_price: null, is_featured: 0, order: 6, img: '' },
        { category_id: catHair.id, name: 'Scalp Detox & High-Frequency Massage', duration: 60, price: 90.0, discount_price: null, is_featured: 0, order: 7, img: '' },
        { category_id: catHair.id, name: 'Editorial Event Hair Updo', duration: 75, price: 135.0, discount_price: null, is_featured: 0, order: 8, img: '' },
        { category_id: catHair.id, name: 'Brazilian Blowout Treatment', duration: 120, price: 280.0, discount_price: 250.0, is_featured: 0, order: 9, img: '' },
        { category_id: catHair.id, name: 'Premium Hair Botox Styling', duration: 90, price: 190.0, discount_price: null, is_featured: 0, order: 10, img: '' },
        
        // Color Category
        { category_id: catColor.id, name: 'Premium Color & Highlights', duration: 90, price: 180.0, discount_price: 165.0, is_featured: 1, order: 1, img: 'https://images.unsplash.com/photo-1560869713-7d0a29430f23?auto=format&fit=crop&w=400&q=80' },
        { category_id: catColor.id, name: 'Signature French Balayage', duration: 150, price: 240.0, discount_price: null, is_featured: 0, order: 2, img: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f697?auto=format&fit=crop&w=400&q=80' },
        { category_id: catColor.id, name: 'Platinum Double Process Blonde', duration: 180, price: 290.0, discount_price: null, is_featured: 0, order: 3, img: '' },
        { category_id: catColor.id, name: 'Full Head Foil Highlights', duration: 120, price: 195.0, discount_price: null, is_featured: 0, order: 4, img: '' },
        { category_id: catColor.id, name: 'Root Touch-Up & Shine Glaze', duration: 60, price: 115.0, discount_price: null, is_featured: 0, order: 5, img: '' },
        { category_id: catColor.id, name: 'Creative Fashion Color', duration: 150, price: 220.0, discount_price: null, is_featured: 0, order: 6, img: '' },
        { category_id: catColor.id, name: 'Color Correction Consultation', duration: 180, price: 320.0, discount_price: null, is_featured: 0, order: 7, img: '' },
        { category_id: catColor.id, name: 'Ombre Hair Graduation', duration: 120, price: 210.0, discount_price: null, is_featured: 0, order: 8, img: '' },
        { category_id: catColor.id, name: 'Pastel Hair Tone Glazing', duration: 45, price: 95.0, discount_price: null, is_featured: 0, order: 9, img: '' },
        { category_id: catColor.id, name: 'Sun-Kissed Babylights', duration: 90, price: 165.0, discount_price: null, is_featured: 0, order: 10, img: '' },

        // Beauty Category
        { category_id: catBeauty.id, name: 'Bridal Makeup Package', duration: 120, price: 250.0, discount_price: 225.0, is_featured: 1, order: 1, img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80' },
        { category_id: catBeauty.id, name: 'Editorial Photographic Glamour', duration: 75, price: 140.0, discount_price: null, is_featured: 0, order: 2, img: '' },
        { category_id: catBeauty.id, name: 'Airbrush High-Definition Makeup', duration: 60, price: 125.0, discount_price: null, is_featured: 0, order: 3, img: '' },
        { category_id: catBeauty.id, name: 'Classic Lash Extension Full Set', duration: 90, price: 180.0, discount_price: null, is_featured: 0, order: 4, img: '' },
        { category_id: catBeauty.id, name: 'Brow Lamination & Henna Shaping', duration: 60, price: 95.0, discount_price: null, is_featured: 0, order: 5, img: '' },
        { category_id: catBeauty.id, name: 'Organic Hydration Facial Treatment', duration: 60, price: 110.0, discount_price: null, is_featured: 0, order: 6, img: '' },
        { category_id: catBeauty.id, name: 'Anti-Aging Collagen Therapy', duration: 75, price: 145.0, discount_price: null, is_featured: 0, order: 7, img: '' },
        { category_id: catBeauty.id, name: 'Custom Spray Tanning Sessions', duration: 30, price: 60.0, discount_price: null, is_featured: 0, order: 8, img: '' },
        { category_id: catBeauty.id, name: 'Luxury Eye Contour Lifting', duration: 45, price: 80.0, discount_price: null, is_featured: 0, order: 9, img: '' },
        { category_id: catBeauty.id, name: 'Express Glow Makeup Application', duration: 45, price: 75.0, discount_price: null, is_featured: 0, order: 10, img: '' },

        // Nails Category
        { category_id: catNails.id, name: 'Classic Manicure & Pedicure', duration: 75, price: 85.0, discount_price: null, is_featured: 0, order: 1, img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80' },
        { category_id: catNails.id, name: 'Gel Bottle Extensions Set', duration: 90, price: 120.0, discount_price: 110.0, is_featured: 1, order: 2, img: '' },
        { category_id: catNails.id, name: 'Signature Champagne Pedicure', duration: 60, price: 95.0, discount_price: null, is_featured: 0, order: 3, img: '' },
        { category_id: catNails.id, name: 'Luxury Paraffin Wax Mani-Pedi', duration: 90, price: 110.0, discount_price: null, is_featured: 0, order: 4, img: '' },
        { category_id: catNails.id, name: 'Gel Polish Change & Shaping', duration: 45, price: 55.0, discount_price: null, is_featured: 0, order: 5, img: '' },
        { category_id: catNails.id, name: 'Custom Accent Nail Artistry', duration: 60, price: 75.0, discount_price: null, is_featured: 0, order: 6, img: '' },
        { category_id: catNails.id, name: 'Organic Spa Citrus Hand Treatment', duration: 45, price: 65.0, discount_price: null, is_featured: 0, order: 7, img: '' },
        { category_id: catNails.id, name: 'IBX Strength Repair Therapy', duration: 30, price: 45.0, discount_price: null, is_featured: 0, order: 8, img: '' },
        { category_id: catNails.id, name: 'Detox Charcoal Foot Spa', duration: 60, price: 80.0, discount_price: null, is_featured: 0, order: 9, img: '' },
        { category_id: catNails.id, name: 'Luxury Matte Gel Manicure', duration: 45, price: 70.0, discount_price: null, is_featured: 0, order: 10, img: '' },

        // Grooming Category
        { category_id: catGrooming.id, name: "Gentleman's Grooming", duration: 45, price: 70.0, discount_price: 60.0, is_featured: 1, order: 1, img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&q=80' },
        { category_id: catGrooming.id, name: 'Executive Beard Sculpting', duration: 30, price: 50.0, discount_price: null, is_featured: 0, order: 2, img: '' },
        { category_id: catGrooming.id, name: 'Hot Towel Facial Shave Ritual', duration: 45, price: 60.0, discount_price: null, is_featured: 0, order: 3, img: '' },
        { category_id: catGrooming.id, name: "Premium Men's Charcoal Facial", duration: 60, price: 85.0, discount_price: null, is_featured: 0, order: 4, img: '' },
        { category_id: catGrooming.id, name: "Classic Men's Haircut & Wash", duration: 45, price: 65.0, discount_price: null, is_featured: 0, order: 5, img: '' },
        { category_id: catGrooming.id, name: 'Sport Pedicure for Men', duration: 45, price: 75.0, discount_price: null, is_featured: 0, order: 6, img: '' },
        { category_id: catGrooming.id, name: 'Nose & Ear Premium Waxing', duration: 20, price: 35.0, discount_price: null, is_featured: 0, order: 7, img: '' },
        { category_id: catGrooming.id, name: "Gentleman's Express Mani-Pedi", duration: 60, price: 90.0, discount_price: null, is_featured: 0, order: 8, img: '' },
        { category_id: catGrooming.id, name: 'Scalp Stimulation Treatment', duration: 30, price: 55.0, discount_price: null, is_featured: 0, order: 9, img: '' },
        { category_id: catGrooming.id, name: 'Grey Blending Color Treatment', duration: 45, price: 80.0, discount_price: null, is_featured: 0, order: 10, img: '' }
      ];

      const serviceMap = {};
      for (const svc of servicesToSeed) {
        const res = await run(
          'INSERT INTO services (category_id, name, description, duration_minutes, price, discount_price, image_url, display_order, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [svc.category_id, svc.name, `${svc.name} bespoke premium experience.`, svc.duration, svc.price, svc.discount_price, svc.img || null, svc.order, svc.is_featured]
        );
        serviceMap[svc.name] = res.id;
      }

      console.log('Seeding stylist-service assignments...');
      // Link stylists to their specialities
      const allServices = await query('SELECT id, name, category_id FROM services');
      for (const service of allServices) {
        // Jessica does Hair, Color, Grooming
        if (service.category_id === catHair.id || service.category_id === catColor.id || service.category_id === catGrooming.id) {
          await run('INSERT INTO stylist_services (stylist_id, service_id) VALUES (?, ?)', [jessicaStylist.id, service.id]);
        }
        // David does Hair, Color
        if (service.category_id === catHair.id || service.category_id === catColor.id) {
          await run('INSERT INTO stylist_services (stylist_id, service_id) VALUES (?, ?)', [davidStylist.id, service.id]);
        }
        // Alex does Hair, Grooming, Nails
        if (service.category_id === catHair.id || service.category_id === catGrooming.id || service.category_id === catNails.id) {
          await run('INSERT INTO stylist_services (stylist_id, service_id) VALUES (?, ?)', [alexStylist.id, service.id]);
        }
        // Priya does Beauty, Nails
        if (service.category_id === catBeauty.id || service.category_id === catNails.id) {
          await run('INSERT INTO stylist_services (stylist_id, service_id) VALUES (?, ?)', [priyaStylist.id, service.id]);
        }
      }

      console.log('Seeding stylist availability schedules...');
      // Seed Monday to Friday schedules (09:00 to 18:00) for all stylists
      const stylistsList = [jessicaStylist.id, davidStylist.id, alexStylist.id, priyaStylist.id];
      for (const sid of stylistsList) {
        for (let day = 1; day <= 5; day++) {
          await run(
            'INSERT INTO stylist_availability (stylist_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
            [sid, day, '09:00', '18:00']
          );
        }
      }

      console.log('Seeding bookings and transaction relationships...');
      // BK-8891
      const sIdPremiumColor = serviceMap['Premium Color & Highlights'];
      await run('INSERT INTO bookings (id, user_id, stylist_id, appointment_date, appointment_time, status, payment_status, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['BK-8891', userResult.id, jessicaStylist.id, '2026-06-15', '14:00', 'CONFIRMED', 'PAID', 180.0]
      );
      await run('INSERT INTO booking_services (booking_id, service_id, price_charged, duration_minutes) VALUES (?, ?, ?, ?)',
        ['BK-8891', sIdPremiumColor, 180.0, 90]
      );
      await run('INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_reference, invoice_number) VALUES (?, ?, ?, ?, ?, ?)',
        ['BK-8891', 180.0, 'CREDIT_CARD', 'COMPLETED', 'TXN-8891-AA', 'INV-2026-0001']
      );

      // BK-4530
      const sIdSigCut = serviceMap['Signature Haircut & Style'];
      await run('INSERT INTO bookings (id, user_id, stylist_id, appointment_date, appointment_time, status, payment_status, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['BK-4530', userResult.id, davidStylist.id, '2026-05-20', '10:30', 'COMPLETED', 'PAID', 95.0]
      );
      await run('INSERT INTO booking_services (booking_id, service_id, price_charged, duration_minutes) VALUES (?, ?, ?, ?)',
        ['BK-4530', sIdSigCut, 95.0, 60]
      );
      await run('INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_reference, invoice_number) VALUES (?, ?, ?, ?, ?, ?)',
        ['BK-4530', 95.0, 'DEBIT_CARD', 'COMPLETED', 'TXN-4530-BB', 'INV-2026-0002']
      );

      // BK-1234
      const sIdLuxuryBlow = serviceMap['Luxury Blowout'];
      await run('INSERT INTO bookings (id, user_id, stylist_id, appointment_date, appointment_time, status, payment_status, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['BK-1234', user2Result.id, alexStylist.id, '2026-06-08', '11:00', 'PENDING', 'UNPAID', 65.0]
      );
      await run('INSERT INTO booking_services (booking_id, service_id, price_charged, duration_minutes) VALUES (?, ?, ?, ?)',
        ['BK-1234', sIdLuxuryBlow, 65.0, 45]
      );

      // BK-5678
      const sIdBridalMakeup = serviceMap['Bridal Makeup Package'];
      await run('INSERT INTO bookings (id, user_id, stylist_id, appointment_date, appointment_time, status, payment_status, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['BK-5678', user3Result.id, priyaStylist.id, '2026-06-24', '16:00', 'CONFIRMED', 'PAID', 250.0]
      );
      await run('INSERT INTO booking_services (booking_id, service_id, price_charged, duration_minutes) VALUES (?, ?, ?, ?)',
        ['BK-5678', sIdBridalMakeup, 250.0, 120]
      );
      await run('INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_reference, invoice_number) VALUES (?, ?, ?, ?, ?, ?)',
        ['BK-5678', 250.0, 'CREDIT_CARD', 'COMPLETED', 'TXN-5678-CC', 'INV-2026-0003']
      );

      // Add a couple of initial Audit Logs for seeding visuality
      await run('INSERT INTO audit_logs (action, target_table, target_id, new_state) VALUES (?, ?, ?, ?)',
        ['SEED_DATABASE', 'system', '0', '{"status": "Database successfully initialized and seeded with 18 normalized tables"}']
      );

      console.log('Database upgrade initialization and seeding complete.');
    }
  } catch (err) {
    console.error('Failed to initialize database schema:', err);
  }
};

module.exports = {
  db,
  query,
  get,
  run,
  hashPassword,
  verifyPassword,
  initDb
};
