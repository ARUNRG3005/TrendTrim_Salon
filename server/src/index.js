const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Secure password hashing helper using PBKDF2
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === checkHash;
}

// Mock DB
let bookings = [
  {
    id: 'BK-8891',
    userEmail: 'user@luxebook.com',
    service: 'Sculpting Facial',
    date: '2026-06-15',
    time: '14:00',
    therapist: 'Dr. Sarah Sterling',
    status: 'CONFIRMED',
    price: 240
  },
  {
    id: 'BK-4530',
    userEmail: 'user@luxebook.com',
    service: 'Deep Tissue Spa',
    date: '2026-05-20',
    time: '10:30',
    therapist: 'Master Therapist Julian',
    status: 'COMPLETED',
    price: 180
  }
];

const users = [
  { email: 'admin@gmail.com', password: hashPassword('adminlb123'), name: 'LuxeBook Admin', role: 'ADMIN', tier: 'DIAMOND TIER' },
  { email: 'user@luxebook.com', password: hashPassword('user'), name: 'Eleanor Vane', role: 'USER', tier: 'PLATINUM MEMBER' }
];

// Admin Authorization Middleware
const adminAuth = (req, res, next) => {
  const userRole = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  if (!userRole) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (userRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied: Admin role required' });
  }
  next();
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const cleanEmail = email.toLowerCase().trim();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  
  if (user && verifyPassword(password, user.password)) {
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const cleanEmail = email.toLowerCase().trim();

  // Case-insensitive check for reserved admin email
  if (cleanEmail === 'admin@gmail.com') {
    return res.status(400).json({ message: 'Admin account is pre-registered' });
  }

  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = { 
    email: cleanEmail, 
    password: hashPassword(password), 
    name, 
    role: 'USER', 
    tier: 'PLATINUM MEMBER' 
  };
  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser });
});

// Bookings routes
app.get('/api/bookings', (req, res) => {
  const { email } = req.query;
  if (email) {
    const filtered = bookings.filter(b => b.userEmail.toLowerCase() === email.toLowerCase().trim());
    res.json(filtered);
  } else {
    // Admin only - requires admin authorization middleware
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    res.json(bookings);
  }
});

app.post('/api/bookings', (req, res) => {
  const booking = req.body;
  bookings.push(booking);
  res.status(201).json(booking);
});

app.delete('/api/bookings/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  bookings = bookings.filter(b => b.id !== id);
  res.json({ success: true });
});

app.put('/api/bookings/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const booking = bookings.find(b => b.id === id);
  if (booking) {
    booking.status = status;
    res.json(booking);
  } else {
    res.status(404).json({ message: 'Booking not found' });
  }
});

// Admin Analytics route - protected by adminAuth middleware
app.get('/api/admin/analytics', adminAuth, (req, res) => {
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0) + 12450; // Add simulated past sales
  const salesDistribution = {
    facials: bookings.filter(b => b.service.includes('Facial')).length * 240 + 5800,
    spa: bookings.filter(b => b.service.includes('Spa')).length * 180 + 4200,
    aesthetics: bookings.filter(b => b.service.includes('Aesthetic')).length * 220 + 2450
  };
  
  res.json({
    totalBookings: bookings.length + 84,
    activeClients: users.length + 42,
    totalRevenue,
    salesDistribution,
    recentBookings: bookings.slice(-5)
  });
});

app.listen(PORT, () => {
  console.log(`LuxeBook Server is running on port ${PORT}`);
});
