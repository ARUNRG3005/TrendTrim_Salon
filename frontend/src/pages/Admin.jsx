import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import { Hero195 } from '../components/ui/hero-195';
import { BorderBeam } from '../components/ui/border-beam';
import { TracingBeam } from '../components/ui/tracing-beam';
import API_BASE from '../api';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('overview'); // overview, appointments, customers, specialists, services, analytics, audit-logs, settings
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic States loaded from API
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookingsCount: 0,
    activeClients: 0,
    totalStylists: 0,
    totalServices: 0,
    totalRevenue: 0,
    salesDistribution: { hair: 0, color: 0, beauty: 0 },
    topStylists: [],
    popularServices: [],
    recentActivities: [],
    recentBookings: []
  });
  const [bookings, setBookings] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [customers, setCustomers] = useState([]); // Re-used for User Management
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Filters & Search
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar widget state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Image Uploading States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // CRUD Edit/Add States
  const [editingService, setEditingService] = useState(null);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'Hair',
    description: '',
    duration_minutes: 60,
    price: 95.0,
    discount_price: '',
    image_url: '',
    display_order: 0,
    is_featured: false,
    status: 'ACTIVE'
  });

  const [editingSpecialist, setEditingSpecialist] = useState(null);
  const [isAddSpecialistOpen, setIsAddSpecialistOpen] = useState(false);
  const [specialistForm, setSpecialistForm] = useState({
    name: '',
    email: '',
    phone: '',
    profile_photo_url: '',
    bio: '',
    specialization: '',
    experience_years: 5,
    employment_status: 'ACTIVE',
    assigned_services: [],
    availability: [
      { day_of_week: 1, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 2, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 3, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 4, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 5, start_time: '09:00', end_time: '18:00' }
    ]
  });

  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    therapist: '',
    status: '',
    notes: '',
    price: 0
  });

  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    profile_photo_url: '',
    tier: 'STANDARD',
    status: 'ACTIVE',
    role: 'USER'
  });

  const [passwordResetUser, setPasswordResetUser] = useState(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'System Upgrade: 18-Table Normalized Database operational.', read: false, time: '10 mins ago' },
    { id: 2, text: 'Audit logging active on all administrative modules.', read: true, time: '1 hour ago' }
  ]);

  // Headers helper
  const getHeaders = (extra = {}) => {
    const apiHeaders = { ...extra };
    if (user) {
      apiHeaders['x-user-email'] = user.email;
      apiHeaders['x-user-role'] = user.role;
    }
    return apiHeaders;
  };

  // Fetch Data from DB — each endpoint is independently resilient
  const fetchData = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    const headers = getHeaders();

    // 1. Analytics — try first, but don't block if it 500s
    let analyticsData = null;
    try {
      const r = await fetch(`${API_BASE}/api/admin/analytics`, { headers });
      if (r.ok) analyticsData = await r.json();
      else console.warn('[Admin] analytics returned', r.status);
    } catch (e) { console.warn('[Admin] analytics fetch failed:', e.message); }

    // 2. Bookings — try dedicated admin endpoint first, fallback to /api/bookings
    let allBookings = [];
    try {
      // Try /api/admin/bookings (new endpoint)
      const r1 = await fetch(`${API_BASE}/api/admin/bookings`, { headers });
      if (r1.ok) {
        allBookings = await r1.json();
      } else {
        // Fallback: /api/bookings without email param (returns all for ADMIN role)
        console.warn('[Admin] /api/admin/bookings returned', r1.status, '— falling back to /api/bookings');
        const r2 = await fetch(`${API_BASE}/api/bookings`, { headers });
        if (r2.ok) allBookings = await r2.json();
      }
      if (Array.isArray(allBookings)) setBookings(allBookings);
    } catch (e) {
      console.warn('[Admin] bookings fetch failed:', e.message);
      // Last resort: read from localStorage
      let stored = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('trendtrim_bookings_')) {
          try { stored = [...stored, ...JSON.parse(localStorage.getItem(key) || '[]')]; } catch(_) {}
        }
      }
      if (stored.length > 0) { allBookings = stored; setBookings(stored); }
    }

    // 3. If analytics worked, use it; otherwise compute stats from live data
    if (analyticsData && typeof analyticsData.totalBookings === 'number') {
      setStats(analyticsData);
    } else {
      // Build stats from bookings + customers we already have
      setStats(prev => ({
        ...prev,
        totalBookings: allBookings.length,
        todayBookingsCount: allBookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length,
        recentBookings: allBookings.slice(0, 5),
      }));
    }

    // 4. Services
    try {
      const r = await fetch(`${API_BASE}/api/admin/services`, { headers });
      if (r.ok) setServicesList(await r.json());
    } catch (e) { console.warn('[Admin] services fetch failed'); }

    // 5. Stylists
    try {
      const r = await fetch(`${API_BASE}/api/admin/stylists`, { headers });
      if (r.ok) setSpecialists(await r.json());
    } catch (e) { console.warn('[Admin] stylists fetch failed'); }

    // 6. Users
    try {
      const r = await fetch(`${API_BASE}/api/admin/users`, { headers });
      if (r.ok) {
        const users = await r.json();
        setCustomers(users);
        // Update activeClients if analytics didn't load
        if (!analyticsData) {
          setStats(prev => ({ ...prev, activeClients: Array.isArray(users) ? users.length : 0 }));
        }
      }
    } catch (e) { console.warn('[Admin] users fetch failed'); }

    // 7. Audit Logs
    try {
      const r = await fetch(`${API_BASE}/api/admin/audit-logs`, { headers });
      if (r.ok) setAuditLogs(await r.json());
    } catch (e) { console.warn('[Admin] audit-logs fetch failed'); }

    if (showLoader) setLoading(false);
  };

  // Auto-refresh every 30 seconds so new bookings appear without page reload
  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = () => {
    const existingStr = localStorage.getItem('trendtrim_admin_notifications');
    if (existingStr) {
      try {
        const existing = JSON.parse(existingStr);
        setNotifications([
          ...existing,
          { id: 'def-1', text: 'System Upgrade: 18-Table Normalized Database operational.', read: false, time: '10 mins ago' },
          { id: 'def-2', text: 'Audit logging active on all administrative modules.', read: true, time: '1 hour ago' }
        ]);
      } catch (e) {}
    }
  };

  useEffect(() => {
    // Notifications & storage event listeners
    loadNotifications();
    const handleStorage = () => loadNotifications();
    window.addEventListener('storage', handleStorage);
    // Listen for new bookings created on the user side → refresh admin data
    const handleNewBooking = () => fetchData();
    window.addEventListener('trendtrim_booking_created', handleNewBooking);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('trendtrim_booking_created', handleNewBooking);
    };
  }, []);

  // Image Upload
  const handleImageUpload = (e, type, onUploadSuccess) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (JPG, JPEG, PNG, WEBP)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Only JPG, JPEG, PNG and WEBP file formats are supported.');
      return;
    }

    // Validate file size (Maximum 5MB limit)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert('File size exceeds the 5MB limit. Please upload a smaller image.');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Data = reader.result;
      const filename = `${type}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      // Use XMLHttpRequest to get upload progress
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/api/admin/upload`, true);
      
      const headers = getHeaders({ 'Content-Type': 'application/json' });
      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key]);
      });

      // Track progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      // Response handlers
      xhr.onload = () => {
        setUploadingImage(false);
        setUploadProgress(0);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            onUploadSuccess(response.url);
            alert('Image uploaded and saved to server uploads folder!');
          } catch (err) {
            console.error('Error parsing response:', err);
            alert('Failed to process server response.');
          }
        } else {
          let errMsg = 'Failed to upload image.';
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.message) errMsg += ` (${response.message})`;
          } catch(e) {}
          alert(errMsg);
        }
      };

      xhr.onerror = () => {
        setUploadingImage(false);
        setUploadProgress(0);
        alert('Network error during upload.');
      };

      xhr.send(JSON.stringify({ filename, base64Data }));
    };

    reader.onerror = () => {
      setUploadingImage(false);
      alert('Error reading local file.');
    };
  };

  // --- SERVICE ACTIONS ---

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/services`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          ...serviceForm,
          price: parseFloat(serviceForm.price),
          discount_price: serviceForm.discount_price ? parseFloat(serviceForm.discount_price) : null,
          display_order: parseInt(serviceForm.display_order) || 0
        })
      });
      if (res.ok) {
        alert('Service successfully added to database.');
        setIsAddServiceOpen(false);
        setServiceForm({
          name: '', category: 'Hair', description: '', duration_minutes: 60,
          price: 95.0, discount_price: '', image_url: '', display_order: 0,
          is_featured: false, status: 'ACTIVE'
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/services/${editingService.id}`, {
        method: 'PUT',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          ...editingService,
          price: parseFloat(editingService.price),
          discount_price: editingService.discount_price ? parseFloat(editingService.discount_price) : null,
          display_order: parseInt(editingService.display_order) || 0
        })
      });
      if (res.ok) {
        alert('Service successfully updated.');
        setEditingService(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service? It will be soft-deleted.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        alert('Service successfully deleted.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleServiceFeatured = async (service) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ is_featured: service.is_featured ? 0 : 1 })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- STYLIST ACTIONS ---

  const handleCreateStylist = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/stylists`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          ...specialistForm,
          experience_years: parseInt(specialistForm.experience_years) || 0
        })
      });
      if (res.ok) {
        alert('Stylist profile created and registered.');
        setIsAddSpecialistOpen(false);
        setSpecialistForm({
          name: '', email: '', phone: '', profile_photo_url: '', bio: '',
          specialization: '', experience_years: 5, employment_status: 'ACTIVE',
          assigned_services: [],
          availability: [
            { day_of_week: 1, start_time: '09:00', end_time: '18:00' },
            { day_of_week: 2, start_time: '09:00', end_time: '18:00' },
            { day_of_week: 3, start_time: '09:00', end_time: '18:00' },
            { day_of_week: 4, start_time: '09:00', end_time: '18:00' },
            { day_of_week: 5, start_time: '09:00', end_time: '18:00' }
          ]
        });
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Error creating stylist');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditStylistSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/stylists/${editingSpecialist.id}`, {
        method: 'PUT',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          ...editingSpecialist,
          experience_years: parseInt(editingSpecialist.experience_years) || 0
        })
      });
      if (res.ok) {
        alert('Stylist updated successfully.');
        setEditingSpecialist(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStylist = async (id) => {
    if (!confirm('Are you sure you want to remove this stylist? They will be marked as terminated and deactivated.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/stylists/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        alert('Stylist deleted.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- BOOKING ACTIONS ---

  const handleEditBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${editingBooking.id}`, {
        method: 'PUT',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          ...bookingForm,
          price: parseFloat(bookingForm.price)
        })
      });
      if (res.ok) {
        alert('Appointment successfully rescheduled/updated.');
        setEditingBooking(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const quickChangeBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking? it will be soft-deleted.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        alert('Booking cancelled successfully.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- USER ACTIONS ---

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        alert('User profile details updated.');
        setEditingUser(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordVal) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${passwordResetUser.id}/reset-password`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ password: resetPasswordVal })
      });
      if (res.ok) {
        alert('User password successfully reset!');
        setPasswordResetUser(null);
        setResetPasswordVal('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user? All bookings and profiles will be soft deleted/deactivated.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        alert('User successfully deleted.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n) => {
    if (n.type === 'BOOKING' && n.booking) {
      setActiveTab('appointments');
      setEditingBooking(n.booking);
      setBookingForm({
        date: n.booking.date,
        time: n.booking.time,
        therapist: n.booking.therapist,
        status: n.booking.status,
        notes: n.booking.notes || '',
        price: n.booking.price
      });
      setNotificationOpen(false);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Calendar Helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  const changeMonth = (offset) => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(nextDate);
  };

  // Filter Bookings list — fully null-safe
  const filteredBookings = bookings.filter(b => {
    if (!b || !b.id) return false;
    const status  = (b.status || '').toUpperCase();
    const service  = (b.service  || '').toLowerCase();
    const therapist = (b.therapist || '').toLowerCase();
    const userEmail = (b.userEmail || '').toLowerCase();
    const id       = String(b.id).toLowerCase();
    const date     = b.date || '';

    const matchStatus = statusFilter === 'ALL'
      || status === statusFilter.toUpperCase()
      || (statusFilter.toUpperCase() === 'APPROVED' && status === 'CONFIRMED');
    const matchDate  = !selectedDate || date === selectedDate;
    const matchQuery = !searchQuery ||
      id.includes(searchQuery.toLowerCase()) ||
      userEmail.includes(searchQuery.toLowerCase()) ||
      service.includes(searchQuery.toLowerCase()) ||
      therapist.includes(searchQuery.toLowerCase());
    return matchStatus && matchDate && matchQuery;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-zinc-100">
        <div className="w-12 h-12 rounded-full border-2 border-[#a37f4c] border-t-transparent animate-spin mb-md" />
        <p className="font-serif text-lg tracking-wide text-zinc-400">Loading TrendTrim...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarInset className="admin-console min-h-screen w-full flex bg-transparent text-zinc-800 dark:text-zinc-100 font-sans pt-0">
        <div style={{ display: 'flex', width: '100%', minHeight: '100svh', position: 'relative' }}>

          {/* Backdrop overlay for mobile */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* SIDEBAR NAVIGATION - Luxury Console theme */}
          <aside className={`fixed md:relative top-0 bottom-0 left-0 z-40 w-64 bg-[var(--card)]/95 md:bg-[var(--card)]/85 backdrop-blur-md border-r border-[var(--border)] flex flex-col justify-between p-md transition-transform duration-300 ease-in-out md:translate-x-0 md:flex-shrink-0 h-screen md:h-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <div className="space-y-md">
              {/* Brand Logo & Console Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-md">
                <div className="text-left">
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--primary)]">
                    TrendTrim Salon
                  </h2>
                  <p className="font-label-caps text-[9px] text-[#a37f4c] tracking-[0.25em] uppercase font-bold mt-1">
                    LUXURY ADMIN CONSOLE
                  </p>
                </div>
                {/* Mobile Close Button */}
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => navigate('/home')}
                  className="flex items-center gap-md py-2.5 px-md rounded-xl text-xs font-semibold tracking-wide transition-all text-left text-amber-600 dark:text-[#c9a96e] hover:bg-amber-500/10 dark:hover:bg-gold/10 hover:text-amber-700 dark:hover:text-gold cursor-pointer mb-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#a37f4c]">arrow_back</span>
                  <span>Back to Salon</span>
                </button>

                {[
                  { id: 'overview', label: 'Overview', icon: 'dashboard' },
                  { id: 'appointments', label: 'Appointments', icon: 'calendar_month' },
                  { id: 'customers', label: 'Users & Dossiers', icon: 'group' },
                  { id: 'specialists', label: 'Specialists Roster', icon: 'face' },
                  { id: 'services', label: 'Services Catalog', icon: 'content_cut' },
                  { id: 'analytics', label: 'BI Analytics', icon: 'analytics' },
                  { id: 'audit-logs', label: 'Audit Trails', icon: 'history' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setNotificationOpen(false); setSidebarOpen(false); }}
                    className={`relative flex items-center gap-md py-3 px-lg rounded-xl text-sm font-semibold tracking-wide transition-all text-left cursor-pointer
                  ${activeTab === item.id
                        ? 'bg-[var(--secondary)] text-[var(--primary)] dark:bg-zinc-800/80 dark:text-white'
                        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200'
                      }`}
                  >
                    {activeTab === item.id && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#a37f4c] rounded-r-full" />
                    )}
                    <span className={`material-symbols-outlined text-[20px] ${activeTab === item.id ? 'text-[#a37f4c]' : ''}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Bottom User Area */}
            <div className="border-t border-[var(--border)] pt-md">
              <button
                onClick={() => { setActiveTab('settings'); setNotificationOpen(false); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-md py-3 px-lg rounded-xl text-sm font-semibold tracking-wide transition-all text-left mb-sm cursor-pointer
              ${activeTab === 'settings'
                    ? 'bg-[var(--secondary)] text-[var(--primary)] dark:bg-zinc-800/80 dark:text-white'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span>Preferences</span>
              </button>

              {/* Profile Card */}
              <div className="flex items-center gap-sm p-sm bg-[var(--secondary)]/40 dark:bg-zinc-800/50 rounded-xl">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 select-none">
                  <span className="font-serif text-sm font-bold text-[#a37f4c]">
                    {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
                  </span>
                </div>
                <div className="truncate flex-1">
                  <h4 className="text-xs font-bold text-[var(--primary)] truncate">{user?.name || 'Admin'}</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{user?.role || 'Manager'}</p>
                </div>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="text-[#a37f4c] hover:text-red-600 transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">

            {/* HEADER */}
            <header className="h-20 border-b border-[var(--border)] flex items-center justify-between px-lg relative z-50 flex-shrink-0 bg-white/80 dark:bg-[#BA9B61] backdrop-blur-md">
              <div className="flex items-center gap-md">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Toggle Menu"
                >
                  <span className="material-symbols-outlined text-[20px] text-zinc-600 dark:text-zinc-300">menu</span>
                </button>

                <div>
                  <h1 className="font-serif text-[var(--primary)] text-xl font-semibold leading-tight">
                    {activeTab === 'overview' && 'TrendTrim Operational Center'}
                    {activeTab === 'appointments' && 'Bookings Control Center'}
                    {activeTab === 'customers' && 'User Management Console'}
                    {activeTab === 'specialists' && 'Practitioner Registry'}
                    {activeTab === 'services' && 'Services Catalog CRUD'}
                    {activeTab === 'analytics' && 'BI Reports & Charts'}
                    {activeTab === 'audit-logs' && 'System Audit Trails'}
                    {activeTab === 'settings' && 'Preferences Console'}
                  </h1>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-md">
                {/* Search */}
                <div className="relative hidden md:block">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-zinc-400">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Quick search..."
                    className="bg-[var(--card)] border border-zinc-200 dark:border-zinc-800 focus:border-[#a37f4c] focus:outline-none rounded-full pl-9 pr-4 py-1.5 text-xs w-60 text-zinc-800 dark:text-zinc-100 transition-all placeholder-zinc-400"
                  />
                </div>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors relative cursor-pointer"
                    aria-label="Open notifications"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#a37f4c] dark:text-[#a37f4c]">
                      notifications
                    </span>
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    )}
                  </button>

                  {notificationOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setNotificationOpen(false)} />
                      <div className="absolute right-0 mt-sm w-80 bg-white dark:bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-md z-40 animate-[scaleIn_0.2s_ease-out]">
                        <div className="flex justify-between items-center pb-sm border-b border-zinc-100 dark:border-zinc-800 mb-sm">
                          <h4 className="text-xs font-bold text-[var(--primary)]">Notifications</h4>
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-[10px] font-bold text-[#a37f4c] hover:underline"
                          >
                            Mark all as read
                          </button>
                        </div>

                        <div className="space-y-sm max-h-60 overflow-y-auto">
                          {notifications.map(n => (
                            <div 
                              key={n.id} 
                              onClick={() => handleNotificationClick(n)}
                              className={`p-sm rounded-lg text-xs leading-normal flex gap-sm ${n.type === 'BOOKING' ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800' : ''} ${n.read ? 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500' : 'bg-gold/5 border-l-2 border-gold text-zinc-800 dark:text-zinc-200 font-medium'}`}
                            >
                              <div className="flex-1">
                                <p>{n.text}</p>
                                <span className="text-[9px] text-zinc-400 block mt-xs">{n.time}</span>
                              </div>
                              {n.type === 'BOOKING' && (
                                <div className="flex items-center text-[#a37f4c]">
                                  <span className="material-symbols-outlined text-[16px]">arrow_forward_ios</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => fetchData()}
                  className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Refresh Database Sync"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#a37f4c] dark:text-[#a37f4c]">refresh</span>
                </button>
              </div>
            </header>

            {/* VIEW PANELS */}
            <div className="flex-1 overflow-y-auto p-lg relative">
              {/* Cinematic Background Gradients */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/10 dark:bg-gold/5 blur-[120px]" />
                <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-[#a37f4c]/10 dark:bg-[#a37f4c]/5 blur-[100px]" />
              </div>

              <div className="relative z-10 w-full">
                
                {/* TAB 1: OVERVIEW HERO */}
                {activeTab === 'overview' && (
                  <Hero195
                    stats={stats}
                    recentBookings={stats.recentBookings}
                    specialists={specialists}
                    services={servicesList}
                    onNavigateTab={(tabId) => setActiveTab(tabId)}
                  />
                )}

                {/* TAB 2: APPOINTMENTS BOOKING LIST */}
                {activeTab === 'appointments' && (
                  <div className="space-y-lg page-transition text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
                      <div>
                        <h2 className="font-serif text-[var(--primary)] text-[26px] font-bold tracking-tight">Appointments Booking Manager</h2>
                        <p className="text-xs text-zinc-500 font-sans mt-0.5">Filter, search, approve, reschedule and assign stylists to appointments.</p>
                      </div>

                      <div className="flex flex-wrap gap-sm items-center">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 text-xs focus:outline-none focus:border-gold"
                        >
                          <option value="ALL">All Statuses</option>
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>

                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 text-xs focus:outline-none focus:border-gold"
                        />

                        {selectedDate && (
                          <button onClick={() => setSelectedDate('')} className="text-xs text-[#a37f4c] font-bold hover:underline">
                            Clear Date
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start">
                      {/* Calendar widget */}
                      <div className="lg:col-span-4 bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl p-md shadow-sm relative overflow-hidden">
                        <BorderBeam size={160} duration={14} delay={0} colorFrom="#a37f4c" colorTo="#c9a96e" />
                        <div className="flex justify-between items-center mb-md pb-xs border-b border-zinc-100 dark:border-zinc-900">
                          <h3 className="font-serif text-[var(--primary)] font-semibold text-sm">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </h3>
                          <div className="flex gap-xs">
                            <button onClick={() => changeMonth(-1)} className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 transition-colors">
                              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                            </button>
                            <button onClick={() => changeMonth(1)} className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 transition-colors">
                              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold mb-xs text-zinc-400">
                          <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                          ))}

                          {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                            const dayNumber = i + 1;
                            const dayDateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                            const hasAppointments = bookings.some(b => b.date === dayDateString && b.deleted_at === undefined);
                            const isSelected = selectedDate === dayDateString;

                            return (
                              <button
                                key={dayNumber}
                                onClick={() => setSelectedDate(isSelected ? '' : dayDateString)}
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative hover:bg-gold/15 transition-all text-xs font-semibold cursor-pointer
                                          ${isSelected ? 'bg-[var(--primary)] text-zinc-950 font-bold' : 'text-zinc-700 dark:text-zinc-300 bg-[var(--card)]/40'}
                                        `}
                              >
                                <span>{dayNumber}</span>
                                {hasAppointments && (
                                  <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isSelected ? 'bg-zinc-950' : 'bg-gold'}`} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Appointments Table */}
                      <div className="lg:col-span-8 bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl p-lg shadow-sm relative overflow-hidden">
                        <BorderBeam size={300} duration={16} delay={2} colorFrom="#a37f4c" colorTo="#c9a96e" />
                        <h3 className="font-serif text-[var(--primary)] font-semibold mb-md">Bookings Registry ({filteredBookings.length})</h3>

                        {filteredBookings.length === 0 ? (
                          <div className="text-center py-xl text-zinc-400 font-sans text-xs">
                            <span className="material-symbols-outlined text-4xl block mb-sm text-zinc-300">event_busy</span>
                            No appointments found matching current filters.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left font-sans text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-[var(--border)] font-label-caps text-[10px] text-zinc-400">
                                  <th className="pb-sm font-bold">ID</th>
                                  <th className="pb-sm font-bold">CLIENT</th>
                                  <th className="pb-sm font-bold">SERVICE</th>
                                  <th className="pb-sm font-bold">SPECIALIST</th>
                                  <th className="pb-sm font-bold">SCHEDULE</th>
                                  <th className="pb-sm font-bold">PRICE</th>
                                  <th className="pb-sm font-bold">STATUS</th>
                                  <th className="pb-sm font-bold text-right">ACTIONS</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredBookings.map((b) => (
                                  <tr key={b.id} className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                                    <td className="py-md font-bold text-[var(--primary)] pr-2">{b.id}</td>
                                    <td className="py-md pr-2">
                                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">{b.userName || '—'}</div>
                                      <div className="text-zinc-500 dark:text-zinc-400 text-[10px]">{b.userEmail || '—'}</div>
                                    </td>
                                    <td className="py-md font-semibold text-zinc-850 dark:text-zinc-200 pr-2">{b.service || '—'}</td>
                                    <td className="py-md text-zinc-500 dark:text-zinc-400 pr-2">{b.therapist || '—'}</td>
                                    <td className="py-md text-zinc-650 dark:text-zinc-400 pr-2">
                                      <div>{b.date || '—'}</div>
                                      <div className="text-[10px] text-zinc-400">{b.time || ''}</div>
                                    </td>
                                    <td className="py-md pr-2">
                                      <div className="font-semibold text-[var(--primary)]">{'$' + (b.price || 0)}</div>
                                      <div className={`text-[10px] ${b.paymentStatus === 'COMPLETED' || b.paymentStatus === 'PAID' ? 'text-green-500' : 'text-amber-500'}`}>
                                        {b.paymentStatus || 'PENDING'}
                                      </div>
                                    </td>
                                    <td className="py-md">
                                      <span className={`inline-block font-label-caps text-[9px] font-bold px-sm py-1 rounded-full border
                                                ${b.status === 'CONFIRMED' || b.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/40' : ''}
                                                ${b.status === 'PENDING' || b.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40' : ''}
                                                ${b.status === 'COMPLETED' || b.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40' : ''}
                                                ${b.status === 'CANCELLED' || b.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40' : ''}
                                              `}>
                                        {b.status === 'CONFIRMED' ? 'Confirmed' : b.status}
                                      </span>
                                    </td>
                                    <td className="py-md text-right">
                                      <div className="flex justify-end gap-xs">
                                        {b.status === 'PENDING' && (
                                          <button
                                            onClick={() => quickChangeBookingStatus(b.id, 'CONFIRMED')}
                                            className="w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950/30 dark:hover:bg-green-900/40 dark:text-green-450 flex items-center justify-center border border-green-200/50 dark:border-green-800/50 transition-colors cursor-pointer"
                                            title="Approve Booking"
                                          >
                                            <span className="material-symbols-outlined text-[16px]">check</span>
                                          </button>
                                        )}
                                        {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                                          <>
                                            <button
                                              onClick={() => {
                                                setEditingBooking(b);
                                                setBookingForm({
                                                  date: b.date,
                                                  time: b.time,
                                                  therapist: b.therapist,
                                                  status: b.status,
                                                  notes: b.notes || '',
                                                  price: b.price
                                                });
                                              }}
                                              className="w-7 h-7 rounded-full bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                                              title="Edit & Reschedule Booking"
                                            >
                                              <span className="material-symbols-outlined text-[16px]">edit</span>
                                            </button>
                                            <button
                                              onClick={() => quickChangeBookingStatus(b.id, 'COMPLETED')}
                                              className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center border border-blue-200/50 dark:border-blue-800/50 transition-colors cursor-pointer"
                                              title="Complete Appointment"
                                            >
                                              <span className="material-symbols-outlined text-[16px]">done_all</span>
                                            </button>
                                            <button
                                              onClick={() => handleCancelBooking(b.id)}
                                              className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-450 flex items-center justify-center border border-red-200/50 dark:border-red-800/50 transition-colors cursor-pointer"
                                              title="Cancel Appointment"
                                            >
                                              <span className="material-symbols-outlined text-[16px]">close</span>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: CUSTOMERS & USER MANAGEMENT */}
                {activeTab === 'customers' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start page-transition text-left animate-fadeUp">
                    <div className="lg:col-span-12 bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl p-lg shadow-sm relative overflow-hidden">
                      <BorderBeam size={300} duration={15} delay={1} colorFrom="#c9a96e" colorTo="#a37f4c" />
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-lg">
                        <div>
                          <h3 className="font-serif text-[var(--primary)] text-lg font-semibold">User & Client Accounts Base</h3>
                          <p className="text-xs text-zinc-400">View, modify profile status, membership tiers, and perform account overrides.</p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border)] font-label-caps text-[10px] text-zinc-400">
                              <th className="pb-sm font-bold">CLIENT NAME</th>
                              <th className="pb-sm font-bold">EMAIL ADDRESS</th>
                              <th className="pb-sm font-bold">ROLE</th>
                              <th className="pb-sm font-bold">PHONE</th>
                              <th className="pb-sm font-bold">MEMBERSHIP TIER</th>
                              <th className="pb-sm font-bold">STATUS</th>
                              <th className="pb-sm font-bold">BOOKINGS</th>
                              <th className="pb-sm font-bold text-right">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customers.map((c) => (
                              <tr key={c.id} className="border-b border-zinc-100 dark:border-zinc-900 last:border-none hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                                <td className="py-md font-bold text-[var(--primary)] flex items-center gap-sm">
                                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gold/30 bg-gold/5 flex-shrink-0 flex items-center justify-center">
                                    {c.profile_photo_url ? (
                                      <img src={getImageUrl(c.profile_photo_url)} alt={c.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[10px]">{c.name.slice(0, 2).toUpperCase()}</span>
                                    )}
                                  </div>
                                  <span>{c.name}</span>
                                </td>
                                <td className="py-md text-zinc-650 dark:text-zinc-300">{c.email}</td>
                                <td className="py-md">
                                  <span className={`px-sm py-0.5 rounded text-[10px] font-bold ${c.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border border-red-500/30' : c.role === 'STYLIST' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' : 'bg-zinc-500/10 text-zinc-400'}`}>
                                    {c.role}
                                  </span>
                                </td>
                                <td className="py-md text-zinc-500">{c.phone || '—'}</td>
                                <td className="py-md">
                                  <span className="font-label-caps text-[9px] font-bold bg-[var(--primary)]/10 text-primary px-sm py-0.5 rounded-full border border-primary/20">
                                    {c.tier || 'STANDARD'}
                                  </span>
                                </td>
                                <td className="py-md">
                                  <span className={`font-semibold font-label-caps text-[9px] px-sm py-1 rounded-full border ${c.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30'}`}>
                                    {c.status}
                                  </span>
                                </td>
                                <td className="py-md font-bold text-center">{c.bookings}</td>
                                <td className="py-md text-right">
                                  <div className="flex justify-end gap-xs">
                                    <button
                                      onClick={() => {
                                        setEditingUser(c);
                                        setUserForm({
                                          name: c.name,
                                          email: c.email,
                                          phone: c.phone || '',
                                          profile_photo_url: c.profile_photo_url || '',
                                          tier: c.tier || 'STANDARD',
                                          status: c.status,
                                          role: c.role
                                        });
                                      }}
                                      className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-gold dark:hover:bg-zinc-900 cursor-pointer"
                                      title="Edit Dossier"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">edit</span>
                                    </button>
                                    <button
                                      onClick={() => setPasswordResetUser(c)}
                                      className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-amber-500 dark:hover:bg-zinc-900 cursor-pointer"
                                      title="Reset Password"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(c.id)}
                                      className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-red-500 dark:hover:bg-zinc-900 cursor-pointer"
                                      title="Soft-Delete User"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: SPECIALISTS ROSTER */}
                {activeTab === 'specialists' && (
                  <div className="space-y-md page-transition text-left animate-fadeUp">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
                      <div>
                        <h2 className="font-serif text-[var(--primary)] text-[26px] font-bold tracking-tight">Specialists Roster</h2>
                        <p className="text-xs text-zinc-500 font-sans mt-0.5">Manage practitioner specializations, assigned services and shift availability.</p>
                      </div>
                      <button
                        onClick={() => setIsAddSpecialistOpen(true)}
                        className="bg-[var(--primary)] text-zinc-950 px-lg py-2.5 rounded-xl font-label-caps text-xs tracking-wider font-bold hover:bg-opacity-90 transition-all flex items-center gap-xs cursor-pointer shadow-md"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Add Stylist
                      </button>
                    </div>

                    <TracingBeam>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md pl-4 md:pl-0">
                        {specialists.map((s, i) => (
                          <div key={s.id} className="bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl p-lg shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-all duration-300">
                            <BorderBeam size={120} duration={12} delay={i * 2} colorFrom="#a37f4c" colorTo="#c9a96e" />
                            
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-100 ring-2 ring-gold/25 mb-md relative">
                              {s.profile_photo_url ? (
                                <img src={getImageUrl(s.profile_photo_url)} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-zinc-500">person</span></div>
                              )}
                            </div>
                            
                            <h4 className="font-serif text-[var(--primary)] font-bold text-sm">{s.name}</h4>
                            <p className="text-[11px] text-zinc-400 font-sans mt-xs">{s.specialization || s.title || 'General practitioner'}</p>
                            <p className="text-[10px] text-zinc-500 mt-1 italic font-sans max-w-full truncate">{s.bio}</p>

                            <div className="flex items-center gap-xs mt-sm text-xs font-semibold text-gold">
                              <span className="material-symbols-outlined text-gold text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              <span>{s.average_rating || 5.0}</span>
                              <span className="text-[10px] text-zinc-400">({s.experience_years} yrs exp)</span>
                            </div>

                            {s.assigned_services && s.assigned_services.length > 0 && (
                              <div className="mt-md w-full text-left">
                                <span className="font-label-caps text-[8px] text-zinc-400 block mb-1">ASSIGNED SERVICES</span>
                                <div className="flex flex-wrap gap-xs">
                                  {s.assigned_services.slice(0, 3).map((svc, idx) => (
                                    <span key={idx} className="bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-350 text-[9px] px-1.5 py-0.5 rounded">
                                      {svc}
                                    </span>
                                  ))}
                                  {s.assigned_services.length > 3 && (
                                    <span className="text-[9px] text-zinc-400 mt-0.5">+{s.assigned_services.length - 3} more</span>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="mt-md pt-sm border-t border-zinc-100 dark:border-zinc-900 w-full flex justify-between items-center text-xs">
                              <span className="text-zinc-500">Employment:</span>
                              <span className={`font-semibold font-label-caps text-[9px] px-sm py-1 rounded-full border
                                        ${s.employment_status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                                      `}>
                                {s.employment_status}
                              </span>
                            </div>

                            <div className="mt-md pt-xs w-full flex justify-end gap-sm border-t border-zinc-50 dark:border-zinc-900/60">
                              <button
                                onClick={() => {
                                  setEditingSpecialist(s);
                                }}
                                className="text-zinc-500 hover:text-gold text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[15px]">edit</span>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteStylist(s.id)}
                                className="text-zinc-400 hover:text-red-500 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TracingBeam>
                  </div>
                )}

                {/* TAB 5: SERVICES CATALOG CRUD */}
                {activeTab === 'services' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start page-transition text-left animate-fadeUp">
                    <div className="lg:col-span-12 bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl p-lg shadow-sm relative overflow-hidden">
                      <BorderBeam size={300} duration={18} delay={4} colorFrom="#c9a96e" colorTo="#a37f4c" />
                      <div className="flex justify-between items-center mb-lg">
                        <div>
                          <h3 className="font-serif text-[var(--primary)] text-lg font-semibold">TrendTrim Services CRUD</h3>
                          <p className="text-xs text-zinc-400">Direct database editing of rates, discounts, details and featured status.</p>
                        </div>
                        <button
                          onClick={() => setIsAddServiceOpen(true)}
                          className="bg-[var(--primary)] text-zinc-950 px-lg py-2.5 rounded-xl font-label-caps text-xs tracking-wider font-bold hover:bg-opacity-90 transition-all flex items-center gap-xs cursor-pointer shadow-md"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                          Add Service
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border)] font-label-caps text-[10px] text-zinc-400">
                              <th className="pb-sm font-bold">SERVICE NAME</th>
                              <th className="pb-sm font-bold">CATEGORY</th>
                              <th className="pb-sm font-bold">DURATION</th>
                              <th className="pb-sm font-bold">RATE FEE</th>
                              <th className="pb-sm font-bold">DISCOUNT RATE</th>
                              <th className="pb-sm font-bold">FEATURED</th>
                              <th className="pb-sm font-bold">STATUS</th>
                              <th className="pb-sm font-bold">ORDER</th>
                              <th className="pb-sm font-bold text-right">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {servicesList.map((s) => (
                              <tr key={s.id} className="border-b border-zinc-100 dark:border-zinc-900 last:border-none hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                                <td className="py-md font-bold text-[var(--primary)] flex items-center gap-sm">
                                  {s.image_url && (
                                    <div className="w-8 h-8 rounded overflow-hidden border border-zinc-800 flex-shrink-0">
                                      <img src={getImageUrl(s.image_url)} alt={s.name} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <span>{s.name}</span>
                                </td>
                                <td className="py-md text-zinc-500">{s.category}</td>
                                <td className="py-md text-zinc-650 dark:text-zinc-400">{s.duration_minutes} MIN</td>
                                <td className="py-md font-bold text-[#a37f4c]">${s.price}.00</td>
                                <td className="py-md text-zinc-600 dark:text-zinc-400">
                                  {s.discount_price ? (
                                    <span className="text-red-500 font-bold">${s.discount_price}.00</span>
                                  ) : (
                                    <span className="text-zinc-450">—</span>
                                  )}
                                </td>
                                <td className="py-md">
                                  <button
                                    onClick={() => toggleServiceFeatured(s)}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer
                                      ${s.is_featured ? 'bg-gold/15 border-gold text-gold' : 'border-zinc-300 text-zinc-400 hover:border-gold hover:text-gold'}
                                    `}
                                  >
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: s.is_featured ? "'FILL' 1" : undefined }}>star</span>
                                  </button>
                                </td>
                                <td className="py-md">
                                  <span className={`font-semibold font-label-caps text-[9px] px-sm py-1 rounded-full border ${s.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30' : 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-900/30'}`}>
                                    {s.status}
                                  </span>
                                </td>
                                <td className="py-md text-zinc-500">{s.display_order}</td>
                                <td className="py-md text-right">
                                  <div className="flex justify-end gap-xs">
                                    <button
                                      onClick={() => {
                                        setEditingService(s);
                                      }}
                                      className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-gold cursor-pointer"
                                      title="Edit Service"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteService(s.id)}
                                      className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-red-500 cursor-pointer"
                                      title="Delete Service"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: DETAILED BI ANALYTICS */}
                {activeTab === 'analytics' && (
                  <div className="space-y-lg page-transition text-left animate-fadeUp">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                      {/* Popular services ranking */}
                      <div className="bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl p-lg shadow-sm relative overflow-hidden">
                        <BorderBeam size={220} duration={14} delay={1} colorFrom="#a37f4c" colorTo="#c9a96e" />
                        <h3 className="font-serif text-[var(--primary)] text-sm font-bold mb-md">Popular Services Performance</h3>
                        <div className="space-y-sm">
                          {stats.popularServices && stats.popularServices.map((svc, idx) => (
                            <div key={idx} className="flex justify-between items-center p-sm bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-900">
                              <div>
                                <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs block">{svc.name}</span>
                                <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{svc.category}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-serif font-bold text-gold text-sm block">{svc.count} booked</span>
                                <span className="text-[10px] text-zinc-400">${svc.price} fee</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Stylists Roster */}
                      <div className="bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl p-lg shadow-sm relative overflow-hidden">
                        <BorderBeam size={220} duration={14} delay={3} colorFrom="#c9a96e" colorTo="#a37f4c" />
                        <h3 className="font-serif text-[var(--primary)] text-sm font-bold mb-md">Top Rated Practitioners</h3>
                        <div className="space-y-sm">
                          {stats.topStylists && stats.topStylists.map((st, idx) => (
                            <div key={idx} className="flex justify-between items-center p-sm bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-900">
                              <div className="flex items-center gap-sm">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-gold/30">
                                  {st.profile_photo_url ? (
                                    <img src={getImageUrl(st.profile_photo_url)} alt={st.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-[16px] text-zinc-450">person</span></div>
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-zinc-850 dark:text-zinc-200 text-xs block">{st.name}</span>
                                  <span className="text-[10px] text-zinc-400">{st.specialization}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-xs font-serif font-bold text-gold text-sm">
                                <span className="material-symbols-outlined text-gold text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span>{st.average_rating}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 7: SYSTEM AUDIT LOG VIEWER */}
                {activeTab === 'audit-logs' && (
                  <div className="space-y-lg page-transition text-left animate-fadeUp">
                    <div className="bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl p-lg shadow-sm relative overflow-hidden">
                      <BorderBeam size={300} duration={20} delay={1} colorFrom="#a37f4c" colorTo="#c9a96e" />
                      <h3 className="font-serif text-[var(--primary)] text-lg font-semibold mb-sm">System Action Audit Trails</h3>
                      <p className="text-xs text-zinc-400 mb-lg">Chronological record of database modifications and admin overrides (RBAC compliant).</p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border)] font-label-caps text-[10px] text-zinc-400">
                              <th className="pb-sm font-bold">TIMESTAMP</th>
                              <th className="pb-sm font-bold">ACTOR</th>
                              <th className="pb-sm font-bold">ACTION</th>
                              <th className="pb-sm font-bold">TARGET TABLE</th>
                              <th className="pb-sm font-bold">TARGET ID</th>
                              <th className="pb-sm font-bold">STATE CHANGES</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditLogs.map((log) => (
                              <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-900 last:border-none hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                                <td className="py-md text-zinc-500 truncate max-w-[120px]" title={log.created_at}>{log.created_at}</td>
                                <td className="py-md font-semibold text-zinc-700 dark:text-zinc-350">
                                  {log.actor_name || 'System / Setup'}
                                  <span className="text-[10px] text-zinc-400 block font-normal">{log.actor_email || 'system@trendtrim.com'}</span>
                                </td>
                                <td className="py-md font-bold text-amber-600 dark:text-[#c9a96e]">{log.action}</td>
                                <td className="py-md text-zinc-650 dark:text-zinc-400 font-mono">{log.target_table}</td>
                                <td className="py-md font-mono text-zinc-500">{log.target_id}</td>
                                <td className="py-md font-mono text-[10px] text-zinc-400 max-w-[320px] truncate" title={log.new_state || log.previous_state}>
                                  {log.new_state ? `New: ${log.new_state}` : log.previous_state ? `Prev: ${log.previous_state}` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 8: CONSOLE PREFERENCES (SETTINGS) */}
                {activeTab === 'settings' && (
                  <div className="bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl p-lg shadow-sm max-w-xl mx-auto page-transition text-left space-y-md animate-fadeUp">
                    <h3 className="font-serif text-[var(--primary)] text-lg font-semibold border-b border-zinc-100 dark:border-zinc-900 pb-sm">Console Preferences</h3>

                    <div className="space-y-md font-sans text-xs">
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <h4 className="font-bold text-zinc-700 dark:text-zinc-300">Automatic Booking Approval</h4>
                          <p className="text-[11px] text-zinc-400 mt-xs">Approve new bookings instantly without reviewing.</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--primary)] cursor-pointer" />
                      </div>

                      <div className="flex justify-between items-center py-2 border-t border-zinc-100 dark:border-zinc-900">
                        <div>
                          <h4 className="font-bold text-zinc-700 dark:text-zinc-300">Notification Sound Alert</h4>
                          <p className="text-[11px] text-zinc-400 mt-xs">Play sound for new incoming salon bookings.</p>
                        </div>
                        <input type="checkbox" className="w-4 h-4 accent-[var(--primary)] cursor-pointer" />
                      </div>

                      <div className="flex justify-between items-center py-2 border-t border-zinc-100 dark:border-zinc-900">
                        <div>
                          <h4 className="font-bold text-zinc-700 dark:text-zinc-300">TrendTrim Status</h4>
                          <p className="text-[11px] text-zinc-400 mt-xs">Check current database and server status.</p>
                        </div>
                        <span className="font-label-caps text-[9px] font-bold px-sm py-1 bg-green-50 text-green-700 border border-green-200 rounded-full dark:bg-green-950/20">
                          OPERATIONAL
                        </span>
                      </div>

                      <div className="pt-md border-t border-zinc-100 dark:border-zinc-900">
                        <button
                          onClick={() => alert('Preferences successfully updated.')}
                          className="bg-[var(--primary)] text-zinc-950 hover:bg-opacity-95 text-xs font-label-caps tracking-widest px-lg py-2.5 rounded-xl font-bold transition-all w-full text-center cursor-pointer"
                        >
                          Save settings
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </main>
        </div>
      </SidebarInset>

      {/* =======================================================================
          CRUD MODALS & DIALOGS (Tailwind Overlays)
          ======================================================================= */}

      {/* 1. EDIT BOOKING / RESCHEDULE MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl w-full max-w-md p-lg text-left shadow-2xl relative animate-[scaleIn_0.2s_ease-out]">
            <h3 className="font-serif text-[var(--primary)] text-lg font-bold mb-xs">Edit Appointment details</h3>
            <p className="text-xs text-zinc-400 mb-md">Booking ID: {editingBooking.id}</p>

            <form onSubmit={handleEditBookingSubmit} className="space-y-sm text-xs font-sans">
              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">APPOINTMENT DATE</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">APPOINTMENT TIME</label>
                  <select
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">ASSIGNED PRACTITIONER</label>
                <select
                  value={bookingForm.therapist}
                  onChange={(e) => setBookingForm({ ...bookingForm, therapist: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold cursor-pointer"
                >
                  {specialists.map(sp => (
                    <option key={sp.id} value={sp.name}>{sp.name} ({sp.specialization || sp.title})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">FEE RATE CHARGED ($)</label>
                  <input
                    type="number"
                    required
                    value={bookingForm.price}
                    onChange={(e) => setBookingForm({ ...bookingForm, price: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">BOOKING STATUS</label>
                  <select
                    value={bookingForm.status}
                    onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">BOOKING NOTES / REQUISITE</label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  rows="3"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-sm justify-end pt-md">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-lg py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-[var(--primary)] text-zinc-950 rounded-xl font-bold hover:bg-opacity-95 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADD SERVICE MODAL */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl w-full max-w-md p-lg text-left shadow-2xl relative animate-[scaleIn_0.2s_ease-out]">
            <h3 className="font-serif text-[var(--primary)] text-lg font-bold mb-md">Add New Salon Service</h3>
            
            <form onSubmit={handleCreateService} className="space-y-sm text-xs font-sans">
              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">SERVICE NAME</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="Premium Hair Botox Styling"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">CATEGORY</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Color">Color</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Nails">Nails</option>
                    <option value="Grooming">Grooming</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">DURATION (MINUTES)</label>
                  <input
                    type="number"
                    required
                    value={serviceForm.duration_minutes}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">PRICE ($)</label>
                  <input
                    type="number"
                    required
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">DISCOUNT RATE ($)</label>
                  <input
                    type="number"
                    value={serviceForm.discount_price}
                    onChange={(e) => setServiceForm({ ...serviceForm, discount_price: e.target.value })}
                    placeholder="None"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">SERVICE DISPLAY IMAGE</label>
                <div className="flex gap-sm items-center">
                  <input
                    type="text"
                    value={serviceForm.image_url}
                    onChange={(e) => setServiceForm({ ...serviceForm, image_url: e.target.value })}
                    placeholder="/uploads/hairbotox.webp"
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="service-img-file"
                      onChange={(e) => handleImageUpload(e, 'service', (url) => setServiceForm({ ...serviceForm, image_url: url }))}
                      className="hidden"
                    />
                    <label
                      htmlFor="service-img-file"
                      className="px-lg py-2 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer font-bold block text-center"
                    >
                      Choose file
                    </label>
                  </div>
                </div>
                {uploadingImage && (
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 mt-xs overflow-hidden">
                    <div 
                      className="bg-gold h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">Uploading: {uploadProgress}%</p>
                  </div>
                )}
                {serviceForm.image_url && (
                  <div className="mt-sm w-full h-32 rounded-xl overflow-hidden border border-[var(--border)] relative bg-zinc-900">
                    <img src={getImageUrl(serviceForm.image_url)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">DISPLAY ORDER</label>
                  <input
                    type="number"
                    value={serviceForm.display_order}
                    onChange={(e) => setServiceForm({ ...serviceForm, display_order: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">STATUS</label>
                  <select
                    value={serviceForm.status}
                    onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-md py-sm">
                <label className="flex items-center gap-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceForm.is_featured}
                    onChange={(e) => setServiceForm({ ...serviceForm, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-gold"
                  />
                  <span>Mark as Featured Service</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">DESCRIPTION</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  rows="2"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-sm justify-end pt-md">
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(false)}
                  className="px-lg py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-[var(--primary)] text-zinc-950 rounded-xl font-bold hover:bg-opacity-95 cursor-pointer"
                >
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT SERVICE MODAL */}
      {editingService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl w-full max-w-md p-lg text-left shadow-2xl relative animate-[scaleIn_0.2s_ease-out]">
            <h3 className="font-serif text-[var(--primary)] text-lg font-bold mb-md">Modify Service details</h3>
            
            <form onSubmit={handleEditServiceSubmit} className="space-y-sm text-xs font-sans">
              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">SERVICE NAME</label>
                <input
                  type="text"
                  required
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">CATEGORY</label>
                  <select
                    value={editingService.category}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Color">Color</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Nails">Nails</option>
                    <option value="Grooming">Grooming</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">DURATION (MINUTES)</label>
                  <input
                    type="number"
                    required
                    value={editingService.duration_minutes}
                    onChange={(e) => setEditingService({ ...editingService, duration_minutes: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">PRICE ($)</label>
                  <input
                    type="number"
                    required
                    value={editingService.price}
                    onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">DISCOUNT RATE ($)</label>
                  <input
                    type="number"
                    value={editingService.discount_price || ''}
                    onChange={(e) => setEditingService({ ...editingService, discount_price: e.target.value })}
                    placeholder="None"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">SERVICE DISPLAY IMAGE</label>
                <div className="flex gap-sm items-center">
                  <input
                    type="text"
                    value={editingService.image_url || ''}
                    onChange={(e) => setEditingService({ ...editingService, image_url: e.target.value })}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="edit-service-img-file"
                      onChange={(e) => handleImageUpload(e, 'service', (url) => setEditingService({ ...editingService, image_url: url }))}
                      className="hidden"
                    />
                    <label
                      htmlFor="edit-service-img-file"
                      className="px-lg py-2 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer font-bold block text-center"
                    >
                      Choose file
                    </label>
                  </div>
                </div>
                {uploadingImage && (
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 mt-xs overflow-hidden">
                    <div 
                      className="bg-gold h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">Uploading: {uploadProgress}%</p>
                  </div>
                )}
                {editingService.image_url && (
                  <div className="mt-sm w-full h-32 rounded-xl overflow-hidden border border-[var(--border)] relative bg-zinc-900">
                    <img src={getImageUrl(editingService.image_url)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">DISPLAY ORDER</label>
                  <input
                    type="number"
                    value={editingService.display_order}
                    onChange={(e) => setEditingService({ ...editingService, display_order: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">STATUS</label>
                  <select
                    value={editingService.status}
                    onChange={(e) => setEditingService({ ...editingService, status: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-md py-sm">
                <label className="flex items-center gap-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.is_featured === 1 || editingService.is_featured === true}
                    onChange={(e) => setEditingService({ ...editingService, is_featured: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 accent-gold"
                  />
                  <span>Mark as Featured Service</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">DESCRIPTION</label>
                <textarea
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  rows="2"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-sm justify-end pt-md">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-lg py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-[var(--primary)] text-zinc-950 rounded-xl font-bold hover:bg-opacity-95 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD SPECIALIST MODAL */}
      {isAddSpecialistOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl w-full max-w-lg p-lg text-left shadow-2xl relative animate-[scaleIn_0.2s_ease-out] overflow-y-auto max-h-[90vh]">
            <h3 className="font-serif text-[var(--primary)] text-lg font-bold mb-md">Add New Specialist</h3>
            
            <form onSubmit={handleCreateStylist} className="space-y-sm text-xs font-sans">
              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">FULL NAME</label>
                  <input
                    type="text"
                    required
                    value={specialistForm.name}
                    onChange={(e) => setSpecialistForm({ ...specialistForm, name: e.target.value })}
                    placeholder="Jessica Monroe"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    value={specialistForm.email}
                    onChange={(e) => setSpecialistForm({ ...specialistForm, email: e.target.value })}
                    placeholder="jessica@trendtrim.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">PHONE NUMBER</label>
                  <input
                    type="text"
                    value={specialistForm.phone}
                    onChange={(e) => setSpecialistForm({ ...specialistForm, phone: e.target.value })}
                    placeholder="+1-555-0199"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">SPECIALIZATION TITLE</label>
                  <input
                    type="text"
                    value={specialistForm.specialization}
                    onChange={(e) => setSpecialistForm({ ...specialistForm, specialization: e.target.value })}
                    placeholder="Senior Hair Styling"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">EXPERIENCE (YEARS)</label>
                  <input
                    type="number"
                    value={specialistForm.experience_years}
                    onChange={(e) => setSpecialistForm({ ...specialistForm, experience_years: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">EMPLOYMENT STATUS</label>
                  <select
                    value={specialistForm.employment_status}
                    onChange={(e) => setSpecialistForm({ ...specialistForm, employment_status: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ON_LEAVE">ON LEAVE</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">PROFILE PHOTO IMAGE</label>
                <div className="flex gap-sm items-center">
                  <input
                    type="text"
                    value={specialistForm.profile_photo_url}
                    onChange={(e) => setSpecialistForm({ ...specialistForm, profile_photo_url: e.target.value })}
                    placeholder="/uploads/stylist_jessica.webp"
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="specialist-img-file"
                      onChange={(e) => handleImageUpload(e, 'stylist', (url) => setSpecialistForm({ ...specialistForm, profile_photo_url: url }))}
                      className="hidden"
                    />
                    <label
                      htmlFor="specialist-img-file"
                      className="px-lg py-2 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer font-bold block text-center"
                    >
                      Choose file
                    </label>
                  </div>
                </div>
                {uploadingImage && (
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 mt-xs overflow-hidden">
                    <div 
                      className="bg-gold h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">Uploading: {uploadProgress}%</p>
                  </div>
                )}
                {specialistForm.profile_photo_url && (
                  <div className="mt-sm w-full h-32 rounded-xl overflow-hidden border border-[var(--border)] relative bg-zinc-900">
                    <img src={specialistForm.profile_photo_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Service Assignments checklist */}
              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">ASSIGN SERVICES</label>
                <div className="h-32 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl p-sm space-y-1 bg-zinc-50 dark:bg-zinc-900/40">
                  {servicesList.map((svc) => (
                    <label key={svc.id} className="flex items-center gap-xs font-medium cursor-pointer py-0.5">
                      <input
                        type="checkbox"
                        checked={specialistForm.assigned_services.includes(svc.name)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSpecialistForm(prev => {
                            const list = checked
                              ? [...prev.assigned_services, svc.name]
                              : prev.assigned_services.filter(item => item !== svc.name);
                            return { ...prev, assigned_services: list };
                          });
                        }}
                        className="w-3.5 h-3.5 accent-gold"
                      />
                      <span>{svc.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">BIOGRAPHY</label>
                <textarea
                  value={specialistForm.bio}
                  onChange={(e) => setSpecialistForm({ ...specialistForm, bio: e.target.value })}
                  rows="2"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-sm justify-end pt-md">
                <button
                  type="button"
                  onClick={() => setIsAddSpecialistOpen(false)}
                  className="px-lg py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-[var(--primary)] text-zinc-950 rounded-xl font-bold hover:bg-opacity-95 cursor-pointer"
                >
                  Add Practitioner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. EDIT SPECIALIST MODAL */}
      {editingSpecialist && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl w-full max-w-lg p-lg text-left shadow-2xl relative animate-[scaleIn_0.2s_ease-out] overflow-y-auto max-h-[90vh]">
            <h3 className="font-serif text-[var(--primary)] text-lg font-bold mb-md">Modify Stylist details</h3>
            
            <form onSubmit={handleEditStylistSubmit} className="space-y-sm text-xs font-sans">
              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">FULL NAME</label>
                  <input
                    type="text"
                    required
                    value={editingSpecialist.name}
                    onChange={(e) => setEditingSpecialist({ ...editingSpecialist, name: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">PHONE NUMBER</label>
                  <input
                    type="text"
                    value={editingSpecialist.phone || ''}
                    onChange={(e) => setEditingSpecialist({ ...editingSpecialist, phone: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">SPECIALIZATION TITLE</label>
                  <input
                    type="text"
                    value={editingSpecialist.specialization || ''}
                    onChange={(e) => setEditingSpecialist({ ...editingSpecialist, specialization: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">EXPERIENCE (YEARS)</label>
                  <input
                    type="number"
                    value={editingSpecialist.experience_years}
                    onChange={(e) => setEditingSpecialist({ ...editingSpecialist, experience_years: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">EMPLOYMENT STATUS</label>
                <select
                  value={editingSpecialist.employment_status}
                  onChange={(e) => setEditingSpecialist({ ...editingSpecialist, employment_status: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_LEAVE">ON LEAVE</option>
                  <option value="TERMINATED">TERMINATED</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">PROFILE PHOTO IMAGE</label>
                <div className="flex gap-sm items-center">
                  <input
                    type="text"
                    value={editingSpecialist.profile_photo_url || ''}
                    onChange={(e) => setEditingSpecialist({ ...editingSpecialist, profile_photo_url: e.target.value })}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="edit-stylist-img-file"
                      onChange={(e) => handleImageUpload(e, 'stylist', (url) => setEditingSpecialist({ ...editingSpecialist, profile_photo_url: url }))}
                      className="hidden"
                    />
                    <label
                      htmlFor="edit-stylist-img-file"
                      className="px-lg py-2 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer font-bold block text-center"
                    >
                      Choose file
                    </label>
                  </div>
                </div>
                {uploadingImage && (
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 mt-xs overflow-hidden">
                    <div 
                      className="bg-gold h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">Uploading: {uploadProgress}%</p>
                  </div>
                )}
                {editingSpecialist.profile_photo_url && (
                  <div className="mt-sm w-full h-32 rounded-xl overflow-hidden border border-[var(--border)] relative bg-zinc-900">
                    <img src={editingSpecialist.profile_photo_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Service checklist */}
              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">ASSIGN SERVICES</label>
                <div className="h-32 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl p-sm space-y-1 bg-zinc-50 dark:bg-zinc-900/40">
                  {servicesList.map((svc) => (
                    <label key={svc.id} className="flex items-center gap-xs font-medium cursor-pointer py-0.5">
                      <input
                        type="checkbox"
                        checked={editingSpecialist.assigned_services?.includes(svc.name)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditingSpecialist(prev => {
                            const list = checked
                              ? [...(prev.assigned_services || []), svc.name]
                              : (prev.assigned_services || []).filter(item => item !== svc.name);
                            return { ...prev, assigned_services: list };
                          });
                        }}
                        className="w-3.5 h-3.5 accent-gold"
                      />
                      <span>{svc.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">BIOGRAPHY</label>
                <textarea
                  value={editingSpecialist.bio || ''}
                  onChange={(e) => setEditingSpecialist({ ...editingSpecialist, bio: e.target.value })}
                  rows="2"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-sm justify-end pt-md">
                <button
                  type="button"
                  onClick={() => setEditingSpecialist(null)}
                  className="px-lg py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-[var(--primary)] text-zinc-950 rounded-xl font-bold hover:bg-opacity-95 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl w-full max-w-md p-lg text-left shadow-2xl relative animate-[scaleIn_0.2s_ease-out]">
            <h3 className="font-serif text-[var(--primary)] text-lg font-bold mb-md">Edit User Profile Dossier</h3>
            
            <form onSubmit={handleEditUserSubmit} className="space-y-sm text-xs font-sans">
              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">FULL NAME</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">PHONE NUMBER</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">MEMBERSHIP TIER</label>
                  <select
                    value={userForm.tier}
                    onChange={(e) => setUserForm({ ...userForm, tier: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="VIP">VIP</option>
                    <option value="PLATINUM MEMBER">PLATINUM MEMBER</option>
                    <option value="DIAMOND TIER">DIAMOND TIER</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">SYSTEM ROLE</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="USER">USER</option>
                    <option value="STYLIST">STYLIST</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">ACCOUNT STATUS</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">PROFILE IMAGE URL</label>
                <div className="flex gap-sm items-center">
                  <input
                    type="text"
                    value={userForm.profile_photo_url}
                    onChange={(e) => setUserForm({ ...userForm, profile_photo_url: e.target.value })}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="edit-user-img-file"
                      onChange={(e) => handleImageUpload(e, 'user', (url) => setUserForm({ ...userForm, profile_photo_url: url }))}
                      className="hidden"
                    />
                    <label
                      htmlFor="edit-user-img-file"
                      className="px-lg py-2 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer font-bold block text-center"
                    >
                      {uploadingImage ? 'Uploading...' : 'Choose file'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-sm justify-end pt-md">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-lg py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-[var(--primary)] text-zinc-950 rounded-xl font-bold hover:bg-opacity-95 cursor-pointer"
                >
                  Save Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. RESET PASSWORD MODAL */}
      {passwordResetUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-white dark:bg-zinc-950 border border-[var(--border)] rounded-2xl w-full max-w-sm p-lg text-left shadow-2xl relative animate-[scaleIn_0.2s_ease-out]">
            <h3 className="font-serif text-[var(--primary)] text-lg font-bold mb-xs">Reset User Password</h3>
            <p className="text-xs text-zinc-400 mb-md">For account: {passwordResetUser.email}</p>
            
            <form onSubmit={handleResetPassword} className="space-y-sm text-xs font-sans">
              <div className="space-y-1">
                <label className="font-label-caps text-[8px] font-bold text-zinc-400 block">NEW PASSWORD</label>
                <input
                  type="password"
                  required
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-sm justify-end pt-md">
                <button
                  type="button"
                  onClick={() => { setPasswordResetUser(null); setResetPasswordVal(''); }}
                  className="px-lg py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-opacity-90 cursor-pointer"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </SidebarProvider>
  );
}
